import type { OrRoomStatus } from "@contracts/metrics";
import { StatusLegend } from "@shared/components/StatusLegend";

interface OrRoomsPanelProps {
  rooms: OrRoomStatus | undefined;
}

/** Figma: "Total ORs" + dots sit directly under the OR illustration. */
export function OrRoomsPanel({ rooms }: OrRoomsPanelProps) {
  if (!rooms) {
    return (
      <p className="m-0 text-center text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
        OR room status unavailable
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[length:var(--dash-fs-md)] font-medium text-white">Total ORs</span>
        <span className="text-3xl font-bold text-[var(--dash-cyan)]">{rooms.total}</span>
      </div>
      <div
        className="flex flex-wrap justify-center gap-2"
        aria-label={`${rooms.active} active, ${rooms.idle} idle`}
      >
        {Array.from({ length: rooms.total }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full ${
              i < rooms.active
                ? "bg-[var(--dash-success)] shadow-[0_0_8px_var(--dash-success)]"
                : "bg-white/25"
            }`}
          />
        ))}
      </div>
      <StatusLegend
        items={[
          { color: "var(--dash-success)", label: "Active ORs" },
          { color: "rgba(255,255,255,0.25)", label: "Idle ORs" },
        ]}
      />
    </div>
  );
}
