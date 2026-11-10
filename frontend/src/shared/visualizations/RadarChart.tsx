import type { TrendPoint } from "@contracts/metrics";
import { formatNumber } from "../utils/format";
import { ChartLabel } from "./ChartLabel";

export interface RadarChartProps {
  points: TrendPoint[];
  label: string;
  averageLabel?: string;
  maxValue?: number;
  /** Axis labels drawn when the API has not published a series yet. */
  emptyAxes?: readonly string[];
}

const SIZE = 180;
const C = SIZE / 2;
const R = 58;
const VIEW = { w: SIZE, h: SIZE };
const WIDTH = "var(--dash-chart-h)";

export function RadarChart({
  points,
  label,
  averageLabel,
  maxValue = 30,
  emptyAxes = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
}: RadarChartProps) {
  const hasData = points.some((p) => p.value !== null);
  const axes = points.length > 0 ? points.map((p) => p.label) : [...emptyAxes];
  const n = axes.length;
  const angleAt = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const ring = (r: number) =>
    axes.map((_, i) => `${C + Math.cos(angleAt(i)) * r},${C + Math.sin(angleAt(i)) * r}`).join(" ");

  const dataPoints = points
    .map((p, i) => {
      const v = p.value === null ? 0 : Math.min(maxValue, Math.max(0, p.value));
      const r = (v / maxValue) * R;
      return `${C + Math.cos(angleAt(i)) * r},${C + Math.sin(angleAt(i)) * r}`;
    })
    .join(" ");

  return (
    <figure className="m-0 flex flex-col items-center">
      <div className="relative shrink-0" style={{ width: WIDTH, height: WIDTH }}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="block size-full"
          role="img"
          aria-label={`${label}. ${hasData ? (averageLabel ?? "") : "Series not published"}`}
        >
          {[1, 0.66, 0.33].map((t) => (
            <polygon key={t} points={ring(R * t)} fill="none" stroke="rgba(201,219,225,0.35)" />
          ))}
          {axes.map((axis, i) => {
            const a = angleAt(i);
            return (
              <line
                key={`${axis}-${i}`}
                x1={C}
                y1={C}
                x2={C + Math.cos(a) * R}
                y2={C + Math.sin(a) * R}
                stroke="rgba(201,219,225,0.35)"
              />
            );
          })}
          {hasData ? (
            <polygon points={dataPoints} fill="rgba(61, 231, 255, 0.18)" stroke="var(--dash-cyan)" strokeWidth={2} />
          ) : null}
        </svg>
        {axes.map((axis, i) => {
          const a = angleAt(i);
          return (
            <ChartLabel
              key={`${axis}-${i}`}
              x={C + Math.cos(a) * (R + 16)}
              y={C + Math.sin(a) * (R + 16)}
              viewBox={VIEW}
              renderedWidth={WIDTH}
              size={11}
            >
              {axis}
            </ChartLabel>
          );
        })}
        {!hasData ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded bg-[var(--dash-bg)]/80 px-[0.4em] py-[0.15em] text-[length:var(--dash-fs-xs)] text-[var(--dash-text-muted)]">
              No series yet
            </span>
          </span>
        ) : null}
      </div>
      {averageLabel ? (
        <figcaption className="text-[length:var(--dash-fs-label)] font-medium text-[var(--dash-amber)]">
          {averageLabel}
        </figcaption>
      ) : null}
      {hasData ? (
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
      ) : null}
    </figure>
  );
}
