/** Shared contracts — modules and infrastructure may depend on this package only for data shapes. */

export type MetricKind = "count" | "percentage" | "duration" | "ratio" | "score";

export type MetricDirection = "higher-is-better" | "lower-is-better" | "target-range";

export type DataAvailability =
  | "available"
  | "unavailable"
  | "partial"
  | "pending-definition"
  | "stale";

export type MetricStatusTone = "neutral" | "good" | "watch" | "critical" | "info";

export interface MetricThresholds {
  goodMax?: number;
  goodMin?: number;
  watchMax?: number;
  watchMin?: number;
  criticalMax?: number;
  criticalMin?: number;
  note?: string;
}

export interface MetricDefinition {
  id: string;
  label: string;
  unit: string;
  precision: number;
  kind: MetricKind;
  description: string;
  reportingPeriod: string;
  numeratorDescription?: string;
  denominatorDescription?: string;
  direction: MetricDirection;
  thresholds?: MetricThresholds;
  source?: string;
}

export interface TrendPoint {
  label: string;
  value: number | null;
}

export interface MetricReading {
  metricId: string;
  value: number | null;
  measuredAt: string;
  comparisonValue?: number | null;
  trend?: TrendPoint[];
  availability: DataAvailability;
  statusTone?: MetricStatusTone;
  statusLabel?: string;
  supportingText?: string;
}

export interface DistributionSegment {
  id: string;
  label: string;
  value: number | null;
  share: number | null;
  tone?: MetricStatusTone;
}

export interface CapacityReading {
  used: number | null;
  available: number | null;
  unit: string;
  measuredAt: string;
  availability: DataAvailability;
}

export interface OrRoomStatus {
  total: number;
  active: number;
  idle: number;
}

/** Canonical dashboard module ids from Platform.Docs (DASH-01..07). */
export type DashboardId =
  | "DASH-01"
  | "DASH-02"
  | "DASH-03"
  | "DASH-04"
  | "DASH-05"
  | "DASH-06"
  | "DASH-07";

export interface DashboardFreshness {
  dataAsOf: string | null;
  lastSuccessfulRefresh: string | null;
  isStale: boolean;
  staleReason?: string;
}

export interface DashboardPayload {
  dashboardId: DashboardId;
  title: string;
  freshness: DashboardFreshness;
  metrics: Record<string, MetricReading>;
  distributions: Record<string, DistributionSegment[]>;
  capacity?: CapacityReading;
  orRooms?: OrRoomStatus;
  series?: Record<string, TrendPoint[]>;
}

export type LoadState = "idle" | "loading" | "success" | "empty" | "error";

export interface DashboardQuery {
  dashboardId: DashboardId;
  facilityId?: string;
  period?: string;
  signal?: AbortSignal;
}
