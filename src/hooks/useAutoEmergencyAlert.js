import { useEffect, useRef } from "react";
import { useDashboard } from "../store/DashboardContext.jsx";

/**
 * Watches for new active emergencies and triggers the alert popup.
 * Uses a ref Set so it never re-triggers for the same emergency ID.
 */
export function useAutoEmergencyAlert(loading) {
  const { state, dispatch } = useDashboard();
  const seenIds = useRef(new Set());

  useEffect(() => {
    if (loading) return;

    const newActive = state.emergencies
      .filter((e) => e.status === "active" && !seenIds.current.has(e.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (newActive.length === 0) return;

    // Mark all current actives as seen
    newActive.forEach((e) => seenIds.current.add(e.id));

    // Trigger popup for the newest one
    dispatch({ type: "SET_ACTIVE_EMERGENCY", payload: newActive[0].id });
  }, [loading, state.emergencies, dispatch]);
}