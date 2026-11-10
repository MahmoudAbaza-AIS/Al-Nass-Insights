import type { MetricReading } from "@contracts/metrics";
import { KpiMetric } from "@shared/components/KpiMetric";
import { DashboardSection } from "@shared/components/DashboardSection";
import { place } from "@shared/utils/stage";
import infectionsArt from "../../../assets/figma/kpi-infections.png";

interface InfectionsSectionProps {
  metrics: Record<string, MetricReading>;
}

const INFECTION_ROWS: ReadonlyArray<readonly [string, string, number]> = [
  ["or.ssi_rate", "SSI Rate", 1],
  ["clinical.cauti_rate", "CAUTI Rate", 0],
  ["clinical.clabsi_rate", "CLABSI Rate", 1],
  ["clinical.vap_rate", "VAP Rate", 1],
];

/** Figma "Infections" (bottom-right): virus tile with four value-over-label rates. */
export function InfectionsSection({ metrics: m }: InfectionsSectionProps) {
  return (
    <DashboardSection title="Infections" className="dash-place" style={place(2494, 1724, 1320)}>
      <div className="flex items-end gap-[calc(var(--dash-gap)*2)]">
        <img
          src={infectionsArt}
          alt=""
          aria-hidden
          width={210}
          height={270}
          decoding="async"
          className="dash-kpi-art w-[max(3.5rem,calc(var(--u,1vw)*5.2))] shrink-0"
        />
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-[var(--dash-gap)] pb-[0.6em] sm:grid-cols-4 [&_*]:whitespace-nowrap">
          {INFECTION_ROWS.map(([id, label, precision]) => (
            <KpiMetric key={id} label={label} reading={m[id]} unit="%" precision={precision} order="value-first" />
          ))}
        </div>
      </div>
    </DashboardSection>
  );
}
