import type { DashboardDataService } from "./dashboardDataService";
import { createHttpDashboardDataService } from "./httpDashboardDataService";

let singleton: DashboardDataService | null = null;

/** Infrastructure adapter — always live Insights API behind nginx `/api`. */
export function getDashboardDataService(): DashboardDataService {
  if (!singleton) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";
    singleton = createHttpDashboardDataService(baseUrl.replace(/\/$/, ""));
  }
  return singleton;
}

export type { DashboardDataService } from "./dashboardDataService";
