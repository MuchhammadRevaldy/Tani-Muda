/**
 * Penjaga rute berdasarkan sesi dan peran (T4.01). Hak akses sebenarnya dijaga server (D-22);
 * penjaga ini hanya mengarahkan pengguna ke halaman yang sesuai.
 */
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { berandaPeran, useSesi } from '../api/sesi';
import type { Peran } from '../api/tipe';
import { teksSesi } from '../teks/sesi';
import { teksUmum } from '../teks/umum';
import { Tombol } from './tombol';

export interface StateMasuk {
  /** Halaman yang ingin dibuka sebelum diarahkan ke /masuk. */
  dari?: string;
}

function Memuat() {
  return (
    <p role="status" className="m-0 p-4 text-teks-pendukung">
      {teksUmum.memuat}
    </p>
  );
}

function GagalSesi({ onUlang }: { onUlang: () => void }) {
  return (
    <main className="mx-auto flex max-w-dialog flex-col gap-4 p-4">
      <h1 className="m-0 text-judul-halaman font-semibold">{teksSesi.galatJudul}</h1>
      <p className="m-0 text-teks-pendukung">{teksSesi.galatIsi}</p>
      <Tombol onClick={onUlang}>{teksSesi.cobaLagi}</Tombol>
    </main>
  );
}

/**
 * - belum masuk → /masuk (halaman asal diingat);
 * - belum memilih peran → /pilih-peran;
 * - peran tidak termasuk `peran` → halaman awal peran itu (petani tidak bisa membuka halaman
 *   pembeli dan sebaliknya).
 */
export function PenjagaRute({ peran, children }: { peran: Peran[]; children: ReactNode }) {
  const { status, akun, muatUlang } = useSesi();
  const lokasi = useLocation();
  if (status === 'memuat') return <Memuat />;
  if (status === 'galat') return <GagalSesi onUlang={muatUlang} />;
  if (!akun) {
    const state: StateMasuk = { dari: lokasi.pathname + lokasi.search };
    return <Navigate to="/masuk" replace state={state} />;
  }
  const p = akun.pengguna.peran;
  if (!p || !peran.includes(p)) return <Navigate to={berandaPeran(p)} replace />;
  return <>{children}</>;
}

/**
 * Halaman Masuk dan pemilih akun demo: pengguna yang sudah masuk diarahkan ke halaman asal (bila ada)
 * atau halaman awal perannya; pengguna baru ke pilih peran.
 */
export function PenjagaTamu({ children }: { children: ReactNode }) {
  const { status, akun, muatUlang } = useSesi();
  const lokasi = useLocation();
  if (status === 'memuat') return <Memuat />;
  if (status === 'galat') return <GagalSesi onUlang={muatUlang} />;
  if (akun) {
    const peran = akun.pengguna.peran;
    const dari = (lokasi.state as StateMasuk | null)?.dari;
    return <Navigate to={peran && dari ? dari : berandaPeran(peran)} replace />;
  }
  return <>{children}</>;
}

/** Halaman pilih peran: hanya untuk pengguna yang sudah masuk tetapi belum berperan. */
export function PenjagaTanpaPeran({ children }: { children: ReactNode }) {
  const { status, akun, muatUlang } = useSesi();
  if (status === 'memuat') return <Memuat />;
  if (status === 'galat') return <GagalSesi onUlang={muatUlang} />;
  if (!akun) return <Navigate to="/masuk" replace />;
  if (akun.pengguna.peran) return <Navigate to={berandaPeran(akun.pengguna.peran)} replace />;
  return <>{children}</>;
}
