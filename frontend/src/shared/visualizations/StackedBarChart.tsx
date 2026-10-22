import type { TrendPoint } from "@contracts/metrics";
import { formatNumber } from "../utils/format";

export interface StackedBarChartProps {
  inbound: TrendPoint[];
  outbound: TrendPoint[];
  label: string;
  maxY?: number;
}

export function StackedBarChart({
  inbound,
  outbound,
  label,
  maxY = 1400,
}: StackedBarChartProps) {
  const width = 420;
  const height = 200;
  const pad = { top: 12, right: 8, bottom: 28, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const n = Math.max(inbound.length, outbound.length);
  const barGap = 8;
  const barW = n > 0 ? (plotW - barGap * (n - 1)) / n : 0;

  const rows = Array.from({ length: n }, (_, i) => {
    const inVal = inbound[i]?.value ?? 0;
    const outVal = outbound[i]?.value ?? 0;
    return {
      label: inbound[i]?.label ?? outbound[i]?.label ?? "",
      inbound: inVal,
      outbound: outVal,
    };
  });

  return (
    <div>
      <h3 className="mb-2 text-[length:var(--dash-fs-sm)] font-medium text-[var(--dash-text)]">
        {label}
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto max-h-[min(22dvh,12rem)] w-full max-w-xl md:max-h-[min(28dvh,14rem)]"
        role="img"
        aria-label={`${label} stacked bar chart`}
      >
        <title>{label}</title>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.top + plotH * (1 - t);
          const val = Math.round(maxY * t);
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
                {val}
              </text>
            </g>
          );
        })}
        {rows.map((row, i) => {
          const x = pad.left + i * (barW + barGap);
          const inH = (row.inbound / maxY) * plotH;
          const outH = (row.outbound / maxY) * plotH;
          const base = pad.top + plotH;
          return (
            <g key={row.label}>
              <rect
                x={x}
                y={base - inH}
                width={barW}
                height={Math.max(0, inH)}
                fill="var(--dash-chart-inbound)"
                rx={2}
              />
              <rect
                x={x}
                y={base - inH - outH}
                width={barW}
                height={Math.max(0, outH)}
                fill="var(--dash-chart-outbound)"
                rx={2}
              />
              <text
                x={x + barW / 2}
                y={height - 8}
                textAnchor="middle"
                fill="var(--dash-label)"
                fontSize={9}
              >
                {row.label}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="mt-2 flex gap-4 text-[length:var(--dash-fs-xs)] text-[var(--dash-label)]">
        <li>
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--dash-chart-inbound)]" />
          Inbound
        </li>
        <li>
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--dash-chart-outbound)]" />
          Outbound
        </li>
      </ul>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Inbound</th>
            <th>Outbound</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{formatNumber(row.inbound)}</td>
              <td>{formatNumber(row.outbound)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
