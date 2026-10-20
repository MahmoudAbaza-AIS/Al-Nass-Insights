/**
 * Central frontend API configuration.
 * Values come from Vite env (`VITE_*`) — never put secrets here.
 *
 * Docker / nginx: prefer relative `VITE_API_BASE_URL=/api/v1` (same origin).
 * Vite dev: keep relative URL and use the proxy in vite.config.ts, or set an
 * absolute URL and configure backend `Cors:AllowedOrigins`.
 */

const DEFAULT_API_BASE = "/api/v1";

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) return DEFAULT_API_BASE;
  return raw.replace(/\/$/, "");
}

export function getDashboardPublicUrl(): string | undefined {
  const raw = import.meta.env.VITE_DASHBOARD_PUBLIC_URL?.trim();
  return raw || undefined;
}

/** Join API base with a path segment (path should start with `/`). */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
