const TOKEN_KEY = "alnass.auth.token";

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

  const token = getStoredAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
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
