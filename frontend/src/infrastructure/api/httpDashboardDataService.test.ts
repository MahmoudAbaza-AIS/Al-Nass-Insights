import { describe, expect, it } from "vitest";
import { enrichPayloadFromWidgets, parseExplanationPairs } from "./httpDashboardDataService";

describe("parseExplanationPairs", () => {
  it("parses Approved/Rejected/Waiting counts from Oracle explanation text", () => {
    const pairs = parseExplanationPairs(
      "Approved=12; Rejected=3; Waiting=5; UnmappedStatusCount=2. Denominator classification requires hospital agreement.",
    );
    expect(pairs).toEqual({
      Approved: 12,
      Rejected: 3,
      Waiting: 5,
      UnmappedStatusCount: 2,
    });
  });

  it("returns empty object for missing explanation", () => {
    expect(parseExplanationPairs(null)).toEqual({});
    expect(parseExplanationPairs(undefined)).toEqual({});
  });
});

describe("enrichPayloadFromWidgets", () => {
  it("builds application_request distribution segments from explanation pairs", () => {
    const enriched = enrichPayloadFromWidgets(
      [
        {
          reviewId: "O-03",
          canonicalKpiId: "application_request.outcome_split",
          displayName: "Application Request",
          state: "Fresh",
          value: 20,
          unit: "count",
          period: "AllTime",
          dataAsOf: "2026-10-21T00:00:00Z",
          explanation: "Approved=10; Rejected=4; Waiting=6; UnmappedStatusCount=0",
          isPartial: false,
        },
      ],
      {},
    );

    expect(enriched.distributions.application_request).toEqual([
      { id: "approved", label: "Approved", value: 10, share: 0.5 },
      { id: "waiting", label: "Waiting", value: 6, share: 0.3 },
      { id: "rejected", label: "Rejected", value: 4, share: 0.2 },
    ]);
  });

  it("maps bed capacity when Used/Available pairs are present", () => {
    const enriched = enrichPayloadFromWidgets(
      [
        {
          reviewId: "I-05",
          canonicalKpiId: "inpatient.bed_capacity",
          displayName: "Bed Capacity",
          state: "Fresh",
          value: null,
          unit: "beds",
          period: null,
          dataAsOf: "2026-10-21T00:00:00Z",
          explanation: "Used=80; Available=20",
          isPartial: false,
        },
      ],
      {},
    );

    expect(enriched.capacity).toMatchObject({
      used: 80,
      available: 20,
      unit: "beds",
      availability: "available",
    });
  });
});
