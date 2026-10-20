import { useLiveClock } from "../hooks/useLiveClock";

/** Isolated clock component — only this subtree re-renders each second. */
export function LiveClock({ timeZone }: { timeZone: string }) {
  const { dateLabel, timeLabel } = useLiveClock(timeZone);

  return (
    <div
      className="flex items-center gap-3 text-[length:var(--dash-fs-sm)] tabular-nums"
      aria-live="off"
    >
      <span className="text-[var(--dash-label)]">{dateLabel}</span>
      <span className="h-4 w-px bg-white/30" aria-hidden />
      <time className="font-semibold text-[var(--dash-text)]" dateTime={new Date().toISOString()}>
        {timeLabel}
      </time>
    </div>
  );
}
