
// FIX: Refactored to lazy-load Firebase services. Instead of initializing the app immediately at the top level,
// we export getter functions. This prevents the heavy Firebase SDKs from blocking the initial render
// until they are actually needed (e.g., when the user logs in or data is fetched).
// FIX: Used namespace imports and 'any' types for Firebase modules to resolve "no exported member" TypeScript errors.

import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import * as firebaseAnalytics from "firebase/analytics";

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
let app: any;
let auth: any;
let db: any;
let analytics: any;

// Export the services via getter functions for lazy initialization
export const getFirebaseApp = (): any => {
  if (!app) {
    // Cast to 'any' to bypass TS error if initializeApp is not found in type definitions
    app = (firebaseApp as any).initializeApp(firebaseConfig);
  }
  return app;
};

export const getFirebaseAuth = (): any => {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
};

export const getFirebaseDb = (): any => {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
};

export const getFirebaseAnalytics = (): any => {
  if (!analytics) {
    // Cast to 'any' to bypass TS error if getAnalytics is not found in type definitions
    if ((firebaseAnalytics as any).getAnalytics) {
        analytics = (firebaseAnalytics as any).getAnalytics(getFirebaseApp());
    }
  }
  return analytics;
};
