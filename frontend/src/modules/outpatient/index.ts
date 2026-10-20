import type { DashboardModule } from "@contracts/navigation";

/** DASH-05 — Outpatient Clinic Performance */
export const outpatientModule: DashboardModule = {
  nav: {
    id: "DASH-05",
    title: "Outpatient Clinic Performance",
    shortTitle: "Outpatient",
    path: "/outpatient",
    description: "OPD visits, wait times, and appointments",
    icon: "outpatient",
  },
  loadView: () =>
    import("./OutpatientDashboard").then((m) => ({ default: m.OutpatientDashboard })),
};
