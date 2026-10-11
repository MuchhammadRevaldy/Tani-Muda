import type { KeyboardEvent, ReactNode } from 'react';
import { cx } from './gabung-kelas';

/* ---------- PilPilihan: grup tombol aria-pressed ---------- */

export interface OpsiPil<T extends string> {
  nilai: T;
  label: ReactNode;
  ikon?: ReactNode;
}

/**
 * Pilihan satu dari beberapa, seperti di desain:
 * - pil: chip bulat yang bisa digulir (jenis lahan, filter tugas, Rutin/Sekali panen)
 * - segmen: pilihan di dalam lintasan embun-pagi (satuan luas, sistem hidroponik)
 * - kotak: dua kotak berdampingan (Subsidi/Nonsubsidi)
 */
export function PilPilihan<T extends string>({
  opsi,
  nilai,
  onPilih,
  label,
  gaya = 'pil',
  className,
}: {
  opsi: OpsiPil<T>[];
  nilai: T;
  onPilih: (nilai: T) => void;
  /** Nama grup untuk pembaca layar. */
  label: string;
  gaya?: 'pil' | 'segmen' | 'kotak';
  className?: string;
}) {
  const wadah = {
    pil: 'flex gap-2 overflow-x-auto',
    segmen: 'grid auto-cols-fr grid-flow-col gap-1 rounded-md bg-embun-pagi p-1',
    kotak: 'grid grid-cols-2 gap-2',
  }[gaya];
  return (
    <div role="group" aria-label={label} className={cx(wadah, className)}>
      {opsi.map((o) => {
        const aktif = o.nilai === nilai;
        const kelas = {
          pil: cx(
            'flex-none whitespace-nowrap rounded-full px-4',
            aktif
              ? 'border-2 border-daun-tua bg-daun-lembut font-semibold text-daun-tua'
              : 'border-1.5 border-garis-kuat bg-putih font-medium text-teks',
          ),
          segmen: cx(
            'w-full rounded-ikon px-1.5 py-1 leading-5',
            aktif
              ? 'border-2 border-daun-tua bg-putih font-semibold text-daun-tua'
              : 'border-0 bg-transparent font-medium text-teks',
          ),
          kotak: cx(
            'w-full rounded-md px-3',
            aktif
              ? 'border-2 border-daun-tua bg-daun-lembut font-semibold text-daun-tua'
              : 'border-1.5 border-garis-kuat bg-putih font-medium text-teks',
          ),
        }[gaya];
        return (
          <button
            key={o.nilai}
            type="button"
            aria-pressed={aktif}
            onClick={() => onPilih(o.nilai)}
            className={cx(
              'fokus-cincin inline-flex min-h-sentuh cursor-pointer items-center justify-center gap-1.5 text-isi',
              kelas,
            )}
          >
            {o.ikon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- GrupRadio + KartuPilihan ---------- */

/** Pindahkan fokus dan pilihan dengan tombol panah di antara [role=radio]. */
function geserDenganPanah(e: KeyboardEvent<HTMLDivElement>) {
  const maju = e.key === 'ArrowDown' || e.key === 'ArrowRight';
  const mundur = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
  if (!maju && !mundur) return;
  const radio = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const i = radio.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  const tujuan = radio[(i + (maju ? 1 : -1) + radio.length) % radio.length];
  tujuan?.focus();
  tujuan?.click();
}

export function GrupRadio({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={geserDenganPanah} className={className}>
      {children}
    </div>
  );
}

/**
 * Kartu yang bisa dipilih (komoditas, metode, merek). Seluruh kartu adalah target sentuh.
 * Terpilih: latar daun-lembut + bingkai 2px daun-tua. Segera hadir: latar embun-pagi.
 */
export function KartuPilihan({
  dipilih,
  onPilih,
  labelAksesibel,
  segera,
  nonaktif,
  children,
  className,
}: {
  dipilih: boolean;
  onPilih: () => void;
  /** Label untuk pembaca layar, mis. "Pilih Sawi hijau" atau "Cabai rawit, segera hadir". */
  labelAksesibel: string;
  segera?: boolean;
  /** Tampil tetapi tidak bisa dipilih, mis. desa yang belum tersedia di pilot (D-56). */
  nonaktif?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'relative min-h-sentuh rounded-lg border',
        dipilih
          ? 'border-daun-tua bg-daun-lembut'
          : segera || nonaktif
            ? 'border-garis bg-embun-pagi'
            : 'border-garis bg-putih',
        className,
      )}
    >
      {children}
      <button
        type="button"
        role="radio"
        aria-checked={dipilih}
        aria-label={labelAksesibel}
        disabled={nonaktif}
        onClick={onPilih}
        className="fokus-cincin absolute inset-0 m-0 h-full w-full cursor-pointer rounded-lg border-0 bg-transparent p-0 disabled:cursor-not-allowed"
      />
      {dipilih ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-lg border-2 border-daun-tua"
        />
      ) : null}
    </div>
  );
}

/* ---------- Saklar ---------- */

export function Saklar({
  aktif,
  onUbah,
  label,
  className,
}: {
  aktif: boolean;
  onUbah: (aktif: boolean) => void;
  /** Wajib: nama pengaturan untuk pembaca layar. */
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={aktif}
      aria-label={label}
      onClick={() => onUbah(!aktif)}
      className={cx(
        'fokus-cincin grid h-sentuh w-16 flex-none cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0',
        className,
      )}
    >
      <span
        className={cx(
          'relative block h-8 w-kontrol rounded-full',
          aktif ? 'bg-daun-tua' : 'border-2 border-garis-kuat bg-putih',
        )}
      >
        <span
          className={cx(
            'absolute h-6 w-6 rounded-full',
            aktif ? 'left-6 top-1 bg-putih' : 'left-0.5 top-0.5 bg-garis-kuat',
          )}
        />
      </span>
    </button>
  );
}
