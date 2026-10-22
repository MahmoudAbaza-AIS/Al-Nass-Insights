import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { KpiIconShell, KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
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
    <div className="dash-hub h-full min-h-0">
      <div className="flex shrink-0 justify-center">
        <DigitalCounter label="Total OPD Visits" value={m["opd.visits.attended"]?.value ?? null} />
      </div>

      <div className="grid shrink-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiMetric
          label="Referral"
          reading={m["opd.referral_rate"]}
          unit="%"
          icon={
            <KpiIconShell>
              <i className="pi pi-sync text-xl" />
            </KpiIconShell>
          }
        />
        <KpiMetric
          label="Appointment Lead Time"
          reading={m["opd.appointment_lead_days"]}
          unit="Days"
          icon={
            <KpiIconShell>
              <i className="pi pi-calendar text-xl" />
            </KpiIconShell>
          }
        />
        <KpiMetric
          label="Clinic Utilization"
          reading={m["opd.clinic_utilization"]}
          unit="%"
          icon={
            <KpiIconShell>
              <i className="pi pi-desktop text-xl" />
            </KpiIconShell>
          }
        />
        <KpiMetric
          label="Visits per Physician"
          reading={m["opd.visits_per_physician"]}
          icon={
            <KpiIconShell>
              <i className="pi pi-user text-xl" />
            </KpiIconShell>
          }
        />
      </div>

      <div className="grid min-h-0 flex-1 items-start gap-4 lg:grid-cols-[minmax(12rem,1fr)_minmax(14rem,24rem)_minmax(12rem,1fr)] lg:gap-5">
        <div className="flex min-h-0 flex-col gap-4 md:gap-5">
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

        <IllustrationPanel label="Outpatient clinic illustration" aspectRatio="auto" className="self-center">
          <ClinicIllustration />
        </IllustrationPanel>

        <div className="flex min-h-0 flex-col gap-4 md:gap-5">
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
              size={160}
              strokeWidth={18}
            />
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
