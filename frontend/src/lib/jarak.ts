/**
 * Jarak dan urutan pesanan (PRD P0-20, D-06). Jarak dihitung dengan rumus Haversine dari titik
 * tengah desa (tabel wilayah), bukan dari titik lahan. Rumus yang sama dipakai backend (SQL dan
 * PHP) dan dibuktikan lewat kasus uji bersama.
 */
import type { Titik } from '../tipe';
import { formatDesimal, titikRibuan } from './format';

/** Jari-jari bumi rata-rata (km), konstanta rumus Haversine. */
export const JARI_JARI_BUMI_KM = 6371;

const rad = (derajat: number) => (derajat * Math.PI) / 180;

/** Titik tengah wilayah, atau null bila desa belum punya titik (di luar pilot, D-56). */
export function titikWilayah(w: {
  lintang: number | null;
  bujur: number | null;
}): Titik | null {
  return w.lintang !== null && w.bujur !== null ? { lintang: w.lintang, bujur: w.bujur } : null;
}

/** Jarak lingkaran besar antara dua titik (km). */
export function jarakKm(a: Titik, b: Titik): number {
  const dLintang = rad(b.lintang - a.lintang);
  const dBujur = rad(b.bujur - a.bujur);
  const h =
    Math.sin(dLintang / 2) ** 2 +
    Math.cos(rad(a.lintang)) * Math.cos(rad(b.lintang)) * Math.sin(dBujur / 2) ** 2;
  return 2 * JARI_JARI_BUMI_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Benar bila titik berada di dalam radius (tepat di tepi termasuk). */
export function dalamRadius(titik: Titik, pusat: Titik, radiusKm: number): boolean {
  return jarakKm(titik, pusat) <= radiusKm + 1e-9;
}

/**
 * Urutkan dari yang terdekat. Urutan stabil: jarak sama mengikuti urutan asal. Mengembalikan salinan
 * berisi jarak dalam km.
 */
export function urutkanTerdekat<T>(
  daftar: T[],
  pusat: Titik,
  ambilTitik: (x: T) => Titik,
): { item: T; jarakKm: number }[] {
  return daftar
    .map((item, i) => ({ item, jarakKm: jarakKm(ambilTitik(item), pusat), i }))
    .sort((a, b) => a.jarakKm - b.jarakKm || a.i - b.i)
    .map(({ item, jarakKm: j }) => ({ item, jarakKm: j }));
}

/** Angka jarak untuk tampilan: di bawah 10 km satu desimal ("9,5"), selebihnya bulat ("12"). */
export function angkaJarak(km: number): string {
  return km < 10 ? formatDesimal(km, 1) : titikRibuan(Math.round(km));
}
