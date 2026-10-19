import data from '../data/dokumentasi.json';

/**
 * Data asli proyek untuk video dokumentasi [AG-52], ditulis scripts/siapkan-dokumentasi.mjs
 * dari git log, docs/*.md, dan tangkapan layar. Tidak ada angka yang diketik tangan.
 */
export const DATA = data;
export type KunciDokumen = keyof typeof data.dokumen;

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** '2026-10-05' → '5 Okt 2026' (tanpa tahun bila `pendek`). */
export function tgl(iso: string | null | undefined, pendek = false): string {
  if (!iso) return '?';
  const [y, m, d] = iso.split('-').map(Number);
  return pendek ? `${d} ${BULAN[m - 1]}` : `${d} ${BULAN[m - 1]} ${y}`;
}

/** Rentang tanggal bahan: '5–18 Okt 2026' atau '14 Okt 2026'. */
export function rentangBahan(k: keyof typeof data.tanggalBahan): string {
  const b = data.tanggalBahan[k];
  if (!b.awal || b.awal === b.akhir || !b.akhir) return tgl(b.awal ?? b.akhir);
  const [, , d1] = b.awal.split('-').map(Number);
  return `${d1}–${tgl(b.akhir)}`;
}

/** Posisi judul di gambar dokumen (px gambar). */
export function judulDokumen(dok: KunciDokumen, awalan: string) {
  const j = data.dokumen[dok].judul.find((x) => x.teks.startsWith(awalan));
  if (!j) throw new Error(`Judul "${awalan}" tidak ada di ${dok}`);
  return j;
}

/** Hari ke-n (0 = 5 Okt) dari tanggal ISO. */
export function hariKe(iso: string) {
  return Number(iso.slice(8, 10)) - 5;
}
