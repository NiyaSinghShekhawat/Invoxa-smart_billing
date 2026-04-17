import "./DashboardLayout.css";
import { Header } from "../Header/Header.jsx";
import { EmergencyList } from "../EmergencyList/EmergencyList.jsx";
import { ActiveEmergencyModal } from "../EmergencyAlert/ActiveEmergencyModal.jsx";
import { AlertSound } from "../EmergencyAlert/AlertSound.jsx";
import { useEmergencies } from "../../hooks/useEmergencies.js";
import { useActiveEmergency } from "../../hooks/useActiveEmergency.js";
import { useAutoEmergencyAlert } from "../../hooks/useAutoEmergencyAlert.js";

export function DashboardLayout() {
  const { loading, error } = useEmergencies();
  useAutoEmergencyAlert(loading);
  const { active } = useActiveEmergency();

  return (
    <div className="dashboard-root">
      <Header />
      <main className="dashboard-main">
        {error && <p className="dashboard-error">Live feed error: {error.message}</p>}
        <EmergencyList loading={loading} />
      </main>
      <ActiveEmergencyModal emergency={active} />
      <AlertSound alertId={active?.id ?? null} />
    </div>
  );
}
