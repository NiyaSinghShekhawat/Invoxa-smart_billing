export function formatTimestamp(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return isoString;
  }
}

export function formatLocation(loc) {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  if (loc.label) return loc.label;
  return [loc.line1, loc.city].filter(Boolean).join(", ") || "—";
}
