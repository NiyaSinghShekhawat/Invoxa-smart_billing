import {
  collection, doc, getDoc, onSnapshot,
  orderBy, query, runTransaction,
  serverTimestamp, updateDoc, addDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { SEVERITY, AUTHORITIES, DISPATCH_MAP } from "../utils/constants.js";

const COLLECTION = "distressCalls";

const TYPE_MAP = {
  INJURY: "medical", MEDICAL: "medical",
  FIRE: "fire", CRIME: "crime", DEATH: "death",
  medical: "medical", fire: "fire", crime: "crime", death: "death",
};

function normalizeType(v)     { return TYPE_MAP[String(v ?? "").toUpperCase()] ?? "medical"; }
function normalizeSeverity(v) { return String(v ?? "").toLowerCase() === "major" ? SEVERITY.MAJOR : SEVERITY.MINOR; }
function normalizeStatus(v, completedAt) {
  const s = String(v ?? "").toLowerCase();
  if (s === "completed" || s === "resolved" || completedAt) return "resolved";
  return "active";
}
function normalizeTimestamp(v) {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v?.toDate === "function") return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return null;
}
function normalizeAdditionalInfo(info) {
  if (!info || typeof info !== "object") return { notes: "", reporterDetails: null };
  return {
    notes: String(info["Additional Details"] ?? ""),
    reporterDetails: {
      fullName:              String(info["Full Name"]                ?? ""),
      age:                   String(info["Age"]                      ?? ""),
      phone:                 String(info["Contact Number"]           ?? ""),
      emergencyContactName:  String(info["Emergency Contact Name"]   ?? ""),
      emergencyContactPhone: String(info["Emergency Contact Number"] ?? ""),
    },
  };
}

export function normalizeEmergency(snapshot) {
  const data = snapshot.data() ?? {};
  const { notes, reporterDetails } = normalizeAdditionalInfo(data.additionalInfo);
  const createdAt  = normalizeTimestamp(data.timestamp)   ?? new Date().toISOString();
  const resolvedAt = normalizeTimestamp(data.completedAt) ?? null;
  const severity   = normalizeSeverity(data.severity);

  const assignment = data.assignment
    ? {
        assignedTo:    data.assignment.assignedTo   ?? null,
        acceptedAt:    normalizeTimestamp(data.assignment.acceptedAt),
        authorityType: data.assignment.authorityType ?? null,
        contactPhone:  data.assignment.contactPhone  ?? null,
        contactName:   data.assignment.contactName   ?? null,
        status:        data.assignment.status        ?? "accepted",
      }
    : data.assignedTo
    ? { assignedTo: data.assignedTo, acceptedAt: normalizeTimestamp(data.acceptedAt),
        authorityType: null, contactPhone: null, contactName: data.assignedTo, status: "accepted" }
    : null;

  return {
    id:                  snapshot.id,
    type:                normalizeType(data.type),
    severity,
    status:              normalizeStatus(data.status, data.completedAt),
    location:            data.location     ?? "Unknown location",
    hotelName:           data.hotelName    ?? "",
    hotelAddress:        data.hotelAddress ?? "",
    additionalNotes:     notes,
    reporterDetails,
    authoritiesNotified: severity === SEVERITY.MAJOR && Boolean(data.authoritiesNotified),
    targetAuthorities:   Array.isArray(data.targetAuthorities) ? data.targetAuthorities : [],
    dispatchOpen:        data.dispatchOpen ?? false,
    assignment,
    createdAt,
    resolvedAt,
  };
}

export function subscribeToEmergencies(onData, onError) {
  const q = query(collection(db, COLLECTION), orderBy("timestamp", "desc"));
  return onSnapshot(q,
    (snap) => onData(snap.docs.map(normalizeEmergency)),
    (err)  => { if (onError) onError(err); }
  );
}

export function subscribeToMessages(emergencyId, onData) {
  const q = query(collection(db, COLLECTION, emergencyId, "messages"), orderBy("sentAt", "asc"));
  return onSnapshot(q, (snap) =>
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data(), sentAt: normalizeTimestamp(d.data().sentAt) })))
  );
}

export async function fetchEmergencyById(id) {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return normalizeEmergency(snap);
}

export async function resolveEmergency(emergencyId, resolvedBy = "hotel_emergency_team") {
  await updateDoc(doc(db, COLLECTION, emergencyId), {
    status: "completed", completedAt: serverTimestamp(), resolvedBy,
  });
}

export async function dispatchToAuthorities(emergencyId, emergencyType) {
  const types   = DISPATCH_MAP[emergencyType] ?? [];
  const matched = AUTHORITIES.filter((a) => types.includes(a.type));
  const targetAuthorities = matched.map((a) => ({
    id: a.id, name: a.name, type: a.type,
    contactName: a.contactName, contactPhone: a.contactPhone, status: "pending",
  }));
  await updateDoc(doc(db, COLLECTION, emergencyId), {
    targetAuthorities, dispatchOpen: true, authoritiesNotified: true,
  });
  return targetAuthorities;
}

export async function acceptAuthorityDispatch(emergencyId, authority) {
  const ref = doc(db, COLLECTION, emergencyId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Emergency no longer exists.");
    const data = snap.data() ?? {};
    if (String(data.status ?? "").toLowerCase() === "completed") throw new Error("Already resolved.");
    const cur = data.assignment ?? null;
    if (cur?.assignedTo && cur.status === "accepted" && cur.assignedTo !== authority.id)
      throw new Error("Already accepted by another authority.");
    const updatedAuthorities = (data.targetAuthorities ?? []).map((a) => {
      if (a.id === authority.id)     return { ...a, status: "accepted" };
      if (a.type === authority.type) return { ...a, status: "declined" };
      return a;
    });
    tx.update(ref, {
      assignment: {
        assignedTo: authority.id, authorityType: authority.type,
        contactName: authority.contactName ?? null, contactPhone: authority.contactPhone ?? null,
        acceptedAt: serverTimestamp(), status: "accepted",
      },
      assignedTo: authority.name, acceptedAt: serverTimestamp(),
      targetAuthorities: updatedAuthorities, dispatchOpen: false,
    });
    return { assignedTo: authority.id };
  });
}

export async function sendMessage(emergencyId, message) {
  await addDoc(collection(db, COLLECTION, emergencyId, "messages"), { ...message, sentAt: serverTimestamp() });
}