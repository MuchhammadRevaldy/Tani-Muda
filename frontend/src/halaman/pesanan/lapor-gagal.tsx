/**
 * Kabari tidak sanggup kirim (halaman turunan 51; T4.27, PRD P0-27, D-03). Paling lambat n hari
 * sebelum jadwal kirim (konfigurasi), tanpa denda. Bagian itu ditawarkan ke petani lain; tanpa
 * pengganti, sisa uang muka bagian itu dikembalikan ke pembeli. Lewat batas, kabar tetap terkirim
 * tetapi tercatat di profil petani. Aturan dan angkanya dihitung server (`aturanGagalPanen`).
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  useKiriman,
  useKonfigurasi,
  useLaporGagalPanen,
  usePesananUntukPetani,
} from '../../api/kueri';
import { useHariIni } from '../../api/sesi';
import type { LaporGagalPanenHasil } from '../../api/tipe';
import { Banner } from '../../komponen/banner';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { DaftarLangkah } from '../../komponen/pelengkap';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { formatTanggal } from '../../lib/format';
import { tambahHari } from '../../lib/tanggal';
import { teksPesanan as t } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';
import { teksGagalMuat } from '../../teks/galat-api';
import { Memuat } from '../memuat';
import { useKomoditasPeta } from './kerangka-pesanan';

export function HalamanLaporGagal() {
  const { id } = useParams();
  const hariIni = useHariIni();
  const kirimanQ = useKiriman(id ?? null);
  const pesananQ = usePesananUntukPetani(kirimanQ.data?.pesanan_id ?? null);
  const konfigurasiQ = useKonfigurasi();
  const lapor = useLaporGagalPanen();
  const k = useKomoditasPeta();
  const [alasan, setAlasan] = useState('');
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<LaporGagalPanenHasil | null>(null);

  const kepala = (
    <Link
      to="/pesanan/kiriman"
      className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
    >
      <Ikon nama="panah-kiri" ukuran={20} />
      <span>{t.kembaliKiriman}</span>
    </Link>
  );
  if (kirimanQ.isError)
    return <p className="m-0 text-teks-pendukung">{teksGagalMuat(kirimanQ.error)}</p>;
  if (!kirimanQ.data || !pesananQ.data || !konfigurasiQ.data) return <Memuat />;
  const x = kirimanQ.data;
  const p = pesananQ.data;
  const hari = konfigurasiQ.data.hari_kabar_gagal_panen;
  const batas = tambahHari(x.tanggal_jadwal, -hari);
  const lewat = hariIni > batas;

  async function kirim() {
    setGalat(null);
    if (!alasan.trim()) return setGalat(t.isiAlasanGagal);
    try {
      setHasil(
        await lapor.mutateAsync({
          alokasiId: x.alokasi_id,
          pengiriman_id: x.id,
          alasan: alasan.trim(),
        }),
      );
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const judul = (
    <div className="flex flex-col gap-0.5">
      <h1 className="m-0 text-judul-halaman font-semibold">{t.gagalJudulHalaman}</h1>
      <p className="m-0 text-keterangan text-teks-pendukung">
        {t.gagalKetHalaman(
          k.nama(p.komoditas_id),
          x.jumlah_kg,
          formatTanggal(x.tanggal_jadwal),
          p.nama_pembeli,
        )}
      </p>
    </div>
  );

  if (hasil)
    return (
      <div className="flex flex-col gap-4 lg:max-w-dialog">
        {kepala}
        {judul}
        <section className="flex flex-col items-start gap-3 rounded-lg border-1.5 border-daun-tua bg-daun-lembut p-6">
          <h2 className="m-0 flex items-center gap-2 text-judul-bagian font-semibold text-daun-tua">
            <Ikon nama="centang" tebal={2.5} />
            {t.kabarTerkirim}
          </h2>
          <p className="m-0">{hasil.tepat_waktu ? t.kabarTepat : t.kabarTerlambat}</p>
          {hasil.dikembalikan > 0 ? (
            <p className="m-0">{t.uangDikembalikan(hasil.dikembalikan)}</p>
          ) : null}
          <Link to="/pesanan/kiriman" className={kelasTombol('sekunder')}>
            {t.kembaliKiriman}
          </Link>
        </section>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 lg:max-w-dialog">
      {kepala}
      {judul}
      {lewat ? <Banner jenis="bahaya">{t.lewatBatas}</Banner> : null}
      <Kartu judul={t.gagalJudul} tingkatJudul={2}>
        <DaftarLangkah butir={[t.aturanKabar(hari, formatTanggal(batas)), t.aturanPengganti]} />
      </Kartu>
      <div className="flex flex-col gap-2">
        <label htmlFor="alasan-gagal" className="font-medium">
          {t.alasanGagal}
        </label>
        <textarea
          id="alasan-gagal"
          rows={3}
          value={alasan}
          placeholder={t.alasanGagalContoh}
          onChange={(e) => setAlasan(e.target.value)}
          aria-invalid={galat === t.isiAlasanGagal ? true : undefined}
          className="fokus-cincin w-full rounded-md border-1.5 border-garis-kuat bg-putih px-4 py-3 text-isi text-teks outline-none placeholder:text-teks-pendukung"
        />
      </div>
      {galat ? <PesanKolom id="galat-gagal" galat={galat} /> : null}
      <Tombol penuh disabled={lapor.isPending} onClick={() => void kirim()}>
        {lapor.isPending ? t.mengirimKabar : t.kirimKabar}
      </Tombol>
    </div>
  );
}
