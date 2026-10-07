/**
 * Kesepakatan digital (papan 32; T4.20, PRD P0-22): ringkasan, standar kualitas, aturan gagal panen
 * D-03 (tanpa denda, batas hari dari konfigurasi), uang dan pembayaran, pernyataan, tombol Setuju /
 * Tanya pembeli dulu. Sebelum setuju jumlah masih bisa diubah (D-40). Setuju menyimpan waktu setuju
 * di alokasi; server membuat jadwal kiriman yang masih terkejar dan mengaktifkan setiap petak dengan
 * jadwal perawatannya sendiri (D-39, D-40).
 * Desktop: ringkasan dan aturan di kiri, uang, pernyataan, dan tombol di panel kanan.
 */
import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  useKirimanSaya,
  useKonfigurasi,
  usePesananUntukPetani,
  useResep,
  useSetujuiKesepakatan,
  useSiklus,
} from '../../api/kueri';
import { useHariIni } from '../../api/sesi';
import type { AlokasiPesanan, Konfigurasi, PesananUntukPetani } from '../../api/tipe';
import { Banner } from '../../komponen/banner';
import { ChipStatus } from '../../komponen/chip-status';
import { Dialog } from '../../komponen/dialog';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { DaftarSyarat } from '../../komponen/pelengkap';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { bulatkanRupiah, formatTanggal, namaHari } from '../../lib/format';
import { jadwalKirimPesanan, kirimanTerkejar, type JadwalKirim } from '../../lib/pesanan-lahan';
import { teksPesanan as t, teksJumlahPesanan, teksLamaSingkat } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { tautanWhatsApp, useKomoditasPeta } from './kerangka-pesanan';
import { KartuSaranPetak } from './saran-petak';
import { DialogUbahJumlah } from './ubah-jumlah';

function Baris({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-garis py-3 first:pt-0 last:border-b-0 last:pb-0">
      <dt className="text-keterangan text-teks-pendukung">{label}</dt>
      <dd className="m-0 font-medium">{children}</dd>
    </div>
  );
}

function teksJadwal(p: PesananUntukPetani, jadwal: JadwalKirim[]): string {
  const awal = jadwal[0];
  const akhir = jadwal[jadwal.length - 1];
  if (!awal || !akhir) return '';
  if (p.jenis !== 'rutin' || !p.frekuensi_hari)
    return t.jadwalSekali(formatTanggal(awal.tanggal, { denganTahun: true }));
  const dari = formatTanggal(awal.tanggal, { denganTahun: true });
  const sampai = formatTanggal(akhir.tanggal, { denganTahun: true });
  return p.frekuensi_hari === 7
    ? t.jadwalRutin(namaHari(awal.tanggal), jadwal.length, dari, sampai, p.batas_jam_antar)
    : t.jadwalTiap(p.frekuensi_hari, jadwal.length, dari, sampai, p.batas_jam_antar);
}

