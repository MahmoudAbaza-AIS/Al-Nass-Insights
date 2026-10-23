import { useState } from "react";
import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { DonutChart } from "@shared/visualizations/DonutChart";
import { CylinderBars } from "@shared/visualizations/CylinderBars";
import { IsometricBars } from "@shared/visualizations/IsometricBars";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { KpiDetailDialog } from "@shared/components/KpiDetailDialog";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { getMetricDefinition } from "@contracts/metricDefinitions";
import { useDisplayPreferences } from "@shared/providers/useDisplayPreferences";
import { HospitalBuildingIllustration } from "../components/HospitalBuildingIllustration";

export function OverviewDashboard({ data }: { data: DashboardPayload }) {
  const prefs = useDisplayPreferences();
  const [detailId, setDetailId] = useState<string | null>(null);
  const m = data.metrics;

  return (
    <div className="dash-hub md:landscape:grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)_minmax(0,1fr)] md:landscape:grid-rows-[auto_minmax(0,1fr)_auto] md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_minmax(0,1fr)_auto_auto]">
      <div className="flex flex-wrap justify-center gap-x-[18%] gap-y-4 md:landscape:col-start-2 md:landscape:row-start-1 md:portrait:col-span-2">
        <DigitalCounter label="Total ER Visits" value={m["er.visits.total"]?.value ?? null} />
        <DigitalCounter label="Total OPD Visits" value={m["opd.visits.attended"]?.value ?? null} />
      </div>

      <HospitalBuildingIllustration className="md:landscape:col-start-2 md:landscape:row-start-2 md:portrait:col-span-2" />

      <div className="grid grid-cols-1 gap-[var(--dash-gap)] sm:grid-cols-3 md:landscape:col-start-2 md:landscape:row-start-3 md:portrait:col-span-2">
        <DashboardSection title="Emergency" className="sm:justify-self-start">
          <KpiMetric
            label="Door-to-Doctor Time"
            reading={m["er.door_to_doctor_minutes"]}
            unit="min"
            icon="pi-users"
            order="value-first"
            onOpenDetail={() => setDetailId("er.door_to_doctor_minutes")}
          />
        </DashboardSection>
        <DashboardSection title="Inpatient" className="sm:justify-self-center sm:pt-[calc(var(--dash-gap)*2)]">
          <KpiMetric
            label="Bed Occupancy Rate"
            reading={m["inpatient.bed_occupancy_rate"]}
            unit="%"
            icon="pi-inbox"
            order="value-first"
            onOpenDetail={() => setDetailId("inpatient.bed_occupancy_rate")}
          />
        </DashboardSection>
        <DashboardSection title="Clinical" className="sm:justify-self-end">
          <KpiMetric
            label="Recovery Rate"
            reading={m["clinical.recovery_rate"]}
            unit="%"
            icon="pi-wave-pulse"
            order="value-first"
            onOpenDetail={() => setDetailId("clinical.recovery_rate")}
          />
        </DashboardSection>
      </div>

      <div className="flex flex-col gap-[var(--dash-gap-lg)] md:landscape:col-start-1 md:landscape:row-span-3 md:landscape:row-start-1 md:landscape:justify-around md:portrait:row-start-4">
        <DashboardSection title="Application Request">
          <WidgetErrorBoundary title="Application request">
            <CylinderBars label="Application Request" segments={data.distributions.application_request ?? []} />
          </WidgetErrorBoundary>
        </DashboardSection>
        <DashboardSection title="Operating Room Usage">
          <div className="flex justify-center">
            <RadialGauge
              label="OR Utilization Rate"
              value={m["or.utilization_rate"]?.value ?? null}
              displaySize="var(--dash-gauge-lg)"
            />
          </div>
        </DashboardSection>
      </div>

      <div className="flex flex-col gap-[var(--dash-gap-lg)] md:landscape:col-start-3 md:landscape:row-span-3 md:landscape:row-start-1 md:landscape:justify-around md:portrait:row-start-4">
        <DashboardSection title="Outpatient clinics">
          <WidgetErrorBoundary title="Outpatient clinics">
            <IsometricBars label="Outpatient clinics" segments={data.distributions.opd_appointment ?? []} />
          </WidgetErrorBoundary>
        </DashboardSection>
        <DashboardSection title="Call Center">
          <WidgetErrorBoundary title="Call center mix">
            <DonutChart
              label="Call Center"
              segments={data.distributions.call_direction ?? []}
              colors={["var(--dash-chart-inbound)", "var(--dash-chart-outbound)"]}
              displaySize="var(--dash-gauge-lg)"
            />
          </WidgetErrorBoundary>
        </DashboardSection>
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
