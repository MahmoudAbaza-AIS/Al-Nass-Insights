import type { DashboardPayload } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { CallCenterIllustration } from "@shared/components/illustrations/CentralIllustrations";
import { StackedBarChart } from "@shared/visualizations/StackedBarChart";
import { LineTrend } from "@shared/visualizations/LineTrend";
import { ChartFrame } from "@shared/components/ChartFrame";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";

export function CallCenterDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;
  const inbound = data.series?.["callcenter.volume_by_day"] ?? [];
  const outbound = data.series?.call_outbound_by_day ?? [];
  const abandon = data.series?.["callcenter.abandon_trend"] ?? [];

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6">
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(14rem,20rem)_1fr]">
        <div className="space-y-8">
          <MetricValue
            label="Total Call Volume"
            reading={m["callcenter.volume_total"]}
            supportingText={m["callcenter.volume_total"]?.supportingText}
            size="lg"
          />
          <MetricValue
            label="Average Handle Time"
            reading={m["callcenter.aht"]}
            unit="min"
            precision={2}
          />
        </div>

        <IllustrationPanel label="Call center illustration" aspectRatio="1 / 1">
          <CallCenterIllustration />
        </IllustrationPanel>

        <div className="space-y-8">
          <MetricValue
            label="Service Level"
            reading={m["callcenter.service_level_20s"]}
            unit="%"
            supportingText={m["callcenter.service_level_20s"]?.supportingText}
            size="lg"
          />
          <MetricValue
            label="Abandoned Calls"
            reading={m["callcenter.abandoned_rate"]}
            unit="%"
            tone="critical"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame>
          <WidgetErrorBoundary title="Call volume chart">
            <StackedBarChart
              label="Call Volume Overview"
              inbound={inbound}
              outbound={outbound}
            />
          </WidgetErrorBoundary>
        </ChartFrame>
        <ChartFrame>
          <WidgetErrorBoundary title="Abandon trend">
            <LineTrend label="Abandon Rate" points={abandon} unit="%" maxY={80} />
          </WidgetErrorBoundary>
        </ChartFrame>
      </div>
    </div>
  );
}
