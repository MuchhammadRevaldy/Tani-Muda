/**
 * Hero halaman depan (papan Halaman depan D-59): judul, ajakan "Mulai sebagai petani" / "Saya pembeli"
 * (ke Masuk dengan peran terisi), ilustrasi komoditas contoh di lingkaran putus-putus, dan ringkasan
 * contoh perhitungan (modal, umur panen, titik impas, perkiraan untung) yang dihitung dari resep
 * contoh (D-08).
 */
import { Link } from 'react-router-dom';
import { cx } from '../../komponen/gabung-kelas';
import { IkonLingkaran, type NamaIkon } from '../../komponen/ikon';
import { IlustrasiKomoditas } from '../../komponen/ilustrasi';
import { LabelKecil } from '../../komponen/label-kecil';
import { kelasTombol } from '../../komponen/tombol';
import { formatRupiah } from '../../lib/format';
import { teksLanding as t } from '../../teks/landing';
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

function Contoh({ d }: { d: NonNullable<DataLanding['petani']> }) {
  return (
    <>
      <div className="relative mx-auto aspect-square w-full max-w-pilihan-kotak lg:col-span-4 lg:max-w-none">
        <div
          aria-hidden="true"
          className="absolute inset-5 rounded-full border-2 border-dashed border-oranye-terang bg-tanah-lembut"
        />
        <IlustrasiKomoditas nama={d.komoditas.id} ukuran={420} className="relative h-full w-full" />
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
  const panduan = t.panduanSiap(d.siap, d.menyusul);
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
        {panduan ? <p className="m-0 text-teks-pendukung">{panduan}</p> : null}
      </div>
      {d.petani ? <Contoh d={d.petani} /> : null}
    </section>
  );
}
