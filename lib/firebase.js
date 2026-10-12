import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Konfigurasi dibaca dari .env.local atau konfigurasi Firebase app3-portal-hris
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBXkejYzb-QW7r5Wj_b7yHAorJl5D4HlXc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "app3-portal-hris.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "app3-portal-hris",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "app3-portal-hris.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "790195541956",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:790195541956:web:afe705521de82e7d57b691",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-TH604JS2L2",
};

// Pakai app yang sudah ada supaya tidak dobel saat halaman dimuat ulang
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
