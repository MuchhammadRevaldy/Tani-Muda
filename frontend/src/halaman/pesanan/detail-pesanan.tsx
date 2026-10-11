/**
 * Detail pesanan dan ambil sebagian (papan 31; T4.19, PRD P0-21, P0-23, US-12, US-13). Kapasitas dari
 * tabel lahan (`lahan.kapasitas`, D-15) dicek dengan `cekAmbilSebagian`; jadwal yang masih terkejar
 * umur panen dari `kirimanTerkejar` (D-39); uang dari `hitungNilaiPesanan`. Mengambil memanggil
 * endpoint ambil pesanan (siklus berharga kesepakatan) lalu membuka kesepakatan.
 * Desktop: rincian di kiri, uang dan tombol di panel kanan.
 */
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  kunciIdempotenBaru,
  useAmbilPesanan,
  useDaftarResep,
  useKonfigurasi,
  useLahan,
  usePesananUntukPetani,
} from '../../api/kueri';
import { useHariIni, useSesi } from '../../api/sesi';
import type { Konfigurasi, Lahan, PesananUntukPetani, ResepTanam } from '../../api/tipe';
import { Banner } from '../../komponen/banner';
import { ChipStatus } from '../../komponen/chip-status';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilPilihan } from '../../komponen/pilihan';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { bulatkanRupiah, formatTanggal, namaHari } from '../../lib/format';
import { cekAmbilSebagian, jadwalKirimPesanan, kirimanTerkejar } from '../../lib/pesanan-lahan';
import {
  jumlahAwal,
  langkahJumlah,
  metodeUntukLahan,
  pilihanJumlah,
} from '../../lib/pesanan-tampil';
import { teksPesanan as t, teksJumlahPesanan, teksLamaSingkat } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { tautanWhatsApp, useKomoditasPeta } from './kerangka-pesanan';
import { KartuSaranPetak } from './saran-petak';
import { nilaiPesananPetani } from './sekitar';

/** Lahan yang punya resep untuk komoditas pesanan, dengan resep yang dipakai. */
export interface LahanCocok {
  lahan: Lahan;
  resep: ResepTanam;
  lubang: boolean;
}

export function lahanCocok(lahan: Lahan[], resep: ResepTanam[]): LahanCocok[] {
  return lahan.flatMap((l) => {
    const r = resep.find((x) => x.metode_id === metodeUntukLahan(l.jenis_lahan));
    return r ? [{ lahan: l, resep: r, lubang: l.kapasitas.satuan === 'lubang' }] : [];
  });
}

export const cek = (p: PesananUntukPetani, c: LahanCocok, jumlahKg: number) =>
  cekAmbilSebagian({
    jenis: p.jenis,
    jumlahKg,
    hasilPerSatuan: c.resep.hasil_per_satuan,
    kapasitas: c.lahan.kapasitas.sisa,
    ...(p.frekuensi_hari ? { frekuensiHari: p.frekuensi_hari } : {}),
    umurPanenHari: c.resep.umur_panen_hari,
  });

/** Jumlah terbesar yang muat di lahan, tidak lebih dari sisa pesanan. */
export function maksLahan(p: PesananUntukPetani, c: LahanCocok): number {
  const r = cek(p, c, p.sisa_kg);
  return r.ok ? Math.min(r.nilai.jumlahMaksimalKg, p.sisa_kg) : 0;
}

