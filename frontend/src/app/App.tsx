import { lazy, Suspense, useMemo } from "react";
import { DashboardShell } from "./layouts/DashboardShell";
import { useDashboardRoute } from "./navigation/useDashboardRoute";
import { useDashboardData } from "@shared/hooks/useDashboardData";
import { useDisplayPreferences } from "@shared/providers/DisplayPreferencesProvider";
import { WidgetSkeleton } from "@shared/components/WidgetSkeleton";
import { WidgetErrorState } from "@shared/components/WidgetErrorState";
import { getModuleById } from "@modules/index";
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
  const { route, current, navigate, registry } = useDashboardRoute();
  const prefs = useDisplayPreferences();
  const { state, data, error, isRefreshing, isStale, lastSuccessfulAt, refresh } =
    useDashboardData({
      dashboardId: route.dashboardId,
      facilityId: route.facilityId,
      period: route.period,
      refreshIntervalMs: prefs.refreshIntervalMs,
    });

  return (
    <DashboardShell
      title={current.title}
      activeId={route.dashboardId}
      registry={registry}
      onNavigate={(id) => navigate(id)}
      lastSuccessfulAt={lastSuccessfulAt}
      isStale={isStale}
      isRefreshing={isRefreshing}
      error={error}
      onRefresh={refresh}
    >
      {state === "loading" && !data ? (
        <div className="grid gap-4 md:grid-cols-3">
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      ) : null}

      {state === "error" && !data ? (
        <WidgetErrorState title="Dashboard failed to load" message={error ?? undefined} onRetry={refresh} />
      ) : null}

      {state === "empty" ? (
        <WidgetErrorState title="No dashboard data" message="The service returned an empty payload." />
      ) : null}

      {data ? <DashboardBody dashboardId={route.dashboardId} data={data} /> : null}
    </DashboardShell>
  );
}
