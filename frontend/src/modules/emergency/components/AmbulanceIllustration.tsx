import type { CSSProperties } from "react";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import ambulance from "../../../assets/figma/er-ambulance.png";

/** Figma ER ambulance (`Component 54`, cropped from the 4K export at frame 1319,842 / 1050×960). */
export function AmbulanceIllustration({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <IllustrationPanel
      label="Ambulance illustration"
      src={ambulance}
      width={1050}
      height={960}
      mask="edges"
      className={className}
      style={style}
    />
  );
}
