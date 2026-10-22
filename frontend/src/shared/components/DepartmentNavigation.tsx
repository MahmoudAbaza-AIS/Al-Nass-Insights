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
          ? "flex flex-wrap justify-center gap-2 px-3 py-2"
          : "flex h-full w-[var(--dash-nav-width)] flex-col items-center justify-center gap-[var(--dash-nav-gap)]"
      }
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Tooltip.Root key={item.id}>
            <Tooltip.Trigger
              as="button"
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? "page" : undefined}
              aria-label={item.title}
              className="dash-nav-btn"
            >
              <NavIcon name={item.icon} />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side={compact ? "bottom" : "right"}>
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
