import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { Ikon, type NamaIkon } from './Ikon';

export type VarianTombol = 'utama' | 'sekunder';

/** Kelas tombol, dipakai juga untuk tautan yang tampil sebagai tombol (mis. "Isi angka"). */
export function kelasTombol(varian: VarianTombol = 'utama', penuh = false): string {
  return cx(
    'fokus-cincin inline-flex min-h-kontrol min-w-sentuh cursor-pointer items-center justify-center gap-2',
    'rounded-md border-2 px-5 text-center text-isi font-semibold no-underline active:translate-y-px',
    'disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-garis disabled:bg-garis disabled:text-teks-pendukung',
    varian === 'utama'
      ? 'border-transparent bg-daun-tua text-putih hover:bg-daun-tekan hover:text-putih active:bg-daun-tekan'
      : 'border-daun-tua bg-putih text-daun-tua hover:bg-daun-lembut hover:text-daun-tua active:bg-daun-lembut',
    penuh && 'flex w-full',
  );
}

export interface TombolProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Paling banyak satu tombol utama per layar; pilihan lain memakai sekunder. */
  varian?: VarianTombol;
  ikon?: NamaIkon;
  penuh?: boolean;
  children: ReactNode;
}

/** Tombol desain: tinggi 52px, label diawali kata kerja. */
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
