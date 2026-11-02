import type { CSSProperties } from "react";
import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import orScene from "../../../assets/figma/or-scene.png";

/**
 * Figma OR scene (`Frame 2611148`, cropped from the 4K export at frame 1260,650 / 1340×1150).
 * The two floor light pools "breathe" like the prototype's Smart Animate (3 s ease-in-out, ping-pong):
 * `Ellipse 1595` widens 237 → 272 px leftwards, `Ellipse 1593` widens 237 → 283 px rightwards.
 */
export function OperatingRoomIllustration({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative ${className}`} style={style}>
      <IllustrationPanel
        label="Operating room illustration"
        src={orScene}
        width={1340}
        height={1150}
        mask="edges"
        className="h-full w-full"
      />
      <span
        className="dash-or-pool dash-or-pool--left hidden md:landscape:block"
        style={{ left: `${(214 / 1340) * 100}%`, top: `${(892 / 1150) * 100}%`, width: `${(237 / 1340) * 100}%`, height: `${(87 / 1150) * 100}%` }}
        aria-hidden
      />
      <span
        className="dash-or-pool dash-or-pool--right hidden md:landscape:block"
        style={{ left: `${(727 / 1340) * 100}%`, top: `${(899 / 1150) * 100}%`, width: `${(237 / 1340) * 100}%`, height: `${(67 / 1150) * 100}%` }}
        aria-hidden
      />
    </div>
  );
}
