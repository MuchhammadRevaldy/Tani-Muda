import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { teksKomponen } from '../teks/komponen';
import { teksNavigasi } from '../teks/navigasi';
import { Avatar } from './avatar';
import { cx } from './gabung-kelas';
import { Ikon, type NamaIkon } from './ikon';

export type MenuPetani = 'beranda' | 'kebun' | 'pesanan' | 'belajar';

export const MENU_PETANI: { id: MenuPetani; label: string; ikon: NamaIkon; ke: string }[] = [
  { id: 'beranda', label: teksNavigasi.beranda, ikon: 'beranda', ke: '/beranda' },
  { id: 'kebun', label: teksNavigasi.kebun, ikon: 'kebun', ke: '/kebun' },
  { id: 'pesanan', label: teksNavigasi.pesanan, ikon: 'pesanan', ke: '/pesanan' },
  { id: 'belajar', label: teksNavigasi.belajar, ikon: 'belajar', ke: '/belajar' },
];

export type Lencana = Partial<Record<MenuPetani, number>>;

const teksLencana = (n: number) => (n > 99 ? '99+' : String(n));

/** Navigasi bawah HP mengambang (D-59): 4 menu, label selalu tampil, lencana oranye tua (bukan merah). */
export function NavigasiBawah({
  lencana = {},
  className,
}: {
  lencana?: Lencana;
  className?: string;
}) {
  return (
    <nav
      aria-label={teksKomponen.nav.label}
      className={cx('grid grid-cols-4 gap-1 rounded-nav bg-putih p-2 shadow-kartu', className)}
    >
      {MENU_PETANI.map((m) => {
        const n = lencana[m.id];
        return (
          <NavLink
            key={m.id}
            to={m.ke}
            className={({ isActive }) =>
              cx(
                'fokus-cincin group flex min-h-nav-item flex-col items-center justify-center gap-0.5 rounded-sheet py-1 text-nav no-underline',
                isActive
                  ? 'bg-daun-lembut font-semibold text-daun-tua hover:text-daun-tua'
                  : 'font-medium text-teks-pendukung hover:text-teks',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative grid h-7 w-nav-ikon place-items-center">
                  <Ikon nama={m.ikon} tebal={isActive ? 1.9 : 1.7} />
                  {n ? (
                    <span className="absolute -top-1.5 left-8 h-6 min-w-6 rounded-full border-2 border-putih bg-tanah px-1 text-center text-nav font-semibold text-putih">
                      {teksLencana(n)}
                    </span>
                  ) : null}
                </span>
                <span>
                  {m.label}
                  {n ? <span className="sr-saja">{teksKomponen.nav.baru(n)}</span> : null}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

/** Logo Tani Muda (ikon kebun + nama). */
export function Logo({ besar, className }: { besar?: boolean; className?: string }) {
  return (
    <span
      className={cx(
        'flex items-center gap-2 font-semibold text-daun-tua',
        besar ? 'text-uang' : 'text-judul-bagian',
        className,
      )}
    >
      <Ikon nama="kebun" ukuran={besar ? 28 : 24} />
      <span>{teksNavigasi.namaAplikasi}</span>
    </span>
  );
}

export interface Akun {
  nama: string;
  /** Peran dan desa, mis. "Petani · Lembang". */
  keterangan: string;
}

/** Benar bila salah satu elemen teks terpotong elipsis (lebar isi melebihi lebar kotak). */
function useTerpotong(daftar: RefObject<HTMLElement | null>[], isi: string) {
  const [terpotong, setTerpotong] = useState(false);
  useLayoutEffect(() => {
    const ukur = () =>
      setTerpotong(daftar.some((r) => r.current && r.current.scrollWidth > r.current.clientWidth));
    ukur();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(ukur);
    daftar.forEach((r) => r.current && ro.observe(r.current));
    return () => ro.disconnect();
    // daftar berisi ref yang stabil; ukur ulang bila teks berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isi]);
  return terpotong;
}

/** Satu butir menu akun (tautan). */
export interface ButirMenuAkun {
  label: string;
  ke: string;
}

/** Butir menu akun petani (sidebar). */
const BUTIR_PETANI: ButirMenuAkun[] = [
  { label: teksNavigasi.profil, ke: '/profil' },
  { label: teksNavigasi.pengaturanNotifikasi, ke: '/profil/notifikasi' },
];

/**
 * Menu akun: butir tautan, garis, lalu Keluar (merah). Fokus pindah ke butir pertama saat dibuka;
 * Esc atau klik di luar menutup, dan Esc mengembalikan fokus ke tombol pembuka (`onTutup(true)`).
 * Dipakai sidebar petani dan header pembeli ([AG-23]).
 */
function MenuAkun({
  butir,
  onTutup,
  onKeluar,
  akunLengkap,
  className,
}: {
  butir: ButirMenuAkun[];
  onTutup: (kembalikanFokus?: boolean) => void;
  onKeluar?: () => void;
  /** Nama dan keterangan lengkap, ditampilkan bila di tombol akun terpotong (layar sentuh). */
  akunLengkap?: Akun;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const tekan = (e: KeyboardEvent) => e.key === 'Escape' && onTutup(true);
    const klikLuar = (e: MouseEvent) => {
      const sasaran = e.target as Node;
      // Klik di tombol pembuka ditangani tombol itu sendiri (buka/tutup).
      if (
        ref.current?.contains(sasaran) ||
        (sasaran as Element).closest?.('[aria-haspopup="menu"]')
      )
        return;
      onTutup();
    };
    document.addEventListener('keydown', tekan);
    document.addEventListener('mousedown', klikLuar);
    return () => {
      document.removeEventListener('keydown', tekan);
      document.removeEventListener('mousedown', klikLuar);
    };
  }, [onTutup]);
  const item =
    'fokus-cincin flex min-h-sentuh items-center rounded-sm px-3 font-medium text-teks no-underline hover:bg-embun-pagi hover:text-teks';
  return (
    <div
      ref={ref}
      role="menu"
      aria-label={teksKomponen.nav.menuAkun}
      className={cx(
        'absolute z-20 flex flex-col rounded-lg bg-putih p-1.5 shadow-kartu',
        className,
      )}
    >
      {akunLengkap ? (
        <>
          <div className="flex flex-col break-words px-3 py-2">
            <span className="font-semibold">{akunLengkap.nama}</span>
            <span className="text-keterangan text-teks-pendukung">{akunLengkap.keterangan}</span>
          </div>
          <div className="mx-1.5 my-1 h-px bg-garis" />
        </>
      ) : null}
      {butir.map((b) => (
        <Link key={b.ke} role="menuitem" to={b.ke} className={item} onClick={() => onTutup()}>
          {b.label}
        </Link>
      ))}
      <div className="mx-1.5 my-1 h-px bg-garis" />
      <button
        role="menuitem"
        type="button"
        onClick={() => {
          onTutup();
          onKeluar?.();
        }}
        className={cx(
          item,
          'cursor-pointer border-0 bg-transparent text-left text-isi font-semibold text-tomat-teks hover:text-tomat-teks',
        )}
      >
        {teksNavigasi.keluar}
      </button>
    </div>
  );
}

/** Sidebar desktop petani: logo, 4 menu, kartu akun dengan menu. */
export function Sidebar({
  akun,
  lencana = {},
  menuTerbukaAwal = false,
  onKeluar,
  menuAktif,
  className,
}: {
  akun: Akun;
  lencana?: Lencana;
  /** Menu yang ditandai aktif walau alamatnya lain (mis. alur Hitung di bawah Kebun). */
  menuAktif?: MenuPetani;
  /** Untuk halaman /komponen dan tangkapan layar (papan 10 desktop). */
  menuTerbukaAwal?: boolean;
  onKeluar?: () => void;
  className?: string;
}) {
  const [terbuka, setTerbuka] = useState(menuTerbukaAwal);
  const refNama = useRef<HTMLSpanElement>(null);
  const refKet = useRef<HTMLSpanElement>(null);
  const terpotong = useTerpotong([refNama, refKet], akun.nama + akun.keterangan);
  const refTombol = useRef<HTMLButtonElement>(null);
  const idLengkap = useId();
  return (
    <aside
      aria-label={teksNavigasi.menu}
      className={cx(
        'relative flex w-sidebar flex-none flex-col gap-6 border-r border-garis bg-putih px-4 py-6',
        className,
      )}
    >
      <Logo besar className="min-h-sentuh px-2" />
      <nav aria-label={teksKomponen.nav.label} className="flex flex-col gap-1">
        {MENU_PETANI.map((m) => {
          const n = lencana[m.id];
          return (
            <NavLink
              key={m.id}
              to={m.ke}
              aria-current={m.id === menuAktif ? 'page' : undefined}
              className={({ isActive }) =>
                cx(
                  'fokus-cincin flex min-h-sentuh items-center gap-3 rounded-full px-4 no-underline',
                  isActive || m.id === menuAktif
                    ? 'bg-daun-lembut font-semibold text-daun-tua hover:text-daun-tua'
                    : 'font-medium text-teks-pendukung hover:bg-embun-pagi hover:text-teks',
                )
              }
            >
              <Ikon nama={m.ikon} />
              <span className="flex-1">
                {m.label}
                {n ? <span className="sr-saja">{teksKomponen.nav.baru(n)}</span> : null}
              </span>
              {n ? (
                <span
                  aria-hidden="true"
                  className="h-6 min-w-6 rounded-full bg-tanah px-1.5 text-center text-isi font-semibold text-putih"
                >
                  {teksLencana(n)}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
      <div className="flex-1" />
      {terbuka ? (
        <MenuAkun
          butir={BUTIR_PETANI}
          onTutup={(kembali) => {
            setTerbuka(false);
            if (kembali) refTombol.current?.focus();
          }}
          onKeluar={onKeluar}
          akunLengkap={terpotong ? akun : undefined}
          className="bottom-24 left-4 right-4"
        />
      ) : null}
      <div className="group relative">
        {/* Teks lengkap saat kursor di atas tombol atau tombol difokus; di layar sentuh teks
            lengkap muncul di bagian atas menu akun. */}
        {terpotong && !terbuka ? (
          <div
            id={idLengkap}
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-0 right-0 mb-2 hidden flex-col break-words rounded-sm bg-teks px-3 py-2 text-putih group-focus-within:flex group-hover:flex"
          >
            <span className="font-semibold">{akun.nama}</span>
            <span className="text-keterangan">{akun.keterangan}</span>
          </div>
        ) : null}
        <button
          ref={refTombol}
          type="button"
          aria-haspopup="menu"
          aria-expanded={terbuka}
          aria-label={teksKomponen.nav.bukaMenuAkun}
          aria-describedby={terpotong ? idLengkap : undefined}
          onClick={() => setTerbuka((x) => !x)}
          className="fokus-cincin flex min-h-nav-item w-full cursor-pointer items-center gap-3 rounded-lg border border-garis bg-putih px-3 py-2 text-left text-isi text-teks"
        >
          <Avatar nama={akun.nama} ukuran={40} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span ref={refNama} className="truncate font-semibold">
              {akun.nama}
            </span>
            <span ref={refKet} className="truncate text-keterangan text-teks-pendukung">
              {akun.keterangan}
            </span>
          </span>
          <Ikon nama="panah-naik-turun" ukuran={20} className="text-teks-pendukung" />
        </button>
      </div>
    </aside>
  );
}

/** Header halaman HP: tombol kembali 48×48 dengan nama halaman asal. */
export function HeaderHalaman({
  kembaliKe,
  labelKembali,
  judul,
  keterangan,
  kanan,
}: {
  kembaliKe?: string;
  labelKembali?: string;
  judul?: ReactNode;
  keterangan?: ReactNode;
  kanan?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {kembaliKe ? (
        <Link
          to={kembaliKe}
          className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
        >
          <Ikon nama="panah-kiri" />
          <span>{labelKembali ?? teksNavigasi.kembali}</span>
        </Link>
      ) : null}
      {judul || kanan ? (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            {judul ? <h1 className="m-0 text-judul-halaman font-semibold">{judul}</h1> : null}
            {keterangan ? (
              <p className="m-0 text-keterangan text-teks-pendukung">{keterangan}</p>
            ) : null}
          </div>
          {kanan}
        </div>
      ) : null}
    </div>
  );
}

export type MenuPembeli = 'aktif' | 'riwayat' | 'pembayaran';

/** Butir menu akun pembeli ([AG-23]). */
const BUTIR_PEMBELI: ButirMenuAkun[] = [
  { label: teksNavigasi.profil, ke: '/pembeli/profil' },
  { label: teksNavigasi.dataUsaha, ke: '/pembeli/daftar' },
];

/** Tombol akun pembeli di kanan atas header: avatar, nama usaha, panah; membuka menu akun. */
function TombolAkunPembeli({
  namaUsaha,
  foto,
  onKeluar,
}: {
  namaUsaha: string;
  foto?: string | null;
  onKeluar?: () => void;
}) {
  const [terbuka, setTerbuka] = useState(false);
  const refTombol = useRef<HTMLButtonElement>(null);
  return (
    <div className="relative ml-auto lg:order-last lg:ml-0">
      <button
        ref={refTombol}
        type="button"
        aria-haspopup="menu"
        aria-expanded={terbuka}
        aria-label={teksKomponen.nav.bukaMenuAkunUsaha(namaUsaha)}
        onClick={() => setTerbuka((x) => !x)}
        className="fokus-cincin flex min-h-sentuh max-w-full cursor-pointer items-center gap-2 rounded-full border border-garis bg-putih py-1 pl-1 pr-2 text-left text-isi font-medium text-teks md:pr-3"
      >
        <Avatar nama={namaUsaha} foto={foto ?? null} ukuran={40} />
        {/* Di HP cukup avatar dan panah supaya muat satu baris dengan logo; nama ada di label. */}
        <span className="hidden min-w-0 truncate md:inline">{namaUsaha}</span>
        <Ikon nama="panah-naik-turun" ukuran={20} className="flex-none text-teks-pendukung" />
      </button>
      {terbuka ? (
        <MenuAkun
          butir={BUTIR_PEMBELI}
          onTutup={(kembali) => {
            setTerbuka(false);
            if (kembali) refTombol.current?.focus();
          }}
          onKeluar={onKeluar}
          className="right-0 top-full mt-2 w-sidebar max-w-[calc(100vw-theme(spacing.8))]"
        />
      ) : null}
    </div>
  );
}

/**
 * Header pembeli: logo "untuk pembeli", 3 menu, dan tombol akun (nama usaha) yang membuka menu
 * Profil, Data usaha, Keluar. Di HP menu digulir dan tombol akun tetap terlihat.
 */
export function HeaderPembeli({
  namaUsaha,
  foto,
  onKeluar,
}: {
  namaUsaha: string;
  foto?: string | null;
  onKeluar?: () => void;
}) {
  const { pathname } = useLocation();
  // Buat pesanan, bayar, dan periksa kiriman adalah bagian dari "Pesanan aktif" (papan 37, 38).
  const bagianAktif = /^\/pembeli(\/(pesanan|kiriman)(\/|$)|\/?$)/.test(pathname);
  const menu: { label: string; ke: string; akhir?: boolean; aktif?: boolean }[] = [
    { label: teksNavigasi.pesananAktif, ke: '/pembeli', akhir: true, aktif: bagianAktif },
    { label: teksNavigasi.riwayat, ke: '/pembeli/riwayat' },
    { label: teksNavigasi.pembayaran, ke: '/pembeli/pembayaran' },
  ];
  return (
    <header className="border-b border-garis bg-putih">
      <div className="mx-auto flex min-h-16 max-w-pembeli flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2 lg:px-6">
        <span className="flex items-center gap-2 text-judul-bagian font-semibold text-daun-tua">
          <Ikon nama="kebun" />
          <span>{teksNavigasi.namaAplikasi}</span>
          <span className="text-isi font-normal text-teks-pendukung">
            {teksNavigasi.untukPembeli}
          </span>
        </span>
        <TombolAkunPembeli namaUsaha={namaUsaha} foto={foto} onKeluar={onKeluar} />
        <nav
          aria-label={teksNavigasi.menuPembeli}
          className="flex w-full gap-1 overflow-x-auto lg:w-auto lg:flex-1"
        >
          {menu.map((m) => {
            // Menu aktif dihitung sendiri (termasuk halaman di bawahnya), lalu ditandai aria-current.
            const aktif = m.aktif ?? (m.akhir ? pathname === m.ke : pathname.startsWith(m.ke));
            return (
              <Link
                key={m.ke}
                to={m.ke}
                aria-current={aktif ? 'page' : undefined}
                className={cx(
                  'fokus-cincin inline-flex min-h-sentuh flex-none items-center rounded-full px-4 no-underline',
                  aktif
                    ? 'bg-daun-lembut font-semibold text-daun-tua hover:text-daun-tua'
                    : 'font-medium text-teks hover:bg-embun-pagi hover:text-teks',
                )}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
