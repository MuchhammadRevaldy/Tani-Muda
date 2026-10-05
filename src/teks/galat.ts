/**
 * Teks untuk kode galat logika inti (src/lib/hasil.ts). Kalimat pendek yang menyebut apa yang harus
 * dilakukan (D-09). Tipe Record memastikan setiap kode punya teks.
 */
import type { KodeGalat } from '../lib/hasil';

export const teksGalat: Record<KodeGalat, string> = {
  UKURAN_KOSONG: 'Isi ukurannya dulu',
  UKURAN_NEGATIF: 'Ukuran tidak boleh kurang dari nol',
  SATUAN_TIDAK_DIKENAL: 'Satuan ini belum dikenal di wilayahmu. Pakai m² atau hektare',
  SATUAN_TIDAK_COCOK: 'Satuan dosis dan satuan beli tidak cocok',
  LUAS_KOSONG: 'Isi luas lahan dulu',
  LUBANG_KOSONG: 'Isi jumlah lubang tanam dulu',
  POLYBAG_KOSONG: 'Isi jumlah polybag dulu',
  VOLUME_KOSONG: 'Isi volume tandon dulu',
  DOSIS_NEGATIF: 'Dosis tidak boleh kurang dari nol',
  KEMASAN_TIDAK_VALID: 'Ukuran kemasan harus lebih dari nol',
  ISI_KEMASAN_KOSONG: 'Isi kemasan harus lebih dari nol',
  HARGA_NEGATIF: 'Harga tidak boleh kurang dari nol',
  JUMLAH_NEGATIF: 'Jumlah tidak boleh kurang dari nol',
  HARGA_JUAL_KOSONG: 'Isi harga jual dulu',
  PANEN_NEGATIF: 'Perkiraan panen tidak boleh kurang dari nol',
  HASIL_KOSONG: 'Perkiraan hasil panen belum ada di resep',
  NAMA_KOSONG: 'Isi nama mereknya dulu',
  PEMBAGIAN_TIDAK_VALID: 'Jumlah siklus pembagian minimal 1',
  HST_TIDAK_VALID: 'Hari di resep tidak masuk akal',
  INTERVAL_TIDAK_VALID: 'Jarak hari tugas berulang minimal 1',
  TUGAS_TIDAK_ADA: 'Tugas ini tidak ditemukan',
  TUGAS_SUDAH_SELESAI: 'Tugas ini sudah selesai',
  TIDAK_BOLEH_DIGESER: 'Tugas ini tidak bisa ditunda',
  TUNDA_DI_LUAR_BATAS: 'Tugas bisa ditunda 1 sampai 3 hari',
  TIDAK_ADA_TIPE: 'Tidak ada tugas jenis ini di siklus ini',
  NILAI_DI_LUAR_SKALA: 'Angka ini di luar skala alat ukur. Periksa lagi',
  JUMLAH_KOSONG: 'Isi jumlahnya dulu',
  HARGA_KOSONG: 'Isi harga per kg dulu',
  MELEBIHI_PESANAN: 'Jumlah melebihi sisa pesanan',
  MELEBIHI_KIRIMAN: 'Jumlah yang ditolak melebihi jumlah kiriman',
  TOLAK_KOSONG: 'Isi berat yang ditolak dulu',
  ALASAN_TIDAK_DIKENAL: 'Pilih salah satu alasan',
  KETERANGAN_WAJIB: 'Tulis alasannya dulu',
  FREKUENSI_TIDAK_VALID: 'Jadwal kiriman belum benar',
  LAHAN_TIDAK_CUKUP: 'Lahanmu tidak cukup untuk jumlah ini',
  NOMOR_HP_TIDAK_VALID: 'Nomor HP belum benar. Contoh: 0812 3456 7890',
};
