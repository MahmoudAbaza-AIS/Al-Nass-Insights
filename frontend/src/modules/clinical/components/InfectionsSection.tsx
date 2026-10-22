import type { MetricReading } from "@contracts/metrics";
import { KpiMetric, KpiPedestal } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";

interface InfectionsSectionProps {
  metrics: Record<string, MetricReading>;
}

const INFECTION_ROWS: ReadonlyArray<readonly [string, string, number]> = [
  ["or.ssi_rate", "SSI Rate", 1],
  ["clinical.cauti_rate", "CAUTI Rate", 0],
  ["clinical.clabsi_rate", "CLABSI Rate", 1],
  ["clinical.vap_rate", "VAP Rate", 1],
];

export function InfectionsSection({ metrics: m }: InfectionsSectionProps) {
  return (
    <DashboardSection title="Infections">
      <div className="flex items-center gap-[var(--dash-gap)]">
        <KpiPedestal icon="pi-shield" />
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-[var(--dash-gap)] sm:grid-cols-4">
          {INFECTION_ROWS.map(([id, label, precision]) => (
            <KpiMetric key={id} label={label} reading={m[id]} unit="%" precision={precision} order="value-first" />
          ))}
        </div>
      </div>
    </DashboardSection>
  );
}
