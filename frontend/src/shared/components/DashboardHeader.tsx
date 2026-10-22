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

function HeaderAction({
  icon,
  label,
  tooltip,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        as="button"
        type="button"
        className="dash-icon-btn"
        onClick={onClick}
        aria-label={label}
        disabled={disabled}
      >
        <i className={`pi ${icon}`} aria-hidden="true" />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="bottom">
          <Tooltip.Popup className={tooltipPopupClassName}>{tooltip}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
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
    <header className="dash-header relative z-[2] shrink-0 px-[var(--dash-page-pad)] py-2 lg:flex lg:h-[var(--dash-header-height)] lg:items-center lg:py-0">
      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="col-start-1 row-start-1 justify-self-start">
          <HospitalLogo />
        </div>

        <h1 className="col-span-2 row-start-2 m-0 text-balance text-center text-[length:var(--dash-fs-title)] font-medium tracking-wide text-white lg:col-span-1 lg:col-start-2 lg:row-start-1">
          {title}
        </h1>

        <div className="col-start-2 row-start-1 flex flex-col items-end gap-[0.15em] justify-self-end lg:col-start-3">
          <div className="flex items-center gap-[0.75em]">
            <LiveClock timeZone={timeZone} />
            <div className="flex items-center gap-[0.15em]">
              <HeaderAction
                icon="pi-refresh"
                label="Refresh dashboard data"
                tooltip="Refresh"
                onClick={onRefresh}
                disabled={isRefreshing}
              />
              <HeaderAction
                icon="pi-desktop"
                label={presentationMode ? "Exit presentation mode" : "Enter presentation mode"}
                tooltip={presentationMode ? "Exit presentation" : "Presentation"}
                onClick={onToggleFullscreen}
              />
              {onLogout ? (
                <HeaderAction
                  icon="pi-sign-out"
                  label="Sign out"
                  tooltip={userDisplayName ? `Sign out (${userDisplayName})` : "Sign out"}
                  onClick={onLogout}
                />
              ) : null}
            </div>
          </div>
          <DataFreshnessIndicator
            lastSuccessfulAt={lastSuccessfulAt}
            isStale={isStale}
            isRefreshing={isRefreshing}
            timeZone={timeZone}
            error={error}
          />
        </div>
      </div>
    </header>
  );
}
