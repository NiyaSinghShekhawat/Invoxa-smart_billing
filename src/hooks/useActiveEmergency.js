import { useCallback } from "react";
import { useDashboard } from "../store/DashboardContext.jsx";

export function useActiveEmergency() {
  const { state, dispatch } = useDashboard();
  const active = state.emergencies.find((e) => e.id === state.activeEmergencyId) ?? null;

  const setActive = useCallback(
    (id) => {
      dispatch({ type: "SET_ACTIVE_EMERGENCY", payload: id });
    },
    [dispatch]
  );

  const clearActive = useCallback(() => {
    dispatch({ type: "SET_ACTIVE_EMERGENCY", payload: null });
  }, [dispatch]);

  return { active, setActive, clearActive };
}
