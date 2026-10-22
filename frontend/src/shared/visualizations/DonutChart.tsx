import type { DistributionSegment } from "@contracts/metrics";
import { StatusLegend } from "../components/StatusLegend";
import { formatNumber, formatPercent, shareToPercent } from "../utils/format";
import { ChartLabel, ChartUnit } from "./ChartLabel";

const DEFAULT_COLORS = [
  "var(--dash-chart-ontime)",
  "var(--dash-chart-noshow)",
  "var(--dash-chart-cancel)",
  "var(--dash-warning)",
];

export interface DonutChartProps {
  segments: DistributionSegment[];
  label: string;
  /** CSS length for the ring diameter. */
  displaySize?: string;
  colors?: string[];
  legend?: "right" | "none";
}

const C = 80;
const R = 52;
const STROKE = 13;
const LABEL_R = R + 26;
const VIEW = { x: -34, y: -14, w: 228, h: 188 };

/** Reference donut: thick segmented ring starting at 6 o'clock, percentages placed beside each arc. */
export function DonutChart({
  segments,
  label,
  displaySize = "var(--dash-gauge-lg)",
  colors = DEFAULT_COLORS,
  legend = "right",
}: DonutChartProps) {
  const circumference = 2 * Math.PI * R;
  const renderedWidth = `calc(${displaySize} * 1.425)`;
  let cursor = 0;

  const arcs = segments.map((seg, index) => {
    const pct = shareToPercent(seg.share) ?? 0;
    const start = cursor;
    cursor += pct;
    const mid = ((start + pct / 2) / 100) * Math.PI * 2 + Math.PI / 2;
    return {
      ...seg,
      pct,
      start,
      color: colors[index % colors.length],
      lx: C + Math.cos(mid) * LABEL_R,
      ly: C + Math.sin(mid) * LABEL_R,
    };
  });

  const hasData = arcs.some((a) => a.share !== null);
  const summary = hasData
    ? segments.map((s) => `${s.label} ${formatPercent(shareToPercent(s.share))}`).join(", ")
    : "unavailable";

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-[var(--dash-gap)] gap-y-2">
      <div className="relative shrink-0" style={{ width: renderedWidth, height: `calc(${displaySize} * 1.175)` }}>
        <svg
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
          className="block size-full"
          role="img"
          aria-label={`${label}. ${summary}`}
        >
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--dash-chart-track)" strokeWidth={STROKE} />
          {arcs.map((arc) =>
            arc.pct > 0 ? (
              <circle
                key={arc.id}
                cx={C}
                cy={C}
                r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeDasharray={`${(arc.pct / 100) * circumference} ${circumference}`}
                strokeDashoffset={-(arc.start / 100) * circumference}
                transform={`rotate(90 ${C} ${C})`}
              />
            ) : null,
          )}
        </svg>
        {hasData
          ? arcs.map((arc) => (
              <ChartLabel
                key={`l-${arc.id}`}
                x={arc.lx}
                y={arc.ly}
                viewBox={VIEW}
                renderedWidth={renderedWidth}
                size={17}
                color={arc.color}
                weight={600}
              >
                {formatNumber(arc.pct, { maximumFractionDigits: 0 })}
                <ChartUnit>%</ChartUnit>
              </ChartLabel>
            ))
          : null}
        {!hasData ? (
          <ChartLabel x={C} y={C} viewBox={VIEW} renderedWidth={renderedWidth} size={11} color="var(--dash-text-muted)">
            Unavailable
          </ChartLabel>
        ) : null}
      </div>
      {legend === "right" ? (
        <StatusLegend
          variant="square"
          direction="column"
          items={arcs.map((arc) => ({ color: arc.color, label: arc.label }))}
        />
      ) : null}
    </div>
  );
}
