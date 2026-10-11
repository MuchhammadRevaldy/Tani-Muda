import { describe, expect, it } from 'vitest';
import { kelompokkanMinggu, mingguKe } from './jurnal';

const e = (hariKe: number, foto: string | null, catatan: string | null = null) => ({
  hariKe,
  foto,
  catatan,
});

describe('jurnal per minggu (papan 28)', () => {
  it('hari ke-0 di minggu 1, hari ke-7 di minggu 2; negatif dianggap hari ke-0', () => {
    expect([0, 6, 7, 13, 14, -2].map(mingguKe)).toEqual([1, 1, 2, 2, 3, 1]);
  });

  it('minggu terbaru di atas, hari terbaru dulu, hitung foto dan catatan', () => {
    const m = kelompokkanMinggu([
      e(0, 'a'),
      e(7, 'b'),
      e(12, null, 'lubang daun'),
      e(13, 'c'),
      e(10, 'd'),
      e(3, 'e'),
    ]);
    expect(
      m.map((x) => [x.minggu, x.hariAwal, x.hariAkhir, x.jumlahFoto, x.jumlahCatatan]),
    ).toEqual([
      [2, 7, 13, 3, 1],
      [1, 0, 6, 2, 0],
    ]);
    expect(m[0]!.entri.map((x) => x.hariKe)).toEqual([13, 12, 10, 7]);
    expect(kelompokkanMinggu([])).toEqual([]);
  });
});
