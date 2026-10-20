import type { ReactNode } from "react";

export interface IllustrationPanelProps {
  label: string;
  children: ReactNode;
  className?: string;
  /** Reserve space to limit layout shift while assets load. */
  aspectRatio?: string;
}

export function IllustrationPanel({
  label,
  children,
  className = "",
  aspectRatio = "4 / 3",
}: IllustrationPanelProps) {
  return (
    <div
      className={`relative mx-auto flex max-w-full items-center justify-center ${className}`}
      style={{ aspectRatio }}
      role="img"
      aria-label={label}
    >
      <div
        className="pointer-events-none absolute inset-[12%] rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(61,231,255,0.22) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative z-[1] max-h-full max-w-full">{children}</div>
    </div>
  );
}

export function IllustrationPlaceholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex h-full min-h-[12rem] w-full max-w-md flex-col items-center justify-center rounded-xl border border-dashed border-cyan-400/30 bg-[rgba(8,40,52,0.45)] px-6 py-8 text-center">
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dash-cyan)]">
        Illustration placeholder
      </div>
      <div className="mt-2 text-lg font-medium text-[var(--dash-text)]">{title}</div>
      <p className="mt-2 max-w-xs text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
        {subtitle}
      </p>
    </div>
  );
}
