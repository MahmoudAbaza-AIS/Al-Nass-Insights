const TOKEN_KEY = "alnass.auth.token";
const EXPIRES_KEY = "alnass.auth.expiresAt";

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

export function getStoredTokenExpiresAt(): string | null {
  try {
    return localStorage.getItem(EXPIRES_KEY);
  } catch {
    return null;
  }
}

export function setStoredTokenExpiresAt(expiresAt: string | null): void {
  try {
    if (expiresAt) localStorage.setItem(EXPIRES_KEY, expiresAt);
    else localStorage.removeItem(EXPIRES_KEY);
  } catch {
    /* ignore */
  }
}

export function clearStoredAuth(): void {
  setStoredAccessToken(null);
  setStoredTokenExpiresAt(null);
}

/** True when a stored expiry exists and is at or before now (30s skew). */
export function isStoredTokenExpired(nowMs: number = Date.now()): boolean {
  const raw = getStoredTokenExpiresAt();
  if (!raw) return false;
  const expires = Date.parse(raw);
  if (Number.isNaN(expires)) return false;
  return expires <= nowMs + 30_000;
}

export type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** fetch wrapper that attaches the JWT and surfaces 401s to the auth layer. */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  // Drop expired tokens without blocking anonymous calls (e.g. login).
  if (isStoredTokenExpired()) {
    clearStoredAuth();
    onUnauthorized?.();
  }

  const token = getStoredAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    clearStoredAuth();
    onUnauthorized?.();
  }
  return response;
}

export async function readApiError(response: Response, fallback: string): Promise<ApiError> {
  let detail = fallback;
  try {
    const body = (await response.json()) as { detail?: string; title?: string };
    detail = body.detail || body.title || fallback;
  } catch {
    /* non-JSON body */
  }
  return new ApiError(response.status, detail);
}
