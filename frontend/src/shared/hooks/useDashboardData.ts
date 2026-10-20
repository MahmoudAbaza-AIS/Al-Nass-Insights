import { useCallback, useEffect, useRef, useState } from "react";
import { getDashboardDataService } from "@infrastructure/api";
import type {
  DashboardId,
  DashboardPayload,
  LoadState,
} from "@contracts/metrics";

export interface UseDashboardDataOptions {
  dashboardId: DashboardId;
  facilityId?: string;
  period?: string;
  /** Background refresh interval in ms; 0 disables. */
  refreshIntervalMs?: number;
  pauseWhenHidden?: boolean;
  /** When false, skip API calls (e.g. while logged out). */
  enabled?: boolean;
}

export interface UseDashboardDataResult {
  state: LoadState;
  data: DashboardPayload | null;
  error: string | null;
  isRefreshing: boolean;
  isStale: boolean;
  lastSuccessfulAt: string | null;
  refresh: () => void;
}

export function useDashboardData(options: UseDashboardDataOptions): UseDashboardDataResult {
  const {
    dashboardId,
    facilityId,
    period,
    refreshIntervalMs = 60_000,
    pauseWhenHidden = true,
    enabled = true,
  } = options;

  const [state, setState] = useState<LoadState>("idle");
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<string | null>(null);

  const requestSeq = useRef(0);
  const inFlight = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const dataRef = useRef<DashboardPayload | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (!enabled || inFlight.current) {
        return;
      }
      inFlight.current = true;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = ++requestSeq.current;

      if (mode === "initial" && !dataRef.current) {
        setState("loading");
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const payload = await getDashboardDataService().getDashboard({
          dashboardId,
          facilityId,
          period,
          signal: controller.signal,
        });
        if (seq !== requestSeq.current) {
          return;
        }
        const empty =
          Object.keys(payload.metrics).length === 0 &&
          Object.keys(payload.distributions).length === 0;
        setData(payload);
        setLastSuccessfulAt(new Date().toISOString());
        setState(empty ? "empty" : "success");
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        if (seq !== requestSeq.current) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        if (!dataRef.current) {
          setState("error");
        }
      } finally {
        if (seq === requestSeq.current) {
          inFlight.current = false;
          setIsRefreshing(false);
        }
      }
    },
    [dashboardId, facilityId, period, enabled],
  );

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setState("idle");
      setError(null);
      return;
    }
    setData(null);
    setState("loading");
    void load("initial");
    return () => {
      abortRef.current?.abort();
    };
  }, [dashboardId, facilityId, period, load, enabled]);

  useEffect(() => {
    if (!enabled || !refreshIntervalMs || refreshIntervalMs <= 0) {
      return;
    }

    const tick = () => {
      if (pauseWhenHidden && document.visibilityState === "hidden") {
        return;
      }
      void load("refresh");
    };

    const id = window.setInterval(tick, refreshIntervalMs);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void load("refresh");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshIntervalMs, pauseWhenHidden, load, enabled]);

  return {
    state,
    data,
    error,
    isRefreshing,
    isStale: Boolean(data?.freshness.isStale),
    lastSuccessfulAt: lastSuccessfulAt ?? data?.freshness.lastSuccessfulRefresh ?? null,
    refresh: () => {
      void load("refresh");
    },
  };
}
