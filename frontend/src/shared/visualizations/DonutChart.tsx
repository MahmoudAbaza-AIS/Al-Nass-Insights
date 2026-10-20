import type { DistributionSegment } from "@contracts/metrics";
import { formatPercent } from "../utils/format";

const DEFAULT_COLORS = [
  "var(--dash-chart-inbound)",
  "var(--dash-chart-outbound)",
  "var(--dash-chart-cancel)",
  "var(--dash-warning)",
];

export interface DonutChartProps {
  segments: DistributionSegment[];
  label: string;
  size?: number;
  strokeWidth?: number;
  colors?: string[];
  showLegend?: boolean;
}

export function DonutChart({
  segments,
  label,
  size = 140,
  strokeWidth = 16,
  colors = DEFAULT_COLORS,
  showLegend = true,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;

  const arcs = segments.map((seg, index) => {
    const share = seg.share ?? 0;
    const length = (share / 100) * circumference;
    const dashoffset = -cursor;
    cursor += length;
    return {
      ...seg,
      length,
      dashoffset,
      color: colors[index % colors.length],
    };
  });

  const summary = segments
    .map((s) => `${s.label} ${formatPercent(s.share)}`)
    .join(", ");

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}. ${summary}`}
      >
        <title>{`${label}. ${summary}`}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--dash-chart-track)"
          strokeWidth={strokeWidth}
        />
        {arcs.map((arc) => (
          <circle
            key={arc.id}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.length} ${circumference - arc.length}`}
            strokeDashoffset={arc.dashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
      {showLegend ? (
        <ul className="m-0 list-none space-y-2 p-0 text-[length:var(--dash-fs-sm)]">
          {arcs.map((arc) => (
            <li key={arc.id} className="flex items-center gap-2 text-[var(--dash-label)]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: arc.color }}
                aria-hidden
              />
              <span>
                {arc.label}{" "}
                <span className="font-semibold text-[var(--dash-cyan)]">
                  {formatPercent(arc.share)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
