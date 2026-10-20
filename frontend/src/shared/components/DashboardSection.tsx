import type { ReactNode } from "react";

export interface DashboardSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({ title, children, className = "" }: DashboardSectionProps) {
  return (
    <section className={`min-w-0 ${className}`} aria-label={title}>
      {title ? (
        <header className="mb-3">
          <h2 className="m-0 text-[length:var(--dash-fs-md)] font-medium tracking-wide text-[var(--dash-text)]">
            {title}
          </h2>
          <div className="dash-section-rule" aria-hidden />
        </header>
      ) : null}
      {children}
    </section>
  );
}
