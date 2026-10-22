import type { DashboardPayload } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { OperatingRoomIllustration } from "../components/OperatingRoomIllustration";
import { OrRoomsPanel } from "../components/OrRoomsPanel";

export function OperatingRoomDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub md:landscape:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)] md:landscape:grid-rows-[auto_minmax(0,1fr)_auto_auto] md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_minmax(0,1fr)_auto_auto_auto]">
      <div className="grid grid-cols-1 gap-[var(--dash-gap)] sm:grid-cols-2 md:landscape:col-span-3 md:landscape:grid-cols-4 md:portrait:col-span-2">
        <KpiMetric label="OR Utilization Rate" reading={m["or.utilization_rate"]} unit="%" icon="pi-desktop" />
        <KpiMetric label="First Case On-Time Start" reading={m["or.first_case_ontime"]} unit="%" icon="pi-clock" />
        <KpiMetric label="Turnover Time" reading={m["or.turnover_minutes"]} unit="min" icon="pi-sync" />
        <KpiMetric
          label="Cancellation Rate"
          reading={m["or.cancellation_rate"]}
          unit="%"
          tone="critical"
          icon="pi-times-circle"
          iconTone="danger"
        />
      </div>

      <OperatingRoomIllustration className="md:landscape:col-start-2 md:landscape:row-span-2 md:landscape:row-start-2 md:portrait:col-span-2" />

      <div className="flex justify-center md:landscape:col-start-1 md:landscape:row-start-2 md:landscape:items-center md:landscape:justify-end">
        <RadialGauge
          label="Postoperative Complication Rate"
          value={m["or.postop_complication_rate"]?.value ?? null}
          tone="danger"
          displaySize="var(--dash-gauge-lg)"
        />
      </div>
      <div className="flex justify-center md:landscape:col-start-3 md:landscape:row-start-2 md:landscape:items-center md:landscape:justify-start">
        <RadialGauge
          label="Surgical Site Infection Rate"
          value={m["or.ssi_rate"]?.value ?? null}
          tone="danger"
          displaySize="var(--dash-gauge-lg)"
        />
      </div>

      <KpiMetric
        label="Daily No of surgeries & cath"
        reading={m["or.daily_surgeries_cath"]}
        icon="pi-file-check"
        order="value-first"
        size="lg"
        className="justify-self-center md:landscape:col-start-1 md:landscape:row-start-3 md:landscape:justify-self-start"
      />
      <KpiMetric
        label="Reoperation Rate"
        reading={m["or.reoperation_rate"]}
        unit="%"
        tone="critical"
        icon="pi-replay"
        iconTone="danger"
        order="value-first"
        size="lg"
        className="justify-self-center md:landscape:col-start-3 md:landscape:row-start-3 md:landscape:justify-self-end"
      />

      <div className="md:landscape:col-start-2 md:landscape:row-start-4 md:portrait:col-span-2">
        <OrRoomsPanel rooms={data.orRooms} />
      </div>
    </div>
  );
}
