/**
 * Bagian halaman depan di bawah hero [AG-54]: Masalah, Siklus Tani Muda (menggantikan tiga pilar),
 * cara kerja Pesan Sebelum Tanam, fitur pendukung, pembeli, tanya jawab, dan ajakan penutup.
 * Setiap bagian punya id (tautan navbar), latar berselang-seling embun-pagi dan putih dengan lengkung
 * bukit sebagai pemisah. Angka dari konfigurasi dan fungsi src/lib (D-08). Gambar hanya aset yang
 * sudah ada di public/ (ilustrasi, lencana, foto komoditas).
 */
import {
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { ChipStatus } from '../../komponen/chip-status';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon, type NamaIkon } from '../../komponen/ikon';
import { LabelKecil } from '../../komponen/label-kecil';
import { DaftarSyarat, FaqLipat } from '../../komponen/pelengkap';
import { PenggarisUmurTanam } from '../../komponen/penggaris-umur-tanam';
import { kelasTombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { CONTOH_LANDING } from '../../lib/contoh-landing';
import { teksLanding as t } from '../../teks/landing';
import { kelasWadah } from '../statis/kerangka-publik';
import { AngkaNaik } from './angka-naik';
import type { DataLanding } from './data-landing';
import { FITUR_LANDING, idBagian, type IdBagian } from './gulir';
import { usePutaranLangkah } from './putaran';

export type Latar = 'putih' | 'embun';

const KELAS_LATAR: Record<Latar, string> = { putih: 'bg-putih', embun: 'bg-embun-pagi' };
const ISI_LATAR: Record<Latar, string> = { putih: 'fill-putih', embun: 'fill-embun-pagi' };

/** Urutan gaya bergiliran (--urutan) untuk kelas `giliran` / `garis-tumbuh`. */
const urutan = (i: number) => ({ '--urutan': i }) as CSSProperties;

/** Lengkung bukit di atas bagian: warna bagian sebelumnya di atas, warna bagian ini di bawah. */
function PemisahBukit({ dari, ke, varian }: { dari: Latar; ke: Latar; varian: number }) {
  const d =
    varian % 2
      ? 'M0 22 C 260 58 560 60 860 34 S 1300 4 1440 30 V64 H0 Z'
      : 'M0 40 C 240 4 480 4 720 28 S 1200 64 1440 16 V64 H0 Z';
  return (
    <div aria-hidden="true" className={KELAS_LATAR[dari]}>
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className={cx('block h-10 w-full lg:h-16', ISI_LATAR[ke])}
      >
        <path d={d} />
      </svg>
    </div>
  );
}

/**
 * Bungkus satu bagian: pemisah bukit, lalu `<section>` berid (bisa difokus setelah tautan navbar
 * dipilih) dengan isi yang muncul saat digulir (D-61).
 */
export function BagianLanding({
  id,
  latar,
  urut,
  judulId,
  children,
}: {
  id: string;
  latar: Latar;
  urut: number;
  judulId?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PemisahBukit dari={latar === 'putih' ? 'embun' : 'putih'} ke={latar} varian={urut} />
      <section
        id={id}
        tabIndex={-1}
        aria-labelledby={judulId}
        className={cx('scroll-mt-18 outline-none', KELAS_LATAR[latar])}
      >
        <div
          className={cx(
            kelasWadah,
            'muncul-gulir flex flex-col gap-8 pb-14 pt-6 lg:gap-12 lg:pb-20',
          )}
        >
          {children}
        </div>
      </section>
    </>
  );
}

export const judulIdBagian = (k: IdBagian | 'ajakan') =>
  `judul-${k === 'ajakan' ? k : idBagian(k)}`;

function KepalaBagian({
  id,
  sapaan,
  judul,
  ket,
  nadaSapaan = 'daun',
  tengah,
}: {
  id: string;
  sapaan?: string;
  judul: string;
  ket?: string;
  nadaSapaan?: 'daun' | 'tanah';
  tengah?: boolean;
}) {
  return (
    <div
      className={cx('flex max-w-teks flex-col gap-3', tengah && 'mx-auto items-center text-center')}
    >
      {sapaan ? (
        <p
          className={cx(
            'm-0 font-semibold',
            nadaSapaan === 'daun' ? 'text-daun-tua' : 'text-tanah',
          )}
        >
          {sapaan}
        </p>
      ) : null}
      <h2 id={id} className="m-0 text-tampil-2 font-semibold tracking-rapat lg:text-tampil-4">
        {judul}
      </h2>
      {ket ? <p className="m-0 text-judul-bagian text-teks-pendukung">{ket}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------- Masalah

/** Ikon medali muka (masalah) dan belakang (jawaban Tani Muda) [AG-56]. */
const IKON_MASALAH: { muka: NamaIkon; belakang: NamaIkon }[] = [
  { muka: 'cari', belakang: 'belajar' },
  { muka: 'uang', belakang: 'luas' },
  { muka: 'jam', belakang: 'lonceng' },
  { muka: 'pesanan', belakang: 'kunci' },
];

/**
 * Kartu masalah [AG-57]: tetap menghadap depan. Disorot (perangkat berkursor), difokus papan ketik,
 * atau diketuk di HP: kartu terangkat sedikit dengan bayangan lembut, latar daun-lembut naik dari
 * bawah, teks masalah memudar ke atas lalu jawaban Tani Muda masuk dari bawah, dan medali berganti
 * dari oranye (ikon masalah) ke hijau (ikon jawaban) dengan memudar silang. Lepas: urutan terbalik.
 * Semua gerak di src/index.css (`.kartu-masalah`, `km-*`). Teks masalah dan jawaban menempati sel
 * grid yang sama, jadi tinggi kartu tidak berubah.
 */
function KartuMasalah({
  i,
  judul,
  isi,
  jawaban,
}: {
  i: number;
  judul: string;
  isi: string;
  jawaban: string;
}) {
  const [aktif, setAktif] = useState(false);
  const ikon = IKON_MASALAH[i] ?? { muka: 'info', belakang: 'centang' };
  // Ketukan hanya mengunci keadaan di layar sentuh; di perangkat berkursor cukup disorot.
  const ketuk = () => {
    if (typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover)').matches)
      return;
    setAktif((x) => !x);
  };
  return (
    <button
      type="button"
      aria-pressed={aktif}
      onClick={ketuk}
      className={cx(
        'kartu-masalah fokus-cincin relative block h-full w-full cursor-pointer rounded-lg border-0 bg-transparent p-0 text-left text-isi text-teks',
        aktif && 'aktif',
      )}
    >
      <span aria-hidden="true" className="km-bayang absolute inset-0 rounded-lg shadow-kartu" />
      <span className="relative flex h-full gap-4 overflow-hidden rounded-lg border border-garis bg-embun-pagi p-4 lg:flex-col lg:p-5">
        <span aria-hidden="true" className="km-isi absolute inset-0 bg-daun-lembut" />
        <span className="relative grid flex-none">
          <span className="km-medali-masalah col-start-1 row-start-1">
            <Medali ikon={ikon.muka} warna="oranye" />
          </span>
          <span aria-hidden="true" className="km-medali-jawaban col-start-1 row-start-1">
            <Medali ikon={ikon.belakang} warna="daun" />
          </span>
        </span>
        <span className="relative grid">
          <span className="km-masalah col-start-1 row-start-1 flex flex-col gap-1">
            <span className="text-judul-bagian font-semibold">{judul}</span>
            <span className="text-teks-pendukung">{isi}</span>
            <span className="flex items-center gap-1 pt-1 text-keterangan font-medium text-daun-tua">
              <span>{t.lihatJawaban}</span>
              <Ikon nama="panah-kanan" ukuran={18} />
            </span>
          </span>
          <span className="km-jawaban col-start-1 row-start-1 flex flex-col justify-center gap-1">
            <span className="text-keterangan font-semibold text-daun-tua">{t.jawabanTaniMuda}</span>
            <span className="text-judul-bagian font-semibold">{jawaban}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

export function BagianMasalah() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className="flex flex-col gap-6 lg:col-span-5">
        <KepalaBagian
          id={judulIdBagian('masalah')}
          sapaan={t.sapaanMasalah}
          judul={t.judulMasalah}
          nadaSapaan="tanah"
        />
        <div className="flex flex-col gap-2">
          <p className="m-0 text-tampil-5 font-bold tracking-rapat text-tanah lg:text-angka-besar">
            <AngkaNaik nilai={t.angkaMasalah} desimal={2} akhiran="%" />
          </p>
          <p className="m-0 text-judul-bagian">{t.ketAngkaMasalah}</p>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.sumberAngkaMasalah}</p>
        </div>
        <p className="m-0 text-judul-bagian text-teks-pendukung">{t.ketMasalah}</p>
      </div>
      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:col-span-7">
        {t.masalah.map((m, i) => (
          <li key={m.judul} className="giliran" style={urutan(i)}>
            <KartuMasalah i={i} judul={m.judul} isi={m.isi} jawaban={m.jawaban} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- Siklus Tani Muda

/**
 * Medali 3D seragam untuk keempat langkah siklus [AG-55]: lingkaran bergradasi (token `medali-*`),
 * kilap di atas, dan ikon garis putih dari komponen/ikon.tsx. Ukuran dan bingkai sama untuk semua.
 */
export type WarnaMedali = 'daun' | 'matahari' | 'limau' | 'oranye';
const KELAS_MEDALI: Record<WarnaMedali, string> = {
  daun: 'bg-medali-daun',
  matahari: 'bg-medali-matahari',
  limau: 'bg-medali-limau',
  oranye: 'bg-medali-oranye',
};

export function Medali({ ikon, warna }: { ikon: NamaIkon; warna: WarnaMedali }) {
  return (
    <span
      className={cx(
        'relative grid h-20 w-20 flex-none place-items-center overflow-hidden rounded-full border-4 border-putih text-putih shadow-ikon lg:h-24 lg:w-24',
        KELAS_MEDALI[warna],
      )}
    >
      <span
        aria-hidden="true"
        className="absolute left-3 right-3 top-1.5 h-6 rounded-full bg-putih opacity-30"
      />
      <Ikon nama={ikon} ukuran={40} tebal={2} className="ikon-medali relative" />
    </span>
  );
}

const SIKLUS: { ikon: NamaIkon; warna: WarnaMedali; judul: string; isi: string }[] = [
  { ikon: 'belajar', warna: 'daun', judul: t.belajar, isi: t.isiBelajar },
  { ikon: 'uang', warna: 'matahari', judul: t.hitung, isi: t.isiHitung },
  { ikon: 'kebun', warna: 'limau', judul: t.rawat, isi: t.isiRawat },
  { ikon: 'panen', warna: 'oranye', judul: t.jual, isi: t.isiJual },
];

export function BagianSiklus({ d }: { d: DataLanding }) {
  const contoh = d.hitung[0];
  return (
    <>
      <KepalaBagian
        id={judulIdBagian('siklus')}
        sapaan={t.sapaanSiklus}
        judul={t.judulPilar}
        ket={t.ketPilar}
      />
      <ol className="group/siklus m-0 grid list-none p-0 lg:grid-cols-4">
        {SIKLUS.map((s, i) => (
          <li
            key={s.judul}
            className="giliran group/langkah relative flex gap-4 pb-8 lg:flex-col lg:items-center lg:px-3 lg:pb-0"
            style={urutan(i)}
          >
            {i < SIKLUS.length - 1 ? (
              // Garis ke langkah berikutnya: tegak di HP (dari bawah medali), mendatar di desktop
              // (dari tengah medali ke tengah medali berikutnya). Tergambar bergiliran.
              <span
                aria-hidden="true"
                className="garis-tumbuh absolute bottom-0 left-10 top-20 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-limau lg:left-1/2 lg:top-12 lg:h-1 lg:w-full lg:translate-x-0"
                style={urutan(i + 1)}
              >
                {/* Cahaya yang mengalir di garis saat langkah ini disorot [AG-56]. */}
                <span className="aliran-cahaya absolute inset-y-0 left-0 w-1/3 rounded-full bg-putih opacity-0" />
              </span>
            ) : null}
            <div className="relative">
              {/* Alas yang tidak ikut meredup, supaya garis tidak terlihat menembus medali. */}
              <span aria-hidden="true" className="absolute inset-0 rounded-full bg-embun-pagi" />
              <div className="relative transition duration-cepat ease-keluar group-hover/siklus:opacity-50 group-hover/langkah:!opacity-100 group-hover/langkah:scale-110">
                <Medali ikon={s.ikon} warna={s.warna} />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2 transition duration-cepat ease-keluar group-hover/siklus:opacity-50 group-hover/langkah:!opacity-100 lg:items-center lg:text-center">
              <p className="m-0 font-semibold text-daun-tua">{t.langkahKe(i + 1)}</p>
              <h3 className="m-0 text-tampil-1 font-semibold">{s.judul}</h3>
              <p className="m-0 text-teks-pendukung">{s.isi}</p>
              {i === 1 && contoh ? (
                <p className="m-0 text-keterangan text-tanah">
                  {t.barisContohHitung(
                    contoh.komoditas.nama,
                    contoh.luasM2,
                    contoh.angka.titikImpasKg,
                    contoh.komoditas.satuan_panen,
                  )}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

// ---------------------------------------------------------------- Cara kerja

const LANGKAH: { ikon: NamaIkon; kelas: string }[] = [
  { ikon: 'pesanan', kelas: 'border-2 border-garis-kuat bg-putih text-teks' },
  { ikon: 'kunci', kelas: 'bg-tanah text-putih' },
  { ikon: 'kebun', kelas: 'border-2 border-daun-tua bg-putih text-daun-tua' },
  { ikon: 'panen', kelas: 'border-2 border-tanah bg-putih text-tanah' },
  { ikon: 'uang', kelas: 'bg-daun-tua text-putih' },
];

export function CaraKerja({ d }: { d: DataLanding }) {
  const langkah = d.konfigurasi
    ? t.langkah(d.konfigurasi.persen_uang_muka, d.konfigurasi.jam_periksa_rutin)
    : null;
  const ref = useRef<HTMLOListElement>(null);
  const [putaran, sorotLangkah] = usePutaranLangkah(ref, langkah?.length ?? 0);
  return (
    <>
      <KepalaBagian id={judulIdBagian('caraKerja')} sapaan={t.sapaanCara} judul={t.judulCara} />
      {langkah ? (
        <ol ref={ref} className="relative m-0 grid list-none gap-6 p-0 lg:grid-cols-5 lg:gap-4">
          {/* Garis penghubung: alur abu-abu, isi hijau yang berjalan dari langkah 1 ke 5 [AG-55].
              Tegak di HP, mendatar di desktop. */}
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-6 top-6 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-garis lg:bottom-auto lg:left-24 lg:right-24 lg:top-6 lg:h-1 lg:w-auto lg:translate-x-0"
          >
            <span
              className="isi-putaran absolute inset-0 rounded-full bg-limau"
              style={
                {
                  '--kemajuan': putaran.kemajuan,
                  transitionDuration: `${putaran.lamaMs}ms`,
                } as CSSProperties
              }
            />
          </span>
          {langkah.map((l, i) => {
            const sampai = putaran.langkah >= i;
            const aktif = putaran.langkah === i;
            return (
              // Disorot atau difokus: putaran berhenti dan garis melompat ke langkah ini [AG-56].
              <li
                key={l.judul}
                tabIndex={0}
                onMouseEnter={() => sorotLangkah(i)}
                onMouseLeave={() => sorotLangkah(null)}
                onFocus={() => sorotLangkah(i)}
                onBlur={() => sorotLangkah(null)}
                className="giliran fokus-cincin relative flex gap-4 rounded-md outline-none lg:flex-col lg:items-center lg:gap-3 lg:text-center"
                style={urutan(i + 1)}
              >
                <span className="relative grid h-12 w-12 flex-none place-items-center">
                  {/* Cahaya lembut di belakang lingkaran saat garis sampai. */}
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute inset-0 rounded-full bg-limau transition-[opacity,transform] duration-cepat ease-keluar',
                      sampai ? 'scale-150 opacity-30' : 'scale-100 opacity-0',
                    )}
                  />
                  <span
                    className={cx(
                      'relative grid h-12 w-12 place-items-center rounded-full transition-transform duration-cepat ease-keluar',
                      LANGKAH[i]?.kelas,
                      sampai ? 'scale-110' : 'scale-100',
                    )}
                  >
                    <Ikon nama={LANGKAH[i]?.ikon ?? 'centang'} />
                  </span>
                </span>
                <div className="flex flex-col gap-1">
                  <p className="m-0 text-teks-pendukung">{t.langkahKe(i + 1)}</p>
                  <h3
                    className={cx(
                      'm-0 text-judul-bagian',
                      aktif ? 'font-bold text-daun-tua' : 'font-semibold',
                    )}
                  >
                    {l.judul}
                  </h3>
                  <p className={cx('m-0', aktif ? 'font-semibold text-teks' : 'text-teks-pendukung')}>
                    {l.isi}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------- Fitur pendukung

const LEVEL = ['level-benih', 'level-tunas', 'level-daun', 'level-berbunga', 'level-panen-raya'] as const;

type FiturKartu = Exclude<(typeof FITUR_LANDING)[number], 'level'>;

/** Ikon garis untuk setiap kartu fitur [AG-55]; semua dari komponen/ikon.tsx. */
const IKON_FITUR: Record<FiturKartu, NamaIkon> = {
  deteksi: 'kamera',
  asisten: 'info',
  cuaca: 'matahari',
  peta: 'pin',
  stok: 'panen',
  chat: 'chat',
};

/**
 * Warna lembut kartu bergantian (urutan diagonal supaya kolom tidak sewarna). Lingkaran ikon memakai
 * warna lembut yang sama dengan cincin putih, ikonnya warna tua sekeluarga (kontras teks terjaga).
 */
const NADA_FITUR = [
  { kartu: 'bg-daun-lembut', ikon: 'bg-daun-lembut text-daun-tua' },
  { kartu: 'bg-matahari-lembut', ikon: 'bg-matahari-lembut text-matahari-teks' },
  { kartu: 'bg-tanah-lembut', ikon: 'bg-tanah-lembut text-tanah' },
] as const;
const URUT_NADA = [0, 1, 2, 1, 2, 0];

export function BagianFitur() {
  const kartu = FITUR_LANDING.filter((f): f is FiturKartu => f !== 'level');
  const level = FITUR_LANDING.includes('level');
  return (
    <>
      <KepalaBagian id={judulIdBagian('fitur')} sapaan={t.sapaanFitur} judul={t.judulFitur} />
      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {kartu.map((f, i) => {
          const isi = t.fitur[f];
          const nada = NADA_FITUR[URUT_NADA[i % URUT_NADA.length] ?? 0] ?? NADA_FITUR[0];
          return (
            // Disorot atau tautannya difokus: ikon beranimasi sesuai fitur (`fitur-*` di
            // src/index.css), latar sedikit lebih pekat, panah tautan bergeser masuk [AG-56].
            <li
              key={f}
              className={cx(
                'giliran group/fitur relative flex flex-col gap-4 overflow-hidden rounded-lg p-5',
                nada.kartu,
              )}
              style={urutan(i)}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-teks opacity-0 transition-opacity duration-cepat ease-keluar group-focus-within/fitur:opacity-5 group-hover/fitur:opacity-5"
              />
              <span
                className={cx(
                  'relative grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-full border-3 border-putih shadow-ikon',
                  nada.ikon,
                  `fitur-${f}`,
                )}
              >
                <span className="ikon-fitur relative">
                  <Ikon nama={IKON_FITUR[f]} ukuran={28} tebal={1.9} />
                </span>
                {f === 'deteksi' ? (
                  <span aria-hidden="true" className="kilat absolute inset-0 bg-putih opacity-0" />
                ) : null}
                {f === 'chat' ? (
                  <span
                    aria-hidden="true"
                    className="titik-ketik absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center gap-0.5 opacity-0"
                  >
                    {[0, 1, 2].map((n) => (
                      <span key={n} className="block h-1 w-1 rounded-full bg-current" />
                    ))}
                  </span>
                ) : null}
              </span>
              <div className="relative flex flex-1 flex-col gap-1">
                <h3 className="m-0 text-judul-bagian font-semibold">{isi.judul}</h3>
                <p className="m-0 text-teks">{isi.isi}</p>
                {'ket' in isi ? (
                  <p className="m-0 flex items-start gap-2 pt-1 text-keterangan text-daun-tua">
                    <Ikon nama="pin" ukuran={20} className="mt-0.5" />
                    <span>{isi.ket}</span>
                  </p>
                ) : null}
                <Link
                  to="/bantuan"
                  className="fokus-cincin mt-auto inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pt-2 font-semibold text-daun-tua no-underline"
                  aria-label={t.lihatCaranyaLabel(isi.judul)}
                >
                  <span>{t.lihatCaranya}</span>
                  <Ikon
                    nama="panah-kanan"
                    ukuran={18}
                    className="-translate-x-1 opacity-0 transition duration-cepat ease-keluar group-focus-within/fitur:translate-x-0 group-focus-within/fitur:opacity-100 group-hover/fitur:translate-x-0 group-hover/fitur:opacity-100"
                  />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      {level ? (
        <div
          className="giliran flex flex-col gap-5 rounded-lg border border-garis bg-putih p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6"
          style={urutan(kartu.length)}
        >
          <div className="flex max-w-teks flex-col gap-1">
            <h3 className="m-0 text-judul-bagian font-semibold">{t.fitur.level.judul}</h3>
            <p className="m-0 text-teks-pendukung">{t.fitur.level.isi}</p>
          </div>
          <ul className="m-0 grid list-none grid-cols-5 gap-2 p-0 lg:gap-4">
            {LEVEL.map((l, i) => (
              // Disorot: lencana terangkat, kilau tipis menyapu (dibatasi bentuk lencana lewat
              // mask), dan nama level muncul sebagai keterangan kecil [AG-56].
              <li key={l} className="group/lencana flex flex-col items-center gap-1 text-center">
                <span className="relative block transition-transform duration-cepat ease-keluar group-hover/lencana:-translate-y-1">
                  <img
                    src={`/lencana/${l}.svg`}
                    alt=""
                    width={64}
                    height={64}
                    className="block h-14 w-14 lg:h-16 lg:w-16"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      maskImage: `url(/lencana/${l}.svg)`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                    }}
                  >
                    <span className="kilau-lencana absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-putih opacity-0" />
                  </span>
                </span>
                <span className="text-keterangan text-teks-pendukung transition-opacity duration-cepat ease-keluar [@media(hover:hover)]:opacity-0 group-hover/lencana:opacity-100">
                  {t.namaLevel[i]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------- Pembeli

export function BagianPembeli({ d }: { d: DataLanding }) {
  const lebar = useLayarLebar();
  const c = d.pembeli;
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col gap-6">
        <KepalaBagian
          id={judulIdBagian('pembeli')}
          sapaan={t.sapaanPembeli}
          judul={t.judulPembeli}
          nadaSapaan="tanah"
        />
        <DaftarSyarat butir={[...t.keunggulan]} />
        {lebar ? (
          <Link to="/masuk?peran=pembeli" className={cx(kelasTombol('utama'), 'self-start')}>
            {t.daftarPembeli}
          </Link>
        ) : null}
      </div>
      {c ? (
        <div className="giliran flex flex-col gap-3 self-center" style={urutan(1)}>
          <article className="flex flex-col gap-3 rounded-lg border border-garis bg-putih p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="m-0 text-judul-bagian font-semibold">
                  {t.kartuPembeliJudul(c.komoditas.nama, CONTOH_LANDING.pembeli.kgPerMinggu)}
                </h3>
                <p className="m-0 text-teks-pendukung">{t.kartuPembeliKet}</p>
              </div>
              <ChipStatus status="uang-muka-ditahan" />
            </div>
            <PenggarisUmurTanam
              varian={lebar ? 'lebar' : 'hp'}
              hariIni={c.hariKe}
              hariPanen={c.resep.umurPanenHari}
              jadwal={c.pin}
              tampilkanDaftar={false}
              animasi
            />
          </article>
          <LabelKecil nada="contoh" className="self-start">
            {t.labelIlustrasi}
          </LabelKecil>
        </div>
      ) : null}
      {!lebar ? (
        <Link to="/masuk?peran=pembeli" className={kelasTombol('utama', true)}>
          {t.daftarPembeli}
        </Link>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- Tanya jawab

export function TanyaJawab({ d }: { d: DataLanding }) {
  const k = d.konfigurasi;
  const faq = k
    ? t.faq({
        persenUangMuka: k.persen_uang_muka,
        persenLayanan: k.persen_layanan,
        jamRutin: k.jam_periksa_rutin,
        jamSekali: k.jam_periksa_sekali_panen,
        hariKabar: k.hari_kabar_gagal_panen,
        hariKembali: k.hari_kembali_uang_muka,
      })
    : null;
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
      <KepalaBagian id={judulIdBagian('tanyaJawab')} judul={t.judulFaq} ket={t.ketFaq} />
      {faq ? (
        <div className="flex flex-col gap-8 lg:col-span-2">
          {(
            [
              [t.kelompokPetani, faq.petani],
              [t.kelompokPembeli, faq.pembeli],
            ] as const
          ).map(([judul, butir], i) => (
            <div key={judul} className="giliran flex flex-col gap-3" style={urutan(i)}>
              <p className="m-0 text-judul-bagian font-semibold text-daun-tua">{judul}</p>
              <FaqLipat butir={butir} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- Ajakan penutup

export function AjakanPenutup() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <img
        src="/ilustrasi/komoditas/sawi.svg"
        alt=""
        width={120}
        height={120}
        className="animate-goyang block h-24 w-24 lg:h-26 lg:w-26"
      />
      <div className="flex max-w-teks flex-col gap-3">
        <h2
          id={judulIdBagian('ajakan')}
          className="m-0 text-tampil-3 font-bold tracking-rapat lg:text-tampil-5"
        >
          {t.judulAjakan}
        </h2>
        <p className="m-0 text-judul-bagian text-teks-pendukung">{t.isiAjakan}</p>
      </div>
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
        {/* Kilau tipis menyapu tombol, tombol terangkat dengan bayangan cahaya token [AG-56]. */}
        <Link
          to="/masuk?peran=petani"
          className={cx(kelasTombol('utama', true), 'kilau-tombol md:w-auto hover:-translate-y-0.5')}
        >
          {t.mulaiPetani}
        </Link>
        <Link
          to="/masuk?peran=pembeli"
          className={cx(
            kelasTombol('sekunder', true),
            'kilau-tombol md:w-auto hover:-translate-y-0.5 hover:shadow-kartu-angkat',
          )}
        >
          {t.sayaPembeli}
        </Link>
      </div>
    </div>
  );
}
