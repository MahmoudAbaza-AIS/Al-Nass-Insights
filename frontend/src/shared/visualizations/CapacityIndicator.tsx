import { formatNumber } from "../utils/format";
import type { CapacityReading } from "@contracts/metrics";

export interface CapacityIndicatorProps {
  capacity: CapacityReading | undefined;
}

/** Inpatient Bed Capacity: glass thermometer filled by occupied share, used/available counts beside it. */
export function CapacityIndicator({ capacity }: CapacityIndicatorProps) {
  if (!capacity || capacity.used === null || capacity.available === null) {
    return (
      <div className="text-[length:var(--dash-fs-label)] text-[var(--dash-text-muted)]" role="status">
        Bed capacity unavailable
      </div>
    );
  }

  const total = capacity.used + capacity.available;
  const usedPct = total > 0 ? (capacity.used / total) * 100 : 0;
  const summary = `${formatNumber(capacity.used)} used, ${formatNumber(capacity.available)} available`;

  return (
    <div className="flex items-center gap-[var(--dash-gap)]" role="group" aria-label={`Bed capacity: ${summary}`}>
      <div className="relative h-[calc(var(--dash-gauge-md)*0.95)] w-[calc(var(--dash-gauge-md)*0.2)] shrink-0 rounded-full border border-white/25 bg-white/10 p-[3px] shadow-[inset_0_0_8px_rgba(255,255,255,0.12)]">
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <div
            className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-[#ff4f5e] to-[#ff7b86]"
            style={{ height: `${usedPct}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-[0.5em] text-[length:var(--dash-fs-label)] leading-tight">
        <div>
          <span className="font-semibold text-[var(--dash-danger)]">{formatNumber(capacity.used)}</span>{" "}
          <span className="text-[var(--dash-label)]">Used</span>
        </div>
        <div>
          <span className="font-semibold text-[var(--dash-text-muted)]">{formatNumber(capacity.available)}</span>{" "}
          <span className="text-[var(--dash-label)]">Available</span>
        </div>
      </div>
    </div>
  );
}
