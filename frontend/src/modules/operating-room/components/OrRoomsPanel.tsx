import type { OrRoomStatus } from "@contracts/metrics";
import { StatusLegend } from "@shared/components/StatusLegend";

interface OrRoomsPanelProps {
  rooms: OrRoomStatus | undefined;
}

/** Figma: "Total ORs" count, one dot per room, active/idle legend — under the OR illustration. */
export function OrRoomsPanel({ rooms }: OrRoomsPanelProps) {
  if (!rooms) {
    return (
      <p className="m-0 text-center text-[length:var(--dash-fs-label)] text-[var(--dash-text-subtle)]" role="status">
        OR room status not published yet
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-[calc(var(--dash-gap)*2)] gap-y-2">
      <div className="flex flex-col">
        <span className="text-[length:var(--dash-fs-label)] text-[var(--dash-label)]">Total ORs</span>
        <span className="text-[length:var(--dash-fs-value)] font-semibold leading-none text-[var(--dash-cyan)]">
          {rooms.total}
        </span>
      </div>
      <div
        className="flex flex-wrap justify-center gap-[0.5em]"
        role="img"
        aria-label={`${rooms.active} active, ${rooms.idle} idle`}
      >
        {Array.from({ length: rooms.total }).map((_, i) => (
          <span
            key={i}
            className={`size-[max(0.75rem,calc(0.8*var(--u,1rem)))] rounded-full ${
              i < rooms.active ? "bg-[var(--dash-success)] shadow-[0_0_8px_var(--dash-success)]" : "bg-white/40"
            }`}
          />
        ))}
      </div>
      <StatusLegend
        direction="column"
        items={[
          { color: "var(--dash-success)", label: "Active ORs" },
          { color: "rgba(255,255,255,0.4)", label: "Idle ORs" },
        ]}
      />
    </div>
  );
}
