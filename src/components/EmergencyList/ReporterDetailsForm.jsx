import { useEffect, useMemo, useState } from "react";

function getMissingFields(reporter = {}) {
  const missing = [];
  if (!reporter.fullName?.trim()) missing.push("name");
  if (!reporter.age?.trim()) missing.push("age");
  if (!reporter.phone?.trim()) missing.push("contact number");
  if (!reporter.emergencyContactName?.trim()) missing.push("emergency contact name");
  if (!reporter.emergencyContactPhone?.trim()) missing.push("emergency contact number");
  return missing;
}

export function ReporterDetailsForm({ emergencyId, reporterDetails, onSave, title = "Add missing guest details" }) {
  const reporter = reporterDetails ?? {};
  const missingReporterFields = useMemo(() => getMissingFields(reporter), [reporter]);
  const [reporterForm, setReporterForm] = useState({
    fullName: "",
    age: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [reporterBusy, setReporterBusy] = useState(false);
  const [reporterError, setReporterError] = useState("");
  const [reporterSaved, setReporterSaved] = useState(false);

  useEffect(() => {
    setReporterForm({
      fullName: reporter.fullName ?? "",
      age: reporter.age ?? "",
      phone: reporter.phone ?? "",
      emergencyContactName: reporter.emergencyContactName ?? "",
      emergencyContactPhone: reporter.emergencyContactPhone ?? "",
    });
    setReporterError("");
    setReporterSaved(false);
  }, [
    emergencyId,
    reporter.fullName,
    reporter.age,
    reporter.phone,
    reporter.emergencyContactName,
    reporter.emergencyContactPhone,
  ]);

  async function handleReporterSubmit(event) {
    event.preventDefault();
    if (!onSave) return;
    setReporterBusy(true);
    setReporterError("");
    setReporterSaved(false);
    try {
      await onSave(emergencyId, reporterForm);
      setReporterSaved(true);
    } catch (error) {
      setReporterError(error?.message ?? "Unable to save reporter details right now.");
    } finally {
      setReporterBusy(false);
    }
  }

  if (missingReporterFields.length === 0) return null;

  return (
    <section className="case-reporter-form-section" aria-labelledby="case-reporter-form-heading">
      <h3 id="case-reporter-form-heading" className="case-section-title">
        {title}
      </h3>
      <p className="detail-muted case-reporter-form-hint">
        Missing: {missingReporterFields.join(", ")}.
      </p>
      <form className="case-reporter-form" onSubmit={handleReporterSubmit}>
        <label className="field">
          <span className="field-label">Name</span>
          <input
            className="field-input"
            type="text"
            value={reporterForm.fullName}
            onChange={(e) => setReporterForm((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Guest full name"
          />
        </label>
        <label className="field">
          <span className="field-label">Age</span>
          <input
            className="field-input"
            type="text"
            value={reporterForm.age}
            onChange={(e) => setReporterForm((prev) => ({ ...prev, age: e.target.value }))}
            placeholder="Approx age"
          />
        </label>
        <label className="field">
          <span className="field-label">Contact number</span>
          <input
            className="field-input"
            type="tel"
            value={reporterForm.phone}
            onChange={(e) => setReporterForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Primary phone"
          />
        </label>
        <label className="field">
          <span className="field-label">Emergency contact name</span>
          <input
            className="field-input"
            type="text"
            value={reporterForm.emergencyContactName}
            onChange={(e) => setReporterForm((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
            placeholder="Emergency contact person"
          />
        </label>
        <label className="field">
          <span className="field-label">Emergency contact number</span>
          <input
            className="field-input"
            type="tel"
            value={reporterForm.emergencyContactPhone}
            onChange={(e) => setReporterForm((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
            placeholder="Emergency contact phone"
          />
        </label>
        <button type="submit" className="dispatch-accept-btn" disabled={reporterBusy}>
          {reporterBusy ? "Saving..." : "Save guest details"}
        </button>
      </form>
      {reporterSaved && <p className="case-reporter-form-success">Guest details updated.</p>}
      {reporterError && <p className="case-action-error">{reporterError}</p>}
    </section>
  );
}
