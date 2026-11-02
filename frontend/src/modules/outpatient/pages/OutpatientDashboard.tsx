import type { DashboardPayload } from "@contracts/metrics";
import { segmentsOrEmpty } from "@contracts/distributionDefinitions";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { SemiGauge } from "@shared/visualizations/SemiGauge";
import { RadarChart } from "@shared/visualizations/RadarChart";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { DonutChart } from "@shared/visualizations/DonutChart";
import { formatDurationMinutes } from "@shared/utils/format";
import { place } from "@shared/utils/stage";
import { ClinicIllustration } from "../components/ClinicIllustration";
import referralArt from "../../../assets/figma/kpi-referral.png";
import leadTimeArt from "../../../assets/figma/kpi-lead-time.png";
import clinicUtilizationArt from "../../../assets/figma/kpi-clinic-utilization.png";
import visitsPerPhysicianArt from "../../../assets/figma/kpi-visits-physician.png";

const ART_W = "max(3.5rem, calc(4.4 * var(--u, 0.6vw)))";
const TILE = "gap-[calc(var(--dash-gap)*1.6)]";
/** Figma centres these section titles over their columns. */
const CENTERED = "flex flex-col items-center [&>header]:mx-auto";

/**
 * DASH-05 Outpatient Clinic Performance — Figma frame `827:7417`.
 * Landscape tablet/desktop: blocks at Figma coordinates; portrait/mobile: flow grid.
 */
export function OutpatientDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;
  const consultation = data.series?.consultation_by_day ?? [];

  return (
    <div className="dash-hub dash-stage md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_auto_minmax(0,1fr)_auto]">
      <div className="dash-place flex justify-center md:portrait:col-span-2" style={place(1712, 236, 416, 230)}>
        <DigitalCounter label="Total OPD Visits" value={m["opd.visits.attended"]?.value ?? null} />
      </div>

      <div className="grid grid-cols-1 gap-[var(--dash-gap)] sm:grid-cols-2 md:portrait:col-span-2">
        <div className="dash-place" style={place(340, 556, 700)}>
          <KpiMetric label="Referral" reading={m["opd.referral_rate"]} unit="%" art={{ src: referralArt, width: 160, height: 187 }} artWidth={ART_W} className={TILE} />
        </div>
        <div className="dash-place" style={place(1070, 556, 820)}>
          <KpiMetric label="Appointment Lead Time" reading={m["opd.appointment_lead_days"]} unit="Days" art={{ src: leadTimeArt, width: 160, height: 187 }} artWidth={ART_W} className={TILE} />
        </div>
        <div className="dash-place" style={place(2123, 556, 760)}>
          <KpiMetric label="Clinic Utilization" reading={m["opd.clinic_utilization"]} unit="%" art={{ src: clinicUtilizationArt, width: 180, height: 187 }} artWidth={ART_W} className={TILE} />
        </div>
        <div className="dash-place" style={place(3023, 556, 760)}>
          <KpiMetric label="Visits per Physician" reading={m["opd.visits_per_physician"]} art={{ src: visitsPerPhysicianArt, width: 173, height: 187 }} artWidth={ART_W} className={TILE} />
        </div>
      </div>

      <ClinicIllustration className="dash-place md:portrait:col-span-2" style={place(1140, 830, 1440, 1070)} />

      <div className="flex flex-col items-center gap-[var(--dash-gap-lg)]">
        <div className="dash-place flex justify-center" style={place(420, 900, 400)}>
          <SemiGauge label="Waiting Time" value={m["opd.waiting_minutes"]?.value ?? null} max={60} unit="min" />
        </div>
        <DashboardSection title="Consultation Time" className={`dash-place ${CENTERED}`} style={place(425, 1478, 389)}>
          <RadarChart
            label="Consultation time by weekday"
            points={consultation}
            averageLabel={`Avg. ${formatDurationMinutes(m["opd.consultation_minutes"]?.value ?? null)}`}
            maxValue={30}
          />
        </DashboardSection>
      </div>

      <div className="flex flex-col items-center gap-[var(--dash-gap-lg)]">
        <div className="dash-place flex justify-center" style={place(2864, 920, 715)}>
          <RadialGauge
            label="Follow-up Compliance"
            value={m["opd.followup_compliance"]?.value ?? null}
            tone="teal"
            variant="arc"
            displaySize="max(var(--dash-gauge-lg), calc(8.6 * var(--dash-stage-u, 0px)))"
          />
        </div>
        <DashboardSection title="Appointment Performance" className={`dash-place ${CENTERED}`} style={place(2864, 1478, 715)}>
          <div className="md:landscape:-ms-[calc(2.2*var(--u))] md:landscape:mt-[calc(0.6*var(--u))]">
            <DonutChart
              label="Appointment Performance"
              segments={segmentsOrEmpty(data.distributions, "opd_appointment")}
              displaySize="max(var(--dash-gauge-lg), calc(10.6 * var(--dash-stage-u, 0px)))"
              startAngle={-5}
              thickness={9}
              legend="side"
            />
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
