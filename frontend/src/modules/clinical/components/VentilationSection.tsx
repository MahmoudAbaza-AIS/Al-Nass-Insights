import type { MetricReading } from "@contracts/metrics";
import { DashboardSection } from "@shared/components/DashboardSection";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { formatMetricParts } from "@shared/utils/format";

interface VentilationSectionProps {
  metrics: Record<string, MetricReading>;
}

function InlineValue({ reading, unit }: { reading: MetricReading | undefined; unit: string }) {
  const parts = formatMetricParts(reading?.value ?? null, unit, 0);
  const missing = reading?.value === null || reading?.value === undefined;
  return (
    <span
      className={`whitespace-nowrap text-[length:var(--dash-fs-value)] font-semibold leading-none ${
        missing ? "text-[var(--dash-warning)]" : "text-[var(--dash-cyan)] dash-glow-text"
      }`}
    >
      {parts.number}
      {parts.unit ? <span className="ms-[0.3em] text-[length:var(--dash-fs-unit)] font-medium">{parts.unit}</span> : null}
    </span>
  );
}

export function VentilationSection({ metrics: m }: VentilationSectionProps) {
  const utilizationReading = m["clinical.ventilator_utilization"];
  const utilization = utilizationReading?.value ?? null;

  return (
    <DashboardSection title="Respiratory & Ventilation">
      <WidgetErrorBoundary title="Ventilation">
        <div className="flex flex-col gap-[var(--dash-gap)]">
          <div>
            <div className="mb-[0.4em] text-[length:var(--dash-fs-label)] text-[var(--dash-label)]">Ventilator Utilization</div>
            <div className="flex items-center gap-[var(--dash-gap)]">
              <div
                className="h-[max(0.5rem,calc(0.55*var(--u,1rem)))] flex-1 rounded-full bg-[var(--dash-chart-track)]"
                role="img"
                aria-label={`Ventilator utilization ${utilization === null ? "unavailable" : `${utilization}%`}`}
              >
                {/* Only paint a fill when Oracle/cache published a real value — never imply 0%. */}
                {utilization !== null ? (
                  <div
                    className="h-full rounded-full bg-[var(--dash-teal)] shadow-[0_0_10px_rgba(46,230,197,0.5)]"
                    style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
                  />
                ) : null}
              </div>
              <InlineValue reading={utilizationReading} unit="%" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-[var(--dash-gap)]">
            <span className="text-[length:var(--dash-fs-label)] text-[var(--dash-label)]">Ventilator Days</span>
            <InlineValue reading={m["clinical.ventilator_days"]} unit="days" />
          </div>
          <div className="flex justify-around gap-[var(--dash-gap)]">
            <RadialGauge
              label="Extubation Failure"
              value={m["clinical.extubation_failure"]?.value ?? null}
              tone="danger"
              displaySize="var(--dash-gauge-sm)"
            />
            <RadialGauge
              label="Reintubation (48h)"
              value={m["clinical.reintubation_48h"]?.value ?? null}
              tone="danger"
              displaySize="var(--dash-gauge-sm)"
            />
          </div>
        </div>
      </WidgetErrorBoundary>
    </DashboardSection>
  );
}
