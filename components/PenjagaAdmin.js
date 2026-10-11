"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePengguna } from "@/lib/pengguna";
import Memuat from "@/components/Memuat";
import AksesDitolak from "@/components/AksesDitolak";

/**
 * Komponen Client untuk proteksi rute khusus HRD.
 * Menampilkan AksesDitolak bila bukan HRD.
 */
export default function PenjagaAdmin({ children }) {
  const { pengguna, memuat } = usePengguna();
  const router = useRouter();

  useEffect(() => {
    if (!memuat && !pengguna) {
      router.replace("/masuk?kembali=/admin");
    }
  }, [pengguna, memuat, router]);

  if (memuat || !pengguna) {
    return <Memuat />;
  }

  if (pengguna.role !== "hrd") {
    return <AksesDitolak />;
  }

  return children;
}
