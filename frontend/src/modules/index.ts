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
 * Modular monolith module catalogue (Platform.Docs DASH-01..07).
 * App composition root wires these modules; modules must not import each other.
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
