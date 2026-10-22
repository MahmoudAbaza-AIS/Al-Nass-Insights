import { lazy, Suspense, useEffect, useMemo } from "react";
import { DashboardShell } from "./layouts/DashboardShell";
import { useDashboardRoute } from "./router/useDashboardRoute";
import { useDashboardData } from "@shared/hooks/useDashboardData";
import { LoginPage, useAuth } from "@modules/auth";
import { useDisplayPreferences } from "@shared/providers/useDisplayPreferences";
import { WidgetSkeleton } from "@shared/components/WidgetSkeleton";
import { WidgetErrorState } from "@shared/components/WidgetErrorState";
import {
  canAccessDashboard,
  filterRegistryByAccess,
  getModuleById,
} from "@modules/index";
import type { DashboardId, DashboardPayload } from "@contracts/metrics";

function DashboardBody({
  dashboardId,
  data,
}: {
  dashboardId: DashboardId;
  data: DashboardPayload;
}) {
  const module = getModuleById(dashboardId);
  const View = useMemo(() => lazy(module.loadView), [module]);

  return (
    <Suspense
      fallback={
        <div className="grid gap-4 md:grid-cols-3">
          <WidgetSkeleton label="Loading view" />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      }
    >
      <View data={data} />
    </Suspense>
  );
}

/** Composition root — wires modular dashboard modules; no module-to-module imports. */
export function App() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { route, current, navigate, registry } = useDashboardRoute();
  const prefs = useDisplayPreferences();
  const allowedRegistry = useMemo(
    () => filterRegistryByAccess(registry, user?.dashboards),
    [registry, user?.dashboards],
  );
  const hasAccess = canAccessDashboard(route.dashboardId, user?.dashboards);
  const { state, data, error, isRefreshing, isStale, lastSuccessfulAt, refresh } =
    useDashboardData({
      dashboardId: route.dashboardId,
      facilityId: route.facilityId,
      period: route.period,
      refreshIntervalMs: prefs.refreshIntervalMs,
      enabled: Boolean(user) && hasAccess,
    });

  useEffect(() => {
    if (!user || allowedRegistry.length === 0) return;
    if (!hasAccess) {
      navigate(allowedRegistry[0].id, { replace: true });
    }
  }, [user, hasAccess, allowedRegistry, navigate]);

  if (authLoading) {
    return (
      <div
        className="dash-app-bg flex min-h-screen items-center justify-center text-[var(--dash-text-muted)] md:h-dvh md:min-h-0"
        role="status"
        aria-live="polite"
      >
        Checking session…
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (allowedRegistry.length === 0) {
    return (
      <div className="dash-app-bg flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center text-[var(--dash-text)] md:h-dvh md:min-h-0">
        <WidgetErrorState
          title="No dashboard access"
          message="Your account is authenticated but is not assigned to any dashboards. Contact an administrator."
        />
        <button
          type="button"
          className="rounded-md bg-[var(--dash-bg-elevated)] px-4 py-2 text-sm text-[var(--dash-cyan)] ring-1 ring-[var(--dash-cyan)]/40"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <DashboardShell
      title={current.title}
      activeId={route.dashboardId}
      registry={allowedRegistry}
      onNavigate={(id) => navigate(id)}
      lastSuccessfulAt={lastSuccessfulAt}
      isStale={isStale}
      isRefreshing={isRefreshing}
      error={error}
      onRefresh={refresh}
      userDisplayName={user.displayName}
      onLogout={logout}
    >
      {!hasAccess ? (
        <WidgetSkeleton label="Redirecting to an allowed dashboard" />
      ) : null}

      {hasAccess && state === "loading" && !data ? (
        <div className="grid gap-4 md:grid-cols-3">
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      ) : null}

      {hasAccess && state === "error" && !data ? (
        <WidgetErrorState title="Dashboard failed to load" message={error ?? undefined} onRetry={refresh} />
      ) : null}

      {hasAccess && state === "empty" ? (
        <WidgetErrorState title="No dashboard data" message="The service returned an empty payload." />
      ) : null}

      {hasAccess && data ? <DashboardBody dashboardId={route.dashboardId} data={data} /> : null}
    </DashboardShell>
  );
}
