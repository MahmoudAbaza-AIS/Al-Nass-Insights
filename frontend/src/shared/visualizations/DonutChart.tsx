import type { DistributionSegment } from "@contracts/metrics";
import { StatusLegend } from "../components/StatusLegend";
import { EMPTY_VALUE, formatNumber, formatPercent, shareToPercent } from "../utils/format";
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
  /** `corner` = Figma call-center legend tucked under the right-hand label. */
  legend?: "right" | "corner" | "side" | "none";
  /** Where the first segment starts, degrees clockwise from 6 o'clock (Figma call-center split: -45). */
  startAngle?: number;
  /** Ring thickness in viewBox units (Figma call-center ring ≈ 9). */
  thickness?: number;
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
  startAngle = 0,
  thickness = STROKE,
}: DonutChartProps) {
  const circumference = 2 * Math.PI * R;
  const renderedWidth = `calc(${displaySize} * 1.425)`;
  const hasData = segments.some((s) => s.share !== null);
  const startRad = (startAngle * Math.PI) / 180;
  let cursor = 0;

  const arcs = segments.map((seg, index) => {
    const pct = shareToPercent(seg.share) ?? 0;
    // Unpublished splits keep their label slots (even spacing) so the "-" sits where the value will.
    const slot = hasData ? pct : 100 / Math.max(1, segments.length);
    const start = cursor;
    cursor += slot;
    const mid = ((start + slot / 2) / 100) * Math.PI * 2 + Math.PI / 2 + startRad;
    return {
      ...seg,
      pct,
      start,
      color: colors[index % colors.length],
      lx: C + Math.cos(mid) * LABEL_R,
      ly: C + Math.sin(mid) * LABEL_R,
    };
  });
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
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--dash-chart-track)" strokeWidth={thickness} />
          {arcs.map((arc) =>
            arc.pct > 0 ? (
              <circle
                key={arc.id}
                cx={C}
                cy={C}
                r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth={thickness}
                strokeDasharray={`${(arc.pct / 100) * circumference} ${circumference}`}
                strokeDashoffset={-(arc.start / 100) * circumference}
                transform={`rotate(${90 + startAngle} ${C} ${C})`}
              />
            ) : null,
          )}
        </svg>
        {arcs.map((arc) => (
          <ChartLabel
            key={`l-${arc.id}`}
            x={arc.lx}
            y={arc.ly}
            viewBox={VIEW}
            renderedWidth={renderedWidth}
            size={20}
            color={arc.color}
            weight={700}
          >
            {arc.share === null ? (
              EMPTY_VALUE
            ) : (
              <>
                {formatNumber(arc.pct, { maximumFractionDigits: 0 })}
                <ChartUnit>%</ChartUnit>
              </>
            )}
          </ChartLabel>
        ))}
        {legend === "corner" || legend === "side" ? (
          <div
            className={
              legend === "corner" ? "absolute bottom-[14%] left-[86%]" : "absolute left-[88%] top-[58%] -translate-y-1/2"
            }
          >
            <StatusLegend
              variant="square"
              direction="column"
              items={arcs.map((arc) => ({ color: arc.color, label: arc.label }))}
            />
          </div>
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
