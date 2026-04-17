import { useEffect, useRef } from "react";
import { EMERGENCY_STATUSES } from "../utils/constants.js";
import { useDashboard } from "../store/DashboardContext.jsx";

/**
 * When a new active emergency appears (e.g. from polling), open the priority modal and play sound.
 */
export function useAutoEmergencyAlert(loading) {
  const { state, dispatch } = useDashboard();
  const seenActiveIds = useRef(new Set());

  useEffect(() => {
    if (loading) return;
    const actives = state.emergencies
      .filter((e) => e.status === EMERGENCY_STATUSES.ACTIVE)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const newestUnseen = actives.find((e) => !seenActiveIds.current.has(e.id));
    if (!newestUnseen) return;
    seenActiveIds.current.add(newestUnseen.id);
    dispatch({ type: "SET_ACTIVE_EMERGENCY", payload: newestUnseen.id });
  }, [loading, state.emergencies, dispatch]);
}
