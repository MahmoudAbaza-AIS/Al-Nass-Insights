import { useState } from "react";
import type { DashboardPayload } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
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
    <div className="dash-hub md:landscape:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] md:landscape:grid-rows-[auto_minmax(0,1fr)_auto] md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_minmax(0,1fr)_auto_auto]">
      <div className="grid grid-cols-1 gap-[var(--dash-gap)] sm:grid-cols-2 md:landscape:col-span-3 md:landscape:grid-cols-4 md:portrait:col-span-2">
        <KpiMetric
          label="Bed Occupancy"
          reading={m["inpatient.bed_occupancy_rate"]}
          unit="%"
          icon="pi-warehouse"
          onOpenDetail={() => setDetailId("inpatient.bed_occupancy_rate")}
        />
        <KpiMetric
          label="Average Length of Stay"
          reading={m["inpatient.alos_days"]}
          unit="days"
          precision={1}
          icon="pi-clock"
          onOpenDetail={() => setDetailId("inpatient.alos_days")}
        />
        <KpiMetric
          label="Bed Turnover"
          reading={m["inpatient.bed_turnover"]}
          unit="patients/bed"
          icon="pi-sync"
          onOpenDetail={() => setDetailId("inpatient.bed_turnover")}
        />
        <KpiMetric
          label="Cancellation Rate"
          reading={m["inpatient.cancellation_rate"]}
          unit="%"
          tone="critical"
          icon="pi-times-circle"
          iconTone="danger"
          onOpenDetail={() => setDetailId("inpatient.cancellation_rate")}
        />
      </div>

      <InpatientIllustration className="md:landscape:col-start-2 md:landscape:row-span-2 md:landscape:row-start-2 md:portrait:col-span-2" />

      <DashboardSection
        title="Bed Capacity"
        className="justify-self-center md:landscape:col-start-1 md:landscape:row-start-2 md:landscape:self-start md:landscape:justify-self-end"
      >
        <WidgetErrorBoundary title="Bed capacity">
          <CapacityIndicator capacity={data.capacity} />
        </WidgetErrorBoundary>
      </DashboardSection>

      <KpiMetric
        label="Readmission Rate"
        reading={m["inpatient.readmission_rate"]}
        unit="%"
        icon="pi-replay"
        order="value-first"
        size="lg"
        className="justify-self-center md:landscape:col-start-3 md:landscape:row-start-2 md:landscape:justify-self-start"
        onOpenDetail={() => setDetailId("inpatient.readmission_rate")}
      />

      <div className="justify-self-center md:landscape:col-start-1 md:landscape:row-start-3 md:landscape:justify-self-start">
        <PatientExperiencePanel reading={m["inpatient.satisfaction_score"]} />
      </div>

      <div className="flex flex-wrap justify-center gap-[var(--dash-gap-lg)] md:landscape:col-start-3 md:landscape:row-start-3 md:landscape:justify-around">
        <RadialGauge
          label="Complaint Rate"
          value={m["inpatient.complaint_rate"]?.value ?? null}
          tone="warning"
          displaySize="var(--dash-gauge-md)"
        />
        <RadialGauge
          label="Patient Violation Rate"
          value={m["inpatient.violation_rate"]?.value ?? null}
          tone="danger"
          displaySize="var(--dash-gauge-md)"
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
