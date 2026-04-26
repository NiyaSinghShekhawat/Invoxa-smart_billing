import { useEffect, useState } from "react";
import { formatTimeAgo } from "../../utils/formatters.js";

const TICK_MS = 30_000;

export function RelativeTime({ value, className = "" }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!value) return undefined;
    const id = window.setInterval(() => setTick((n) => n + 1), TICK_MS);
    return () => window.clearInterval(id);
  }, [value]);

  if (!value) return <span className={className}>—</span>;
  return (
    <span className={className} title={new Date(value).toLocaleString()}>
      {formatTimeAgo(value)}
    </span>
  );
}
