import "./ActiveEmergencyModal.css";
import { Badge } from "../Common/Badge.jsx";
import { Timestamp } from "../Common/Timestamp.jsx";
import { formatLocation } from "../../utils/formatters.js";
import { useActiveEmergency } from "../../hooks/useActiveEmergency.js";
import { EMERGENCY_TYPE_LABELS, SEVERITY } from "../../utils/constants.js";
import { ReporterDetailsBlock } from "../EmergencyList/ReporterDetailsBlock.jsx";

export function ActiveEmergencyModal({ emergency }) {
  const { clearActive } = useActiveEmergency();
  if (!emergency) return null;

  const typeLabel = EMERGENCY_TYPE_LABELS[emergency.type] ?? emergency.type;
  const showAuthorities = emergency.severity === SEVERITY.MAJOR || emergency.authoritiesNotified;
  const notes = emergency.additionalNotes ?? emergency.summary;

  return (
    <div
      className="active-emergency-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="active-emergency-title"
    >
      <div className="active-emergency-dialog">
        <p className="active-emergency-kicker">Priority notification</p>
        <h2 id="active-emergency-title">New emergency reported</h2>
        <p className="active-emergency-lead">Guest quick report</p>

        <ol className="active-emergency-steps">
          <li>
            <span className="active-emergency-step-label">Type</span>
            <span className="active-emergency-step-value">{typeLabel}</span>
          </li>
          <li>
            <span className="active-emergency-step-label">Location</span>
            <span className="active-emergency-step-value">{formatLocation(emergency.location)}</span>
          </li>
          <li>
            <span className="active-emergency-step-label">Severity</span>
            <span className="active-emergency-step-value">
              <Badge variant={emergency.severity === SEVERITY.MAJOR ? "major" : "minor"}>
                {emergency.severity === SEVERITY.MAJOR ? "Major" : "Minor"}
              </Badge>
            </span>
          </li>
        </ol>

        {notes?.trim() && (
          <div className="active-emergency-notes">
            <span className="active-emergency-label">Additional notes</span>
            <p className="active-emergency-notes-body">{notes}</p>
          </div>
        )}

        <div className="active-emergency-modal-reporter">
          <ReporterDetailsBlock reporterDetails={emergency.reporterDetails} />
        </div>

        <div className="active-emergency-detail-block">
          <span className="active-emergency-label">Reference</span>
          <p className="active-emergency-ref-id">{emergency.id}</p>
          <Timestamp value={emergency.createdAt} />
        </div>

        {showAuthorities && (
          <div className="active-emergency-authorities" role="status">
            External authorities have been notified automatically.
          </div>
        )}

        <div className="active-emergency-actions">
          <button type="button" className="active-emergency-btn active-emergency-btn--ghost" onClick={clearActive}>
            Acknowledge
          </button>
          <button type="button" className="active-emergency-btn active-emergency-btn--primary" onClick={clearActive}>
            View on dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
