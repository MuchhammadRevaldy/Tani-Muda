import type { ReactNode } from 'react';
import { cx } from './cx';
import { Ikon, type NamaIkon } from './Ikon';

/**
 * Label kecil (bukan tombol) seperti di halaman desain:
 * - hijau: "Ada pesanan", "Cocok untuk pemula", "Terdaftar"
 * - segera: "Segera hadir"
 * - garis: "Subsidi", "Nonsubsidi", hasil ukur terakhir
 * - promo: "Promo" (selalu terlihat sebagai iklan, P0-35)
 * - polos: "Resep tersedia" (teks hijau dengan ikon)
 * - contoh: "CONTOH, belum divalidasi penyuluh" (D-10, D-11)
 */
export type NadaLabel = 'hijau' | 'segera' | 'garis' | 'promo' | 'polos' | 'contoh';

const NADA: Record<NadaLabel, string> = {
  hijau: 'min-h-7.5 rounded-full bg-daun-lembut px-2.5 font-medium text-daun-tua',
  segera:
    'min-h-7.5 rounded-full border-1.5 border-matahari bg-matahari-lembut px-2.5 font-medium text-matahari-teks',
  garis: 'min-h-6.5 rounded-full border-1.5 border-garis-kuat px-2 font-medium text-teks',
  promo:
    'min-h-7 rounded-sm border-1.5 border-matahari bg-matahari-lembut px-2.5 font-semibold text-matahari-teks',
  polos: 'font-medium text-daun-tua',
  contoh: 'min-h-7 rounded-sm border-1.5 border-garis-kuat bg-putih px-2.5 font-semibold text-teks',
};

export function LabelKecil({
  nada,
  ikon,
  children,
  className,
}: {
  nada: NadaLabel;
  ikon?: NamaIkon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 leading-5.5', NADA[nada], className)}>
      {ikon ? <Ikon nama={ikon} ukuran={16} /> : null}
      {children}
    </span>
  );
}
