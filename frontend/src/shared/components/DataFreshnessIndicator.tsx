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
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[length:var(--dash-fs-xs)] text-[var(--dash-label)]"
      role="status"
      aria-live="polite"
    >
      <span>
        Last updated:{" "}
        <span className="text-[var(--dash-text)]">
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
          Refresh failed — showing last successful data
        </span>
      ) : null}
    </div>
  );
}
