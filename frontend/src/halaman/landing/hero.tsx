/**
 * Hero halaman depan (papan 01): judul, ajakan "Mulai sebagai petani" / "Saya pembeli" (ke Masuk
 * dengan peran terisi), dan kartu contoh siklus dengan penggaris umur tanam, modal, dan perkiraan
 * untung yang dihitung dari resep contoh (D-08).
 */
import { Link } from 'react-router-dom';
import { Banner } from '../../komponen/banner';
import { cx } from '../../komponen/gabung-kelas';
import { LabelKecil } from '../../komponen/label-kecil';
import { PenggarisUmurTanam } from '../../komponen/penggaris-umur-tanam';
import { kelasTombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { formatRupiah } from '../../lib/format';
import { teksLanding as t } from '../../teks/landing';
import { teksUmum } from '../../teks/umum';
import { kelasWadah } from '../statis/kerangka-publik';
import type { DataLanding } from './data-landing';

/** Matahari kecil di sudut kartu contoh (hiasan, papan 01). */
function Matahari({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 64"
      aria-hidden="true"
      className={cx('pointer-events-none text-matahari', className)}
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M48 4v10M24 14l6 7M72 14l-6 7M10 38h9M77 38h9" />
        <path d="M27 60a21 21 0 0 1 42 0" />
      </g>
    </svg>
  );
}

function KartuContoh({ d }: { d: NonNullable<DataLanding['petani']> }) {
  const lebar = useLayarLebar();
  return (
    <div className="relative">
      <Matahari className="absolute -top-16 right-6 w-24" />
      <div className="relative flex flex-col gap-4 rounded-sheet bg-daun-lembut p-3 lg:p-5">
        <div className="overflow-hidden rounded-lg border border-garis bg-putih">
          <div className="flex flex-col gap-1 px-4 pt-4">
            <LabelKecil nada="garis" className="mb-2 self-start">
              {t.contohPerhitungan}
            </LabelKecil>
            <h2 className="m-0 text-judul-bagian font-semibold">
              {t.judulContoh(d.komoditas.nama)}
            </h2>
            <p className="m-0 text-teks-pendukung">
              {(lebar ? t.ketContoh : t.ketContohPendek)(d.resep.umurPanenHari, d.luasM2)}
            </p>
          </div>
          <PenggarisUmurTanam
            varian={lebar ? 'lebar' : 'hp'}
            hariIni={d.hariKe}
            hariPanen={d.resep.umurPanenHari}
            jadwal={d.pin}
            className="px-4 pb-4 pt-3"
          />
          {d.angka ? (
            <dl className="m-0 flex flex-wrap gap-x-8 gap-y-2 bg-tanah-lembut px-4 py-3">
              <div>
                <dt className="text-teks-pendukung">{t.modal}</dt>
                <dd className="m-0 text-uang font-semibold tabular-nums">
                  {formatRupiah(d.angka.modal)}
                </dd>
              </div>
              <div>
                <dt className="text-teks-pendukung">{t.perkiraanUntung}</dt>
                <dd className="m-0 text-uang font-semibold tabular-nums">
                  {formatRupiah(d.angka.untung)}
                </dd>
                {lebar ? (
                  <dd className="m-0 text-teks-pendukung">{t.kalauPanen(d.angka.perkiraanKg)}</dd>
                ) : null}
              </div>
            </dl>
          ) : null}
        </div>
        {lebar && d.besok ? <Banner judul={t.besok(d.besok.judul)}>{d.besok.isi}</Banner> : null}
      </div>
      {d.resep.contoh ? (
        <LabelKecil nada="contoh" className="mt-3">
          {teksUmum.labelContoh}
        </LabelKecil>
      ) : null}
    </div>
  );
}

export function Hero({ d }: { d: DataLanding }) {
  const panduan = t.panduanSiap(d.siap, d.menyusul);
  return (
    <section className={cx(kelasWadah, 'grid gap-14 py-8 lg:grid-cols-12 lg:gap-12 lg:py-16')}>
      <div className="flex flex-col gap-5 lg:col-span-5 lg:gap-6">
        <p className="m-0 max-w-pilihan-kotak font-semibold text-daun-tua">{t.sapaan}</p>
        <h1 className="m-0 text-tampil-3 font-semibold tracking-rapat lg:text-tampil-5">
          {t.judul}
        </h1>
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
      {d.petani ? (
        <div className="lg:col-span-7 lg:pt-10">
          <KartuContoh d={d.petani} />
        </div>
      ) : null}
    </section>
  );
}
