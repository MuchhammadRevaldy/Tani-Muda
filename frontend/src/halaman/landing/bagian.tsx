/**
 * Bagian halaman depan di bawah hero [AG-54]: Masalah, Siklus Tani Muda (menggantikan tiga pilar),
 * cara kerja Pesan Sebelum Tanam, fitur pendukung, pembeli, tanya jawab, dan ajakan penutup.
 * Setiap bagian punya id (tautan navbar), latar berselang-seling embun-pagi dan putih dengan lengkung
 * bukit sebagai pemisah. Angka dari konfigurasi dan fungsi src/lib (D-08). Gambar hanya aset yang
 * sudah ada di public/ (ilustrasi, lencana, foto komoditas).
 */
import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChipStatus } from '../../komponen/chip-status';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon, IkonLingkaran, type NamaIkon } from '../../komponen/ikon';
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

const GAMBAR_MASALAH = [
  '/lencana/level-tunas.svg',
  '/lencana/level-benih.svg',
  '/lencana/tepat-waktu-7-hari.svg',
  '/lencana/panen-pertama.svg',
];

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
          <li
            key={m.judul}
            className="giliran flex gap-4 rounded-lg border border-garis bg-embun-pagi p-4 lg:flex-col lg:p-5"
            style={urutan(i)}
          >
            <img
              src={GAMBAR_MASALAH[i]}
              alt=""
              width={64}
              height={64}
              className="block h-16 w-16 flex-none"
            />
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-judul-bagian font-semibold">{m.judul}</h3>
              <p className="m-0 text-teks-pendukung">{m.isi}</p>
            </div>
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
      <Ikon nama={ikon} ukuran={40} tebal={2} className="relative" />
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
      <ol className="m-0 grid list-none p-0 lg:grid-cols-4">
        {SIKLUS.map((s, i) => (
          <li
            key={s.judul}
            className="giliran relative flex gap-4 pb-8 lg:flex-col lg:items-center lg:px-3 lg:pb-0"
            style={urutan(i)}
          >
            {i < SIKLUS.length - 1 ? (
              // Garis ke langkah berikutnya: tegak di HP (dari bawah medali), mendatar di desktop
              // (dari tengah medali ke tengah medali berikutnya). Tergambar bergiliran.
              <span
                aria-hidden="true"
                className="garis-tumbuh absolute bottom-0 left-10 top-20 w-1 -translate-x-1/2 rounded-full bg-limau lg:left-1/2 lg:top-12 lg:h-1 lg:w-full lg:translate-x-0"
                style={urutan(i + 1)}
              />
            ) : null}
            <div className="relative">
              <Medali ikon={s.ikon} warna={s.warna} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2 lg:items-center lg:text-center">
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
  const putaran = usePutaranLangkah(ref, langkah?.length ?? 0);
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
              <li
                key={l.judul}
                className="giliran relative flex gap-4 lg:flex-col lg:items-center lg:gap-3 lg:text-center"
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

const LEVEL = ['level-benih', 'level-tunas', 'level-daun', 'level-berbunga', 'level-panen-raya'];

function GambarFitur({ f }: { f: (typeof FITUR_LANDING)[number] }) {
  const gambar = (src: string, bulat?: boolean) => (
    <img
      src={src}
      alt=""
      width={56}
      height={56}
      className={cx('block h-14 w-14 flex-none object-cover', bulat && 'rounded-full')}
    />
  );
  switch (f) {
    case 'deteksi':
      return gambar('/lencana/kebun-terdokumentasi.svg');
    case 'cuaca':
      return gambar('/lencana/pengukur-teliti.svg');
    case 'stok':
      return gambar('/foto/komoditas/bayam.webp', true);
    case 'asisten':
      return <IkonLingkaran nama="info" besar />;
    case 'peta':
      return <IkonLingkaran nama="peta" besar />;
    case 'chat':
      return <IkonLingkaran nama="chat" besar />;
    case 'level':
      return (
        <span className="flex -space-x-3">
          {LEVEL.map((l) => (
            <img
              key={l}
              src={`/lencana/${l}.svg`}
              alt=""
              width={48}
              height={48}
              className="block h-12 w-12"
            />
          ))}
        </span>
      );
  }
}

export function BagianFitur() {
  return (
    <>
      <KepalaBagian id={judulIdBagian('fitur')} sapaan={t.sapaanFitur} judul={t.judulFitur} />
      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {FITUR_LANDING.map((f, i) => {
          const isi = t.fitur[f];
          return (
            <li
              key={f}
              className={cx(
                'giliran flex flex-col gap-4 rounded-lg border border-garis bg-putih p-5',
                f === 'level' && FITUR_LANDING.length % 3 === 1 && 'lg:col-span-3',
              )}
              style={urutan(i)}
            >
              <GambarFitur f={f} />
              <div className="flex flex-col gap-1">
                <h3 className="m-0 text-judul-bagian font-semibold">{isi.judul}</h3>
                <p className="m-0 text-teks-pendukung">{isi.isi}</p>
                {'ket' in isi ? (
                  <p className="m-0 flex items-start gap-2 pt-1 text-keterangan text-daun-tua">
                    <Ikon nama="pin" ukuran={20} className="mt-0.5" />
                    <span>{isi.ket}</span>
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
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
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
      <KepalaBagian id={judulIdBagian('tanyaJawab')} judul={t.judulFaq} ket={t.ketFaq} />
      <div className="lg:col-span-2">
        {d.konfigurasi ? (
          <FaqLipat
            butir={t.faq(
              d.konfigurasi.hari_kembali_uang_muka,
              d.konfigurasi.hari_kabar_gagal_panen,
            )}
          />
        ) : null}
      </div>
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
        <Link to="/masuk?peran=petani" className={kelasTombol('utama', true) + ' md:w-auto'}>
          {t.mulaiPetani}
        </Link>
        <Link to="/masuk?peran=pembeli" className={kelasTombol('sekunder', true) + ' md:w-auto'}>
          {t.sayaPembeli}
        </Link>
      </div>
    </div>
  );
}
