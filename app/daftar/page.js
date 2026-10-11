"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { usePengguna } from "@/lib/pengguna";
import KerangkaPublik from "@/components/KerangkaPublik";

function FormDaftar() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [galat, setGalat] = useState({});
  const [pesan, setPesan] = useState("");
  const [memproses, setMemproses] = useState(false);

  const router = useRouter();
  const { pengguna, memuat } = usePengguna();

  useEffect(() => {
    if (!memuat && pengguna) {
      if (pengguna.role === "hrd") {
        router.replace("/admin");
      } else {
        router.replace("/beranda");
      }
    }
  }, [pengguna, memuat, router]);

  async function kirim(e) {
    e.preventDefault();
    const g = {};
    if (!nama.trim()) g.nama = "Nama wajib diisi.";
    if (!email.trim()) g.email = "Email wajib diisi.";
    if (kataSandi.length < 6) g.kataSandi = "Kata sandi minimal 6 karakter.";
    setGalat(g);
    if (Object.keys(g).length > 0) return;

    setMemproses(true);
    setPesan("");

    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), kataSandi);
      const user = res.user;

      await updateProfile(user, { displayName: nama.trim() });

      // Akun baru otomatis berperan karyawan, kecuali wulan@sedap.id (sesuai Slide 37 & 57)
      const isHrd = email.trim().toLowerCase() === "wulan@sedap.id";
      const peranAwal = isHrd ? "hrd" : "karyawan";

      try {
        await setDoc(doc(db, "users", user.uid), {
          nama: nama.trim(),
          email: email.trim(),
          role: peranAwal,
        });
      } catch (errDb) {
        console.warn("Firestore simpan profil:", errDb);
      }

      if (peranAwal === "hrd") {
        router.push("/admin");
      } else {
        router.push("/beranda");
      }
    } catch (err) {
      console.warn("Firebase Auth sign-up:", err.code || err.message);

      // Fallback lokal jika Firebase Auth belum diaktifkan
      const isHrd = email.trim().toLowerCase() === "wulan@sedap.id";
      const peranAwal = isHrd ? "hrd" : "karyawan";
      const userBaru = {
        uid: isHrd ? "wulan" : "user-" + Date.now(),
        nama: nama.trim(),
        email: email.trim(),
        role: peranAwal,
      };
      localStorage.setItem("hris_pengguna", JSON.stringify(userBaru));

      if (peranAwal === "hrd") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/beranda";
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

      try {
        await setDoc(doc(db, "users", user.uid), {
          nama: user.displayName || nama.trim() || user.email.split("@")[0],
          email: user.email,
          role: "karyawan",
        }, { merge: true });
      } catch (errDb) {
        console.warn("Firestore sync Google:", errDb);
      }

      router.push("/beranda");
    } catch (err) {
      console.warn("Google signup error:", err);
      const userBaru = {
        uid: "user-google",
        nama: nama.trim() || "Karyawan Baru",
        email: email.trim() || "karyawan@sedap.id",
        role: "karyawan",
      };
      localStorage.setItem("hris_pengguna", JSON.stringify(userBaru));
      window.location.href = "/beranda";
    } finally {
      setMemproses(false);
    }
  }

  return (
    <KerangkaPublik judul="Daftar">
      <form onSubmit={kirim} noValidate className="space-y-4">
        <div>
          <label htmlFor="nama" className="label">
            Nama
          </label>
          <input
            id="nama"
            autoComplete="name"
            placeholder="Nama lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="isian"
          />
          {galat.nama && <p className="galat">{galat.nama}</p>}
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@sedap.id"
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
            autoComplete="new-password"
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
          {memproses ? "Mendaftarkan..." : "Daftar"}
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

      <p className="mt-6 text-center text-sm font-medium text-redup">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-semibold text-sedap hover:underline">
          Masuk
        </Link>
      </p>
    </KerangkaPublik>
  );
}

export default function HalamanDaftar() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-redup">Memuat...</div>}>
      <FormDaftar />
    </Suspense>
  );
}
