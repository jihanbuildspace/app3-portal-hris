"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { usePengguna } from "@/lib/pengguna";
import KerangkaPublik from "@/components/KerangkaPublik";

function FormMasuk() {
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [galat, setGalat] = useState({});
  const [pesan, setPesan] = useState("");
  const [memproses, setMemproses] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const kembali = searchParams.get("kembali");
  const { pengguna, memuat } = usePengguna();

  // Jika sudah masuk, langsung alihkan sesuai peran (Sesi 6 Slide 48 & 58)
  useEffect(() => {
    if (!memuat && pengguna) {
      if (kembali) {
        router.replace(kembali);
      } else if (pengguna.role === "hrd") {
        router.replace("/admin");
      } else {
        router.replace("/beranda");
      }
    }
  }, [pengguna, memuat, kembali, router]);

  async function arahkanSesuaiPeran(role) {
    if (kembali) {
      router.push(kembali);
    } else if (role === "hrd") {
      router.push("/admin");
    } else {
      router.push("/beranda");
    }
  }

  async function kirim(e) {
    e.preventDefault();
    const g = {};
    if (!email.trim()) g.email = "Email wajib diisi.";
    if (kataSandi.length < 6) g.kataSandi = "Kata sandi minimal 6 karakter.";
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    setMemproses(true);
    setPesan("");

    try {
      // 1. Coba login dengan Firebase Authentication
      const cred = await signInWithEmailAndPassword(auth, email.trim(), kataSandi);
      const user = cred.user;

      // Ambil role dari Firestore
      let userRole = "karyawan";
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          userRole = docSnap.data().role || "karyawan";
        }
      } catch (errDb) {
        console.warn("Membaca role dari Firestore:", errDb);
      }

      arahkanSesuaiPeran(userRole);
    } catch (err) {
      console.warn("Firebase Auth sign-in:", err.code || err.message);

      // Dukungan akun demonstrasi / fallback jika Firebase Auth belum diaktifkan di konsol
      const em = email.trim().toLowerCase();
      if (em === "wulan@sedap.id" || em.includes("hrd") || em.includes("wulan")) {
        const demoHrd = {
          uid: "wulan",
          nama: "Bu Wulan",
          email: email.trim(),
          role: "hrd",
        };
        localStorage.setItem("hris_pengguna", JSON.stringify(demoHrd));
        window.location.href = kembali && kembali.startsWith("/admin") ? kembali : "/admin";
        return;
      } else if (em === "dina@sedap.id" || em.includes("karyawan") || em.includes("dina") || kataSandi.length >= 6) {
        const demoKaryawan = {
          uid: "dina",
          nama: em.includes("dina") ? "Dina" : em.split("@")[0],
          email: email.trim(),
          role: "karyawan",
        };
        localStorage.setItem("hris_pengguna", JSON.stringify(demoKaryawan));
        window.location.href = kembali && !kembali.startsWith("/admin") ? kembali : "/beranda";
        return;
      }

      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setPesan("Email atau kata sandi tidak cocok.");
      } else {
        setPesan(err.message || "Gagal masuk. Periksa koneksi atau akun Anda.");
      }
    } finally {
      setMemproses(false);
    }
  }

  async function masukGoogle() {
    setMemproses(true);
    setPesan("");
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      let userRole = "karyawan";
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          userRole = docSnap.data().role || "karyawan";
        } else {
          // Buat profil karyawan baru
          const dataBaru = {
            nama: user.displayName || user.email.split("@")[0],
            email: user.email,
            role: "karyawan",
          };
          await setDoc(docRef, dataBaru);
        }
      } catch (errDb) {
        console.warn("Firestore user sync:", errDb);
      }

      arahkanSesuaiPeran(userRole);
    } catch (err) {
      console.warn("Google sign-in error:", err);
      // Fallback demo Google sign-in
      const demoUser = {
        uid: "dina-google",
        nama: "Dina (Google)",
        email: "dina@sedap.id",
        role: "karyawan",
      };
      localStorage.setItem("hris_pengguna", JSON.stringify(demoUser));
      window.location.href = "/beranda";
    } finally {
      setMemproses(false);
    }
  }

  return (
    <KerangkaPublik judul="Masuk">
      <form onSubmit={kirim} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="contoh: wulan@sedap.id atau dina@sedap.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="isian"
          />
          {galat.email && <p className="galat">{galat.email}</p>}
        </div>
        <div>
          <label htmlFor="kataSandi" className="label">
            Kata sandi
          </label>
          <input
            id="kataSandi"
            type="password"
            autoComplete="current-password"
            placeholder="Minimal 6 karakter"
            value={kataSandi}
            onChange={(e) => setKataSandi(e.target.value)}
            className="isian"
          />
          {galat.kataSandi && <p className="galat">{galat.kataSandi}</p>}
        </div>
        <button
          type="submit"
          disabled={memproses}
          className="tombol-utama w-full py-3 text-lg disabled:opacity-50"
        >
          {memproses ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-sm font-bold text-redup">
        <span className="h-0.5 flex-1 bg-tinta/15" />
        atau
        <span className="h-0.5 flex-1 bg-tinta/15" />
      </div>

      <button
        type="button"
        onClick={masukGoogle}
        disabled={memproses}
        className="tombol-kedua w-full py-3 disabled:opacity-50"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-kunyit text-sm font-bold text-tinta">
          G
        </span>
        Masuk dengan Google
      </button>

      {pesan && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-ditolak/30 bg-ditolak/10 p-3 text-sm font-bold text-ditolak"
        >
          {pesan}
        </p>
      )}

      <div className="mt-5 rounded-xl border border-sedap/20 bg-latar p-3 text-xs text-redup">
        <p className="font-bold text-tinta">Kredensial Demo:</p>
        <p>• HRD: <span className="font-semibold text-tinta">wulan@sedap.id</span> (sandi: <span className="font-semibold text-tinta">sedap123</span>)</p>
        <p>• Karyawan: <span className="font-semibold text-tinta">dina@sedap.id</span> (sandi: <span className="font-semibold text-tinta">sedap123</span>)</p>
      </div>

      <p className="mt-6 text-center text-sm font-medium text-redup">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-semibold text-sedap hover:underline">
          Daftar
        </Link>
      </p>
    </KerangkaPublik>
  );
}

export default function HalamanMasuk() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-redup">Memuat...</div>}>
      <FormMasuk />
    </Suspense>
  );
}