function Baris({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-keterangan text-teks-pendukung">{label}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  );
}

function KartuRincian({ p }: { p: PesananUntukPetani }) {
  const rutin = p.jenis === 'rutin' && p.frekuensi_hari && p.tanggal_mulai;
  return (
    <Kartu judul={t.rincian} tingkatJudul={2}>
      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3">
        <Baris label={t.harga}>
          <Uang nilai={p.harga_per_kg} /> {t.perKg}
        </Baris>
        {rutin ? (
          <>
            <Baris label={t.lama}>
              {t.lamaRutin(p.jumlah_kiriman * (p.frekuensi_hari ?? 0), p.jumlah_kiriman)}
            </Baris>
            <Baris label={t.kirim}>
              {t.tiapHari(
                namaHari(p.tanggal_mulai as string),
                p.frekuensi_hari as number,
                p.batas_jam_antar,
              )}
            </Baris>
            <Baris label={t.mulai}>{formatTanggal(p.tanggal_mulai as string)}</Baris>
          </>
        ) : (
          <>
            <Baris label={t.lama}>{t.lamaSekali}</Baris>
            <Baris label={t.kirim}>{t.saatPanen(p.perkiraan_bulan_panen)}</Baris>
            <Baris label={t.total}>{t.jumlahKg(p.jumlah_total_kg)}</Baris>
          </>
        )}
      </dl>
    </Kartu>
  );
}

export function KotakLahan({
  p,
  c,
  jumlahKg,
}: {
  p: PesananUntukPetani;
  c: LahanCocok;
  jumlahKg: number;
}) {
  const r = cek(p, c, jumlahKg);
  if (!r.ok) return null;
  const maks = maksLahan(p, c);
  const jumlah = (n: number) => t.jumlahSaja(n, p.frekuensi_hari);
  const sisa = t.satuanLahan(c.lahan.kapasitas.sisa, c.lubang);
  const [ikon, kelas, judul, isi] =
    maks <= 0
      ? (['peringatan', 'bg-tomat-lembut text-tomat-teks', t.penuhJudul, t.penuhIsi] as const)
      : r.nilai.cukup
        ? ([
            'centang',
            'bg-daun-lembut text-daun-tua',
            t.cukupJudul(jumlah(maks)),
            t.cukupIsi(sisa, c.lahan.nama, jumlah(jumlahKg)),
          ] as const)
        : ([
            'peringatan',
            'bg-matahari-lembut text-matahari-teks',
            t.kurangJudul(jumlah(maks)),
            t.kurangIsi(jumlah(maks)),
          ] as const);
  return (
    <div role="status" className={cx('flex items-start gap-3 rounded-md p-4', kelas)}>
      <Ikon nama={ikon} className="mt-0.5" tebal={2.5} />
      <div className="flex flex-col gap-0.5 text-teks">
        <p className="m-0 font-semibold">{judul}</p>
        <p className="m-0">{isi}</p>
      </div>
    </div>
  );
}

export function PemilihJumlah({
  p,
  jumlahKg,
  maks,
  onUbah,
}: {
  p: PesananUntukPetani;
  jumlahKg: number;
  maks: number | null;
  onUbah: (n: number) => void;
}) {
  const langkah = langkahJumlah(p.sisa_kg);
  const bulat = (n: number) => Math.round(n * 10) / 10;
  const tombol =
    'fokus-cincin grid h-kontrol w-kontrol flex-none cursor-pointer place-items-center rounded-md border-2 border-daun-tua bg-putih text-daun-tua disabled:cursor-not-allowed disabled:border-garis disabled:text-teks-pendukung';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t.kurangi}
          disabled={jumlahKg <= langkah}
          onClick={() => onUbah(bulat(Math.max(langkah, jumlahKg - langkah)))}
          className={tombol}
        >
          <Ikon nama="kurang" />
        </button>
        <p className="m-0 flex flex-1 flex-col items-center" aria-live="polite">
          <span className="text-tampil-1 font-semibold">{t.jumlahKg(jumlahKg)}</span>
          <span className="text-keterangan text-teks-pendukung">
            {t.satuanJumlah(p.frekuensi_hari, p.sisa_kg)}
          </span>
        </p>
        <button
          type="button"
          aria-label={t.tambahi}
          disabled={jumlahKg >= p.sisa_kg}
          onClick={() => onUbah(bulat(Math.min(p.sisa_kg, jumlahKg + langkah)))}
          className={tombol}
        >
          <Ikon nama="tambah" />
        </button>
      </div>
      <PilPilihan<string>
        label={t.pilihanJumlahLabel}
        nilai={String(jumlahKg)}
        onPilih={(v) => onUbah(Number(v))}
        opsi={pilihanJumlah(p.sisa_kg, maks).map((n) => ({
          nilai: String(n),
          label: t.jumlahKg(n),
        }))}
      />
    </div>
  );
}

function KartuUang({
  p,
  jumlahKg,
  jumlahKiriman,
  konfigurasi,
}: {
  p: PesananUntukPetani;
  jumlahKg: number;
  jumlahKiriman: number;
  konfigurasi: Konfigurasi;
}) {
  const perKiriman = bulatkanRupiah(jumlahKg * p.harga_per_kg);
  const total = perKiriman * jumlahKiriman;
  const uangMuka = bulatkanRupiah((total * konfigurasi.persen_uang_muka) / 100);
  const rutin = p.jenis === 'rutin' && p.frekuensi_hari;
  return (
    <Kartu
      judul={t.uangJudul}
      tingkatJudul={2}
      nadaKaki="uang"
      kaki={
        <>
          <Uang
            nilai={perKiriman}
            label={t.perKiriman}
            keterangan={t.perKirimanKet(jumlahKg, p.harga_per_kg)}
            besar
          />
          {rutin ? (
            <Uang
              nilai={total}
              label={t.totalSelama(teksLamaSingkat(jumlahKiriman * (p.frekuensi_hari ?? 0)))}
              keterangan={t.jumlahKirimanKet(jumlahKiriman)}
              besar
            />
          ) : null}
        </>
      }
    >
      <p className="m-0">{t.uangKet(uangMuka)}</p>
    </Kartu>
  );
}

