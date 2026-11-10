import type { DashboardPayload } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { StackedBarChart } from "@shared/visualizations/StackedBarChart";
import { LineTrend } from "@shared/visualizations/LineTrend";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { place } from "@shared/utils/stage";
import { CallCenterIllustration } from "../components/CallCenterIllustration";
import callVolumeArt from "../../../assets/figma/kpi-call-volume.png";
import serviceLevelArt from "../../../assets/figma/kpi-service-level.png";
import handleTimeArt from "../../../assets/figma/kpi-handle-time.png";
import abandonedArt from "../../../assets/figma/kpi-abandoned.png";

/** Figma art widths (4K px ÷ 38.4 = u); floors keep them legible on small screens. */
const artWidth = (figmaPx: number) => `max(4rem, calc(${figmaPx / 38.4} * var(--u, 0.6vw)))`;

/**
 * DASH-04 Call Center Performance — Figma frame `827:6832`.
 * Landscape tablet/desktop: blocks at Figma coordinates; portrait/mobile: flow grid.
 */
export function CallCenterDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;
  const inbound = data.series?.["callcenter.volume_by_day"] ?? [];
  const outbound = data.series?.call_outbound_by_day ?? [];
  const abandon = data.series?.["callcenter.abandon_trend"] ?? [];

  return (
    <div className="dash-hub dash-stage md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_auto_minmax(0,1fr)_auto]">
      <div className="dash-place justify-self-center" style={place(960, 360, 900)}>
        <KpiMetric
          label="Total Call Volume"
          reading={m["callcenter.volume_total"]}
          supportingText="Inbound & Outbound"
          art={{ src: callVolumeArt, width: 345, height: 285 }}
          artWidth={artWidth(345)}
          size="lg"
          className="gap-[calc(1.54*var(--u,0.6vw))]"
        />
      </div>
      <div className="dash-place justify-self-center" style={place(1985, 350, 900)}>
        <KpiMetric
          label="Service Level"
          reading={m["callcenter.service_level_20s"]}
          unit="%"
          supportingText="Answered within 20 Sec"
          art={{ src: serviceLevelArt, width: 295, height: 350 }}
          artWidth={artWidth(295)}
          iconPosition="end"
          size="lg"
          className="gap-[calc(1.98*var(--u,0.6vw))]"
        />
      </div>
      <div className="dash-place justify-self-center" style={place(540, 780, 800)}>
        <KpiMetric
          label="Average Handle Time"
          reading={m["callcenter.aht"]}
          unit="min"
          precision={2}
          art={{ src: handleTimeArt, width: 225, height: 375 }}
          artWidth={artWidth(225)}
          size="lg"
          className="gap-[calc(1.6*var(--u,0.6vw))]"
        />
      </div>
      <div className="dash-place justify-self-center" style={place(2505, 780, 800)}>
        <KpiMetric
          label="Abandoned Calls"
          reading={m["callcenter.abandoned_rate"]}
          unit="%"
          tone="critical"
          art={{ src: abandonedArt, width: 295, height: 375 }}
          artWidth={artWidth(295)}
          iconPosition="end"
          size="lg"
          className="gap-[calc(1.77*var(--u,0.6vw))]"
        />
      </div>

      <CallCenterIllustration className="dash-place md:portrait:col-span-2" style={place(1560, 640, 840, 1060)} />

      <div className="dash-place" style={place(390, 1300, 820)}>
        <WidgetErrorBoundary title="Call volume chart">
          <StackedBarChart label="Call Volume Overview" inbound={inbound} outbound={outbound} />
        </WidgetErrorBoundary>
      </div>
      <div className="dash-place" style={place(2740, 1400, 860)}>
        <WidgetErrorBoundary title="Abandon trend">
          <LineTrend label="Abandon Rate" points={abandon} unit="%" maxY={80} />
        </WidgetErrorBoundary>
      </div>
    </div>
  );
}
