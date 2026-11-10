import { EMPTY_VALUE, formatNumber } from "../utils/format";
import type { CapacityReading } from "@contracts/metrics";

export interface CapacityIndicatorProps {
  capacity: CapacityReading | undefined;
  /** Optional title rendered beside the thermometer (Figma Inpatient "Bed Capacity"). */
  title?: string;
}

/**
 * Inpatient Bed Capacity: glass thermometer filled by occupied share, used/available counts beside it.
 * Without a published census the thermometer stays empty and both counts show "-".
 */
export function CapacityIndicator({ capacity, title }: CapacityIndicatorProps) {
  const published = capacity && capacity.used !== null && capacity.available !== null ? capacity : null;
  const used = published?.used ?? null;
  const available = published?.available ?? null;
  const total = used !== null && available !== null ? used + available : 0;
  const usedPct = total > 0 && used !== null ? (used / total) * 100 : 0;
  const summary = published ? `${formatNumber(used)} used, ${formatNumber(available)} available` : "unavailable";

  return (
    <div className="flex items-start gap-[calc(var(--dash-gap)*1.3)]" role="group" aria-label={`Bed capacity: ${summary}`}>
      <div className="relative h-[calc(var(--dash-gauge-md)*1.05)] w-[calc(var(--dash-gauge-md)*0.26)] shrink-0 rounded-full border border-white/25 bg-white/10 p-[3px] shadow-[inset_0_0_8px_rgba(255,255,255,0.12)]">
        <div className="relative h-full w-full overflow-hidden rounded-full">
          {published ? (
            <div
              className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-[#ff4f5e] to-[#ff7b86]"
              style={{ height: `${usedPct}%` }}
            />
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-[0.5em] leading-tight">
        {title ? (
          <header className="mb-[0.5em] w-max">
            <h2 className="m-0 whitespace-nowrap text-[length:var(--dash-fs-section)] font-medium text-[var(--dash-section-title)]">{title}</h2>
            <div className="dash-section-rule" aria-hidden />
          </header>
        ) : null}
        <div className="text-[length:var(--dash-fs-label)]">
          <span className="text-[length:var(--dash-fs-unit)] font-bold text-[var(--dash-danger)]">
            {used === null ? <span className="opacity-60">{EMPTY_VALUE}</span> : formatNumber(used)}
          </span>{" "}
          <span className="text-[var(--dash-danger)]">Used</span>
        </div>
        <div className="text-[length:var(--dash-fs-label)]">
          <span className="text-[length:var(--dash-fs-unit)] font-bold text-[var(--dash-label)]">
            {available === null ? <span className="opacity-60">{EMPTY_VALUE}</span> : formatNumber(available)}
          </span>{" "}
          <span className="text-[var(--dash-label)]">Available</span>
        </div>
      </div>
    </div>
  );
}
