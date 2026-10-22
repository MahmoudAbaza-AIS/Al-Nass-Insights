import { apiUrl } from "./config";
import { apiFetch, readApiError } from "./httpClient";

export interface AuthUser {
  userId: string;
  username: string;
  displayName: string;
  email: string | null;
  organization: string;
  roles: string[];
  dashboards: string[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: AuthUser;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function parseAuthUser(raw: unknown): AuthUser | null {
  if (!isRecord(raw)) return null;
  const username = asString(raw.username);
  const displayName = asString(raw.displayName);
  const organization = asString(raw.organization);
  if (!username || !displayName || !organization) return null;
  return {
    userId: asString(raw.userId) ?? "",
    username,
    displayName,
    email: asString(raw.email),
    organization,
    roles: asStringArray(raw.roles),
    dashboards: asStringArray(raw.dashboards),
  };
}

export function parseLoginResponse(raw: unknown): LoginResponse | null {
  if (!isRecord(raw)) return null;
  const accessToken = asString(raw.accessToken);
  const tokenType = asString(raw.tokenType) ?? "Bearer";
  const expiresAt = asString(raw.expiresAt);
  const user = parseAuthUser(raw.user);
  if (!accessToken || !expiresAt || !user) return null;
  return { accessToken, tokenType, expiresAt, user };
}

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  const response = await apiFetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid username or password.");
    }
    if (response.status === 429) {
      throw new Error("Too many sign-in attempts. Please wait and try again.");
    }
    throw await readApiError(response, `Login failed (${response.status})`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error("Login response was not valid JSON.");
  }

  const parsed = parseLoginResponse(json);
  if (!parsed) {
    throw new Error("Login response shape was not recognized.");
  }
  return parsed;
}

export async function fetchCurrentUser(
  accessToken?: string,
  signal?: AbortSignal,
): Promise<AuthUser> {
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await apiFetch(apiUrl("/auth/me"), {
    method: "GET",
    headers,
    signal,
  });

  if (!response.ok) {
    throw await readApiError(response, `Session check failed (${response.status})`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error("Session response was not valid JSON.");
  }

  const user = parseAuthUser(json);
  if (!user) {
    throw new Error("Session response shape was not recognized.");
  }
  return user;
}