function Isi({
  p,
  a,
  konfigurasi,
}: {
  p: PesananUntukPetani;
  a: AlokasiPesanan;
  konfigurasi: Konfigurasi;
}) {
  const lebar = useLayarLebar();
  const hariIni = useHariIni();
  const k = useKomoditasPeta();
  const siklusQ = useSiklus(a.siklus_ids[0] ?? null);
  const resepQ = useResep(siklusQ.data?.resep_id ?? null);
  const kirimanQ = useKirimanSaya();
  const setujui = useSetujuiKesepakatan();
  const [centang, setCentang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [tanya, setTanya] = useState(false);
  const [ubahJumlah, setUbahJumlah] = useState(false);

  const menunggu = a.status === 'menunggu_kesepakatan';
  const nama = k.nama(p.komoditas_id);
  const hasil = k.hasil(p.komoditas_id);
  // Sudah disepakati: jadwal dari kiriman yang dibuat server. Belum: kiriman yang masih terkejar.
  const jadwal: JadwalKirim[] = menunggu
    ? kirimanTerkejar(
        jadwalKirimPesanan({
          jenis: p.jenis,
          tanggalMulai: p.tanggal_mulai,
          frekuensiHari: p.frekuensi_hari,
          jumlahKiriman: p.jumlah_kiriman,
          perkiraanBulanPanen: p.perkiraan_bulan_panen,
        }),
        hariIni,
        resepQ.data?.umur_panen_hari ?? 0,
      )
    : (kirimanQ.data ?? [])
        .filter((x) => x.alokasi_id === a.id)
        .map((x) => ({ ke: x.ke, tanggal: x.tanggal_jadwal }));
  if ((menunggu && !resepQ.data) || (!menunggu && !kirimanQ.data)) return <Memuat />;

  const perKiriman = bulatkanRupiah(a.jumlah_kg * p.harga_per_kg);
  const n = Math.max(1, jadwal.length);
  const lama =
    p.jenis === 'rutin' && p.frekuensi_hari ? teksLamaSingkat(n * p.frekuensi_hari) : null;
  const jam =
    p.jenis === 'rutin' ? konfigurasi.jam_periksa_rutin : konfigurasi.jam_periksa_sekali_panen;
  const namaKecil = nama.toLowerCase();
  const awal = jadwal[0];
  const pernyataan =
    p.jenis === 'rutin' && p.frekuensi_hari && awal
      ? p.frekuensi_hari === 7
        ? t.pernyataanRutin(a.jumlah_kg, namaKecil, namaHari(awal.tanggal))
        : t.pernyataanTiap(a.jumlah_kg, namaKecil, p.frekuensi_hari)
      : t.pernyataanSekali(a.jumlah_kg, namaKecil);
  const wa = tautanWhatsApp(konfigurasi.kontak_admin.whatsapp);

  async function setuju() {
    setGalat(null);
    if (!centang) return setGalat(t.centangDulu);
    try {
      await setujui.mutateAsync(a.id);
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const kepala = (
    <div className="flex flex-col gap-3">
      <Link
        to={`/pesanan/${encodeURIComponent(p.id)}`}
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{t.kembaliDetail}</span>
      </Link>
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-judul-halaman font-semibold">{t.kesepakatanJudul}</h1>
        <p className="m-0 text-keterangan text-teks-pendukung">{t.kesepakatanKet}</p>
      </div>
      {!menunggu && a.disetujui_pada ? (
        <div className="flex flex-col gap-3 rounded-md border-1.5 border-daun-tua bg-daun-lembut p-4">
          <p className="m-0 flex items-start gap-2 font-semibold text-daun-tua">
            <Ikon nama="centang" tebal={2.5} className="mt-0.5" />
            {t.sudahSetujuJudul(formatTanggal(a.disetujui_pada.slice(0, 10)))}
          </p>
          {siklusQ.data?.tanggal_tanam ? (
            <p className="m-0">{t.sudahSetujuIsi(formatTanggal(siklusQ.data.tanggal_tanam))}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {a.siklus_ids.length ? (
              <Link
                to={`/kebun?daftar#kelompok-${encodeURIComponent(a.id)}`}
                className={kelasTombol('utama')}
              >
                {t.lihatJadwalTanam}
              </Link>
            ) : null}
            <Link to="/pesanan/kiriman" className={kelasTombol('sekunder')}>
              {t.keKirimanSaya}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );

  const ringkasan = (
    <Kartu judul={t.ringkasan} tingkatJudul={2}>
      <dl className="m-0 flex flex-col">
        <Baris label={t.pembeli}>{t.pembeliIsi(p.nama_pembeli, p.desa_antar)}</Baris>
        <Baris label={t.total}>
          <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span>{teksJumlahPesanan(p, nama, a.jumlah_kg)}</span>
            {menunggu ? (
              <button
                type="button"
                onClick={() => setUbahJumlah(true)}
                className="fokus-cincin -my-2 inline-flex min-h-sentuh cursor-pointer items-center gap-1 rounded-sm border-0 bg-transparent px-1 font-semibold text-daun-tua underline underline-offset-3"
              >
                <Ikon nama="pensil" ukuran={18} />
                {t.ubahJumlah}
              </button>
            ) : null}
          </span>
        </Baris>
        <Baris label={t.jadwalKirim}>{teksJadwal(p, jadwal)}</Baris>
        <Baris label={t.titikAntar}>
          {t.titikAntarIsi(p.alamat_antar ?? p.desa_antar, p.jarak_km)}
          {p.patokan ? (
            <span className="block font-normal text-teks-pendukung">{t.patokan(p.patokan)}</span>
          ) : null}
        </Baris>
        <Baris label={t.harga}>
          {lama ? t.hargaTetap(p.harga_per_kg, lama) : t.perKgSingkat(p.harga_per_kg)}
        </Baris>
      </dl>
    </Kartu>
  );

  const saran =
    menunggu && p.jenis === 'rutin' && p.frekuensi_hari && resepQ.data ? (
      <KartuSaranPetak
        kiriman={jadwal}
        frekuensiHari={p.frekuensi_hari}
        umurPanenHari={resepQ.data.umur_panen_hari}
        hasilPerSatuan={resepQ.data.hasil_per_satuan}
        jumlahKg={a.jumlah_kg}
        lubang={siklusQ.data?.jumlah_lubang != null}
      />
    ) : null;
  const dialogUbah = menunggu ? (
    <DialogUbahJumlah
      key={a.jumlah_kg}
      p={p}
      a={a}
      lahanId={siklusQ.data?.lahan_id ?? null}
      jadwal={jadwal}
      terbuka={ubahJumlah}
      onTutup={() => setUbahJumlah(false)}
    />
  ) : null;

  const standar = (
    <Kartu judul={t.standarJudul} tingkatJudul={2}>
      <div className="flex flex-col gap-4">
        <DaftarSyarat butir={p.standar_kualitas} />
        <p className="m-0 text-keterangan text-teks-pendukung">{t.standarKaki(hasil)}</p>
      </div>
    </Kartu>
  );

  const gagal = (
    <Kartu judul={t.gagalJudul} tingkatJudul={2}>
      <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
        {[t.gagal1(konfigurasi.hari_kabar_gagal_panen), t.gagal2, t.gagal3].map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="grid h-7 w-7 flex-none place-items-center rounded-full border-1.5 border-matahari bg-matahari-lembut font-semibold leading-5.5 text-matahari-teks">
              {i + 1}
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ol>
    </Kartu>
  );

  const bayar = (
    <Kartu
      judul={t.bayarJudul}
      tingkatJudul={2}
      nadaKaki="uang"
      kaki={
        <>
          <Uang
            nilai={perKiriman}
            label={t.perKiriman}
            keterangan={t.perKirimanKet(a.jumlah_kg, p.harga_per_kg)}
            besar
          />
          {lama ? (
            <Uang
              nilai={perKiriman * n}
              label={`${t.totalSemua} ${lama}`}
              keterangan={t.jumlahKirimanKet(n)}
              besar
            />
          ) : null}
        </>
      }
    >
      <div className="flex flex-col items-start gap-3">
        {p.uang_muka_diterima ? <ChipStatus status="uang-muka-ditahan" /> : null}
        <p className="m-0">{t.bayarIsi(hasil, jam)}</p>
      </div>
    </Kartu>
  );

  const tindakan = menunggu ? (
    <div className="flex flex-col gap-3">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border-1.5 border-garis-kuat bg-putih p-4">
        <input
          type="checkbox"
          checked={centang}
          onChange={(e) => {
            setCentang(e.target.checked);
            setGalat(null);
          }}
          aria-invalid={galat === t.centangDulu ? true : undefined}
          className="fokus-cincin mt-0.5 h-6 w-6 flex-none cursor-pointer accent-daun-tua"
        />
        <span>{pernyataan}</span>
      </label>
      {galat ? <PesanKolom id="galat-setuju" galat={galat} /> : null}
      <Tombol penuh disabled={setujui.isPending} onClick={() => void setuju()}>
        {setujui.isPending ? t.menyetujui : t.setuju}
      </Tombol>
      <Tombol varian="sekunder" penuh onClick={() => setTanya(true)}>
        {t.tanyaPembeli}
      </Tombol>
      <Dialog terbuka={tanya} onTutup={() => setTanya(false)} judul={t.tanyaJudul}>
        <div className="flex flex-col gap-4">
          <p className="m-0">{t.tanyaIsi(konfigurasi.kontak_admin.jam_layanan)}</p>
          {wa ? (
            <a href={wa} target="_blank" rel="noreferrer" className={kelasTombol('utama', true)}>
              {t.hubungiAdmin}
            </a>
          ) : null}
          <Tombol varian="sekunder" penuh onClick={() => setTanya(false)}>
            {teksUmum.tutup}
          </Tombol>
        </div>
      </Dialog>
    </div>
  ) : null;

  if (lebar)
    return (
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {kepala}
          {ringkasan}
          {saran}
          {standar}
          {gagal}
          {dialogUbah}
        </div>
        <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4 pt-14">
          {bayar}
          {tindakan}
        </aside>
      </div>
    );
  return (
    <div className="flex flex-col gap-4">
      {kepala}
      {ringkasan}
      {saran}
      {standar}
      {gagal}
      {bayar}
      {tindakan}
      {dialogUbah}
    </div>
  );
}

export function HalamanKesepakatan() {
  const { id } = useParams();
  const pesananQ = usePesananUntukPetani(id ?? null);
  const konfigurasiQ = useKonfigurasi();
  const p = pesananQ.data;
  if (pesananQ.isError || (p && !p.alokasi_saya))
    return (
      <div className="flex flex-col gap-4">
        <h1 className="m-0 text-judul-halaman font-semibold">{t.kesepakatanJudul}</h1>
        <Banner>{pesananQ.isError ? t.tidakDitemukan : t.belumAmbil}</Banner>
        <Link
          to={p ? `/pesanan/${encodeURIComponent(p.id)}` : '/pesanan'}
          className={kelasTombol('sekunder')}
        >
          {p ? t.kembaliDetail : t.kembaliDaftar}
        </Link>
      </div>
    );
  if (!p?.alokasi_saya || !konfigurasiQ.data) return <Memuat />;
  return <Isi p={p} a={p.alokasi_saya} konfigurasi={konfigurasiQ.data} />;
}
