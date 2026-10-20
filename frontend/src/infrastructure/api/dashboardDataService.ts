import type { DashboardPayload, DashboardQuery } from "@contracts/metrics";

export interface DashboardDataService {
  getDashboard(query: DashboardQuery): Promise<DashboardPayload>;
}
