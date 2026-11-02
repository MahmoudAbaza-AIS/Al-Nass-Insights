import type { CSSProperties, ReactNode } from "react";

export interface DashboardSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Figma section block (`Group 2611566` / `Frame 2610865`): Poppins Medium 40 @ white 80 %
 * over a fading hairline, content floats on the canvas.
 */
export function DashboardSection({ title, children, className = "", style }: DashboardSectionProps) {
  return (
    <section className={`min-w-0 ${className}`} aria-label={title} style={style}>
      {title ? (
        <header className="mb-[var(--dash-gap)] w-max max-w-full">
          <h2 className="m-0 whitespace-nowrap text-[length:var(--dash-fs-section)] font-medium leading-tight text-[var(--dash-section-title)]">
            {title}
          </h2>
          <div className="dash-section-rule" aria-hidden />
        </header>
      ) : null}
      {children}
    </section>
  );
}
