import type { MetricReading } from "@contracts/metrics";
import { DashboardSection } from "@shared/components/DashboardSection";
import { formatNumber } from "@shared/utils/format";
import { StarRating } from "./StarRating";

interface PatientExperiencePanelProps {
  reading: MetricReading | undefined;
}

export function PatientExperiencePanel({ reading }: PatientExperiencePanelProps) {
  const satisfaction = reading?.value ?? null;
  const status =
    reading?.statusLabel ?? (satisfaction === null ? null : satisfaction >= 4 ? "Excellent" : null);

  return (
    <DashboardSection title="Patient Experience">
      <div className="flex flex-col items-center gap-[0.35em] text-center">
        <StarRating score={satisfaction} />
        <div className="mt-[0.3em] text-[length:var(--dash-fs-value)] font-semibold leading-none text-[var(--dash-gold)]">
          {satisfaction === null ? "—" : formatNumber(satisfaction)}
        </div>
        {status ? <div className="text-[length:var(--dash-fs-xs)] text-[var(--dash-text)]">{status}</div> : null}
        <div className="mt-[0.4em] text-[length:var(--dash-fs-label)] text-[var(--dash-label)]">
          Patient Satisfaction Score
        </div>
      </div>
    </DashboardSection>
  );
}
