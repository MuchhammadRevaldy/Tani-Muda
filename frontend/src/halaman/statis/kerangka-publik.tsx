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
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { berandaPeran, useSesi } from '../../api/sesi';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { Logo } from '../../komponen/navigasi';
import { teksLanding } from '../../teks/landing';
import { teksNavigasi } from '../../teks/navigasi';
import { teksStatis } from '../../teks/statis';
import {
  BAGIAN_LANDING,
  gulirKe,
  gulirKeAtas,
  idBagian,
  useBagianAktif,
  usePosisiGulir,
  type IdBagian,
} from '../landing/gulir';

/** Lebar isi halaman publik: 1152px di desktop, gutter 16px di HP. */
export const kelasWadah = 'mx-auto w-full max-w-pembeli px-4 lg:px-8';

const BERKAS_LOGO = '/logo/logo-tanda.svg';

/**
 * Logo navbar yang bisa bergerak [AG-56]: berkas logo asli yang sama dipotong (clip-path) menjadi
 * daun kiri, daun kanan, dan tunas (batang + tanah), sehingga saat diam tampil persis seperti logo.
 * Disorot: kedua daun bergoyang dan tunas memantul (src/index.css, hanya perangkat berkursor).
 * Klik di halaman depan menggulir halus ke hero.
 */
function LogoNavbar({ diLanding, kecil }: { diLanding: boolean; kecil: boolean }) {
  const potong = (kelas: string, klip: string) => (
    <img
      src={BERKAS_LOGO}
      alt=""
      aria-hidden="true"
      width={36}
      height={36}
      className={cx('absolute inset-0 block h-9 w-9', kelas)}
      style={{ clipPath: klip }}
    />
  );
  return (
    <Link
      to="/"
      onClick={(e) => {
        if (!diLanding) return;
        e.preventDefault();
        gulirKeAtas();
      }}
      className="logo-navbar fokus-cincin group -ml-1 inline-flex min-h-sentuh items-center rounded-md px-1 no-underline"
    >
      <span
        className={cx(
          'flex origin-left items-center gap-2 text-uang font-semibold text-daun-tua transition-transform duration-sedang ease-keluar',
          kecil && 'scale-90',
        )}
      >
        <span className="logo-tunas relative block h-9 w-9 flex-none">
          {potong('', 'inset(45% 0 0 0)')}
          {potong('logo-daun-kiri', 'polygon(0 0, 50% 0, 50% 49%, 0 49%)')}
          {potong('logo-daun-kanan', 'polygon(50% 0, 100% 0, 100% 49%, 50% 49%)')}
        </span>
        <span>{teksNavigasi.namaAplikasi}</span>
      </span>
    </Link>
  );
}

/** Label tautan yang berguling ke atas saat disorot, digantikan salinan hijau dari bawah. */
function LabelGuling({ teks, besar }: { teks: string; besar?: boolean }) {
  const gerak =
    'block transition-transform duration-cepat ease-keluar group-hover:-translate-y-full group-focus-visible:-translate-y-full';
  return (
    <span className={cx('relative block overflow-hidden', besar ? 'leading-7' : 'leading-6')}>
      <span className={gerak}>{teks}</span>
      <span aria-hidden="true" className={cx('absolute inset-x-0 top-full text-daun-tua', gerak)}>
        {teks}
      </span>
    </span>
  );
}

function TautanBagian({
  k,
  diLanding,
  aktif,
  saatPilih,
  besar,
  refLabel,
}: {
  k: IdBagian;
  diLanding: boolean;
  aktif: boolean;
  saatPilih?: () => void;
  besar?: boolean;
  refLabel?: (el: HTMLSpanElement | null) => void;
}) {
  const id = idBagian(k);
  const kelas = cx(
    'fokus-cincin group relative inline-flex min-h-sentuh items-center whitespace-nowrap rounded-md px-3 font-medium no-underline',
    besar ? 'w-full text-judul-bagian' : 'text-nav',
    aktif ? 'text-daun-tua' : 'text-teks',
  );
  const isi = (
    <>
      {aktif && !besar ? (
        // Tunas mini dari logo tumbuh di atas tautan aktif, lalu bergoyang pelan [AG-56].
        <img
          key={k}
          src={BERKAS_LOGO}
          alt=""
          aria-hidden="true"
          width={14}
          height={14}
          className="tunas-mini absolute -top-1 left-1/2 block h-3.5 w-3.5"
        />
      ) : null}
      <span ref={refLabel}>
        <LabelGuling teks={teksLanding.bagian[k]} besar={besar} />
      </span>
    </>
  );
  if (!diLanding)
    return (
      <Link to={`/#${id}`} className={kelas} onClick={saatPilih}>
        {isi}
      </Link>
    );
  // Di halaman depan: gulir saja, alamat tidak diubah menjadi #bagian [AG-56].
  const klik = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    saatPilih?.();
    gulirKe(id);
  };
  return (
    <a href={`#${id}`} className={kelas} aria-current={aktif ? 'true' : undefined} onClick={klik}>
      {isi}
    </a>
  );
}

