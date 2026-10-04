import { titikRibuan } from './format';

/** Batas digit kolom rupiah (sama dengan desain: 13 digit, sampai triliun). */
export const MAKS_DIGIT_RUPIAH = 13;

export interface HasilKetikan {
  /** Nilai angka, atau null bila kolom kosong. */
  nilai: number | null;
  /** Teks yang ditampilkan, dengan titik ribuan. */
  tampil: string;
  /** Jumlah digit di kiri kursor, untuk mengembalikan posisi kursor setelah format ulang. */
  digitSebelumKursor: number;
}

/**
 * Olah ketikan di kolom rupiah: buang selain digit, buang nol di depan, batasi 13 digit,
 * dan hitung berapa digit ada di kiri kursor (logika InputRupiah di pustaka desain).
 */
export function olahKetikanRupiah(teks: string, posisiKursor: number = teks.length): HasilKetikan {
  let angka = teks.replace(/\D/g, '');
  const nolDepan = (/^0+(?=\d)/.exec(angka)?.[0] ?? '').length;
  const sebelum = teks.slice(0, Math.max(0, posisiKursor)).replace(/\D/g, '').length - nolDepan;
  angka = angka.slice(nolDepan).slice(0, MAKS_DIGIT_RUPIAH);
  const nilai = angka === '' ? null : Number(angka);
  return {
    nilai,
    tampil: nilai === null ? '' : titikRibuan(nilai),
    digitSebelumKursor: Math.min(Math.max(0, sebelum), angka.length),
  };
}

/** Posisi kursor di teks berformat sehingga tepat `jumlahDigit` digit ada di kirinya. */
export function posisiSetelahDigit(teksTampil: string, jumlahDigit: number): number {
  if (jumlahDigit <= 0) return 0;
  let hitung = 0;
  for (let i = 0; i < teksTampil.length; i++) {
    if (/\d/.test(teksTampil[i] ?? '')) {
      hitung++;
      if (hitung === jumlahDigit) return i + 1;
    }
  }
  return teksTampil.length;
}

/** Teks tampilan untuk nilai rupiah (tanpa "Rp"). */
export function tampilanRupiah(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined || Number.isNaN(nilai)) return '';
  return titikRibuan(Math.round(nilai));
}
