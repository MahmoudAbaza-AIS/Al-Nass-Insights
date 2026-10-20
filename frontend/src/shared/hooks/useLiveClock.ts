import { useEffect, useState } from "react";
import { formatClock } from "../utils/format";

/**
 * Isolated live clock so second ticks do not re-render entire dashboards.
 */
export function useLiveClock(timeZone: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return formatClock(now, timeZone);
}
