// ─── Emergency types ──────────────────────────────────────────────────────────
// Internal values are lowercase; Sam writes UPPERCASE — normalized in api.js
export const EMERGENCY_TYPES = {
  MEDICAL: "medical",
  FIRE:    "fire",
  CRIME:   "crime",
  DEATH:   "death",
};

export const EMERGENCY_TYPE_LABELS = {
  medical: "Medical / Injury",
  fire:    "Fire",
  crime:   "Crime / Security",
  death:   "Death",
};

export const EMERGENCY_TYPE_COLORS = {
  medical: { color: "#EF4444", bg: "rgba(239,68,68,0.1)",    icon: "✚" },
  fire:    { color: "#F97316", bg: "rgba(249,115,22,0.1)",   icon: "◈" },
  crime:   { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)",   icon: "⬡" },
  death:   { color: "#6B7280", bg: "rgba(107,114,128,0.1)",  icon: "◆" },
};

// ─── Statuses ─────────────────────────────────────────────────────────────────
// Sam uses "pending" / "completed" — normalized to active / resolved in api.js
export const EMERGENCY_STATUSES = {
  ACTIVE:   "active",
  RESOLVED: "resolved",
};

// ─── Severity ─────────────────────────────────────────────────────────────────
// Sam uses "MAJOR" / "MINOR" — normalized to lowercase in api.js
export const SEVERITY = {
  MINOR: "minor",
  MAJOR: "major",
};

// ─── Authorities (hardcoded for now) ─────────────────────────────────────────
export const AUTHORITY_TYPES = {
  HOSPITAL: "hospital",
  POLICE:   "police",
  FIRE:     "fire_dept",
};

export const AUTHORITIES = [
  {
    id:           "hosp_001",
    name:         "City General Hospital",
    type:         "hospital",
    contactName:  "Dr. Priya Reddy",
    contactPhone: "+91-98765-43210",
  },
  {
    id:           "hosp_002",
    name:         "Apollo Emergency Care",
    type:         "hospital",
    contactName:  "Dr. Arjun Mehta",
    contactPhone: "+91-91234-56789",
  },
  {
    id:           "police_001",
    name:         "Banjara Hills Police Station",
    type:         "police",
    contactName:  "Inspector Ravi Kumar",
    contactPhone: "+91-40-2345-6789",
  },
  {
    id:           "fire_001",
    name:         "HMC Fire & Rescue",
    type:         "fire_dept",
    contactName:  "Station Officer Salim",
    contactPhone: "+91-40-101",
  },
];

// Which authority types get dispatched per emergency type
export const DISPATCH_MAP = {
  medical: ["hospital"],
  fire:    ["fire_dept", "hospital"],
  crime:   ["police"],
  death:   ["police", "hospital"],
};