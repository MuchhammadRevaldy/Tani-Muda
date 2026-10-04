import type { ReactNode } from 'react';
import { formatRupiah } from '../lib/format';
import { cx } from './gabung-kelas';

export interface UangProps {
  nilai: number;
  label?: ReactNode;
  keterangan?: ReactNode;
  besar?: boolean;
  className?: string;
}

/** Angka uang berwarna tanah; rugi (negatif) bertanda minus dan berwarna tomat. */
export function Uang({ nilai, label, keterangan, besar, className }: UangProps) {
  const rugi = nilai < 0;
  const angka = (
    <span
      className={cx(
        'whitespace-nowrap font-semibold',
        besar && 'text-uang',
        rugi ? 'text-tomat' : 'text-tanah',
      )}
    >
      {formatRupiah(nilai)}
    </span>
  );
  if (!label) return <span className={cx('tabular-nums', className)}>{angka}</span>;
  return (
    <div className={cx('inline-flex flex-col gap-0.5 tabular-nums', className)}>
      <span className="text-keterangan text-teks-pendukung">{label}</span>
      {angka}
      {keterangan ? (
        <span className="text-keterangan text-teks-pendukung">{keterangan}</span>
      ) : null}
    </div>
  );
}
