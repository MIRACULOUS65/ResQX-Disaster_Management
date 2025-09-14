// Firebase Admin SDK configuration file
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { serviceAccountKey } from './firestoreConfig';

// Check if Firebase Admin SDK is properly configured
export const isFirebaseAdminConfigured = () => {
  return !!import.meta.env.VITE_FIREBASE_PRIVATE_KEY && 
         !!import.meta.env.VITE_FIREBASE_CLIENT_EMAIL;
};

// Initialize Firebase Admin SDK if properly configured
let db = null;

if (isFirebaseAdminConfigured()) {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccountKey as any),
      });
    }
    
    // Get Firestore instance
    db = getFirestore();
  } catch (error) {
    console.warn('Firebase Admin SDK initialization failed:', error);
  }
} else {
  console.warn('Firebase Admin SDK not configured. Add VITE_FIREBASE_PRIVATE_KEY and VITE_FIREBASE_CLIENT_EMAIL to your .env file');
}

// Export Firestore instance
export { db };