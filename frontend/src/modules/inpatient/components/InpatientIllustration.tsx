import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import inpatientRoom from "../../../assets/illustrations/inpatient-room.png";

export function InpatientIllustration({ className }: { className?: string }) {
  return (
    <IllustrationPanel
      label="Inpatient care illustration"
      src={inpatientRoom}
      width={1100}
      height={900}
      mask="feather"
      className={className}
    />
  );
}
