import type { DashboardModule } from "@contracts/navigation";

/** DASH-02 — Clinical Performance */
export const clinicalModule: DashboardModule = {
  nav: {
    id: "DASH-02",
    title: "Clinical Performance",
    shortTitle: "Clinical",
    path: "/clinical",
    description: "Quality, safety, and clinical outcomes",
    icon: "clinical",
  },
  loadView: () =>
    import("./ClinicalDashboard").then((m) => ({ default: m.ClinicalDashboard })),
};
