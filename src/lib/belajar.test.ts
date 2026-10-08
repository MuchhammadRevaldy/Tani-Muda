import { describe, expect, it } from 'vitest';
import type { Modul } from '../tipe';
import { keadaanModul, modulTahapBerjalan, ringkasProgres, sisaMenit } from './belajar';

const TAHAP = ['Persiapan lahan', 'Semai', 'Tanam', 'Perawatan', 'Panen', 'Pascapanen'];
const MODUL: Modul[] = TAHAP.map((judul, i) => ({
  id: `m${i + 1}`,
  komoditasId: 'sawi',
  metodeId: 'bedengan',
  tahap: judul.toLowerCase(),
  judul,
  menit: 3,
  urutan: i + 1,
})).reverse();

describe('ringkasProgres', () => {
  it('3 dari 6 modul selesai, lanjutkan modul ke-4', () => {
    const r = ringkasProgres(MODUL, ['m1', 'm2', 'm3']);
    expect(r).toMatchObject({ jumlahSelesai: 3, jumlahTotal: 6, persen: 50, semuaSelesai: false });
    expect(r.modulLanjutan?.judul).toBe('Perawatan');
  });
  it('modul yang dilewati menjadi lanjutan walau modul sesudahnya sudah ditonton', () => {
    expect(ringkasProgres(MODUL, ['m1', 'm3']).modulLanjutan?.id).toBe('m2');
  });
  it('semua selesai', () => {
    expect(ringkasProgres(MODUL, new Set(MODUL.map((m) => m.id)))).toMatchObject({
      persen: 100,
      modulLanjutan: null,
      semuaSelesai: true,
    });
  });
  it('belum ada yang selesai, ID tak dikenal diabaikan', () => {
    expect(ringkasProgres(MODUL, ['x'])).toMatchObject({
      jumlahSelesai: 0,
      persen: 0,
      semuaSelesai: false,
    });
  });
  it('persen dibulatkan', () => {
    expect(ringkasProgres(MODUL, ['m1']).persen).toBe(17);
    expect(ringkasProgres(MODUL, ['m1', 'm2']).persen).toBe(33);
  });
  it('tanpa modul', () => {
    expect(ringkasProgres([], [])).toEqual({
      jumlahSelesai: 0,
      jumlahTotal: 0,
      persen: 0,
      modulLanjutan: null,
      semuaSelesai: false,
    });
  });
});

describe('modul tahap berjalan, sisa menit, keadaan (P0-06, D-43)', () => {
  const m = [
    { id: 'a', urutan: 1, hstMulai: -14 },
    { id: 'b', urutan: 2, hstMulai: -7 },
    { id: 'c', urutan: 3, hstMulai: 0 },
    { id: 'd', urutan: 4, hstMulai: 7 },
    { id: 'e', urutan: 5, hstMulai: 25 },
  ];
  it.each([
    [null, 'a'],
    [-20, 'a'],
    [-7, 'b'],
    [0, 'c'],
    [13, 'd'],
    [30, 'e'],
  ] as const)('hari ke-%s → modul %s', (hari, id) => {
    expect(modulTahapBerjalan(m, hari)?.id).toBe(id);
  });
  it('daftar kosong → null', () => {
    expect(modulTahapBerjalan([], 3)).toBeNull();
  });
  it.each([
    [0, 180, null],
    [60, 180, 2],
    [170, 180, 1],
    [200, 180, 1],
    [30, Number.POSITIVE_INFINITY, null],
    [30, 0, null],
  ])('posisi %s dari %s detik → sisa %s menit', (p, d, hasil) => {
    expect(sisaMenit(p, d)).toBe(hasil);
  });
  it('keadaan baris', () => {
    expect(keadaanModul({ selesai: true, posisiDetik: 30, tersimpan: true })).toBe('selesai');
    expect(keadaanModul({ selesai: false, posisiDetik: 30, tersimpan: true })).toBe('sedang');
    expect(keadaanModul({ selesai: false, posisiDetik: 0, tersimpan: true })).toBe('offline');
    expect(keadaanModul({ selesai: false, posisiDetik: 0, tersimpan: false })).toBe('belum');
  });
});
