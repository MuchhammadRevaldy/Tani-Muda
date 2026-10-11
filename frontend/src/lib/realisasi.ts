/**
 * Rencana dan realisasi modal siklus (T4.15, T4.17, PRD P0-18): selisih per item, persen yang
 * sudah keluar, perkiraan modal akhir, dan untung sebenarnya di akhir siklus.
 */
import { persenTerpakai } from './beranda';
import { bulatkanRupiah } from './format';

export interface ItemRencanaRealisasi {
  id: string;
  nama: string;
  jumlah: number;
  hargaSatuan: number | null;
  alatSekaliBeli: boolean;
  jumlahSiklusPembagian: number;
}

export interface PengeluaranRealisasi {
  rencanaItemId: string | null;
  nama: string;
  nominal: number;
}

export type StatusRealisasi = 'sesuai' | 'hemat' | 'lebih' | 'belum' | 'tanpa-harga';

export interface ItemRealisasi {
  id: string;
  nama: string;
  /** Rencana untuk siklus ini; alat sekali beli hanya bagian siklus ini. Null bila belum ada harga. */
  rencana: number | null;
  keluar: number;
  status: StatusRealisasi;
  /** Hemat atau lebih (selalu positif); 0 bila sesuai atau belum. */
  selisih: number;
}

export interface Realisasi {
  item: ItemRealisasi[];
  /** Pengeluaran yang tidak terhubung ke item rencana. */
  tanpaRencana: PengeluaranRealisasi[];
  sudahKeluar: number;
  totalRencana: number;
  persen: number;
  /** Sudah keluar + rencana item yang belum dibeli ("kalau sisanya sesuai rencana"). */
  perkiraanModalAkhir: number;
}

export function rencanaItemSiklus(it: ItemRencanaRealisasi): number | null {
  if (it.hargaSatuan === null) return null;
  const bagi = it.alatSekaliBeli ? Math.max(1, it.jumlahSiklusPembagian) : 1;
  return bulatkanRupiah((it.jumlah * it.hargaSatuan) / bagi);
}

export function hitungRealisasi(
  rencana: ItemRencanaRealisasi[],
  pengeluaran: PengeluaranRealisasi[],
): Realisasi {
  const item = rencana.map((it): ItemRealisasi => {
    const r = rencanaItemSiklus(it);
    const keluar = pengeluaran
      .filter((p) => p.rencanaItemId === it.id)
      .reduce((a, p) => a + p.nominal, 0);
    let status: StatusRealisasi;
    if (keluar === 0) status = 'belum';
    else if (r === null) status = 'tanpa-harga';
    else if (keluar === r) status = 'sesuai';
    else status = keluar < r ? 'hemat' : 'lebih';
    const selisih =
      r !== null && (status === 'hemat' || status === 'lebih') ? Math.abs(r - keluar) : 0;
    return { id: it.id, nama: it.nama, rencana: r, keluar, status, selisih };
  });
  const idRencana = new Set(rencana.map((r) => r.id));
  const tanpaRencana = pengeluaran.filter(
    (p) => !p.rencanaItemId || !idRencana.has(p.rencanaItemId),
  );
  const sudahKeluar = pengeluaran.reduce((a, p) => a + p.nominal, 0);
  const totalRencana = item.reduce((a, i) => a + (i.rencana ?? 0), 0);
  const perkiraanModalAkhir =
    item.reduce((a, i) => a + (i.status === 'belum' ? (i.rencana ?? 0) : i.keluar), 0) +
    tanpaRencana.reduce((a, p) => a + p.nominal, 0);
  return {
    item,
    tanpaRencana,
    sudahKeluar,
    totalRencana,
    persen: persenTerpakai(sudahKeluar, totalRencana),
    perkiraanModalAkhir,
  };
}

/** Untung sebenarnya di akhir siklus = pendapatan nyata − pengeluaran nyata (P0-18). */
export function untungSebenarnya(pendapatanNyata: number, pengeluaranNyata: number): number {
  return bulatkanRupiah(pendapatanNyata) - bulatkanRupiah(pengeluaranNyata);
}
