import type { DashboardModule } from "@contracts/navigation";

/** DASH-04 — Call Center Performance */
export const callCenterModule: DashboardModule = {
  nav: {
    id: "DASH-04",
    title: "Call Center Performance",
    shortTitle: "Call Center",
    path: "/call-center",
    description: "Contact center volume and service levels",
    icon: "call",
  },
  loadView: () =>
    import("./CallCenterDashboard").then((m) => ({ default: m.CallCenterDashboard })),
};
