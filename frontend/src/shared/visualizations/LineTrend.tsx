import type { TrendPoint } from "@contracts/metrics";
import { DashboardSection } from "../components/DashboardSection";
import { formatNumber } from "../utils/format";

export interface LineTrendProps {
  points: TrendPoint[];
  label: string;
  unit?: string;
  maxY?: number;
  color?: string;
}

const W = 300;
const H = 140;
const PAD = { top: 10, right: 10, bottom: 24, left: 40 };

export function LineTrend({ points, label, unit = "%", maxY = 80, color = "var(--dash-chart-ontime)" }: LineTrendProps) {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const hasData = points.some((p) => p.value !== null);

  const coords = points.map((p, i) => ({
    ...p,
    x: PAD.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW),
    y: p.value === null ? null : PAD.top + plotH * (1 - Math.min(maxY, Math.max(0, p.value)) / maxY),
  }));
  const path = coords
    .filter((c) => c.y !== null)
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  return (
    <DashboardSection title={label}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-[var(--dash-chart-w)] max-w-full"
        role="img"
        aria-label={`${label}${hasData ? " trend" : ": series not published"}`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + plotH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={t === 0 ? "var(--dash-chart-ontime)" : "var(--dash-chart-grid)"} />
              <text x={PAD.left - 5} y={y} textAnchor="end" dominantBaseline="middle" fill="var(--dash-label)" fontSize={12}>
                {Math.round(maxY * t)}
                {unit}
              </text>
            </g>
          );
        })}
        {hasData ? <path d={path} fill="none" stroke={color} strokeWidth={2} /> : null}
        {coords.map((c) => (c.y === null ? null : <circle key={c.label} cx={c.x} cy={c.y} r={3} fill={color} />))}
        {coords.map((c) => (
          <text key={`l-${c.label}`} x={c.x} y={H - 6} textAnchor="middle" fill="var(--dash-label)" fontSize={12}>
            {c.label}
          </text>
        ))}
        {!hasData ? (
          <text x={PAD.left + plotW / 2} y={PAD.top + plotH / 2} textAnchor="middle" dominantBaseline="middle" fill="var(--dash-text-muted)" fontSize={13}>
            Trend series not published yet
          </text>
        ) : null}
      </svg>
      {hasData ? (
        <table className="sr-only">
          <caption>{label}</caption>
          <thead>
            <tr>
              <th>Period</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <td>{p.label}</td>
                <td>{p.value === null ? "Unavailable" : `${formatNumber(p.value)}${unit}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </DashboardSection>
  );
}
