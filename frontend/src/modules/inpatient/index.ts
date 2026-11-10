import type { DashboardModule } from "@contracts/navigation";

/** DASH-07 — Inpatient Services Performance */
export const inpatientModule: DashboardModule = {
  nav: {
    id: "DASH-07",
    title: "Inpatient Services Performance",
    shortTitle: "Inpatient",
    path: "/inpatient",
    description: "Beds, stay, and inpatient experience",
    icon: "inpatient",
  },
  loadView: () =>
    import("./pages/InpatientDashboard").then((m) => ({ default: m.InpatientDashboard })),
};
