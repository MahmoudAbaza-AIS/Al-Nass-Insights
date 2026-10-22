import type { MetricReading } from "@contracts/metrics";
import { MetricValue } from "@shared/components/MetricValue";
import { DashboardSection } from "@shared/components/DashboardSection";

interface InfectionsSectionProps {
  metrics: Record<string, MetricReading>;
}

export function InfectionsSection({ metrics: m }: InfectionsSectionProps) {
  return (
    <DashboardSection title="Infections">
      <div className="flex flex-wrap items-start gap-6">
        <span
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[rgba(0,229,255,0.08)] text-[var(--dash-cyan)] ring-1 ring-[var(--dash-cyan-border)]"
          aria-hidden
        >
          <i className="pi pi-circle-fill text-3xl" />
        </span>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
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
      </div>
    </DashboardSection>
  );
}
