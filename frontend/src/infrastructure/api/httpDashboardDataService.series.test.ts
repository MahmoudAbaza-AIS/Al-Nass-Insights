import { describe, expect, it } from "vitest";
import { enrichPayloadFromWidgets } from "./httpDashboardDataService";

describe("enrichPayloadFromWidgets series / OR rooms", () => {
  it("does not invent trend series or OR room status when the API only publishes scalars", () => {
    const enriched = enrichPayloadFromWidgets(
      [
        {
          reviewId: "C-01",
          canonicalKpiId: "callcenter.volume_total",
          displayName: "Volume",
          state: "Available",
          value: 100,
          unit: null,
          period: null,
          dataAsOf: "2026-10-21T00:00:00Z",
          explanation: null,
          isPartial: false,
        },
        {
          reviewId: "OR-01",
          canonicalKpiId: "or.utilization_rate",
          displayName: "Utilization",
          state: "Available",
          value: 70,
          unit: "%",
          period: null,
          dataAsOf: "2026-10-21T00:00:00Z",
          explanation: null,
          isPartial: false,
        },
      ],
      {},
    );

    expect(enriched.series).toBeUndefined();
    expect(enriched.orRooms).toBeUndefined();
  });
});
