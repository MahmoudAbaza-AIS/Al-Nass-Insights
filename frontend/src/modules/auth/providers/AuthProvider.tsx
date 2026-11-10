import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCurrentUser,
  loginRequest,
  type AuthUser,
} from "@infrastructure/api/authApi";
import {
  clearStoredAuth,
  getStoredAccessToken,
  isStoredTokenExpired,
  setStoredAccessToken,
  setStoredTokenExpiresAt,
  setUnauthorizedHandler,
} from "@infrastructure/api/httpClient";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredAuth();
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    const controller = new AbortController();

    async function restore() {
      const token = getStoredAccessToken();
      if (!token || isStoredTokenExpired()) {
        clearStoredAuth();
        if (!controller.signal.aborted) {
          setAccessToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await fetchCurrentUser(token, controller.signal);
        if (!controller.signal.aborted) {
          setAccessToken(token);
          setUser(me);
        }
      } catch {
        if (!controller.signal.aborted) {
          clearStoredAuth();
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void restore();
    return () => controller.abort();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    setStoredAccessToken(result.accessToken);
    setStoredTokenExpiresAt(result.expiresAt);
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const value = useMemo(
    () => ({ user, accessToken, isLoading, login, logout }),
    [user, accessToken, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
