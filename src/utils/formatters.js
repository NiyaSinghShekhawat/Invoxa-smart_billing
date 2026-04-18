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

export function formatTimeAgo(isoString) {
  if (!isoString) return "—";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${hours}h ${mins % 60}m ago`;
}

export function formatLocation(loc) {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  if (loc.label) return loc.label;
  return [loc.line1, loc.city].filter(Boolean).join(", ") || "—";
}