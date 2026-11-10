import type { CSSProperties } from "react";
import type { MetricReading } from "@contracts/metrics";
import { DashboardSection } from "@shared/components/DashboardSection";
import { EMPTY_VALUE, formatNumber } from "@shared/utils/format";
import { StarRating } from "./StarRating";

interface PatientExperiencePanelProps {
  reading: MetricReading | undefined;
  className?: string;
  style?: CSSProperties;
}

/**
 * Figma "Patient Experience": star arc, score, rating band, caption.
 * The rating band (e.g. "Excellent") is shown only when the API publishes one — the KPI review
 * notes the scale and bands are not yet defined, so none is derived here.
 */
export function PatientExperiencePanel({ reading, className = "", style }: PatientExperiencePanelProps) {
  const satisfaction = reading?.value ?? null;
  const status = reading?.statusLabel ?? null;

  return (
    <DashboardSection title="Patient Experience" className={className} style={style}>
      <div className="flex w-max flex-col items-center gap-[0.35em] pt-[1.6em] text-center">
        <StarRating score={satisfaction} />
        <div className="mt-[0.3em] text-[length:var(--dash-fs-value)] font-bold leading-none text-[var(--dash-gold)]">
          {satisfaction === null ? <span className="opacity-60">{EMPTY_VALUE}</span> : formatNumber(satisfaction)}
        </div>
        {status ? <div className="text-[length:var(--dash-fs-xs)] text-[var(--dash-text)]">{status}</div> : null}
        <div className="mt-[0.6em] text-[length:var(--dash-fs-label)] text-[var(--dash-label)]">Patient Satisfaction Score</div>
      </div>
    </DashboardSection>
  );
}
