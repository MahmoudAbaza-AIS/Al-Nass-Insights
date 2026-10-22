import type { ReactNode } from "react";

export interface IllustrationPanelProps {
  label: string;
  children: ReactNode;
  className?: string;
  aspectRatio?: string;
}

/** Soft cyan bloom behind central Figma illustrations — no card chrome. */
export function IllustrationPanel({
  label,
  children,
  className = "",
  aspectRatio = "4 / 3",
}: IllustrationPanelProps) {
  return (
    <div
      className={`dash-hub-illustration relative mx-auto flex max-w-full min-h-0 items-center justify-center ${className}`}
      style={aspectRatio === "auto" ? undefined : { aspectRatio }}
      role="img"
      aria-label={label}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,255,0.22) 0%, transparent 68%)",
        }}
        aria-hidden
      />
      <div className="relative z-[1] max-h-full max-w-full">{children}</div>
    </div>
  );
}
