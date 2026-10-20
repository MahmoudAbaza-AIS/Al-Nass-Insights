import type { MetricDefinition, MetricReading, MetricStatusTone } from "@contracts/metrics";

/**
 * Prefer explicit status from the reading. Never invent clinical thresholds.
 * Numeric color mapping is only applied when approved thresholds exist on the definition.
 */
export function resolveStatusTone(
  definition: MetricDefinition | undefined,
  reading: MetricReading | undefined,
): MetricStatusTone {
  if (reading?.statusTone) {
    return reading.statusTone;
  }
  if (!definition || reading?.value === null || reading?.value === undefined) {
    return "neutral";
  }
  const t = definition.thresholds;
  if (!t) {
    return "neutral";
  }
  const v = reading.value;
  if (t.criticalMax !== undefined && v >= t.criticalMax) return "critical";
  if (t.criticalMin !== undefined && v <= t.criticalMin) return "critical";
  if (t.watchMax !== undefined && v >= t.watchMax) return "watch";
  if (t.watchMin !== undefined && v <= t.watchMin) return "watch";
  if (t.goodMin !== undefined && v >= t.goodMin) return "good";
  if (t.goodMax !== undefined && v <= t.goodMax) return "good";
  return "neutral";
}

export function statusToneClass(tone: MetricStatusTone): string {
  switch (tone) {
    case "good":
      return "text-[var(--dash-success)]";
    case "watch":
      return "text-[var(--dash-warning)]";
    case "critical":
      return "text-[var(--dash-danger)]";
    case "info":
      return "text-[var(--dash-cyan)]";
    default:
      return "text-[var(--dash-cyan)]";
  }
}

export function availabilityLabel(availability: MetricReading["availability"] | undefined): string {
  switch (availability) {
    case "unavailable":
      return "Unavailable";
    case "partial":
      return "Partial data";
    case "pending-definition":
      return "Pending definition";
    case "stale":
      return "Stale";
    case "available":
      return "Available";
    default:
      return "Unknown";
  }
}
