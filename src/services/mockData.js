import { EMERGENCY_STATUSES, EMERGENCY_TYPES, SEVERITY } from "../utils/constants.js";

export const mockEmergencies = [
  {
    id: "RCR-1042",
    type: EMERGENCY_TYPES.MEDICAL,
    severity: SEVERITY.MAJOR,
    status: EMERGENCY_STATUSES.ACTIVE,
    location: "Floor 7 — Room 712 near elevator lobby",
    /** Optional: free text after initial report */
    additionalNotes: "Feeling dizzy; able to speak clearly.",
    authoritiesNotified: true,
    createdAt: new Date().toISOString(),
    reporterDetails: {
      fullName: "Jordan Lee",
      age: 34,
      phone: "+1 555-0142",
      emergencyContacts: [
        { name: "Sam Lee", relation: "Spouse", phone: "+1 555-0199" },
        { name: "Dr. A. Patel", relation: "GP", phone: "+1 555-0100" },
      ],
    },
  },
  {
    id: "RCR-1038",
    type: EMERGENCY_TYPES.FIRE,
    severity: SEVERITY.MINOR,
    status: EMERGENCY_STATUSES.RESOLVED,
    location: "Kitchen — staff break room toaster smoke, no flame",
    additionalNotes: "Burnt food smoke — cleared with ventilation.",
    authoritiesNotified: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    reporterDetails: null,
  },
  {
    id: "RCR-1031",
    type: EMERGENCY_TYPES.CRIME,
    severity: SEVERITY.MAJOR,
    status: EMERGENCY_STATUSES.RESOLVED,
    location: "Lobby — main entrance",
    additionalNotes: "Disturbance de-escalated; police attended.",
    authoritiesNotified: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reporterDetails: {
      fullName: "Alex Morgan",
      age: 29,
      phone: "+1 555-0166",
      emergencyContacts: [{ name: "R. Morgan", relation: "Parent", phone: "+1 555-0167" }],
    },
  },
];
