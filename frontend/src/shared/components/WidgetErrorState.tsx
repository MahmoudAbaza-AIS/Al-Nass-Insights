export function WidgetErrorState({
  title = "Unable to load",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--dash-danger)]/30 bg-[rgba(255,90,106,0.08)] p-4"
      role="alert"
    >
      <div className="font-medium text-[var(--dash-danger)]">{title}</div>
      {message ? (
        <p className="mt-1 text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">{message}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-[var(--dash-cyan)]/15 px-3 py-1.5 text-[length:var(--dash-fs-sm)] text-[var(--dash-cyan)] ring-1 ring-[var(--dash-cyan)]/40"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
