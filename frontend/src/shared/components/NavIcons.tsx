import type { DashboardNavItem } from "@contracts/navigation";
import navHospital from "../../assets/figma/nav-hospital.svg";
import navHeartbeat from "../../assets/figma/nav-heartbeat.svg";
import navScissors from "../../assets/figma/nav-scissors.svg";
import navHeadset from "../../assets/figma/nav-headset.svg";
import navCity from "../../assets/figma/nav-city.svg";
import navAmbulance from "../../assets/figma/nav-ambulance.svg";
import navBed from "../../assets/figma/nav-bed.svg";

/**
 * Sidebar icons — Figma-exported outline SVGs (carbon-copy of New Design frames).
 * Note: Project guidance preferred PrimeIcons for generic UI chrome; navigation
 * icons here use the design-file exports so shape matches the mockups exactly.
 */
const ICON_SRC: Record<DashboardNavItem["icon"], string> = {
  overview: navHospital,
  clinical: navHeartbeat,
  or: navScissors,
  call: navHeadset,
  outpatient: navCity,
  emergency: navAmbulance,
  inpatient: navBed,
};

export function NavIcon({ name }: { name: DashboardNavItem["icon"] }) {
  return (
    <img
      src={ICON_SRC[name]}
      alt=""
      width={80}
      height={80}
      className="size-[var(--dash-nav-icon)] object-contain"
      aria-hidden
    />
  );
}
