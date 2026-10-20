import type { TrendPoint } from "@contracts/metrics";
import { formatNumber } from "../utils/format";

export interface LineTrendProps {
  points: TrendPoint[];
  label: string;
  unit?: string;
  maxY?: number;
  color?: string;
}

export function LineTrend({
  points,
  label,
  unit = "%",
  maxY = 80,
  color = "var(--dash-cyan)",
}: LineTrendProps) {
  const width = 300;
  const height = 150;
  const pad = { top: 12, right: 12, bottom: 28, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const usable = points.filter((p) => p.value !== null);

  const coords = points.map((p, i) => {
    const x = pad.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
    const y =
      p.value === null
        ? null
        : pad.top + plotH * (1 - Math.min(maxY, Math.max(0, p.value)) / maxY);
    return { ...p, x, y };
  });

  const path = coords
    .filter((c) => c.y !== null)
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  return (
    <div>
      <h3 className="mb-2 text-[length:var(--dash-fs-sm)] font-medium text-[var(--dash-text)]">
        {label}
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full max-w-md"
        role="img"
        aria-label={`${label} trend`}
      >
        <title>{label}</title>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.top + plotH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke="var(--dash-chart-grid)"
              />
              <text
                x={pad.left - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--dash-text-subtle)"
                fontSize={9}
              >
                {Math.round(maxY * t)}
                {unit}
              </text>
            </g>
          );
        })}
        {usable.length > 0 ? (
          <path d={path} fill="none" stroke={color} strokeWidth={2.5} />
        ) : null}
        {coords.map((c) =>
          c.y === null ? null : (
            <circle key={c.label} cx={c.x} cy={c.y} r={3.5} fill={color} />
          ),
        )}
        {coords.map((c) => (
          <text
            key={`l-${c.label}`}
            x={c.x}
            y={height - 8}
            textAnchor="middle"
            fill="var(--dash-label)"
            fontSize={9}
          >
            {c.label}
          </text>
        ))}
      </svg>
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
              <td>
                {p.value === null ? "Unavailable" : `${formatNumber(p.value)}${unit}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
