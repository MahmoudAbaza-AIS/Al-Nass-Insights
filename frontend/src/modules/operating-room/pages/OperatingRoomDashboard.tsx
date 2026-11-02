import type { DashboardPayload } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { place } from "@shared/utils/stage";
import { OperatingRoomIllustration } from "../components/OperatingRoomIllustration";
import { OrRoomsPanel } from "../components/OrRoomsPanel";
import utilizationArt from "../../../assets/figma/kpi-or-utilization.png";
import firstCaseArt from "../../../assets/figma/kpi-first-case.png";
import turnoverArt from "../../../assets/figma/kpi-turnover.png";
import cancellationArt from "../../../assets/figma/kpi-cancellation.png";
import dailySurgeriesArt from "../../../assets/figma/kpi-daily-surgeries.png";
import reoperationArt from "../../../assets/figma/kpi-reoperation.png";

const TILE_GAP = "gap-[calc(var(--dash-gap)*2.2)]";
/** Top-row tiles: Figma text block starts ~1.8u below the icon top. */
const TOP_TILE = `${TILE_GAP} !items-start [&>div]:mt-[calc(1.8*var(--dash-stage-u,0px))]`;
const GAUGE_SIZE = "max(var(--dash-gauge-lg), calc(7.4 * var(--dash-stage-u, 0px)))";

/**
 * DASH-03 Operating Room Performance — Figma frame `827:10141`.
 * Landscape tablet/desktop: blocks at Figma coordinates; portrait/mobile: flow grid.
 */
export function OperatingRoomDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub dash-stage md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_minmax(0,1fr)_auto_auto_auto]">
      <div className="grid grid-cols-1 gap-[var(--dash-gap)] sm:grid-cols-2 md:portrait:col-span-2">
        <div className="dash-place" style={place(326, 352, 800)}>
          <KpiMetric label="OR Utilization Rate" reading={m["or.utilization_rate"]} unit="%" art={{ src: utilizationArt, width: 190, height: 205 }} className={TOP_TILE} />
        </div>
        <div className="dash-place" style={place(1176, 352, 860)}>
          <KpiMetric label="First Case On-Time Start" reading={m["or.first_case_ontime"]} unit="%" art={{ src: firstCaseArt, width: 190, height: 205 }} className={TOP_TILE} />
        </div>
        <div className="dash-place" style={place(2136, 352, 760)}>
          <KpiMetric label="Turnover Time" reading={m["or.turnover_minutes"]} unit="min" art={{ src: turnoverArt, width: 200, height: 205 }} className={TOP_TILE} />
        </div>
        <div className="dash-place" style={place(2918, 352, 800)}>
          <KpiMetric
            label="Cancellation Rate"
            reading={m["or.cancellation_rate"]}
            unit="%"
            tone="critical"
            art={{ src: cancellationArt, width: 200, height: 205 }}
            className={TOP_TILE}
          />
        </div>
      </div>

      <OperatingRoomIllustration className="dash-place md:portrait:col-span-2" style={place(1260, 650, 1340, 1150)} />

      <div className="dash-place flex justify-center" style={place(652, 960, 600)}>
        <RadialGauge
          label="Postoperative Complication Rate"
          value={m["or.postop_complication_rate"]?.value ?? null}
          tone="danger"
          variant="arc"
          displaySize={GAUGE_SIZE}
        />
      </div>
      <div className="dash-place flex justify-center" style={place(2676, 960, 600)}>
        <RadialGauge
          label="Surgical Site Infection Rate"
          value={m["or.ssi_rate"]?.value ?? null}
          tone="danger"
          variant="arc"
          displaySize={GAUGE_SIZE}
        />
      </div>

      <div className="dash-place justify-self-center" style={place(366, 1600, 800)}>
        <KpiMetric
          label="Daily No of surgeries & cath"
          reading={m["or.daily_surgeries_cath"]}
          art={{ src: dailySurgeriesArt, width: 190, height: 215 }}
          order="value-first"
          className={TILE_GAP}
        />
      </div>
      <div className="dash-place justify-self-center" style={place(2962, 1600, 700)}>
        <KpiMetric
          label="Reoperation Rate"
          reading={m["or.reoperation_rate"]}
          unit="%"
          tone="critical"
          art={{ src: reoperationArt, width: 200, height: 215 }}
          order="value-first"
          className={TILE_GAP}
        />
      </div>

      <div className="dash-place md:portrait:col-span-2" style={place(1380, 1916, 1080)}>
        <OrRoomsPanel rooms={data.orRooms} />
      </div>
    </div>
  );
}
