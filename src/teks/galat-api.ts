/**
 * Teks untuk kode galat khusus API. Kode logika inti memakai src/teks/galat.ts. Klien tiruan dan
 * backend mengirim teks yang sama sebagai `pesan`.
 */
import type { KodeGalatApi, KodeGalatKhususApi } from '../api/galat';
import { teksGalat } from './galat';

export const teksGalatKhususApi: Record<KodeGalatKhususApi, string> = {
  VALIDASI: 'Ada isian yang belum benar',
  BELUM_MASUK: 'Masuk dulu dengan nomor HP',
  TIDAK_DIIZINKAN: 'Akunmu tidak bisa membuka bagian ini',
  TIDAK_DITEMUKAN: 'Data ini tidak ditemukan',
  BENTROK: 'Data ini sudah berubah. Muat ulang lalu coba lagi',
  TERLALU_SERING: 'Terlalu sering. Tunggu sebentar lalu coba lagi',
  AKUN_NONAKTIF: 'Akunmu sedang dinonaktifkan sementara, jadi belum bisa mengambil pesanan baru',
  BELUM_TERVERIFIKASI: 'Usaha Anda belum terverifikasi, jadi belum bisa memasang pesanan',
  PERAN_BELUM_DIPILIH: 'Pilih peranmu dulu',
  WILAYAH_WAJIB: 'Isi desa lahanmu dulu',
  PRIVASI_WAJIB: 'Centang persetujuan kebijakan privasi dulu',
  OTP_SALAH: 'Kode salah. Periksa SMS lalu coba lagi',
  OTP_KEDALUWARSA: 'Kode sudah kedaluwarsa. Minta kode baru',
  OTP_TERKUNCI: 'Terlalu banyak percobaan. Minta kode baru',
  FOTO_WAJIB: 'Ambil foto hasil panen dulu',
  STATUS_TIDAK_SESUAI: 'Langkah ini tidak bisa dilakukan sekarang',
  SUDAH_DINILAI: 'Kamu sudah memberi nilai untuk kiriman ini',
  MELEBIHI_SALDO: 'Nominal melebihi dana yang ditahan',
  PEMBAYARAN_GAGAL: 'Pembayaran belum berhasil. Uang Anda tidak terpotong; coba bayar lagi',
  SUMBER_BELUM_TERSEDIA: 'Sambungan ke server belum tersedia',
  GALAT_SERVER: 'Ada yang tidak beres di server. Coba lagi sebentar lagi',
};

/** Teks untuk kode galat API apa pun. */
export function teksUntukGalat(kode: KodeGalatApi): string {
  return kode in teksGalatKhususApi
    ? teksGalatKhususApi[kode as KodeGalatKhususApi]
    : teksGalat[kode as keyof typeof teksGalat];
}
