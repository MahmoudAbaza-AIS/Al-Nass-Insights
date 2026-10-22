import type { DashboardPayload } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { StackedBarChart } from "@shared/visualizations/StackedBarChart";
import { LineTrend } from "@shared/visualizations/LineTrend";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { CallCenterIllustration } from "../components/CallCenterIllustration";

export function CallCenterDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;
  const inbound = data.series?.["callcenter.volume_by_day"] ?? [];
  const outbound = data.series?.call_outbound_by_day ?? [];
  const abandon = data.series?.["callcenter.abandon_trend"] ?? [];

  return (
    <div className="dash-hub md:landscape:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] md:landscape:grid-rows-[auto_auto_minmax(0,1fr)] md:portrait:grid-cols-2 md:portrait:grid-rows-[auto_auto_minmax(0,1fr)_auto]">
      <KpiMetric
        label="Total Call Volume"
        reading={m["callcenter.volume_total"]}
        supportingText={m["callcenter.volume_total"]?.supportingText ?? "Inbound & Outbound"}
        icon="pi-phone"
        size="lg"
        className="justify-self-center md:landscape:col-start-1 md:landscape:row-start-1 md:landscape:justify-self-end"
      />
      <KpiMetric
        label="Service Level"
        reading={m["callcenter.service_level_20s"]}
        unit="%"
        supportingText={m["callcenter.service_level_20s"]?.supportingText ?? "Answered within 20 Sec"}
        icon="pi-user"
        iconPosition="end"
        size="lg"
        className="justify-self-center md:landscape:col-start-3 md:landscape:row-start-1 md:landscape:justify-self-start"
      />
      <KpiMetric
        label="Average Handle Time"
        reading={m["callcenter.aht"]}
        unit="min"
        precision={2}
        icon="pi-hourglass"
        size="lg"
        className="justify-self-center md:landscape:col-start-1 md:landscape:row-start-2"
      />
      <KpiMetric
        label="Abandoned Calls"
        reading={m["callcenter.abandoned_rate"]}
        unit="%"
        tone="critical"
        icon="pi-exclamation-triangle"
        iconTone="danger"
        iconPosition="end"
        size="lg"
        className="justify-self-center md:landscape:col-start-3 md:landscape:row-start-2"
      />

      <CallCenterIllustration className="md:landscape:col-start-2 md:landscape:row-span-3 md:landscape:row-start-1 md:portrait:col-span-2" />

      <div className="md:landscape:col-start-1 md:landscape:row-start-3 md:landscape:self-end">
        <WidgetErrorBoundary title="Call volume chart">
          <StackedBarChart label="Call Volume Overview" inbound={inbound} outbound={outbound} />
        </WidgetErrorBoundary>
      </div>
      <div className="md:landscape:col-start-3 md:landscape:row-start-3 md:landscape:self-center md:landscape:justify-self-end">
        <WidgetErrorBoundary title="Abandon trend">
          <LineTrend label="Abandon Rate" points={abandon} unit="%" maxY={80} />
        </WidgetErrorBoundary>
      </div>
    </div>
  );
}
