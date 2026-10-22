import type { DistributionSegment } from "@contracts/metrics";
import { StatusLegend } from "../components/StatusLegend";
import { formatNumber, formatPercent, shareToPercent } from "../utils/format";
import { ChartLabel, ChartUnit } from "./ChartLabel";

export const DISTRIBUTION_COLORS = [
  "var(--dash-chart-ontime)",
  "var(--dash-chart-noshow)",
  "var(--dash-chart-cancel)",
] as const;

export interface CylinderBarsProps {
  segments: DistributionSegment[];
  label: string;
  colors?: readonly string[];
}

const BAR_W = 30;
const GAP = 14;
const BASE_Y = 132;
const MAX_H = 92;
const RY = 7;
const VIEW_H = 150;

/** Application Request (Overview): glossy cylinders on dark rings, percentage above each. */
export function CylinderBars({ segments, label, colors = DISTRIBUTION_COLORS }: CylinderBarsProps) {
  const pcts = segments.map((s) => shareToPercent(s.share));
  const max = Math.max(...pcts.map((p) => p ?? 0), 1);
  const width = 24 + segments.length * (BAR_W + GAP);
  const hasData = pcts.some((p) => p !== null);
  const view = { w: width, h: VIEW_H };
  const renderedWidth = `calc(var(--dash-chart-h) * ${width / VIEW_H})`;
  const summary = hasData
    ? segments.map((s, i) => `${s.label} ${formatPercent(pcts[i])}`).join(", ")
    : "unavailable";

  return (
    <div className="flex items-end gap-[var(--dash-gap)]">
      <div className="relative shrink-0" style={{ height: "var(--dash-chart-h)", width: renderedWidth }}>
        <svg viewBox={`0 0 ${width} ${VIEW_H}`} className="block size-full" role="img" aria-label={`${label}. ${summary}`}>
          {segments.map((seg, i) => {
            const pct = pcts[i];
            const color = colors[i % colors.length];
            const h = pct === null ? 0 : Math.max(6, (pct / max) * MAX_H);
            const x = 12 + i * (BAR_W + GAP);
            const cx = x + BAR_W / 2;
            const top = BASE_Y - h;
            return (
              <g key={seg.id}>
                <ellipse cx={cx} cy={BASE_Y + 2} rx={BAR_W / 2 + 7} ry={RY + 4} fill="none" stroke="rgba(255,255,255,0.18)" />
                <ellipse cx={cx} cy={BASE_Y + 2} rx={BAR_W / 2 + 3} ry={RY + 2} fill="rgba(2,18,25,0.7)" />
                {pct !== null ? (
                  <>
                    <rect x={x} y={top} width={BAR_W} height={h} fill={color} opacity={0.88} />
                    <ellipse cx={cx} cy={BASE_Y} rx={BAR_W / 2} ry={RY} fill={color} opacity={0.88} />
                    <rect x={x + 4} y={top} width={5} height={h} fill="rgba(255,255,255,0.25)" />
                    <ellipse cx={cx} cy={top} rx={BAR_W / 2} ry={RY} fill={color} />
                    <ellipse cx={cx} cy={top} rx={BAR_W / 2 - 3} ry={RY - 2.5} fill="rgba(255,255,255,0.35)" />
                  </>
                ) : null}
              </g>
            );
          })}
        </svg>
        {segments.map((seg, i) => {
          const pct = pcts[i];
          if (pct === null) return null;
          const top = BASE_Y - Math.max(6, (pct / max) * MAX_H);
          return (
            <ChartLabel
              key={seg.id}
              x={12 + i * (BAR_W + GAP) + BAR_W / 2}
              y={top - RY - 3}
              viewBox={view}
              renderedWidth={renderedWidth}
              size={13}
              baseline="bottom"
              color={colors[i % colors.length]}
              weight={600}
            >
              {formatNumber(pct, { maximumFractionDigits: 0 })}
              <ChartUnit>%</ChartUnit>
            </ChartLabel>
          );
        })}
        {!hasData ? (
          <ChartLabel x={width / 2} y={70} viewBox={view} renderedWidth={renderedWidth} size={11} color="var(--dash-text-muted)">
            Unavailable
          </ChartLabel>
        ) : null}
      </div>
      <div className="pb-[0.4em]">
        <StatusLegend
          variant="square"
          direction="column"
          items={segments.map((seg, i) => ({ color: colors[i % colors.length], label: seg.label }))}
        />
      </div>
    </div>
  );
}
