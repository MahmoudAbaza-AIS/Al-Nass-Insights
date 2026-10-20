export interface StatusLegendItem {
  color: string;
  label: string;
}

export function StatusLegend({ items }: { items: StatusLegendItem[] }) {
  return (
    <ul className="m-0 flex flex-wrap gap-3 p-0 list-none text-[length:var(--dash-fs-xs)] text-[var(--dash-label)]">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
