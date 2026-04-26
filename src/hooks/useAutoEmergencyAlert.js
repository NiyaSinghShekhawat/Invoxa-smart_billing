import { useEffect, useRef } from "react";
import { useDashboard } from "../store/DashboardContext.jsx";
import { EMERGENCY_STATUSES } from "../utils/constants.js";

/**
 * Watches for new active emergencies and triggers the alert popup + sound.
 * First sync after load seeds known IDs without opening the modal (no false alert on refresh).
 */
export function useAutoEmergencyAlert(loading) {
  const { state, dispatch } = useDashboard();
  const seenIds = useRef(new Set());
  const initialSyncDone = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!initialSyncDone.current) {
      initialSyncDone.current = true;
      state.emergencies.forEach((e) => seenIds.current.add(e.id));
      return;
    }

    const newActive = state.emergencies
      .filter((e) => e.status === EMERGENCY_STATUSES.ACTIVE && !seenIds.current.has(e.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (newActive.length === 0) return;

    newActive.forEach((e) => seenIds.current.add(e.id));

    dispatch({ type: "SET_ACTIVE_EMERGENCY", payload: newActive[0].id });
  }, [loading, state.emergencies, dispatch]);
}