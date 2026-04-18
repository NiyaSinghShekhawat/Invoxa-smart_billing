import { useEffect } from "react";
import { useDashboard } from "../store/DashboardContext.jsx";

/**
 * Requests browser notification permission on mount.
 * Fires a browser notification when a new active emergency appears.
 */
export function useNotification() {
  const { state } = useDashboard();

  // Request permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fire notification when activeEmergencyId changes
  useEffect(() => {
    if (!state.activeEmergencyId) return;
    if (Notification.permission !== "granted") return;

    const emergency = state.emergencies.find((e) => e.id === state.activeEmergencyId);
    if (!emergency) return;

    const n = new Notification(
      `🚨 ${emergency.type?.toUpperCase()} — ${emergency.severity?.toUpperCase()}`,
      {
        body:              `Location: ${emergency.location}`,
        icon:              "/favicon.ico",
        tag:               emergency.id,
        requireInteraction: true,
      }
    );

    return () => n.close();
  }, [state.activeEmergencyId, state.emergencies]);
}