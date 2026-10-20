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
          ? "flex gap-2 overflow-x-auto px-2 py-2"
          : "flex w-[var(--dash-nav-width)] flex-col items-center gap-3 py-4"
      }
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const className = `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
          active
            ? "bg-[rgba(61,231,255,0.12)] text-[var(--dash-cyan)] shadow-[0_0_18px_rgba(61,231,255,0.35)] ring-1 ring-[var(--dash-cyan)]"
            : "text-[var(--dash-text-muted)] ring-1 ring-white/10 hover:text-[var(--dash-text)] hover:ring-white/25"
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
