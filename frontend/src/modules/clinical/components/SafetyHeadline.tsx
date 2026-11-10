import type { MetricReading } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { place } from "@shared/utils/stage";
import pressureUlcerArt from "../../../assets/figma/kpi-pressure-ulcer.png";
import fallsArt from "../../../assets/figma/kpi-falls.png";

interface SafetyHeadlineProps {
  metrics: Record<string, MetricReading>;
}

/** Figma top KPI row (`Frame 2611124` / `Frame 2611086`): ulcer tile, three arc gauges, falls tile. */
const GAUGE_SIZE = "max(var(--dash-gauge-md), calc(7.3 * var(--dash-stage-u, 0px)))";

export function SafetyHeadline({ metrics: m }: SafetyHeadlineProps) {
  return (
    <div className="grid items-center gap-[var(--dash-gap)] sm:grid-cols-2">
      <div className="dash-place justify-self-center" style={place(196, 256, 780)}>
        <KpiMetric
          label="Pressure Ulcer Rate"
          reading={m["clinical.pressure_ulcer_rate"]}
          unit="per 1,000 patients"
          unitTone="label"
          art={{ src: pressureUlcerArt, width: 210, height: 230 }}
          className="!items-start gap-[calc(var(--dash-gap)*2.4)] [&>div]:mt-[calc(2.2*var(--dash-stage-u,0px))]"
        />
      </div>
      <div
        className="dash-place flex flex-wrap justify-center gap-[var(--dash-gap-lg)] sm:order-last sm:col-span-2 md:landscape:justify-between md:landscape:gap-0"
        style={place(1266, 262, 1309)}
      >
        <RadialGauge
          label="Adverse Events Rate"
          value={m["clinical.adverse_events_rate"]?.value ?? null}
          tone="danger"
          variant="arc"
          displaySize={GAUGE_SIZE}
        />
        <RadialGauge
          label="Missed Diagnosis Rate"
          value={m["clinical.missed_diagnosis_rate"]?.value ?? null}
          tone="danger"
          variant="arc"
          displaySize={GAUGE_SIZE}
        />
        <RadialGauge
          label="VTE Compliance"
          value={m["clinical.vte_compliance"]?.value ?? null}
          tone="teal"
          variant="arc"
          displaySize={GAUGE_SIZE}
        />
      </div>
      <div className="dash-place justify-self-center" style={place(2986, 256, 780)}>
        <KpiMetric
          label="Falls Rate"
          reading={m["clinical.falls_rate"]}
          unit="per 1,000 patients"
          unitTone="label"
          art={{ src: fallsArt, width: 230, height: 210 }}
          className="!items-start gap-[calc(var(--dash-gap)*2.4)] [&>div]:mt-[calc(2.2*var(--dash-stage-u,0px))]"
        />
      </div>
    </div>
  );
}
