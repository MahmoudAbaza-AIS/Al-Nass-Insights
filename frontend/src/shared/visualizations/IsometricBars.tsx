import type { DistributionSegment } from "@contracts/metrics";
import { StatusLegend } from "../components/StatusLegend";
import { formatNumber, formatPercent, shareToPercent } from "../utils/format";
import { ChartLabel, ChartUnit } from "./ChartLabel";
import { DISTRIBUTION_COLORS } from "./CylinderBars";

export interface IsometricBarsProps {
  segments: DistributionSegment[];
  label: string;
  colors?: readonly string[];
}

/* Isometric axes: "length" runs up-right, rows step down-right. */
const LX = 0.866;
const LY = -0.5;
const TRACK = 96;
const DEPTH = 13;
const THICK = 14;
const ROW_STEP = 17;
const VIEW = { w: 170, h: 130 };
const WIDTH = `calc(var(--dash-chart-h) * ${VIEW.w / VIEW.h})`;

const rowX = (i: number) => 40 + i * ROW_STEP * 0.6;
const rowY = (i: number) => 70 + i * ROW_STEP;

function box(x: number, y: number, len: number) {
  const ax = x + LX * len;
  const ay = y + LY * len;
  const dx = DEPTH * LX;
  const dy = -DEPTH * LY;
  return {
    top: `${x},${y} ${ax},${ay} ${ax + dx},${ay + dy} ${x + dx},${y + dy}`,
    front: `${x + dx},${y + dy} ${ax + dx},${ay + dy} ${ax + dx},${ay + dy + THICK} ${x + dx},${y + dy + THICK}`,
    side: `${x},${y} ${x + dx},${y + dy} ${x + dx},${y + dy + THICK} ${x},${y + THICK}`,
  };
}

/** Outpatient clinics (Overview): glass tracks with filled share, percentages at the leading edge. */
export function IsometricBars({ segments, label, colors = DISTRIBUTION_COLORS }: IsometricBarsProps) {
  const pcts = segments.map((s) => shareToPercent(s.share));
  const hasData = pcts.some((p) => p !== null);
  const summary = hasData
    ? segments.map((s, i) => `${s.label} ${formatPercent(pcts[i])}`).join(", ")
    : "unavailable";

  return (
    <div className="flex flex-col items-center gap-[var(--dash-gap)]">
      <div className="relative shrink-0" style={{ height: "var(--dash-chart-h)", width: WIDTH }}>
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="block size-full" role="img" aria-label={`${label}. ${summary}`}>
          {segments.map((seg, i) => {
            const pct = pcts[i];
            const color = colors[i % colors.length];
            const x = rowX(i);
            const y = rowY(i);
            const track = box(x, y, TRACK);
            const fillLen = pct === null ? 0 : Math.max(4, (pct / 100) * TRACK);
            const fill = box(x, y, fillLen);
            return (
              <g key={seg.id}>
                <polygon points={track.top} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.45)" strokeWidth={0.6} />
                <polygon points={track.front} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.45)" strokeWidth={0.6} />
                {pct !== null ? (
                  <>
                    <polygon points={fill.front} fill={color} opacity={0.75} />
                    <polygon points={fill.side} fill={color} opacity={0.6} />
                    <polygon points={fill.top} fill={color} />
                  </>
                ) : null}
              </g>
            );
          })}
        </svg>
        {segments.map((seg, i) => {
          const pct = pcts[i];
          if (pct === null) return null;
          return (
            <ChartLabel
              key={seg.id}
              x={rowX(i) - 4}
              y={rowY(i) + THICK / 2 + 2}
              viewBox={VIEW}
              renderedWidth={WIDTH}
              size={12}
              anchor="end"
              color={colors[i % colors.length]}
              weight={600}
            >
              {formatNumber(pct, { maximumFractionDigits: 0 })}
              <ChartUnit>%</ChartUnit>
            </ChartLabel>
          );
        })}
        {!hasData ? (
          <ChartLabel x={85} y={60} viewBox={VIEW} renderedWidth={WIDTH} size={11} color="var(--dash-text-muted)">
            Unavailable
          </ChartLabel>
        ) : null}
      </div>
      <StatusLegend
        variant="square"
        direction="column"
        items={segments.map((seg, i) => ({ color: colors[i % colors.length], label: seg.label }))}
      />
    </div>
  );
}
