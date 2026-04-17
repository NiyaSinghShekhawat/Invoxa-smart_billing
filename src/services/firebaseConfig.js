import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBPq8rFlgc79Dv19Atl3Bz9NKJvpgYAiQA",
  authDomain: "rapid-crisis-response-41ef1.firebaseapp.com",
  projectId: "rapid-crisis-response-41ef1",
  storageBucket: "rapid-crisis-response-41ef1.firebasestorage.app",
  messagingSenderId: "231140703724",
  appId: "1:231140703724:web:3b7720c4973db8dd73d4c9",
};

export function initFirebase() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }

  return getApp();
}

export function initFirestore() {
  return getFirestore(initFirebase());
}
