import type { ReactNode } from 'react';
import { teksKomponen } from '../teks/komponen';
import { cx } from './cx';
import { Ikon, type NamaIkon } from './Ikon';

export type JenisBanner = 'peringatan' | 'bahaya' | 'offline';

const BANNER: Record<
  JenisBanner,
  { ikon: NamaIkon; peran: 'status' | 'alert'; kelas: string; kelasIkon: string }
> = {
  peringatan: {
    ikon: 'lonceng',
    peran: 'status',
    kelas: 'rounded-md border-matahari bg-matahari-lembut text-teks',
    kelasIkon: 'text-matahari-teks',
  },
  bahaya: {
    ikon: 'peringatan',
    peran: 'alert',
    kelas: 'rounded-md border-tomat bg-tomat-lembut text-teks',
    kelasIkon: 'text-tomat-teks',
  },
  offline: {
    ikon: 'offline',
    peran: 'status',
    kelas: 'rounded-sm border-teks bg-teks text-putih',
    kelasIkon: '',
  },
};

export interface BannerProps {
  jenis?: JenisBanner;
  judul?: ReactNode;
  children?: ReactNode;
  /** Teks tombol aksi (tautan bergaris bawah). */
  aksi?: ReactNode;
  onAksi?: () => void;
  /** Banner offline: jumlah catatan yang belum terkirim. */
  tertunda?: number;
  className?: string;
}

export function Banner({
  jenis = 'peringatan',
  judul,
  children,
  aksi,
  onAksi,
  tertunda,
  className,
}: BannerProps) {
  const b = BANNER[jenis];
  const judulTampil = judul ?? (jenis === 'offline' ? teksKomponen.banner.offlineJudul : undefined);
  let isi = children;
  if (jenis === 'offline' && isi == null) isi = teksKomponen.banner.offlineIsi(tertunda);
  return (
    <div
      role={b.peran}
      className={cx('flex items-start gap-3 border-1.5 px-4 py-3', b.kelas, className)}
    >
      <Ikon nama={b.ikon} className={b.kelasIkon} />
      <div className="min-w-0 flex-1">
        {judulTampil ? (
          <p className={cx('m-0 text-isi font-semibold', jenis === 'bahaya' && 'text-tomat-teks')}>
            {judulTampil}
          </p>
        ) : null}
        {isi ? <p className="mb-0 mt-0.5 text-keterangan">{isi}</p> : null}
        {aksi ? (
          <button
            type="button"
            onClick={onAksi}
            className={cx(
              '-mb-3 -ml-2 inline-flex min-h-sentuh cursor-pointer items-center rounded-sm border-0 bg-transparent px-2',
              'text-isi font-semibold text-inherit underline underline-offset-3',
              jenis === 'offline'
                ? 'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-putih'
                : 'fokus-cincin',
            )}
          >
            {aksi}
          </button>
        ) : null}
      </div>
    </div>
  );
}
