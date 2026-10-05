/**
 * Normalisasi nomor HP Indonesia ke format +62 (dipakai untuk login OTP, D-04). Rumus yang sama
 * dipakai backend (kasus uji bersama).
 */
import { berhasil, gagal, type Hasil } from './hasil';

/**
 * "0812-3456-7890", "62 812 3456 7890", "+6281234567890", "81234567890" → "+6281234567890".
 * Nomor seluler Indonesia: diawali 8, total 9–12 digit setelah kode negara.
 */
export function normalisasiNomorHp(masukan: string): Hasil<string> {
  const digit = masukan.replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(digit)) return gagal('NOMOR_HP_TIDAK_VALID');
  let inti = digit.replace(/^\+/, '');
  if (inti.startsWith('62')) inti = inti.slice(2);
  else if (inti.startsWith('0')) inti = inti.slice(1);
  if (!/^8\d{8,11}$/.test(inti)) return gagal('NOMOR_HP_TIDAK_VALID');
  return berhasil('+62' + inti);
}

/** Samarkan untuk tampilan dan log: "+6281234567890" → "+62812****7890". */
export function samarkanNomorHp(nomor: string): string {
  if (nomor.length < 9) return nomor;
  return nomor.slice(0, 6) + '*'.repeat(Math.max(0, nomor.length - 10)) + nomor.slice(-4);
}
