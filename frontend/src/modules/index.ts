import type { DashboardId } from "@contracts/metrics";
import type { DashboardModule, DashboardNavItem } from "@contracts/navigation";
import { hospitalOverviewModule } from "./overview";
import { clinicalModule } from "./clinical";
import { operatingRoomModule } from "./operating-room";
import { callCenterModule } from "./call-center";
import { outpatientModule } from "./outpatient";
import { emergencyModule } from "./emergency";
import { inpatientModule } from "./inpatient";

/**
 * Dashboard module catalogue (Platform.Docs DASH-01..07).
 * App composition root wires these modules; modules must not import each other.
 * Auth is separate — import from `@modules/auth`.
 */
export const DASHBOARD_MODULES: readonly DashboardModule[] = [
  hospitalOverviewModule,
  clinicalModule,
  operatingRoomModule,
  callCenterModule,
  outpatientModule,
  emergencyModule,
  inpatientModule,
] as const;

export const DASHBOARD_REGISTRY: readonly DashboardNavItem[] = DASHBOARD_MODULES.map((m) => m.nav);

const byPath = new Map(DASHBOARD_REGISTRY.map((item) => [item.path, item]));
const byId = new Map(DASHBOARD_MODULES.map((m) => [m.nav.id, m]));

export function getDashboardByPath(pathname: string): DashboardNavItem {
  const normalized = pathname.replace(/\/+$/, "") || "/overview";
  return byPath.get(normalized) ?? DASHBOARD_REGISTRY[0];
}

export function getModuleById(id: DashboardId): DashboardModule {
  return byId.get(id) ?? DASHBOARD_MODULES[0];
}

export function getDashboardById(id: DashboardId): DashboardNavItem {
  return getModuleById(id).nav;
}

/** Filter nav items by JWT dashboard claims (`*` = all). */
export function filterRegistryByAccess(
  registry: readonly DashboardNavItem[],
  allowed: readonly string[] | undefined,
): readonly DashboardNavItem[] {
  if (!allowed || allowed.length === 0) return [];
  if (allowed.includes("*")) return registry;
  const set = new Set(allowed.map((id) => id.toUpperCase()));
  return registry.filter((item) => set.has(item.id.toUpperCase()));
}

export function canAccessDashboard(
  dashboardId: DashboardId,
  allowed: readonly string[] | undefined,
): boolean {
  if (!allowed || allowed.length === 0) return false;
  if (allowed.includes("*")) return true;
  return allowed.some((id) => id.toUpperCase() === dashboardId.toUpperCase());
}
