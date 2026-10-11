/**
 * Posisi tonton modul (papan 08, 09: "sisa 1 menit", D-43): disimpan di perangkat per pengguna,
 * supaya video bisa dilanjutkan dari posisi terakhir. Bukan data server; modul selesai tetap
 * dicatat lewat `progres_modul`. Bila penyimpanan tidak tersedia, posisi hanya bertahan di memori.
 */
import { useCallback, useSyncExternalStore } from 'react';
import { useSesi } from './sesi';

export interface PosisiTonton {
  detik: number;
  durasi: number;
}

type Peta = Record<string, PosisiTonton>;

const awalan = 'tani-muda:posisi-modul:';
const cadangan = new Map<string, string>();
const pendengar = new Set<() => void>();

function bacaMentah(penggunaId: string): string {
  try {
    return localStorage.getItem(awalan + penggunaId) ?? '{}';
  } catch {
    return cadangan.get(penggunaId) ?? '{}';
  }
}

function tulis(penggunaId: string, peta: Peta) {
  const isi = JSON.stringify(peta);
  cadangan.set(penggunaId, isi);
  try {
    localStorage.setItem(awalan + penggunaId, isi);
  } catch {
    // Penyimpanan diblokir: cadangan di memori sudah diisi.
  }
  pendengar.forEach((f) => f());
}

function langgan(f: () => void) {
  pendengar.add(f);
  return () => {
    pendengar.delete(f);
  };
}

function urai(mentah: string): Peta {
  try {
    const p = JSON.parse(mentah) as unknown;
    return p && typeof p === 'object' ? (p as Peta) : {};
  } catch {
    return {};
  }
}

export function usePosisiModul(): {
  posisi: (modulId: string) => PosisiTonton | null;
  simpan: (modulId: string, detik: number, durasi: number) => void;
  hapus: (modulId: string) => void;
} {
  const { akun } = useSesi();
  const id = akun?.pengguna.id ?? null;
  // String mentah sebagai snapshot supaya perbandingan useSyncExternalStore stabil.
  const mentah = useSyncExternalStore(langgan, () => (id ? bacaMentah(id) : '{}'));
  const peta = urai(mentah);
  const simpan = useCallback(
    (modulId: string, detik: number, durasi: number) => {
      if (!id) return;
      tulis(id, { ...urai(bacaMentah(id)), [modulId]: { detik, durasi } });
    },
    [id],
  );
  const hapus = useCallback(
    (modulId: string) => {
      if (!id) return;
      const baru = urai(bacaMentah(id));
      delete baru[modulId];
      tulis(id, baru);
    },
    [id],
  );
  return { posisi: (modulId) => peta[modulId] ?? null, simpan, hapus };
}
