import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import orScene from "../../../assets/illustrations/or-scene.png";

export function OperatingRoomIllustration({ className }: { className?: string }) {
  return (
    <IllustrationPanel
      label="Operating room illustration"
      src={orScene}
      width={1000}
      height={850}
      mask="feather"
      className={className}
    />
  );
}
