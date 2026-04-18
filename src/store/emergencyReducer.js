export const initialEmergencyState = {
  emergencies:       [],   // full list from Firestore
  activeEmergencyId: null, // drives the alert popup
  tab:               "live", // "live" | "history"
};

export function emergencyReducer(state, action) {
  switch (action.type) {
    case "SET_EMERGENCIES":
      return { ...state, emergencies: action.payload };
    case "SET_ACTIVE_EMERGENCY":
      return { ...state, activeEmergencyId: action.payload };
    case "SET_TAB":
      return { ...state, tab: action.payload };
    default:
      return state;
  }
}