import { describe, expect, it } from 'vitest';
import type { ResepInput } from '../tipe';
import {
  CONTOH_RESEP_PADI_SAWAH,
  CONTOH_RESEP_SAWI_BEDENGAN,
  CONTOH_RESEP_SAWI_HIDROPONIK,
} from './fixtures/contoh-resep';
import { pastikan } from './hasil';
import {
  bulatkanKeKemasan,
  faktorSatuan,
  hitungKebutuhan,
  hitungKebutuhanResep,
  validasiUkuran,
} from './kebutuhan';

const input = (sebagian: Partial<ResepInput>): ResepInput => ({
  id: 'x',
  nama: 'Input',
  grup: 'Pupuk',
  dosis: 5,
  satuanDosis: 'g',
  dasarDosis: 'per_m2',
  satuanBeli: 'kg',
  ukuranKemasan: 1,
  alatSekaliBeli: false,
  hargaContoh: 1000,
  ...sebagian,
});

describe('contoh PRD', () => {
  it('5 g/m² × 100 m² = 500 g → kemasan 1 kg → 1 kg', () => {
    expect(pastikan(hitungKebutuhan(input({}), { luasM2: 100 }))).toEqual({
      kebutuhanDosis: 500,
      satuanDosis: 'g',
      kebutuhanBeli: 0.5,
      jumlahBeli: 1,
      satuanBeli: 'kg',
    });
  });
});

describe('bulatkanKeKemasan', () => {
  it.each([
    [1.01, 1, 2],
    [1, 1, 1],
    [0, 1, 0],
    [0.5, 0.5, 0.5],
    [0.6, 0.5, 1],
    [60.00000000000001, 1, 60],
    [26, 25, 50],
  ])('%s dengan kemasan %s → %s', (jumlah, kemasan, hasil) => {
    expect(bulatkanKeKemasan(jumlah, kemasan)).toEqual({ ok: true, nilai: hasil });
  });
  it('kemasan tidak valid dan jumlah negatif', () => {
    expect(bulatkanKeKemasan(1, 0)).toEqual({ ok: false, galat: 'KEMASAN_TIDAK_VALID' });
    expect(bulatkanKeKemasan(1, -1)).toEqual({ ok: false, galat: 'KEMASAN_TIDAK_VALID' });
    expect(bulatkanKeKemasan(-1, 1)).toEqual({ ok: false, galat: 'JUMLAH_NEGATIF' });
  });
});

describe('faktorSatuan', () => {
  it.each([
    ['g', 'kg', undefined, 0.001],
    ['kg', 'g', undefined, 1000],
    ['ml', 'liter', undefined, 0.001],
    ['bungkus', 'bungkus', undefined, 1],
    ['g', 'bungkus', 25, 0.04],
  ] as const)('%s → %s', (a, b, isi, f) => {
    expect(pastikan(faktorSatuan(a, b, isi))).toBeCloseTo(f, 12);
  });
  it('satuan tidak cocok atau isi kosong', () => {
    expect(faktorSatuan('g', 'liter')).toEqual({ ok: false, galat: 'SATUAN_TIDAK_COCOK' });
    expect(faktorSatuan('buah', 'kg')).toEqual({ ok: false, galat: 'SATUAN_TIDAK_COCOK' });
    expect(faktorSatuan('g', 'bungkus', 0)).toEqual({ ok: false, galat: 'ISI_KEMASAN_KOSONG' });
  });
});

describe('dasar dosis', () => {
  it('per tanaman', () => {
    const k = hitungKebutuhan(
      input({ dosis: 1, satuanDosis: 'buah', satuanBeli: 'buah', dasarDosis: 'per_tanaman' }),
      { jumlahTanaman: 200 },
    );
    expect(pastikan(k).jumlahBeli).toBe(200);
  });
  it('per liter × volume tandon × jumlah pengisian (nutrisi hidroponik)', () => {
    const ab = input({
      dosis: 0.01,
      satuanDosis: 'paket',
      satuanBeli: 'paket',
      dasarDosis: 'per_liter',
    });
    expect(pastikan(hitungKebutuhan(ab, { volumeLarutanLiter: 100 }, 2)).jumlahBeli).toBe(2);
    expect(pastikan(hitungKebutuhan(ab, { volumeLarutanLiter: 100 })).jumlahBeli).toBe(1);
  });
  it('per siklus tidak bergantung ukuran', () => {
    const t = input({
      dosis: 3,
      satuanDosis: 'orang',
      satuanBeli: 'orang',
      dasarDosis: 'per_siklus',
    });
    expect(pastikan(hitungKebutuhan(t, {})).jumlahBeli).toBe(3);
  });
  it('dosis 0 → 0; dosis negatif ditolak', () => {
    expect(pastikan(hitungKebutuhan(input({ dosis: 0 }), { luasM2: 100 })).jumlahBeli).toBe(0);
    expect(hitungKebutuhan(input({ dosis: -1 }), { luasM2: 100 })).toEqual({
      ok: false,
      galat: 'DOSIS_NEGATIF',
    });
  });
  it.each([
    [input({}), {}, 'LUAS_KOSONG'],
    [input({ dasarDosis: 'per_tanaman' }), { jumlahTanaman: 0 }, 'UKURAN_KOSONG'],
    [input({ dasarDosis: 'per_liter' }), { volumeLarutanLiter: null }, 'VOLUME_KOSONG'],
    [input({ satuanBeli: 'liter' }), { luasM2: 10 }, 'SATUAN_TIDAK_COCOK'],
    [input({ ukuranKemasan: 0 }), { luasM2: 10 }, 'KEMASAN_TIDAK_VALID'],
  ] as const)('galat %#', (i, ukuran, galat) => {
    expect(hitungKebutuhan(i, ukuran)).toEqual({ ok: false, galat });
  });
});

