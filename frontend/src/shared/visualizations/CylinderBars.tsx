import type { DistributionSegment } from "@contracts/metrics";
import { formatPercent } from "../utils/format";

const TONE_FILL: Record<string, string> = {
  info: "url(#cylCyan)",
  watch: "url(#cylAmber)",
  critical: "url(#cylRed)",
  good: "url(#cylCyan)",
  neutral: "url(#cylCyan)",
};

export interface CylinderBarsProps {
  segments: DistributionSegment[];
  label: string;
}

export function CylinderBars({ segments, label }: CylinderBarsProps) {
  const max = Math.max(...segments.map((s) => s.share ?? 0), 1);
  const width = 200;
  const height = 150;
  const barW = 36;
  const gap = 28;
  const baseY = 120;

  return (
    <div>
      <h3 className="mb-2 text-[length:var(--dash-fs-sm)] font-medium text-[var(--dash-text)]">
        {label}
      </h3>
      <div className="flex flex-wrap items-end gap-4">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={label}
        >
          <defs>
            <linearGradient id="cylCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7af0ff" />
              <stop offset="100%" stopColor="#1aa8c4" />
            </linearGradient>
            <linearGradient id="cylAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd27a" />
              <stop offset="100%" stopColor="#c4841a" />
            </linearGradient>
            <linearGradient id="cylRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8a95" />
              <stop offset="100%" stopColor="#c4283a" />
            </linearGradient>
          </defs>
          {segments.map((seg, i) => {
            const h = ((seg.share ?? 0) / max) * 80;
            const x = 20 + i * (barW + gap);
            const y = baseY - h;
            const fill = TONE_FILL[seg.tone ?? "neutral"];
            return (
              <g key={seg.id}>
                <ellipse cx={x + barW / 2} cy={baseY} rx={barW / 2} ry={8} fill={fill} opacity={0.55} />
                <rect x={x} y={y} width={barW} height={h} fill={fill} />
                <ellipse cx={x + barW / 2} cy={y} rx={barW / 2} ry={8} fill={fill} />
                <text
                  x={x + barW / 2}
                  y={y - 12}
                  textAnchor="middle"
                  fill="var(--dash-cyan)"
                  fontSize={12}
                  fontWeight={700}
                >
                  {formatPercent(seg.share)}
                </text>
              </g>
            );
          })}
        </svg>
        <ul className="m-0 list-none space-y-2 p-0 text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
          {segments.map((seg) => (
            <li key={seg.id}>
              {seg.label}{" "}
              <span className="font-semibold text-[var(--dash-cyan)]">
                {formatPercent(seg.share)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
