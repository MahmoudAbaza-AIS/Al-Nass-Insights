import type { DashboardDataService } from "./dashboardDataService";
import { apiUrl } from "./config";
import { apiFetch, readApiError } from "./httpClient";
import type {
  CapacityReading,
  DashboardId,
  DashboardPayload,
  DashboardQuery,
  DistributionSegment,
  MetricReading,
  TrendPoint,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseApiWidget(raw: unknown): ApiWidget | null {
  if (!isRecord(raw)) return null;
  const canonicalKpiId = asString(raw.canonicalKpiId);
  const state = asString(raw.state);
  if (!canonicalKpiId || !state) return null;
  return {
    reviewId: asString(raw.reviewId) ?? "",
    canonicalKpiId,
    displayName: asString(raw.displayName) ?? canonicalKpiId,
    state,
    value: asNullableNumber(raw.value),
    unit: asString(raw.unit),
    period: asString(raw.period),
    dataAsOf: asString(raw.dataAsOf),
    explanation: asString(raw.explanation),
    isPartial: Boolean(raw.isPartial),
  };
}

function parseApiDashboardDetail(raw: unknown): ApiDashboardDetail | null {
  if (!isRecord(raw)) return null;
  const widgetsRaw = Array.isArray(raw.widgets) ? raw.widgets : [];
  const widgets = widgetsRaw.map(parseApiWidget).filter((w): w is ApiWidget => w !== null);
  return {
    dashboardId: asString(raw.dashboardId) ?? "",
    name: asString(raw.name) ?? "",
    businessArea: asString(raw.businessArea) ?? "",
    dataAsOf: asString(raw.dataAsOf),
    lastSuccessfulRefresh: asString(raw.lastSuccessfulRefresh),
    widgets,
  };
}

function mapAvailability(state: string, isPartial: boolean): MetricReading["availability"] {
  const normalized = state.toLowerCase();
  if (isPartial || normalized.includes("partial")) return "partial";
  if (normalized.includes("stale")) return "stale";
  if (normalized.includes("pending")) return "pending-definition";
  if (normalized.includes("unavailable") || normalized.includes("missing") || normalized.includes("mapping")) {
    return "unavailable";
  }
  return "available";
}

function asDashboardId(id: string, fallback: DashboardId): DashboardId {
  if (/^DASH-0[1-7]$/.test(id)) return id as DashboardId;
  return fallback;
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

/** Parse `Key=123` pairs from Oracle explanation text into a map. */
export function parseExplanationPairs(explanation: string | null | undefined): Record<string, number> {
  if (!explanation) return {};
  const result: Record<string, number> = {};
  for (const match of explanation.matchAll(/([A-Za-z][A-Za-z0-9_]*)\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    result[match[1]] = Number(match[2]);
  }
  return result;
}

function segmentsFromPairs(
  pairs: Record<string, number>,
  keys: { id: string; label: string; key: string }[],
): DistributionSegment[] {
  const values = keys.map((k) => ({ ...k, value: pairs[k.key] ?? null }));
  const total = values.reduce((sum, v) => sum + (v.value ?? 0), 0);
  return values.map((v) => ({
    id: v.id,
    label: v.label,
    value: v.value,
    share: v.value === null || total <= 0 ? null : v.value / total,
  }));
}

/**
 * Enrich UI-oriented distributions / capacity from widget explanations.
 * Backend currently publishes scalar widgets; split KPIs encode counts in explanation text.
 */
export function enrichPayloadFromWidgets(
  widgets: ApiWidget[],
  metrics: Record<string, MetricReading>,
): Pick<DashboardPayload, "distributions" | "series" | "capacity" | "orRooms"> {
  const distributions: Record<string, DistributionSegment[]> = {};
  const series: Record<string, TrendPoint[]> = {};

  const appPairs = parseExplanationPairs(
    widgets.find((w) => w.canonicalKpiId === "application_request.outcome_split")?.explanation,
  );
  if (Object.keys(appPairs).length > 0) {
    distributions.application_request = segmentsFromPairs(appPairs, [
      { id: "approved", label: "Approved", key: "Approved" },
      { id: "waiting", label: "Waiting", key: "Waiting" },
      { id: "rejected", label: "Rejected", key: "Rejected" },
    ]);
  }

  const opdPairs = parseExplanationPairs(
    widgets.find((w) => w.canonicalKpiId === "opd.appointment_performance")?.explanation,
  );
  if (Object.keys(opdPairs).length > 0) {
    distributions.opd_appointment = segmentsFromPairs(opdPairs, [
      { id: "ontime", label: "On-Time", key: "OnTime" },
      { id: "noshow", label: "No-Show", key: "NoShow" },
      { id: "cancel", label: "Cancellation", key: "Cancellation" },
    ]);
  }

  const callPairs = parseExplanationPairs(
    widgets.find((w) => w.canonicalKpiId === "callcenter.inbound_outbound_share")?.explanation,
  );
  if (Object.keys(callPairs).length > 0) {
    distributions.call_direction = segmentsFromPairs(callPairs, [
      { id: "inbound", label: "Inbound", key: "Inbound" },
      { id: "outbound", label: "Outbound", key: "Outbound" },
    ]);
  }

  let capacity: CapacityReading | undefined;
  const bedWidget = widgets.find((w) => w.canonicalKpiId === "inpatient.bed_capacity");
  if (bedWidget) {
    const pairs = parseExplanationPairs(bedWidget.explanation);
    const used = pairs.Used ?? pairs.used ?? null;
    const available = pairs.Available ?? pairs.available ?? null;
    if (used !== null || available !== null) {
      capacity = {
        used,
        available,
        unit: bedWidget.unit ?? "beds",
        measuredAt: bedWidget.dataAsOf ?? new Date().toISOString(),
        availability: mapAvailability(bedWidget.state, bedWidget.isPartial),
      };
    }
  }

  // Series widgets remain unavailable until the API publishes time-series payloads.
  void metrics;
  void series;

  return {
    distributions,
    series: Object.keys(series).length > 0 ? series : undefined,
    capacity,
    orRooms: undefined,
  };
}

function buildDashboardUrl(query: DashboardQuery): string {
  const params = new URLSearchParams();
  if (query.facilityId) params.set("facility", query.facilityId);
  if (query.period) params.set("period", query.period);
  const qs = params.toString();
  const path = `/dashboards/${encodeURIComponent(query.dashboardId)}`;
  return apiUrl(qs ? `${path}?${qs}` : path);
}

export function createHttpDashboardDataService(): DashboardDataService {
  return {
    async getDashboard(query: DashboardQuery): Promise<DashboardPayload> {
      const response = await apiFetch(buildDashboardUrl(query), {
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

      let json: unknown;
      try {
        json = await response.json();
      } catch {
        throw new Error("Dashboard response was not valid JSON.");
      }

      const api = parseApiDashboardDetail(json);
      if (!api) {
        throw new Error("Dashboard response shape was not recognized.");
      }

      const metrics: Record<string, MetricReading> = {};
      for (const widget of api.widgets) {
        const availability = mapAvailability(widget.state, widget.isPartial);
        metrics[widget.canonicalKpiId] = {
          metricId: widget.canonicalKpiId,
          value: availability === "unavailable" ? null : widget.value,
          measuredAt: widget.dataAsOf ?? api.dataAsOf ?? new Date().toISOString(),
          availability,
          supportingText: widget.explanation ?? undefined,
        };
      }

      const enriched = enrichPayloadFromWidgets(api.widgets, metrics);

      return {
        dashboardId: asDashboardId(api.dashboardId || query.dashboardId, query.dashboardId),
        title: api.name || query.dashboardId,
        freshness: {
          dataAsOf: api.dataAsOf,
          lastSuccessfulRefresh: api.lastSuccessfulRefresh,
          isStale: api.widgets.some((w) => w.state.toLowerCase().includes("stale")),
        },
        metrics,
        ...enriched,
      };
    },
  };
}

export { isAbortError };
