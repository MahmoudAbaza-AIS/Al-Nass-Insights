import type { DashboardPayload } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { AnatomyIllustration } from "@shared/components/illustrations/CentralIllustrations";
import { RadialGauge } from "@shared/visualizations/RadialGauge";
import { Sparkline } from "@shared/visualizations/Sparkline";
import { WidgetErrorBoundary } from "@shared/components/ErrorBoundary";
import { formatPercent, formatNumber } from "@shared/utils/format";

export function ClinicalDashboard({ data }: { data: DashboardPayload }) {
  const m = data.metrics;

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6">
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <MetricValue
          label="Pressure Ulcer Rate"
          reading={m["clinical.pressure_ulcer_rate"]}
          unit=""
          supportingText={
            m["clinical.pressure_ulcer_rate"]?.supportingText ??
            `${formatNumber(m["clinical.pressure_ulcer_rate"]?.value ?? null)} per 1,000 patients`
          }
        />
        <div className="flex flex-wrap justify-center gap-4">
          <RadialGauge
            label="Adverse Events Rate"
            value={m["clinical.adverse_events_rate"]?.value ?? null}
            tone="danger"
            size={110}
          />
          <RadialGauge
            label="Missed Diagnosis Rate"
            value={m["clinical.missed_diagnosis_rate"]?.value ?? null}
            tone="warning"
            size={110}
          />
          <RadialGauge
            label="VTE Compliance"
            value={m["clinical.vte_compliance"]?.value ?? null}
            tone="cyan"
            size={110}
          />
        </div>
        <MetricValue
          label="Falls Rate"
          reading={m["clinical.falls_rate"]}
          supportingText={m["clinical.falls_rate"]?.supportingText}
        />
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(12rem,18rem)_1fr]">
        <DashboardSection title="Respiratory & Ventilation">
          <WidgetErrorBoundary title="Ventilation">
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
                  <span>Ventilator Utilization</span>
                  <span className="text-[var(--dash-cyan)]">
                    {formatPercent(m["clinical.ventilator_utilization"]?.value ?? null)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--dash-chart-track)]">
                  <div
                    className="h-full rounded-full bg-[var(--dash-cyan)]"
                    style={{
                      width: `${m["clinical.ventilator_utilization"]?.value ?? 0}%`,
                    }}
                  />
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

        <IllustrationPanel label="Anatomical illustration" aspectRatio="3 / 4">
          <AnatomyIllustration />
        </IllustrationPanel>

        <DashboardSection title="Patient Outcomes">
          <div className="space-y-4">
            {(
              [
                ["clinical.recovery_rate", "Recovery Rate", "var(--dash-cyan)", "%"],
                ["clinical.complication_rate", "Complication Rate", "var(--dash-warning)", "%"],
                ["clinical.mortality_rate", "Mortality Rate", "var(--dash-danger)", "%"],
              ] as const
            ).map(([id, label, color, unit]) => (
              <div key={id} className="flex items-center justify-between gap-3">
                <MetricValue label={label} reading={m[id]} unit={unit} size="sm" />
                <Sparkline points={m[id]?.trend ?? []} color={color} label={label} />
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardSection title="Medication">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricValue
              label="Turnaround Time"
              reading={m["clinical.med_turnaround_minutes"]}
              unit="min"
              size="sm"
            />
            <MetricValue
              label="Near Miss"
              reading={m["clinical.near_miss"]}
              unit="%"
              precision={1}
              tone="watch"
              size="sm"
            />
            <MetricValue
              label="Medication Error"
              reading={m["clinical.medication_error"]}
              unit="%"
              precision={1}
              tone="critical"
              size="sm"
            />
          </div>
        </DashboardSection>
        <DashboardSection title="Infections">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricValue label="SSI Rate" reading={m["or.ssi_rate"]} unit="%" precision={1} size="sm" />
            <MetricValue
              label="CAUTI Rate"
              reading={m["clinical.cauti_rate"]}
              unit="%"
              precision={0}
              size="sm"
            />
            <MetricValue
              label="CLABSI Rate"
              reading={m["clinical.clabsi_rate"]}
              unit="%"
              precision={1}
              size="sm"
            />
            <MetricValue
              label="VAP Rate"
              reading={m["clinical.vap_rate"]}
              unit="%"
              precision={1}
              size="sm"
            />
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
