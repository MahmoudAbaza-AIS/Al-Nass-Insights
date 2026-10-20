import type { DashboardPayload } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { OperatingRoomIllustration } from "@shared/components/illustrations/CentralIllustrations";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { StatusLegend } from "@shared/components/StatusLegend";

export function OperatingRoomDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;
  const rooms = data.orRooms;

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricValue label="OR Utilization Rate" reading={m["or.utilization_rate"]} unit="%" />
        <MetricValue label="First Case On-Time Start" reading={m["or.first_case_ontime"]} unit="%" />
        <MetricValue label="Turnover Time" reading={m["or.turnover_minutes"]} unit="min" />
        <MetricValue
          label="Cancellation Rate"
          reading={m["or.cancellation_rate"]}
          unit="%"
          tone="critical"
        />
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(14rem,22rem)_1fr]">
        <RadialGauge
          label="Postoperative Complication Rate"
          value={m["or.postop_complication_rate"]?.value ?? null}
          tone="danger"
          size={140}
        />
        <IllustrationPanel label="Operating room illustration" aspectRatio="4 / 3">
          <OperatingRoomIllustration />
        </IllustrationPanel>
        <RadialGauge
          label="Surgical Site Infection Rate"
          value={m["or.ssi_rate"]?.value ?? null}
          tone="danger"
          size={140}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricValue
          label="Daily No. of surgeries & cath"
          reading={m["or.daily_surgeries_cath"]}
        />
        <DashboardSection title="Total ORs">
          {rooms ? (
            <div>
              <div className="mb-2 text-3xl font-bold text-[var(--dash-cyan)]">{rooms.total}</div>
              <div className="mb-2 flex flex-wrap gap-2" aria-label={`${rooms.active} active, ${rooms.idle} idle`}>
                {Array.from({ length: rooms.total }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-3.5 w-3.5 rounded-full ${
                      i < rooms.active
                        ? "bg-[var(--dash-success)] shadow-[0_0_8px_var(--dash-success)]"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <StatusLegend
                items={[
                  { color: "var(--dash-success)", label: "Active" },
                  { color: "rgba(255,255,255,0.25)", label: "Idle" },
                ]}
              />
            </div>
          ) : (
            <p className="text-[var(--dash-label)]">OR room status unavailable</p>
          )}
        </DashboardSection>
        <MetricValue
          label="Reoperation Rate"
          reading={m["or.reoperation_rate"]}
          unit="%"
          tone="critical"
        />
      </div>
    </div>
  );
}
