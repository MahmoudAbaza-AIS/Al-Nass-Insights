import { IllustrationPanel } from "@shared/components/IllustrationPanel";
import anatomy from "../../../assets/illustrations/anatomy.png";

export function AnatomyIllustration({ className }: { className?: string }) {
  return (
    <IllustrationPanel label="Anatomical illustration" src={anatomy} width={879} height={1318} className={className} />
  );
}
