/**
 * Pembayaran pembeli (halaman turunan 49; T4.41, PRD P0-23, P0-26): uang muka, biaya layanan,
 * pembayaran kiriman, dana cair ke petani, kompensasi, dan pengembalian, terbaru dulu. Baris mode
 * uji coba diberi label (D-10).
 */
import { usePesananPembeli, useRiwayatPembayaran } from '../../api/kueri';
import { useSesi } from '../../api/sesi';
import type { Pembayaran } from '../../api/tipe';
import { cx } from '../../komponen/gabung-kelas';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { HeaderHalaman } from '../../komponen/navigasi';
import { Uang } from '../../komponen/uang';
import { formatJam, formatTanggal } from '../../lib/format';
import { jamLokal, tanggalLokal, ZONA_BAWAAN } from '../../lib/zona-waktu';
import { teksPembeli as t } from '../../teks/pembeli';
import { teksGagalMuat } from '../../teks/galat-api';
import { Memuat } from '../memuat';
import { useKomoditasPeta } from '../pesanan/kerangka-pesanan';

const WARNA: Record<Pembayaran['status'], string> = {
  menunggu: 'text-matahari-teks',
  ditahan: 'text-tanah',
  cair: 'text-daun-tua',
  dikembalikan: 'text-daun-tua',
  gagal: 'text-tomat-teks',
};

export function HalamanPembayaran() {
  const { akun } = useSesi();
  const zona = akun?.pengguna.zona_waktu ?? ZONA_BAWAAN;
  const bayarQ = useRiwayatPembayaran({ per_halaman: 100 });
  const pesananQ = usePesananPembeli();
  const k = useKomoditasPeta();
  const kepala = <HeaderHalaman judul={t.judulPembayaran} keterangan={t.ketPembayaran} />;
  if (bayarQ.isError)
    return <p className="m-0 text-teks-pendukung">{teksGagalMuat(bayarQ.error)}</p>;
  if (!bayarQ.data || !pesananQ.data) return <Memuat />;
  const baris = bayarQ.data.data;
  const komoditas = (pesananId: string) => {
    const p = pesananQ.data.find((x) => x.id === pesananId);
    return p ? k.nama(p.komoditas_id) : '';
  };
  const waktu = (iso: string) => {
    const ms = Date.parse(iso);
    const j = jamLokal(ms, zona);
    return `${formatTanggal(tanggalLokal(ms, zona), { tanpaHari: true })} · ${formatJam(j.jam, j.menit)}`;
  };
  return (
    <>
      {kepala}
      {baris.some((b) => b.mode_uji_coba) ? (
        <LabelKecil nada="contoh" className="self-start">
          {t.modeUjiCoba}
        </LabelKecil>
      ) : null}
      <Kartu tanpaIsi>
        {baris.length ? (
          <ul className="m-0 list-none p-0">
            {baris.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-1 border-b border-garis px-4 py-3 last:border-b-0 md:flex-row md:items-center md:gap-6"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold">
                    {t.jenisBayar(b.jenis)}
                    {komoditas(b.pesanan_id) ? ` · ${komoditas(b.pesanan_id)}` : ''}
                  </span>
                  <span className="text-keterangan text-teks-pendukung">
                    {waktu(b.dibuat_pada)} · {t.referensi(b.referensi)}
                  </span>
                </span>
                <span className="flex items-baseline justify-between gap-4 md:w-dialog md:justify-end">
                  <span className={cx('font-medium', WARNA[b.status])}>
                    {t.statusBayar(b.status)}
                  </span>
                  <Uang nilai={b.nominal} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 p-4 text-teks-pendukung">{t.belumAdaPembayaran}</p>
        )}
      </Kartu>
    </>
  );
}
