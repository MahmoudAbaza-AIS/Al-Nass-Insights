import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { KpiIconShell, KpiMetric } from "@shared/components/KpiMetric";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { AmbulanceIllustration } from "../components/AmbulanceIllustration";

function CounterBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | null;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <KpiIconShell>
        <i className={`pi ${icon} text-xl`} />
      </KpiIconShell>
      <DigitalCounter label={label} value={value} />
    </div>
  );
}

export function EmergencyDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub h-full min-h-0">
      <div className="flex shrink-0 justify-center">
        <DigitalCounter label="Total ER Visits" value={m["er.visits.total"]?.value ?? null} />
      </div>

      <div className="grid min-h-0 flex-1 items-center gap-3 lg:grid-cols-[1fr_minmax(16rem,28rem)_1fr] lg:gap-4">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <CounterBlock
            label="Patients Admitted"
            value={m["er.admitted_count"]?.value ?? null}
            icon="pi-inbox"
          />
          <CounterBlock
            label="Patients Discharged to Home"
            value={m["er.discharged_home_count"]?.value ?? null}
            icon="pi-home"
          />
        </div>

        <IllustrationPanel label="Ambulance illustration" aspectRatio="auto">
          <AmbulanceIllustration />
        </IllustrationPanel>

        <div className="flex flex-col items-center gap-6 md:gap-8">
          <CounterBlock
            label="Patients Referred to Another Hospital"
            value={m["er.referred_out_count"]?.value ?? null}
            icon="pi-building"
          />
          <CounterBlock
            label="Left Without Being Seen"
            value={m["er.lwbs_count"]?.value ?? null}
            icon="pi-sign-out"
          />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-4xl shrink-0 gap-5 sm:grid-cols-2 md:gap-8">
        <KpiMetric
          label="Door to Doctor Time"
          reading={m["er.door_to_doctor_minutes"]}
          unit="min"
          size="lg"
          icon={
            <KpiIconShell>
              <i className="pi pi-users text-xl" />
            </KpiIconShell>
          }
        />
        <KpiMetric
          label="Length of Stay in ER"
          reading={m["er.length_of_stay"]}
          unit="days"
          precision={1}
          size="lg"
          icon={
            <KpiIconShell>
              <i className="pi pi-clock text-xl" />
            </KpiIconShell>
          }
        />
      </div>
    </div>
  );
}
