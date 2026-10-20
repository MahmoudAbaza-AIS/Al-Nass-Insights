import { toCounterDigits } from "../utils/format";

export interface DigitalCounterProps {
  value: number | null;
  label: string;
  width?: number;
}

export function DigitalCounter({ value, label, width = 3 }: DigitalCounterProps) {
  const digits = toCounterDigits(value, width);
  const spoken =
    value === null || value === undefined ? "unavailable" : String(Math.trunc(value));

  return (
    <div className="flex flex-col items-center gap-2" aria-label={`${label}: ${spoken}`}>
      <div className="text-[length:var(--dash-fs-sm)] font-medium tracking-wide text-[var(--dash-label)]">
        {label}
      </div>
      <div className="flex gap-1.5" aria-hidden={value === null}>
        {digits.map((d, i) => (
          <span
            key={`${i}-${d ?? "x"}`}
            className="inline-flex h-12 w-9 items-center justify-center rounded-md border border-white/10 bg-[rgba(0,20,28,0.85)] font-mono text-2xl font-bold text-[var(--dash-cyan)] shadow-[inset_0_0_12px_rgba(61,231,255,0.12)]"
            style={{ textShadow: "0 0 12px rgba(61,231,255,0.45)" }}
          >
            {d ?? "–"}
          </span>
        ))}
      </div>
      {value === null ? (
        <span className="text-[length:var(--dash-fs-xs)] text-[var(--dash-warning)]">
          Unavailable
        </span>
      ) : null}
    </div>
  );
}
