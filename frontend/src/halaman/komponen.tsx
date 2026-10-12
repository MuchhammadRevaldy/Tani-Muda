import { useState, type ReactNode } from 'react';
import { warna } from '../../tailwind.config';
import { Banner } from '../komponen/banner';
import { BarisTugas } from '../komponen/baris-tugas';
import { ChipStatus, daftarStatusChip } from '../komponen/chip-status';
import { Dialog } from '../komponen/dialog';
import { Ikon, IkonLingkaran, IkonTipeTugas, ikonDesain } from '../komponen/ikon';
import {
  IlustrasiKomoditas,
  IlustrasiMetode,
  daftarIlustrasiKomoditas,
  daftarIlustrasiMetode,
} from '../komponen/ilustrasi';
import { InputRupiah } from '../komponen/input-rupiah';
import { Kartu } from '../komponen/kartu';
import { KolomIsian } from '../komponen/kolom-isian';
import { LabelKecil } from '../komponen/label-kecil';
import { HeaderHalaman, Logo, NavigasiBawah, Sidebar } from '../komponen/navigasi';
import { DaftarLangkah, DaftarSyarat, FaqLipat, KotakOtp, Stepper } from '../komponen/pelengkap';
import { Pin, PenggarisUmurTanam, type JadwalPin } from '../komponen/penggaris-umur-tanam';
import { GrupRadio, KartuPilihan, PilPilihan, Saklar } from '../komponen/pilihan';
import { Tombol, kelasTombolTambah } from '../komponen/tombol';
import { Uang } from '../komponen/uang';
import { Avatar } from '../komponen/avatar';
import { teksKomponenGaleri as t } from '../teks/galeri';

/**
 * Galeri semua komponen dan variannya, ditata mengikuti papan 00 (sistem desain) supaya bisa
 * dibandingkan berdampingan dengan design/extracted/pages/00-sistem-desain-desktop.html di 390px dan 1440px.
 * Semua angka di halaman ini adalah ilustrasi komponen (D-08), bukan hasil hitungan.
 */

type NamaWarna = keyof typeof warna;
// Kelas ditulis lengkap supaya terbaca oleh Tailwind.
const SWATCH: { nama: NamaWarna; kelas: string; garis?: boolean }[] = [
  { nama: 'daun-tua', kelas: 'bg-daun-tua' },
  { nama: 'embun-pagi', kelas: 'bg-embun-pagi', garis: true },
  { nama: 'putih', kelas: 'bg-putih', garis: true },
  { nama: 'tanah', kelas: 'bg-tanah' },
  { nama: 'matahari', kelas: 'bg-matahari' },
  { nama: 'matahari-teks', kelas: 'bg-matahari-teks' },
  { nama: 'matahari-lembut', kelas: 'bg-matahari-lembut', garis: true },
  { nama: 'tomat', kelas: 'bg-tomat' },
  { nama: 'teks', kelas: 'bg-teks' },
  { nama: 'teks-pendukung', kelas: 'bg-teks-pendukung' },
  { nama: 'garis', kelas: 'bg-garis' },
];
const SWATCH_TAMBAHAN: { nama: NamaWarna; kelas: string }[] = [
  { nama: 'daun-tekan', kelas: 'bg-daun-tekan' },
  { nama: 'daun-lembut', kelas: 'bg-daun-lembut' },
  { nama: 'tanah-lembut', kelas: 'bg-tanah-lembut' },
  { nama: 'tomat-teks', kelas: 'bg-tomat-teks' },
  { nama: 'tomat-lembut', kelas: 'bg-tomat-lembut' },
  { nama: 'garis-kuat', kelas: 'bg-garis-kuat' },
];

const JADWAL: JadwalPin[] = [
  { hari: 7, label: 'Pupuk 1', status: 'selesai' },
  { hari: 14, label: 'Pupuk 2', status: 'besok' },
  { hari: 20, label: 'Cek hama', status: 'belum' },
  { hari: 28, label: 'Panen', status: 'panen' },
];

