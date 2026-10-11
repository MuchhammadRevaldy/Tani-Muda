/**
 * Tabel sederhana panel admin dan mentor (D-07): kartu putih bergaris, kepala abu, baris bergaris
 * bawah. Wadahnya bisa digeser mendatar sendiri, sehingga halaman tidak ikut bergulir ke samping
 * di layar sempit (T4.40).
 */
import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cx } from './gabung-kelas';

export function Tabel({
  label,
  kepala,
  children,
  className,
}: {
  /** Nama tabel untuk pembaca layar. */
  label: string;
  kepala: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cx(
        'fokus-cincin relative overflow-x-auto rounded-lg border border-garis bg-putih',
        className,
      )}
    >
      <table className="w-max min-w-full border-collapse text-left">
        <caption className="sr-saja">{label}</caption>
        <thead>
          <tr>{kepala}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Kepala({ className, ...lain }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cx(
        'whitespace-nowrap border-b border-garis bg-embun-pagi px-4 py-3 font-medium text-teks-pendukung',
        className,
      )}
      {...lain}
    />
  );
}

export function Sel({ className, ...lain }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx('border-b border-garis px-4 py-3 align-top', className)} {...lain} />;
}
