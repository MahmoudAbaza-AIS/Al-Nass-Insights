export interface StatusLegendItem {
  color: string;
  label: string;
}

/** Figma legend: rounded square swatch + Segoe UI Regular 28 @ white 70 %. */
export function StatusLegend({
  items,
  variant = "dot",
  direction = "row",
}: {
  items: StatusLegendItem[];
  variant?: "dot" | "square";
  direction?: "row" | "column";
}) {
  return (
    <ul
      className={`m-0 flex list-none p-0 font-[family-name:var(--dash-font-legend)] text-[length:var(--dash-fs-legend)] text-[var(--dash-legend-text)] ${
        direction === "column" ? "flex-col gap-[0.65em]" : "flex-wrap gap-x-[1.2em] gap-y-[0.4em]"
      }`}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-[0.55em] leading-none">
          <span
            className={`inline-block size-[1.1em] shrink-0 ${variant === "dot" ? "rounded-full" : "rounded-[3px]"}`}
            style={{
              background: item.color,
              boxShadow: variant === "dot" ? `0 0 8px ${item.color}` : undefined,
            }}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
