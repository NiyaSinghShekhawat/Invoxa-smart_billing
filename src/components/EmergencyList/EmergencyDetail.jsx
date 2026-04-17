import "./EmergencyList.css";
import { Badge } from "../Common/Badge.jsx";
import { StatusIndicator } from "../Common/StatusIndicator.jsx";
import { Timestamp } from "../Common/Timestamp.jsx";
import { formatLocation } from "../../utils/formatters.js";
import { EMERGENCY_STATUSES, EMERGENCY_TYPE_LABELS, SEVERITY } from "../../utils/constants.js";
import { ReporterDetailsBlock } from "./ReporterDetailsBlock.jsx";

function renderAuthorityLabel(authorityType) {
  if (authorityType === "police") return "Police";
  if (authorityType === "hospital") return "Hospital";
  if (!authorityType) return "Authority";
  return authorityType;
}

export function EmergencyDetail({ item, onClose, onResolve, onAcceptDispatch, actionBusy, actionError }) {
  if (!item) return null;

  const typeLabel = EMERGENCY_TYPE_LABELS[item.type] ?? item.type;
  const showAuthorities = item.severity === SEVERITY.MAJOR || item.authoritiesNotified;
  const notes = item.additionalNotes ?? item.summary;
  const canResolve = item.status === EMERGENCY_STATUSES.ACTIVE;
  const authorities = Array.isArray(item.targetAuthorities) ? item.targetAuthorities : [];
  const assignment = item.assignment ?? null;
  const isAssigned = Boolean(assignment?.assignedTo);

  return (
    <div
      className="case-panel"
      role="region"
      aria-labelledby="case-panel-title"
    >
      <div className="case-panel-header">
        <div>
          <p className="case-panel-kicker">Case</p>
          <h2 id="case-panel-title" className="case-panel-title">
            {item.id}
          </h2>
        </div>
        <button type="button" className="detail-close" onClick={onClose} aria-label="Close case panel">
          ×
        </button>
      </div>

      <p className="case-panel-lead">Guest quick report (required fields)</p>

      <ol className="case-report-steps">
        <li>
          <span className="case-step-label">1. Type</span>
          <span className="case-step-value">{typeLabel}</span>
        </li>
        <li>
          <span className="case-step-label">2. Location</span>
          <span className="case-step-value">{formatLocation(item.location)}</span>
        </li>
        <li>
          <span className="case-step-label">3. Severity</span>
          <span className="case-step-value case-step-value--inline">
            <Badge variant={item.severity === SEVERITY.MAJOR ? "major" : "minor"}>
              {item.severity === SEVERITY.MAJOR ? "Major" : "Minor"}
            </Badge>
          </span>
        </li>
      </ol>

      {notes?.trim() && (
        <section className="case-notes-section" aria-labelledby="case-notes-heading">
          <h3 id="case-notes-heading" className="case-section-title">
            Additional notes
          </h3>
          <p className="detail-muted case-notes-body">{notes}</p>
        </section>
      )}

      <ReporterDetailsBlock reporterDetails={item.reporterDetails} />

      {showAuthorities && (
        <div className="detail-banner" role="status">
          Major incident: police, medical, or fire services were auto-alerted per your escalation rules.
        </div>
      )}

      {showAuthorities && (
        <section className="case-dispatch-section" aria-labelledby="case-dispatch-heading">
          <h3 id="case-dispatch-heading" className="case-section-title">
            Authority dispatch
          </h3>
          {isAssigned ? (
            <div className="dispatch-assigned">
              <p className="dispatch-assigned-title">
                Assigned to {renderAuthorityLabel(assignment.authorityType)} ({assignment.assignedTo})
              </p>
              <p className="detail-muted">
                Accepted at <Timestamp value={assignment.acceptedAt} />
              </p>
              {(assignment.contactName || assignment.contactPhone) && (
                <p className="detail-muted">
                  Contact: {assignment.contactName || "Team"} {assignment.contactPhone ? `· ${assignment.contactPhone}` : ""}
                </p>
              )}
            </div>
          ) : authorities.length > 0 ? (
            <div className="dispatch-target-list">
              {authorities.map((authority) => (
                <button
                  key={authority.id}
                  type="button"
                  className="dispatch-accept-btn"
                  disabled={actionBusy}
                  onClick={() => onAcceptDispatch(item.id, authority)}
                >
                  Mark accepted by {authority.name || authority.id}
                </button>
              ))}
              <p className="detail-muted">
                First authority to accept is locked to the case, and other dashboards can hide this request.
              </p>
            </div>
          ) : (
            <p className="detail-muted">No target authority list is attached to this case.</p>
          )}
        </section>
      )}

      <section className="case-coordination-section" aria-labelledby="case-coordination-heading">
        <h3 id="case-coordination-heading" className="case-section-title">
          Coordination contacts
        </h3>
        {isAssigned || item.coordination ? (
          <dl className="case-dl">
            <div className="case-dl-row">
              <dt>Hotel team</dt>
              <dd>{item.coordination?.hotelContact ?? "Front desk / emergency manager"}</dd>
            </div>
            <div className="case-dl-row">
              <dt>External team</dt>
              <dd>
                {isAssigned
                  ? `${renderAuthorityLabel(assignment.authorityType)} (${assignment.assignedTo})`
                  : "Pending acceptance"}
              </dd>
            </div>
            <div className="case-dl-row">
              <dt>Phone</dt>
              <dd>{assignment?.contactPhone ?? item.coordination?.authorityPhone ?? "Not provided"}</dd>
            </div>
          </dl>
        ) : (
          <p className="detail-muted">Add contact details in the case document to enable quick coordination.</p>
        )}
      </section>

      {actionError && <p className="case-action-error">{actionError}</p>}

      <div className="case-panel-footer">
        <StatusIndicator status={item.status} />
        <Timestamp value={item.createdAt} />
      </div>
      {canResolve && (
        <button
          type="button"
          className="case-resolve-btn"
          disabled={actionBusy}
          onClick={() => onResolve(item.id)}
        >
          {actionBusy ? "Updating..." : "Mark as resolved"}
        </button>
      )}
    </div>
  );
}
