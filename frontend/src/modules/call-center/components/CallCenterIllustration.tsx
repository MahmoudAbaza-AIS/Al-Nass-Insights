import type { CSSProperties } from "react";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import globe from "../../../assets/figma/call-center-globe.png";

/** Figma globe + headset with its light beam and orbit rings (cropped from the 4K export at 1560,640). */
export function CallCenterIllustration({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <IllustrationPanel
      label="Call center illustration"
      src={globe}
      width={840}
      height={1060}
      mask="edges"
      className={className}
      style={style}
    />
  );
}
