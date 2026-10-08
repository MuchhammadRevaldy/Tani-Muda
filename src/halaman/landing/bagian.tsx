/**
 * Bagian halaman depan di bawah hero (papan 01): tiga pilar, cara kerja Pesan Sebelum Tanam lima
 * langkah, bagian pembeli, dan tanya jawab. Angka dari konfigurasi dan fungsi src/lib (D-08).
 */
import type { ReactNode } from 'react';
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
import type { DataLanding } from './data-landing';

function KepalaBagian({
  sapaan,
  judul,
  ket,
  nadaSapaan = 'daun',
}: {
  sapaan?: string;
  judul: string;
  ket?: string;
  nadaSapaan?: 'daun' | 'tanah';
}) {
  return (
    <div className="flex max-w-teks flex-col gap-3">
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
      <h2 className="m-0 text-tampil-2 font-semibold tracking-rapat lg:text-tampil-4">{judul}</h2>
      {ket ? <p className="m-0 text-judul-bagian text-teks-pendukung">{ket}</p> : null}
    </div>
  );
}

function KartuPilar({
  ikon,
  nadaIkon,
  judul,
  isi,
  children,
}: {
  ikon: NamaIkon;
  nadaIkon: 'daun' | 'tanah';
  judul: string;
  isi: string;
  children?: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-garis bg-putih p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <span
          className={cx(
            'grid h-12 w-12 place-items-center rounded-md',
            nadaIkon === 'daun' ? 'bg-daun-lembut text-daun-tua' : 'bg-tanah-lembut text-tanah',
          )}
        >
          <Ikon nama={ikon} />
        </span>
        <h3 className="m-0 text-tampil-1 font-medium">{judul}</h3>
      </div>
      <p className="m-0">{isi}</p>
      <div className="flex-1" />
      {children}
    </article>
  );
}

