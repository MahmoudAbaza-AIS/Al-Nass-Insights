import type { MetricReading } from "@contracts/metrics";
import { DashboardSection } from "@shared/components/DashboardSection";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { EMPTY_VALUE, formatMetricParts } from "@shared/utils/format";
import { place } from "@shared/utils/stage";

interface VentilationSectionProps {
  metrics: Record<string, MetricReading>;
}

function InlineValue({ reading, unit }: { reading: MetricReading | undefined; unit: string }) {
  const parts = formatMetricParts(reading?.value ?? null, unit, 0);
  const missing = reading?.value === null || reading?.value === undefined;
  return (
    <span className="whitespace-nowrap text-[length:var(--dash-fs-value)] font-bold leading-none text-[var(--dash-cyan)]">
      {missing ? (
        <span className="opacity-60">{EMPTY_VALUE}</span>
      ) : (
        <span className="dash-glow-text">
          {parts.number}
          {parts.unit ? <span className="ms-[0.3em] text-[length:var(--dash-fs-unit)] font-medium">{parts.unit}</span> : null}
        </span>
      )}
    </span>
  );
}

const SMALL_GAUGE = "max(var(--dash-gauge-sm), calc(5.6 * var(--dash-stage-u, 0px)))";

/** Figma "Respiratory & Ventilation" (left of the anatomy figure, frame x 472–1312). */
export function VentilationSection({ metrics: m }: VentilationSectionProps) {
  const utilizationReading = m["clinical.ventilator_utilization"];
  const utilization = utilizationReading?.value ?? null;

  return (
    <DashboardSection title="Respiratory & Ventilation" className="dash-place" style={place(472, 768, 840)}>
      <WidgetErrorBoundary title="Ventilation">
        <div className="flex flex-col gap-[calc(var(--dash-gap)*2)] md:landscape:mt-[calc(0.9*var(--u))]">
          <div>
            <div className="mb-[0.6em] text-[length:var(--dash-fs-label)] text-[var(--dash-label)]">Ventilator Utilization</div>
            <div className="flex items-center gap-[calc(var(--dash-gap)*1.2)]">
              <div
                className="h-[max(0.5rem,calc(0.55*var(--u,1rem)))] flex-1 rounded-full bg-[var(--dash-chart-track)]"
                role="img"
                aria-label={`Ventilator utilization ${utilization === null ? "unavailable" : `${utilization}%`}`}
              >
                {/* Only paint a fill when Oracle/cache published a real value — never imply 0%. */}
                {utilization !== null ? (
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#1fb6c9,#54e9ff)] shadow-[0_0_10px_rgba(84,233,255,0.45)]"
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
          <div className="flex justify-between gap-[var(--dash-gap)] md:landscape:justify-start md:landscape:gap-[calc(5.4*var(--u))]">
            <RadialGauge
              label="Extubation Failure"
              value={m["clinical.extubation_failure"]?.value ?? null}
              tone="danger"
              variant="arc"
              captionPosition="top"
              displaySize={SMALL_GAUGE}
            />
            <RadialGauge
              label="Reintubation (48h)"
              value={m["clinical.reintubation_48h"]?.value ?? null}
              tone="danger"
              variant="arc"
              captionPosition="top"
              displaySize={SMALL_GAUGE}
            />
          </div>
        </div>
      </WidgetErrorBoundary>
    </DashboardSection>
  );
}
