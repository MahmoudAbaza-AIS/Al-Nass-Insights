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
    reading?.statusLabel ??
    (satisfaction === null ? null : satisfaction >= 4 ? "Excellent" : null);

  return (
    <DashboardSection title="Patient Experience">
      <div className="flex flex-col gap-2">
        <StarRating score={satisfaction} />
        <div className="flex items-baseline gap-3">
          <div className="text-5xl font-bold leading-none text-[var(--dash-gold)]">
            {satisfaction === null ? "—" : formatNumber(satisfaction)}
          </div>
          {status ? (
            <div className="text-lg font-medium text-[var(--dash-gold)]">{status}</div>
          ) : null}
        </div>
        <div className="text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
          Patient Satisfaction Score
        </div>
      </div>
    </DashboardSection>
  );
}
