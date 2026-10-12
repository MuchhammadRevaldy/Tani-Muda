/**
 * Batang rentang normal (papan 23–25): skala min–maks, pita normal hijau, penanda posisi nilai
 * berwarna status, label min/maks/rentang normal, lalu ikon + kata status (arti tidak hanya warna).
 * Posisi dari `posisiPadaSkala`, ujung dari `batasSkala` (src/lib/pengukuran.ts).
 */
import type { StatusPengukuran } from '../api/tipe';
import { batasSkala } from '../lib/pengukuran';
import { cx } from './gabung-kelas';
import { Ikon } from './ikon';

const WARNA_PENANDA: Record<StatusPengukuran, string> = {
  normal: 'border-daun-tua',
  'terlalu-tinggi': 'border-matahari',
  'terlalu-rendah': 'border-tomat',
  kosong: 'border-garis-kuat',
};
const WARNA_TEKS: Record<StatusPengukuran, string> = {
  normal: 'text-daun-tua',
  'terlalu-tinggi': 'text-matahari-teks',
  'terlalu-rendah': 'text-tomat-teks',
  kosong: 'text-teks-pendukung',
};

/** Tepi kiri dan kanan batang: 1,5 × lebar rentang normal (papan 23: pH 5,5–6,5 → 4,0–8,0). */
export const TEPI_BATANG = 1.5;

export function BatangRentang({
  nilai,
  status,
  batasBawah,
  batasAtas,
  skalaMin,
  skalaMaks,
  format,
  teksNormal,
  teksStatus,
}: {
  nilai: number | null;
  status: StatusPengukuran;
  batasBawah: number;
  batasAtas: number;
  skalaMin: number;
  skalaMaks: number | null;
  format: (n: number) => string;
  /** "Normal 5,5–6,5" */
  teksNormal: string;
  /** "Normal", "Terlalu tinggi", … */
  teksStatus: string;
}) {
  const { min, maks } = batasSkala(batasBawah, batasAtas, TEPI_BATANG, {
    min: skalaMin,
    maks: skalaMaks,
  });
  const pos = (v: number) => Math.min(1, Math.max(0, (v - min) / (maks - min || 1))) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative mx-3 h-7" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-garis" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-daun-tua"
          style={{ left: `${pos(batasBawah)}%`, width: `${pos(batasAtas) - pos(batasBawah)}%` }}
        />
        {nilai !== null ? (
          <div
            className={cx(
              'absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-3 bg-putih',
              WARNA_PENANDA[status],
            )}
            style={{ left: `${pos(nilai)}%` }}
          />
        ) : null}
      </div>
      <div className="flex items-baseline justify-between gap-2 text-keterangan">
        <span className="text-teks-pendukung tabular-nums">{format(min)}</span>
        <span className="font-semibold text-daun-tua">{teksNormal}</span>
        <span className="text-teks-pendukung tabular-nums">{format(maks)}</span>
      </div>
      {status !== 'kosong' ? (
        <span className={cx('inline-flex items-center gap-1.5 font-semibold', WARNA_TEKS[status])}>
          <Ikon nama={status === 'normal' ? 'centang' : 'peringatan'} ukuran={20} />
          {teksStatus}
        </span>
      ) : null}
    </div>
  );
}
