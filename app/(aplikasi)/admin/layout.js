"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { usePengguna } from "@/lib/pengguna";
import Memuat from "@/components/Memuat";
import AksesDitolak from "@/components/AksesDitolak";

/**
 * Route guard untuk semua rute /admin (PRD 6.2 & Sesi 6 Slide 49, 50, 59 Prompt 10).
 * Hanya role "hrd" yang boleh membuka.
 * Selain HRD, tampilkan halaman Akses Ditolak.
 * Pengguna yang belum masuk diarahkan ke /masuk.
 * Selama role belum selesai dibaca, tampilkan layar Memuat...
 */
function PenjagaAdminDalam({ children }) {
  const { pengguna, memuat } = usePengguna();
  const router = useRouter();

  useEffect(() => {
    if (!memuat && !pengguna) {
      router.replace("/masuk?kembali=/admin");
    }
  }, [pengguna, memuat, router]);

  if (memuat) {
    return <Memuat />;
  }

  if (!pengguna) {
    return <Memuat />;
  }

  if (pengguna.role !== "hrd") {
    return <AksesDitolak />;
  }

  return children;
}

export default function LayoutAdmin({ children }) {
  return (
    <Suspense fallback={<Memuat />}>
      <PenjagaAdminDalam>{children}</PenjagaAdminDalam>
    </Suspense>
  );
}
