import type { ComponentType } from "react";
import type { DashboardId, DashboardPayload } from "./metrics";

export interface DashboardNavItem {
  id: DashboardId;
  title: string;
  shortTitle: string;
  path: string;
  description: string;
  icon: "overview" | "clinical" | "or" | "call" | "outpatient" | "emergency" | "inpatient";
}

/** Public surface of a dashboard feature module (modular monolith). */
export interface DashboardModule {
  nav: DashboardNavItem;
  loadView: () => Promise<{ default: ComponentType<{ data: DashboardPayload }> }>;
}
