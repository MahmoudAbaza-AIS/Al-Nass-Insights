import type { DashboardPayload } from "@contracts/metrics";
import { KpiIconShell, KpiMetric } from "@shared/components/KpiMetric";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { OperatingRoomIllustration } from "../components/OperatingRoomIllustration";
import { OrRoomsPanel } from "../components/OrRoomsPanel";

export function OperatingRoomDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub h-full min-h-0">
      <div className="grid shrink-0 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        <KpiMetric
          label="OR Utilization Rate"
          reading={m["or.utilization_rate"]}
          unit="%"
          icon={
            <KpiIconShell>
              <i className="pi pi-box text-xl" />
            </KpiIconShell>
          }
        />
        <KpiMetric
          label="First Case On-Time Start"
          reading={m["or.first_case_ontime"]}
          unit="%"
          icon={
            <KpiIconShell>
              <i className="pi pi-clock text-xl" />
            </KpiIconShell>
          }
        />
        <KpiMetric
          label="Turnover Time"
          reading={m["or.turnover_minutes"]}
          unit="min"
          icon={
            <KpiIconShell>
              <i className="pi pi-sync text-xl" />
            </KpiIconShell>
          }
        />
        <KpiMetric
          label="Cancellation Rate"
          reading={m["or.cancellation_rate"]}
          unit="%"
          tone="critical"
          icon={
            <KpiIconShell tone="danger">
              <i className="pi pi-times-circle text-xl" />
            </KpiIconShell>
          }
        />
      </div>

      <div className="grid min-h-0 flex-1 items-center gap-3 lg:grid-cols-[minmax(9rem,1fr)_minmax(16rem,26rem)_minmax(9rem,1fr)] lg:gap-2">
        <div className="flex justify-center lg:justify-end">
          <RadialGauge
            label="Postoperative Complication Rate"
            value={m["or.postop_complication_rate"]?.value ?? null}
            tone="danger"
            size={150}
            strokeWidth={12}
          />
        </div>

        <div className="flex min-h-0 flex-col items-center gap-2 md:gap-3">
          <IllustrationPanel label="Operating room illustration" aspectRatio="auto">
            <OperatingRoomIllustration />
          </IllustrationPanel>
          <OrRoomsPanel rooms={data.orRooms} />
        </div>

        <div className="flex justify-center lg:justify-start">
          <RadialGauge
            label="Surgical Site Infection Rate"
            value={m["or.ssi_rate"]?.value ?? null}
            tone="danger"
            size={150}
            strokeWidth={12}
          />
        </div>
      </div>

      <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:mx-auto lg:max-w-5xl">
        <KpiMetric
          label="Daily No of surgeries & cath"
          reading={m["or.daily_surgeries_cath"]}
          size="lg"
          icon={
            <KpiIconShell>
              <i className="pi pi-file text-xl" />
            </KpiIconShell>
          }
        />
        <KpiMetric
          label="Reoperation Rate"
          reading={m["or.reoperation_rate"]}
          unit="%"
          tone="critical"
          size="lg"
          icon={
            <KpiIconShell tone="danger">
              <i className="pi pi-replay text-xl" />
            </KpiIconShell>
          }
        />
      </div>
    </div>
  );
}
