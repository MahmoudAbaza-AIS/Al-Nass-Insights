/** SVG stand-ins for central dashboard scenes. */

export function HospitalBuildingIllustration() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full max-w-xl" role="presentation">
      <defs>
        <linearGradient id="bldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a77a" />
          <stop offset="100%" stopColor="#8d6a45" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="200" rx="120" ry="14" fill="rgba(61,231,255,0.25)" />
      <rect x="70" y="70" width="220" height="120" rx="6" fill="url(#bldg)" />
      <rect x="140" y="40" width="80" height="40" rx="4" fill="#b8956a" />
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 6 }).map((__, col) => (
          <rect
            key={`${row}-${col}`}
            x={90 + col * 32}
            y={90 + row * 22}
            width="16"
            height="12"
            rx="2"
            fill="#3d6d7a"
            opacity={0.85}
          />
        )),
      )}
      <rect x="165" y="145" width="30" height="45" fill="#2c4a54" />
      <text x="180" y="30" textAnchor="middle" fill="var(--dash-label)" fontSize="11">
        Central hospital illustration (placeholder)
      </text>
    </svg>
  );
}

export function AnatomyIllustration() {
  return (
    <svg viewBox="0 0 200 280" className="h-auto w-full max-w-xs" role="presentation">
      <ellipse cx="100" cy="250" rx="70" ry="12" fill="rgba(61,231,255,0.2)" />
      <circle cx="100" cy="48" r="22" fill="none" stroke="var(--dash-cyan)" strokeWidth="2" />
      <path
        d="M100 70 v90 M70 100 h60 M85 160 q15 40 0 70 M115 160 q-15 40 0 70"
        fill="none"
        stroke="var(--dash-cyan)"
        strokeWidth="2.5"
        opacity={0.85}
      />
      <circle cx="100" cy="120" r="6" fill="var(--dash-cyan)" />
      <circle cx="100" cy="95" r="4" fill="#ff8a95" />
      <text x="100" y="18" textAnchor="middle" fill="var(--dash-label)" fontSize="10">
        Anatomy illustration (placeholder)
      </text>
    </svg>
  );
}

export function OperatingRoomIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="h-auto w-full max-w-md" role="presentation">
      <ellipse cx="140" cy="175" rx="90" ry="14" fill="rgba(61,231,255,0.22)" />
      <rect x="80" y="110" width="120" height="36" rx="8" fill="#4a7c8a" />
      <circle cx="100" cy="70" r="18" fill="none" stroke="#9ec9d4" strokeWidth="6" />
      <circle cx="180" cy="70" r="18" fill="none" stroke="#9ec9d4" strokeWidth="6" />
      <path d="M100 88 v22 M180 88 v22" stroke="#9ec9d4" strokeWidth="3" />
      <rect x="200" y="100" width="40" height="50" rx="4" fill="#3a5f6a" />
      <text x="140" y="24" textAnchor="middle" fill="var(--dash-label)" fontSize="10">
        Operating room illustration (placeholder)
      </text>
    </svg>
  );
}

export function CallCenterIllustration() {
  return (
    <svg viewBox="0 0 220 220" className="h-auto w-full max-w-sm" role="presentation">
      <circle cx="110" cy="110" r="70" fill="none" stroke="rgba(61,231,255,0.35)" strokeWidth="2" />
      <circle cx="110" cy="110" r="52" fill="#0d3a48" stroke="var(--dash-cyan)" strokeWidth="2" />
      <ellipse cx="110" cy="115" rx="28" ry="34" fill="#1b5a6a" />
      <path
        d="M78 95 q-18 15 -10 40 M142 95 q18 15 10 40"
        fill="none"
        stroke="var(--dash-cyan)"
        strokeWidth="4"
      />
      <path d="M68 135 h84" stroke="var(--dash-cyan)" strokeWidth="3" />
      <text x="110" y="28" textAnchor="middle" fill="var(--dash-label)" fontSize="10">
        Call center illustration (placeholder)
      </text>
    </svg>
  );
}

export function ClinicIllustration() {
  return (
    <svg viewBox="0 0 300 200" className="h-auto w-full max-w-md" role="presentation">
      <ellipse cx="150" cy="180" rx="100" ry="12" fill="rgba(61,231,255,0.18)" />
      <rect x="40" y="70" width="70" height="90" rx="4" fill="#3d6a78" />
      <rect x="190" y="70" width="70" height="90" rx="4" fill="#3d6a78" />
      <rect x="120" y="50" width="60" height="110" rx="4" fill="#2f5561" />
      <circle cx="70" cy="150" r="8" fill="#8ec8d6" />
      <circle cx="100" cy="150" r="8" fill="#8ec8d6" />
      <circle cx="230" cy="150" r="8" fill="#8ec8d6" />
      <text x="150" y="28" textAnchor="middle" fill="var(--dash-label)" fontSize="10">
        Clinic illustration (placeholder)
      </text>
    </svg>
  );
}

export function AmbulanceIllustration() {
  return (
    <svg viewBox="0 0 280 180" className="h-auto w-full max-w-md" role="presentation">
      <ellipse cx="140" cy="155" rx="90" ry="12" fill="rgba(61,231,255,0.18)" />
      <rect x="50" y="70" width="170" height="60" rx="10" fill="#e8eef1" />
      <rect x="50" y="90" width="170" height="14" fill="#e74c3c" />
      <rect x="180" y="55" width="50" height="40" rx="6" fill="#dfe7eb" />
      <circle cx="90" cy="135" r="16" fill="#222" />
      <circle cx="190" cy="135" r="16" fill="#222" />
      <text x="135" y="105" textAnchor="middle" fill="#c0392b" fontSize="14" fontWeight="700">
        123
      </text>
      <text x="140" y="28" textAnchor="middle" fill="var(--dash-label)" fontSize="10">
        Ambulance illustration (placeholder)
      </text>
    </svg>
  );
}

export function InpatientIllustration() {
  return (
    <svg viewBox="0 0 280 200" className="h-auto w-full max-w-md" role="presentation">
      <ellipse cx="140" cy="175" rx="95" ry="12" fill="rgba(61,231,255,0.18)" />
      <rect x="70" y="100" width="140" height="40" rx="10" fill="#4a7c8a" />
      <rect x="80" y="85" width="50" height="20" rx="6" fill="#8ec8d6" />
      <circle cx="200" cy="95" r="14" fill="#c9dde4" />
      <path d="M200 110 v35" stroke="#8ec8d6" strokeWidth="6" />
      <rect x="210" y="70" width="8" height="70" fill="#9aa" />
      <text x="140" y="28" textAnchor="middle" fill="var(--dash-label)" fontSize="10">
        Inpatient illustration (placeholder)
      </text>
    </svg>
  );
}
