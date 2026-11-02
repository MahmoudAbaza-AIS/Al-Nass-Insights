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
    <header className="dash-header relative z-[2] shrink-0 px-[var(--dash-page-pad)] py-2 lg:flex lg:h-[var(--dash-header-height)] lg:items-center lg:px-0 lg:py-0">
      <span className="dash-header__accent dash-header__accent--start hidden lg:block" aria-hidden />
      <span className="dash-header__accent dash-header__accent--end hidden lg:block" aria-hidden />
      <div className="dash-header__inner relative grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 lg:flex lg:items-center lg:justify-between">
        <div className="col-start-1 row-start-1 justify-self-start">
          <HospitalLogo />
        </div>

        {/* Figma: title centred on the full frame width, independent of the side groups. */}
        <h1 className="col-span-2 row-start-2 m-0 text-balance text-center text-[length:var(--dash-fs-title)] font-medium text-white lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-1/2 lg:-translate-y-1/2">
          {title}
        </h1>

        <div className="col-start-2 row-start-1 flex flex-col items-end gap-[0.2em] justify-self-end lg:relative">
          <LiveClock timeZone={timeZone} />
          {/*
           * App controls and data freshness (docs BR-018) sit on a quiet line under the Figma clock;
           * on desktop it hangs below so the clock keeps its vertically centred Figma position.
           */}
          <div className="flex max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-0.5 lg:absolute lg:right-0 lg:top-full lg:mt-[0.15em] lg:w-max lg:max-w-none lg:flex-nowrap lg:whitespace-nowrap">
            {userDisplayName ? (
              <span
                className="max-w-[12rem] truncate text-[length:var(--dash-fs-xs)] text-[var(--dash-label)] sm:max-w-[16rem]"
                title={userDisplayName}
              >
                {userDisplayName}
              </span>
            ) : null}
            <DataFreshnessIndicator
              lastSuccessfulAt={lastSuccessfulAt}
              isStale={isStale}
              isRefreshing={isRefreshing}
              timeZone={timeZone}
              error={error}
            />
            <div className="flex items-center">
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
                  tooltip="Sign out"
                  onClick={onLogout}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
