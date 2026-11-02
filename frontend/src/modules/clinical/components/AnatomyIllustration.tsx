import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import { place } from "@shared/utils/stage";
import anatomy from "../../../assets/illustrations/anatomy.png";

/** Overlay viewBox in Figma frame coordinates (4K) around the figure. */
const OVERLAY = { x: 1200, y: 600, w: 1500, h: 1560 };

/**
 * Figma anatomy group: figure (`ChatGPT Image Apr 1`, 879×1318), perspective platform,
 * callout lines to the side sections, and two hotspot rings (`Component 12`) that grow
 * 16 → 54 px once on load (Smart Animate 0.4 s ease-in-out).
 */
export function AnatomyIllustration({ className = "" }: { className?: string }) {
  const viewBox = `${OVERLAY.x} ${OVERLAY.y} ${OVERLAY.w} ${OVERLAY.h}`;
  return (
    <>
      <svg
        className="dash-place pointer-events-none hidden md:landscape:block"
        style={place(OVERLAY.x, OVERLAY.y, OVERLAY.w, OVERLAY.h)}
        viewBox={viewBox}
        aria-hidden
      >
        <polygon
          points="1660,1690 2370,1780 2200,1930 1480,1860"
          fill="rgba(0,229,255,0.03)"
          stroke="rgba(84,233,255,0.28)"
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <ellipse cx={1930} cy={1812} rx={150} ry={36} fill="rgba(200,240,255,0.22)" />
      </svg>

      <IllustrationPanel
        label="Anatomical illustration"
        src={anatomy}
        width={879}
        height={1318}
        className={`dash-place ${className}`}
        style={place(1490, 672, 879, 1318)}
      />

      <svg
        className="dash-place pointer-events-none hidden md:landscape:block"
        style={place(OVERLAY.x, OVERLAY.y, OVERLAY.w, OVERLAY.h)}
        viewBox={viewBox}
        aria-hidden
      >
        <polyline points="1420,786 1780,786 1924,880" fill="none" stroke="rgba(84,233,255,0.45)" strokeWidth={2} />
        <polyline points="2410,840 2160,840 1950,978" fill="none" stroke="rgba(84,233,255,0.45)" strokeWidth={2} />
        <circle cx={1420} cy={786} r={3} fill="rgba(84,233,255,0.7)" />
        <circle cx={2410} cy={840} r={3} fill="rgba(84,233,255,0.7)" />
        {[
          [1924, 880],
          [1950, 978],
        ].map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle className="dash-hotspot-ring" cx={cx} cy={cy} r={27} fill="rgba(84,233,255,0.28)" />
            <circle cx={cx} cy={cy} r={12.5} fill="#7ff4ff" style={{ filter: "drop-shadow(0 0 8px #54e9ff)" }} />
          </g>
        ))}
      </svg>
    </>
  );
}
