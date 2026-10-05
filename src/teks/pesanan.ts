/** Teks ringkasan pesanan untuk petani (kartu tawaran di Beranda dan Pesanan di sekitar). */
import type { PesananUntukPetani } from '../api/tipe';
import { formatBulan, formatDesimal, titikRibuan } from '../lib/format';
import { angkaJarak } from '../lib/jarak';

/** "per hari", "per minggu", "per 2 minggu", "tiap 3 hari". */
export function teksFrekuensiKirim(hari: number): string {
  if (hari === 1) return 'per hari';
  if (hari === 7) return 'per minggu';
  if (hari % 7 === 0) return `per ${hari / 7} minggu`;
  return `tiap ${hari} hari`;
}

/** Lama pesanan rutin: "selama 3 bulan", "selama 2 minggu", "selama 10 hari". */
export function teksLamaPesanan(hari: number): string {
  if (hari >= 28) return `selama ${Math.max(1, Math.round(hari / 30))} bulan`;
  if (hari % 7 === 0) return `selama ${hari / 7} minggu`;
  return `selama ${hari} hari`;
}

const kg = (n: number) => (Number.isInteger(n) ? titikRibuan(n) : formatDesimal(n, 1));

/**
 * Isi pesanan dalam satu kalimat:
 * - rutin: "Sawi hijau 10 kg per minggu, selama 3 bulan";
 * - sekali panen: "Padi sawah 2.000 kg, sekali panen sekitar Desember".
 */
export function teksIsiPesanan(
  p: Pick<
    PesananUntukPetani,
    | 'jenis'
    | 'jumlah_per_kiriman_kg'
    | 'frekuensi_hari'
    | 'jumlah_kiriman'
    | 'jumlah_total_kg'
    | 'perkiraan_bulan_panen'
  >,
  namaKomoditas: string,
): string {
  if (p.jenis === 'rutin' && p.jumlah_per_kiriman_kg !== null && p.frekuensi_hari !== null) {
    return `${namaKomoditas} ${kg(p.jumlah_per_kiriman_kg)} kg ${teksFrekuensiKirim(
      p.frekuensi_hari,
    )}, ${teksLamaPesanan(p.jumlah_kiriman * p.frekuensi_hari)}`;
  }
  const bulan = p.perkiraan_bulan_panen ? ` sekitar ${formatBulan(p.perkiraan_bulan_panen)}` : '';
  return `${namaKomoditas} ${kg(p.jumlah_total_kg)} kg, sekali panen${bulan}`;
}

export const teksPesanan = {
  pesanSebelumTanam: 'Pesan sebelum tanam',
  jarakDariKebun: (km: number) => `${angkaJarak(km)} km dari kebunmu`,
  perKg: 'per kg',
  bolehSebagian: 'boleh ambil sebagian',
  lihatTawaran: 'Lihat tawaran',
} as const;
