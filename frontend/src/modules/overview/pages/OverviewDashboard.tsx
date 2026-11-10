import { useState } from "react";
import type { DashboardPayload } from "@contracts/metrics";
import { segmentsOrEmpty } from "@contracts/distributionDefinitions";
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
import { place } from "@shared/utils/stage";
import { HospitalBuildingIllustration } from "../components/HospitalBuildingIllustration";
import doorToDoctorArt from "../../../assets/figma/kpi-door-to-doctor.png";
import bedOccupancyArt from "../../../assets/figma/kpi-bed-occupancy.png";
import recoveryArt from "../../../assets/figma/kpi-recovery.png";

/** Figma tile illustrations (cropped from the 4K frame export at 200×~215 px). */
const ART = {
  doorToDoctor: { src: doorToDoctorArt, width: 200, height: 240 },
  bedOccupancy: { src: bedOccupancyArt, width: 200, height: 215 },
  recovery: { src: recoveryArt, width: 200, height: 215 },
};

/**
 * DASH-01 Hospital Overview — Figma frame `827:2306`.
 * Landscape tablet/desktop: each block sits at its Figma coordinates (`place`, 3840×2160).
 * Portrait/mobile: the original flow grid below.
 */
export function OverviewDashboard({ data }: { data: DashboardPayload }) {
  const prefs = useDisplayPreferences();
  const [detailId, setDetailId] = useState<string | null>(null);
  const m = data.metrics;
  const gaugeSize = "max(var(--dash-gauge-lg), calc(8.6 * var(--dash-stage-u, 0px)))";
  const donutSize = "max(var(--dash-gauge-lg), calc(11 * var(--dash-stage-u, 0px)))";

  return (
    <div className="dash-hub dash-stage md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_minmax(0,1fr)_auto_auto]">
      <div className="flex flex-wrap justify-center gap-x-[18%] gap-y-4 md:portrait:col-span-2">
        <div className="dash-place" style={place(1211, 302, 416, 222)}>
          <DigitalCounter label="Total ER Visits" value={m["er.visits.total"]?.value ?? null} />
        </div>
        <div className="dash-place" style={place(2213, 302, 416, 222)}>
          <DigitalCounter label="Total OPD Visits" value={m["opd.visits.attended"]?.value ?? null} />
        </div>
      </div>

      <HospitalBuildingIllustration className="dash-place md:portrait:col-span-2" style={place(930, 610, 1980, 972)} />

      <div className="grid grid-cols-1 gap-[var(--dash-gap)] sm:grid-cols-3 md:portrait:col-span-2">
        <DashboardSection title="Emergency" className="dash-place sm:justify-self-start" style={place(939, 1600, 640)}>
          <KpiMetric
            label="Door-to-Doctor Time"
            reading={m["er.door_to_doctor_minutes"]}
            unit="min"
            art={ART.doorToDoctor}
            order="value-first"
            onOpenDetail={() => setDetailId("er.door_to_doctor_minutes")}
          />
        </DashboardSection>
        <DashboardSection title="Inpatient" className="dash-place sm:justify-self-center" style={place(1742, 1756, 640)}>
          <KpiMetric
            label="Bed Occupancy Rate"
            reading={m["inpatient.bed_occupancy_rate"]}
            unit="%"
            art={ART.bedOccupancy}
            order="value-first"
            onOpenDetail={() => setDetailId("inpatient.bed_occupancy_rate")}
          />
        </DashboardSection>
        <DashboardSection title="Clinical" className="dash-place sm:justify-self-end" style={place(2434, 1609, 560)}>
          <KpiMetric
            label="Recovery Rate"
            reading={m["clinical.recovery_rate"]}
            unit="%"
            art={ART.recovery}
            order="value-first"
            onOpenDetail={() => setDetailId("clinical.recovery_rate")}
          />
        </DashboardSection>
      </div>

      <div className="flex flex-col gap-[var(--dash-gap-lg)] md:portrait:row-start-4">
        <DashboardSection title="Application Request" className="dash-place" style={place(313, 536, 640)}>
          <WidgetErrorBoundary title="Application request">
            <CylinderBars
              label="Application Request"
              segments={segmentsOrEmpty(data.distributions, "application_request")}
            />
          </WidgetErrorBoundary>
        </DashboardSection>
        <DashboardSection title="Operating Room Usage" className="dash-place" style={place(313, 1271, 471)}>
          <div className="flex justify-center md:landscape:mt-[calc(2.75*var(--u))]">
            <RadialGauge
              label="OR Utilization Rate"
              value={m["or.utilization_rate"]?.value ?? null}
              displaySize={gaugeSize}
              variant="arc"
            />
          </div>
        </DashboardSection>
      </div>

      <div className="flex flex-col gap-[var(--dash-gap-lg)] md:portrait:row-start-4">
        <DashboardSection title="Outpatient clinics" className="dash-place" style={place(3228, 524, 560)}>
          <WidgetErrorBoundary title="Outpatient clinics">
            <div className="md:landscape:-ms-[calc(3.4*var(--u))] md:landscape:w-max">
              <IsometricBars
                label="Outpatient clinics"
                segments={segmentsOrEmpty(data.distributions, "opd_appointment")}
                height="max(var(--dash-chart-h), calc(8.4 * var(--dash-stage-u, 0px)))"
              />
            </div>
          </WidgetErrorBoundary>
        </DashboardSection>
        <DashboardSection title="Call Center" className="dash-place" style={place(3189, 1350, 600)}>
          <WidgetErrorBoundary title="Call center mix">
            {/* Figma: ring centred left of the title start, "82 %" hanging outside the column. */}
            <div className="md:landscape:-ms-[calc(3.9*var(--u))] md:landscape:-mt-[calc(2.4*var(--u))] md:landscape:w-max">
              <DonutChart
                label="Call Center"
                segments={segmentsOrEmpty(data.distributions, "call_direction")}
                colors={["var(--dash-chart-inbound)", "var(--dash-chart-outbound)"]}
                displaySize={donutSize}
                startAngle={-45}
                thickness={9}
                legend="corner"
              />
            </div>
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
