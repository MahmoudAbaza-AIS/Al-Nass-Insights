import hospitalBuilding from "../../../assets/illustrations/hospital-building.png";

export function HospitalBuildingIllustration() {
  return (
    <img
      src={hospitalBuilding}
      alt=""
      width={1980}
      height={1508}
      className="dash-illustration relative z-[1] h-auto w-full max-w-[min(58vw,48rem)] object-contain"
      decoding="async"
    />
  );
}
