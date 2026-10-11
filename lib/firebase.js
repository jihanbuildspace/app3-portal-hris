import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Konfigurasi dibaca dari .env.local atau nilai bawaan proyek bootcamp
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBtK_2VtiVFOAAMSnED5totF3EXDJRlrqE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bootcamp-aca14.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bootcamp-aca14",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bootcamp-aca14.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "311050540600",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:311050540600:web:8b7c1987b4cc97d04bb8cd",
};

// Pakai app yang sudah ada supaya tidak dobel saat halaman dimuat ulang
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
