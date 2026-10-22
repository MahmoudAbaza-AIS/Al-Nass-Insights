import type { MetricReading } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { formatNumber } from "@shared/utils/format";

interface SafetyHeadlineProps {
  metrics: Record<string, MetricReading>;
}

export function SafetyHeadline({ metrics: m }: SafetyHeadlineProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
      <MetricValue
        label="Pressure Ulcer Rate"
        reading={m["clinical.pressure_ulcer_rate"]}
        unit=""
        supportingText={
          m["clinical.pressure_ulcer_rate"]?.supportingText ??
          `${formatNumber(m["clinical.pressure_ulcer_rate"]?.value ?? null)} per 1,000 patients`
        }
      />
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        <RadialGauge
          label="Adverse Events Rate"
          value={m["clinical.adverse_events_rate"]?.value ?? null}
          tone="danger"
          size={110}
          strokeWidth={10}
        />
        <RadialGauge
          label="Missed Diagnosis Rate"
          value={m["clinical.missed_diagnosis_rate"]?.value ?? null}
          tone="warning"
          size={110}
          strokeWidth={10}
        />
        <RadialGauge
          label="VTE Compliance"
          value={m["clinical.vte_compliance"]?.value ?? null}
          tone="cyan"
          size={120}
          strokeWidth={11}
        />
      </div>
      <MetricValue
        label="Falls Rate"
        reading={m["clinical.falls_rate"]}
        supportingText={m["clinical.falls_rate"]?.supportingText}
      />
    </div>
  );
}
