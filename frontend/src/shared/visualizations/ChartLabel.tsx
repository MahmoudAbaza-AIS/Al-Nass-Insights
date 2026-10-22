import type { ReactNode } from "react";

/** Smallest rendered size for any chart text, so scaled-down SVGs never produce unreadable labels. */
const FLOOR = "0.625rem";

export interface ViewBox {
  x?: number;
  y?: number;
  w: number;
  h: number;
}

export interface ChartLabelProps {
  /** Anchor point in viewBox coordinates. */
  x: number;
  y: number;
  viewBox: ViewBox;
  /** CSS length of the rendered SVG width; font size scales with it. */
  renderedWidth: string;
  /** Font size in viewBox units (as it would have been inside the SVG). */
  size: number;
  anchor?: "start" | "middle" | "end";
  baseline?: "central" | "bottom";
  color?: string;
  weight?: number;
  children: ReactNode;
}

const TRANSLATE_X = { start: "0", middle: "-50%", end: "-100%" } as const;
const TRANSLATE_Y = { central: "-50%", bottom: "-100%" } as const;

/**
 * HTML text placed over a chart in viewBox coordinates. Unlike SVG <text>, it keeps a
 * legible minimum size when the chart is rendered small. Decorative: the chart's
 * accessible name already carries every value.
 */
export function ChartLabel({
  x,
  y,
  viewBox,
  renderedWidth,
  size,
  anchor = "middle",
  baseline = "central",
  color = "var(--dash-label)",
  weight,
  children,
}: ChartLabelProps) {
  const bx = viewBox.x ?? 0;
  const by = viewBox.y ?? 0;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute whitespace-nowrap leading-none"
      style={{
        left: `${((x - bx) / viewBox.w) * 100}%`,
        top: `${((y - by) / viewBox.h) * 100}%`,
        transform: `translate(${TRANSLATE_X[anchor]}, ${TRANSLATE_Y[baseline]})`,
        fontSize: `max(${FLOOR}, calc(${renderedWidth} * ${size / viewBox.w}))`,
        color,
        fontWeight: weight,
      }}
    >
      {children}
    </span>
  );
}

/** Smaller unit suffix (e.g. "%") following a ChartLabel value, still floored for legibility. */
export function ChartUnit({ children }: { children: ReactNode }) {
  return <span className="ms-[0.1em]" style={{ fontSize: `max(${FLOOR}, 0.55em)` }}>{children}</span>;
}