/**
 * Garis hijau di bawah tautan: berada di bawah tautan aktif, meluncur ke tautan yang disorot,
 * dan kembali saat kursor keluar navbar. Posisi lewat transform (translateX + scaleX dari lebar
 * dasar 96px) supaya hanya transform yang bergerak.
 */
function usePenandaGeser(target: IdBagian | null) {
  const label = useRef(new Map<IdBagian, HTMLSpanElement>());
  const wadah = useRef<HTMLUListElement>(null);
  const [posisi, setPosisi] = useState<{ x: number; w: number } | null>(null);
  const ukur = useCallback(() => {
    const el = target ? label.current.get(target) : null;
    const ul = wadah.current;
    if (!el || !ul) return setPosisi(null);
    const a = el.getBoundingClientRect();
    const b = ul.getBoundingClientRect();
    setPosisi({ x: a.left - b.left, w: a.width });
  }, [target]);
  useLayoutEffect(() => {
    ukur();
    if (typeof ResizeObserver === 'undefined' || !wadah.current) return;
    const ro = new ResizeObserver(ukur);
    ro.observe(wadah.current);
    document.fonts?.ready.then(ukur).catch(() => undefined);
    return () => ro.disconnect();
  }, [ukur]);
  const daftarkan = useCallback(
    (k: IdBagian) => (el: HTMLSpanElement | null) => {
      if (el) label.current.set(k, el);
      else label.current.delete(k);
    },
    [],
  );
  return [wadah, daftarkan, posisi] as const;
}

/** Kemajuan gulir 0..1 ditulis langsung ke variabel CSS (tanpa render ulang tiap bingkai). */
function useGarisProgres() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let bingkai = 0;
    const tulis = () => {
      bingkai = 0;
      const maks = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.style.setProperty('--kemajuan-gulir', String(maks > 0 ? window.scrollY / maks : 0));
    };
    const saatGulir = () => {
      if (!bingkai) bingkai = requestAnimationFrame(tulis);
    };
    tulis();
    window.addEventListener('scroll', saatGulir, { passive: true });
    window.addEventListener('resize', saatGulir);
    return () => {
      window.removeEventListener('scroll', saatGulir);
      window.removeEventListener('resize', saatGulir);
      if (bingkai) cancelAnimationFrame(bingkai);
    };
  }, []);
  return ref;
}

/** Tombol Masuk: latar hijau menyapu dari kiri, teks menjadi putih, panah kecil masuk dari kiri. */
function TombolMasuk({ ke, label }: { ke: string; label: string }) {
  const tukar = 'col-start-1 row-start-1 transition-opacity duration-cepat ease-keluar';
  return (
    <Link
      to={ke}
      className="fokus-cincin group relative inline-flex min-h-sentuh items-center gap-1 overflow-hidden rounded-full border-2 border-teks bg-putih px-5 font-semibold no-underline transition-transform duration-cepat ease-keluar active:translate-y-px"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left scale-x-0 bg-daun-tua transition-transform duration-cepat ease-keluar group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      <span className="relative grid">
        <span className={cx(tukar, 'text-teks group-hover:opacity-0 group-focus-visible:opacity-0')}>
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cx(tukar, 'text-putih opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100')}
        >
          {label}
        </span>
      </span>
      <Ikon
        nama="panah-kanan"
        ukuran={18}
        className="relative -translate-x-2 text-putih opacity-0 transition duration-cepat ease-keluar group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      />
    </Link>
  );
}

/** Tiga garis yang berubah menjadi tanda silang. */
function IkonMenu({ buka }: { buka: boolean }) {
  const garis = 'absolute left-0 top-1/2 h-0.5 w-5 rounded-full bg-current transition duration-cepat ease-keluar';
  return (
    <span aria-hidden="true" className="relative block h-5 w-5">
      <span className={cx(garis, buka ? 'rotate-45' : '-translate-y-1.5')} />
      <span className={cx(garis, buka ? 'opacity-0' : 'opacity-100')} />
      <span className={cx(garis, buka ? '-rotate-45' : 'translate-y-1.5')} />
    </span>
  );
}

