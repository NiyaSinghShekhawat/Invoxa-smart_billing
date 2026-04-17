import "./EmergencyList.css";
import { EMERGENCY_STATUSES, EMERGENCY_TYPES, EMERGENCY_TYPE_LABELS } from "../../utils/constants.js";

const TYPE_OPTIONS = ["all", ...Object.values(EMERGENCY_TYPES)];
const STATUS_OPTIONS = ["all", ...Object.values(EMERGENCY_STATUSES)];

function typeLabel(value) {
  if (value === "all") return "All types";
  return EMERGENCY_TYPE_LABELS[value] ?? value;
}

function statusLabel(value) {
  if (value === "all") return "All statuses";
  return value === EMERGENCY_STATUSES.ACTIVE ? "Active" : "Resolved";
}

export function FilterBar({ type, status, onTypeChange, onStatusChange }) {
  return (
    <>
      <label className="field">
        <span className="field-label">Type</span>
        <select className="field-select" value={type} onChange={(e) => onTypeChange(e.target.value)}>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Status</span>
        <select className="field-select" value={status} onChange={(e) => onStatusChange(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
