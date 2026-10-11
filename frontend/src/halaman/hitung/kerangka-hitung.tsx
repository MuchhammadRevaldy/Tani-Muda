/**
 * Kerangka satu langkah Hitung (papan 10–19): tautan kembali, "Langkah n dari 3", judul. HP: satu
 * kolom dengan bilah bawah menempel (ringkasan + tombol utama). Desktop: kolom isi + panel samping
 * 360px berisi stepper, ringkasan, dan tombol utama.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Ikon } from '../../komponen/ikon';
import { Stepper } from '../../komponen/pelengkap';
import { useLayarLebar } from '../../komponen/use-layar-lebar';

export function KerangkaHitung({
  langkah,
  kembaliKe,
  labelKembali,
  judul,
  sub,
  samping,
  bilahBawah,
  children,
}: {
  langkah: 1 | 2 | 3;
  kembaliKe: string;
  labelKembali: string;
  judul: string;
  sub?: ReactNode;
  /** Isi panel samping desktop di bawah stepper. */
  samping?: ReactNode;
  /** Bilah bawah HP: ringkasan satu baris dan tombol utama. */
  bilahBawah?: ReactNode;
  children: ReactNode;
}) {
  // Panel samping hanya dirender di desktop dan bilah bawah hanya di HP, supaya tombol utama
  // dan isian tidak muncul dua kali di halaman.
  const lebar = useLayarLebar();
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Link
            to={kembaliKe}
            className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
          >
            <Ikon nama="panah-kiri" ukuran={20} />
            <span>{labelKembali}</span>
          </Link>
          {lebar ? null : <Stepper langkah={langkah} />}
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-judul-halaman font-semibold">{judul}</h1>
            {sub ? <p className="m-0 text-keterangan text-teks-pendukung">{sub}</p> : null}
          </div>
          {children}
        </div>
        {lebar ? (
          <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4 pt-14">
            <Stepper langkah={langkah} />
            {samping}
          </aside>
        ) : null}
      </div>
      {bilahBawah && !lebar ? (
        <div className="sticky bottom-0 z-10 -mx-4 -mb-6 flex flex-col gap-2 border-t border-garis bg-putih px-4 pb-4 pt-3">
          {bilahBawah}
        </div>
      ) : null}
    </>
  );
}
