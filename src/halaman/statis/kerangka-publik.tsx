/**
 * Kerangka halaman publik (papan 01; T4.32, T4.37): kepala dengan logo dan tombol Masuk (atau
 * "Buka aplikasi" bila sudah masuk), isi, dan kaki dengan tautan halaman statis. Dipakai halaman
 * depan dan halaman statis (aturan pakai, privasi, tentang, kontak, bantuan).
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { berandaPeran, useSesi } from '../../api/sesi';
import { cx } from '../../komponen/gabung-kelas';
import { Logo } from '../../komponen/navigasi';
import { kelasTombol } from '../../komponen/tombol';
import { teksLanding } from '../../teks/landing';
import { teksStatis } from '../../teks/statis';

/** Lebar isi halaman publik: 1152px di desktop, gutter 16px di HP. */
export const kelasWadah = 'mx-auto w-full max-w-pembeli px-4 lg:px-8';

export function KepalaPublik() {
  const { akun } = useSesi();
  const peran = akun?.pengguna.peran ?? null;
  return (
    <header className="border-b border-garis bg-putih">
      <div className={cx(kelasWadah, 'flex min-h-18 items-center justify-between gap-3')}>
        <Link
          to="/"
          className="fokus-cincin -ml-1 inline-flex min-h-sentuh items-center rounded-md px-1 no-underline"
        >
          <Logo besar />
        </Link>
        <Link
          to={akun ? berandaPeran(peran) : '/masuk'}
          className={cx(kelasTombol('sekunder'), 'min-h-sentuh px-5')}
        >
          {akun ? teksLanding.bukaAplikasi : teksLanding.masuk}
        </Link>
      </div>
    </header>
  );
}

const TAUTAN_KAKI = [
  { ke: '/tentang', label: teksStatis.tautanKaki.tentang },
  { ke: '/kontak', label: teksStatis.tautanKaki.kontak },
  { ke: '/privasi', label: teksStatis.tautanKaki.privasi },
  { ke: '/aturan-pakai', label: teksStatis.tautanKaki.aturanPakai },
  { ke: '/bantuan', label: teksStatis.tautanKaki.bantuan },
] as const;

export function KakiPublik() {
  return (
    <footer className="border-t border-garis bg-embun-pagi">
      <div
        className={cx(
          kelasWadah,
          'flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between',
        )}
      >
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="m-0 text-teks-pendukung">{teksLanding.slogan}</p>
        </div>
        <nav aria-label={teksStatis.navKaki}>
          <ul className="m-0 flex list-none flex-col gap-1 p-0 lg:flex-row lg:gap-6">
            {TAUTAN_KAKI.map((t) => (
              <li key={t.ke}>
                <Link
                  to={t.ke}
                  className="fokus-cincin inline-flex min-h-sentuh items-center whitespace-nowrap rounded-md font-medium text-daun-tua underline underline-offset-3"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export function KerangkaPublik({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-layar flex-col bg-embun-pagi text-teks">
      <KepalaPublik />
      <main className="flex flex-1 flex-col">{children}</main>
      <KakiPublik />
    </div>
  );
}
