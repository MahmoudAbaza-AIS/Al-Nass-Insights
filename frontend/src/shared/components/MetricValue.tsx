import type { MetricReading, MetricStatusTone } from "@contracts/metrics";
import { formatMetricValue } from "../utils/format";
import { availabilityLabel, statusToneClass } from "../utils/status";

export interface MetricValueProps {
  label: string;
  reading?: MetricReading;
  unit?: string;
  precision?: number;
  tone?: MetricStatusTone;
  supportingText?: string;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  onOpenDetail?: () => void;
}

const SIZE: Record<NonNullable<MetricValueProps["size"]>, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
};

export function MetricValue({
  label,
  reading,
  unit = "",
  precision = 0,
  tone,
  supportingText,
  size = "md",
  icon,
  onOpenDetail,
}: MetricValueProps) {
  const resolvedTone = tone ?? reading?.statusTone ?? "info";
  const valueClass = statusToneClass(resolvedTone);
  const display = formatMetricValue(reading?.value ?? null, unit, precision);
  const statusText = reading?.statusLabel;
  const availability = reading?.availability;
  const showUnavailable =
    !reading || reading.value === null || availability === "unavailable";

  const body = (
    <>
      <div className="text-[length:var(--dash-fs-sm)] font-medium text-[var(--dash-label)]">
        {label}
      </div>
      <div className={`mt-1 font-bold leading-none ${SIZE[size]} ${valueClass}`}>
        {showUnavailable ? "—" : display}
      </div>
      {supportingText || reading?.supportingText ? (
        <div className="mt-1 text-[length:var(--dash-fs-xs)] text-[var(--dash-text-muted)]">
          {supportingText ?? reading?.supportingText}
        </div>
      ) : null}
      {statusText ? (
        <div className="mt-1 text-[length:var(--dash-fs-xs)] text-[var(--dash-text-muted)]">
          Status: {statusText}
        </div>
      ) : null}
      {availability && availability !== "available" ? (
        <div className="mt-1 text-[length:var(--dash-fs-xs)] text-[var(--dash-warning)]">
          {availabilityLabel(availability)}
        </div>
      ) : null}
    </>
  );

  if (onOpenDetail) {
    return (
      <button
        type="button"
        onClick={onOpenDetail}
        className="flex items-start gap-3 rounded-md bg-transparent p-1 text-left transition hover:bg-white/5 focus-visible:outline-none"
        aria-label={`${label}: ${showUnavailable ? "unavailable" : display}. Open details`}
      >
        {icon}
        <div>{body}</div>
      </button>
    );
  }

  return (
    <div className="flex items-start gap-3" aria-label={`${label}: ${showUnavailable ? "unavailable" : display}`}>
      {icon}
      <div>{body}</div>
    </div>
  );
}
