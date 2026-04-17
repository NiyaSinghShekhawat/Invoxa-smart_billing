export function isValidEmergency(e) {
  return Boolean(e && typeof e.id === "string" && e.type);
}
