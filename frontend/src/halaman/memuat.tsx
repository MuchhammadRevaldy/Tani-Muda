import { cx } from '../komponen/gabung-kelas';
import { teksUmum } from '../teks/umum';

/**
 * Keadaan memuat (D-61): tunas tumbuh 96×96 (animasinya di dalam SVG, mati saat gerak dikurangi);
 * teks "Sedang memuat…" tetap ada untuk pembaca layar lewat role="status".
 */
export function Memuat({ className }: { className?: string }) {
  return (
    <div role="status" className={cx('flex flex-col items-center p-6', className)}>
      <img
        src="/ilustrasi/memuat-tunas.svg"
        width={96}
        height={96}
        alt=""
        aria-hidden="true"
        className="block"
      />
      <span className="sr-saja">{teksUmum.memuat}</span>
    </div>
  );
}

/** Kerangka kartu yang sedang dimuat: blok abu berdenyut halus, teks memuat untuk pembaca layar. */
export function KerangkaKartuMuat({ className }: { className?: string }) {
  const blok = 'rounded-full bg-garis animate-denyut';
  return (
    <div
      role="status"
      className={cx('flex flex-col gap-4 rounded-kartu-besar bg-putih p-4 shadow-kartu', className)}
    >
      <span className="sr-saja">{teksUmum.memuat}</span>
      <div className="flex items-center gap-4" aria-hidden="true">
        <div className="h-24 w-24 flex-none rounded-full bg-garis animate-denyut" />
        <div className="flex flex-1 flex-col gap-2">
          <div className={cx(blok, 'h-5 w-2/3')} />
          <div className={cx(blok, 'h-4 w-1/2')} />
        </div>
      </div>
      <div className={cx(blok, 'h-3 w-full')} aria-hidden="true" />
      <div className={cx(blok, 'h-4 w-1/3')} aria-hidden="true" />
    </div>
  );
}
