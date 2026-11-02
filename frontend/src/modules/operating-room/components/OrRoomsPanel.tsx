import type { OrRoomStatus } from "@contracts/metrics";
import { StatusLegend } from "@shared/components/StatusLegend";
import { EMPTY_VALUE } from "@shared/utils/format";

interface OrRoomsPanelProps {
  rooms: OrRoomStatus | undefined;
}

/**
 * Figma `Frame 2611203`: "Total ORs" count, one dot per room (green active / grey idle), legend.
 * Until room status is published the count shows "-" and no dots are drawn.
 */
export function OrRoomsPanel({ rooms }: OrRoomsPanelProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-[calc(var(--dash-gap)*3)] gap-y-2" role="group" aria-label="Operating room status">
      <div className="flex flex-col gap-[0.2em]">
        <span className="text-[length:var(--dash-fs-label)] text-[var(--dash-section-title)]">Total ORs</span>
        <span className="text-[length:var(--dash-fs-unit)] font-bold leading-none text-[var(--dash-cyan)]">
          {rooms ? rooms.total : <span className="opacity-60">{EMPTY_VALUE}</span>}
        </span>
      </div>
      {rooms ? (
        <div className="flex flex-wrap justify-center gap-[0.55em]" role="img" aria-label={`${rooms.active} active, ${rooms.idle} idle`}>
          {Array.from({ length: rooms.total }).map((_, i) => (
            <span
              key={i}
              className={`size-[max(0.75rem,calc(0.75*var(--u,1rem)))] rounded-full ${
                i < rooms.active ? "bg-[#4ee07a] shadow-[0_0_8px_#4ee07a]" : "bg-white/55"
              }`}
            />
          ))}
        </div>
      ) : (
        <span className="text-[length:var(--dash-fs-xs)] text-[var(--dash-text-subtle)]" role="status">
          Room status not published
        </span>
      )}
      <StatusLegend
        direction="column"
        items={[
          { color: "#4ee07a", label: "Active ORs" },
          { color: "rgba(255,255,255,0.55)", label: "Idle ORs" },
        ]}
      />
    </div>
  );
}
