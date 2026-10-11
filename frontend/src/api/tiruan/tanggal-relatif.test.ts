import { describe, expect, it } from 'vitest';
import { selesaikanNilai, selesaikanTanggalRelatif } from './tanggal-relatif';

describe('tanggal relatif data contoh', () => {
  it.each([
    ['H-13', '2026-09-22'],
    ['H+0', '2026-10-05'],
    ['H+72', '2026-12-16'],
    ['H+0T07:00', '2026-10-05T00:00:00.000Z'],
    ['H-1T06:30', '2026-10-03T23:30:00.000Z'],
    ['B+2', '2026-12'],
    ['B+3', '2027-01'],
    ['B-10', '2025-12'],
    ['J-1', '2026-10-05T00:00:00.000Z'],
    ['J+5', '2026-10-05T06:00:00.000Z'],
    ['Halo', 'Halo'],
    ['H-x', 'H-x'],
  ])('%s → %s', (nilai, hasil) => {
    expect(selesaikanNilai(nilai, '2026-10-05', 'Asia/Jakarta')).toBe(hasil);
  });
  it('"J±n" relatif terhadap saat atur ulang (D-47)', () => {
    const pukul23 = Date.parse('2026-10-05T16:00:00.000Z'); // 23.00 WIB
    expect(selesaikanNilai('J-1', '2026-10-05', 'Asia/Jakarta', pukul23)).toBe(
      '2026-10-05T15:00:00.000Z',
    );
    expect(selesaikanNilai('J+5', '2026-10-05', 'Asia/Jakarta', pukul23)).toBe(
      '2026-10-05T21:00:00.000Z',
    );
  });
  it('objek bersarang diselesaikan, angka dan null tetap', () => {
    expect(
      selesaikanTanggalRelatif(
        { a: ['H+1', 5, null, { b: 'H-1T08:00' }], c: true },
        '2026-10-05',
        'Asia/Jakarta',
      ),
    ).toEqual({
      a: ['2026-10-06', 5, null, { b: '2026-10-04T01:00:00.000Z' }],
      c: true,
    });
  });
});
