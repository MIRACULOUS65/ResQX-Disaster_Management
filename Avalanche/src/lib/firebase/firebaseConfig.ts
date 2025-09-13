// Firebase configuration file
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Service account credentials for avalanche-p2p project (P2P Connection)
const serviceAccount = {
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

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

// Get Firestore instance
export const db = getFirestore();