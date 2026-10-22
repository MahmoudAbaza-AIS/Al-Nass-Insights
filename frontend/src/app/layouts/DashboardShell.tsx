import { useEffect, useRef, type ReactNode } from "react";
import { DashboardHeader } from "@shared/components/DashboardHeader";
import { DepartmentNavigation } from "@shared/components/DepartmentNavigation";
import { useFullscreen } from "@shared/hooks/useFullscreen";
import type { DashboardNavItem } from "@contracts/navigation";
import type { DashboardId } from "@contracts/metrics";
import {
  useDisplayPreferences,
  useDisplayPreferencesActions,
} from "@shared/providers/useDisplayPreferences";

export interface DashboardShellProps {
  title: string;
  activeId: DashboardId;
  registry: readonly DashboardNavItem[];
  onNavigate: (id: DashboardId) => void;
  lastSuccessfulAt: string | null;
  isStale: boolean;
  isRefreshing: boolean;
  error?: string | null;
  onRefresh: () => void;
  userDisplayName?: string;
  onLogout?: () => void;
  children: ReactNode;
}

/** Removes PrimeUI unlicensed toast (#p-license-host) — closed shadow, so CSS cannot hide it. */
function useStripPrimeLicenseBanner() {
  useEffect(() => {
    const strip = () => document.getElementById("p-license-host")?.remove();
    strip();
    const obs = new MutationObserver(strip);
    obs.observe(document.body, { childList: true });
    return () => obs.disconnect();
  }, []);
}

export function DashboardShell({
  title,
  activeId,
  registry,
  onNavigate,
  lastSuccessfulAt,
  isStale,
  isRefreshing,
  error,
  onRefresh,
  userDisplayName,
  onLogout,
  children,
}: DashboardShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const prefs = useDisplayPreferences();
  const { setPresentationMode } = useDisplayPreferencesActions();
  const { isFullscreen, toggle } = useFullscreen(shellRef);
  useStripPrimeLicenseBanner();

  const presentationMode = prefs.presentationMode || isFullscreen;

  return (
    <div
      ref={shellRef}
      className="dash-app-bg flex h-full min-h-screen flex-col text-[var(--dash-text)] md:min-h-0"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--dash-bg-elevated)] focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>
      <DashboardHeader
        title={title}
        timeZone={prefs.timeZone}
        lastSuccessfulAt={lastSuccessfulAt}
        isStale={isStale}
        isRefreshing={isRefreshing}
        error={error}
        presentationMode={presentationMode}
        onRefresh={onRefresh}
        onToggleFullscreen={() => {
          void toggle().then(() => {
            setPresentationMode(!presentationMode);
          });
        }}
        userDisplayName={userDisplayName}
        onLogout={onLogout}
      />
      <div className="dash-shell-body relative z-[1] flex min-h-0 flex-1">
        <aside className="hidden shrink-0 self-stretch md:block" aria-label="Primary">
          <DepartmentNavigation
            items={registry}
            activeId={activeId}
            onNavigate={onNavigate}
          />
        </aside>
        <div className="absolute inset-x-0 top-0 z-[2] border-b border-white/5 bg-[rgba(8,41,54,0.92)] backdrop-blur-sm md:hidden">
          <DepartmentNavigation
            items={registry}
            activeId={activeId}
            onNavigate={onNavigate}
            compact
          />
        </div>
        <main
          id="main-content"
          className="dash-main min-w-0 flex-1 px-3 pb-4 pt-14 md:overflow-hidden md:px-4 md:pb-3 md:pt-1 lg:px-5 xl:px-6"
        >
          {children}
        </main>
      </div>
      {presentationMode ? (
        <button
          type="button"
          className="fixed bottom-4 right-4 z-50 rounded-md bg-[var(--dash-bg-elevated)] px-3 py-2 text-sm text-[var(--dash-cyan)] ring-1 ring-[var(--dash-cyan)]/50"
          onClick={() => {
            void toggle();
            setPresentationMode(false);
          }}
        >
          Exit presentation
        </button>
      ) : null}
    </div>
  );
}
