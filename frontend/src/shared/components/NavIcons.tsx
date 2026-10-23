import type { DashboardNavItem } from "@contracts/navigation";

/**
 * Sidebar icons (PrimeIcons only). Exact Figma glyphs are not always present:
 * - OR: no scissors → wrench
 * - Outpatient: no stethoscope → calendar (clinic schedule)
 * - Emergency: no ambulance → truck
 * - Inpatient: no bed → warehouse (facility / beds inventory)
 * - Clinical: wave-pulse is the closest heartbeat glyph (better than plain heart)
 */
const ICON_CLASS: Record<DashboardNavItem["icon"], string> = {
  overview: "pi-building",
  clinical: "pi-wave-pulse",
  or: "pi-wrench",
  call: "pi-headphones",
  outpatient: "pi-calendar",
  emergency: "pi-truck",
  inpatient: "pi-warehouse",
};

export function NavIcon({ name }: { name: DashboardNavItem["icon"] }) {
  return <i className={`pi ${ICON_CLASS[name]}`} aria-hidden="true" />;
}
