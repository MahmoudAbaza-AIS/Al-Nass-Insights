import type { DashboardModule } from "@contracts/navigation";

/** DASH-01 — Hospital Overview */
export const hospitalOverviewModule: DashboardModule = {
  nav: {
    id: "DASH-01",
    title: "Hospital Overview",
    shortTitle: "Overview",
    path: "/overview",
    description: "Hospital-wide executive snapshot",
    icon: "overview",
  },
  loadView: () =>
    import("./OverviewDashboard").then((m) => ({ default: m.OverviewDashboard })),
};
