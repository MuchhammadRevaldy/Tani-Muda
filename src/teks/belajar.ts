/** Teks pilar Belajar: daftar modul (papan 08, 09; T4.30) dan pemutar modul (turunan 42; T4.31). */
import { formatDesimal } from '../lib/format';

/** Detik → "1:05". */
export function waktuVideo(detik: number): string {
  if (!Number.isFinite(detik) || detik < 0) return '0:00';
  const d = Math.floor(detik);
  return `${Math.floor(d / 60)}:${String(d % 60).padStart(2, '0')}`;
}

export const teksBelajar = {
  // ---- daftar modul
  judul: 'Belajar',
  sub: 'Modul video sekitar 3 menit untuk tiap tahap. Unduh sekali, tonton di lahan tanpa sinyal.',
  tanaman: 'Tanaman',
  caraTanam: 'Cara tanam',
  kemajuan: 'Kemajuanmu',
  nDariM: (n: number, m: number) => `${n} dari ${m} modul selesai`,
  lanjutkan: (judul: string) => `Lanjutkan: ${judul}`,
  ulangiDariAwal: 'Semua modul selesai. Tonton lagi dari awal',
  judulDaftar: (metode: string, komoditas: string) =>
    `Modul ${metode.toLowerCase()} untuk ${komoditas.toLowerCase()}`,
  ketDaftar: 'Tonton berurutan. Setiap modul sekitar 3 menit.',
  modulKe: (n: number) => `Modul ${n}`,
  menit: (n: number) => `${n} menit`,
  selesai: 'selesai',
  sisaMenit: (n: number) => `sisa ${n} menit`,
  tersimpanOffline: 'tersimpan offline',
  videoMenyusul: 'video menyusul',
  putarModul: (judul: string) => `Putar modul ${judul}`,
  unduh: (judul: string) => `Unduh modul ${judul}`,
  mengunduh: (judul: string) => `Sedang mengunduh ${judul}`,
  hapusUnduhan: (judul: string) => `Hapus unduhan ${judul}`,
  sedangDipelajari: 'Sedang dipelajari',
  sedangKet: (judul: string, sisa: number | null) =>
    sisa ? `${judul} · sisa ${sisa} menit` : judul,
  unduhan: 'Unduhan',
  unduhanKet: 'Modul yang sudah diunduh bisa ditonton tanpa sinyal di HP-mu.',
  pemakaian: (mb: number, batas: number) => `Terpakai ${formatDesimal(mb, 1)} MB dari ${batas} MB`,
  penuh: (batas: number) =>
    `Unduhan sudah hampir ${batas} MB. Hapus modul yang sudah selesai dulu.`,
  gagalUnduh: 'Video belum bisa diunduh. Coba lagi saat sinyal bagus.',
  tidakAdaModul: 'Belum ada modul untuk pilihan ini.',
  labelContoh: 'Ringkasan dan video masih contoh',

  // ---- pemutar modul
  kembali: 'Belajar',
  meta: (ke: number, n: number, menit: number) => `Modul ${ke} dari ${n} · ${menit} menit`,
  putar: 'Putar',
  jeda: 'Jeda',
  mundur: 'Mundur 10 detik',
  maju: 'Maju 10 detik',
  layarPenuh: 'Layar penuh',
  posisi: 'Posisi video',
  waktu: (sekarang: string, total: string) => `${sekarang} dari ${total}`,
  kualitas: 'Kualitas rendah (360p), hemat kuota',
  videoBelumAda: 'Video modul ini sedang disiapkan bersama penyuluh.',
  videoGagal: 'Video belum bisa diputar. Periksa sinyal lalu coba lagi.',
  videoJudul: (judul: string) => `Video ${judul}`,
  ringkasan: 'Ringkasan',
  tandaiSelesai: 'Tandai selesai',
  menyimpan: 'Menyimpan…',
  sudahSelesai: 'Modul ini sudah selesai',
  modulBerikutnya: (judul: string) => `Modul berikutnya: ${judul}`,
  kembaliKeDaftar: 'Kembali ke daftar modul',
  tahapSekarang: 'Tahap sekarang',
  tontonModul: (judul: string, menit: number) => `${judul} · tonton ${menit} menit`,
} as const;
