import { useCountUp } from "../hooks/useCountUp";
import { EMPTY_VALUE, toCounterDigits } from "../utils/format";

export interface DigitalCounterProps {
  value: number | null;
  label: string;
  width?: number;
  /** `boxed` = Figma Timer cells (120×130 @ 4K); `plain` = unboxed digits used for ER sub-counts. */
  variant?: "boxed" | "plain";
}

/**
 * Figma `Timer`: title (Poppins Medium 40, `Title-kpi`) over seven-segment digit cells.
 * Digits count up to each newly published value; unpublished values show "-" per cell.
 */
export function DigitalCounter({ value, label, width = 3, variant = "boxed" }: DigitalCounterProps) {
  const shown = useCountUp(value);
  const digits = toCounterDigits(shown, width);
  const spoken = value === null || value === undefined ? "unavailable" : String(Math.trunc(value));
  const boxed = variant === "boxed";

  return (
    <div className="flex flex-col items-center gap-[0.7em]" role="group" aria-label={`${label}: ${spoken}`}>
      <div
        className={`text-center leading-tight text-[var(--dash-label)] ${
          boxed ? "font-medium text-[length:var(--dash-fs-counter-label)]" : "font-normal text-[length:var(--dash-fs-label)]"
        }`}
      >
        {label}
      </div>
      <div className={`flex ${boxed ? "gap-[var(--dash-digit-gap)]" : "gap-[0.9em]"}`} aria-hidden>
        {digits.map((d, i) => (
          <span
            key={i}
            className={
              boxed
                ? "inline-flex h-[var(--dash-digit-h)] w-[var(--dash-digit-w)] items-center justify-center rounded-[var(--dash-digit-radius)] border-2 border-[var(--dash-cyan-border)] bg-[rgba(0,20,28,0.45)] font-[family-name:var(--dash-font-digital)] text-[length:var(--dash-fs-digit)] leading-none text-[var(--dash-cyan)] shadow-[var(--dash-line-glow)]"
                : "font-[family-name:var(--dash-font-digital)] text-[length:var(--dash-fs-value)] leading-none text-[var(--dash-cyan)]"
            }
            style={{ textShadow: "0 0 14px rgba(84,233,255,0.55)" }}
          >
            {/* Keyed span replays the short roll whenever this cell's digit changes. */}
            <span key={d ?? "x"} className={d === null ? "opacity-60" : "dash-digit-roll"}>
              {d ?? EMPTY_VALUE}
            </span>
          </span>
        ))}
      </div>
      {value === null ? (
        <span className="text-[length:var(--dash-fs-xs)] text-[var(--dash-text-subtle)]">Unavailable</span>
      ) : null}
    </div>
  );
}
