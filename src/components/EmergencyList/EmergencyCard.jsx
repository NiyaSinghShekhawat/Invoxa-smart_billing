import { useState } from "react";
import { Badge } from "../Common/Badge.jsx";
import { StatusIndicator } from "../Common/StatusIndicator.jsx";
import { Timestamp } from "../Common/Timestamp.jsx";
import { formatLocation } from "../../utils/formatters.js";
import { EMERGENCY_TYPE_LABELS, SEVERITY } from "../../utils/constants.js";

// Named export — matches how EmergencyList.jsx imports it: { EmergencyCard }
export function EmergencyCard({ item, selected, onSelect, onAlert }) {
  if (!item) return null;

  const typeLabel = EMERGENCY_TYPE_LABELS[item.type] ?? item.type;
  const isMajor   = item.severity === SEVERITY.MAJOR;
  const isAssigned = !!item.assignment;

  return (
    <button
      type="button"
      className={"emergency-card" + (selected ? " emergency-card--selected" : "")}
      onClick={() => onSelect(item)}
    >
      <div className="emergency-card-type-row">
        <span className="emergency-card-type-label">{typeLabel}</span>
        <Badge variant={isMajor ? "major" : "minor"}>
          {isMajor ? "Major" : "Minor"}
        </Badge>
      </div>

      <div className="emergency-card-loc-block">
        <span className="emergency-card-loc-kicker">Location</span>
        <span className="emergency-card-loc">{formatLocation(item.location)}</span>
      </div>

      {item.hotelName && (
        <div className="emergency-card-loc-block">
          <span className="emergency-card-loc-kicker">Hotel</span>
          <span className="emergency-card-loc">{item.hotelName}</span>
        </div>
      )}

      <div className="emergency-card-meta">
        <StatusIndicator status={item.status} />
        <Timestamp value={item.createdAt} />
      </div>

      {isMajor && !isAssigned && item.authoritiesNotified && (
        <p className="emergency-card-flag">⚡ Authorities notified</p>
      )}
      {isAssigned && (
        <p className="emergency-card-flag">
          ✓ {item.assignment.contactName ?? item.assignment.assignedTo} responding
        </p>
      )}

      {item.status === "active" && (
        <button
          type="button"
          className="emergency-card-alert-btn"
          onClick={(e) => { e.stopPropagation(); onAlert(item); }}
        >
          Raise alert
        </button>
      )}
    </button>
  );
}
