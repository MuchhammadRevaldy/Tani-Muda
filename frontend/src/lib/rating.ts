/**
 * Rating dua arah (PRD P0-28, T4.26): nilai 1–5, rata-rata satu desimal, dan kalimat ringkas
 * "4,8 dari 9 ulasan pembeli". Server menghitung dengan rumus yang sama.
 */
import { formatDesimal } from './format';
import { berhasil, gagal, type Hasil } from './hasil';

export const NILAI_RATING = [1, 2, 3, 4, 5] as const;

/** Nilai sah: bilangan bulat 1 sampai 5. */
export function validasiRating(nilai: number): Hasil<number> {
  return Number.isInteger(nilai) && nilai >= 1 && nilai <= 5
    ? berhasil(nilai)
    : gagal('RATING_TIDAK_VALID');
}

/** Rata-rata satu desimal (dibulatkan setengah ke atas); null bila belum ada ulasan. */
export function rataRataRating(nilai: number[]): number | null {
  if (!nilai.length) return null;
  return Math.round((nilai.reduce((a, b) => a + b, 0) / nilai.length) * 10) / 10;
}

/** "4,8" untuk tampilan (selalu satu desimal). */
export const angkaRating = (n: number) => formatDesimal(n, 1, true);
