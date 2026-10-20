/**
 * Hero halaman depan (papan Halaman depan D-59): judul, ajakan "Mulai sebagai petani" / "Saya pembeli"
 * (ke Masuk dengan peran terisi), ilustrasi komoditas contoh di lingkaran putus-putus, dan ringkasan
 * contoh perhitungan (modal, umur panen, titik impas, perkiraan untung) yang dihitung dari resep
 * contoh (D-08).
 *
 * [AG-55] Kalimat "Panduan sudah siap …" dihapus. Daun sawi tumbuh bergiliran lalu bergoyang (di
 * dalam SVG), dan paling banyak enam aset melayang pelan di sekitar ilustrasi dengan kedalaman
 * berbeda (ukuran, opacity, kecepatan), tidak di atas teks.
 */
import { Link } from 'react-router-dom';
import { cx } from '../../komponen/gabung-kelas';
import { IkonLingkaran, type NamaIkon } from '../../komponen/ikon';
import { IlustrasiKomoditas } from '../../komponen/ilustrasi';
import { LabelKecil } from '../../komponen/label-kecil';
import { kelasTombol } from '../../komponen/tombol';
import { formatRupiah } from '../../lib/format';
import { teksLanding as t } from '../../teks/landing';
import { animasiMati } from '../../lib/gerak';
import { teksUmum } from '../../teks/umum';
import { kelasWadah } from '../statis/kerangka-publik';
import type { DataLanding } from './data-landing';

function BarisAngka({
  ikon,
  label,
  nilai,
  uang,
  keterangan,
}: {
  ikon: NamaIkon;
  label: string;
  nilai: string;
  uang?: boolean;
  keterangan?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <IkonLingkaran nama={ikon} besar />
      <div className="flex min-w-0 flex-col">
        <dt className="text-teks-pendukung">{label}</dt>
        <dd className={cx('m-0 text-uang font-semibold tabular-nums', uang && 'text-tanah')}>
          {nilai}
        </dd>
        {keterangan ? <dd className="m-0 text-teks-pendukung">{keterangan}</dd> : null}
      </div>
    </div>
  );
}

/** Aset melayang di sekitar lingkaran ilustrasi; posisi dalam persen wadah ilustrasi. */
const MELAYANG: { src: string; kelas: string; durasi: string; jeda: string }[] = [
  { src: '/ilustrasi/komoditas/tomat.svg', kelas: 'left-0 top-6 h-14 w-14', durasi: '6.5s', jeda: '-1s' },
  { src: '/ilustrasi/melayang/daun.svg', kelas: 'right-2 top-2 h-10 w-10 opacity-80', durasi: '5.2s', jeda: '-2.4s' },
  { src: '/ilustrasi/melayang/koin.svg', kelas: 'right-0 top-1/2 h-12 w-12', durasi: '7s', jeda: '-3.1s' },
  { src: '/ilustrasi/komoditas/cabai-rawit.svg', kelas: 'bottom-4 right-6 h-16 w-16', durasi: '6s', jeda: '-0.5s' },
  { src: '/ilustrasi/melayang/tetes.svg', kelas: 'bottom-10 left-2 h-9 w-9 opacity-70', durasi: '4.8s', jeda: '-1.7s' },
  { src: '/ilustrasi/komoditas/selada.svg', kelas: 'bottom-0 left-1/4 h-11 w-11 opacity-90', durasi: '5.8s', jeda: '-4s' },
];

function Contoh({ d }: { d: NonNullable<DataLanding['petani']> }) {
  return (
    <>
      <div className="relative mx-auto aspect-square w-full max-w-pilihan-kotak lg:col-span-4 lg:max-w-none">
        <div
          aria-hidden="true"
          className="absolute inset-5 rounded-full border-2 border-dashed border-oranye-terang bg-tanah-lembut"
        />
        {d.komoditas.id === 'sawi' && !animasiMati() ? (
          // Daun bergoyang pelan; animasinya di dalam SVG dan mati saat gerak dikurangi (D-61).
          <img
            src="/ilustrasi/sawi-bergerak.svg"
            alt="Ilustrasi sawi hijau"
            width={420}
            height={420}
            className="relative block h-full w-full"
          />
        ) : (
          <IlustrasiKomoditas
            nama={d.komoditas.id}
            ukuran={420}
            className="relative h-full w-full"
          />
        )}
        {MELAYANG.map((m) => (
          <img
            key={m.src}
            src={m.src}
            alt=""
            aria-hidden="true"
            className={cx('pointer-events-none absolute block animate-melayang', m.kelas)}
            style={{ animationDuration: m.durasi, animationDelay: m.jeda }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-5 lg:col-span-3">
        <p className="m-0 text-teks-pendukung">
          <span>{t.contohPerhitungan}</span>
          <span>{' · ' + t.ringkasContoh(d.komoditas.nama, d.luasM2)}</span>
        </p>
        <dl className="m-0 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-1">
          {d.angka ? (
            <BarisAngka ikon="uang" label={t.modal} nilai={formatRupiah(d.angka.modal)} uang />
          ) : null}
          <BarisAngka ikon="kalender" label={t.panen} nilai={t.hariKe(d.resep.umurPanenHari)} />
          {d.angka ? (
            <>
              <BarisAngka ikon="luas" label={t.titikImpas} nilai={t.kg(d.angka.titikImpasKg)} />
              <BarisAngka
                ikon="panen"
                label={t.perkiraanUntung}
                nilai={formatRupiah(d.angka.untung)}
                keterangan={t.kalauPanen(d.angka.perkiraanKg)}
              />
            </>
          ) : null}
        </dl>
        {d.resep.contoh ? (
          <LabelKecil nada="contoh" className="self-start lg:whitespace-nowrap">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : null}
      </div>
    </>
  );
}

export function Hero({ d }: { d: DataLanding }) {
  return (
    <section
      className={cx(kelasWadah, 'grid items-center gap-10 py-8 lg:grid-cols-12 lg:gap-8 lg:py-16')}
    >
      <div className="flex flex-col gap-5 lg:col-span-5 lg:gap-6">
        <LabelKecil nada="sorot" className="max-w-pilihan-kotak">
          {t.sapaan}
        </LabelKecil>
        <h1 className="m-0 text-tampil-3 font-bold tracking-rapat lg:text-tampil-5">{t.judul}</h1>
        <p className="m-0 text-judul-bagian text-teks-pendukung">{t.isi}</p>
        <div className="flex flex-col gap-3 lg:flex-row">
          <Link to="/masuk?peran=petani" className={kelasTombol('utama', true) + ' lg:w-auto'}>
            {t.mulaiPetani}
          </Link>
          <Link to="/masuk?peran=pembeli" className={kelasTombol('sekunder', true) + ' lg:w-auto'}>
            {t.sayaPembeli}
          </Link>
        </div>
      </div>
      {d.petani ? <Contoh d={d.petani} /> : null}
    </section>
  );
}
