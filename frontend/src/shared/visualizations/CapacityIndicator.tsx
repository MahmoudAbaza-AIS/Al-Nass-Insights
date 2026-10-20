import { formatNumber } from "../utils/format";
import type { CapacityReading } from "@contracts/metrics";

export interface CapacityIndicatorProps {
  capacity: CapacityReading | undefined;
  orientation?: "vertical" | "horizontal";
}

export function CapacityIndicator({
  capacity,
  orientation = "vertical",
}: CapacityIndicatorProps) {
  if (!capacity || capacity.used === null || capacity.available === null) {
    return (
      <div className="text-[length:var(--dash-fs-sm)] text-[var(--dash-muted)]" role="status">
        Bed capacity unavailable
      </div>
    );
  }

  const total = capacity.used + capacity.available;
  const usedPct = total > 0 ? (capacity.used / total) * 100 : 0;
  const summary = `${formatNumber(capacity.used)} used, ${formatNumber(capacity.available)} available`;

  if (orientation === "horizontal") {
    return (
      <div className="w-full max-w-xs" aria-label={`Bed capacity: ${summary}`}>
        <div className="mb-2 flex justify-between text-[length:var(--dash-fs-sm)]">
          <span className="text-[var(--dash-danger)] font-semibold">
            {formatNumber(capacity.used)} Used
          </span>
          <span className="text-[var(--dash-label)]">
            {formatNumber(capacity.available)} Available
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--dash-chart-track)]">
          <div
            className="h-full rounded-full bg-[var(--dash-danger)]"
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3" aria-label={`Bed capacity: ${summary}`}>
      <div className="relative h-40 w-7 overflow-hidden rounded-full bg-[var(--dash-chart-track)]">
        <div
          className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-[var(--dash-danger)] to-[#ff8a95]"
          style={{ height: `${usedPct}%` }}
        />
      </div>
      <div className="flex flex-col gap-2 text-[length:var(--dash-fs-sm)]">
        <div>
          <div className="text-lg font-bold text-[var(--dash-danger)]">
            {formatNumber(capacity.used)}
          </div>
          <div className="text-[var(--dash-label)]">Used</div>
        </div>
        <div>
          <div className="text-lg font-bold text-[var(--dash-label)]">
            {formatNumber(capacity.available)}
          </div>
          <div className="text-[var(--dash-label)]">Available</div>
        </div>
      </div>
    </div>
  );
}
