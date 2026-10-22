import type { DashboardPayload } from "@contracts/metrics";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { AnatomyIllustration } from "../components/AnatomyIllustration";
import { SafetyHeadline } from "../components/SafetyHeadline";
import { VentilationSection } from "../components/VentilationSection";
import { OutcomesSection } from "../components/OutcomesSection";
import { MedicationSection } from "../components/MedicationSection";
import { InfectionsSection } from "../components/InfectionsSection";

export function ClinicalDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub h-full min-h-0">
      <div className="shrink-0">
        <SafetyHeadline metrics={m} />
      </div>

      <div className="grid min-h-0 flex-1 items-center gap-4 lg:grid-cols-[1fr_minmax(12rem,18rem)_1fr] lg:gap-5">
        <VentilationSection metrics={m} />
        <IllustrationPanel label="Anatomical illustration" aspectRatio="auto" className="self-center">
          <AnatomyIllustration />
        </IllustrationPanel>
        <OutcomesSection metrics={m} />
      </div>

      <div className="grid shrink-0 gap-4 md:grid-cols-2 md:gap-5">
        <MedicationSection metrics={m} />
        <InfectionsSection metrics={m} />
      </div>
    </div>
  );
}
