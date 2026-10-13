/**
 * Dasbor pesanan aktif pembeli (papan 36, T4.22, PRD P0-24, US-16): banner kiriman tiba, pesanan
 * dengan kebun pemenuh (hanya nama desa dan jarak, D-06), penggaris umur tanam tiap kebun, bagian
 * yang belum ada petani, uang ditahan dan sudah cair, kiriman berikutnya. Pesanan yang belum
 * dibayar menawarkan "Bayar uang muka" (T4.41); pesanan bisa dibatalkan (P0-27).
 * HP diturunkan dari papan desktop (D-07): satu kolom, ringkasan uang di bawah daftar pesanan.
 */
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import { usePukul } from '../../api/use-pukul';
import {
  useBatalkanPesanan,
  useKonfigurasi,
  usePesananPembeli,
  useRiwayatPembayaran,
} from '../../api/kueri';
import { useHariIni, useSesi } from '../../api/sesi';
import type { KebunUntukPembeli, Pengiriman, PesananDenganKebun } from '../../api/tipe';
import { Avatar } from '../../komponen/avatar';
import { ChipStatus } from '../../komponen/chip-status';
import { Dialog } from '../../komponen/dialog';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { PenggarisUmurTanam } from '../../komponen/penggaris-umur-tanam';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { formatTanggal, namaHari } from '../../lib/format';
import { tambahHari } from '../../lib/tanggal';
import { teksPembeli as t } from '../../teks/pembeli';
import { kg, teksFrekuensiKirim } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';
import { teksGagalMuat } from '../../teks/galat-api';
import { Memuat } from '../memuat';
import { useKomoditasPeta } from '../pesanan/kerangka-pesanan';
import { StatusVerifikasi } from './status-verifikasi';

/** Pesanan yang tampil di Pesanan aktif: belum selesai dan belum dibatalkan. */
const aktif = (p: PesananDenganKebun) => p.status !== 'selesai' && p.status !== 'dibatalkan';

function BannerTiba({
  x,
  p,
  komoditas,
}: {
  x: Pengiriman;
  p: PesananDenganKebun;
  komoditas: string;
}) {
  const jam = usePukul();
  const petani = p.kebun.find((k) => k.alokasi_id === x.alokasi_id)?.nama_petani ?? '';
  return (
    <section className="flex flex-col gap-3 rounded-lg border-1.5 border-garis-kuat bg-putih p-4 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex flex-col items-start gap-2">
        <ChipStatus status="menunggu-konfirmasi" />
        <h2 className="m-0 text-judul-bagian font-semibold">
          {t.kirimanTiba(komoditas.toLowerCase(), petani)}
        </h2>
        <p className="m-0 text-keterangan text-teks-pendukung">
          {t.kirimanTibaKet(jam(x.dikirim_pada), x.jumlah_kg, jam(x.batas_periksa_pada))}
        </p>
      </div>
      <Link
        to={`/pembeli/kiriman/${encodeURIComponent(x.id)}`}
        className={kelasTombol('utama') + ' flex-none'}
      >
        {t.periksaKiriman}
      </Link>
    </section>
  );
}

