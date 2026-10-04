import { inisialNama } from '../lib/teks-nama';
import { cx } from './cx';

const UKURAN = { 40: 'h-10 w-10', 44: 'h-11 w-11', 64: 'h-16 w-16', 96: 'h-24 w-24' } as const;

/**
 * Avatar bulat. Dengan `foto` → gambar. Gaya `ilustrasi` (sidebar petani, papan 06) atau
 * `inisial` (kebun di dasbor pembeli, papan 61).
 */
export function Avatar({
  nama,
  foto,
  gaya = 'ilustrasi',
  ukuran = 40,
  className,
}: {
  nama: string;
  foto?: string | null;
  gaya?: 'ilustrasi' | 'inisial';
  ukuran?: keyof typeof UKURAN;
  className?: string;
}) {
  const kelas = cx('block flex-none overflow-hidden rounded-full', UKURAN[ukuran], className);
  if (foto) return <img src={foto} alt="" className={cx(kelas, 'object-cover')} />;
  if (gaya === 'inisial') {
    return (
      <span
        aria-hidden="true"
        className={cx(kelas, 'grid place-items-center bg-daun-lembut font-semibold text-daun-tua')}
      >
        {inisialNama(nama)}
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={cx(kelas, 'bg-tanah-lembut')}>
      <svg viewBox="0 0 40 40" className="block h-full w-full">
        <circle cx="20" cy="16" r="7" className="fill-tanah" />
        <path d="M5 40c1-9 7-14 15-14s14 5 15 14Z" className="fill-daun-tua" />
      </svg>
    </span>
  );
}
