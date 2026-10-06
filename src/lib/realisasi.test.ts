import { describe, expect, it } from 'vitest';
import { hitungRealisasi, rencanaItemSiklus, untungSebenarnya } from './realisasi';

const item = (id: string, jumlah: number, harga: number | null, alat = false) => ({
  id,
  nama: id,
  jumlah,
  hargaSatuan: harga,
  alatSekaliBeli: alat,
  jumlahSiklusPembagian: alat ? 10 : 1,
});

describe('hitungRealisasi (papan 27)', () => {
  const rencana = [
    item('benih', 1, 30_000),
    item('kandang', 200, 750),
    item('npk', 5, 15_000),
    item('pestisida', 1, 40_000),
    item('tanpa-harga', 1, null),
  ];
  const keluar = [
    { rencanaItemId: 'benih', nama: 'Benih', nominal: 30_000 },
    { rencanaItemId: 'kandang', nama: 'Kandang', nominal: 140_000 },
    { rencanaItemId: 'npk', nama: 'NPK', nominal: 90_000 },
    { rencanaItemId: 'tanpa-harga', nama: 'Tali', nominal: 5_000 },
    { rencanaItemId: null, nama: 'Ongkos angkut', nominal: 10_000 },
  ];
  const r = hitungRealisasi(rencana, keluar);

  it('status per item: sesuai, hemat, lebih, belum dibeli, tanpa harga', () => {
    expect(r.item.map((i) => [i.id, i.status, i.selisih])).toEqual([
      ['benih', 'sesuai', 0],
      ['kandang', 'hemat', 10_000],
      ['npk', 'lebih', 15_000],
      ['pestisida', 'belum', 0],
      ['tanpa-harga', 'tanpa-harga', 0],
    ]);
  });

  it('pengeluaran tanpa rencana dihitung terpisah; total, persen, dan perkiraan modal akhir', () => {
    expect(r.tanpaRencana.map((p) => p.nama)).toEqual(['Ongkos angkut']);
    expect(r.sudahKeluar).toBe(275_000);
    expect(r.totalRencana).toBe(295_000);
    expect(r.persen).toBe(93);
    // keluar 30.000 + 140.000 + 90.000 + 5.000 + rencana pestisida 40.000 + tanpa rencana 10.000
    expect(r.perkiraanModalAkhir).toBe(315_000);
  });

  it('alat sekali beli hanya bagian siklus ini; tanpa harga → null', () => {
    expect(rencanaItemSiklus(item('pompa', 1, 150_000, true))).toBe(15_000);
    expect(rencanaItemSiklus(item('x', 2, null))).toBeNull();
  });

  it('kosong', () => {
    expect(hitungRealisasi([], [])).toMatchObject({
      sudahKeluar: 0,
      persen: 0,
      perkiraanModalAkhir: 0,
    });
  });
});

describe('untungSebenarnya (P0-18)', () => {
  it('pendapatan nyata − pengeluaran nyata, bisa negatif', () => {
    expect(untungSebenarnya(750_000, 435_000)).toBe(315_000);
    expect(untungSebenarnya(300_000, 435_000)).toBe(-135_000);
    expect(untungSebenarnya(0, 0)).toBe(0);
  });
});
