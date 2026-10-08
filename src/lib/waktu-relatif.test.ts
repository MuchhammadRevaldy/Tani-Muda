import { describe, expect, it } from 'vitest';
import { teksPukul } from '../teks/waktu';
import { waktuRelatif } from './waktu-relatif';

// 5 Oktober 2026 pukul 23.00 WIB = 16.00 UTC.
const SEKARANG = Date.parse('2026-10-05T16:00:00.000Z');
const pukul = (iso: string, zona = 'Asia/Jakarta') =>
  teksPukul(waktuRelatif(Date.parse(iso), SEKARANG, zona));

describe('waktu relatif terhadap hari ini (D-48)', () => {
  it('hari ini, besok, kemarin, dan tanggal lain', () => {
    expect(pukul('2026-10-05T15:00:00.000Z')).toBe('pukul 22.00');
    expect(pukul('2026-10-05T21:00:00.000Z')).toBe('besok pukul 04.00');
    expect(pukul('2026-10-04T15:30:00.000Z')).toBe('kemarin pukul 22.30');
    expect(pukul('2026-10-07T21:00:00.000Z')).toBe('Kamis, 8 Oktober pukul 04.00');
    expect(pukul('2026-10-03T01:00:00.000Z')).toBe('Sabtu, 3 Oktober pukul 08.00');
  });

  it('tengah malam tepat termasuk hari berikutnya', () => {
    expect(pukul('2026-10-05T17:00:00.000Z')).toBe('besok pukul 00.00');
    expect(pukul('2026-10-05T16:59:00.000Z')).toBe('pukul 23.59');
  });

  it('mengikuti zona pengguna', () => {
    // Di WITA sekarang sudah 6 Oktober 00.00, jadi 21.00 UTC = 05.00 WITA hari ini.
    expect(pukul('2026-10-05T21:00:00.000Z', 'Asia/Makassar')).toBe('pukul 05.00');
    // Di WIT sekarang sudah 6 Oktober 01.00, jadi 23.00 WIT 5 Oktober = kemarin.
    expect(pukul('2026-10-05T14:00:00.000Z', 'Asia/Jayapura')).toBe('kemarin pukul 23.00');
  });

  it('bentuk data', () => {
    expect(waktuRelatif(Date.parse('2026-10-05T21:00:00.000Z'), SEKARANG)).toEqual({
      hari: 'besok',
      tanggal: '2026-10-06',
      jam: 4,
      menit: 0,
    });
  });
});