export function Pilar({ d }: { d: DataLanding }) {
  return (
    <section className={cx(kelasWadah, 'flex flex-col gap-8 pb-14 lg:pb-20')}>
      <KepalaBagian judul={t.judulPilar} ket={t.ketPilar} />
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <KartuPilar ikon="belajar" nadaIkon="daun" judul={t.belajar} isi={t.isiBelajar}>
          <div className="flex items-center gap-3 rounded-md bg-embun-pagi p-3">
            <span className="grid h-11 w-16 flex-none place-items-center rounded-sm bg-daun-tua text-putih">
              <Ikon nama="putar" ukuran={20} className="fill-current" />
            </span>
            <div className="min-w-0">
              <p className="m-0 font-semibold">{t.contohModul}</p>
              <p className="m-0 text-keterangan text-teks-pendukung">{t.ketModul}</p>
            </div>
          </div>
        </KartuPilar>
        <KartuPilar ikon="uang" nadaIkon="tanah" judul={t.hitung} isi={t.isiHitung}>
          {d.hitung.length ? (
            <ul className="m-0 list-none rounded-md bg-tanah-lembut p-0">
              {d.hitung.map((b, i) => {
                const a = t.modalImpas(
                  b.angka.modal,
                  b.angka.titikImpasKg,
                  b.komoditas.satuan_panen,
                );
                return (
                  <li
                    key={b.komoditas.id}
                    className={cx('px-3 py-3', i > 0 && 'border-t border-garis')}
                  >
                    <p className="m-0 font-semibold">{t.barisHitung(b.komoditas.nama, b.luasM2)}</p>
                    <p className="m-0 text-teks-pendukung">
                      {t.modal} <span className="font-semibold text-tanah">{a.modal}</span> ·{' '}
                      {a.impas}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </KartuPilar>
        <KartuPilar ikon="pesanan" nadaIkon="daun" judul={t.jual} isi={t.isiJual}>
          <ul className="m-0 list-none rounded-md bg-embun-pagi p-0">
            {CONTOH_LANDING.pesanan.map((p, i) => (
              <li
                key={p.nama}
                className={cx('flex flex-col gap-2 p-3', i > 0 && 'border-t border-garis')}
              >
                <div>
                  <p className="m-0 font-semibold">{p.nama}</p>
                  <p className="m-0 text-teks-pendukung">
                    {p.jenis === 'rutin'
                      ? t.ketPembeliRutin(d.namaKomoditas(p.komoditas), p.kg)
                      : t.ketPembeliSekali(p.kg)}
                  </p>
                </div>
                <ChipStatus status="uang-muka-ditahan" className="self-start" />
              </li>
            ))}
          </ul>
        </KartuPilar>
      </div>
    </section>
  );
}

const LANGKAH: { ikon: NamaIkon; kelas: string }[] = [
  { ikon: 'pesanan', kelas: 'border-2 border-garis-kuat bg-putih text-teks' },
  { ikon: 'kunci', kelas: 'bg-tanah text-putih' },
  { ikon: 'kebun', kelas: 'border-2 border-daun-tua bg-putih text-daun-tua' },
  { ikon: 'panen', kelas: 'border-2 border-tanah bg-putih text-tanah' },
  { ikon: 'uang', kelas: 'bg-daun-tua text-putih' },
];

export function CaraKerja({ d }: { d: DataLanding }) {
  if (!d.konfigurasi) return null;
  const langkah = t.langkah(d.konfigurasi.persen_uang_muka, d.konfigurasi.jam_periksa_rutin);
  return (
    <section className="border-y border-garis bg-putih">
      <div className={cx(kelasWadah, 'flex flex-col gap-8 py-12 lg:gap-10 lg:py-20')}>
        <KepalaBagian sapaan={t.sapaanCara} judul={t.judulCara} />
        <ol className="relative m-0 grid list-none gap-6 p-0 lg:grid-cols-5 lg:gap-4">
          {/* Garis penghubung: tegak di HP, mendatar di desktop. */}
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-6 top-6 w-0.5 bg-garis lg:bottom-auto lg:left-24 lg:right-24 lg:top-6 lg:h-0.5 lg:w-auto"
          />
          {langkah.map((l, i) => (
            <li
              key={l.judul}
              className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-3 lg:text-center"
            >
              <span
                className={cx(
                  'grid h-12 w-12 flex-none place-items-center rounded-full',
                  LANGKAH[i]?.kelas,
                )}
              >
                <Ikon nama={LANGKAH[i]?.ikon ?? 'centang'} />
              </span>
              <div className="flex flex-col gap-1">
                <p className="m-0 text-teks-pendukung">{t.langkahKe(i + 1)}</p>
                <h3 className="m-0 text-judul-bagian font-semibold">{l.judul}</h3>
                <p className="m-0 text-teks-pendukung">{l.isi}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function BagianPembeli({ d }: { d: DataLanding }) {
  const lebar = useLayarLebar();
  const c = d.pembeli;
  return (
    <section className={cx(kelasWadah, 'grid gap-6 py-12 lg:grid-cols-2 lg:gap-12 lg:py-20')}>
      <div className="flex flex-col gap-6">
        <KepalaBagian sapaan={t.sapaanPembeli} judul={t.judulPembeli} nadaSapaan="tanah" />
        <DaftarSyarat butir={[...t.keunggulan]} />
        {lebar ? (
          <Link to="/masuk?peran=pembeli" className={cx(kelasTombol('utama'), 'self-start')}>
            {t.daftarPembeli}
          </Link>
        ) : null}
      </div>
      {c ? (
        <div className="flex flex-col gap-3 self-center">
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
    </section>
  );
}

export function TanyaJawab({ d }: { d: DataLanding }) {
  if (!d.konfigurasi) return null;
  return (
    <section className="border-t border-garis bg-putih">
      <div className={cx(kelasWadah, 'grid gap-6 py-12 lg:grid-cols-3 lg:gap-12 lg:py-16')}>
        <KepalaBagian judul={t.judulFaq} ket={t.ketFaq} />
        <div className="lg:col-span-2">
          <FaqLipat
            butir={t.faq(
              d.konfigurasi.hari_kembali_uang_muka,
              d.konfigurasi.hari_kabar_gagal_panen,
            )}
          />
        </div>
      </div>
    </section>
  );
}
