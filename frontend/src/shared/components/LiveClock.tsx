import { useLiveClock } from "../hooks/useLiveClock";

/** Isolated clock — only this subtree re-renders each second. Matches Figma date | time layout. */
export function LiveClock({ timeZone }: { timeZone: string }) {
  const { dateLabel, timeLabel, periodLabel } = useLiveClock(timeZone);

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 tabular-nums"
      aria-live="off"
    >
      <span className="font-normal text-[length:var(--dash-fs-clock-date)] text-[var(--dash-text-muted)]">
        {dateLabel}
      </span>
      <span className="hidden h-5 w-px bg-white/40 sm:block" aria-hidden />
      <time
        className="font-semibold text-[length:var(--dash-fs-clock-time)] text-[var(--dash-text)]"
        dateTime={new Date().toISOString()}
      >
        <span>{timeLabel}</span>
        {periodLabel ? (
          <span className="ms-1 text-[length:var(--dash-fs-clock-date)] font-semibold">
            {periodLabel}
          </span>
        ) : null}
      </time>
    </div>
  );
}
