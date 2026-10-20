import type { TrendPoint } from "@contracts/metrics";

export interface SparklineProps {
  points: TrendPoint[];
  color?: string;
  width?: number;
  height?: number;
  label: string;
}

export function Sparkline({
  points,
  color = "var(--dash-cyan)",
  width = 72,
  height = 28,
  label,
}: SparklineProps) {
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  if (values.length < 2) {
    return <span className="sr-only">{label}: trend unavailable</span>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const coords = points
    .map((p, i) => {
      if (p.value === null) return null;
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p.value - min) / span) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${label} trend`}
    >
      <polyline fill="none" stroke={color} strokeWidth={2} points={coords} />
    </svg>
  );
}
