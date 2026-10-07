/**
 * Pesanan di sekitar (papan 29, 30; T4.18, PRD P0-19, P0-20, US-11): pesanan terbuka dan berresep
 * dalam radius dari titik tengah desa, terdekat dulu (urutan dari server, sama dengan `jarak.ts`).
 * Filter Semua / Rutin / Sekali panen dan radius ada di alamat (`?jenis=`, `?radius=`). Desktop:
 * daftar bernomor, peta pembeli, dan rincian pesanan yang dipilih.
 */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useKonfigurasi, usePesananSekitar, useWilayahSatu } from '../../api/kueri';
import { konfigurasiKeDomain } from '../../api/peta';
import { useSesi } from '../../api/sesi';
import type { Konfigurasi, PesananUntukPetani } from '../../api/tipe';
import { ChipStatus } from '../../komponen/chip-status';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { IlustrasiPesananKosong } from '../../komponen/ilustrasi-hero';
import { Kartu } from '../../komponen/kartu';
import { PilPilihan } from '../../komponen/pilihan';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { formatTanggal, namaHari } from '../../lib/format';
import { hitungNilaiPesanan } from '../../lib/pesanan-nilai';
import { teksPesanan as t } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { KerangkaPesanan, useKomoditasPeta } from './kerangka-pesanan';
import { PetaPembeli } from './peta-pembeli';

type Filter = 'semua' | 'rutin' | 'sekali_panen';

/** Nilai seluruh pesanan dan uang muka (D-02), dari persen di konfigurasi. */
export function nilaiPesananPetani(p: PesananUntukPetani, konfigurasi: Konfigurasi) {
  const r = hitungNilaiPesanan(
    p.jenis === 'rutin'
      ? {
          jenis: 'rutin',
          jumlahPerKirimanKg: p.jumlah_per_kiriman_kg ?? 0,
          jumlahKiriman: p.jumlah_kiriman,
          hargaPerKg: p.harga_per_kg,
        }
      : { jenis: 'sekali_panen', jumlahTotalKg: p.jumlah_total_kg, hargaPerKg: p.harga_per_kg },
    konfigurasiKeDomain(konfigurasi),
  );
  return r.ok ? r.nilai : null;
}

/** Chip jenis pesanan: ikon ulang untuk rutin, keranjang panen untuk sekali panen (P0-19). */
export function ChipJenis({ jenis }: { jenis: PesananUntukPetani['jenis'] }) {
  const rutin = jenis === 'rutin';
  return (
    <span className="inline-flex min-h-chip items-center gap-1.5 whitespace-nowrap rounded-sm border border-garis bg-embun-pagi px-2.5 font-medium text-teks">
      <Ikon nama={rutin ? 'ulang' : 'panen'} ukuran={18} className="text-daun-tua" />
      {rutin ? t.rutin : t.sekaliPanen}
    </span>
  );
}

function barang(p: PesananUntukPetani, nama: string) {
  return p.jenis === 'rutin' && p.jumlah_per_kiriman_kg !== null && p.frekuensi_hari
    ? t.barangRutin(
        nama,
        p.jumlah_per_kiriman_kg,
        p.frekuensi_hari,
        p.jumlah_kiriman * p.frekuensi_hari,
      )
    : t.barangSekali(nama, p.jumlah_total_kg, p.perkiraan_bulan_panen);
}

function waktu(p: PesananUntukPetani) {
  return p.jenis === 'rutin' && p.tanggal_mulai
    ? t.waktuMulai(formatTanggal(p.tanggal_mulai))
    : t.waktuSekali;
}

function BarisCatatan({ p }: { p: PesananUntukPetani }) {
  const a = p.alokasi_saya;
  const teks = a
    ? t.sudahDiambil(t.jumlahSaja(a.jumlah_kg, p.frekuensi_hari))
    : p.boleh_ambil_sebagian
      ? t.bolehSebagianKalimat
      : null;
  if (!teks) return null;
  return (
    <span className="inline-flex min-h-chip items-center gap-1.5 font-medium text-daun-tua">
      <Ikon nama="centang" ukuran={18} tebal={2.5} />
      {teks}
    </span>
  );
}

