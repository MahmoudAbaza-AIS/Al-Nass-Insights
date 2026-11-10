import type { ReactNode } from "react";
import type { DashboardNavItem } from "@contracts/navigation";

/**
 * Sidebar glyphs redrawn from the Figma nav rail (`Frame 2611128`): line icons on a 24-unit grid,
 * stroked with currentColor so idle/active colours come from `.dash-nav-btn`.
 */
const PATHS: Record<DashboardNavItem["icon"], ReactNode> = {
  // Hospital: tall block with a cross, lower annex, ground line.
  overview: (
    <>
      <path d="M4 21V4h9v17" />
      <path d="M13 10h6v11" />
      <path d="M2.5 21h19" />
      <path d="M8.5 7v4M6.5 9h4" />
      <path d="M7 21v-4h3v4" />
    </>
  ),
  // Heart with a pulse trace.
  clinical: (
    <>
      <path d="M12 20s-8-4.6-8-10.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.6C20 15.4 12 20 12 20Z" />
      <path d="M4.6 12.5h4l1.4-2.5 2.2 4.5 1.4-2h5.8" />
    </>
  ),
  // Surgical scissors.
  or: (
    <>
      <circle cx="6" cy="7" r="2.4" />
      <circle cx="6" cy="17" r="2.4" />
      <path d="M8.1 8.2 20 16" />
      <path d="M8.1 15.8 20 8" />
    </>
  ),
  // Headset with mic boom.
  call: (
    <>
      <path d="M4.5 14v-2.5a7.5 7.5 0 0 1 15 0V14" />
      <rect x="3.5" y="13" width="3.5" height="5" rx="1.2" />
      <rect x="17" y="13" width="3.5" height="5" rx="1.2" />
      <path d="M19 18v1.5a1.5 1.5 0 0 1-1.5 1.5H13" />
    </>
  ),
  // Clinic buildings with window dots.
  outpatient: (
    <>
      <path d="M5 21V4h6v17" />
      <path d="M11 11h3v10" />
      <path d="M14 9h5v12" />
      <path d="M2.5 21h19" />
      <path d="M8 7v.01M8 10v.01M8 13v.01M8 16v.01M16.5 12v.01M16.5 15v.01" />
    </>
  ),
  // Ambulance with a cross.
  emergency: (
    <>
      <path d="M2.5 17V7h12v10" />
      <path d="M14.5 10h4l3 3.5V17h-2" />
      <path d="M2.5 17h2M9.5 17h5" />
      <circle cx="7" cy="17.5" r="2" />
      <circle cx="17" cy="17.5" r="2" />
      <path d="M8.5 9.5v4M6.5 11.5h4" />
    </>
  ),
  // Hospital bed.
  inpatient: (
    <>
      <path d="M3 5v15M21 20v-6" />
      <path d="M3 14h18" />
      <path d="M3 10h8v4" />
      <path d="M11 10h6.5a3.5 3.5 0 0 1 3.5 3.5V14" />
    </>
  ),
};

export function NavIcon({ name }: { name: DashboardNavItem["icon"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
