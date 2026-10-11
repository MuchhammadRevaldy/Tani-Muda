import type { ReactNode } from 'react';
import { cx } from './gabung-kelas';
import { Ikon, type NamaIkon } from './ikon';

export type StatusChip =
  | 'selesai'
  | 'hari-ini'
  | 'besok'
  | 'terlambat'
  | 'uang-muka-ditahan'
  | 'menunggu-konfirmasi'
  | 'dana-cair';

const STATUS: Record<StatusChip, { label: string; ikon: NamaIkon | null; kelas: string }> = {
  selesai: {
    label: 'Selesai',
    ikon: 'centang',
    kelas: 'border-transparent bg-daun-lembut text-daun-tua',
  },
  'hari-ini': {
    label: 'Hari ini',
    ikon: null,
    kelas: 'border-2 border-daun-tua bg-putih text-daun-tua',
  },
  besok: {
    label: 'Besok',
    ikon: 'jam',
    kelas: 'border-matahari bg-matahari-lembut text-matahari-teks',
  },
  terlambat: {
    label: 'Terlambat',
    ikon: 'peringatan',
    kelas: 'border-tomat bg-tomat-lembut text-tomat-teks',
  },
  'uang-muka-ditahan': {
    label: 'Uang muka ditahan',
    ikon: 'kunci',
    kelas: 'border-transparent bg-tanah-lembut text-tanah',
  },
  'menunggu-konfirmasi': {
    label: 'Menunggu konfirmasi',
    ikon: 'jam-pasir',
    kelas: 'border-garis-kuat bg-putih text-teks-pendukung',
  },
  'dana-cair': {
    label: 'Dana cair',
    ikon: 'uang',
    kelas: 'border-transparent bg-daun-tua text-putih',
  },
};

export const daftarStatusChip = Object.keys(STATUS) as StatusChip[];

/** Chip status tugas dan uang. Arti selalu dibawa ikon dan kata, bukan warna saja. */
export function ChipStatus({
  status,
  children,
  className,
}: {
  status: StatusChip;
  /** Menimpa teks bawaan, mis. "Terlambat 2 hari". */
  children?: ReactNode;
  className?: string;
}) {
  const s = STATUS[status];
  return (
    <span
      className={cx(
        'inline-flex min-h-chip items-center gap-2 whitespace-nowrap rounded-full border-1.5 px-3 align-middle text-keterangan font-medium',
        s.kelas,
        className,
      )}
    >
      {s.ikon ? (
        <Ikon nama={s.ikon} ukuran={18} tebal={2.25} />
      ) : (
        <span className="h-2.5 w-2.5 flex-none rounded-full bg-current" aria-hidden="true" />
      )}
      <span>{children ?? s.label}</span>
    </span>
  );
}
