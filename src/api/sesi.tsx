/**
 * Sesi pengguna (T4.01). Sesi dibaca dari `klien.akun.ambil()` (GET /akun) lewat TanStack Query,
 * sehingga sama untuk klien tiruan dan klien HTTP (cookie Sanctum, D-21).
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import type { TanggalISO } from '../lib/format';
import { tanggalLokal, ZONA_BAWAAN } from '../lib/zona-waktu';
import { useAkun, useKeluar } from './kueri';
import type { Akun, Peran } from './tipe';

export type StatusSesi = 'memuat' | 'galat' | 'tamu' | 'masuk';

export function useSesi(): {
  status: StatusSesi;
  akun: Akun | null;
  muatUlang: () => void;
} {
  const q = useAkun();
  const status: StatusSesi = q.isPending
    ? 'memuat'
    : q.isError
      ? 'galat'
      : q.data
        ? 'masuk'
        : 'tamu';
  return { status, akun: q.data ?? null, muatUlang: () => void q.refetch() };
}

/** Halaman awal tiap peran. Pengguna tanpa peran diarahkan melengkapi akun. */
export function berandaPeran(peran: Peran | null): string {
  switch (peran) {
    case 'petani':
      return '/beranda';
    case 'pembeli':
      return '/pembeli';
    case 'mentor':
      return '/mentor';
    case 'admin':
      return '/admin';
    default:
      return '/pilih-peran';
  }
}

/** Tanggal hari ini menurut zona waktu pengguna (D-31); diperbarui tiap menit (lewat tengah malam). */
export function useHariIni(): TanggalISO {
  const { akun } = useSesi();
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setSekarang(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return tanggalLokal(sekarang, akun?.pengguna.zona_waktu ?? ZONA_BAWAAN);
}

/**
 * Setelah masuk, keluar, atau berganti akun demo: semua data di cache milik pengguna sebelumnya
 * dibuang, lalu kueri yang sedang tampil dimuat ulang. Data pengguna lain tidak pernah terlihat.
 */
export function useGantiPengguna(): () => Promise<void> {
  const qc = useQueryClient();
  return useCallback(() => qc.resetQueries(), [qc]);
}

export function useKeluarSesi(): { keluar: () => Promise<void>; sedang: boolean } {
  const m = useKeluar();
  const ganti = useGantiPengguna();
  return {
    keluar: async () => {
      await m.mutateAsync();
      await ganti();
    },
    sedang: m.isPending,
  };
}
