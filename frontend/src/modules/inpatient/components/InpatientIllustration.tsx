import type { CSSProperties } from "react";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import inpatientRoom from "../../../assets/figma/inpatient-room.png";

/**
 * Figma inpatient care scene (nurse, bed, IV stand), cropped from the 4K export at frame 1440,740 / 920×960.
 * The crop's top-left corner (where the frame's "Bed Capacity" text sat) is cleared to transparent.
 */
export function InpatientIllustration({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <IllustrationPanel
      label="Inpatient care illustration"
      src={inpatientRoom}
      width={920}
      height={960}
      mask="edges"
      className={className}
      style={style}
    />
  );
}
