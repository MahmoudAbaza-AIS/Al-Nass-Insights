import { useState } from "react";
import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { DonutChart } from "@shared/visualizations/DonutChart";
import { CylinderBars } from "@shared/visualizations/CylinderBars";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { HospitalBuildingIllustration } from "@shared/components/illustrations/CentralIllustrations";
import { KpiDetailDialog } from "@shared/components/KpiDetailDialog";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { getMetricDefinition } from "@contracts/metricDefinitions";
import { useDisplayPreferences } from "@shared/providers/DisplayPreferencesProvider";

export function OverviewDashboard({ data }: { data: DashboardPayload }) {
  const prefs = useDisplayPreferences();
  const [detailId, setDetailId] = useState<string | null>(null);
  const m = data.metrics;

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[1fr_minmax(16rem,28rem)_1fr] lg:grid-rows-[auto_auto_auto]">
      <DashboardSection className="lg:col-start-1 lg:row-start-1">
        <WidgetErrorBoundary title="Application request">
          <CylinderBars
            label="Application Request"
            segments={data.distributions.application_request ?? []}
          />
        </WidgetErrorBoundary>
      </DashboardSection>

      <div className="flex flex-col items-center gap-4 lg:col-start-2 lg:row-span-2">
        <div className="flex flex-wrap justify-center gap-6">
          <DigitalCounter label="Total ER Visits" value={m["er.visits.total"]?.value ?? null} />
          <DigitalCounter label="Total OPD Visits" value={m["opd.visits.attended"]?.value ?? null} />
        </div>
        <IllustrationPanel label="Central hospital building illustration" aspectRatio="16 / 10">
          <HospitalBuildingIllustration />
        </IllustrationPanel>
      </div>

      <DashboardSection className="lg:col-start-3 lg:row-start-1">
        <WidgetErrorBoundary title="Outpatient clinics">
          <CylinderBars
            label="Outpatient Clinics"
            segments={data.distributions.opd_appointment ?? []}
          />
        </WidgetErrorBoundary>
      </DashboardSection>

      <DashboardSection className="flex justify-center lg:col-start-1 lg:row-start-2">
        <RadialGauge
          label="OR Utilization Rate"
          value={m["or.utilization_rate"]?.value ?? null}
          size={140}
          strokeWidth={12}
        />
      </DashboardSection>

      <DashboardSection className="lg:col-start-3 lg:row-start-2">
        <WidgetErrorBoundary title="Call center mix">
          <DonutChart
            label="Call Center"
            segments={data.distributions.call_direction ?? []}
            colors={["var(--dash-chart-inbound)", "var(--dash-chart-outbound)"]}
          />
        </WidgetErrorBoundary>
      </DashboardSection>

      <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
        <MetricValue
          label="Door-to-Doctor Time"
          reading={m["er.door_to_doctor_minutes"]}
          unit="min"
          supportingText="Emergency"
          onOpenDetail={() => setDetailId("er.door_to_doctor_minutes")}
        />
        <MetricValue
          label="Bed Occupancy Rate"
          reading={m["inpatient.bed_occupancy_rate"]}
          unit="%"
          supportingText="Inpatient"
          onOpenDetail={() => setDetailId("inpatient.bed_occupancy_rate")}
        />
        <MetricValue
          label="Recovery Rate"
          reading={m["clinical.recovery_rate"]}
          unit="%"
          supportingText="Clinical"
          onOpenDetail={() => setDetailId("clinical.recovery_rate")}
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
