import type { DashboardNavItem } from "@contracts/navigation";

/**
 * Sidebar icons (PrimeIcons). PrimeIcons has no scissors, stethoscope or bed glyph,
 * so OR, Outpatient and Inpatient use the closest available shapes.
 */
const ICON_CLASS: Record<DashboardNavItem["icon"], string> = {
  overview: "pi-building",
  clinical: "pi-heart",
  or: "pi-wrench",
  call: "pi-headphones",
  outpatient: "pi-building-columns",
  emergency: "pi-truck",
  inpatient: "pi-inbox",
};

export function NavIcon({ name }: { name: DashboardNavItem["icon"] }) {
  return <i className={`pi ${ICON_CLASS[name]}`} aria-hidden="true" />;
}
