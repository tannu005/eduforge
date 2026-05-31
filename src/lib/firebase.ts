import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Your web app's Firebase configuration
// These values are pulled from the .env.local file.
// If the file is missing, the app will log a warning.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "00000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:00000000000:web:0000000000"
};

if (firebaseConfig.apiKey === "dummy-api-key") {
  console.warn("⚠️ Firebase is using dummy configuration keys! Real authentication will fail. Please create a .env.local file with your Firebase credentials.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Explicitly set persistence to local storage so users stay logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase Auth Persistence Error:", error);
});
