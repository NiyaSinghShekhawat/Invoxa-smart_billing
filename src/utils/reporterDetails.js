/** Optional follow-up from guest (name, age, phone, emergency contacts). */

export function hasReporterDetails(reporterDetails) {
  if (!reporterDetails || typeof reporterDetails !== "object") return false;
  const { fullName, age, phone, emergencyContacts } = reporterDetails;
  if (fullName?.trim() || phone?.trim()) return true;
  if (age != null && String(age).trim() !== "") return true;
  if (!Array.isArray(emergencyContacts) || emergencyContacts.length === 0) return false;
  return emergencyContacts.some((c) => c?.name?.trim() || c?.phone?.trim());
}

export function reporterDetailsSearchBlob(reporterDetails) {
  if (!reporterDetails || typeof reporterDetails !== "object") return "";
  const { fullName, age, phone, emergencyContacts } = reporterDetails;
  const parts = [fullName, age, phone].filter((v) => v != null && String(v).trim() !== "");
  const contacts = Array.isArray(emergencyContacts) ? emergencyContacts : [];
  for (const c of contacts) {
    if (c?.name) parts.push(c.name);
    if (c?.phone) parts.push(c.phone);
    if (c?.relation) parts.push(c.relation);
  }
  return parts.join(" ").toLowerCase();
}
