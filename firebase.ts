
// FIX: Refactored to lazy-load Firebase services. Instead of initializing the app immediately at the top level,
// we export getter functions. This prevents the heavy Firebase SDKs from blocking the initial render
// until they are actually needed (e.g., when the user logs in or data is fetched).
// FIX: Separated type imports from value imports to resolve TypeScript errors.

import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDTGiFG3ACwOho2RZ33rwg2TelkpsM8qf4",
  authDomain: "dev-mobile-sales.firebaseapp.com",
  projectId: "dev-mobile-sales",
  storageBucket: "dev-mobile-sales.appspot.com",
  messagingSenderId: "466801136859",
  appId: "1:466801136859:web:22b04eb667c0ff336068fe",
  measurementId: "G-LZW5X3VMHY"
};

// Singleton instances
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;

// Export the services via getter functions for lazy initialization
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
};

export const getFirebaseDb = (): Firestore => {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
};

export const getFirebaseAnalytics = (): Analytics => {
  if (!analytics) {
    analytics = getAnalytics(getFirebaseApp());
  }
  return analytics;
};
