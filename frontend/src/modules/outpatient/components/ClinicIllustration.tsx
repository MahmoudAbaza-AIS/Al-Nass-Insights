import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import clinic from "../../../assets/illustrations/opd-clinic.png";

export function ClinicIllustration({ className }: { className?: string }) {
  return (
    <IllustrationPanel
      label="Outpatient clinic illustration"
      src={clinic}
      width={3300}
      height={3000}
      mask="feather"
      className={className}
    />
  );
}
