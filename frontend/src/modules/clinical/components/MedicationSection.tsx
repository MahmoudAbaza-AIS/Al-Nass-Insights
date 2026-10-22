import type { MetricReading, MetricStatusTone } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";

interface MedicationSectionProps {
  metrics: Record<string, MetricReading>;
}

const RATE_ROWS: ReadonlyArray<readonly [string, string, string, MetricStatusTone]> = [
  ["clinical.near_miss", "Near Miss", "var(--dash-warning)", "watch"],
  ["clinical.medication_error", "Medication Error", "var(--dash-danger)", "critical"],
];

export function MedicationSection({ metrics: m }: MedicationSectionProps) {
  return (
    <DashboardSection title="Medication">
      <div className="flex flex-wrap items-center gap-x-[var(--dash-gap-lg)] gap-y-[var(--dash-gap)]">
        <KpiMetric
          label="Turnaround Time"
          reading={m["clinical.med_turnaround_minutes"]}
          unit="min"
          icon="pi-box"
          order="value-first"
        />
        <span className="hidden h-[3.5em] w-px bg-white/20 sm:block" aria-hidden />
        <div className="flex flex-col gap-[0.6em]">
          {RATE_ROWS.map(([id, label, color, tone]) => (
            <div key={id} className="flex items-stretch gap-[0.6em]">
              <span className="w-[0.4em] shrink-0 rounded-sm bg-white/10" aria-hidden>
                <span className="block h-1/2 translate-y-full rounded-sm" style={{ background: color }} />
              </span>
              <KpiMetric label={label} reading={m[id]} unit="%" precision={1} tone={tone} order="value-first" />
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  );
}
