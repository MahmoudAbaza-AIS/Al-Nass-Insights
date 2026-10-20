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

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1").replace(/\/$/, "");
}

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${apiBase()}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid username or password.");
    }
    throw new Error(`Login failed (${response.status})`);
  }

  return (await response.json()) as LoginResponse;
}

export async function fetchCurrentUser(accessToken: string): Promise<AuthUser> {
  const response = await fetch(`${apiBase()}/auth/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Session check failed (${response.status})`);
  }

  return (await response.json()) as AuthUser;
}
