import { describe, expect, it } from 'vitest';
import { awalanKunci, kunciKueri } from './kunci-kueri';

describe('kunciKueri', () => {
  it('fitur, sumber, parameter', () => {
    expect(kunciKueri('kebun', 'tugas', 'siklus-1')).toEqual(['kebun', 'tugas', 'siklus-1']);
  });
  it('objek diurutkan dan nilai kosong dibuang', () => {
    expect(
      kunciKueri('resep', 'daftar', { metode_id: 'bedengan', komoditas_id: 'sawi', cari: '' }),
    ).toEqual(['resep', 'daftar', { komoditas_id: 'sawi', metode_id: 'bedengan' }]);
    expect(kunciKueri('resep', 'daftar', { b: 1, a: null })).toEqual(
      kunciKueri('resep', 'daftar', { b: 1 }),
    );
  });
  it('undefined tidak ikut, null dipertahankan', () => {
    expect(kunciKueri('lahan', 'daftar', undefined)).toEqual(['lahan', 'daftar']);
    expect(kunciKueri('lahan', 'daftar', null)).toEqual(['lahan', 'daftar', null]);
  });
  it('awalan untuk pembatalan', () => {
    expect(awalanKunci('kebun')).toEqual(['kebun']);
    expect(awalanKunci('kebun', 'tugas')).toEqual(['kebun', 'tugas']);
    const kunci = kunciKueri('kebun', 'tugas', 'x');
    expect(kunci.slice(0, 2)).toEqual(awalanKunci('kebun', 'tugas'));
  });
});
