import type { MetricReading } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { RadialGauge } from "@shared/visualizations/RadialGauge";

interface SafetyHeadlineProps {
  metrics: Record<string, MetricReading>;
}

export function SafetyHeadline({ metrics: m }: SafetyHeadlineProps) {
  return (
    <div className="grid items-center gap-[var(--dash-gap)] sm:grid-cols-2 md:landscape:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <KpiMetric
        label="Pressure Ulcer Rate"
        reading={m["clinical.pressure_ulcer_rate"]}
        unit="per 1,000 patients"
        supportingText={m["clinical.pressure_ulcer_rate"]?.supportingText}
        icon="pi-user"
        className="justify-self-center md:landscape:justify-self-start"
      />
      <div className="flex flex-wrap justify-center gap-[var(--dash-gap-lg)] sm:order-last sm:col-span-2 md:landscape:order-none md:landscape:col-span-1">
        <RadialGauge
          label="Adverse Events Rate"
          value={m["clinical.adverse_events_rate"]?.value ?? null}
          tone="danger"
        />
        <RadialGauge
          label="Missed Diagnosis Rate"
          value={m["clinical.missed_diagnosis_rate"]?.value ?? null}
          tone="danger"
        />
        <RadialGauge label="VTE Compliance" value={m["clinical.vte_compliance"]?.value ?? null} tone="teal" />
      </div>
      <KpiMetric
        label="Falls Rate"
        reading={m["clinical.falls_rate"]}
        unit="per 1,000 patients"
        supportingText={m["clinical.falls_rate"]?.supportingText}
        icon="pi-user-minus"
        className="justify-self-center md:landscape:justify-self-end"
      />
    </div>
  );
}
