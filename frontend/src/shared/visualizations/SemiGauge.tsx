export interface SemiGaugeProps {
  value: number | null;
  max: number;
  label: string;
  unit?: string;
}

export function SemiGauge({ value, max, label, unit = "min" }: SemiGaugeProps) {
  const width = 160;
  const height = 100;
  const cx = 80;
  const cy = 88;
  const r = 62;
  const start = Math.PI;
  const end = 0;
  const safe = value === null ? null : Math.min(max, Math.max(0, value));
  const t = safe === null ? 0 : safe / max;
  const angle = start + (end - start) * t;
  const nx = cx + Math.cos(angle) * (r - 8);
  const ny = cy + Math.sin(angle) * (r - 8);

  const arc = (a0: number, a1: number) => {
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };

  const display = safe === null ? "—" : `${safe} ${unit}`;

  return (
    <figure className="m-0 flex flex-col items-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label}: ${display}`}
      >
        <title>{`${label}: ${display}`}</title>
        <path d={arc(start, end)} fill="none" stroke="var(--dash-chart-track)" strokeWidth={12} />
        {safe !== null ? (
          <path
            d={arc(start, angle)}
            fill="none"
            stroke="var(--dash-cyan)"
            strokeWidth={12}
            strokeLinecap="round"
          />
        ) : null}
        {safe !== null ? (
          <circle cx={nx} cy={ny} r={5} fill="var(--dash-cyan)" />
        ) : null}
        <text
          x={cx}
          y={cy - 18}
          textAnchor="middle"
          fill="var(--dash-cyan)"
          fontSize={18}
          fontWeight={700}
        >
          {display}
        </text>
        <text x={16} y={cy + 4} fill="var(--dash-text-subtle)" fontSize={9}>
          0
        </text>
        <text x={width - 16} y={cy + 4} textAnchor="end" fill="var(--dash-text-subtle)" fontSize={9}>
          {max}
        </text>
      </svg>
      <figcaption className="text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
        {label}
      </figcaption>
    </figure>
  );
}
