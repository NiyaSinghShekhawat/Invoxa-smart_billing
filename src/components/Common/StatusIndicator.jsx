import "./Common.css";
import { EMERGENCY_STATUSES } from "../../utils/constants.js";

export function StatusIndicator({ status }) {
  const active = status === EMERGENCY_STATUSES.ACTIVE;
  return (
    <span className="status-indicator" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
      <span
        className="status-dot"
        style={{ background: active ? "var(--color-danger)" : "var(--color-muted)" }}
      />
      {active ? "Active" : "Resolved"}
    </span>
  );
}
