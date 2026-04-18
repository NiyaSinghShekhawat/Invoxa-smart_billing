// src/components/EmergencyList/ReporterDetailsBlock.jsx
export function ReporterDetailsBlock({ reporterDetails }) {
  const r = reporterDetails;
  if (!r) return null;
  const hasAny = r.fullName || r.age || r.phone || r.emergencyContactName;
  if (!hasAny) return null;

  return (
    <section className="case-reporter-section" aria-labelledby="reporter-heading">
      <h3 id="reporter-heading" className="case-section-title">Reporter details</h3>
      <dl className="case-dl">
        {r.fullName && (
          <div className="case-dl-row">
            <dt>Name</dt><dd>{r.fullName}</dd>
          </div>
        )}
        {r.age && (
          <div className="case-dl-row">
            <dt>Age</dt><dd>{r.age}</dd>
          </div>
        )}
        {r.phone && (
          <div className="case-dl-row">
            <dt>Phone</dt>
            <dd><a href={"tel:" + r.phone}>{r.phone}</a></dd>
          </div>
        )}
        {r.emergencyContactName && (
          <div className="case-dl-row">
            <dt>Emg. contact</dt>
            <dd>
              {r.emergencyContactName}
              {r.emergencyContactPhone && <> · <a href={"tel:" + r.emergencyContactPhone}>{r.emergencyContactPhone}</a></>}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