export function KepalaPublik() {
  const { akun } = useSesi();
  const peran = akun?.pengguna.peran ?? null;
  const diLanding = useLocation().pathname === '/';
  const [tergulir] = usePosisiGulir();
  const aktif = useBagianAktif(diLanding);
  const [sorot, setSorot] = useState<IdBagian | null>(null);
  const [wadahPenanda, daftarkanLabel, posisiPenanda] = usePenandaGeser(sorot ?? aktif);
  const progres = useGarisProgres();
  const [menuBuka, setMenuBuka] = useState(false);
  const tombolMenu = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const idPanel = useId();
  const putih = tergulir || menuBuka;

  const tutupMenu = (kembalikanFokus: boolean) => {
    setMenuBuka(false);
    if (kembalikanFokus) tombolMenu.current?.focus();
  };

  useEffect(() => {
    if (!menuBuka) return;
    panel.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    const saatTombol = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuBuka(false);
      tombolMenu.current?.focus();
    };
    document.addEventListener('keydown', saatTombol);
    return () => document.removeEventListener('keydown', saatTombol);
  }, [menuBuka]);

  return (
    <header className="sticky top-0 z-30 h-18">
      {/* Latar putih berbayang yang muncul dan menyusut saat digulir (transform saja), dengan garis
          progres gulir limau di tepi bawahnya [AG-56]. */}
      <div
        aria-hidden="true"
        className={cx(
          'absolute inset-0 origin-top border-b border-garis bg-putih shadow-ikon transition duration-sedang ease-keluar',
          putih ? 'opacity-100' : 'opacity-0',
          tergulir && !menuBuka ? 'scale-y-75' : 'scale-y-100',
        )}
      >
        <span
          ref={progres}
          className="garis-progres absolute bottom-0 left-0 h-0.5 w-full origin-left bg-limau"
        />
      </div>
      <div
        className={cx(
          kelasWadah,
          'relative flex h-18 items-center justify-between gap-3 transition-transform duration-sedang ease-keluar',
          tergulir && !menuBuka && '-translate-y-2',
        )}
      >
        <LogoNavbar diLanding={diLanding} kecil={tergulir && !menuBuka} />
        <nav
          aria-label={teksLanding.navBagian}
          className="hidden lg:block"
          onMouseLeave={() => setSorot(null)}
        >
          <ul ref={wadahPenanda} className="relative m-0 flex list-none items-center gap-1 p-0">
            {BAGIAN_LANDING.map((k) => (
              <li key={k} onMouseEnter={() => setSorot(k)} onFocus={() => setSorot(k)} onBlur={() => setSorot(null)}>
                <TautanBagian
                  k={k}
                  diLanding={diLanding}
                  aktif={aktif === k}
                  refLabel={daftarkanLabel(k)}
                />
              </li>
            ))}
            <li
              aria-hidden="true"
              className={cx(
                'penanda-geser pointer-events-none absolute bottom-1 left-0 h-0.5 w-24 origin-left rounded-full bg-daun-tua',
                posisiPenanda ? 'opacity-100' : 'opacity-0',
              )}
              style={
                posisiPenanda
                  ? {
                      transform: `translateX(${posisiPenanda.x}px) scaleX(${posisiPenanda.w / 96})`,
                    }
                  : undefined
              }
            />
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <TombolMasuk
            ke={akun ? berandaPeran(peran) : '/masuk'}
            label={akun ? teksLanding.bukaAplikasi : teksLanding.masuk}
          />
          <button
            ref={tombolMenu}
            type="button"
            className="fokus-cincin grid h-sentuh w-sentuh cursor-pointer place-items-center rounded-full border-0 bg-transparent text-teks lg:hidden"
            aria-expanded={menuBuka}
            aria-controls={idPanel}
            aria-label={menuBuka ? teksLanding.tutupMenu : teksLanding.bukaMenu}
            onClick={() => (menuBuka ? tutupMenu(true) : setMenuBuka(true))}
          >
            <IkonMenu buka={menuBuka} />
          </button>
        </div>
      </div>
      {menuBuka ? (
        <div
          ref={panel}
          id={idPanel}
          className="animate-dropdown-muncul absolute inset-x-0 top-full border-t border-garis bg-putih shadow-kartu lg:hidden"
        >
          <nav aria-label={teksLanding.navBagian} className={cx(kelasWadah, 'py-3')}>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {BAGIAN_LANDING.map((k, i) => (
                <li
                  key={k}
                  className="muncul-bertahap"
                  style={{ '--urutan': i } as CSSProperties}
                >
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
                {/* Garis bawah tumbuh dari kiri saat disorot atau difokus [AG-56]. */}
                <Link
                  to={t.ke}
                  className="tautan-kaki fokus-cincin inline-flex min-h-sentuh items-center whitespace-nowrap rounded-md font-medium text-daun-tua no-underline"
                >
                  <span className="relative">{t.label}</span>
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
