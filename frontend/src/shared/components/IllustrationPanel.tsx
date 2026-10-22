import type { CSSProperties } from "react";

export interface IllustrationPanelProps {
  label: string;
  src: string;
  width: number;
  height: number;
  /**
   * `feather` fades hard crop edges of assets exported with an opaque backdrop;
   * `fade-corner` hides a neighbouring-layer fragment caught in the bottom-end corner.
   */
  mask?: "feather" | "fade-corner";
  className?: string;
}

const MASK_CLASS: Record<NonNullable<IllustrationPanelProps["mask"]>, string> = {
  feather: "dash-illus__img--feather",
  "fade-corner": "dash-illus__img--fade-corner",
};

/**
 * Central Figma illustration with its cyan bloom. On tablet/desktop it fills the grid
 * area it is placed in (contained at its own aspect ratio, never cropped); on mobile it
 * flows at its natural aspect ratio.
 */
export function IllustrationPanel({ label, src, width, height, mask, className = "" }: IllustrationPanelProps) {
  const style = { "--dash-illus-ratio": width / height } as CSSProperties;
  return (
    <div className={`dash-illus ${className}`} role="img" aria-label={label} style={style}>
      <div className="dash-illus__glow" aria-hidden />
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        decoding="async"
        className={`dash-illus__img ${mask ? MASK_CLASS[mask] : ""}`}
      />
    </div>
  );
}
