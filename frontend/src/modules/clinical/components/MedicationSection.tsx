import type { MetricReading } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";

interface MedicationSectionProps {
  metrics: Record<string, MetricReading>;
}

export function MedicationSection({ metrics: m }: MedicationSectionProps) {
  return (
    <DashboardSection title="Medication">
      <div className="flex flex-wrap items-start gap-6">
        <span
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[rgba(0,229,255,0.08)] text-[var(--dash-cyan)] ring-1 ring-[var(--dash-cyan-border)]"
          aria-hidden
        >
          <i className="pi pi-box text-3xl" />
        </span>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3">
          <MetricValue
            label="Turnaround Time"
            reading={m["clinical.med_turnaround_minutes"]}
            unit="min"
            size="sm"
          />
          <MetricValue
            label="Near Miss"
            reading={m["clinical.near_miss"]}
            unit="%"
            precision={1}
            tone="watch"
            size="sm"
          />
          <MetricValue
            label="Medication Error"
            reading={m["clinical.medication_error"]}
            unit="%"
            precision={1}
            tone="critical"
            size="sm"
          />
        </div>
      </div>
    </DashboardSection>
  );
}
