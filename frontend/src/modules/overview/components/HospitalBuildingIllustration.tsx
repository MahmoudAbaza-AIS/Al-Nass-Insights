import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import hospitalBuilding from "../../../assets/illustrations/hospital-building.png";

export function HospitalBuildingIllustration({ className }: { className?: string }) {
  return (
    <IllustrationPanel
      label="Central hospital building illustration"
      src={hospitalBuilding}
      width={1980}
      height={972}
      className={className}
    />
  );
}
