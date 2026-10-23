import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIME_ZONE,
  formatClock,
  formatTimestamp,
  resolveTimeZone,
} from "./format";

describe("resolveTimeZone", () => {
  it("keeps a valid IANA zone", () => {
    expect(resolveTimeZone("Asia/Riyadh")).toBe("Asia/Riyadh");
  });

  it("falls back for invalid or empty zones so Intl never throws at render", () => {
    expect(resolveTimeZone("Not/AZone")).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone("")).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone(undefined)).toBe(DEFAULT_TIME_ZONE);
  });
});

describe("formatClock / formatTimestamp", () => {
  it("does not throw when given an invalid time zone", () => {
    const date = new Date("2026-10-21T12:00:00Z");
    expect(() => formatClock(date, "Invalid/Zone")).not.toThrow();
    expect(() => formatTimestamp(date.toISOString(), "Invalid/Zone")).not.toThrow();
    const clock = formatClock(date, "Invalid/Zone");
    expect(clock.timeLabel).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    expect(formatTimestamp(date.toISOString(), "Invalid/Zone")).not.toBe("Not available");
  });
});
