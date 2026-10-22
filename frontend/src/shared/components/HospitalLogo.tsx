import logoMark from "../../assets/illustrations/logo.png";

/** Official Al Nas Hospital lockup exported from Figma (`Layer_8`). */
export function HospitalLogo() {
  return (
    <img
      src={logoMark}
      alt="Al Nas Hospital"
      width={289}
      height={118}
      className="h-10 w-auto md:h-[max(2.25rem,calc(3.1*var(--u)))]"
      decoding="async"
    />
  );
}
