export const initialEmergencyState = {
  emergencies: [],
  activeEmergencyId: null,
};

export function emergencyReducer(state, action) {
  switch (action.type) {
    case "SET_EMERGENCIES":
      return { ...state, emergencies: action.payload };
    case "SET_ACTIVE_EMERGENCY":
      return { ...state, activeEmergencyId: action.payload };
    default:
      return state;
  }
}
