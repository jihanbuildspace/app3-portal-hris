"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePengguna } from "@/lib/pengguna";
import Memuat from "./Memuat";

/**
 * Route guard untuk halaman aplikasi (PRD 6.2 & Sesi 6 Slide 49, 50, 59).
 * Pengguna yang belum masuk diarahkan ke /masuk?kembali=<alamat asal>.
 * Dibungkus Suspense karena membaca usePathname().
 */
function PenjagaRuteDalam({ children }) {
  const { pengguna, memuat } = usePengguna();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!memuat && !pengguna) {
      const kembaliParam = pathname ? `?kembali=${encodeURIComponent(pathname)}` : "";
      router.replace(`/masuk${kembaliParam}`);
    }
  }, [pengguna, memuat, pathname, router]);

  if (memuat || !pengguna) {
    return <Memuat />;
  }

  return children;
}

export default function PelindungRute({ children }) {
  return (
    <Suspense fallback={<Memuat />}>
      <PenjagaRuteDalam>{children}</PenjagaRuteDalam>
    </Suspense>
  );
}
