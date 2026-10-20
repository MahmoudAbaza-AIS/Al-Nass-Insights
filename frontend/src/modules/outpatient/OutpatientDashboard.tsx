import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { ClinicIllustration } from "@shared/components/illustrations/CentralIllustrations";
import { SemiGauge } from "@shared/visualizations/SemiGauge";
import { RadarChart } from "@shared/visualizations/RadarChart";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { DonutChart } from "@shared/visualizations/DonutChart";
import { formatDurationMinutes } from "@shared/utils/format";

export function OutpatientDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;
  const consultation = data.series?.consultation_by_day ?? [];

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6">
      <div className="flex justify-center">
        <DigitalCounter label="Total OPD Visits" value={m["opd.visits.attended"]?.value ?? null} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricValue label="Referral" reading={m["opd.referral_rate"]} unit="%" />
        <MetricValue
          label="Appointment Lead Time"
          reading={m["opd.appointment_lead_days"]}
          unit="Days"
        />
        <MetricValue label="Clinic Utilization" reading={m["opd.clinic_utilization"]} unit="%" />
        <MetricValue label="Visits per Physician" reading={m["opd.visits_per_physician"]} />
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(14rem,22rem)_1fr]">
        <div className="space-y-6">
          <SemiGauge
            label="Waiting Time"
            value={m["opd.waiting_minutes"]?.value ?? null}
            max={60}
            unit="min"
          />
          <DashboardSection title="Consultation Time">
            <RadarChart
              label="Consultation time by weekday"
              points={consultation}
              averageLabel={`Avg. ${formatDurationMinutes(m["opd.consultation_minutes"]?.value ?? null)}`}
              maxValue={30}
            />
          </DashboardSection>
        </div>

        <IllustrationPanel label="Outpatient clinic illustration" aspectRatio="4 / 3">
          <ClinicIllustration />
        </IllustrationPanel>

        <div className="space-y-6">
          <RadialGauge
            label="Follow-up Compliance"
            value={m["opd.followup_compliance"]?.value ?? null}
            size={140}
            strokeWidth={14}
          />
          <DashboardSection title="Appointment Performance">
            <DonutChart
              label="Appointment Performance"
              segments={data.distributions.opd_appointment ?? []}
              colors={[
                "var(--dash-chart-ontime)",
                "var(--dash-chart-noshow)",
                "var(--dash-chart-cancel)",
              ]}
            />
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
