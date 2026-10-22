import type { MetricReading } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { formatPercent } from "@shared/utils/format";

interface VentilationSectionProps {
  metrics: Record<string, MetricReading>;
}

export function VentilationSection({ metrics: m }: VentilationSectionProps) {
  const utilization = m["clinical.ventilator_utilization"]?.value ?? null;

  return (
    <DashboardSection title="Respiratory & Ventilation">
      <WidgetErrorBoundary title="Ventilation">
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
              <span>Ventilator Utilization</span>
              <span className="text-[var(--dash-cyan)]">{formatPercent(utilization)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--dash-chart-track)]">
              {/* Only paint a fill when Oracle/cache published a real value — never imply 0%. */}
              {utilization !== null ? (
                <div
                  className="h-full rounded-full bg-[var(--dash-cyan)]"
                  style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
                />
              ) : null}
            </div>
          </div>
          <MetricValue
            label="Ventilator Days"
            reading={m["clinical.ventilator_days"]}
            unit="days"
            size="sm"
          />
          <div className="flex gap-4">
            <RadialGauge
              label="Extubation Failure"
              value={m["clinical.extubation_failure"]?.value ?? null}
              tone="danger"
              size={96}
            />
            <RadialGauge
              label="Reintubation (48h)"
              value={m["clinical.reintubation_48h"]?.value ?? null}
              tone="danger"
              size={96}
            />
          </div>
        </div>
      </WidgetErrorBoundary>
    </DashboardSection>
  );
}