const AKUN = { nama: 'Arif Setiawan', keterangan: 'Petani · Lembang' };

function Bagian({
  judul,
  keterangan,
  children,
}: {
  judul: string;
  keterangan?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex max-w-dok flex-col gap-1.5">
        <h2 className="m-0 text-dok-1 font-semibold">{judul}</h2>
        {keterangan ? <p className="m-0 text-teks-pendukung">{keterangan}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Panel({ children, kolom }: { children: ReactNode; kolom?: boolean }) {
  return (
    <div
      className={`flex gap-4 rounded-lg border border-garis bg-putih p-6 ${kolom ? 'flex-col' : 'flex-wrap items-center'}`}
    >
      {children}
    </div>
  );
}

function Swatch({
  nama,
  kelas,
  garis,
  tinggi,
}: {
  nama: NamaWarna;
  kelas: string;
  garis?: boolean;
  tinggi: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-garis bg-putih p-3">
      <div className={`${tinggi} rounded-ikon ${kelas} ${garis ? 'border border-garis' : ''}`} />
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{t.warna[nama].nama}</span>
        <span className="tabular-nums text-teks-pendukung">{warna[nama]}</span>
        <span className="text-keterangan text-teks-pendukung">{t.warna[nama].guna}</span>
      </div>
    </div>
  );
}

function BarisHuruf({
  peran,
  ukuran,
  contoh,
  kelas,
}: {
  peran: string;
  ukuran: string;
  contoh: string;
  kelas: string;
}) {
  return (
    <div className="grid grid-cols-1 items-baseline gap-2 border-t border-garis pt-4 md:grid-cols-label-dok md:gap-4">
      <div className="flex flex-col">
        <span className="font-semibold">{peran}</span>
        <span className="text-keterangan text-teks-pendukung">{ukuran}</span>
      </div>
      <span className={kelas}>{contoh}</span>
    </div>
  );
}

export function HalamanKomponen() {
  const [lahan, setLahan] = useState<'semua' | 'sawah' | 'kebun' | 'pekarangan'>('semua');
  const [satuan, setSatuan] = useState<'m2' | 'ru' | 'ha'>('m2');
  const [subsidi, setSubsidi] = useState<'ya' | 'tidak'>('tidak');
  const [metode, setMetode] = useState<'bedengan' | 'hidroponik'>('bedengan');
  const [sore, setSore] = useState(true);
  const [ukur, setUkur] = useState(false);
  const [dialog, setDialog] = useState(false);

  return (
    <div className="mx-auto flex max-w-desktop flex-col gap-18 px-4 py-10 lg:px-20 lg:py-16">
      <header className="flex max-w-dok flex-col gap-4">
        <Logo besar />
        <h1 className="m-0 text-tampil-3 font-semibold tracking-rapat lg:text-dok-2">{t.judul}</h1>
        <p className="m-0 text-judul-bagian font-normal text-teks-pendukung">{t.pengantar}</p>
      </header>

      <Bagian judul={t.bagian.warna} keterangan={t.bagian.warnaKet}>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
          {SWATCH.map((s) => (
            <Swatch key={s.nama} {...s} tinggi="h-22" />
          ))}
        </div>
        <h3 className="m-0 mt-2 text-judul-bagian font-semibold">{t.bagian.warnaTambahan}</h3>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
          {SWATCH_TAMBAHAN.map((s) => (
            <Swatch key={s.nama} {...s} tinggi="h-16" />
          ))}
        </div>
      </Bagian>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
        <Bagian judul={t.bagian.huruf}>
          <div className="flex flex-col gap-4 rounded-lg border border-garis bg-putih p-6">
            <div className="flex items-end gap-6 pb-2">
              <span className="text-dok-3 font-semibold text-daun-tua">Aa</span>
              <div className="flex flex-col gap-0.5 pb-2">
                <span className="text-judul-bagian font-semibold">Outfit</span>
                <span className="text-keterangan text-teks-pendukung">{t.huruf.bobot}</span>
              </div>
            </div>
            <BarisHuruf
              peran={t.huruf.judulHalaman}
              ukuran="22/28 · 600"
              contoh="Sawi · Petak 1"
              kelas="text-judul-halaman font-semibold"
            />
            <BarisHuruf
              peran={t.huruf.judulBagian}
              ukuran="18/26 · 600"
              contoh={t.huruf.contohBagian}
              kelas="text-judul-bagian font-semibold"
            />
            <BarisHuruf
              peran={t.huruf.angkaUang}
              ukuran="20/28 · 600 · tanah"
              contoh="Rp1.250.000"
              kelas="text-uang font-semibold tabular-nums text-tanah"
            />
            <BarisHuruf
              peran={t.huruf.isi}
              ukuran="16/24 · 400"
              contoh={t.huruf.contohIsi}
              kelas="text-isi"
            />
            <BarisHuruf
              peran={t.huruf.label}
              ukuran="16/24 · 500"
              contoh={t.huruf.contohLabel}
              kelas="text-isi font-medium"
            />
            <BarisHuruf
              peran={t.huruf.keterangan}
              ukuran="16/22 · 400 · pendukung"
              contoh={t.huruf.contohKet}
              kelas="text-keterangan text-teks-pendukung"
            />
          </div>
        </Bagian>

        <Bagian judul={t.bagian.tombol}>
          <div className="flex flex-col gap-5 rounded-lg border border-garis bg-putih p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Tombol>{t.tombol.simpan}</Tombol>
              <Tombol varian="sekunder">{t.tombol.tunda}</Tombol>
              <Tombol ikon="centang">{t.tombol.selesai}</Tombol>
              <Tombol varian="sekunder" ikon="kamera">
                {t.tombol.foto}
              </Tombol>
              <Tombol disabled>{t.tombol.nonaktif}</Tombol>
              <button type="button" aria-label={t.tombol.tambah} className={kelasTombolTambah}>
                <Ikon nama="tambah" tebal={2.2} />
              </button>
            </div>
            <p className="m-0 text-keterangan text-teks-pendukung">{t.tombol.ket}</p>
            <div className="h-px bg-garis" />
            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
              <KolomIsian
                label={t.isian.luas}
                akhiran="m²"
                inputMode="decimal"
                defaultValue="100"
                bantuan={t.isian.kiraKira}
              />
              <KolomIsian
                label={t.isian.jumlah}
                akhiran="kg"
                inputMode="decimal"
                galat={t.isian.galat}
              />
            </div>
            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
              <InputRupiah label={t.isian.harga} akhiran="/kg" nilaiAwal={5000} />
              <p className="m-0 text-keterangan text-teks-pendukung md:mt-8">{t.isian.ketRupiah}</p>
            </div>
          </div>
        </Bagian>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
        <Bagian judul={t.bagian.kartu}>
          <Kartu judul={t.kartu.tugasHariIni} keterangan="Sawi · Petak 1" tanpaIsi>
            <BarisTugas
              judul={t.kartu.siram}
              keterangan={t.kartu.siramKet}
              waktu="hari-ini"
              jumlahFoto={1}
            />
            <BarisTugas judul={t.kartu.pupuk2} keterangan="NPK 1 kg" waktu="besok" />
          </Kartu>
          <Kartu
            judul={t.kartu.modal}
            keterangan={t.kartu.modalKet}
            nadaKaki="uang"
            kaki={
              <>
                <Uang label={t.kartu.totalModal} nilai={430000} besar />
                <Uang label={t.kartu.panenJelek} nilai={-80000} besar />
              </>
            }
          >
            <p className="m-0">{t.kartu.kakiUang}</p>
          </Kartu>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.kartu.ket}</p>
        </Bagian>

        <Bagian judul={t.bagian.chip}>
          <Panel kolom>
            <span className="font-medium">{t.chip.tugas}</span>
            <div className="flex flex-wrap gap-3">
              {daftarStatusChip.slice(0, 4).map((s) => (
                <ChipStatus key={s} status={s}>
                  {s === 'terlambat' ? t.chip.terlambat2 : undefined}
                </ChipStatus>
              ))}
            </div>
            <span className="border-t border-garis pt-2 font-medium">{t.chip.uang}</span>
            <div className="flex flex-wrap gap-3">
              {daftarStatusChip.slice(4).map((s) => (
                <ChipStatus key={s} status={s} />
              ))}
            </div>
            <span className="border-t border-garis pt-2 font-medium">{t.chip.label}</span>
            <div className="flex flex-wrap gap-3">
              <LabelKecil nada="hijau" ikon="pesanan">
                {t.label.adaPesanan}
              </LabelKecil>
              <LabelKecil nada="hijau">{t.label.pemula}</LabelKecil>
              <LabelKecil nada="segera">{t.label.segera}</LabelKecil>
              <LabelKecil nada="polos" ikon="centang">
                {t.label.resep}
              </LabelKecil>
              <LabelKecil nada="garis">{t.label.subsidi}</LabelKecil>
              <LabelKecil nada="garis">{t.label.nonsubsidi}</LabelKecil>
              <LabelKecil nada="promo">{t.label.promo}</LabelKecil>
              <LabelKecil nada="contoh">{t.label.contoh}</LabelKecil>
              <LabelKecil nada="sorot">{t.label.sorot}</LabelKecil>
            </div>
          </Panel>
          <h2 className="m-0 mt-2 text-dok-1 font-semibold">{t.bagian.banner}</h2>
          <div className="flex flex-col gap-3">
            <Banner jenis="peringatan" judul={t.banner.besok}>
              {t.banner.besokIsi}
            </Banner>
            <Banner jenis="bahaya" judul={t.banner.ditolak} aksi={t.banner.lihatFoto}>
              {t.banner.ditolakIsi}
            </Banner>
            <Banner jenis="offline">{t.banner.offlineIsi}</Banner>
            <Banner jenis="offline" tertunda={2} />
          </div>
        </Bagian>
      </div>

      <Bagian judul={t.bagian.penggaris} keterangan={t.bagian.penggarisKet}>
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-penggaris-dok">
          <div className="flex flex-col gap-3">
            <span className="font-medium">{t.penggaris.hp}</span>
            <Kartu judul="Sawi · Petak 1" keterangan={t.penggaris.panen15}>
              <PenggarisUmurTanam varian="hp" hariIni={13} hariPanen={28} jadwal={JADWAL} />
            </Kartu>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <span className="font-medium">{t.penggaris.lebar}</span>
            <Kartu judul={t.penggaris.dariKebun} keterangan={t.penggaris.ditanam}>
              <PenggarisUmurTanam varian="lebar" hariIni={13} hariPanen={28} jadwal={JADWAL} />
            </Kartu>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-garis bg-putih p-4 md:grid-cols-5">
              {(['selesai', 'besok', 'belum', 'terlambat', 'panen'] as const).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <Pin status={s} ukuran={28} />
                  <span className="text-keterangan">{t.penggaris.status[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Bagian>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
        <Bagian judul={t.bagian.ikon} keterangan={t.bagian.ikonKet}>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {ikonDesain.map((n) => (
              <div
                key={n}
                className="flex flex-col items-center gap-1.5 rounded-md border border-garis bg-putih px-1 py-3.5"
              >
                <Ikon nama={n} />
                <span className="text-keterangan text-teks-pendukung">{n}</span>
              </div>
            ))}
          </div>
          <h3 className="m-0 text-judul-bagian font-semibold">{t.ikon.lingkaran}</h3>
          <div className="flex flex-wrap gap-4">
            {(['kalender', 'pengukur', 'uang', 'panen'] as const).map((n) => (
              <IkonLingkaran key={n} nama={n} />
            ))}
            <IkonLingkaran nama="luas" besar />
          </div>
          <h3 className="m-0 text-judul-bagian font-semibold">{t.ikon.tipe}</h3>
          <div className="flex flex-wrap gap-6">
            {(['sekali', 'berulang', 'ukur'] as const).map((tp) => (
              <span key={tp} className="inline-flex items-center gap-2">
                <IkonTipeTugas tipe={tp} />
                {t.ikon.namaTipe[tp]}
              </span>
            ))}
          </div>
          <h3 className="m-0 text-judul-bagian font-semibold">{t.ikon.ilustrasi}</h3>
          <div className="flex flex-wrap gap-3">
            {daftarIlustrasiMetode.map((n) => (
              <IlustrasiMetode key={n} nama={n} segera={n === 'polybag'} />
            ))}
            {daftarIlustrasiKomoditas.map((n, i) => (
              <IlustrasiKomoditas key={n} nama={n} segera={i > 2 && n !== 'padi'} />
            ))}
          </div>
        </Bagian>

        <Bagian judul={t.bagian.nav} keterangan={t.bagian.navKet}>
          <div className="w-full max-w-hp rounded-lg bg-embun-pagi p-3">
            <NavigasiBawah lencana={{ pesanan: 2 }} />
          </div>
          <span className="font-medium">{t.nav.sidebar}</span>
          <div className="relative flex h-demo-sidebar w-sidebar overflow-hidden rounded-lg border border-garis">
            <Sidebar akun={AKUN} lencana={{ pesanan: 1 }} menuTerbukaAwal className="h-full" />
          </div>
        </Bagian>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
        <Bagian judul={t.bagian.pilihan}>
          <Panel kolom>
            <PilPilihan
              label={t.pilihan.lahan}
              nilai={lahan}
              onPilih={setLahan}
              opsi={[
                { nilai: 'semua', label: t.pilihan.semua },
                { nilai: 'sawah', label: t.pilihan.sawah },
                { nilai: 'kebun', label: t.pilihan.kebun },
                { nilai: 'pekarangan', label: t.pilihan.pekarangan },
              ]}
            />
            <PilPilihan
              gaya="segmen"
              label={t.pilihan.satuan}
              nilai={satuan}
              onPilih={setSatuan}
              opsi={[
                { nilai: 'm2', label: 'm²' },
                { nilai: 'ru', label: 'ru/bata' },
                { nilai: 'ha', label: 'hektare' },
              ]}
            />
            <PilPilihan
              gaya="kotak"
              label={t.pilihan.jenisPupuk}
              nilai={subsidi}
              onPilih={setSubsidi}
              className="max-w-pilihan-kotak"
              opsi={[
                { nilai: 'ya', label: t.label.subsidi },
                { nilai: 'tidak', label: t.label.nonsubsidi },
              ]}
            />
            <GrupRadio
              label={t.pilihan.caraTanam}
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
            >
              <KartuPilihan
                dipilih={metode === 'bedengan'}
                onPilih={() => setMetode('bedengan')}
                labelAksesibel={t.pilihan.bedengan}
              >
                <div className="flex items-center gap-3 p-4">
                  <IlustrasiMetode nama="bedengan" />
                  <span className="font-semibold">{t.pilihan.bedengan}</span>
                </div>
              </KartuPilihan>
              <KartuPilihan
                dipilih={metode === 'hidroponik'}
                onPilih={() => setMetode('hidroponik')}
                labelAksesibel={t.pilihan.hidroponik}
              >
                <div className="flex items-center gap-3 p-4">
                  <IlustrasiMetode nama="hidroponik" />
                  <span className="font-semibold">{t.pilihan.hidroponik}</span>
                </div>
              </KartuPilihan>
              <KartuPilihan
                dipilih={false}
                onPilih={() => undefined}
                labelAksesibel={t.pilihan.polybagSegera}
                segera
              >
                <div className="flex items-center gap-3 p-4">
                  <IlustrasiMetode nama="polybag" segera />
                  <span className="flex flex-col gap-1">
                    <span className="font-medium text-teks-pendukung">{t.pilihan.polybag}</span>
                    <LabelKecil nada="segera">{t.label.segera}</LabelKecil>
                  </span>
                </div>
              </KartuPilihan>
            </GrupRadio>
            <div className="flex items-center justify-between gap-3 border-t border-garis pt-3">
              <span className="flex flex-col">
                <span className="font-semibold">{t.pilihan.pengingatSore}</span>
                <span className="text-keterangan text-teks-pendukung">
                  {t.pilihan.pengingatSoreKet}
                </span>
              </span>
              <Saklar aktif={sore} onUbah={setSore} label={t.pilihan.pengingatSore} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">{t.pilihan.ukur}</span>
              <Saklar aktif={ukur} onUbah={setUkur} label={t.pilihan.ukur} />
            </div>
          </Panel>
        </Bagian>

        <Bagian judul={t.bagian.tugas}>
          <Kartu judul={t.kartu.tugasHariIni} keterangan="Sawi · Hidroponik NFT" tanpaIsi>
            <BarisTugas
              judul={t.tugas.siangi}
              tipe="sekali"
              keterangan={t.tugas.hari11}
              waktu="terlambat"
              teksWaktu={t.chip.terlambat2}
              href="/tugas/contoh"
            />
            <BarisTugas
              judul={t.tugas.ukur}
              tipe="ukur"
              keterangan={t.tugas.tiap2}
              waktu="hari-ini"
              hasil={t.tugas.hasil}
              hrefUkur="/tugas/contoh/ukur"
              ukurUtama
              tanpaKamera
            />
            <BarisTugas
              judul={t.kartu.siram}
              tipe="berulang"
              keterangan={t.tugas.tiapHari}
              waktu="besok"
            />
            <BarisTugas
              judul={t.tugas.pindah}
              tipe="sekali"
              keterangan={t.tugas.hari10}
              selesaiAwal
            />
          </Kartu>
          <h2 className="m-0 mt-2 text-dok-1 font-semibold">{t.bagian.dialog}</h2>
          <Panel>
            <Tombol varian="sekunder" onClick={() => setDialog(true)}>
              {t.dialog.buka}
            </Tombol>
          </Panel>
          <Dialog
            terbuka={dialog}
            onTutup={() => setDialog(false)}
            judul={t.dialog.judul}
            keterangan={t.dialog.ket}
            kepala={<IlustrasiKomoditas nama="cabai" segera />}
          >
            <div className="flex flex-col items-start gap-2.5">
              <LabelKecil nada="segera">{t.label.segera}</LabelKecil>
              <p className="m-0">{t.dialog.isi}</p>
              <p className="m-0 text-keterangan text-teks-pendukung">{t.dialog.isi2}</p>
            </div>
            <Tombol penuh onClick={() => setDialog(false)}>
              {t.dialog.minta}
            </Tombol>
            <Tombol penuh varian="sekunder" onClick={() => setDialog(false)}>
              {t.dialog.lain}
            </Tombol>
          </Dialog>
        </Bagian>
      </div>

      <Bagian judul={t.bagian.pelengkap}>
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
          <Panel kolom>
            <HeaderHalaman kembaliKe="/komponen" labelKembali={t.pelengkap.batal} />
            <Stepper langkah={1} />
            <KotakOtp nilaiAwal="48211" sisaDetikAwal={42} />
          </Panel>
          <Panel kolom>
            <span className="font-semibold">{t.pelengkap.cara}</span>
            <DaftarLangkah butir={[...t.pelengkap.langkah]} />
            <span className="border-t border-garis pt-3 font-semibold">{t.pelengkap.standar}</span>
            <DaftarSyarat butir={[...t.pelengkap.syarat]} />
            <div className="flex items-center gap-3 border-t border-garis pt-3">
              <Avatar nama="Arif Setiawan" />
              <Avatar nama="Kebun Sekar" gaya="inisial" ukuran={44} />
            </div>
          </Panel>
          <FaqLipat butir={[...t.pelengkap.faq]} />
        </div>
      </Bagian>
    </div>
  );
}
