import { useState } from "react";
import type { DashboardPayload } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { InpatientIllustration } from "@shared/components/illustrations/CentralIllustrations";
import { CapacityIndicator } from "@shared/visualizations/CapacityIndicator";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { KpiDetailDialog } from "@shared/components/KpiDetailDialog";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { getMetricDefinition } from "@contracts/metricDefinitions";
import { useDisplayPreferences } from "@shared/providers/DisplayPreferencesProvider";
import { formatNumber } from "@shared/utils/format";

function StarRating({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-[var(--dash-label)]">Satisfaction unavailable</span>;
  }
  return (
    <div className="flex items-center gap-1" aria-label={`${score} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < Math.round(score) ? "text-[var(--dash-gold)]" : "text-white/20"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function InpatientDashboard({ data }: { data: DashboardPayload }) {
  const prefs = useDisplayPreferences();
  const [detailId, setDetailId] = useState<string | null>(null);
  const m = data.metrics;
  const satisfaction = m["inpatient.satisfaction_score"]?.value ?? null;

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricValue
          label="Bed Occupancy"
          reading={m["inpatient.bed_occupancy_rate"]}
          unit="%"
          onOpenDetail={() => setDetailId("inpatient.bed_occupancy_rate")}
        />
        <MetricValue
          label="Average Length of Stay"
          reading={m["inpatient.alos_days"]}
          unit="days"
          precision={1}
          onOpenDetail={() => setDetailId("inpatient.alos_days")}
        />
        <MetricValue
          label="Bed Turnover"
          reading={m["inpatient.bed_turnover"]}
          unit="patients/bed"
          onOpenDetail={() => setDetailId("inpatient.bed_turnover")}
        />
        <MetricValue
          label="Cancellation Rate"
          reading={m["inpatient.cancellation_rate"]}
          unit="%"
          tone="critical"
          onOpenDetail={() => setDetailId("inpatient.cancellation_rate")}
        />
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
        <DashboardSection title="Bed Capacity">
          <WidgetErrorBoundary title="Bed capacity">
            <CapacityIndicator capacity={data.capacity} />
          </WidgetErrorBoundary>
        </DashboardSection>

        <IllustrationPanel label="Inpatient care illustration" aspectRatio="5 / 3">
          <InpatientIllustration />
        </IllustrationPanel>

        <MetricValue
          label="Readmission Rate"
          reading={m["inpatient.readmission_rate"]}
          unit="%"
          onOpenDetail={() => setDetailId("inpatient.readmission_rate")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardSection title="Patient Experience">
          <div className="flex flex-col gap-2">
            <StarRating score={satisfaction} />
            <div className="text-4xl font-bold text-[var(--dash-gold)]">
              {satisfaction === null ? "—" : formatNumber(satisfaction)}
            </div>
            <div className="text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
              {m["inpatient.satisfaction_score"]?.supportingText ?? "Patient Satisfaction Score"}
            </div>
          </div>
        </DashboardSection>

        <RadialGauge
          label="Complaint Rate"
          value={m["inpatient.complaint_rate"]?.value ?? null}
          tone="warning"
          size={130}
        />
        <RadialGauge
          label="Patient Violation Rate"
          value={m["inpatient.violation_rate"]?.value ?? null}
          tone="danger"
          size={130}
        />
      </div>

      <KpiDetailDialog
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        definition={detailId ? getMetricDefinition(detailId) : undefined}
        reading={detailId ? m[detailId] : undefined}
        timeZone={prefs.timeZone}
      />
    </div>
  );
}