function BarisKebun({
  k,
  frek,
  menunggu,
  lebar,
}: {
  k: KebunUntukPembeli;
  frek: number | null;
  menunggu: Pengiriman | undefined;
  lebar: boolean;
}) {
  const tumbuh = k.hari_ke !== null && k.hari_ke >= 0 && k.hari_panen;
  return (
    <li className="flex flex-col gap-3 border-b border-garis py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Avatar nama={k.nama_petani} gaya="inisial" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold">{t.kebunPetani(k.nama_petani, k.desa)}</span>
          <span className="text-keterangan text-teks-pendukung">
            {t.kebunKet(k.jumlah_kg, frek, k.jarak_km)}
          </span>
        </div>
        {k.foto_terbaru ? (
          <img
            src={k.foto_terbaru}
            alt={t.fotoKebun(k.nama_petani)}
            className="aspect-foto w-20 flex-none rounded-sm border border-garis object-cover"
          />
        ) : null}
      </div>
      {menunggu ? (
        <div>
          <ChipStatus status="menunggu-konfirmasi" />
        </div>
      ) : null}
      {tumbuh ? (
        <div className="flex flex-col gap-1">
          <PenggarisUmurTanam
            varian={lebar ? 'lebar' : 'hp'}
            hariIni={k.hari_ke as number}
            hariPanen={k.hari_panen as number}
            jadwal={[{ hari: k.hari_panen as number, label: 'Panen', status: 'panen' }]}
            tampilkanDaftar={false}
          />
          <p className="m-0 text-keterangan text-teks-pendukung">
            {t.hariKeDari(k.hari_ke as number, k.hari_panen as number)}
            {k.perkiraan_tanggal_panen
              ? ` · ${t.panenSekitar(formatTanggal(k.perkiraan_tanggal_panen))}`
              : ''}
          </p>
        </div>
      ) : k.perkiraan_tanggal_panen && k.hari_panen ? (
        <p className="m-0 text-keterangan text-teks-pendukung">
          {t.belumTanam(formatTanggal(tambahHari(k.perkiraan_tanggal_panen, -k.hari_panen)))}
        </p>
      ) : null}
    </li>
  );
}

