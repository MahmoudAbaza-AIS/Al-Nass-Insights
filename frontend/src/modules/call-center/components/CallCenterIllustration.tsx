import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import globe from "../../../assets/illustrations/call-center-globe.png";

export function CallCenterIllustration({ className }: { className?: string }) {
  return (
    <IllustrationPanel
      label="Call center illustration"
      src={globe}
      width={900}
      height={950}
      mask="feather"
      className={className}
    />
  );
}
