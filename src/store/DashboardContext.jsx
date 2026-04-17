import { createContext, useContext, useMemo, useReducer } from "react";
import { emergencyReducer, initialEmergencyState } from "./emergencyReducer.js";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(emergencyReducer, initialEmergencyState);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}
