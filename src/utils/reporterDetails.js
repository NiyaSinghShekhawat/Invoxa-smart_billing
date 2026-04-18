/**
 * Helpers for working with the reporterDetails object
 * (normalized from Sam's additionalInfo map in api.js)
 */

export function hasReporterDetails(reporterDetails) {
  if (!reporterDetails || typeof reporterDetails !== "object") return false;
  const { fullName, phone, age, emergencyContactName } = reporterDetails;
  return !!(fullName?.trim() || phone?.trim() || age?.trim() || emergencyContactName?.trim());
}

export function reporterDetailsSearchBlob(reporterDetails) {
  if (!reporterDetails || typeof reporterDetails !== "object") return "";
  const { fullName, age, phone, emergencyContactName, emergencyContactPhone } = reporterDetails;
  return [fullName, age, phone, emergencyContactName, emergencyContactPhone]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}