/** Progres belajar (PRD P0-05, US-01, US-02): "3 dari 6 modul selesai" dan modul lanjutan. */
import type { Modul } from '../tipe';

export interface ProgresBelajar {
  jumlahSelesai: number;
  jumlahTotal: number;
  /** Persen bulat 0–100. */
  persen: number;
  /** Modul belum selesai pertama menurut urutan; null bila semua selesai. */
  modulLanjutan: Modul | null;
  semuaSelesai: boolean;
}

export function ringkasProgres(modul: Modul[], selesaiIds: Iterable<string>): ProgresBelajar {
  const selesai = new Set(selesaiIds);
  const urut = [...modul].sort((a, b) => a.urutan - b.urutan);
  const jumlahSelesai = urut.filter((m) => selesai.has(m.id)).length;
  const jumlahTotal = urut.length;
  return {
    jumlahSelesai,
    jumlahTotal,
    persen: jumlahTotal === 0 ? 0 : Math.round((jumlahSelesai / jumlahTotal) * 100),
    modulLanjutan: urut.find((m) => !selesai.has(m.id)) ?? null,
    semuaSelesai: jumlahTotal > 0 && jumlahSelesai === jumlahTotal,
  };
}

/**
 * Modul tahap yang sedang berjalan (P0-06, D-43): modul terakhir yang hari mulainya sudah tiba,
 * dihitung dari hari ke-n siklus. Belum tanam (null) atau sebelum tahap pertama → modul pertama.
 */
export function modulTahapBerjalan<T extends { urutan: number; hstMulai: number }>(
  modul: T[],
  hariKe: number | null,
): T | null {
  const urut = [...modul].sort((a, b) => a.urutan - b.urutan);
  if (hariKe === null) return urut[0] ?? null;
  return urut.filter((m) => m.hstMulai <= hariKe).pop() ?? urut[0] ?? null;
}

/** Sisa menit tonton, dibulatkan ke atas; null bila belum mulai atau durasi tidak diketahui. */
export function sisaMenit(posisiDetik: number, durasiDetik: number): number | null {
  if (!(durasiDetik > 0) || !Number.isFinite(durasiDetik) || !(posisiDetik > 0)) return null;
  return Math.max(1, Math.ceil(Math.max(0, durasiDetik - posisiDetik) / 60));
}

export type KeadaanModul = 'selesai' | 'sedang' | 'offline' | 'belum';

/** Keadaan baris modul di daftar (papan 08, 09): selesai > sedang ditonton > tersimpan > belum. */
export function keadaanModul(m: {
  selesai: boolean;
  posisiDetik: number;
  tersimpan: boolean;
}): KeadaanModul {
  if (m.selesai) return 'selesai';
  if (m.posisiDetik > 0) return 'sedang';
  if (m.tersimpan) return 'offline';
  return 'belum';
}
