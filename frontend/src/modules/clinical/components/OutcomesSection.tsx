import type { MetricReading, MetricStatusTone } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { Sparkline } from "@shared/visualizations/Sparkline";
import { place } from "@shared/utils/stage";

interface OutcomesSectionProps {
  metrics: Record<string, MetricReading>;
}

/** Figma value colours: recovery teal, complication amber, mortality red. */
const OUTCOME_ROWS: ReadonlyArray<readonly [string, string, string, MetricStatusTone]> = [
  ["clinical.recovery_rate", "Recovery Rate", "var(--dash-teal)", "info"],
  ["clinical.complication_rate", "Complication Rate", "var(--dash-warning)", "watch"],
  ["clinical.mortality_rate", "Mortality Rate", "var(--dash-danger)", "critical"],
];

/**
 * Figma "Patient Outcomes" (right of the anatomy figure). The Figma waves are a decorative
 * scrolling loop; per the KPI coverage review only real published trends are drawn here.
 */
export function OutcomesSection({ metrics: m }: OutcomesSectionProps) {
  return (
    <DashboardSection title="Patient Outcomes" className="dash-place" style={place(2504, 768, 900)}>
      <div className="flex flex-col gap-[calc(var(--dash-gap)*1.4)] md:landscape:mt-[calc(1.1*var(--u))]">
        {OUTCOME_ROWS.map(([id, label, color, tone]) => (
          <div key={id} className="flex items-center justify-between gap-[var(--dash-gap)]">
            <KpiMetric label={label} reading={m[id]} unit="%" tone={tone} valueColor={color} />
            <Sparkline points={m[id]?.trend ?? []} color={color} label={label} />
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
