export function WidgetSkeleton({ label = "Loading widget" }: { label?: string }) {
  return (
    <div
      className="animate-pulse rounded-lg bg-white/5 p-4"
      role="status"
      aria-label={label}
    >
      <div className="mb-3 h-3 w-24 rounded bg-white/10" />
      <div className="h-8 w-20 rounded bg-white/10" />
      <div className="mt-2 h-2 w-32 rounded bg-white/10" />
    </div>
  );
}
