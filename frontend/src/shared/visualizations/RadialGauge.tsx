import { clampPercent, formatNumber } from "../utils/format";
import { ChartLabel, ChartUnit } from "./ChartLabel";

export interface RadialGaugeProps {
  value: number | null;
  label: string;
  /** CSS length for the rendered diameter (defaults to the medium gauge token). */
  displaySize?: string;
  tone?: "cyan" | "danger" | "warning" | "success" | "teal";
  unit?: string;
  precision?: number;
}

const TONE_STROKE: Record<NonNullable<RadialGaugeProps["tone"]>, string> = {
  cyan: "var(--dash-cyan)",
  danger: "var(--dash-danger)",
  warning: "var(--dash-warning)",
  success: "var(--dash-success)",
  teal: "var(--dash-teal)",
};

const VIEW = 120;
const OUTER_R = 56;
const ARC_R = 46;
const ARC_W = 8;
const DISC_R = 38;

/** Reference gauge: thin outer track, progress arc, dark inner disc with the value. */
export function RadialGauge({
  value,
  label,
  displaySize = "var(--dash-gauge-md)",
  tone = "cyan",
  unit = "%",
  precision = 0,
}: RadialGaugeProps) {
  const pct = clampPercent(value);
  const circumference = 2 * Math.PI * ARC_R;
  const display =
    value === null
      ? "—"
      : formatNumber(value, { minimumFractionDigits: precision, maximumFractionDigits: precision });
  const spoken = value === null ? "unavailable" : `${display}${unit === "%" ? "%" : ` ${unit}`}`;
  const stroke = TONE_STROKE[tone];
  const c = VIEW / 2;

  return (
    <figure className="m-0 flex flex-col items-center gap-[0.6em]">
      <div className="relative shrink-0" style={{ width: displaySize, height: displaySize }}>
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="block size-full" role="img" aria-label={`${label}: ${spoken}`}>
          <circle cx={c} cy={c} r={OUTER_R} fill="none" stroke="var(--dash-chart-track)" strokeWidth={4} />
          <circle cx={c} cy={c} r={DISC_R} fill="var(--dash-gauge-disc)" />
          {pct !== null ? (
            <circle
              cx={c}
              cy={c}
              r={ARC_R}
              fill="none"
              stroke={stroke}
              strokeWidth={ARC_W}
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
              transform={`rotate(-90 ${c} ${c})`}
              style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}
            />
          ) : null}
        </svg>
        <ChartLabel
          x={c}
          y={c}
          viewBox={{ w: VIEW, h: VIEW }}
          renderedWidth={displaySize}
          size={24}
          color={value === null ? "var(--dash-text-muted)" : stroke}
          weight={600}
        >
          {display}
          {value !== null && unit ? <ChartUnit>{unit}</ChartUnit> : null}
        </ChartLabel>
      </div>
      <figcaption className="max-w-[14em] text-center text-[length:var(--dash-fs-label)] leading-tight text-[var(--dash-label)]">
        {label}
      </figcaption>
    </figure>
  );
}
