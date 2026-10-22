import type { DashboardPayload } from "@contracts/metrics";
import { KpiIconShell, KpiMetric } from "@shared/components/KpiMetric";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
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
    <div className="dash-hub h-full min-h-0">
      <div className="grid min-h-0 flex-1 items-center gap-4 lg:grid-cols-[minmax(12rem,1fr)_minmax(14rem,20rem)_minmax(12rem,1fr)] lg:gap-5">
        <div className="flex flex-col gap-6 lg:items-start lg:gap-8">
          <KpiMetric
            label="Total Call Volume"
            reading={m["callcenter.volume_total"]}
            supportingText={m["callcenter.volume_total"]?.supportingText ?? "Inbound & Outbound"}
            size="lg"
            icon={
              <KpiIconShell>
                <i className="pi pi-phone text-xl" />
              </KpiIconShell>
            }
          />
          <KpiMetric
            label="Average Handle Time"
            reading={m["callcenter.aht"]}
            unit="min"
            precision={2}
            size="lg"
            icon={
              <KpiIconShell>
                <i className="pi pi-hourglass text-xl" />
              </KpiIconShell>
            }
          />
        </div>

        <IllustrationPanel label="Call center illustration" aspectRatio="auto">
          <CallCenterIllustration />
        </IllustrationPanel>

        <div className="flex flex-col gap-6 lg:items-start lg:gap-8">
          <KpiMetric
            label="Service Level"
            reading={m["callcenter.service_level_20s"]}
            unit="%"
            supportingText={
              m["callcenter.service_level_20s"]?.supportingText ?? "Answered within 20 Sec"
            }
            size="lg"
            icon={
              <KpiIconShell>
                <i className="pi pi-user text-xl" />
              </KpiIconShell>
            }
          />
          <KpiMetric
            label="Abandoned Calls"
            reading={m["callcenter.abandoned_rate"]}
            unit="%"
            tone="critical"
            size="lg"
            icon={
              <KpiIconShell tone="danger">
                <i className="pi pi-exclamation-triangle text-xl" />
              </KpiIconShell>
            }
          />
        </div>
      </div>

      <div className="grid min-h-0 shrink-0 gap-4 lg:grid-cols-2 lg:gap-6">
        <WidgetErrorBoundary title="Call volume chart">
          <StackedBarChart
            label="Call Volume Overview"
            inbound={inbound}
            outbound={outbound}
          />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary title="Abandon trend">
          <LineTrend label="Abandon Rate" points={abandon} unit="%" maxY={80} />
        </WidgetErrorBoundary>
      </div>
    </div>
  );
}
