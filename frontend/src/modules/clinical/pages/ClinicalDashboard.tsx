import type { DashboardPayload } from "@contracts/metrics";
import { AnatomyIllustration } from "../components/AnatomyIllustration";
import { SafetyHeadline } from "../components/SafetyHeadline";
import { VentilationSection } from "../components/VentilationSection";
import { OutcomesSection } from "../components/OutcomesSection";
import { MedicationSection } from "../components/MedicationSection";
import { InfectionsSection } from "../components/InfectionsSection";

export function ClinicalDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub md:landscape:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)_minmax(0,1fr)] md:landscape:grid-rows-[auto_minmax(0,1fr)_auto] md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_minmax(0,1fr)_auto_auto]">
      <div className="md:landscape:col-span-3 md:portrait:col-span-2">
        <SafetyHeadline metrics={m} />
      </div>

      <AnatomyIllustration className="md:landscape:col-start-2 md:landscape:row-span-2 md:landscape:row-start-2 md:portrait:col-span-2" />

      <div className="md:landscape:col-start-1 md:landscape:row-start-2 md:landscape:self-center">
        <VentilationSection metrics={m} />
      </div>
      <div className="md:landscape:col-start-3 md:landscape:row-start-2 md:landscape:self-center">
        <OutcomesSection metrics={m} />
      </div>
      <div className="md:landscape:col-start-1 md:landscape:row-start-3">
        <MedicationSection metrics={m} />
      </div>
      <div className="md:landscape:col-start-3 md:landscape:row-start-3">
        <InfectionsSection metrics={m} />
      </div>
    </div>
  );
}
