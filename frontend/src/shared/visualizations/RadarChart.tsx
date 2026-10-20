import type { TrendPoint } from "@contracts/metrics";
import { formatNumber } from "../utils/format";

export interface RadarChartProps {
  points: TrendPoint[];
  label: string;
  averageLabel?: string;
  maxValue?: number;
}

export function RadarChart({
  points,
  label,
  averageLabel,
  maxValue = 30,
}: RadarChartProps) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 62;
  const n = points.length || 1;

  const angleAt = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;

  const ringPoints = (r: number) =>
    points
      .map((_, i) => {
        const a = angleAt(i);
        return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      })
      .join(" ");

  const dataPoints = points
    .map((p, i) => {
      const a = angleAt(i);
      const v = p.value === null ? 0 : Math.min(maxValue, Math.max(0, p.value));
      const r = (v / maxValue) * radius;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    })
    .join(" ");

  return (
    <figure className="m-0 flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}. ${averageLabel ?? ""}`}
      >
        <title>{label}</title>
        <polygon
          points={ringPoints(radius)}
          fill="none"
          stroke="var(--dash-chart-grid)"
        />
        <polygon
          points={ringPoints(radius * 0.55)}
          fill="none"
          stroke="var(--dash-chart-grid)"
        />
        {points.map((p, i) => {
          const a = angleAt(i);
          const lx = cx + Math.cos(a) * (radius + 16);
          const ly = cy + Math.sin(a) * (radius + 16);
          return (
            <g key={p.label}>
              <line
                x1={cx}
                y1={cy}
                x2={cx + Math.cos(a) * radius}
                y2={cy + Math.sin(a) * radius}
                stroke="var(--dash-chart-grid)"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--dash-label)"
                fontSize={9}
              >
                {p.label}
              </text>
            </g>
          );
        })}
        <polygon
          points={dataPoints}
          fill="rgba(61, 231, 255, 0.18)"
          stroke="var(--dash-cyan)"
          strokeWidth={2}
        />
      </svg>
      {averageLabel ? (
        <figcaption className="mt-1 text-[length:var(--dash-fs-sm)] font-semibold text-[var(--dash-amber)]">
          {averageLabel}
        </figcaption>
      ) : null}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Minutes</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}>
              <td>{p.label}</td>
              <td>{p.value === null ? "Unavailable" : formatNumber(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
