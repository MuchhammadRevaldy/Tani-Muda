import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { Link, NavLink } from 'react-router-dom';
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

/** Navigasi bawah HP: 4 menu, label selalu tampil, lencana gelap (bukan merah). */
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
      className={cx(
        'grid grid-cols-4 gap-1 border-t border-garis bg-putih px-2 pt-2',
        'pb-[calc(theme(spacing.2)+env(safe-area-inset-bottom,0px))]',
        className,
      )}
    >
      {MENU_PETANI.map((m) => {
        const n = lencana[m.id];
        return (
          <NavLink
            key={m.id}
            to={m.ke}
            className={({ isActive }) =>
              cx(
                'fokus-cincin group flex min-h-nav-item flex-col items-center justify-center gap-1 rounded-md py-1 text-nav no-underline',
                isActive
                  ? 'font-semibold text-daun-tua hover:text-daun-tua'
                  : 'font-medium text-teks-pendukung hover:text-teks',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cx(
                    'relative grid h-8 w-nav-ikon place-items-center rounded-full',
                    isActive && 'bg-daun-lembut',
                  )}
                >
                  <Ikon nama={m.ikon} />
                  {n ? (
                    <span className="absolute -top-1.5 left-8 h-6 min-w-6 rounded-full border-2 border-putih bg-teks px-1 text-center text-nav font-semibold text-putih">
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

/** Menu akun di sidebar: Profil, Pengaturan notifikasi, Keluar. */
function MenuAkun({
  onTutup,
  onKeluar,
  akunLengkap,
}: {
  onTutup: () => void;
  onKeluar?: () => void;
  /** Nama dan keterangan lengkap, ditampilkan bila di tombol akun terpotong (layar sentuh). */
  akunLengkap?: Akun;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const tekan = (e: KeyboardEvent) => e.key === 'Escape' && onTutup();
    document.addEventListener('keydown', tekan);
    return () => document.removeEventListener('keydown', tekan);
  }, [onTutup]);
  const item =
    'fokus-cincin flex min-h-sentuh items-center rounded-sm px-3 font-medium text-teks no-underline hover:bg-embun-pagi hover:text-teks';
  return (
    <div
      ref={ref}
      role="menu"
      aria-label={teksKomponen.nav.menuAkun}
      className="absolute bottom-24 left-4 right-4 flex flex-col rounded-md border-1.5 border-garis-kuat bg-putih p-1.5"
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
      <Link role="menuitem" to="/profil" className={item} onClick={onTutup}>
        {teksNavigasi.profil}
      </Link>
      <Link role="menuitem" to="/profil/notifikasi" className={item} onClick={onTutup}>
        {teksNavigasi.pengaturanNotifikasi}
      </Link>
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
          'cursor-pointer border-0 bg-transparent text-left text-isi font-semibold text-tomat hover:text-tomat',
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
  className,
}: {
  akun: Akun;
  lencana?: Lencana;
  /** Untuk halaman /komponen dan tangkapan layar (papan 10 desktop). */
  menuTerbukaAwal?: boolean;
  onKeluar?: () => void;
  className?: string;
}) {
  const [terbuka, setTerbuka] = useState(menuTerbukaAwal);
  const refNama = useRef<HTMLSpanElement>(null);
  const refKet = useRef<HTMLSpanElement>(null);
  const terpotong = useTerpotong([refNama, refKet], akun.nama + akun.keterangan);
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
              className={({ isActive }) =>
                cx(
                  'fokus-cincin flex min-h-sentuh items-center gap-3 rounded-md px-3 no-underline',
                  isActive
                    ? 'bg-daun-lembut font-semibold text-daun-tua hover:text-daun-tua'
                    : 'font-medium text-teks-pendukung hover:bg-embun-pagi hover:text-teks',
                )
              }
            >
              <Ikon nama={m.ikon} />
              <span className="flex-1">{m.label}</span>
              {n ? (
                <span
                  aria-label={teksKomponen.nav.baru(n).replace(', ', '')}
                  className="h-6 min-w-6 rounded-full bg-teks px-1.5 text-center text-isi font-semibold text-putih"
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
          onTutup={() => setTerbuka(false)}
          onKeluar={onKeluar}
          akunLengkap={terpotong ? akun : undefined}
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
          type="button"
          aria-haspopup="menu"
          aria-expanded={terbuka}
          aria-label={teksKomponen.nav.bukaMenuAkun}
          aria-describedby={terpotong ? idLengkap : undefined}
          onClick={() => setTerbuka((x) => !x)}
          className="fokus-cincin flex min-h-nav-item w-full cursor-pointer items-center gap-3 rounded-md border border-garis bg-putih px-3 py-2 text-left text-isi text-teks"
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

/** Header pembeli (desktop): logo "untuk pembeli", 3 menu, nama usaha. Di HP menu digulir. */
export function HeaderPembeli({ namaUsaha }: { namaUsaha: string }) {
  const menu: { label: string; ke: string; akhir?: boolean }[] = [
    { label: teksNavigasi.pesananAktif, ke: '/pembeli', akhir: true },
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
        <span className="font-medium lg:order-last">{namaUsaha}</span>
        <nav
          aria-label={teksNavigasi.menuPembeli}
          className="flex w-full gap-1 overflow-x-auto lg:w-auto lg:flex-1"
        >
          {menu.map((m) => (
            <NavLink
              key={m.ke}
              to={m.ke}
              end={m.akhir}
              className={({ isActive }) =>
                cx(
                  'fokus-cincin inline-flex min-h-sentuh flex-none items-center rounded-md px-3.5 no-underline',
                  isActive
                    ? 'bg-daun-lembut font-semibold text-daun-tua hover:text-daun-tua'
                    : 'font-medium text-teks hover:bg-embun-pagi hover:text-teks',
                )
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
