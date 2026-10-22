import { useState } from "react";
import type { DashboardPayload } from "@contracts/metrics";
import { KpiIconShell, KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { CapacityIndicator } from "@shared/visualizations/CapacityIndicator";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { KpiDetailDialog } from "@shared/components/KpiDetailDialog";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { getMetricDefinition } from "@contracts/metricDefinitions";
import { useDisplayPreferences } from "@shared/providers/useDisplayPreferences";
import { InpatientIllustration } from "../components/InpatientIllustration";
import { PatientExperiencePanel } from "../components/PatientExperiencePanel";

export function InpatientDashboard({ data }: { data: DashboardPayload }) {
  const prefs = useDisplayPreferences();
  const [detailId, setDetailId] = useState<string | null>(null);
  const m = data.metrics;

  return (
    <div className="dash-hub h-full min-h-0">
      <div className="grid shrink-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiMetric
          label="Bed Occupancy"
          reading={m["inpatient.bed_occupancy_rate"]}
          unit="%"
          icon={
            <KpiIconShell>
              <i className="pi pi-inbox text-xl" />
            </KpiIconShell>
          }
          onOpenDetail={() => setDetailId("inpatient.bed_occupancy_rate")}
        />
        <KpiMetric
          label="Average Length of Stay"
          reading={m["inpatient.alos_days"]}
          unit="days"
          precision={1}
          icon={
            <KpiIconShell>
              <i className="pi pi-clock text-xl" />
            </KpiIconShell>
          }
          onOpenDetail={() => setDetailId("inpatient.alos_days")}
        />
        <KpiMetric
          label="Bed Turnover"
          reading={m["inpatient.bed_turnover"]}
          unit="patients/bed"
          icon={
            <KpiIconShell>
              <i className="pi pi-sync text-xl" />
            </KpiIconShell>
          }
          onOpenDetail={() => setDetailId("inpatient.bed_turnover")}
        />
        <KpiMetric
          label="Cancellation Rate"
          reading={m["inpatient.cancellation_rate"]}
          unit="%"
          tone="critical"
          icon={
            <KpiIconShell tone="danger">
              <i className="pi pi-times-circle text-xl" />
            </KpiIconShell>
          }
          onOpenDetail={() => setDetailId("inpatient.cancellation_rate")}
        />
      </div>

      <div className="grid min-h-0 flex-1 items-center gap-4 lg:grid-cols-[auto_minmax(14rem,1fr)_auto] lg:gap-6">
        <DashboardSection title="Bed Capacity" className="justify-self-center lg:justify-self-end">
          <WidgetErrorBoundary title="Bed capacity">
            <CapacityIndicator capacity={data.capacity} />
          </WidgetErrorBoundary>
        </DashboardSection>

        <IllustrationPanel label="Inpatient care illustration" aspectRatio="auto">
          <InpatientIllustration />
        </IllustrationPanel>

        <KpiMetric
          label="Readmission Rate"
          reading={m["inpatient.readmission_rate"]}
          unit="%"
          size="lg"
          icon={
            <KpiIconShell>
              <i className="pi pi-replay text-xl" />
            </KpiIconShell>
          }
          onOpenDetail={() => setDetailId("inpatient.readmission_rate")}
        />
      </div>

      <div className="grid shrink-0 items-end gap-4 md:grid-cols-[1.2fr_1fr_1fr] md:gap-6">
        <PatientExperiencePanel reading={m["inpatient.satisfaction_score"]} />
        <RadialGauge
          label="Complaint Rate"
          value={m["inpatient.complaint_rate"]?.value ?? null}
          tone="warning"
          size={130}
          strokeWidth={11}
        />
        <RadialGauge
          label="Patient Violation Rate"
          value={m["inpatient.violation_rate"]?.value ?? null}
          tone="danger"
          size={130}
          strokeWidth={11}
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
