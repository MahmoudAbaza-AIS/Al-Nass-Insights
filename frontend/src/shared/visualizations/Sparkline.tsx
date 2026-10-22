import type { TrendPoint } from "@contracts/metrics";

export interface SparklineProps {
  points: TrendPoint[];
  color?: string;
  label: string;
}

const W = 120;
const H = 36;

export function Sparkline({ points, color = "var(--dash-cyan)", label }: SparklineProps) {
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  const style = { width: "calc(var(--dash-chart-h) * 1.1)", height: "calc(var(--dash-chart-h) * 0.33)" };

  if (values.length < 2) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={style} role="img" aria-label={`${label}: trend not published`}>
        <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke={color} strokeOpacity={0.35} strokeDasharray="3 4" />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const coords = points
    .map((p, i) => {
      if (p.value === null) return null;
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p.value - min) / span) * (H - 4) - 2;
      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={style} role="img" aria-label={`${label} trend`}>
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={coords} />
    </svg>
  );
}
