// Firebase Firestore Configuration for Disaster Management
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!import.meta.env.VITE_FIREBASE_API_KEY && 
         !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
};

// Firebase configuration for avalanche-p2p project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "avalanche-p2p"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "avalanche-p2p",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "avalanche-p2p"}.appspot.com`,
  messagingSenderId: "109577701312365258023",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
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

// Service Account Configuration (for server-side operations) - P2P Connection
export const serviceAccountKey = {
  "type": "service_account",
  "project_id": "avalanche-p2p",
  "private_key_id": "1bc4d2209f10a10a8b8ab0ce10bb5eec2e652086",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDD1uS3UFbXxVqm\nh/gvZX2cg2NqlF3trvWuT4yTH/ewX77U2a7wV4WdaGec7QP1XnjBoHdn1PhATQND\nb5vZRE4FjEEZ1EKGYHrrQ/2IdpSj6p5gkbDhxyJSOmYJPuaH8ue0nIUDELJkMTIG\nqqDYRZqRajX62GCZfYjWC6ErPV9AKgs7bterAiJN1iAnhO6xtonQ0bF2Xf7262S6\noJj9zNH5SDlfM27V2ytFiaKj7/1ThSdDQ6kEpmzNewScA4N27Hm0HhJb8tIp40m5\njlbk3IPBPY2bDUtFe+zLDm3g3lY+cTXNHm7Rx0t4llsa4ypHb/iJBLTVrKBfK86s\nAQx84NOVAgMBAAECggEAClLfuuu/SDlp7lfbzq1sK74GLzrwoKdie1sYlZqDAiDQ\nYup+yfV/+hMXTMx2mVuIXhyv1SEC9tDLsguS80C7vcsg+22XFcjF2HUjF/iFHKCX\nn/U0lkWOTgT9SZ6vpGcHrYIhLBvLOHQap2m2eCNjL8Gh/grXozL2h0h7QvF45F1V\nBfyYQD2+SW2DwHjWs3aZ6NzI2YBdjkUSEptijp6Ix4qbIhG+K70Gc97jK3e0QGT2\nC/g5VCePUcFxYCBDgZ25Iwr1IH6xOvaYcPrSnGGZ7uc26A7hLQc7qsfhC15rXtLr\nrRQ/mTy8XwBNM4rTIYiAG5u80JYBXE7xXMWi481yWQKBgQDguMLSbT+vVRkLzGio\nwOYxORhgU7GTg6mdktJYc5ITlUVcLRUjyEP0eAgKPWM5T2Wz4ccEl7MxgbxCQlqf\n5bpPvnRc0IdnRKMqv3Qx/Ai4hAwCRzYm03bcK9fK7nnO1hqhucNyF3OZ9GNFkX1/\nRwtsaVjhqI//0gfpbP+dgQwkAwKBgQDfGQEZXTU8K2ht7cExFNkyEiUFJaqA840o\nEoFPPbUNjaQ7qt2hdlak6HBEjXYr1mM0W009osyewkcqzboMTSP4SR84B81WrU2f\nJE38LxZ9dMWy3J1muiIPfp0OLjdVIpLq+tlKv6MoTZUlynwGnyRQihcH4bTVBTf8\nchcQ6yXyhwKBgHtpHBzhwGKykjGnjSZ34TLRDzD/ZXsEiGav1fKbbXJxvIiVfZGM\nDr24GXo+Ijq7/rdd26ULBm6+t7uPoyNCzyGyD0dVgbbVu+HjCJXWupdSdSHfJ78E\nzLa3ISgh9SUA8dk1Ij+K34KB8u6mqsv2ITDlXdl3b7VnC89Ge85sq1UvAoGBAIFQ\nOf3cs/WrZ32IeRmc7wQB1ml0Wq8h/KjEiSVILECt4Ash0BM9x50QibqCkIN6YchA\nP7ZBPf+rtpqN4pAsynOo1qqggxoBm+NppLZPCOcxH0K8c5POwd1fU2Ob0EDNqIEB\nY5/bEpRS2+eqxVcFOYRhdlYAMtPikYAHFW2eD0HTAoGBAMnSOaGFH1FYKBZpGUpL\n7MbiUTrYqXpg32NQZWDglCBGYNoabjP95wsWZa7RqYIdJd5JbowduI3YqqyDZp9n\nVXqbCmrvvpOxCtypx8e0gk5rn4ZdX5e8t5Sw4ByOCj9QKQcGBCTDHGnR9a/DU7T5\nVWG7iMsQLHP+1AMqnMvz/sHy\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@avalanche-p2p.iam.gserviceaccount.com",
  "client_id": "109577701312365258023",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40avalanche-p2p.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

export default db;
