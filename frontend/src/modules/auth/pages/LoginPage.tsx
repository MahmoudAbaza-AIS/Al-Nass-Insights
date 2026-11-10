import { useState, type FormEvent } from "react";
import { Button } from "@primereact/ui/button";
import { HospitalLogo } from "@shared/components/HospitalLogo";
import { useAuth } from "../providers/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dash-app-bg flex min-h-screen items-center justify-center overflow-y-auto px-4 py-10 text-[var(--dash-text)] md:h-dvh md:min-h-0 md:overflow-hidden">
      <div className="relative z-[1] w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <HospitalLogo />
          <p className="m-0 max-w-sm text-sm text-[var(--dash-text-muted)]">
            Sign in to open the executive insights dashboards.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[var(--dash-radius-lg)] border border-white/10 bg-[rgba(6,36,48,0.72)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm"
          aria-labelledby="login-heading"
        >
          <h1 id="login-heading" className="mb-5 mt-0 text-xl font-semibold tracking-wide">
            Sign in
          </h1>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--dash-label)]">
              Username
            </span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={128}
              className="w-full rounded-[var(--dash-radius-md)] border border-white/15 bg-[var(--dash-bg-deep)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none transition focus:border-[var(--dash-cyan)] focus:shadow-[0_0_0_3px_rgba(61,231,255,0.18)]"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--dash-label)]">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={256}
              className="w-full rounded-[var(--dash-radius-md)] border border-white/15 bg-[var(--dash-bg-deep)] px-3 py-2.5 text-sm text-[var(--dash-text)] outline-none transition focus:border-[var(--dash-cyan)] focus:shadow-[0_0_0_3px_rgba(61,231,255,0.18)]"
            />
          </label>

          {error ? (
            <p
              className="mb-4 mt-0 rounded-[var(--dash-radius-md)] border border-[rgba(255,90,106,0.35)] bg-[rgba(255,90,106,0.12)] px-3 py-2 text-sm text-[var(--dash-danger)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitting} aria-busy={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          {import.meta.env.DEV ? (
            <p className="mb-0 mt-5 text-center text-xs text-[var(--dash-text-subtle)]">
              Local development: seed user is enabled only when the API has{" "}
              <code className="text-[var(--dash-text-muted)]">Authentication:SeedDemoUser=true</code>.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
