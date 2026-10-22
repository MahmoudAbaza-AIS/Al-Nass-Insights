import type { MetricReading, MetricStatusTone } from "@contracts/metrics";
import { formatMetricParts, formatMetricValue } from "../utils/format";
import { availabilityLabel, statusToneClass } from "../utils/status";

export interface KpiMetricProps {
  label: string;
  reading?: MetricReading;
  unit?: string;
  precision?: number;
  tone?: MetricStatusTone;
  supportingText?: string;
  /** PrimeIcons class (e.g. `pi-clock`) shown on the reference's elliptical pedestal. */
  icon?: string;
  iconTone?: "cyan" | "danger" | "warning";
  /** `end` mirrors the block (icon right, text right-aligned) as on the Call Center frame. */
  iconPosition?: "start" | "end";
  /** Reference uses label-over-value on KPI rows and value-over-label on hub callouts. */
  order?: "label-first" | "value-first";
  size?: "md" | "lg";
  onOpenDetail?: () => void;
  className?: string;
}

const ICON_TONE: Record<NonNullable<KpiMetricProps["iconTone"]>, string> = {
  cyan: "text-[var(--dash-cyan)]",
  danger: "text-[var(--dash-danger)]",
  warning: "text-[var(--dash-warning)]",
};

export function KpiPedestal({
  icon,
  tone = "cyan",
}: {
  icon: string;
  tone?: NonNullable<KpiMetricProps["iconTone"]>;
}) {
  return (
    <span className={`dash-pedestal ${ICON_TONE[tone]}`} aria-hidden>
      <i className={`pi ${icon}`} />
    </span>
  );
}

/** Figma KPI callout: icon on a pedestal beside a label/value stack, floating on the canvas. */
export function KpiMetric({
  label,
  reading,
  unit = "",
  precision = 0,
  tone,
  supportingText,
  icon,
  iconTone = "cyan",
  iconPosition = "start",
  order = "label-first",
  size = "md",
  onOpenDetail,
  className = "",
}: KpiMetricProps) {
  const resolvedTone = tone ?? reading?.statusTone ?? "info";
  const parts = formatMetricParts(reading?.value ?? null, unit, precision);
  const display = formatMetricValue(reading?.value ?? null, unit, precision);
  const availability = reading?.availability;
  const showUnavailable = !reading || reading.value === null || availability === "unavailable";
  const support = supportingText ?? reading?.supportingText;
  const end = iconPosition === "end";

  const labelEl = (
    <div className="text-[length:var(--dash-fs-label)] font-medium leading-tight text-[var(--dash-label)]">
      {label}
    </div>
  );
  const valueEl = (
    <div
      className={`whitespace-nowrap font-semibold leading-[1.15] ${
        size === "lg" ? "text-[length:var(--dash-fs-value-lg)]" : "text-[length:var(--dash-fs-value)]"
      } ${showUnavailable ? "text-[var(--dash-warning)]" : `${statusToneClass(resolvedTone)} dash-glow-text`}`}
    >
      {showUnavailable ? (
        "—"
      ) : (
        <>
          {parts.number}
          {parts.unit ? (
            <span className="ms-[0.3em] text-[length:var(--dash-fs-unit)] font-medium">{parts.unit}</span>
          ) : null}
        </>
      )}
    </div>
  );

  const content = (
    <>
      {icon ? <KpiPedestal icon={icon} tone={iconTone} /> : null}
      <div className={`flex min-w-0 flex-col gap-[0.2em] ${end ? "items-end text-right" : "text-left"}`}>
        {order === "label-first" ? (
          <>
            {labelEl}
            {valueEl}
          </>
        ) : (
          <>
            {valueEl}
            {labelEl}
          </>
        )}
        {support ? (
          <div className="text-[length:var(--dash-fs-xs)] leading-tight text-[var(--dash-text-muted)]">
            {support}
          </div>
        ) : null}
        {availability && availability !== "available" ? (
          <div className="text-[length:var(--dash-fs-xs)] leading-tight text-[var(--dash-warning)]">
            {availabilityLabel(availability)}
          </div>
        ) : null}
      </div>
    </>
  );

  const layout = `flex min-w-0 items-center gap-[var(--dash-gap)] ${end ? "flex-row-reverse" : ""} ${className}`;
  const spoken = `${label}: ${showUnavailable ? "unavailable" : display}`;

  if (onOpenDetail) {
    return (
      <button
        type="button"
        onClick={onOpenDetail}
        className={`${layout} rounded-md bg-transparent p-1 text-left transition hover:bg-white/[0.04]`}
        aria-label={`${spoken}. Open details`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={layout} role="group" aria-label={spoken}>
      {content}
    </div>
  );
}
