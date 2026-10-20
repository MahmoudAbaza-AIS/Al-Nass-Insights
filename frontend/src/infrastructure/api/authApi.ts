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
    throw await readApiError(response, `Login failed (${response.status})`);
  }

  return (await response.json()) as LoginResponse;
}

export async function fetchCurrentUser(accessToken?: string): Promise<AuthUser> {
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await apiFetch(apiUrl("/auth/me"), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw await readApiError(response, `Session check failed (${response.status})`);
  }

  return (await response.json()) as AuthUser;
}
