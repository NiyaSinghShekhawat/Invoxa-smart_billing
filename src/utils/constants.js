export const EMERGENCY_TYPES = {
  MEDICAL: "medical",
  FIRE: "fire",
  CRIME: "crime",
  DEATH: "death",
};

export const EMERGENCY_TYPE_LABELS = {
  [EMERGENCY_TYPES.MEDICAL]: "Medical",
  [EMERGENCY_TYPES.FIRE]: "Fire",
  [EMERGENCY_TYPES.CRIME]: "Crime / security",
  [EMERGENCY_TYPES.DEATH]: "Death",
};

export const EMERGENCY_STATUSES = {
  ACTIVE: "active",
  RESOLVED: "resolved",
};

/** Guest-reported level: minor = property team only; major = external authorities too */
export const SEVERITY = {
  MINOR: "minor",
  MAJOR: "major",
};