function KartuPesanan({
  p,
  komoditas,
  hariKembali,
  lebar,
  onBatal,
}: {
  p: PesananDenganKebun;
  komoditas: string;
  hariKembali: number;
  lebar: boolean;
  /** Pesan hasil pembatalan; kartu ini hilang dari Pesanan aktif setelah dibatalkan. */
  onBatal: (pesan: string) => void;
}) {
  const batalkan = useBatalkanPesanan();
  const [tanya, setTanya] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const rutin = p.jenis === 'rutin' && p.frekuensi_hari && p.tanggal_mulai;
  const target = p.jumlah_per_kiriman_kg ?? p.jumlah_total_kg;
  const terisi = p.kebun.reduce((a, k) => a + k.jumlah_kg, 0);
  const sisa = Math.round((target - terisi) * 100) / 100;
  const belumBayar = p.status === 'menunggu_pembayaran';
  // Desktop: chip di kanan judul. HP: di bawah judul supaya judul tidak terjepit.
  const chip = belumBayar ? null : p.kiriman_menunggu.length ? (
    <ChipStatus status="menunggu-konfirmasi" />
  ) : (
    <ChipStatus status="uang-muka-ditahan" />
  );

  async function yaBatalkan() {
    setGalat(null);
    try {
      const r = await batalkan.mutateAsync(p.id);
      setTanya(false);
      onBatal(t.sudahDibatalkan(r.dikembalikan_ke_pembeli, r.kompensasi_petani));
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  return (
    <Kartu
      judul={
        rutin
          ? t.judulRutin(komoditas, p.jumlah_per_kiriman_kg ?? 0, p.frekuensi_hari as number)
          : t.judulSekali(komoditas, p.jumlah_total_kg)
      }
      tingkatJudul={2}
      keterangan={
        rutin
          ? t.subRutin(
              p.kiriman_berikutnya?.ke ?? null,
              p.jumlah_kiriman,
              namaHari(p.tanggal_mulai as string),
              p.harga_per_kg,
              p.batas_jam_antar,
            )
          : t.subSekali(p.perkiraan_bulan_panen, p.harga_per_kg)
      }
      kanan={lebar ? chip : null}
    >
      <div className="flex flex-col gap-4">
        {!lebar && chip ? <div>{chip}</div> : null}
        {belumBayar ? (
          <div className="flex flex-col items-start gap-3 rounded-md bg-matahari-lembut p-4">
            <p className="m-0 font-semibold">{t.belumDibayar}</p>
            <p className="m-0 text-keterangan">{t.belumDibayarKet}</p>
            <Link
              to={`/pembeli/pesanan/${encodeURIComponent(p.id)}/bayar`}
              className={kelasTombol('utama')}
            >
              {t.bayarUangMuka(p.uang_muka + p.biaya_layanan)}
            </Link>
          </div>
        ) : p.kebun.length ? (
          <ul className="m-0 list-none p-0">
            {p.kebun.map((k) => (
              <BarisKebun
                key={k.alokasi_id}
                k={k}
                frek={p.frekuensi_hari}
                menunggu={p.kiriman_menunggu.find((x) => x.alokasi_id === k.alokasi_id)}
                lebar={lebar}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="m-0 font-semibold">{t.menungguPetani}</p>
            <p className="m-0 text-keterangan text-teks-pendukung">{t.menungguPetaniKet}</p>
          </div>
        )}
        {!belumBayar && p.kebun.length && sisa > 0 ? (
          <div className="flex flex-col gap-1 rounded-md border-2 border-dashed border-garis-kuat p-4">
            <p className="m-0 font-semibold">
              {t.belumAdaPetani(
                `${kg(sisa)} kg${p.frekuensi_hari ? ` ${teksFrekuensiKirim(p.frekuensi_hari)}` : ''}`,
              )}
            </p>
            <p className="m-0 text-keterangan text-teks-pendukung">
              {t.belumAdaPetaniKet(hariKembali)}
            </p>
          </div>
        ) : null}
        {galat ? <PesanKolom id={`galat-batal-${p.id}`} galat={galat} /> : null}
        <button
          type="button"
          onClick={() => setTanya(true)}
          className="fokus-cincin inline-flex min-h-sentuh cursor-pointer items-center self-start rounded-sm border-0 bg-transparent px-1 font-semibold text-tomat-teks underline underline-offset-3"
        >
          {t.batalkan}
        </button>
        <Dialog terbuka={tanya} onTutup={() => setTanya(false)} judul={t.batalkanJudul}>
          <div className="flex flex-col gap-4">
            <p className="m-0">{t.batalkanIsi}</p>
            <Tombol penuh disabled={batalkan.isPending} onClick={() => void yaBatalkan()}>
              {batalkan.isPending ? t.membatalkan : t.yaBatalkan}
            </Tombol>
            <Tombol varian="sekunder" penuh onClick={() => setTanya(false)}>
              {t.tidakJadi}
            </Tombol>
          </div>
        </Dialog>
      </div>
    </Kartu>
  );
}

export function HalamanDasborPembeli() {
  const lebar = useLayarLebar();
  const hariIni = useHariIni();
  const { akun } = useSesi();
  const pesananQ = usePesananPembeli();
  const bayarQ = useRiwayatPembayaran({ per_halaman: 100 });
  const konfigurasiQ = useKonfigurasi();
  const k = useKomoditasPeta();
  const [dibatalkan, setDibatalkan] = useState<string | null>(null);
  const profil = akun?.profil_pembeli ?? null;
  if (akun && !profil) return <Navigate to="/pembeli/daftar" replace />;
  if (pesananQ.isError)
    return <p className="m-0 text-teks-pendukung">{teksGagalMuat(pesananQ.error)}</p>;
  if (!pesananQ.data || !konfigurasiQ.data) return <Memuat />;

  const daftar = pesananQ.data.filter(aktif);
  const jumlahKebun = daftar.reduce((a, p) => a + p.kebun.length, 0);
  const menunggu = daftar.flatMap((p) => p.kiriman_menunggu.map((x) => ({ x, p })));
  const ditahan = daftar.filter((p) => p.saldo_uang_muka > 0);
  const totalDitahan = ditahan.reduce((a, p) => a + p.saldo_uang_muka, 0);
  const sudahCair = (bayarQ.data?.data ?? [])
    .filter((b) => (b.jenis === 'pencairan' || b.jenis === 'kompensasi') && b.status === 'cair')
    .reduce((a, b) => a + b.nominal, 0);
  const berikutnya = daftar
    .flatMap((p) => (p.kiriman_berikutnya ? [{ x: p.kiriman_berikutnya, p }] : []))
    .sort((a, b) => a.x.tanggal_jadwal.localeCompare(b.x.tanggal_jadwal));

  const kepala = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-judul-halaman font-semibold">{t.judulDasbor}</h1>
        <p className="m-0 text-keterangan text-teks-pendukung">
          {t.ketDasbor(formatTanggal(hariIni, { denganTahun: true }), daftar.length, jumlahKebun)}
        </p>
      </div>
      {profil?.status_verifikasi === 'terverifikasi' ? (
        <Link to="/pembeli/pesanan/baru" className={kelasTombol('sekunder')}>
          {t.buatPesanan}
        </Link>
      ) : null}
    </div>
  );

  const uang = (
    <Kartu
      judul={t.uangAnda}
      keterangan={t.uangAndaKet}
      tingkatJudul={2}
      nadaKaki="uang"
      kaki={
        <div className="flex flex-col gap-3">
          <Uang nilai={totalDitahan} label={t.uangMukaDitahan} besar />
          <Uang nilai={sudahCair} label={t.sudahCair} besar />
        </div>
      }
    >
      {ditahan.length ? (
        <dl className="m-0 flex flex-col gap-2">
          {ditahan.map((p) => (
            <div key={p.id} className="flex justify-between gap-3">
              <dt>{k.nama(p.komoditas_id)}</dt>
              <dd className="m-0">
                <Uang nilai={p.saldo_uang_muka} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Kartu>
  );

  const kiriman = (
    <Kartu judul={t.kirimanBerikutnya} tingkatJudul={2}>
      {berikutnya.length ? (
        <ul className="m-0 flex list-none flex-col p-0">
          {berikutnya.map(({ x, p }) => (
            <li
              key={x.id}
              className="flex flex-col gap-0.5 border-b border-garis py-3 first:pt-0 last:border-b-0 last:pb-0"
            >
              <span className="font-semibold">{formatTanggal(x.tanggal_jadwal)}</span>
              <span className="text-teks-pendukung">
                {t.kirimanBerikutnyaIsi(
                  k.nama(p.komoditas_id),
                  x.jumlah_kg,
                  p.kebun.find((y) => y.alokasi_id === x.alokasi_id)?.nama_petani ?? '',
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-teks-pendukung">{t.belumAdaKiriman}</p>
      )}
    </Kartu>
  );

  const isi = daftar.length ? (
    daftar.map((p) => (
      <KartuPesanan
        key={p.id}
        p={p}
        komoditas={k.nama(p.komoditas_id)}
        hariKembali={konfigurasiQ.data.hari_kembali_uang_muka}
        lebar={lebar}
        onBatal={setDibatalkan}
      />
    ))
  ) : (
    <section className="flex flex-col items-start gap-3 rounded-lg border border-garis bg-putih p-6">
      <h2 className="m-0 text-judul-bagian font-semibold">{t.belumAdaPesanan}</h2>
      <p className="m-0 text-teks-pendukung">{t.belumAdaPesananKet}</p>
    </section>
  );

  return (
    <>
      {kepala}
      {profil ? <StatusVerifikasi profil={profil} /> : null}
      {dibatalkan ? (
        <p
          role="status"
          className="m-0 rounded-md bg-daun-lembut px-4 py-3 font-medium text-daun-tua"
        >
          {dibatalkan}
        </p>
      ) : null}
      {menunggu.map(({ x, p }) => (
        <BannerTiba key={x.id} x={x} p={p} komoditas={k.nama(p.komoditas_id)} />
      ))}
      {lebar ? (
        <div className="flex items-start gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-6">{isi}</div>
          <aside className="flex w-panel flex-none flex-col gap-6">
            {uang}
            {kiriman}
          </aside>
        </div>
      ) : (
        <>
          {isi}
          {uang}
          {kiriman}
        </>
      )}
    </>
  );
}