function KartuPesanan({
  p,
  nama,
  nomor,
  dipilih,
  onPilih,
}: {
  p: PesananUntukPetani;
  nama: string;
  /** Desktop: nomor di daftar dan peta; kartu menjadi tombol pilih. */
  nomor?: number;
  dipilih?: boolean;
  onPilih?: () => void;
}) {
  const isi = (
    <>
      {nomor !== undefined ? (
        <span
          aria-hidden="true"
          className={cx(
            'grid h-8 w-8 flex-none place-items-center rounded-full border-2 border-daun-tua font-semibold',
            dipilih ? 'bg-daun-tua text-putih' : 'bg-putih text-daun-tua',
          )}
        >
          {nomor}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        {nomor === undefined ? (
          <span className="flex items-center justify-between gap-2">
            <ChipJenis jenis={p.jenis} />
            <Ikon nama="panah-kanan" className="text-teks-pendukung" />
          </span>
        ) : null}
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-judul-bagian font-semibold">{p.nama_pembeli}</span>
          {nomor !== undefined ? <ChipJenis jenis={p.jenis} /> : null}
        </span>
        <span className="text-keterangan text-teks-pendukung">
          {t.subPembeli(p.jenis_usaha, p.desa_antar, p.jarak_km)}
        </span>
        <span>
          {barang(p, nama)}
          {nomor !== undefined ? <span className="text-teks-pendukung"> · {waktu(p)}</span> : null}
        </span>
        {nomor === undefined ? (
          <span className="flex flex-wrap items-baseline gap-x-2">
            <Uang nilai={p.harga_per_kg} besar />
            <span className="text-keterangan text-teks-pendukung">{t.perKgDan(waktu(p))}</span>
          </span>
        ) : null}
        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {p.uang_muka_diterima ? <ChipStatus status="uang-muka-ditahan" /> : null}
          <BarisCatatan p={p} />
        </span>
      </span>
      {nomor !== undefined ? (
        <span className="flex flex-none flex-col items-end">
          <Uang nilai={p.harga_per_kg} besar />
          <span className="text-keterangan text-teks-pendukung">{t.perKg}</span>
        </span>
      ) : null}
    </>
  );
  const kelas = cx(
    'fokus-cincin flex w-full items-start gap-4 rounded-lg bg-putih p-4 text-left text-teks no-underline',
    dipilih ? 'border-2 border-daun-tua' : 'border border-garis hover:border-garis-kuat',
  );
  if (onPilih)
    return (
      <button
        type="button"
        aria-pressed={dipilih}
        onClick={onPilih}
        className={cx(kelas, 'cursor-pointer')}
      >
        {isi}
      </button>
    );
  return (
    <Link to={`/pesanan/${encodeURIComponent(p.id)}`} className={kelas}>
      {isi}
    </Link>
  );
}

function PanelPilihan({
  p,
  nama,
  hasil,
  konfigurasi,
}: {
  p: PesananUntukPetani;
  nama: string;
  hasil: string;
  konfigurasi: Konfigurasi;
}) {
  const nilai = nilaiPesananPetani(p, konfigurasi);
  const jadwal =
    p.jenis === 'rutin' && p.tanggal_mulai && p.frekuensi_hari
      ? t.jadwalRingkasRutin(
          p.jumlah_kiriman,
          namaHari(p.tanggal_mulai),
          p.frekuensi_hari,
          formatTanggal(p.tanggal_mulai, { tanpaHari: true }),
        )
      : t.jadwalRingkasSekali(p.perkiraan_bulan_panen);
  return (
    <>
      <Kartu
        judul={p.nama_pembeli}
        keterangan={t.subPembeli(p.jenis_usaha, p.desa_antar, p.jarak_km)}
        kanan={<ChipJenis jenis={p.jenis} />}
        nadaKaki="uang"
        kaki={
          <>
            <Uang nilai={p.harga_per_kg} label={t.hargaPerKg} besar />
            {nilai ? (
              <Uang
                nilai={nilai.nilaiPesanan}
                label={t.nilaiSeluruh}
                keterangan={t.totalKet(p.jumlah_total_kg, p.jumlah_kiriman)}
                besar
              />
            ) : null}
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            <p className="m-0 font-semibold">{barang(p, nama)}</p>
            <p className="m-0 text-keterangan text-teks-pendukung">{jadwal}</p>
          </div>
          {p.uang_muka_diterima ? (
            <>
              <div>
                <ChipStatus status="uang-muka-ditahan" />
              </div>
              {nilai ? (
                <p className="m-0 text-keterangan text-teks-pendukung">
                  {t.dpDitahan(nilai.uangMuka, hasil)}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </Kartu>
      <Link to={`/pesanan/${encodeURIComponent(p.id)}`} className={kelasTombol('utama', true)}>
        {t.lihatPesanan}
      </Link>
    </>
  );
}

function KosongSekitar({
  radius,
  radiusMaks,
  onPerluas,
}: {
  radius: number;
  radiusMaks: number;
  onPerluas: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:max-w-dialog">
      <section className="flex flex-col items-center gap-3 rounded-lg border border-garis bg-putih px-4 pb-6 pt-8 text-center">
        <IlustrasiPesananKosong className="max-w-dialog" />
        <h2 className="m-0 text-judul-bagian font-semibold">{t.kosongJudul}</h2>
        <p className="m-0 text-teks-pendukung">{t.kosongIsi(radius)}</p>
        {radius < radiusMaks ? (
          <Tombol penuh onClick={onPerluas} className="mt-2">
            {t.cariSampai(radiusMaks)}
          </Tombol>
        ) : null}
      </section>
      <Link
        to="/hitung/tanaman"
        className="fokus-cincin flex items-center gap-3 rounded-lg border border-garis bg-putih p-4 text-teks no-underline hover:border-garis-kuat"
      >
        <span className="grid h-12 w-12 flex-none place-items-center rounded-md bg-daun-lembut text-daun-tua">
          <Ikon nama="kebun" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold">{t.sambilMenunggu}</span>
          <span className="text-teks-pendukung">{t.siapkanLahan}</span>
        </span>
        <Ikon nama="panah-kanan" className="text-teks-pendukung" />
      </Link>
    </div>
  );
}

export function HalamanPesananSekitar() {
  const [cari, setCari] = useSearchParams();
  const lebar = useLayarLebar();
  const { akun } = useSesi();
  const wilayahQ = useWilayahSatu(akun?.pengguna.wilayah_id ?? null);
  const konfigurasiQ = useKonfigurasi();
  const k = useKomoditasPeta();
  const konfigurasi = konfigurasiQ.data;
  const radiusAlamat = Number(cari.get('radius'));
  const radius =
    konfigurasi && radiusAlamat > 0
      ? Math.min(radiusAlamat, konfigurasi.radius_maks_km)
      : (konfigurasi?.radius_km ?? null);
  const pesananQ = usePesananSekitar(radius ? { radius_km: radius } : {});
  const filterAlamat = cari.get('jenis');
  const filter: Filter =
    filterAlamat === 'rutin' || filterAlamat === 'sekali_panen' ? filterAlamat : 'semua';
  const [pilihId, setPilihId] = useState<string | null>(null);

  const ubahCari = (kunci: string, nilai: string | null) => {
    const baru = new URLSearchParams(cari);
    if (nilai === null) baru.delete(kunci);
    else baru.set(kunci, nilai);
    setCari(baru, { replace: true });
  };

  const semua = pesananQ.data?.data ?? [];
  const tampil = semua.filter((p) => filter === 'semua' || p.jenis === filter);
  const desa = wilayahQ.data?.desa ?? null;
  const ket =
    radius === null
      ? null
      : filter === 'rutin'
        ? t.ketRutin(tampil.length)
        : filter === 'sekali_panen'
          ? t.ketSekali(tampil.length)
          : t.ketSemua(semua.length, radius, desa);

  let isi;
  if (pesananQ.isError || konfigurasiQ.isError)
    isi = <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>;
  else if (!konfigurasi || radius === null || pesananQ.isPending) isi = <Memuat />;
  else if (!semua.length)
    isi = (
      <KosongSekitar
        radius={radius}
        radiusMaks={konfigurasi.radius_maks_km}
        onPerluas={() => ubahCari('radius', String(konfigurasi.radius_maks_km))}
      />
    );
  else {
    const dipilih = tampil.find((p) => p.id === pilihId) ?? tampil[0] ?? null;
    const daftar = (
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {tampil.map((p) => (
          <li key={p.id}>
            <KartuPesanan
              p={p}
              nama={k.nama(p.komoditas_id)}
              {...(lebar
                ? {
                    nomor: semua.indexOf(p) + 1,
                    dipilih: p.id === dipilih?.id,
                    onPilih: () => setPilihId(p.id),
                  }
                : {})}
            />
          </li>
        ))}
      </ul>
    );
    isi = (
      <>
        <PilPilihan<Filter>
          label={t.filterLabel}
          nilai={filter}
          onPilih={(f) => ubahCari('jenis', f === 'semua' ? null : f)}
          opsi={[
            { nilai: 'semua', label: t.filterSemua },
            { nilai: 'rutin', label: t.rutin },
            { nilai: 'sekali_panen', label: t.sekaliPanen },
          ]}
        />
        {!lebar && ket ? <p className="m-0 text-keterangan text-teks-pendukung">{ket}</p> : null}
        {!tampil.length ? (
          <p className="m-0 text-teks-pendukung">{t.ketFilterKosong}</p>
        ) : lebar ? (
          <div className="flex items-start gap-6">
            <div className="min-w-0 flex-1">{daftar}</div>
            <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4">
              {wilayahQ.data ? (
                <PetaPembeli
                  pusat={wilayahQ.data}
                  desa={desa}
                  radius={radius}
                  titik={semua.map((p, i) => ({
                    id: p.id,
                    nomor: i + 1,
                    titik: p.titik_desa_antar,
                  }))}
                  dipilihId={dipilih?.id ?? null}
                />
              ) : null}
              {dipilih ? (
                <PanelPilihan
                  p={dipilih}
                  nama={k.nama(dipilih.komoditas_id)}
                  hasil={k.hasil(dipilih.komoditas_id)}
                  konfigurasi={konfigurasi}
                />
              ) : null}
            </aside>
          </div>
        ) : (
          daftar
        )}
      </>
    );
  }

  return <KerangkaPesanan keterangan={semua.length ? ket : null}>{isi}</KerangkaPesanan>;
}
