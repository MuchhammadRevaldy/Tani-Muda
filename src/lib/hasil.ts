/**
 * Hasil fungsi yang bisa gagal karena masukan pengguna. Fungsi di src/lib tidak melempar galat
 * untuk masukan yang salah; ia mengembalikan kode galat yang jelas, lalu teksnya diterjemahkan di
 * src/teks/galat.ts (aturan-proyek.md 3.8).
 */

/** Semua kode galat logika inti. Teks Bahasa Indonesianya ada di src/teks/galat.ts. */
export type KodeGalat =
  // ukuran dan satuan
  | 'UKURAN_KOSONG'
  | 'UKURAN_NEGATIF'
  | 'SATUAN_TIDAK_DIKENAL'
  | 'SATUAN_TIDAK_COCOK'
  | 'LUAS_KOSONG'
  | 'LUBANG_KOSONG'
  | 'POLYBAG_KOSONG'
  | 'VOLUME_KOSONG'
  // dosis, kemasan, harga
  | 'DOSIS_NEGATIF'
  | 'KEMASAN_TIDAK_VALID'
  | 'ISI_KEMASAN_KOSONG'
  | 'HARGA_NEGATIF'
  | 'JUMLAH_NEGATIF'
  | 'HARGA_JUAL_KOSONG'
  | 'PANEN_NEGATIF'
  | 'HASIL_KOSONG'
  | 'NAMA_KOSONG'
  | 'PEMBAGIAN_TIDAK_VALID'
  // jadwal
  | 'HST_TIDAK_VALID'
  | 'INTERVAL_TIDAK_VALID'
  | 'TUGAS_TIDAK_ADA'
  | 'TUGAS_SUDAH_SELESAI'
  | 'TIDAK_BOLEH_DIGESER'
  | 'TUNDA_DI_LUAR_BATAS'
  | 'TIDAK_ADA_TIPE'
  // pesanan, kiriman, lahan
  | 'JUMLAH_KOSONG'
  | 'HARGA_KOSONG'
  | 'MELEBIHI_PESANAN'
  | 'MELEBIHI_KIRIMAN'
  | 'TOLAK_KOSONG'
  | 'ALASAN_TIDAK_DIKENAL'
  | 'KETERANGAN_WAJIB'
  | 'FREKUENSI_TIDAK_VALID'
  | 'LAHAN_TIDAK_CUKUP';

export type Hasil<T> = { ok: true; nilai: T } | { ok: false; galat: KodeGalat };

export const berhasil = <T>(nilai: T): Hasil<T> => ({ ok: true, nilai });
export const gagal = <T = never>(galat: KodeGalat): Hasil<T> => ({ ok: false, galat });

/** Ambil nilai dari hasil yang pasti berhasil (untuk tes dan data contoh); melempar bila gagal. */
export function pastikan<T>(hasil: Hasil<T>): T {
  if (!hasil.ok) throw new Error('Hasil gagal: ' + hasil.galat);
  return hasil.nilai;
}
