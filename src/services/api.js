import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { initFirestore } from "./firebaseConfig.js";
import { EMERGENCY_STATUSES, EMERGENCY_TYPES, SEVERITY } from "../utils/constants.js";

const db = initFirestore();
const emergenciesCol = collection(db, "emergencies");

function normalizeTimestamp(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return null;
}

function normalizeType(value) {
  const t = String(value ?? "").toLowerCase();
  if (Object.values(EMERGENCY_TYPES).includes(t)) return t;
  return EMERGENCY_TYPES.MEDICAL;
}

function normalizeSeverity(value) {
  const s = String(value ?? "").toLowerCase();
  return s === SEVERITY.MAJOR ? SEVERITY.MAJOR : SEVERITY.MINOR;
}

function normalizeStatus(value, resolvedAt) {
  const status = String(value ?? "").toLowerCase();
  if (status === EMERGENCY_STATUSES.RESOLVED || resolvedAt) return EMERGENCY_STATUSES.RESOLVED;
  return EMERGENCY_STATUSES.ACTIVE;
}

function normalizeEmergency(snapshot) {
  const data = snapshot.data() ?? {};
  const createdAt = normalizeTimestamp(data.createdAt) ?? new Date().toISOString();
  const resolvedAt = normalizeTimestamp(data.resolvedAt);
  const severity = normalizeSeverity(data.severity);
  const type = normalizeType(data.type);
  const targetAuthorities = Array.isArray(data.targetAuthorities) ? data.targetAuthorities : [];
  const assignment = data.assignment ?? null;

  return {
    id: data.id || snapshot.id,
    type,
    severity,
    status: normalizeStatus(data.status, resolvedAt),
    location: data.location ?? data.address ?? "Unknown location",
    additionalNotes: data.additionalNotes ?? data.notes ?? data.summary ?? "",
    summary: data.summary ?? "",
    authoritiesNotified: severity === SEVERITY.MAJOR || Boolean(data.authoritiesNotified),
    createdAt,
    resolvedAt,
    reporterDetails: data.reporterDetails ?? null,
    targetAuthorities,
    assignment: assignment
      ? {
          assignedTo: assignment.assignedTo ?? null,
          acceptedAt: normalizeTimestamp(assignment.acceptedAt),
          authorityType: assignment.authorityType ?? null,
          contactPhone: assignment.contactPhone ?? null,
          contactName: assignment.contactName ?? null,
          status: assignment.status ?? "accepted",
        }
      : null,
    coordination: data.coordination ?? null,
    escalationReason: data.escalationReason ?? null,
  };
}

export function subscribeToEmergencies(onData, onError) {
  const q = query(emergenciesCol, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map(normalizeEmergency);
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function fetchEmergencyById(id) {
  const snapshot = await getDoc(doc(db, "emergencies", id));
  if (!snapshot.exists()) return null;
  return normalizeEmergency(snapshot);
}

export async function resolveEmergency(emergencyId, resolvedBy = "hotel_emergency_team") {
  await updateDoc(doc(db, "emergencies", emergencyId), {
    status: EMERGENCY_STATUSES.RESOLVED,
    resolvedAt: serverTimestamp(),
    resolvedBy,
  });
}

export async function acceptAuthorityDispatch(emergencyId, authority) {
  const ref = doc(db, "emergencies", emergencyId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) {
      throw new Error("Emergency case no longer exists.");
    }

    const data = snapshot.data() ?? {};
    const status = String(data.status ?? "").toLowerCase();
    if (status === EMERGENCY_STATUSES.RESOLVED) {
      throw new Error("This emergency has already been resolved.");
    }

    const currentAssignment = data.assignment ?? null;
    const alreadyAssigned = currentAssignment?.assignedTo && currentAssignment?.status === "accepted";
    if (alreadyAssigned && currentAssignment.assignedTo !== authority.id) {
      throw new Error("Dispatch already accepted by another authority.");
    }

    transaction.update(ref, {
      assignment: {
        assignedTo: authority.id,
        authorityType: authority.type,
        contactName: authority.contactName ?? null,
        contactPhone: authority.contactPhone ?? null,
        acceptedAt: serverTimestamp(),
        status: "accepted",
      },
      dispatchOpen: false,
      updatedAt: serverTimestamp(),
    });

    return {
      assignedTo: authority.id,
      authorityType: authority.type,
    };
  });
}
