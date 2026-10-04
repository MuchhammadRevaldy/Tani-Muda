import type { ReactNode } from 'react';
import { cx } from './gabung-kelas';
import { HeaderPembeli, NavigasiBawah, Sidebar, type Akun, type Lencana } from './navigasi';

/**
 * Kerangka halaman petani (D-07):
 * - HP (< lg): satu kolom, padding 16px, navigasi bawah menempel.
 * - Desktop (≥ lg, 1024px): sidebar kiri 256px + konten maksimal 1200px.
 */
export function KerangkaPetani({
  akun,
  lencana,
  children,
  tanpaNav,
  className,
}: {
  akun: Akun;
  lencana?: Lencana;
  children: ReactNode;
  /** Halaman alur (Hitung) tidak memakai navigasi bawah di HP, sama dengan desain. */
  tanpaNav?: boolean;
  className?: string;
}) {
  return (
    <div className="flex min-h-layar bg-embun-pagi text-teks">
      <Sidebar akun={akun} lencana={lencana} className="sticky top-0 hidden h-screen lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className={cx('flex-1 px-4 pb-6 pt-2 lg:px-10 lg:pb-12 lg:pt-6', className)}>
          <div className="mx-auto flex max-w-konten flex-col gap-6">{children}</div>
        </main>
        {tanpaNav ? null : (
          <div className="sticky bottom-0 z-10 lg:hidden">
            <NavigasiBawah lencana={lencana} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Kerangka halaman pembeli: header atas + konten maksimal 1152px. Di HP menjadi satu kolom. */
export function KerangkaPembeli({
  namaUsaha,
  children,
}: {
  namaUsaha: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-layar bg-embun-pagi text-teks">
      <HeaderPembeli namaUsaha={namaUsaha} />
      <main className="mx-auto flex max-w-pembeli flex-col gap-6 px-4 pb-12 pt-6 lg:px-6">
        {children}
      </main>
    </div>
  );
}

/** Kerangka panel mentor/admin: desktop saja, tabel sederhana (D-07). */
export function KerangkaPanel({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <div className="min-h-layar bg-embun-pagi text-teks">
      <main className="mx-auto flex max-w-konten flex-col gap-6 px-10 pb-12 pt-6">
        <h1 className="m-0 text-judul-halaman font-semibold">{judul}</h1>
        {children}
      </main>
    </div>
  );
}