function Isi({ p, konfigurasi }: { p: PesananUntukPetani; konfigurasi: Konfigurasi }) {
  const lebar = useLayarLebar();
  const navigate = useNavigate();
  const hariIni = useHariIni();
  const { akun } = useSesi();
  const k = useKomoditasPeta();
  const lahanQ = useLahan();
  const resepQ = useDaftarResep({ komoditas_id: p.komoditas_id });
  const ambil = useAmbilPesanan();
  const [lahanId, setLahanId] = useState<string | null>(null);
  const [jumlahPilih, setJumlahPilih] = useState<number | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [kunci] = useState(kunciIdempotenBaru);

  const nama = k.nama(p.komoditas_id);
  const nilai = nilaiPesananPetani(p, konfigurasi);
  const cocok = lahanCocok(lahanQ.data ?? [], resepQ.data ?? []);
  const terbaik = [...cocok].sort((a, b) => maksLahan(p, b) - maksLahan(p, a))[0] ?? null;
  const c = cocok.find((x) => x.lahan.id === lahanId) ?? terbaik;
  const maks = c ? maksLahan(p, c) : null;
  const jumlahKg = Math.min(jumlahPilih ?? jumlahAwal(p.sisa_kg, maks), p.sisa_kg);
  const r = c ? cek(p, c, jumlahKg) : null;
  const jadwal = jadwalKirimPesanan({
    jenis: p.jenis,
    tanggalMulai: p.tanggal_mulai,
    frekuensiHari: p.frekuensi_hari,
    jumlahKiriman: p.jumlah_kiriman,
    perkiraanBulanPanen: p.perkiraan_bulan_panen,
  });
  const terkejar = c ? kirimanTerkejar(jadwal, hariIni, c.resep.umur_panen_hari) : jadwal;
  const nonaktif = akun?.pengguna.status_akun === 'dinonaktifkan_sementara';
  const bisaAmbil =
    !nonaktif && !!c && !!r?.ok && r.nilai.cukup && terkejar.length > 0 && jumlahKg > 0;
  const wa = tautanWhatsApp(konfigurasi.kontak_admin.whatsapp);

  async function kirim() {
    if (!c) return;
    setGalat(null);
    try {
      await ambil.mutateAsync({
        id: p.id,
        jumlah_kg: jumlahKg,
        lahan_id: c.lahan.id,
        kunci_idempoten: kunci,
      });
      navigate(`/pesanan/${encodeURIComponent(p.id)}/kesepakatan`);
    } catch (e) {
      if (adalahGalatApi(e) && e.kode === 'MELEBIHI_PESANAN') {
        setJumlahPilih(null);
        setGalat(t.sisaBerubah(p.sisa_kg));
      } else setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const kepala = (
    <div className="flex flex-col gap-3">
      <Link
        to="/pesanan"
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{t.kembaliSekitar}</span>
      </Link>
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-judul-halaman font-semibold">
          {teksJumlahPesanan(p, nama, p.jumlah_per_kiriman_kg ?? p.jumlah_total_kg)}
        </h1>
        <p className="m-0 text-keterangan text-teks-pendukung">
          {[p.nama_pembeli, p.desa_antar, t.jarakDariKebun(p.jarak_km)].join(' · ')}
        </p>
      </div>
      {p.uang_muka_diterima ? (
        <div className="flex flex-col items-start gap-2">
          <ChipStatus status="uang-muka-ditahan" />
          {nilai ? (
            <p className="m-0 text-keterangan text-teks-pendukung">
              {t.dpDitahan(nilai.uangMuka, k.hasil(p.komoditas_id))}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  // Petani yang sudah mengambil pesanan ini: tidak bisa mengambil lagi (satu alokasi, D-39).
  const a = p.alokasi_saya;
  const sudahAmbil = a ? (
    <Banner judul={t.sudahAmbilJudul(t.jumlahSaja(a.jumlah_kg, p.frekuensi_hari))}>
      {a.status === 'menunggu_kesepakatan' ? t.sudahAmbilMenunggu : t.sudahAmbilJalan}
    </Banner>
  ) : null;

  let ambilan: ReactNode;
  if (a) ambilan = null;
  else if (lahanQ.isPending || resepQ.isPending) ambilan = <Memuat />;
  else if (!cocok.length)
    ambilan = (
      <div className="flex flex-col gap-3 rounded-md bg-embun-pagi p-4">
        <p className="m-0 font-semibold">
          {lahanQ.data?.length ? t.lahanTidakCocok(nama) : t.belumAdaLahan}
        </p>
        <p className="m-0">{lahanQ.data?.length ? t.lahanTidakCocokIsi : t.belumAdaLahanIsi}</p>
        <Link to="/lahan" className={kelasTombol('sekunder', true)}>
          {t.keLahanSaya}
        </Link>
      </div>
    );
  else if (c)
    ambilan = (
      <>
        {cocok.length > 1 ? (
          <div className="flex flex-col gap-2">
            <p className="m-0 font-semibold">{t.pilihLahan}</p>
            <PilPilihan<string>
              label={t.pilihLahan}
              gaya="segmen"
              nilai={c.lahan.id}
              onPilih={(id) => {
                setLahanId(id);
                setJumlahPilih(null);
              }}
              opsi={cocok.map((x) => ({ nilai: x.lahan.id, label: x.lahan.nama }))}
            />
          </div>
        ) : null}
        <PemilihJumlah p={p} jumlahKg={jumlahKg} maks={maks} onUbah={setJumlahPilih} />
        <KotakLahan p={p} c={c} jumlahKg={jumlahKg} />
        {c.resep.contoh ? (
          <LabelKecil nada="contoh" className="self-start">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : null}
        {!terkejar.length ? (
          <Banner jenis="bahaya">{t.tidakTerkejarSemua}</Banner>
        ) : terkejar[0] && terkejar[0].ke > 1 ? (
          <Banner>
            {t.ikutMulai(formatTanggal(terkejar[0].tanggal, { tanpaHari: true }), terkejar.length)}
          </Banner>
        ) : null}
      </>
    );

  const kartuAmbil = a ? null : (
    <Kartu judul={t.mauAmbil} keterangan={t.mauAmbilKet} tingkatJudul={2}>
      <div className="flex flex-col gap-4">{ambilan}</div>
    </Kartu>
  );

  const tindakan = a ? (
    a.status === 'menunggu_kesepakatan' ? (
      <Link
        to={`/pesanan/${encodeURIComponent(p.id)}/kesepakatan`}
        className={kelasTombol('utama', true)}
      >
        {t.periksaKesepakatan}
      </Link>
    ) : (
      <Link to="/pesanan/kiriman" className={kelasTombol('sekunder', true)}>
        {t.keKirimanSaya}
      </Link>
    )
  ) : nonaktif ? (
    <div className="flex flex-col gap-3">
      <Banner jenis="peringatan">
        {t.nonaktif(konfigurasi.kontak_admin.whatsapp, konfigurasi.kontak_admin.jam_layanan)}
      </Banner>
      {wa ? (
        <a href={wa} target="_blank" rel="noreferrer" className={kelasTombol('sekunder', true)}>
          {t.hubungiAdmin}
        </a>
      ) : null}
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {galat ? <PesanKolom id="galat-ambil" galat={galat} /> : null}
      <Tombol penuh disabled={!bisaAmbil || ambil.isPending} onClick={() => void kirim()}>
        {ambil.isPending
          ? t.mengambil
          : p.jenis === 'rutin' && p.frekuensi_hari
            ? t.ambilRutin(jumlahKg, p.frekuensi_hari)
            : t.ambilSekali(jumlahKg)}
      </Tombol>
    </div>
  );

  const uang = (
    <KartuUang
      p={p}
      jumlahKg={a ? a.jumlah_kg : jumlahKg}
      jumlahKiriman={Math.max(1, terkejar.length)}
      konfigurasi={konfigurasi}
    />
  );
  const saran =
    c && !a && p.jenis === 'rutin' && p.frekuensi_hari ? (
      <KartuSaranPetak
        kiriman={terkejar}
        frekuensiHari={p.frekuensi_hari}
        umurPanenHari={c.resep.umur_panen_hari}
        hasilPerSatuan={c.resep.hasil_per_satuan}
        jumlahKg={jumlahKg}
        lubang={c.lubang}
      />
    ) : null;

  if (lebar)
    return (
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {kepala}
          {sudahAmbil}
          <KartuRincian p={p} />
          {kartuAmbil}
          {saran}
        </div>
        <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4 pt-14">
          {uang}
          {tindakan}
        </aside>
      </div>
    );
  return (
    <div className="flex flex-col gap-4">
      {kepala}
      {sudahAmbil}
      <KartuRincian p={p} />
      {kartuAmbil}
      {saran}
      {uang}
      {tindakan}
    </div>
  );
}

export function HalamanDetailPesanan() {
  const { id } = useParams();
  const pesananQ = usePesananUntukPetani(id ?? null);
  const konfigurasiQ = useKonfigurasi();
  if (pesananQ.isError)
    return (
      <div className="flex flex-col gap-4">
        <h1 className="m-0 text-judul-halaman font-semibold">{t.tidakDitemukan}</h1>
        <Link to="/pesanan" className={kelasTombol('sekunder')}>
          {t.kembaliDaftar}
        </Link>
      </div>
    );
  if (!pesananQ.data || !konfigurasiQ.data) return <Memuat />;
  return <Isi p={pesananQ.data} konfigurasi={konfigurasiQ.data} />;
}
