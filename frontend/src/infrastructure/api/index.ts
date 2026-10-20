import type { DashboardDataService } from "./dashboardDataService";
import { createHttpDashboardDataService } from "./httpDashboardDataService";

export { getApiBaseUrl, getDashboardPublicUrl, apiUrl } from "./config";
export { apiFetch, ApiError, getStoredAccessToken, setStoredAccessToken } from "./httpClient";

let singleton: DashboardDataService | null = null;

/** Infrastructure adapter — always the live Insights API (never mock data). */
export function getDashboardDataService(): DashboardDataService {
  if (!singleton) {
    singleton = createHttpDashboardDataService();
  }
  return singleton;
}

export type { DashboardDataService } from "./dashboardDataService";
