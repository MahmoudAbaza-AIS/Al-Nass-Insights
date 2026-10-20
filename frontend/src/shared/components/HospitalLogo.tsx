export function HospitalLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid grid-cols-2 gap-1"
        aria-hidden
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#e74c3c] text-xs font-bold text-white">
          A
        </span>
        <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-[#f39c12] text-xs font-bold text-white">
          L
          <span className="absolute left-1 top-1 text-[8px]">♥</span>
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#27ae60] text-xs font-bold text-white">
          N
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#8e44ad] text-xs font-bold text-white">
          S
        </span>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-[var(--dash-text)]">Al Nas Hospital</div>
        <div className="text-xs text-[var(--dash-label)]" lang="ar" dir="rtl">
          مستشفى الناس
        </div>
      </div>
    </div>
  );
}
