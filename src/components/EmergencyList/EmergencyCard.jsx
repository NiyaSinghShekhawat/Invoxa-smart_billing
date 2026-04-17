import "./EmergencyList.css";
import { Badge } from "../Common/Badge.jsx";
import { StatusIndicator } from "../Common/StatusIndicator.jsx";
import { Timestamp } from "../Common/Timestamp.jsx";
import { formatLocation } from "../../utils/formatters.js";
import { EMERGENCY_STATUSES, EMERGENCY_TYPE_LABELS, SEVERITY } from "../../utils/constants.js";
import { hasReporterDetails } from "../../utils/reporterDetails.js";

export function EmergencyCard({ item, onSelect, onAlert, selected }) {
  const typeLabel = EMERGENCY_TYPE_LABELS[item.type] ?? item.type;
  const showAuthorities = item.severity === SEVERITY.MAJOR || item.authoritiesNotified;
  const guestFile = hasReporterDetails(item.reporterDetails);

  return (
    <div className="emergency-card-wrap">
      <button
        type="button"
        className={`emergency-card${selected ? " emergency-card--selected" : ""}`}
        onClick={() => onSelect(item)}
      >
        <div className="emergency-card-type-row">
          <span className="emergency-card-type-label">{typeLabel}</span>
          <Badge variant={item.severity === SEVERITY.MAJOR ? "major" : "minor"}>
            {item.severity === SEVERITY.MAJOR ? "Major" : "Minor"}
          </Badge>
        </div>
        <div className="emergency-card-loc-block">
          <span className="emergency-card-loc-kicker">Location</span>
          <div className="emergency-card-loc">{formatLocation(item.location)}</div>
        </div>
        <div className="emergency-card-head">
          <span className="emergency-card-id">{item.id}</span>
          {guestFile && <span className="emergency-card-guest-chip">Guest details on file</span>}
        </div>
        {showAuthorities && <div className="emergency-card-flag">External authorities notified</div>}
        <div className="emergency-card-meta">
          <StatusIndicator status={item.status} />
          <Timestamp value={item.createdAt} />
        </div>
      </button>
      {item.status === EMERGENCY_STATUSES.ACTIVE && onAlert && (
        <button
          type="button"
          className="emergency-card-alert-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAlert(item);
          }}
        >
          Replay priority alert
        </button>
      )}
    </div>
  );
}
