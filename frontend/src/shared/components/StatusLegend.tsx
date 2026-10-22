export interface StatusLegendItem {
  color: string;
  label: string;
}

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
      className={`m-0 flex list-none p-0 text-[length:var(--dash-fs-xs)] text-[var(--dash-label)] ${
        direction === "column" ? "flex-col gap-[0.5em]" : "flex-wrap gap-x-[1.2em] gap-y-[0.4em]"
      }`}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-[0.5em]">
          <span
            className={`inline-block size-[0.85em] shrink-0 ${variant === "dot" ? "rounded-full" : "rounded-[2px]"}`}
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
