import type { DashboardModule } from "@contracts/navigation";

/** DASH-03 — Operating Room Performance */
export const operatingRoomModule: DashboardModule = {
  nav: {
    id: "DASH-03",
    title: "Operating Room Performance",
    shortTitle: "OR",
    path: "/operating-room",
    description: "Operating room utilization and outcomes",
    icon: "or",
  },
  loadView: () =>
    import("./OperatingRoomDashboard").then((m) => ({ default: m.OperatingRoomDashboard })),
};
