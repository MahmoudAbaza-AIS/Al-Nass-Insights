import type { CSSProperties } from "react";

/**
 * Position a `.dash-place` element at its Figma frame coordinates (3840×2160 px).
 * Only applies on landscape tablet/desktop; portrait and mobile keep the flow layout.
 * Omit `w`/`h` to let the element size itself.
 */
export function place(x: number, y: number, w?: number, h?: number): CSSProperties {
  const vars: Record<string, number> = { "--x": x, "--y": y };
  if (w !== undefined) vars["--w"] = w;
  if (h !== undefined) vars["--h"] = h;
  return vars as CSSProperties;
}
