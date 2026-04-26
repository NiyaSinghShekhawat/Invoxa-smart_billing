export function formatTimestamp(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("en-IN", {
      day:    "2-digit",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/**
 * Human-readable relative time since `isoString` (updates well when re-rendered on an interval).
 */
export function formatTimeAgo(isoString) {
  if (!isoString) return "—";
  const t = new Date(isoString).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  if (diff < 0) return "Just now";
  const sec = Math.floor(diff / 1000);
  const mins = Math.floor(sec / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (sec < 45) return "Just now";
  if (mins < 1) return "< 1m ago";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatTimestamp(isoString);
}

export function formatLocation(loc) {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  if (loc.label) return loc.label;
  return [loc.line1, loc.city].filter(Boolean).join(", ") || "—";
}