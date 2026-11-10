import type { CSSProperties } from "react";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import hospitalBuilding from "../../../assets/illustrations/hospital-building.png";

export function HospitalBuildingIllustration({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <IllustrationPanel
      label="Central hospital building illustration"
      src={hospitalBuilding}
      width={1980}
      height={972}
      className={className}
      style={style}
    />
  );
}
