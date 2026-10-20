import type { DashboardDataService } from "./dashboardDataService";
import { apiUrl } from "./config";
import { apiFetch, readApiError } from "./httpClient";
import type {
  DashboardId,
  DashboardPayload,
  DashboardQuery,
  MetricReading,
} from "@contracts/metrics";

/**
 * HTTP adapter for Insights API (Platform.Docs):
 * GET /api/v1/dashboards/{dashboardId}  where dashboardId is DASH-01..07
 */
interface ApiWidget {
  reviewId: string;
  canonicalKpiId: string;
  displayName: string;
  state: string;
  value: number | null;
  unit: string | null;
  period: string | null;
  dataAsOf: string | null;
  explanation: string | null;
  isPartial: boolean;
}

interface ApiDashboardDetail {
  dashboardId: string;
  name: string;
  businessArea: string;
  dataAsOf: string | null;
  lastSuccessfulRefresh: string | null;
  widgets: ApiWidget[];
}

function mapAvailability(state: string, isPartial: boolean): MetricReading["availability"] {
  const normalized = state.toLowerCase();
  if (isPartial || normalized.includes("partial")) return "partial";
  if (normalized.includes("stale")) return "stale";
  if (normalized.includes("pending")) return "pending-definition";
  if (normalized.includes("unavailable") || normalized.includes("missing")) {
    return "unavailable";
  }
  return "available";
}

function asDashboardId(id: string, fallback: DashboardId): DashboardId {
  if (/^DASH-0[1-7]$/.test(id)) return id as DashboardId;
  return fallback;
}

export function createHttpDashboardDataService(): DashboardDataService {
  return {
    async getDashboard(query: DashboardQuery): Promise<DashboardPayload> {
      const url = apiUrl(`/dashboards/${encodeURIComponent(query.dashboardId)}`);
      const response = await apiFetch(url, {
        method: "GET",
        signal: query.signal,
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required. Please sign in again.");
        }
        if (response.status === 403) {
          throw new Error("You do not have access to this dashboard.");
        }
        throw await readApiError(response, `Dashboard request failed (${response.status})`);
      }
      const api = (await response.json()) as ApiDashboardDetail;
      const metrics: Record<string, MetricReading> = {};

      for (const widget of api.widgets ?? []) {
        const availability = mapAvailability(widget.state, widget.isPartial);
        metrics[widget.canonicalKpiId] = {
          metricId: widget.canonicalKpiId,
          value: availability === "unavailable" ? null : widget.value,
          measuredAt: widget.dataAsOf ?? api.dataAsOf ?? new Date().toISOString(),
          availability,
          supportingText: widget.explanation ?? undefined,
        };
      }

      return {
        dashboardId: asDashboardId(api.dashboardId || query.dashboardId, query.dashboardId),
        title: api.name || query.dashboardId,
        freshness: {
          dataAsOf: api.dataAsOf,
          lastSuccessfulRefresh: api.lastSuccessfulRefresh,
          isStale: (api.widgets ?? []).some((w) => w.state.toLowerCase().includes("stale")),
        },
        metrics,
        distributions: {},
      };
    },
  };
}
