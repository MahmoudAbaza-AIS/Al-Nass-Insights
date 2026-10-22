import logoMark from "../../assets/illustrations/logo.png";

/** Official Al Nas Hospital lockup exported from Figma (`Layer_8`). */
export function HospitalLogo() {
  return (
    <img
      src={logoMark}
      alt="Al Nas Hospital"
      width={289}
      height={118}
      className="h-10 w-auto md:h-[clamp(2.25rem,6vh,3.5rem)]"
      decoding="async"
    />
  );
}
