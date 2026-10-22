import type { MetricReading } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";
import { Sparkline } from "@shared/visualizations/Sparkline";

interface OutcomesSectionProps {
  metrics: Record<string, MetricReading>;
}

const OUTCOME_ROWS = [
  ["clinical.recovery_rate", "Recovery Rate", "var(--dash-cyan)", "%"],
  ["clinical.complication_rate", "Complication Rate", "var(--dash-warning)", "%"],
  ["clinical.mortality_rate", "Mortality Rate", "var(--dash-danger)", "%"],
] as const;

export function OutcomesSection({ metrics: m }: OutcomesSectionProps) {
  return (
    <DashboardSection title="Patient Outcomes">
      <div className="space-y-4">
        {OUTCOME_ROWS.map(([id, label, color, unit]) => (
          <div key={id} className="flex items-center justify-between gap-3">
            <MetricValue label={label} reading={m[id]} unit={unit} size="sm" />
            <Sparkline points={m[id]?.trend ?? []} color={color} label={label} />
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
