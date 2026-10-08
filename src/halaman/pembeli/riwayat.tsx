/**
 * Riwayat pembeli (halaman turunan 50; T4.41, US-18): pesanan yang sudah selesai atau dibatalkan,
 * dengan tombol "Pesan lagi" yang mengisi formulir dari pesanan itu (T4.26).
 */
import { Link } from 'react-router-dom';
import { usePesananPembeli } from '../../api/kueri';
import { Kartu } from '../../komponen/kartu';
import { HeaderHalaman } from '../../komponen/navigasi';
import { kelasTombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { formatTanggal } from '../../lib/format';
import { tanggalLokal } from '../../lib/zona-waktu';
import { teksPembeli as t } from '../../teks/pembeli';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { useKomoditasPeta } from '../pesanan/kerangka-pesanan';

export function HalamanRiwayat() {
  const pesananQ = usePesananPembeli();
  const k = useKomoditasPeta();
  const kepala = <HeaderHalaman judul={t.judulRiwayat} keterangan={t.ketRiwayat} />;
  if (pesananQ.isError) return <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>;
  if (!pesananQ.data) return <Memuat />;
  const selesai = pesananQ.data.filter((p) => p.status === 'selesai' || p.status === 'dibatalkan');
  return (
    <>
      {kepala}
      {selesai.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {selesai.map((p) => (
            <Kartu
              key={p.id}
              judul={
                p.jenis === 'rutin' && p.frekuensi_hari
                  ? t.judulRutin(k.nama(p.komoditas_id), p.jumlah_per_kiriman_kg ?? 0, p.frekuensi_hari)
                  : t.judulSekali(k.nama(p.komoditas_id), p.jumlah_total_kg)
              }
              keterangan={`${t.statusPesanan(p.status)} · ${t.dibuatTanggal(formatTanggal(tanggalLokal(Date.parse(p.dibuat_pada)), { tanpaHari: true }))}`}
              tingkatJudul={2}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Uang nilai={p.nilai_pesanan} label={t.nilaiPesanan} />
                <Link
                  to={`/pembeli/pesanan/baru?ulang=${encodeURIComponent(p.id)}`}
                  className={kelasTombol('sekunder')}
                >
                  {t.pesanLagi}
                </Link>
              </div>
            </Kartu>
          ))}
        </div>
      ) : (
        <p className="m-0 rounded-lg border border-garis bg-putih p-4 text-teks-pendukung">
          {t.belumAdaRiwayat}
        </p>
      )}
    </>
  );
}
