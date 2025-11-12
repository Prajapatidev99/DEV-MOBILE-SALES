// FIX: The application uses the Firebase v8 compatibility syntax but the import map pointed to the v9 modular SDK, which caused import errors. This has been corrected by changing the imports to use the v9 compatibility libraries (e.g., 'firebase/compat/app'). This change, combined with updates to the import map in index.html, resolves the module loading failure.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';

// Your web app's Firebase configuration from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDTGiFG3ACwOho2RZ33rwg2TelkpsM8qf4",
  authDomain: "dev-mobile-sales.firebaseapp.com",
  projectId: "dev-mobile-sales",
  storageBucket: "dev-mobile-sales.appspot.com",
  messagingSenderId: "466801136859",
  appId: "1:466801136859:web:22b04eb667c0ff336068fe",
  measurementId: "G-LZW5X3VMHY"
};

// Initialize Firebase
// FIX: Switched from v9 `initializeApp` to v8 `firebase.initializeApp` and removed App Check, which is a v9+ feature, to align with the older SDK.
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Export the services for use in other parts of the app
export { app, auth, db, storage, analytics };