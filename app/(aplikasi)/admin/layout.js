import { Suspense } from "react";
import PenjagaAdmin from "@/components/PenjagaAdmin";
import Memuat from "@/components/Memuat";

export const instant = false;

/**
 * Layout Server Component untuk rute /admin.
 * Menggunakan export const instant = false untuk memberitahu Turbopack/Next.js
 * bahwa segmen ini memiliki penjagaan rute dinamis (route guard).
 */
export default function LayoutAdmin({ children }) {
  return (
    <Suspense fallback={<Memuat />}>
      <PenjagaAdmin>{children}</PenjagaAdmin>
    </Suspense>
  );
}
