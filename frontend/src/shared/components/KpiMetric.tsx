import type { MetricReading, MetricStatusTone } from "@contracts/metrics";
import { EMPTY_VALUE, formatMetricParts, formatMetricValue } from "../utils/format";
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
  /** Figma tile illustration (image on its own pedestal); takes precedence over `icon`. */
  art?: { src: string; width: number; height: number };
  /** CSS width for `art` (default ≈ 5.2u, the Figma tile icon size). */
  artWidth?: string;
  iconTone?: "cyan" | "danger" | "warning";
  /** `end` mirrors the block (icon right, text right-aligned) as on the Call Center frame. */
  iconPosition?: "start" | "end";
  /** Reference uses label-over-value on KPI rows and value-over-label on hub callouts. */
  order?: "label-first" | "value-first";
  size?: "md" | "lg";
  /** `label` = Figma descriptive unit (e.g. "per 1,000 patients"): regular weight, label colour, always shown. */
  unitTone?: "value" | "label";
  /** Explicit Figma value colour (CSS colour); overrides the tone colour. */
  valueColor?: string;
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
  art,
  artWidth,
  iconTone = "cyan",
  iconPosition = "start",
  order = "label-first",
  size = "md",
  unitTone = "value",
  valueColor,
  onOpenDetail,
  className = "",
}: KpiMetricProps) {
  const resolvedTone = tone ?? reading?.statusTone ?? "info";
  const parts = formatMetricParts(reading?.value ?? null, unit, precision);
  const display = formatMetricValue(reading?.value ?? null, unit, precision);
  const availability = reading?.availability;
  const showUnavailable = !reading || reading.value === null || availability === "unavailable";
  // Only caller-supplied copy is shown on the tile; cache explanations stay in the detail dialog.
  const support = supportingText;
  const end = iconPosition === "end";

  // Figma: KPI label Poppins Regular 36 `Title-kpi`, value Poppins Bold 72 `Kpi`, unit Medium 40.
  const labelEl = (
    <div className="text-[length:var(--dash-fs-label)] font-normal leading-tight text-[var(--dash-label)]">
      {label}
    </div>
  );
  const valueEl = (
    <div
      className={`whitespace-nowrap font-bold leading-[1.15] ${
        size === "lg" ? "text-[length:var(--dash-fs-value-lg)]" : "text-[length:var(--dash-fs-value)]"
      } ${showUnavailable ? "text-[var(--dash-cyan)]" : `${statusToneClass(resolvedTone)} dash-glow-text`}`}
      style={valueColor && !showUnavailable ? { color: valueColor } : undefined}
    >
      <span className={showUnavailable ? "opacity-60" : undefined}>{showUnavailable ? EMPTY_VALUE : parts.number}</span>
      {unitTone === "label" && unit ? (
        <span className="ms-[1em] text-[length:var(--dash-fs-label)] font-normal text-[var(--dash-label)] [text-shadow:none]">
          {unit}
        </span>
      ) : !showUnavailable && parts.unit ? (
        <span className="ms-[0.3em] text-[length:var(--dash-fs-unit)] font-medium">{parts.unit}</span>
      ) : null}
    </div>
  );

  const content = (
    <>
      {art ? (
        <img
          src={art.src}
          alt=""
          aria-hidden
          width={art.width}
          height={art.height}
          decoding="async"
          className="dash-kpi-art w-[max(3.5rem,calc(var(--u,1vw)*5.2))] shrink-0"
          style={artWidth ? { width: artWidth } : undefined}
        />
      ) : icon ? (
        <KpiPedestal icon={icon} tone={iconTone} />
      ) : null}
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
          <div className="text-[length:var(--dash-fs-label)] leading-tight text-[var(--dash-label)]">
            {support}
          </div>
        ) : null}
        {availability && availability !== "available" ? (
          <div className="!whitespace-normal text-[length:var(--dash-fs-xs)] leading-tight text-[var(--dash-text-subtle)]">
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
