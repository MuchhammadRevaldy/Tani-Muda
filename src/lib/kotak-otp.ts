/** Logika kotak OTP 6 digit (fungsi murni; komponen KotakOtp hanya memanggilnya). */

export const PANJANG_OTP = 6;

export interface HasilOtp {
  digit: string[];
  /** Indeks kotak yang harus difokus berikutnya. */
  fokus: number;
}

/** Kode kosong sepanjang `panjang`. */
export function otpKosong(panjang = PANJANG_OTP): string[] {
  return Array.from({ length: panjang }, () => '');
}

/**
 * Isi kotak di `indeks` dengan teks ketikan atau tempelan. Selain digit dibuang.
 * Tempelan beberapa digit mengisi kotak berikutnya; fokus pindah ke kotak setelah digit terakhir.
 */
export function isiOtp(digit: string[], indeks: number, masukan: string): HasilOtp {
  const angka = masukan.replace(/\D/g, '');
  const baru = [...digit];
  if (angka === '') {
    baru[indeks] = '';
    return { digit: baru, fokus: indeks };
  }
  let i = indeks;
  for (const a of angka) {
    if (i >= baru.length) break;
    baru[i] = a;
    i++;
  }
  return { digit: baru, fokus: Math.min(i, baru.length - 1) };
}

/** Tombol hapus mundur: kosongkan kotak ini, atau kotak sebelumnya bila sudah kosong. */
export function hapusMundurOtp(digit: string[], indeks: number): HasilOtp {
  const baru = [...digit];
  if (baru[indeks]) {
    baru[indeks] = '';
    return { digit: baru, fokus: indeks };
  }
  const sebelumnya = Math.max(0, indeks - 1);
  baru[sebelumnya] = '';
  return { digit: baru, fokus: sebelumnya };
}

/** Kode lengkap bila semua kotak terisi, selain itu null. */
export function kodeLengkap(digit: string[]): string | null {
  return digit.every((d) => /^\d$/.test(d)) ? digit.join('') : null;
}
