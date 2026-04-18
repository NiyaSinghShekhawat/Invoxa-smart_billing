// src/components/EmergencyList/FilterBar.jsx
import { EMERGENCY_TYPES } from "../../utils/constants.js";

export function FilterBar({ type, status, onTypeChange, onStatusChange }) {
  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <div className="field">
        <label className="field-label">Type</label>
        <select className="field-select" value={type} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="all">All types</option>
          <option value={EMERGENCY_TYPES.MEDICAL}>Medical</option>
          <option value={EMERGENCY_TYPES.FIRE}>Fire</option>
          <option value={EMERGENCY_TYPES.CRIME}>Crime</option>
          <option value={EMERGENCY_TYPES.DEATH}>Death</option>
        </select>
      </div>
      <div className="field">
        <label className="field-label">Status</label>
        <select className="field-select" value={status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
    </div>
  );
}
