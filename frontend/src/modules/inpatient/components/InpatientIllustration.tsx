import inpatientRoom from "../../../assets/illustrations/inpatient-room.png";

export function InpatientIllustration() {
  return (
    <img
      src={inpatientRoom}
      alt=""
      width={1100}
      height={900}
      className="dash-illustration h-auto w-full max-w-lg object-contain"
      decoding="async"
    />
  );
}
