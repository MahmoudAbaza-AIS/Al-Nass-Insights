import type { DistributionSegment } from "./metrics";

/**
 * Stable UI catalog of distribution segments (labels/order from the Figma legends).
 * Copy only — values always come from the API. Used so a chart keeps its Figma structure
 * and legend, with "-" values, when the split has not been published.
 */
export const DISTRIBUTION_DEFINITIONS = {
  application_request: [
    { id: "approved", label: "Approved" },
    { id: "waiting", label: "Waiting" },
    { id: "rejected", label: "Rejected" },
  ],
  opd_appointment: [
    { id: "ontime", label: "On-Time" },
    { id: "noshow", label: "No-Show" },
    { id: "cancel", label: "Cancellation" },
  ],
  call_direction: [
    { id: "inbound", label: "Inbound" },
    { id: "outbound", label: "Outbound" },
  ],
} as const satisfies Record<string, readonly { id: string; label: string }[]>;

export type DistributionKey = keyof typeof DISTRIBUTION_DEFINITIONS;

/** Published segments when present; otherwise the catalog labels with null values. */
export function segmentsOrEmpty(
  distributions: Record<string, DistributionSegment[]>,
  key: DistributionKey,
): DistributionSegment[] {
  const published = distributions[key];
  if (published && published.length > 0) return published;
  return DISTRIBUTION_DEFINITIONS[key].map((d) => ({ id: d.id, label: d.label, value: null, share: null }));
}
