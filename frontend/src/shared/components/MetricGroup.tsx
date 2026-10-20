import type { ReactNode } from "react";

export interface MetricGroupProps {
  title?: string;
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

const COLS: Record<NonNullable<MetricGroupProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function MetricGroup({
  title,
  children,
  className = "",
  columns = 2,
}: MetricGroupProps) {
  return (
    <section className={className} aria-label={title}>
      {title ? (
        <header className="mb-3">
          <h2 className="m-0 text-[length:var(--dash-fs-md)] font-medium text-[var(--dash-text)]">
            {title}
          </h2>
          <div className="dash-section-rule" aria-hidden />
        </header>
      ) : null}
      <div className={`grid gap-4 ${COLS[columns]}`}>{children}</div>
    </section>
  );
}
