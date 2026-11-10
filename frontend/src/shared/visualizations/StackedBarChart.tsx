import type { TrendPoint } from "@contracts/metrics";
import { DashboardSection } from "../components/DashboardSection";
import { StatusLegend } from "../components/StatusLegend";
import { formatNumber } from "../utils/format";

export interface StackedBarChartProps {
  inbound: TrendPoint[];
  outbound: TrendPoint[];
  label: string;
  maxY?: number;
}

const W = 300;
const H = 160;
const PAD = { top: 10, right: 6, bottom: 24, left: 40 };

export function StackedBarChart({ inbound, outbound, label, maxY = 1400 }: StackedBarChartProps) {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const n = Math.max(inbound.length, outbound.length);
  const slot = n > 0 ? plotW / n : 0;
  const barW = slot * 0.62;
  const base = PAD.top + plotH;

  const rows = Array.from({ length: n }, (_, i) => ({
    label: inbound[i]?.label ?? outbound[i]?.label ?? "",
    inbound: inbound[i]?.value ?? null,
    outbound: outbound[i]?.value ?? null,
  }));
  const hasData = rows.some((r) => r.inbound !== null || r.outbound !== null);

  return (
    <DashboardSection title={label}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-[var(--dash-chart-w)] max-w-full"
        role="img"
        aria-label={`${label}${hasData ? " stacked bar chart" : ": series not published"}`}
      >
        {Array.from({ length: 8 }, (_, k) => k / 7).map((t) => {
          const y = PAD.top + plotH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={t === 0 ? "var(--dash-chart-ontime)" : "var(--dash-chart-grid)"} />
              <text x={PAD.left - 5} y={y} textAnchor="end" dominantBaseline="middle" fill="var(--dash-label)" fontSize={12}>
                {Math.round(maxY * t)}
              </text>
            </g>
          );
        })}
        {rows.map((row, i) => {
          const x = PAD.left + i * slot + (slot - barW) / 2;
          const inH = ((row.inbound ?? 0) / maxY) * plotH;
          const outH = ((row.outbound ?? 0) / maxY) * plotH;
          return (
            <g key={`${row.label}-${i}`}>
              <rect x={x} y={base - inH} width={barW} height={Math.max(0, inH)} fill="var(--dash-chart-inbound)" />
              <rect x={x} y={base - inH - outH} width={barW} height={Math.max(0, outH)} fill="var(--dash-chart-outbound)" />
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fill="var(--dash-label)" fontSize={12}>
                {row.label}
              </text>
            </g>
          );
        })}
        {!hasData ? (
          <text x={PAD.left + plotW / 2} y={PAD.top + plotH / 2} textAnchor="middle" dominantBaseline="middle" fill="var(--dash-text-muted)" fontSize={13}>
            Daily series not published yet
          </text>
        ) : null}
      </svg>
      <div className="mt-[0.5em] flex justify-center">
        <StatusLegend
          variant="square"
          items={[
            { color: "var(--dash-chart-inbound)", label: "Inbound" },
            { color: "var(--dash-chart-outbound)", label: "Outbound" },
          ]}
        />
      </div>
      {hasData ? (
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
            {rows.map((row, i) => (
              <tr key={`${row.label}-${i}`}>
                <td>{row.label}</td>
                <td>{formatNumber(row.inbound)}</td>
                <td>{formatNumber(row.outbound)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </DashboardSection>
  );
}
