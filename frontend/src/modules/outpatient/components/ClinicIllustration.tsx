import type { CSSProperties } from "react";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import clinic from "../../../assets/figma/opd-clinic.png";

/** Figma OPD isometric clinic corridor (cropped from the export at frame 1140,830 / 1440×1070). */
export function ClinicIllustration({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <IllustrationPanel
      label="Outpatient clinic illustration"
      src={clinic}
      width={1440}
      height={1070}
      mask="edges"
      className={className}
      style={style}
    />
  );
}
