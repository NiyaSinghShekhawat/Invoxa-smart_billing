// src/components/Common/StatusIndicator.jsx
export function StatusIndicator({ status }) {
  return (
    <span className={"status-indicator status-indicator--" + status}>
      {status === "active" ? "Active" : "Resolved"}
    </span>
  );
}
