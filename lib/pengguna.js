"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Hook usePengguna() untuk membaca pengguna yang sedang masuk beserta perannya.
 * Mengembalikan { pengguna, memuat, keluar }.
 * Sesuai PRD 2.1, 4.1 & Sesi 6 Slide 33, 48, 57.
 */
export function usePengguna() {
  const [pengguna, setPengguna] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    // 1. Cek fallback demo login jika ada
    const fallbackUser = typeof window !== "undefined" ? localStorage.getItem("hris_pengguna") : null;
    if (fallbackUser) {
      try {
        setPengguna(JSON.parse(fallbackUser));
        setMemuat(false);
      } catch (e) {
        localStorage.removeItem("hris_pengguna");
      }
    }

    // 2. Langganan perubahan Firebase Authentication
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Jika tidak ada user Firebase dan tidak ada fallback
        if (!localStorage.getItem("hris_pengguna")) {
          setPengguna(null);
        }
        setMemuat(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const infoPengguna = {
            uid: user.uid,
            nama: data.nama || user.displayName || "Karyawan",
            email: data.email || user.email,
            role: data.role || "karyawan",
          };
          setPengguna(infoPengguna);
          localStorage.setItem("hris_pengguna", JSON.stringify(infoPengguna));
        } else {
          // Buat profil karyawan saat pertama kali masuk (PRD 4.1 & Sesi 6 Prompt 5)
          const namaAwal = user.displayName || user.email?.split("@")[0] || "Karyawan";
          const dataBaru = {
            nama: namaAwal,
            email: user.email,
            role: "karyawan",
          };
          await setDoc(docRef, dataBaru);
          const infoPengguna = { uid: user.uid, ...dataBaru };
          setPengguna(infoPengguna);
          localStorage.setItem("hris_pengguna", JSON.stringify(infoPengguna));
        }
      } catch (err) {
        console.error("Gagal membaca profil dari Firestore:", err);
        // Tetap set pengguna minimal dari Auth
        const infoPengguna = {
          uid: user.uid,
          nama: user.displayName || user.email?.split("@")[0] || "Pengguna",
          email: user.email,
          role: "karyawan",
        };
        setPengguna(infoPengguna);
      } finally {
        setMemuat(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function keluar() {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signOut:", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("hris_pengguna");
    }
    setPengguna(null);
  }

  return { pengguna, memuat, keluar };
}
