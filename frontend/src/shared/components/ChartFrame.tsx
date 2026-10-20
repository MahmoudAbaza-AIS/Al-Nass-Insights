import type { ReactNode } from "react";

export function ChartFrame({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      {title ? (
        <h3 className="mb-2 text-[length:var(--dash-fs-sm)] font-medium text-[var(--dash-text)]">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  );
}
