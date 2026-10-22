import anatomy from "../../../assets/illustrations/anatomy.png";

export function AnatomyIllustration() {
  return (
    <img
      src={anatomy}
      alt=""
      width={400}
      height={720}
      className="dash-illustration h-auto w-full max-w-xs object-contain md:max-w-sm"
      decoding="async"
    />
  );
}
