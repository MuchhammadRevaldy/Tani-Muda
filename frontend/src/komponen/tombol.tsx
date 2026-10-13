import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './gabung-kelas';
import { Ikon, type NamaIkon } from './ikon';

export type VarianTombol = 'utama' | 'sekunder';

/** Kelas tombol, dipakai juga untuk tautan yang tampil sebagai tombol (mis. "Isi angka"). */
export function kelasTombol(varian: VarianTombol = 'utama', penuh = false): string {
  return cx(
    'fokus-cincin inline-flex min-h-kontrol min-w-sentuh cursor-pointer items-center justify-center gap-2',
    'rounded-full border-2 px-6 text-center text-isi font-semibold no-underline',
    // Gerak (D-61): naik 1px saat disorot (hanya perangkat berkursor), turun saat ditekan.
    'transition duration-cepat ease-keluar hover:-translate-y-px active:translate-y-px',
    'disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-transparent disabled:bg-garis disabled:bg-none disabled:text-teks-pendukung disabled:shadow-none',
    // Utama: pil limau bergradasi dengan cahaya. Teks putih di atas limau di bawah 4,5:1, diterima
    // pemilik produk sebagai utang desain yang wajib ditinjau sebelum pilot (D-59).
    varian === 'utama'
      ? 'border-transparent bg-limau bg-tombol-limau text-putih shadow-cahaya-limau hover:bg-limau-tekan hover:bg-none hover:text-putih hover:shadow-cahaya-limau-terang active:bg-limau-tekan active:bg-none active:shadow-cahaya-limau'
      : 'border-teks bg-putih text-teks hover:bg-embun-pagi hover:text-teks active:bg-embun-pagi',
    penuh && 'flex w-full',
  );
}

/** Tombol tambah persegi oranye 56px, sudut 16px (papan Sistem tema D-59), selalu dengan label. */
export const kelasTombolTambah =
  'fokus-cincin grid h-kontrol w-kontrol flex-none cursor-pointer place-items-center rounded-lg border-0 bg-oranye bg-tombol-oranye p-0 text-putih shadow-cahaya-oranye transition duration-cepat ease-keluar hover:-translate-y-px hover:bg-oranye-tekan hover:bg-none hover:shadow-cahaya-oranye-terang active:translate-y-px active:shadow-cahaya-oranye';

export interface TombolProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Paling banyak satu tombol utama per layar; pilihan lain memakai sekunder. */
  varian?: VarianTombol;
  ikon?: NamaIkon;
  penuh?: boolean;
  children: ReactNode;
}

/** Tombol desain: pil setinggi 56px, label diawali kata kerja. */
export function Tombol({
  varian = 'utama',
  ikon,
  penuh,
  className,
  type,
  children,
  ...lain
}: TombolProps) {
  return (
    <button type={type ?? 'button'} className={cx(kelasTombol(varian, penuh), className)} {...lain}>
      {ikon ? <Ikon nama={ikon} /> : null}
      <span>{children}</span>
    </button>
  );
}
