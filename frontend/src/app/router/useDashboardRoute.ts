import { useCallback, useEffect, useMemo, useState } from "react";
import type { DashboardId } from "@contracts/metrics";
import { DASHBOARD_REGISTRY, getDashboardByPath } from "@modules/index";

export interface DashboardRouteState {
  dashboardId: DashboardId;
  title: string;
  period?: string;
  facilityId?: string;
}

function readRoute(): DashboardRouteState {
  const item = getDashboardByPath(window.location.pathname);
  const params = new URLSearchParams(window.location.search);
  return {
    dashboardId: item.id,
    title: item.title,
    period: params.get("period") ?? undefined,
    facilityId: params.get("facility") ?? undefined,
  };
}

export function useDashboardRoute() {
  const [route, setRoute] = useState<DashboardRouteState>(() => readRoute());

  useEffect(() => {
    const onPop = () => setRoute(readRoute());
    window.addEventListener("popstate", onPop);
    if (window.location.pathname === "/" || window.location.pathname === "") {
      const target = DASHBOARD_REGISTRY[0].path + window.location.search;
      window.history.replaceState(null, "", target);
      setRoute(readRoute());
    }
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback(
    (dashboardId: DashboardId, options?: { replace?: boolean; period?: string; facilityId?: string }) => {
      const item = DASHBOARD_REGISTRY.find((d) => d.id === dashboardId) ?? DASHBOARD_REGISTRY[0];
      const params = new URLSearchParams(window.location.search);
      if (options?.period !== undefined) {
        if (options.period) params.set("period", options.period);
        else params.delete("period");
      }
      if (options?.facilityId !== undefined) {
        if (options.facilityId) params.set("facility", options.facilityId);
        else params.delete("facility");
      }
      const qs = params.toString();
      const url = `${item.path}${qs ? `?${qs}` : ""}`;
      if (options?.replace) {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
      }
      setRoute(readRoute());
    },
    [],
  );

  const current = useMemo(
    () => DASHBOARD_REGISTRY.find((d) => d.id === route.dashboardId) ?? DASHBOARD_REGISTRY[0],
    [route.dashboardId],
  );

  return { route, current, navigate, registry: DASHBOARD_REGISTRY };
}