describe('validasiUkuran per metode', () => {
  it.each([
    ['luas', {}, 'LUAS_KOSONG'],
    ['luas', { luasM2: 0 }, 'LUAS_KOSONG'],
    ['lubang', { jumlahTanaman: null }, 'LUBANG_KOSONG'],
    ['polybag', { jumlahTanaman: Number.NaN }, 'POLYBAG_KOSONG'],
    ['luas', { luasM2: -3 }, 'UKURAN_NEGATIF'],
  ] as const)('%s %j → %s', (dasar, ukuran, galat) => {
    expect(validasiUkuran(dasar, ukuran)).toEqual({ ok: false, galat });
  });
  it('ukuran valid', () => {
    expect(validasiUkuran('lubang', { jumlahTanaman: 200 })).toEqual({ ok: true, nilai: 200 });
  });
});

describe('hitungKebutuhanResep dengan fixture', () => {
  const ringkas = (r: ReturnType<typeof hitungKebutuhanResep>) =>
    Object.fromEntries(pastikan(r).map((k) => [k.inputId, k.jumlahBeli]));

  it('sawi bedengan 100 m² sama dengan papan 16', () => {
    expect(
      ringkas(hitungKebutuhanResep(CONTOH_RESEP_SAWI_BEDENGAN, 'luas', { luasM2: 100 })),
    ).toEqual({
      benih: 1,
      kandang: 200,
      dolomit: 20,
      npk: 5,
      poc: 1,
      pestisida: 1,
      mulsa: 60,
      tenaga: 1,
    });
  });
  it('sawi bedengan 101 m² dibulatkan ke atas', () => {
    const r = ringkas(hitungKebutuhanResep(CONTOH_RESEP_SAWI_BEDENGAN, 'luas', { luasM2: 101 }));
    expect(r.benih).toBe(2);
    expect(r.npk).toBe(6);
    expect(r.kandang).toBe(202);
  });
  it('sawi hidroponik 200 lubang, tandon 100 liter, 2 pengisian (papan 18)', () => {
    expect(
      ringkas(
        hitungKebutuhanResep(CONTOH_RESEP_SAWI_HIDROPONIK, 'lubang', {
          jumlahTanaman: 200,
          volumeLarutanLiter: 100,
        }),
      ),
    ).toEqual({
      benih: 1,
      rockwool: 1,
      netpot: 200,
      abmix: 2,
      phdown: 100,
      listrik: 15,
      pipa: 1,
      pompa: 1,
      tandon: 1,
      rangka: 1,
    });
  });
  it('padi sawah 1.000 m² (papan 19)', () => {
    expect(
      ringkas(hitungKebutuhanResep(CONTOH_RESEP_PADI_SAWAH, 'luas', { luasM2: 1000 })),
    ).toEqual({
      benih: 3,
      urea: 20,
      npk: 30,
      organik: 200,
      hama: 1,
      traktor: 1,
      tanam: 3,
      panen: 3,
    });
  });
  it('ukuran kosong memakai kode per metode', () => {
    expect(hitungKebutuhanResep(CONTOH_RESEP_SAWI_BEDENGAN, 'luas', {})).toEqual({
      ok: false,
      galat: 'LUAS_KOSONG',
    });
    expect(
      hitungKebutuhanResep(CONTOH_RESEP_SAWI_HIDROPONIK, 'lubang', { jumlahTanaman: 0 }),
    ).toEqual({ ok: false, galat: 'LUBANG_KOSONG' });
  });
  it('hidroponik tanpa volume tandon ditolak', () => {
    expect(
      hitungKebutuhanResep(CONTOH_RESEP_SAWI_HIDROPONIK, 'lubang', { jumlahTanaman: 200 }),
    ).toEqual({ ok: false, galat: 'VOLUME_KOSONG' });
  });
});
