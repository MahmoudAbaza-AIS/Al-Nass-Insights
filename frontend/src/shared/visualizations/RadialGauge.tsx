import { clampPercent, EMPTY_VALUE, formatNumber } from "../utils/format";
import { ChartLabel, ChartUnit } from "./ChartLabel";

export interface RadialGaugeProps {
  value: number | null;
  label: string;
  /** CSS length for the rendered diameter (defaults to the medium gauge token). */
  displaySize?: string;
  tone?: "cyan" | "danger" | "warning" | "success" | "teal";
  unit?: string;
  precision?: number;
  /** `arc` = Figma OR gauge: 270° track open at the bottom; `ring` = full circle. */
  variant?: "ring" | "arc";
  /** Figma ventilation gauges put the caption above the dial. */
  captionPosition?: "top" | "bottom";
}

const ARC_SWEEP = 270;
const ARC_START = -135; // degrees clockwise from 12 o'clock

function polar(c: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: c + r * Math.cos(rad), y: c + r * Math.sin(rad) };
}

function arcPath(c: number, r: number, fromDeg: number, toDeg: number) {
  const a = polar(c, r, fromDeg);
  const b = polar(c, r, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
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
  variant = "ring",
  captionPosition = "bottom",
}: RadialGaugeProps) {
  const pct = clampPercent(value);
  const circumference = 2 * Math.PI * ARC_R;
  const display =
    value === null
      ? EMPTY_VALUE
      : formatNumber(value, { minimumFractionDigits: precision, maximumFractionDigits: precision });
  const spoken = value === null ? "unavailable" : `${display}${unit === "%" ? "%" : ` ${unit}`}`;
  const stroke = TONE_STROKE[tone];
  const c = VIEW / 2;

  return (
    <figure className={`m-0 flex items-center gap-[0.6em] ${captionPosition === "top" ? "flex-col-reverse gap-[1.1em]" : "flex-col"}`}>
      <div className="relative shrink-0" style={{ width: displaySize, height: displaySize }}>
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="block size-full" role="img" aria-label={`${label}: ${spoken}`}>
          {variant === "arc" ? (
            <>
              <path d={arcPath(c, ARC_R, ARC_START, ARC_START + ARC_SWEEP)} fill="none" stroke="var(--dash-chart-track)" strokeWidth={4} />
              <circle cx={c} cy={c} r={DISC_R} fill="var(--dash-gauge-disc)" />
              <circle cx={c} cy={c} r={DISC_R + 2.5} fill="none" stroke="rgba(143,186,200,0.18)" strokeWidth={0.8} strokeDasharray="1 2" />
              {pct !== null && pct > 0 ? (
                <path
                  d={arcPath(c, ARC_R, ARC_START, ARC_START + (pct / 100) * ARC_SWEEP)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={ARC_W - 2}
                  strokeLinecap="butt"
                  style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}
                />
              ) : null}
            </>
          ) : null}
          {variant === "ring" ? (
            <>
              <circle cx={c} cy={c} r={OUTER_R} fill="none" stroke="var(--dash-chart-track)" strokeWidth={4} />
              <circle cx={c} cy={c} r={DISC_R} fill="var(--dash-gauge-disc)" />
            </>
          ) : null}
          {variant === "ring" && pct !== null ? (
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
      <figcaption
        className={`text-center text-[length:var(--dash-fs-label)] leading-tight text-[var(--dash-label)] ${
          captionPosition === "top" ? "whitespace-nowrap" : "max-w-[20em]"
        }`}
      >
        {label}
      </figcaption>
    </figure>
  );
}
