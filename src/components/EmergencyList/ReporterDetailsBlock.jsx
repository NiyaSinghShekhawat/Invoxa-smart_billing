import "./EmergencyList.css";
import { hasReporterDetails } from "../../utils/reporterDetails.js";

export function ReporterDetailsBlock({ reporterDetails, heading = "Guest details (if provided)" }) {
  if (!hasReporterDetails(reporterDetails)) return null;

  const { fullName, age, phone, emergencyContacts = [] } = reporterDetails;
  const rows = [
    ["Full name", fullName],
    ["Age", age != null && String(age).trim() !== "" ? String(age) : null],
    ["Phone", phone],
  ].filter(([, v]) => v != null && String(v).trim() !== "");

  return (
    <section className="case-reporter-section" aria-labelledby="case-reporter-heading">
      <h3 id="case-reporter-heading" className="case-section-title">
        {heading}
      </h3>
      {rows.length > 0 && (
        <dl className="case-dl">
          {rows.map(([label, value]) => (
            <div key={label} className="case-dl-row">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {emergencyContacts.some((c) => c?.name?.trim() || c?.phone?.trim()) && (
        <>
          <h4 className="case-subheading">Emergency contacts</h4>
          <ul className="case-contact-list">
            {emergencyContacts.map((c, i) => {
              if (!c?.name?.trim() && !c?.phone?.trim()) return null;
              return (
                <li key={i} className="case-contact-item">
                  <span className="case-contact-name">{c.name?.trim() || "—"}</span>
                  {c.relation?.trim() && <span className="case-contact-relation">{c.relation}</span>}
                  {c.phone?.trim() && <span className="case-contact-phone">{c.phone}</span>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
