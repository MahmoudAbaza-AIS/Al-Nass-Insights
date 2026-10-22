import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { SemiGauge } from "@shared/visualizations/SemiGauge";
import { RadarChart } from "@shared/visualizations/RadarChart";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { DonutChart } from "@shared/visualizations/DonutChart";
import { formatDurationMinutes } from "@shared/utils/format";
import { ClinicIllustration } from "../components/ClinicIllustration";

export function OutpatientDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;
  const consultation = data.series?.consultation_by_day ?? [];

  return (
    <div className="dash-hub md:landscape:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)_minmax(0,1fr)] md:landscape:grid-rows-[auto_auto_minmax(0,1fr)] md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_auto_minmax(0,1fr)_auto]">
      <div className="flex justify-center md:landscape:col-span-3 md:portrait:col-span-2">
        <DigitalCounter label="Total OPD Visits" value={m["opd.visits.attended"]?.value ?? null} />
      </div>

      <div className="grid grid-cols-1 gap-[var(--dash-gap)] sm:grid-cols-2 md:landscape:col-span-3 md:landscape:grid-cols-4 md:portrait:col-span-2">
        <KpiMetric label="Referral" reading={m["opd.referral_rate"]} unit="%" icon="pi-arrow-right-arrow-left" />
        <KpiMetric label="Appointment Lead Time" reading={m["opd.appointment_lead_days"]} unit="Days" icon="pi-calendar" />
        <KpiMetric label="Clinic Utilization" reading={m["opd.clinic_utilization"]} unit="%" icon="pi-gauge" />
        <KpiMetric label="Visits per Physician" reading={m["opd.visits_per_physician"]} icon="pi-user" />
      </div>

      <ClinicIllustration className="md:landscape:col-start-2 md:landscape:row-start-3 md:portrait:col-span-2" />

      <div className="flex flex-col items-center gap-[var(--dash-gap-lg)] md:landscape:col-start-1 md:landscape:row-start-3 md:landscape:justify-around">
        <SemiGauge label="Waiting Time" value={m["opd.waiting_minutes"]?.value ?? null} max={60} unit="min" />
        <DashboardSection title="Consultation Time">
          <RadarChart
            label="Consultation time by weekday"
            points={consultation}
            averageLabel={`Avg. ${formatDurationMinutes(m["opd.consultation_minutes"]?.value ?? null)}`}
            maxValue={30}
          />
        </DashboardSection>
      </div>

      <div className="flex flex-col items-center gap-[var(--dash-gap-lg)] md:landscape:col-start-3 md:landscape:row-start-3 md:landscape:justify-around">
        <RadialGauge
          label="Follow-up Compliance"
          value={m["opd.followup_compliance"]?.value ?? null}
          tone="teal"
          displaySize="var(--dash-gauge-lg)"
        />
        <DashboardSection title="Appointment Performance">
          <DonutChart
            label="Appointment Performance"
            segments={data.distributions.opd_appointment ?? []}
            displaySize="var(--dash-gauge-lg)"
          />
        </DashboardSection>
      </div>
    </div>
  );
}
