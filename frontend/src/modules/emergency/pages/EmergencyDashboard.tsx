import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { KpiMetric, KpiPedestal } from "@shared/components/KpiMetric";
import { AmbulanceIllustration } from "../components/AmbulanceIllustration";

function CounterBlock({ label, value, icon }: { label: string; value: number | null; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-[0.4em]">
      <KpiPedestal icon={icon} />
      <DigitalCounter label={label} value={value} variant="plain" />
    </div>
  );
}

export function EmergencyDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub md:landscape:grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,1.3fr)_repeat(2,minmax(0,1fr))] md:landscape:grid-rows-[auto_auto_minmax(0,1fr)_auto] md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_auto_auto_minmax(0,1fr)_auto]">
      <div className="flex justify-center md:landscape:col-span-5 md:portrait:col-span-2">
        <DigitalCounter label="Total ER Visits" value={m["er.visits.total"]?.value ?? null} />
      </div>

      <div className="grid grid-cols-2 gap-[var(--dash-gap)] md:contents">
        <CounterBlock label="Patients Admitted" value={m["er.admitted_count"]?.value ?? null} icon="pi-inbox" />
        <CounterBlock
          label="Patients Discharged to Home"
          value={m["er.discharged_home_count"]?.value ?? null}
          icon="pi-home"
        />
        <div className="md:landscape:col-start-4">
          <CounterBlock
            label="Patients Referred to Another Hospital"
            value={m["er.referred_out_count"]?.value ?? null}
            icon="pi-building"
          />
        </div>
        <CounterBlock label="Left Without Being Seen" value={m["er.lwbs_count"]?.value ?? null} icon="pi-sign-out" />
      </div>

      <AmbulanceIllustration className="md:landscape:col-span-3 md:landscape:col-start-2 md:landscape:row-start-3 md:portrait:col-span-2" />

      <KpiMetric
        label="Door to Doctor Time"
        reading={m["er.door_to_doctor_minutes"]}
        unit="min"
        icon="pi-users"
        className="justify-self-center md:landscape:col-span-2 md:landscape:col-start-1 md:landscape:row-start-4"
      />
      <KpiMetric
        label="Length of Stay in ER"
        reading={m["er.length_of_stay"]}
        unit="days"
        precision={1}
        icon="pi-clock"
        className="justify-self-center md:landscape:col-span-2 md:landscape:col-start-4 md:landscape:row-start-4"
      />
    </div>
  );
}
