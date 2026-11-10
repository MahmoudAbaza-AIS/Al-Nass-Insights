import type { MetricReading, MetricStatusTone } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { place } from "@shared/utils/stage";
import medicationArt from "../../../assets/figma/kpi-medication.png";

interface MedicationSectionProps {
  metrics: Record<string, MetricReading>;
}

const RATE_ROWS: ReadonlyArray<readonly [string, string, string, MetricStatusTone]> = [
  ["clinical.near_miss", "Near Miss", "var(--dash-warning)", "watch"],
  ["clinical.medication_error", "Medication Error", "var(--dash-danger)", "critical"],
];

/**
 * Figma "Medication" (bottom-left): pill-bottle tile under the title, a divider, and the two
 * marker rows in their own column that starts level with the title.
 */
export function MedicationSection({ metrics: m }: MedicationSectionProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-[calc(var(--dash-gap-lg)*1.6)] gap-y-[var(--dash-gap)]">
      <DashboardSection title="Medication" className="dash-place" style={place(206, 1724, 720)}>
        <KpiMetric
          label="Turnaround Time"
          reading={m["clinical.med_turnaround_minutes"]}
          unit="min"
          art={{ src: medicationArt, width: 210, height: 270 }}
          order="value-first"
          className="gap-[calc(var(--dash-gap)*2.2)]"
        />
      </DashboardSection>
      <span
        className="dash-place hidden w-px bg-white/15 md:landscape:block"
        style={place(910, 1830, 2, 180)}
        aria-hidden
      />
      <div className="dash-place flex flex-col gap-[0.9em]" style={place(1040, 1716, 420)}>
        {RATE_ROWS.map(([id, label, color, tone]) => (
          <div key={id} className="flex items-stretch gap-[0.8em]">
            {/* Figma marker: dim vertical track with a short coloured foot. */}
            <span className="relative w-[0.45em] shrink-0 rounded-sm bg-white/10" aria-hidden>
              <span className="absolute inset-x-0 bottom-0 h-[30%] rounded-sm" style={{ background: color }} />
            </span>
            <KpiMetric label={label} reading={m[id]} unit="%" precision={1} tone={tone} order="value-first" />
          </div>
        ))}
      </div>
    </div>
  );
}
