/**
 * Kerangka halaman publik (papan 01; T4.32, T4.37): navbar, isi, dan kaki dengan tautan halaman
 * statis. Dipakai halaman depan dan halaman statis (aturan pakai, privasi, tentang, kontak, bantuan).
 *
 * Navbar [AG-54]: lengket di atas; logo, tautan ke setiap bagian halaman depan, dan tombol Masuk (atau
 * "Buka aplikasi" bila sudah masuk). Di halaman depan tautan menggulir halus dan bagian yang sedang
 * terlihat bergaya aktif; di halaman statis tautan menuju /#id-bagian. Latar putih dan bayangan
 * halus muncul setelah digulir. Di bawah 1024px tautan dilipat ke tombol menu yang membuka panel
 * (tutup lewat tombol tutup, Esc, atau memilih tautan; fokus kembali ke tombol menu).
 */
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { berandaPeran, useSesi } from '../../api/sesi';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { Logo } from '../../komponen/navigasi';
import { kelasTombol } from '../../komponen/tombol';
import { teksLanding } from '../../teks/landing';
import { teksStatis } from '../../teks/statis';
import {
  BAGIAN_LANDING,
  gulirKe,
  idBagian,
  useBagianAktif,
  usePosisiGulir,
  type IdBagian,
} from '../landing/gulir';

/** Lebar isi halaman publik: 1152px di desktop, gutter 16px di HP. */
export const kelasWadah = 'mx-auto w-full max-w-pembeli px-4 lg:px-8';

function TautanBagian({
  k,
  diLanding,
  aktif,
  saatPilih,
  besar,
}: {
  k: IdBagian;
  diLanding: boolean;
  aktif: boolean;
  saatPilih?: () => void;
  besar?: boolean;
}) {
  const id = idBagian(k);
  const kelas = cx(
    'fokus-cincin inline-flex min-h-sentuh items-center whitespace-nowrap rounded-md px-3 font-medium no-underline',
    besar ? 'w-full text-judul-bagian' : 'text-nav',
    aktif ? 'bg-daun-lembut text-daun-tua' : 'text-teks hover:text-daun-tua',
  );
  const label = teksLanding.bagian[k];
  if (!diLanding)
    return (
      <Link to={`/#${id}`} className={kelas} onClick={saatPilih}>
        {label}
      </Link>
    );
  const klik = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    saatPilih?.();
    history.replaceState(null, '', `#${id}`);
    gulirKe(id);
  };
  return (
    <a href={`#${id}`} className={kelas} aria-current={aktif ? 'true' : undefined} onClick={klik}>
      {label}
    </a>
  );
}

export function KepalaPublik() {
  const { akun } = useSesi();
  const peran = akun?.pengguna.peran ?? null;
  const diLanding = useLocation().pathname === '/';
  const [tergulir] = usePosisiGulir();
  const aktif = useBagianAktif(diLanding);
  const [menuBuka, setMenuBuka] = useState(false);
  const tombolMenu = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const idPanel = useId();

  const tutupMenu = (kembalikanFokus: boolean) => {
    setMenuBuka(false);
    if (kembalikanFokus) tombolMenu.current?.focus();
  };

  useEffect(() => {
    if (!menuBuka) return;
    panel.current?.querySelector<HTMLElement>('a')?.focus();
    const saatTombol = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuBuka(false);
      tombolMenu.current?.focus();
    };
    document.addEventListener('keydown', saatTombol);
    return () => document.removeEventListener('keydown', saatTombol);
  }, [menuBuka]);

  const masuk = (
    <Link
      to={akun ? berandaPeran(peran) : '/masuk'}
      className={cx(kelasTombol('sekunder'), 'min-h-sentuh px-5')}
    >
      {akun ? teksLanding.bukaAplikasi : teksLanding.masuk}
    </Link>
  );

  return (
    <header
      className={cx(
        'sticky top-0 z-30 border-b',
        tergulir || menuBuka
          ? 'border-garis bg-putih shadow-ikon'
          : 'border-transparent bg-embun-pagi',
      )}
    >
      <div className={cx(kelasWadah, 'flex min-h-18 items-center justify-between gap-3')}>
        <Link
          to="/"
          className="fokus-cincin -ml-1 inline-flex min-h-sentuh items-center rounded-md px-1 no-underline"
        >
          <Logo besar />
        </Link>
        <nav aria-label={teksLanding.navBagian} className="hidden lg:block">
          <ul className="m-0 flex list-none items-center gap-1 p-0">
            {BAGIAN_LANDING.map((k) => (
              <li key={k}>
                <TautanBagian k={k} diLanding={diLanding} aktif={aktif === k} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {masuk}
          <button
            ref={tombolMenu}
            type="button"
            className="fokus-cincin grid h-sentuh w-sentuh cursor-pointer place-items-center rounded-full border-0 bg-transparent text-teks lg:hidden"
            aria-expanded={menuBuka}
            aria-controls={idPanel}
            aria-label={menuBuka ? teksLanding.tutupMenu : teksLanding.bukaMenu}
            onClick={() => (menuBuka ? tutupMenu(true) : setMenuBuka(true))}
          >
            <Ikon nama={menuBuka ? 'silang' : 'menu'} />
          </button>
        </div>
      </div>
      {menuBuka ? (
        <div
          ref={panel}
          id={idPanel}
          className="animate-dropdown-muncul border-t border-garis bg-putih shadow-kartu lg:hidden"
        >
          <nav aria-label={teksLanding.navBagian} className={cx(kelasWadah, 'py-3')}>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {BAGIAN_LANDING.map((k) => (
                <li key={k}>
                  <TautanBagian
                    k={k}
                    diLanding={diLanding}
                    aktif={aktif === k}
                    besar
                    saatPilih={() => tutupMenu(false)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

const TAUTAN_KAKI = [
  { ke: '/tentang', label: teksStatis.tautanKaki.tentang },
  { ke: '/bantuan', label: teksStatis.tautanKaki.bantuan },
  { ke: '/kontak', label: teksStatis.tautanKaki.kontak },
  { ke: '/aturan-pakai', label: teksStatis.tautanKaki.aturanPakai },
  { ke: '/privasi', label: teksStatis.tautanKaki.privasi },
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
