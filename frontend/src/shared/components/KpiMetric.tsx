import type { ReactNode } from "react";
import type { MetricReading, MetricStatusTone } from "@contracts/metrics";
import { formatMetricValue } from "../utils/format";
import { availabilityLabel, statusToneClass } from "../utils/status";

export interface KpiMetricProps {
  label: string;
  reading?: MetricReading;
  unit?: string;
  precision?: number;
  tone?: MetricStatusTone;
  supportingText?: string;
  /** Figma hub layouts: icon sits left of label+value stack */
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
  onOpenDetail?: () => void;
  className?: string;
}

const VALUE_SIZE: Record<NonNullable<KpiMetricProps["size"]>, string> = {
  sm: "text-2xl",
  md: "text-[clamp(1.75rem,2.4vw,2.75rem)]",
  lg: "text-[clamp(2rem,3vw,3.25rem)]",
};

/**
 * Figma-aligned KPI block: icon + label, large value, optional supporting line.
 * No card chrome — metrics float on the dashboard canvas like the reference frames.
 */
export function KpiMetric({
  label,
  reading,
  unit = "",
  precision = 0,
  tone,
  supportingText,
  icon,
  size = "md",
  align = "start",
  onOpenDetail,
  className = "",
}: KpiMetricProps) {
  const resolvedTone = tone ?? reading?.statusTone ?? "info";
  const valueClass = statusToneClass(resolvedTone);
  const display = formatMetricValue(reading?.value ?? null, unit, precision);
  const availability = reading?.availability;
  const showUnavailable =
    !reading || reading.value === null || availability === "unavailable";
  const support = supportingText ?? reading?.supportingText;

  const content = (
    <>
      {icon ? <div className="shrink-0">{icon}</div> : null}
      <div className={align === "center" ? "text-center" : "text-left"}>
        <div className="text-[length:var(--dash-fs-sm)] font-medium leading-snug text-[var(--dash-label)] md:text-[length:var(--dash-fs-md)]">
          {label}
        </div>
        <div
          className={`mt-1 font-bold leading-none tracking-tight ${VALUE_SIZE[size]} ${
            showUnavailable ? "text-[var(--dash-warning)]" : valueClass
          }`}
          style={
            showUnavailable
              ? undefined
              : { textShadow: "0 0 18px rgba(84, 233, 255, 0.35)" }
          }
        >
          {showUnavailable ? "—" : display}
        </div>
        {support ? (
          <div className="mt-1.5 text-[length:var(--dash-fs-xs)] text-[var(--dash-text-muted)]">
            {support}
          </div>
        ) : null}
        {availability && availability !== "available" ? (
          <div className="mt-1 text-[length:var(--dash-fs-xs)] text-[var(--dash-warning)]">
            {availabilityLabel(availability)}
          </div>
        ) : null}
      </div>
    </>
  );

  const layout =
    align === "center"
      ? `flex flex-col items-center gap-2 ${className}`
      : `flex items-start gap-3 ${className}`;

  if (onOpenDetail) {
    return (
      <button
        type="button"
        onClick={onOpenDetail}
        className={`${layout} rounded-md bg-transparent p-1 text-left transition hover:bg-white/[0.04] focus-visible:outline-none`}
        aria-label={`${label}: ${showUnavailable ? "unavailable" : display}. Open details`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={layout}
      aria-label={`${label}: ${showUnavailable ? "unavailable" : display}`}
    >
      {content}
    </div>
  );
}

export function KpiIconShell({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: "cyan" | "danger" | "warning";
}) {
  const toneClass =
    tone === "danger"
      ? "bg-[rgba(255,90,106,0.12)] text-[var(--dash-danger)] shadow-[0_0_16px_rgba(255,90,106,0.25)]"
      : tone === "warning"
        ? "bg-[rgba(240,180,41,0.12)] text-[var(--dash-warning)]"
        : "bg-[rgba(0,229,255,0.1)] text-[var(--dash-cyan)] shadow-[0_0_16px_rgba(0,229,255,0.28)]";

  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${toneClass} md:size-[clamp(2.5rem,5.5vh,3.5rem)]`}
      aria-hidden
    >
      {children}
    </span>
  );
}
