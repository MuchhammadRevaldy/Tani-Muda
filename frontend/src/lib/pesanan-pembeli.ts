/**
 * Jadwal pada formulir pesanan pembeli (T4.23, T4.24): kiriman pertama paling cepat setelah petani
 * sempat menanam sampai panen, dan pilihan bulan panen untuk pesanan sekali panen.
 */
import type { TanggalISO } from './format';
import { tambahHari } from './tanggal';

/** Hari dalam minggu (0 Minggu … 6 Sabtu) sebuah tanggal kalender. */
export function hariDalamMinggu(tanggal: TanggalISO): number {
  const [th, bl, tg] = tanggal.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(th, bl - 1, tg)).getUTCDay();
}

/**
 * Kiriman pertama paling cepat: hari kirim yang dipilih, pada atau sesudah hari ini + umur panen
 * (petani baru bisa menanam setelah pesanan dipasang).
 */
export function kirimanPertamaPalingCepat(
  hariIni: TanggalISO,
  umurPanenHari: number,
  hariKirim: number,
): TanggalISO {
  const awal = tambahHari(hariIni, Math.max(0, Math.ceil(umurPanenHari)));
  const geser = (((hariKirim - hariDalamMinggu(awal)) % 7) + 7) % 7;
  return tambahHari(awal, geser);
}

/**
 * Pilihan bulan panen "YYYY-MM" untuk pesanan sekali panen: mulai bulan yang tanggal 15-nya (hari
 * kirim sekali panen) sudah terkejar umur panen, sebanyak `jumlah` bulan.
 */
export function pilihanBulanPanen(
  hariIni: TanggalISO,
  umurPanenHari: number,
  jumlah = 6,
): string[] {
  const paling = tambahHari(hariIni, Math.max(0, Math.ceil(umurPanenHari)));
  const [th, blAwal] = paling.split('-').map(Number) as [number, number];
  const bl = Number(paling.slice(8, 10)) > 15 ? blAwal + 1 : blAwal;
  return Array.from({ length: jumlah }, (_, i) => {
    const total = th * 12 + (bl - 1) + i;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
  });
}
