import { toCounterDigits } from "../utils/format";

export interface DigitalCounterProps {
  value: number | null;
  label: string;
  width?: number;
}

/** Digit cells match Figma Timer component (120×130 @ 4K, Digital-7 style). */
export function DigitalCounter({ value, label, width = 3 }: DigitalCounterProps) {
  const digits = toCounterDigits(value, width);
  const spoken =
    value === null || value === undefined ? "unavailable" : String(Math.trunc(value));

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4" aria-label={`${label}: ${spoken}`}>
      <div className="text-center font-medium tracking-wide text-[length:var(--dash-fs-counter-label)] text-[var(--dash-label)]">
        {label}
      </div>
      <div className="flex gap-[var(--dash-digit-gap)]" aria-hidden={value === null}>
        {digits.map((d, i) => (
          <span
            key={`${i}-${d ?? "x"}`}
            className="inline-flex h-[var(--dash-digit-h)] w-[var(--dash-digit-w)] items-center justify-center rounded-[var(--dash-digit-radius)] border-[3px] border-[var(--dash-cyan-border)] bg-[rgba(0,20,28,0.55)] font-[family-name:var(--dash-font-digital)] text-[length:var(--dash-fs-digit)] leading-none text-[var(--dash-cyan)] shadow-[0_0_12px_rgba(0,229,255,0.2)]"
            style={{ textShadow: "0 0 14px rgba(84,233,255,0.55)" }}
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
