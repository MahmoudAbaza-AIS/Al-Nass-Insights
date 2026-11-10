import { formatTimestamp } from "../utils/format";

export interface DataFreshnessIndicatorProps {
  lastSuccessfulAt: string | null;
  isStale: boolean;
  isRefreshing: boolean;
  timeZone: string;
  error?: string | null;
}

export function DataFreshnessIndicator({
  lastSuccessfulAt,
  isStale,
  isRefreshing,
  timeZone,
  error,
}: DataFreshnessIndicatorProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-end gap-x-2 gap-y-0.5 text-[length:var(--dash-fs-xs)] leading-tight text-[var(--dash-text-subtle)]"
      role="status"
      aria-live="polite"
    >
      <span>
        Last updated:{" "}
        <span className="text-[var(--dash-label)]">
          {formatTimestamp(lastSuccessfulAt, timeZone)}
        </span>
      </span>
      {isRefreshing ? <span className="text-[var(--dash-cyan)]">Refreshing…</span> : null}
      {isStale ? (
        <span className="rounded px-1.5 py-0.5 text-[var(--dash-warning)] ring-1 ring-[var(--dash-warning)]/40">
          Stale data
        </span>
      ) : null}
      {error ? (
        <span className="rounded px-1.5 py-0.5 text-[var(--dash-danger)] ring-1 ring-[var(--dash-danger)]/40">
          {lastSuccessfulAt ? "Refresh failed — showing last successful data" : "Refresh failed"}
        </span>
      ) : null}
    </div>
  );
}
