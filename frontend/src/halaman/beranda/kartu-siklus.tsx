/**
 * Kartu siklus dengan penggaris umur tanam (papan 03 dan 04). Kepala kartu mengikuti papan Beranda HP
 * D-59: ilustrasi komoditas di lingkaran putus-putus, judul, dan keterangan.
 */
import { Link } from 'react-router-dom';
import type { SiklusDetail, Tugas } from '../../api/tipe';
import { tugasKeDomain } from '../../api/peta';
import { Ikon } from '../../komponen/ikon';
import { IlustrasiKomoditas } from '../../komponen/ilustrasi';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { PenggarisUmurTanam } from '../../komponen/penggaris-umur-tanam';
import { pinPenggaris } from '../../lib/beranda';
import type { TanggalISO } from '../../lib/format';
import { selisihHari } from '../../lib/tanggal';
import { teksBeranda as t } from '../../teks/beranda';
import { teksUmum } from '../../teks/umum';

export function ukuranSiklus(s: SiklusDetail): string | null {
  if (s.jumlah_lubang !== null) return t.ukuranLubang(s.jumlah_lubang);
  if (s.jumlah_polybag !== null) return t.ukuranPolybag(s.jumlah_polybag);
  if (s.luas_m2 !== null) return t.ukuranLuas(s.luas_m2);
  return null;
}

export function KartuSiklus({
  nama,
  siklus,
  tugas,
  hariIni,
}: {
  nama: string;
  siklus: SiklusDetail;
  tugas: Tugas[];
  hariIni: TanggalISO;
}) {
  const tanam = siklus.tanggal_tanam;
  const panen = siklus.perkiraan_tanggal_panen;
  const hariPanen = tanam && panen ? selisihHari(tanam, panen) : 0;
  const hariKe = siklus.hari_ke ?? 0;
  const pin = pinPenggaris(tugas.map(tugasKeDomain), hariIni, hariPanen);
  const tautan =
    'fokus-cincin -mx-4 -mb-4 mt-3 flex min-h-kontrol items-center justify-between border-t border-garis px-4 font-semibold text-daun-tua no-underline hover:text-daun-tekan lg:mt-4';
  return (
    <Kartu className="rounded-kartu-besar">
      <div className="mb-3 flex items-center gap-4">
        <div className="relative grid h-24 w-24 flex-none place-items-center">
          <div
            aria-hidden="true"
            className="absolute inset-1.5 rounded-full border-1.5 border-dashed border-oranye-terang bg-tanah-lembut"
          />
          <IlustrasiKomoditas nama={siklus.komoditas_id} ukuran={96} alt="" className="relative" />
        </div>
        <div className="min-w-0">
          <h2 className="m-0 text-judul-bagian font-semibold text-teks">{nama}</h2>
          {panen ? (
            <p className="mb-0 mt-1 text-keterangan text-teks-pendukung">
              {t.keteranganSiklus(ukuranSiklus(siklus), hariKe, hariPanen, panen)}
            </p>
          ) : null}
        </div>
      </div>
      {siklus.resep_contoh ? (
        <LabelKecil nada="contoh" className="mb-3">
          {teksUmum.labelContoh}
        </LabelKecil>
      ) : null}
      <PenggarisUmurTanam
        varian="hp"
        hariIni={hariKe}
        hariPanen={hariPanen}
        jadwal={pin}
        tampilkanDaftar={false}
        className="lg:hidden"
      />
      <PenggarisUmurTanam
        varian="lebar"
        hariIni={hariKe}
        hariPanen={hariPanen}
        jadwal={pin}
        className="hidden lg:block"
      />
      <Link to={`/kebun/${encodeURIComponent(siklus.id)}/jadwal`} className={tautan}>
        <span>{t.lihatJadwal}</span>
        <Ikon nama="panah-kanan" className="panah-geser" />
      </Link>
    </Kartu>
  );
}
