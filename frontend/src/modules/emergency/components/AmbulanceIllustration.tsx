import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import ambulance from "../../../assets/illustrations/er-ambulance.png";

export function AmbulanceIllustration({ className }: { className?: string }) {
  return (
    <IllustrationPanel label="Ambulance illustration" src={ambulance} width={1140} height={780} mask="fade-corner" className={className} />
  );
}
