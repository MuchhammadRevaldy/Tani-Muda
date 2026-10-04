import { describe, expect, it } from 'vitest';
import { bandingTanggal, selisihHari, tambahHari } from './tanggal';

describe('tanggal', () => {
  it.each([
    ['2026-09-20', 14, '2026-10-04'],
    ['2026-01-31', 1, '2026-02-01'],
    ['2028-02-28', 1, '2028-02-29'],
    ['2027-02-28', 1, '2027-03-01'],
    ['2026-12-31', 1, '2027-01-01'],
    ['2026-10-03', -2, '2026-10-01'],
  ])('%s + %i hari = %s', (awal, n, hasil) => {
    expect(tambahHari(awal, n)).toBe(hasil);
  });
  it('selisih dan pembanding', () => {
    expect(selisihHari('2026-10-01', '2026-10-03')).toBe(2);
    expect(selisihHari('2026-10-03', '2026-10-01')).toBe(-2);
    expect(['2026-10-05', '2026-09-30', '2026-10-01'].sort(bandingTanggal)).toEqual([
      '2026-09-30',
      '2026-10-01',
      '2026-10-05',
    ]);
  });
  it('menolak tanggal salah', () => {
    expect(() => tambahHari('2026-02-30', 1)).toThrow();
    expect(() => tambahHari('3 Okt 2026', 1)).toThrow();
  });
});
