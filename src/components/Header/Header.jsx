import "./Header.css";
import { EMERGENCY_STATUSES } from "../../utils/constants.js";
import { useDashboard } from "../../store/DashboardContext.jsx";

export function Header() {
  const { state } = useDashboard();
  const activeCount = state.emergencies.filter((e) => e.status === EMERGENCY_STATUSES.ACTIVE).length;

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <span className="app-header-mark" aria-hidden="true" />
        <div>
          <h1>Rapid Crisis Response</h1>
          <p className="app-header-tagline">Primary receiver · Hotel emergency team</p>
        </div>
      </div>
      <div className="header-stats">
        <span>
          <strong>{state.emergencies.length}</strong> total
        </span>
        <span className={activeCount > 0 ? "header-stats-active" : ""}>
          <strong>{activeCount}</strong> active
        </span>
      </div>
      <div className="header-user">Signed in · Staff</div>
    </header>
  );
}
