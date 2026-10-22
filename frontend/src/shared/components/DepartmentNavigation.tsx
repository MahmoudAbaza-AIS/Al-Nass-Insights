import { Tooltip } from "@primereact/ui/tooltip";
import type { DashboardNavItem } from "@contracts/navigation";
import type { DashboardId } from "@contracts/metrics";
import { NavIcon } from "./NavIcons";

export interface DepartmentNavigationProps {
  items: readonly DashboardNavItem[];
  activeId: DashboardId;
  onNavigate: (id: DashboardId) => void;
  compact?: boolean;
}

export function DepartmentNavigation({
  items,
  activeId,
  onNavigate,
  compact = false,
}: DepartmentNavigationProps) {
  return (
    <nav
      aria-label="Department dashboards"
      className={
        compact
          ? "flex gap-2 overflow-x-auto px-3 py-2"
          : "flex h-full w-[var(--dash-nav-width)] flex-col items-center justify-center gap-[var(--dash-nav-gap)] py-4"
      }
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const className = compact
          ? `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
              active
                ? "bg-[var(--dash-nav-active)] text-[var(--dash-cyan)] shadow-[var(--dash-glow-strong)]"
                : "bg-[var(--dash-nav-idle)] text-white/70 hover:text-white"
            }`
          : `flex size-[var(--dash-nav-btn)] shrink-0 items-center justify-center rounded-[var(--dash-radius-nav)] transition ${
              active
                ? "bg-[var(--dash-nav-active)] shadow-[var(--dash-glow-strong)]"
                : "bg-[var(--dash-nav-idle)] opacity-80 hover:opacity-100"
            }`;

        return (
          <Tooltip.Root key={item.id}>
            <Tooltip.Trigger
              as="button"
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? "page" : undefined}
              aria-label={item.title}
              className={className}
            >
              <NavIcon name={item.icon} />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="right">
                <Tooltip.Popup className="rounded-md bg-[#0a3340] px-2 py-1 text-xs text-[var(--dash-text)] shadow-lg ring-1 ring-white/10">
                  {item.title}
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        );
      })}
    </nav>
  );
}
