import { useState } from "react";
import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { DonutChart } from "@shared/visualizations/DonutChart";
import { CylinderBars } from "@shared/visualizations/CylinderBars";
import { KpiIconShell, KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
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
    <div className="dash-hub h-full min-h-0">
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(11rem,1fr)_minmax(16rem,1.35fr)_minmax(11rem,1fr)] lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-4">
        <DashboardSection className="lg:col-start-1 lg:row-start-1">
          <WidgetErrorBoundary title="Application request">
            <CylinderBars
              label="Application Request"
              segments={data.distributions.application_request ?? []}
            />
          </WidgetErrorBoundary>
        </DashboardSection>

        <div className="flex flex-col items-center gap-4 lg:col-start-2 lg:row-span-2">
          <div className="flex w-full max-w-3xl flex-wrap justify-center gap-10 lg:justify-between">
            <DigitalCounter label="Total ER Visits" value={m["er.visits.total"]?.value ?? null} />
            <DigitalCounter
              label="Total OPD Visits"
              value={m["opd.visits.attended"]?.value ?? null}
            />
          </div>
          <IllustrationPanel label="Central hospital building illustration" aspectRatio="auto">
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
            size={130}
            strokeWidth={12}
          />
        </DashboardSection>

        <DashboardSection className="lg:col-start-3 lg:row-start-2">
          <WidgetErrorBoundary title="Call center mix">
            <div className="flex flex-col items-center gap-2">
              <h3 className="m-0 text-[length:var(--dash-fs-sm)] font-medium text-white">
                Call Center
              </h3>
              <DonutChart
                label="Call Center"
                segments={data.distributions.call_direction ?? []}
                colors={["var(--dash-chart-inbound)", "var(--dash-chart-outbound)"]}
                size={130}
                strokeWidth={14}
              />
            </div>
          </WidgetErrorBoundary>
        </DashboardSection>
      </div>

      <div className="mx-auto grid w-full max-w-5xl shrink-0 gap-4 sm:grid-cols-3 md:gap-5">
        <KpiMetric
          label="Door-to-Doctor Time"
          reading={m["er.door_to_doctor_minutes"]}
          unit="min"
          supportingText="Emergency"
          size="lg"
          icon={
            <KpiIconShell>
              <i className="pi pi-users text-xl" />
            </KpiIconShell>
          }
          onOpenDetail={() => setDetailId("er.door_to_doctor_minutes")}
        />
        <KpiMetric
          label="Bed Occupancy Rate"
          reading={m["inpatient.bed_occupancy_rate"]}
          unit="%"
          supportingText="Inpatient"
          size="lg"
          icon={
            <KpiIconShell>
              <i className="pi pi-inbox text-xl" />
            </KpiIconShell>
          }
          onOpenDetail={() => setDetailId("inpatient.bed_occupancy_rate")}
        />
        <KpiMetric
          label="Recovery Rate"
          reading={m["clinical.recovery_rate"]}
          unit="%"
          supportingText="Clinical"
          size="lg"
          icon={
            <KpiIconShell>
              <i className="pi pi-replay text-xl" />
            </KpiIconShell>
          }
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
