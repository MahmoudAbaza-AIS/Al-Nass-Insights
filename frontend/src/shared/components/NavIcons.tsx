import type { DashboardNavItem } from "@contracts/navigation";

export function NavIcon({ name }: { name: DashboardNavItem["icon"] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "overview":
      return (
        <svg {...common}>
          <path d="M4 20V10l8-6 8 6v10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case "clinical":
      return (
        <svg {...common}>
          <path d="M3 12h3l2-5 3 10 2-5h6" />
        </svg>
      );
    case "or":
      return (
        <svg {...common}>
          <path d="M8 4l3 8 2-4 3 8" />
          <path d="M6 20h12" />
          <circle cx="8" cy="4" r="1.2" fill="currentColor" />
          <circle cx="16" cy="20" r="1.2" fill="currentColor" />
        </svg>
      );
    case "call":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 0 1 16 0" />
          <path d="M8 12v3a2 2 0 0 0 2 2h1" />
          <path d="M16 12v3a2 2 0 0 1-2 2h-1" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
        </svg>
      );
    case "outpatient":
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="2" />
          <path d="M8 21v-6l-2-4h12l-2 4v6" />
          <path d="M10 11h4" />
        </svg>
      );
    case "emergency":
      return (
        <svg {...common}>
          <rect x="3" y="9" width="18" height="8" rx="2" />
          <path d="M7 9V7h3l2 2h5v2" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="16.5" cy="17.5" r="1.5" />
        </svg>
      );
    case "inpatient":
      return (
        <svg {...common}>
          <path d="M3 14h18v4H3z" />
          <path d="M5 14V9h6v5" />
          <path d="M8 9V7" />
        </svg>
      );
    default:
      return null;
  }
}
