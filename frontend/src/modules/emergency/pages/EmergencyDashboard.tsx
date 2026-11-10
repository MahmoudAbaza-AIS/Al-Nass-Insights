import type { DashboardPayload } from "@contracts/metrics";
import { DigitalCounter } from "@shared/visualizations/DigitalCounter";
import { KpiMetric } from "@shared/components/KpiMetric";
import { place } from "@shared/utils/stage";
import { AmbulanceIllustration } from "../components/AmbulanceIllustration";
import admittedArt from "../../../assets/figma/er-admitted.png";
import dischargedArt from "../../../assets/figma/er-discharged.png";
import referredArt from "../../../assets/figma/er-referred.png";
import lwbsArt from "../../../assets/figma/er-lwbs.png";
import doorToDoctorArt from "../../../assets/figma/kpi-er-door-to-doctor.png";
import lengthOfStayArt from "../../../assets/figma/kpi-er-length-of-stay.png";

/** Figma disposition block: illustration over label over unboxed seven-segment digits. */
function CounterBlock({ label, value, art, x }: { label: string; value: number | null; art: string; x: number }) {
  return (
    <div className="dash-place flex flex-col items-center gap-[0.5em]" style={place(x - 350, 512, 700)}>
      <img src={art} alt="" aria-hidden width={170} height={160} decoding="async" className="dash-kpi-art w-[max(3rem,calc(4.43*var(--u,0.6vw)))]" />
      <DigitalCounter label={label} value={value} variant="plain" />
    </div>
  );
}

const TILE = "gap-[calc(1.56*var(--u,0.6vw))]";

/**
 * DASH-06 Emergency Performance — Figma frame `827:9350`.
 * Landscape tablet/desktop: blocks at Figma coordinates; portrait/mobile: flow grid.
 */
export function EmergencyDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="dash-hub dash-stage md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_auto_auto_minmax(0,1fr)_auto]">
      <div className="dash-place flex justify-center md:portrait:col-span-2" style={place(1712, 294, 416, 222)}>
        <DigitalCounter label="Total ER Visits" value={m["er.visits.total"]?.value ?? null} />
      </div>

      <div className="grid grid-cols-2 gap-[var(--dash-gap)] md:contents">
        <CounterBlock label="Patients Admitted" value={m["er.admitted_count"]?.value ?? null} art={admittedArt} x={440} />
        <CounterBlock label="Patients Discharged to Home" value={m["er.discharged_home_count"]?.value ?? null} art={dischargedArt} x={1288} />
        <CounterBlock label="Patients Referred to Another Hospital" value={m["er.referred_out_count"]?.value ?? null} art={referredArt} x={2612} />
        <CounterBlock label="Left Without Being Seen" value={m["er.lwbs_count"]?.value ?? null} art={lwbsArt} x={3354} />
      </div>

      <AmbulanceIllustration className="dash-place md:portrait:col-span-2" style={place(1319, 842, 1050, 960)} />

      <div className="dash-place justify-self-center" style={place(520, 1600, 800)}>
        <KpiMetric
          label="Door to Doctor Time"
          reading={m["er.door_to_doctor_minutes"]}
          unit="min"
          art={{ src: doorToDoctorArt, width: 200, height: 240 }}
          className={TILE}
        />
      </div>
      <div className="dash-place justify-self-center" style={place(2380, 1600, 800)}>
        {/* Docs + API catalog: ER length of stay is measured in hours (Figma shows "days"). */}
        <KpiMetric
          label="Length of Stay in ER"
          reading={m["er.length_of_stay"]}
          unit="hours"
          precision={1}
          art={{ src: lengthOfStayArt, width: 200, height: 240 }}
          className={TILE}
        />
      </div>
    </div>
  );
}
