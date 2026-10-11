import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './gabung-kelas';

export interface KartuProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  judul?: ReactNode;
  keterangan?: ReactNode;
  /** Isi di kanan kepala (mis. chip atau tautan). */
  kanan?: ReactNode;
  kaki?: ReactNode;
  /** Kaki "uang" berlatar tanah lembut, hanya untuk ringkasan uang. */
  nadaKaki?: 'biasa' | 'uang';
  /** Isi rapat tanpa padding samping, untuk daftar baris (BarisTugas). */
  tanpaIsi?: boolean;
  tingkatJudul?: 2 | 3;
}

/** Kartu putih, garis 1px, sudut 16px, tanpa bayangan. */
export function Kartu({
  judul,
  keterangan,
  kanan,
  kaki,
  nadaKaki = 'biasa',
  tanpaIsi,
  tingkatJudul = 3,
  className,
  children,
  ...lain
}: KartuProps) {
  const adaKepala = judul || keterangan || kanan;
  const Judul = tingkatJudul === 2 ? 'h2' : 'h3';
  return (
    <section
      className={cx('overflow-hidden rounded-lg border border-garis bg-putih', className)}
      {...lain}
    >
      {adaKepala ? (
        <div className="flex items-start justify-between gap-3 px-4 pt-4">
          <div className="min-w-0">
            {judul ? (
              <Judul className="m-0 text-judul-bagian font-semibold text-teks">{judul}</Judul>
            ) : null}
            {keterangan ? (
              <p className="mb-0 mt-1 text-keterangan text-teks-pendukung">{keterangan}</p>
            ) : null}
          </div>
          {kanan ? <div className="flex-none">{kanan}</div> : null}
        </div>
      ) : null}
      {children != null ? <div className={tanpaIsi ? 'py-2' : 'p-4'}>{children}</div> : null}
      {kaki ? (
        <div
          className={cx(
            'flex flex-wrap gap-x-6 gap-y-3 border-t px-4 py-3',
            nadaKaki === 'uang' ? 'border-tanah-lembut bg-tanah-lembut' : 'border-garis',
          )}
        >
          {kaki}
        </div>
      ) : null}
    </section>
  );
}
