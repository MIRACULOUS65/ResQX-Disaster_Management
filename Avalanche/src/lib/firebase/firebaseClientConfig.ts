// Firebase client configuration file
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for client-side
const firebaseConfig = {
  apiKey: "AIzaSyDJjDeGmx_g5zXwT_bjJQoADK1GWu_UTVs",
  authDomain: "avalanche-336f1.firebaseapp.com",
  projectId: "avalanche-336f1",
  storageBucket: "avalanche-336f1.appspot.com",
  messagingSenderId: "114251441600988933293",
  appId: "1:114251441600988933293:web:a0b1c3a322b4c6d8f9446f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
export const db = getFirestore(app);