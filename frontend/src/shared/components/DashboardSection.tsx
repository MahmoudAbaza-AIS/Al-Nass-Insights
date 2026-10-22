import type { ReactNode } from "react";

export interface DashboardSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Reference section block: medium-weight title over a fading rule, content floats on the canvas. */
export function DashboardSection({ title, children, className = "" }: DashboardSectionProps) {
  return (
    <section className={`min-w-0 ${className}`} aria-label={title}>
      {title ? (
        <header className="mb-[var(--dash-gap)]">
          <h2 className="m-0 text-[length:var(--dash-fs-section)] font-medium leading-tight text-[var(--dash-text)]">
            {title}
          </h2>
          <div className="dash-section-rule" aria-hidden />
        </header>
      ) : null}
      {children}
    </section>
  );
}
