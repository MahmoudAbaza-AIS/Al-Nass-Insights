import { useState } from "react";
import type { DashboardPayload } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { CapacityIndicator } from "@shared/visualizations/CapacityIndicator";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { KpiDetailDialog } from "@shared/components/KpiDetailDialog";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { getMetricDefinition } from "@contracts/metricDefinitions";
import { useDisplayPreferences } from "@shared/providers/useDisplayPreferences";
import { place } from "@shared/utils/stage";
import { InpatientIllustration } from "../components/InpatientIllustration";
import { PatientExperiencePanel } from "../components/PatientExperiencePanel";
import bedOccupancyArt from "../../../assets/figma/kpi-ip-bed-occupancy.png";
import alosArt from "../../../assets/figma/kpi-ip-alos.png";
import bedTurnoverArt from "../../../assets/figma/kpi-ip-bed-turnover.png";
import cancellationArt from "../../../assets/figma/kpi-ip-cancellation.png";
import readmissionArt from "../../../assets/figma/kpi-readmission.png";

/** Top-row tiles: Figma text block starts ~1.8u below the icon top. */
const TOP_TILE = "gap-[calc(var(--dash-gap)*2.2)] !items-start [&>div]:mt-[calc(1.8*var(--dash-stage-u,0px))]";
const GAUGE_SIZE = "max(var(--dash-gauge-md), calc(8.3 * var(--dash-stage-u, 0px)))";

/**
 * DASH-07 Inpatient Services Performance — Figma frame `827:11123`.
 * Landscape tablet/desktop: blocks at Figma coordinates; portrait/mobile: flow grid.
 */
export function InpatientDashboard({ data }: { data: DashboardPayload }) {
  const prefs = useDisplayPreferences();
  const [detailId, setDetailId] = useState<string | null>(null);
  const m = data.metrics;

  return (
    <div className="dash-hub dash-stage md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_minmax(0,1fr)_auto_auto]">
      <div className="grid grid-cols-1 gap-[var(--dash-gap)] sm:grid-cols-2 md:portrait:col-span-2">
        <div className="dash-place" style={place(370, 360, 800)}>
          <KpiMetric
            label="Bed Occupancy"
            reading={m["inpatient.bed_occupancy_rate"]}
            unit="%"
            art={{ src: bedOccupancyArt, width: 200, height: 210 }}
            className={TOP_TILE}
            onOpenDetail={() => setDetailId("inpatient.bed_occupancy_rate")}
          />
        </div>
        <div className="dash-place" style={place(1210, 360, 860)}>
          <KpiMetric
            label="Average Length of Stay"
            reading={m["inpatient.alos_days"]}
            unit="days"
            precision={1}
            art={{ src: alosArt, width: 200, height: 210 }}
            className={TOP_TILE}
            onOpenDetail={() => setDetailId("inpatient.alos_days")}
          />
        </div>
        <div className="dash-place" style={place(2130, 360, 900)}>
          <KpiMetric
            label="Bed Turnover"
            reading={m["inpatient.bed_turnover"]}
            unit="patients/bed"
            art={{ src: bedTurnoverArt, width: 200, height: 210 }}
            className={TOP_TILE}
            onOpenDetail={() => setDetailId("inpatient.bed_turnover")}
          />
        </div>
        <div className="dash-place" style={place(3040, 360, 780)}>
          {/* KPI review: relabel "Admission Cancellation Rate" so it is not confused with the OR KPI. */}
          <KpiMetric
            label="Admission Cancellation Rate"
            className={`${TOP_TILE} xl:[&_*]:whitespace-nowrap`}
            reading={m["inpatient.cancellation_rate"]}
            unit="%"
            tone="critical"
            art={{ src: cancellationArt, width: 200, height: 210 }}
            onOpenDetail={() => setDetailId("inpatient.cancellation_rate")}
          />
        </div>
      </div>

      <InpatientIllustration className="dash-place md:portrait:col-span-2" style={place(1440, 740, 920, 960)} />

      <div className="dash-place justify-self-center" style={place(1090, 810, 700)}>
        <WidgetErrorBoundary title="Bed capacity">
          <CapacityIndicator capacity={data.capacity} title="Bed Capacity" />
        </WidgetErrorBoundary>
      </div>

      <div className="dash-place justify-self-center" style={place(2760, 900, 900)}>
        <KpiMetric
          label="Readmission Rate"
          reading={m["inpatient.readmission_rate"]}
          unit="%"
          art={{ src: readmissionArt, width: 290, height: 350 }}
          artWidth="max(4rem, calc(7.55 * var(--u, 0.6vw)))"
          order="value-first"
          className="gap-[calc(0.9*var(--u,0.6vw))] !items-end [&>div]:mb-[calc(0.3*var(--dash-stage-u,0px))]"
          onOpenDetail={() => setDetailId("inpatient.readmission_rate")}
        />
      </div>

      <PatientExperiencePanel
        reading={m["inpatient.satisfaction_score"]}
        className="dash-place justify-self-center"
        style={place(512, 1366, 560)}
      />

      <div className="flex flex-wrap justify-center gap-[var(--dash-gap-lg)]">
        <div className="dash-place flex justify-center" style={place(2282, 1500, 600)}>
          <RadialGauge
            label="Complaint Rate"
            value={m["inpatient.complaint_rate"]?.value ?? null}
            tone="warning"
            variant="arc"
            displaySize={GAUGE_SIZE}
          />
        </div>
        <div className="dash-place flex justify-center" style={place(3038, 1500, 600)}>
          <RadialGauge
            label="Patient Violation Rate"
            value={m["inpatient.violation_rate"]?.value ?? null}
            tone="danger"
            variant="arc"
            displaySize={GAUGE_SIZE}
          />
        </div>
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
