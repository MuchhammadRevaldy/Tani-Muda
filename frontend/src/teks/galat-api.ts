/**
 * Teks untuk kode galat khusus API. Kode logika inti memakai src/teks/galat.ts. Klien tiruan dan
 * backend mengirim teks yang sama sebagai `pesan`.
 */
import { adalahGalatApi, type KodeGalatApi, type KodeGalatKhususApi } from '../api/galat';
import { teksGalat } from './galat';
import { teksUmum } from './umum';

export const teksGalatKhususApi: Record<KodeGalatKhususApi, string> = {
  VALIDASI: 'Ada isian yang belum benar',
  BELUM_MASUK: 'Masuk dulu dengan nomor HP',
  TIDAK_DIIZINKAN: 'Akunmu tidak bisa membuka bagian ini',
  TIDAK_DITEMUKAN: 'Data ini tidak ditemukan',
  BENTROK: 'Data ini sudah berubah. Muat ulang lalu coba lagi',
  SESI_KEDALUWARSA: 'Sesimu sudah berakhir. Muat ulang halaman lalu coba lagi',
  TERLALU_SERING: 'Terlalu sering. Tunggu sebentar lalu coba lagi',
  AKUN_NONAKTIF: 'Akunmu sedang dinonaktifkan sementara, jadi belum bisa mengambil pesanan baru',
  BELUM_TERVERIFIKASI: 'Usaha Anda belum terverifikasi, jadi belum bisa memasang pesanan',
  PERAN_BELUM_DIPILIH: 'Pilih peranmu dulu',
  WILAYAH_WAJIB: 'Isi desa lahanmu dulu',
  WILAYAH_BELUM_TERSEDIA: 'Desa ini belum tersedia di pilot Tani Muda. Pilih desa lain',
  PRIVASI_WAJIB: 'Centang persetujuan kebijakan privasi dulu',
  OTP_SALAH: 'Kode salah. Periksa SMS lalu coba lagi',
  OTP_KEDALUWARSA: 'Kode sudah kedaluwarsa. Minta kode baru',
  OTP_TERKUNCI: 'Terlalu banyak percobaan. Minta kode baru',
  NOMOR_SUDAH_DIPAKAI: 'Nomor ini sudah dipakai akun lain',
  NOMOR_SAMA: 'Ini nomormu sekarang. Isi nomor yang baru',
  FOTO_WAJIB: 'Ambil foto hasil panen dulu',
  STATUS_TIDAK_SESUAI: 'Langkah ini tidak bisa dilakukan sekarang',
  SUDAH_DINILAI: 'Kamu sudah memberi nilai untuk kiriman ini',
  MELEBIHI_SALDO: 'Nominal melebihi dana yang ditahan',
  PEMBAYARAN_GAGAL: 'Pembayaran belum berhasil. Uang Anda tidak terpotong; coba bayar lagi',
  SUMBER_BELUM_TERSEDIA: 'Sambungan ke server belum tersedia',
  BELUM_TERSEDIA: 'Fitur ini belum tersedia di versi demo',
  AI_TIDAK_TERSEDIA: 'Fitur pintar sedang tidak bisa dipakai. Coba lagi nanti',
  BATAS_AI_TERCAPAI: 'Batas pemakaian fitur pintar harianmu sudah tercapai. Coba lagi besok',
  PERSETUJUAN_AI_WAJIB: 'Centang persetujuan pemakaian fitur pintar dulu',
  CUACA_TIDAK_TERSEDIA: 'Data perkiraan cuaca belum bisa dimuat. Coba lagi nanti',
  STOK_TIDAK_CUKUP: 'Sisa stok tidak mencukupi',
  GALAT_SERVER: 'Ada yang tidak beres di server. Coba lagi sebentar lagi',
};

/** Teks untuk kode galat API apa pun. */
export function teksUntukGalat(kode: KodeGalatApi): string {
  return kode in teksGalatKhususApi
    ? teksGalatKhususApi[kode as KodeGalatKhususApi]
    : teksGalat[kode as keyof typeof teksGalat];
}

/**
 * Teks untuk halaman atau bagian yang gagal dimuat: fitur yang belum ada di backend demo memakai
 * "Fitur ini belum tersedia di versi demo" ([AG-19]); galat lain memakai teks umum.
 */
export function teksGagalMuat(galat: unknown): string {
  return adalahGalatApi(galat) && galat.kode === 'BELUM_TERSEDIA'
    ? teksGalatKhususApi.BELUM_TERSEDIA
    : teksUmum.galatIsi;
}
