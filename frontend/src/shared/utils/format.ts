const DEFAULT_LOCALE = "en-GB";

export function formatNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
  locale = DEFAULT_LOCALE,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(
  value: number | null | undefined,
  precision = 0,
  locale = DEFAULT_LOCALE,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return `${formatNumber(value, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }, locale)}%`;
}

export function formatDurationMinutes(
  value: number | null | undefined,
  precision = 0,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return `${formatNumber(value, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })} min`;
}

export function formatMetricValue(
  value: number | null | undefined,
  unit: string,
  precision: number,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  if (unit === "%") {
    return formatPercent(value, precision);
  }
  if (unit === "min") {
    return formatDurationMinutes(value, precision);
  }
  const formatted = formatNumber(value, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatClock(
  date: Date,
  timeZone: string,
  locale = DEFAULT_LOCALE,
): { dateLabel: string; timeLabel: string; periodLabel: string } {
  // Figma: "Tuesday March 17, 2026" (no weekday comma)
  const dateLabel = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  })
    .format(date)
    .replace(/^(\w+),/, "$1");

  const parts = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const timeLabel = `${get("hour")}:${get("minute")}:${get("second")}`;
  const periodLabel = get("dayPeriod");

  return { dateLabel, timeLabel, periodLabel };
}

export function formatTimestamp(
  iso: string | null | undefined,
  timeZone: string,
  locale = DEFAULT_LOCALE,
): string {
  if (!iso) {
    return "Not available";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

/** Pad integer for digital counters; null stays unavailable. */
export function toCounterDigits(
  value: number | null | undefined,
  width = 3,
): Array<string | null> {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return Array.from({ length: width }, () => null);
  }
  const abs = Math.max(0, Math.trunc(value));
  const padded = String(abs).padStart(width, "0");
  return padded.slice(-width).split("");
}

export function clampPercent(value: number | null | undefined): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return Math.min(100, Math.max(0, value));
}
