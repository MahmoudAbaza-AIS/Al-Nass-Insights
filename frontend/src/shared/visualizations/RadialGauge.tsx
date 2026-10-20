import { clampPercent } from "../utils/format";

export interface RadialGaugeProps {
  value: number | null;
  label: string;
  size?: number;
  strokeWidth?: number;
  tone?: "cyan" | "danger" | "warning" | "success";
  unit?: string;
  precision?: number;
}

const TONE_STROKE: Record<NonNullable<RadialGaugeProps["tone"]>, string> = {
  cyan: "var(--dash-cyan)",
  danger: "var(--dash-danger)",
  warning: "var(--dash-warning)",
  success: "var(--dash-success)",
};

export function RadialGauge({
  value,
  label,
  size = 120,
  strokeWidth = 10,
  tone = "cyan",
  unit = "%",
  precision = 0,
}: RadialGaugeProps) {
  const pct = clampPercent(value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    pct === null ? circumference : circumference - (pct / 100) * circumference;
  const display =
    pct === null
      ? "—"
      : `${pct.toLocaleString("en-GB", {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        })}${unit === "%" ? "%" : ""}`;

  return (
    <figure className="m-0 flex flex-col items-center gap-2" aria-label={`${label}: ${display}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <title>{`${label}: ${display}`}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--dash-chart-track)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TONE_STROKE[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${TONE_STROKE[tone]})` }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={TONE_STROKE[tone]}
          fontSize={size * 0.22}
          fontWeight={700}
          fontFamily="var(--dash-font)"
        >
          {display}
        </text>
      </svg>
      <figcaption className="text-center text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
        {label}
      </figcaption>
    </figure>
  );
}
