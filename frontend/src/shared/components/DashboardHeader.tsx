import { Button } from "@primereact/ui/button";
import { HospitalLogo } from "./HospitalLogo";
import { LiveClock } from "./LiveClock";
import { DataFreshnessIndicator } from "./DataFreshnessIndicator";

export interface DashboardHeaderProps {
  title: string;
  timeZone: string;
  lastSuccessfulAt: string | null;
  isStale: boolean;
  isRefreshing: boolean;
  error?: string | null;
  presentationMode: boolean;
  onRefresh: () => void;
  onToggleFullscreen: () => void;
  userDisplayName?: string;
  onLogout?: () => void;
}

export function DashboardHeader({
  title,
  timeZone,
  lastSuccessfulAt,
  isStale,
  isRefreshing,
  error,
  presentationMode,
  onRefresh,
  onToggleFullscreen,
  userDisplayName,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="relative z-[2] flex min-h-[var(--dash-header-height)] flex-col gap-2 border-b border-white/5 px-4 py-3 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HospitalLogo />
        <h1 className="m-0 text-center text-lg font-semibold tracking-wide text-[var(--dash-text)] md:text-xl">
          {title}
        </h1>
        <LiveClock timeZone={timeZone} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DataFreshnessIndicator
          lastSuccessfulAt={lastSuccessfulAt}
          isStale={isStale}
          isRefreshing={isRefreshing}
          timeZone={timeZone}
          error={error}
        />
        <div className="flex flex-wrap items-center gap-2">
          {userDisplayName ? (
            <span className="mr-1 text-xs text-[var(--dash-text-muted)]" title={userDisplayName}>
              {userDisplayName}
            </span>
          ) : null}
          <Button
            type="button"
            severity="secondary"
            size="small"
            onClick={onRefresh}
            aria-label="Refresh dashboard data"
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          <Button
            type="button"
            severity="secondary"
            size="small"
            onClick={onToggleFullscreen}
            aria-label={presentationMode ? "Exit presentation mode" : "Enter presentation mode"}
          >
            {presentationMode ? "Exit presentation" : "Presentation"}
          </Button>
          {onLogout ? (
            <Button
              type="button"
              severity="secondary"
              size="small"
              onClick={onLogout}
              aria-label="Sign out"
            >
              Sign out
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
