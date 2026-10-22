import type { DashboardModule } from "@contracts/navigation";

/** DASH-06 — Emergency Performance */
export const emergencyModule: DashboardModule = {
  nav: {
    id: "DASH-06",
    title: "Emergency Performance",
    shortTitle: "Emergency",
    path: "/emergency",
    description: "Emergency department flow and acuity",
    icon: "emergency",
  },
  loadView: () =>
    import("./pages/EmergencyDashboard").then((m) => ({ default: m.EmergencyDashboard })),
};
