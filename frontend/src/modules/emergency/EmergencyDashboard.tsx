import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { MetricValue } from "@shared/components/MetricValue";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { AmbulanceIllustration } from "@shared/components/illustrations/CentralIllustrations";

export function EmergencyDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8">
      <div className="flex justify-center">
        <DigitalCounter label="Total ER Visits" value={m["er.visits.total"]?.value ?? null} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DigitalCounter label="Patients Admitted" value={m["er.admitted_count"]?.value ?? null} />
        <DigitalCounter
          label="Patients Discharged to Home"
          value={m["er.discharged_home_count"]?.value ?? null}
        />
        <DigitalCounter
          label="Patients Referred to Another Hospital"
          value={m["er.referred_out_count"]?.value ?? null}
        />
        <DigitalCounter label="Left Without Being Seen" value={m["er.lwbs_count"]?.value ?? null} />
      </div>

      <IllustrationPanel label="Ambulance illustration" className="max-w-xl" aspectRatio="16 / 9">
        <AmbulanceIllustration />
      </IllustrationPanel>

      <div className="grid gap-6 sm:grid-cols-2">
        <MetricValue
          label="Door to Doctor Time"
          reading={m["er.door_to_doctor_minutes"]}
          unit="min"
          size="lg"
        />
        <MetricValue
          label="Length of Stay in ER"
          reading={m["er.length_of_stay"]}
          unit="h"
          precision={1}
          size="lg"
          supportingText={m["er.length_of_stay"]?.supportingText}
        />
      </div>
    </div>
  );
}
