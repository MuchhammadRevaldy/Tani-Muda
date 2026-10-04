import { describe, expect, it } from 'vitest';
import type { Modul } from '../tipe';
import { ringkasProgres } from './belajar';

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
