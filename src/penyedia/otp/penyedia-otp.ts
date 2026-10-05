/**
 * Antarmuka penyedia OTP (D-10). Dipakai di sisi "server": oleh klien API tiruan di Tahap 3–4, dan
 * diganti `PengirimOtp` backend di Tahap 5. Halaman tidak memanggil penyedia ini langsung; halaman
 * memakai `klien.akun.kirimOtp` dan `klien.akun.verifikasiOtp`.
 */

export type GalatOtp = 'TERLALU_SERING' | 'OTP_SALAH' | 'OTP_KEDALUWARSA' | 'OTP_TERKUNCI';

export interface HasilKirimOtp {
  kirimUlangDalamDetik: number;
  kedaluwarsaDalamDetik: number;
}

export type HasilOtp<T> =
  { ok: true; nilai: T } | { ok: false; galat: GalatOtp; cobaLagiDalamDetik?: number };

export interface PenyediaOtp {
  /** Buat dan kirim kode 6 digit ke nomor (sudah dinormalisasi "+62…"). */
  kirimKode(nomorHp: string): Promise<HasilOtp<HasilKirimOtp>>;
  /** Cocokkan kode. Kode yang cocok langsung dianggap terpakai. */
  verifikasi(nomorHp: string, kode: string): Promise<HasilOtp<true>>;
}

/** Aturan OTP yang sama dengan backend (arsitektur-backend.md bagian 5). */
export const ATURAN_OTP = {
  panjang: 6,
  kedaluwarsaDetik: 5 * 60,
  maksPercobaan: 5,
  jedaKirimUlangDetik: 60,
  maksKirimPerJam: 5,
} as const;
