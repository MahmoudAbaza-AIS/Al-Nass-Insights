import { Button } from "@primereact/ui/button";
import { Tooltip } from "@primereact/ui/tooltip";
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

const tooltipPopupClassName =
  "rounded-md bg-[#0a3340] px-2 py-1 text-xs text-[var(--dash-text)] shadow-lg ring-1 ring-white/10";

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
  const presentationLabel = presentationMode ? "Exit presentation" : "Presentation";
  const presentationAriaLabel = presentationMode
    ? "Exit presentation mode"
    : "Enter presentation mode";

  return (
    <header className="relative z-[2] shrink-0 px-3 pt-2 pb-1 md:px-5 md:pt-2 lg:px-6">
      <div className="grid grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1.1fr)] items-start gap-2 md:gap-3">
        <div className="justify-self-start">
          <HospitalLogo />
          <div className="mt-0.5 ps-0.5 md:mt-1">
            <DataFreshnessIndicator
              lastSuccessfulAt={lastSuccessfulAt}
              isStale={isStale}
              isRefreshing={isRefreshing}
              timeZone={timeZone}
              error={error}
            />
          </div>
        </div>

        <h1 className="m-0 self-center text-center font-medium tracking-wide text-[length:var(--dash-fs-title)] text-white">
          {title}
        </h1>

        <div className="flex flex-wrap items-center justify-end gap-3 justify-self-end self-center">
          <LiveClock timeZone={timeZone} />
          <div className="flex items-center gap-1">
            {userDisplayName ? (
              <span
                className="mr-1 hidden max-w-[7rem] truncate text-xs text-[var(--dash-text-muted)] xl:inline"
                title={userDisplayName}
              >
                {userDisplayName}
              </span>
            ) : null}
            <Tooltip.Root>
              <Tooltip.Trigger
                as={Button}
                type="button"
                severity="secondary"
                size="small"
                iconOnly
                onClick={onRefresh}
                aria-label="Refresh dashboard data"
                disabled={isRefreshing}
              >
                <i className="pi pi-refresh" aria-hidden="true" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="bottom">
                  <Tooltip.Popup className={tooltipPopupClassName}>Refresh</Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root>
              <Tooltip.Trigger
                as={Button}
                type="button"
                severity="secondary"
                size="small"
                iconOnly
                onClick={onToggleFullscreen}
                aria-label={presentationAriaLabel}
              >
                <i className="pi pi-desktop" aria-hidden="true" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="bottom">
                  <Tooltip.Popup className={tooltipPopupClassName}>{presentationLabel}</Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
            {onLogout ? (
              <Tooltip.Root>
                <Tooltip.Trigger
                  as={Button}
                  type="button"
                  severity="secondary"
                  size="small"
                  iconOnly
                  onClick={onLogout}
                  aria-label="Sign out"
                >
                  <i className="pi pi-sign-out" aria-hidden="true" />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Positioner side="bottom">
                    <Tooltip.Popup className={tooltipPopupClassName}>Sign out</Tooltip.Popup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
