import type { DashboardPayload } from "@contracts/metrics";
import { AnatomyIllustration } from "../components/AnatomyIllustration";
import { SafetyHeadline } from "../components/SafetyHeadline";
import { VentilationSection } from "../components/VentilationSection";
import { OutcomesSection } from "../components/OutcomesSection";
import { MedicationSection } from "../components/MedicationSection";
import { InfectionsSection } from "../components/InfectionsSection";

/**
 * DASH-02 Clinical Performance — Figma frame `827:5269`.
 * Landscape tablet/desktop: sections sit at their Figma coordinates (`place` inside each section).
 * Portrait/mobile: the flow grid below.
 */
export function ClinicalDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub dash-stage md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_minmax(0,1fr)_auto_auto]">
      <div className="md:portrait:col-span-2">
        <SafetyHeadline metrics={m} />
      </div>

      <AnatomyIllustration className="md:portrait:col-span-2" />

      <VentilationSection metrics={m} />
      <OutcomesSection metrics={m} />
      <MedicationSection metrics={m} />
      <InfectionsSection metrics={m} />
    </div>
  );
}
