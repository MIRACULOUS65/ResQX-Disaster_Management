// Firebase Firestore Configuration for Disaster Management
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return !!import.meta.env.VITE_FIREBASE_API_KEY && 
         !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
};

// Firebase configuration for client-side - load from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "avalanche-336f1"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "avalanche-336f1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "avalanche-336f1"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase only if properly configured
let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Initialize Firestore
    db = getFirestore(app);
    
    // Initialize Auth
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase not configured. Add VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID to your .env file');
}

export { db, auth };

// Service Account Configuration (for server-side operations)
// Service account credentials should be loaded from environment variables
export const serviceAccountKey = {
  "type": "service_account",
  "project_id": import.meta.env.VITE_FIREBASE_PROJECT_ID || "avalanche-336f1",
  "private_key_id": import.meta.env.VITE_FIREBASE_PRIVATE_KEY_ID || "",
  "private_key": import.meta.env.VITE_FIREBASE_PRIVATE_KEY ? import.meta.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : "",
  "client_email": import.meta.env.VITE_FIREBASE_CLIENT_EMAIL || "",
  "client_id": import.meta.env.VITE_FIREBASE_CLIENT_ID || "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": import.meta.env.VITE_FIREBASE_CERT_URL || "",
  "universe_domain": "googleapis.com"
};

// Log warning if service account credentials are missing
if (!import.meta.env.VITE_FIREBASE_PRIVATE_KEY || !import.meta.env.VITE_FIREBASE_CLIENT_EMAIL) {
  console.warn('Firebase Admin SDK service account credentials are missing. Add them to your .env file for server operations to work properly.');
}

export default db;
