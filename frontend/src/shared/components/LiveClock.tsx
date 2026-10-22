import { useLiveClock } from "../hooks/useLiveClock";

/** Isolated clock — only this subtree re-renders each second. Matches Figma date | time layout. */
export function LiveClock({ timeZone }: { timeZone: string }) {
  const { dateLabel, timeLabel, periodLabel } = useLiveClock(timeZone);

  return (
    <div className="flex items-center gap-x-[1.4em] whitespace-nowrap tabular-nums" aria-live="off">
      <span className="hidden text-[length:var(--dash-fs-clock-date)] font-normal text-[var(--dash-text-muted)] sm:inline">
        {dateLabel}
      </span>
      <span className="hidden h-[1.1em] w-px bg-white/50 sm:block" aria-hidden />
      <time className="text-[length:var(--dash-fs-clock-time)] font-semibold text-[var(--dash-text)]">
        <span>{timeLabel}</span>
        {periodLabel ? (
          <span className="ms-[0.3em] text-[length:var(--dash-fs-xs)] font-semibold">{periodLabel}</span>
        ) : null}
      </time>
    </div>
  );
}
