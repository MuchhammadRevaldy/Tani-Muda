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
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon, type NamaIkon } from '../../komponen/ikon';
import { IlustrasiKomoditas } from '../../komponen/ilustrasi';
import { LabelKecil } from '../../komponen/label-kecil';
import { kelasTombol } from '../../komponen/tombol';
import { formatRupiah } from '../../lib/format';
import { teksLanding as t } from '../../teks/landing';
import { animasiMati } from '../../lib/gerak';
import { teksUmum } from '../../teks/umum';
import { kelasWadah } from '../statis/kerangka-publik';
import type { DataLanding } from './data-landing';
import { geraknyaDikurangi } from './gulir';

export type GerakIkon = 'koin' | 'kalender' | 'impas' | 'keranjang';

/**
 * Satu baris contoh perhitungan [AG-56]. Disorot (perangkat berkursor): lingkaran ikon terisi dari
 * bawah seperti air naik, ikon bergerak sesuai maknanya (`gerak-*` di src/index.css), angka
 * berhitung ulang dari nol, dan satu baris penjelasan memudar masuk. Ruang baris penjelasan sudah
 * disediakan, jadi tata letak tidak bergeser. Baris lain meredup lewat grup `daftar` di induknya.
 */
function BarisAngka({
  ikon,
  gerak,
  label,
  angka,
  format,
  uang,
  keterangan,
  penjelasan,
}: {
  ikon: NamaIkon;
  gerak: GerakIkon;
  label: string;
  angka: number;
  format: (n: number) => string;
  uang?: boolean;
  keterangan?: string;
  penjelasan: string;
}) {
  const [tampil, setTampil] = useState<number | null>(null);
  const bingkai = useRef(0);
  const hitungUlang = () => {
    if (geraknyaDikurangi()) return;
    cancelAnimationFrame(bingkai.current);
    const awal = performance.now();
    const langkah = (kini: number) => {
      const p = Math.min(1, (kini - awal) / 500);
      // Rupiah dibulatkan ke ribuan selama berhitung supaya angka antaranya tetap rapi.
      const langkahAngka = angka >= 10000 ? 1000 : 1;
      const v = Math.round((angka * (1 - (1 - p) ** 3)) / langkahAngka) * langkahAngka;
      setTampil(p < 1 ? v : null);
      if (p < 1) bingkai.current = requestAnimationFrame(langkah);
    };
    bingkai.current = requestAnimationFrame(langkah);
  };
  useEffect(() => () => cancelAnimationFrame(bingkai.current), []);
  return (
    <div
      onMouseEnter={hitungUlang}
      className="group/baris flex items-center gap-4 transition duration-cepat ease-keluar hover:translate-x-1 group-hover/daftar:opacity-60 hover:!opacity-100"
    >
      <span
        className={cx(
          'relative grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-full bg-putih text-teks shadow-ikon',
          `gerak-${gerak}`,
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-bottom scale-y-0 bg-daun-lembut transition-transform duration-sedang ease-keluar group-hover/baris:scale-y-100"
        />
        <span className="ikon-gerak relative">
          <Ikon nama={ikon} />
        </span>
      </span>
      <div className="flex min-w-0 flex-col">
        <dt className="text-teks-pendukung">{label}</dt>
        <dd className={cx('m-0 text-uang font-semibold tabular-nums', uang && 'text-tanah')}>
          {format(tampil ?? angka)}
        </dd>
        {keterangan ? <dd className="m-0 text-teks-pendukung">{keterangan}</dd> : null}
        <dd className="m-0 text-keterangan text-daun-tua opacity-0 transition-opacity duration-cepat ease-keluar group-hover/baris:opacity-100">
          {penjelasan}
        </dd>
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

/**
 * [AG-57] Animasi tumbuh daun sawi diputar ulang setiap kali hero masuk layar lagi: setelah hero
 * benar-benar keluar layar, gambar dimuat ulang dengan kunci baru (animasi di dalam SVG mulai dari
 * awal). Kemunculan aset melayang ikut `.muncul-gulir` hero (reset saat keluar, diputar saat masuk).
 */
function usePutaranUlang() {
  const ref = useRef<HTMLDivElement>(null);
  const [putaran, setPutaran] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let pernahKeluar = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      if (!e.isIntersecting) pernahKeluar = true;
      else if (pernahKeluar) {
        pernahKeluar = false;
        setPutaran((n) => n + 1);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, putaran] as const;
}

function Contoh({ d }: { d: NonNullable<DataLanding['petani']> }) {
  const [wadah, putaran] = usePutaranUlang();
  return (
    <>
      <div
        ref={wadah}
        className="relative mx-auto aspect-square w-full max-w-pilihan-kotak lg:col-span-4 lg:max-w-none"
      >
        <div
          aria-hidden="true"
          className="absolute inset-5 rounded-full border-2 border-dashed border-oranye-terang bg-tanah-lembut"
        />
        {d.komoditas.id === 'sawi' && !animasiMati() ? (
          // Daun bergoyang pelan; animasinya di dalam SVG dan mati saat gerak dikurangi (D-61).
          <img
            key={putaran}
            src={`/ilustrasi/sawi-bergerak.svg${putaran ? `?putaran=${putaran}` : ''}`}
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
        {MELAYANG.map((m, i) => (
          // Pembungkus memunculkan aset bergiliran (giliran); gambar di dalamnya tetap melayang.
          <span
            key={m.src}
            aria-hidden="true"
            className={cx('giliran pointer-events-none absolute block', m.kelas)}
            style={{ '--urutan': i + 2 } as CSSProperties}
          >
            <img
              src={m.src}
              alt=""
              className="block h-full w-full animate-melayang"
              style={{ animationDuration: m.durasi, animationDelay: m.jeda }}
            />
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-5 lg:col-span-3">
        <p className="m-0 text-teks-pendukung">
          <span>{t.contohPerhitungan}</span>
          <span>{' · ' + t.ringkasContoh(d.komoditas.nama, d.luasM2)}</span>
        </p>
        <dl className="group/daftar m-0 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-1">
          {d.angka ? (
            <BarisAngka
              ikon="uang"
              gerak="koin"
              label={t.modal}
              angka={d.angka.modal}
              format={formatRupiah}
              uang
              penjelasan={t.penjelasanModal}
            />
          ) : null}
          <BarisAngka
            ikon="kalender"
            gerak="kalender"
            label={t.panen}
            angka={d.resep.umurPanenHari}
            format={t.hariKe}
            penjelasan={t.penjelasanPanen}
          />
          {d.angka ? (
            <>
              <BarisAngka
                ikon="luas"
                gerak="impas"
                label={t.titikImpas}
                angka={d.angka.titikImpasKg}
                format={t.kg}
                penjelasan={t.penjelasanImpas}
              />
              <BarisAngka
                ikon="panen"
                gerak="keranjang"
                label={t.perkiraanUntung}
                angka={d.angka.untung}
                format={formatRupiah}
                keterangan={t.kalauPanen(d.angka.perkiraanKg)}
                penjelasan={t.penjelasanUntung}
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
