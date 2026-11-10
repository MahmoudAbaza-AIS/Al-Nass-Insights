import { useEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Steps an integer display from the previously shown value to a newly published one.
 * Figma's Timer counter ticks on its own with sample values; here motion only follows
 * real data: nothing animates while the value is null, and reduced-motion users get the
 * final value immediately.
 */
export function useCountUp(target: number | null, durationMs = 900): number | null {
  const [shown, setShown] = useState<number | null>(target === null ? null : Math.trunc(target));
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    if (target === null || !Number.isFinite(target)) {
      setShown(null);
      return;
    }
    const end = Math.max(0, Math.trunc(target));
    const start = shownRef.current ?? 0;
    if (start === end || prefersReducedMotion()) {
      setShown(end);
      return;
    }
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      setShown(Math.round(start + (end - start) * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return shown;
}
