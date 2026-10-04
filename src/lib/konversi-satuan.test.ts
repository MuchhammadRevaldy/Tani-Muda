import { describe, expect, it } from 'vitest';
import { CONTOH_KONVERSI } from './fixtures/contoh-referensi';
import { dariM2, keM2, teksBantuanLuas } from './konversi-satuan';

const K = CONTOH_KONVERSI;

describe('keM2', () => {
  it.each([
    [1, 'hektare', 10000],
    [0.1, 'hektare', 1000],
    [7, 'ru', 98],
    [7, 'bata', 98],
    [100, 'm2', 100],
  ] as const)('%s %s = %s m²', (nilai, satuan, m2) => {
    expect(keM2(nilai, satuan, K)).toEqual({ ok: true, nilai: m2 });
  });
  it('konversi wilayah lain menghasilkan angka berbeda (bukan konstanta 14)', () => {
    expect(keM2(7, 'ru', { ru: 12 })).toEqual({ ok: true, nilai: 84 });
  });
  it.each([
    [0, 'UKURAN_KOSONG'],
    [null, 'UKURAN_KOSONG'],
    [undefined, 'UKURAN_KOSONG'],
    [Number.NaN, 'UKURAN_KOSONG'],
    [-5, 'UKURAN_NEGATIF'],
  ])('%s → %s', (nilai, galat) => {
    expect(keM2(nilai, 'm2', K)).toEqual({ ok: false, galat });
  });
  it('satuan lokal tanpa nilai konversi ditolak', () => {
    expect(keM2(7, 'ru', {})).toEqual({ ok: false, galat: 'SATUAN_TIDAK_DIKENAL' });
    expect(dariM2(98, 'bata', { ru: 14 })).toEqual({ ok: false, galat: 'SATUAN_TIDAK_DIKENAL' });
  });
});

describe('dariM2', () => {
  it('100 m² ≈ 7,14 ru; 1.000 m² = 0,1 hektare', () => {
    const ru = dariM2(100, 'ru', K);
    expect(ru.ok && ru.nilai).toBeCloseTo(7.142857, 5);
    expect(dariM2(1000, 'hektare', K)).toEqual({ ok: true, nilai: 0.1 });
  });
});

describe('teksBantuanLuas (papan 13)', () => {
  it.each([
    [100, 'm2', '100 m² ≈ 7 ru'],
    [1000, 'm2', '1.000 m² ≈ 71 ru'],
    [10, 'm2', '10 m² ≈ 0,7 ru'],
    [20, 'm2', '20 m² ≈ 1 ru'],
    [7, 'm2', '7 m² ≈ 0,5 ru'],
    [7, 'ru', '7 ru ≈ 98 m²'],
    [2.5, 'ru', '2,5 ru ≈ 35 m²'],
    [0.1, 'hektare', '0,1 hektare = 1.000 m²'],
    [0.05, 'ru', '0,05 ru ≈ 0,7 m²'],
  ] as const)('%s %s → %s', (nilai, satuan, teks) => {
    expect(teksBantuanLuas(nilai, satuan, K)).toBe(teks);
  });
  it('satuan pembanding bata', () => {
    expect(teksBantuanLuas(100, 'm2', K, 'bata')).toBe('100 m² ≈ 7 bata');
  });
  it('nilai belum valid → null', () => {
    expect(teksBantuanLuas(0, 'm2', K)).toBeNull();
    expect(teksBantuanLuas(100, 'm2', {})).toBeNull();
  });
});
