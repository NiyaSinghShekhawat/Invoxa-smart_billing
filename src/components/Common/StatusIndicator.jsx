export function StatusIndicator({ status }) {
  const normalized = String(status ?? "").toLowerCase();
  const isActive = normalized === "active";
  return (
    <span className={"status-indicator status-indicator--" + (isActive ? "active" : "resolved")}>
      <span
        className={isActive ? "status-dot status-dot--live" : "status-dot status-dot--resolved"}
        aria-hidden="true"
      />
      {isActive ? "Live" : "Resolved"}
    </span>
  );
}
