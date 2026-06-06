import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// --- CONFIG VALIDATION ---
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0) {
  console.warn(`[Firebase] Missing environment variables: ${missingKeys.join(", ")}.\nCreate a .env.local file with your Firebase project credentials.`);
}

const app = initializeApp(firebaseConfig);

// Initialize App Check for bot protection (reCAPTCHA v3)
// The site key should be provided via VITE_RECAPTCHA_SITE_KEY environment variable.
// In local development, set self.FIREBASE_APPCHECK_DEBUG_TOKEN = true before initialization.
let appCheck;
if (typeof window !== "undefined" && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
} else if (typeof window !== "undefined") {
  console.warn("[Firebase] Missing VITE_RECAPTCHA_SITE_KEY. AppCheck not initialized.");
}

// Initialize Services — wrapped to avoid crashing the React tree when keys are missing
export const db = getFirestore(app);

// Auth is the only service that throws hard on missing apiKey — wrap it gracefully
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  console.warn("[Firebase] Auth initialization failed (missing credentials?):", e.message);
  // Return a stub so the app doesn't crash — auth-gated pages will just redirect
  auth = null;
}
export { auth };

export const storage = getStorage(app);
