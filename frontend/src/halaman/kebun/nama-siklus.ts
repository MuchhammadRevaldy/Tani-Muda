/**
 * Nama siklus dan kelompok petak untuk tampilan (D-40). Siklus biasa: "Sawi hijau · Kebun belakang
 * rumah". Petak pesanan rutin: "Sawi hijau untuk Katering Bu Ratna · Petak panen 3 Nov", dan
 * kelompoknya "Sawi hijau untuk Katering Bu Ratna".
 */
import { useKomoditas, useLahan } from '../../api/kueri';
import type { SiklusTanam } from '../../api/tipe';
import { formatTanggalPendek } from '../../lib/format';
import type { SiklusUntukKelompok, UnitSiklus } from '../../lib/kelompok-siklus';
import { teksBeranda } from '../../teks/beranda';
import { teksKebun } from '../../teks/kebun';
import { teksPesanan } from '../../teks/pesanan';

export type SiklusTampil = SiklusTanam & SiklusUntukKelompok;

export const keKelompok = (s: SiklusTanam): SiklusTampil => ({
  ...s,
  tanggalTanam: s.tanggal_tanam,
  alokasiId: s.kelompok_pesanan?.alokasi_id ?? null,
  jumlahPetak: s.kelompok_pesanan?.jumlah_petak ?? 1,
});

/** Petak pesanan rutin (bagian dari kelompok lebih dari satu petak). */
export const adalahPetak = (s: SiklusTanam) =>
  !!s.kelompok_pesanan && s.kelompok_pesanan.jumlah_petak > 1 && s.petak_ke !== null;

export function useNamaSiklus() {
  const komoditasQ = useKomoditas();
  const lahanQ = useLahan();
  const komoditas = (id: string) => komoditasQ.data?.find((k) => k.id === id)?.nama ?? id;
  const lahan = (id: string) => lahanQ.data?.find((l) => l.id === id)?.nama ?? '';
  const kelompok = (s: SiklusTanam) =>
    teksKebun.namaKelompok(komoditas(s.komoditas_id), s.kelompok_pesanan?.nama_pembeli ?? '');
  const petak = (s: SiklusTanam) =>
    adalahPetak(s) && s.kelompok_pesanan?.tanggal_kirim
      ? teksPesanan.petakPanen(formatTanggalPendek(s.kelompok_pesanan.tanggal_kirim))
      : null;
  const siklus = (s: SiklusTanam) => {
    const p = petak(s);
    return p
      ? `${kelompok(s)} · ${p}`
      : teksBeranda.namaSiklus(komoditas(s.komoditas_id), lahan(s.lahan_id));
  };
  const unit = (u: UnitSiklus<SiklusTanam>) => {
    const s = u.anggota[0] as SiklusTanam;
    return u.kelompok ? kelompok(s) : siklus(s);
  };
  return { siklus, kelompok, petak, unit, komoditas, lahan };
}
