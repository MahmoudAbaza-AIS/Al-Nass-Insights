import { Dialog } from "@primereact/ui/dialog";
import { Button } from "@primereact/ui/button";
import type { MetricDefinition, MetricReading } from "@contracts/metrics";
import { formatMetricValue, formatTimestamp } from "../utils/format";
import { availabilityLabel } from "../utils/status";

export interface KpiDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definition?: MetricDefinition;
  reading?: MetricReading;
  timeZone: string;
}

export function KpiDetailDialog({
  open,
  onOpenChange,
  definition,
  reading,
  timeZone,
}: KpiDetailDialogProps) {
  const title = definition?.label ?? reading?.metricId ?? "KPI detail";
  const value = formatMetricValue(
    reading?.value ?? null,
    definition?.unit ?? "",
    definition?.precision ?? 0,
  );

  if (!open) {
    return null;
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(event: { value: boolean | undefined }) => {
        onOpenChange(Boolean(event.value));
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/55" />
        <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="w-full max-w-lg rounded-xl bg-[#0a3340] p-5 text-[var(--dash-text)] shadow-2xl ring-1 ring-white/10">
            <Dialog.Header className="mb-3 flex items-start justify-between gap-3">
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Close
                as={Button}
                severity="secondary"
                variant="text"
                size="small"
                aria-label="Close details"
              >
                Close
              </Dialog.Close>
            </Dialog.Header>
            <Dialog.Content className="space-y-3 text-[length:var(--dash-fs-sm)] text-[var(--dash-label)]">
              <p>
                <span className="text-[var(--dash-text-muted)]">Value:</span>{" "}
                <span className="text-xl font-bold text-[var(--dash-cyan)]">{value}</span>
              </p>
              {definition?.description ? <p>{definition.description}</p> : null}
              {definition?.reportingPeriod ? (
                <p>Reporting period: {definition.reportingPeriod}</p>
              ) : null}
              {definition?.numeratorDescription ? (
                <p>Numerator: {definition.numeratorDescription}</p>
              ) : null}
              {definition?.denominatorDescription ? (
                <p>Denominator: {definition.denominatorDescription}</p>
              ) : null}
              {reading ? (
                <>
                  <p>Measured: {formatTimestamp(reading.measuredAt, timeZone)}</p>
                  <p>Availability: {availabilityLabel(reading.availability)}</p>
                  {reading.statusLabel ? <p>Status: {reading.statusLabel}</p> : null}
                  {reading.supportingText ? <p>{reading.supportingText}</p> : null}
                </>
              ) : (
                <p>No reading available for this KPI.</p>
              )}
              {definition?.source ? (
                <p className="text-[length:var(--dash-fs-xs)] text-[var(--dash-text-subtle)]">
                  Source: {definition.source}
                </p>
              ) : null}
            </Dialog.Content>
          </Dialog.Popup>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
