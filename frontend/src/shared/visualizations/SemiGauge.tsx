import { formatNumber } from "../utils/format";
import { ChartLabel, ChartUnit } from "./ChartLabel";

export interface SemiGaugeProps {
  value: number | null;
  max: number;
  label: string;
  unit?: string;
}

const CX = 90;
const CY = 82;
const R = 66;
const SWEEP = (220 * Math.PI) / 180;
const START = Math.PI / 2 + (Math.PI * 2 - SWEEP) / 2;
const VIEW = { w: 180, h: 120 };
const WIDTH = "calc(var(--dash-gauge-lg) * 1.3)";

const polar = (angle: number, r: number) => ({ x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r });

function arc(a0: number, a1: number, r: number) {
  const p0 = polar(a0, r);
  const p1 = polar(a1, r);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

/** OPD waiting time dial: 220° track with ticks, needle, value and caption underneath. */
export function SemiGauge({ value, max, label, unit = "min" }: SemiGaugeProps) {
  const safe = value === null ? null : Math.min(max, Math.max(0, value));
  const angle = START + SWEEP * ((safe ?? 0) / max);
  const needle = polar(angle, R - 22);
  const ticks = Array.from({ length: 7 }, (_, i) => (max / 6) * i);
  const display = value === null ? "—" : formatNumber(value, { maximumFractionDigits: 1 });

  return (
    <figure className="m-0 flex flex-col items-center gap-[0.3em]">
      <div className="relative shrink-0" style={{ width: WIDTH, height: "calc(var(--dash-gauge-lg) * 0.867)" }}>
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          className="block size-full"
          role="img"
          aria-label={`${label}: ${value === null ? "unavailable" : `${display} ${unit}`}`}
        >
          <path d={arc(START, START + SWEEP, R)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={12} />
          {safe !== null ? (
            <path
              d={arc(START, angle, R)}
              fill="none"
              stroke="var(--dash-cyan)"
              strokeWidth={12}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 4px var(--dash-cyan))" }}
            />
          ) : null}
          {ticks.map((t) => {
            const minor = Array.from({ length: 4 }, (_, k) => START + SWEEP * ((t + ((k + 1) * max) / 30) / max));
            return t < max ? (
              <g key={t}>
                {minor.map((ma) => {
                  const a0 = polar(ma, R - 8);
                  const a1 = polar(ma, R - 5);
                  return <line key={ma} x1={a0.x} y1={a0.y} x2={a1.x} y2={a1.y} stroke="rgba(255,255,255,0.4)" />;
                })}
              </g>
            ) : null;
          })}
          {safe !== null ? (
            <>
              <line x1={CX} y1={CY} x2={needle.x} y2={needle.y} stroke="var(--dash-label)" strokeWidth={2} />
              <circle cx={CX} cy={CY} r={5} fill="var(--dash-cyan)" />
            </>
          ) : null}
        </svg>
        {ticks.map((t) => {
          const p = polar(START + SWEEP * (t / max), R - 16);
          return (
            <ChartLabel key={t} x={p.x} y={p.y} viewBox={VIEW} renderedWidth={WIDTH} size={9}>
              {t}
            </ChartLabel>
          );
        })}
        <ChartLabel
          x={CX}
          y={CY + 30}
          viewBox={VIEW}
          renderedWidth={WIDTH}
          size={20}
          baseline="bottom"
          color={value === null ? "var(--dash-text-muted)" : "var(--dash-cyan)"}
          weight={600}
        >
          {display}
          {value !== null ? <ChartUnit>{unit}</ChartUnit> : null}
        </ChartLabel>
      </div>
      <figcaption className="text-[length:var(--dash-fs-section)] text-[var(--dash-text)]">{label}</figcaption>
    </figure>
  );
}
