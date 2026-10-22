import type { MetricReading, MetricStatusTone } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { Sparkline } from "@shared/visualizations/Sparkline";

interface OutcomesSectionProps {
  metrics: Record<string, MetricReading>;
}

const OUTCOME_ROWS: ReadonlyArray<readonly [string, string, string, MetricStatusTone]> = [
  ["clinical.recovery_rate", "Recovery Rate", "var(--dash-teal)", "info"],
  ["clinical.complication_rate", "Complication Rate", "var(--dash-warning)", "watch"],
  ["clinical.mortality_rate", "Mortality Rate", "var(--dash-danger)", "critical"],
];

export function OutcomesSection({ metrics: m }: OutcomesSectionProps) {
  return (
    <DashboardSection title="Patient Outcomes">
      <div className="flex flex-col gap-[var(--dash-gap)]">
        {OUTCOME_ROWS.map(([id, label, color, tone]) => (
          <div key={id} className="flex items-center justify-between gap-[var(--dash-gap)]">
            <KpiMetric label={label} reading={m[id]} unit="%" tone={tone} />
            <Sparkline points={m[id]?.trend ?? []} color={color} label={label} />
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
