import { useEffect, useState } from "react";
import { profile } from "~/data/profile";

/** "05:32" in the given zone. */
function format(timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/**
 * The author's wall clock, not the visitor's.
 *
 * It renders the time at build time so the prerendered HTML carries a real
 * value, then re-aligns to each minute boundary in the browser. Hydration can
 * land a minute late, so the text warns React off it.
 */
export function LocalClock({
  timeZone = profile.timeZone,
  className,
}: {
  timeZone?: string;
  className?: string;
}) {
  const [time, setTime] = useState(() => format(timeZone));

  useEffect(() => {
    let timeout: number;
    const tick = () => {
      setTime(format(timeZone));
      // Sleep to the next minute rather than polling every second.
      timeout = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 25);
    };
    tick();
    return () => window.clearTimeout(timeout);
  }, [timeZone]);

  return (
    <span className={className} suppressHydrationWarning>
      {time}
    </span>
  );
}
