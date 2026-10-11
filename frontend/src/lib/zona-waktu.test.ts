import { describe, expect, it } from 'vitest';
import {
  jamLokal,
  selisihZonaMenit,
  tanggalLokal,
  utcDariLokal,
  ZONA_BAWAAN,
  zonaSah,
} from './zona-waktu';

describe('zona waktu (D-31)', () => {
  it('bawaan Asia/Jakarta', () => {
    expect(ZONA_BAWAAN).toBe('Asia/Jakarta');
  });
  it.each([
    ['2026-10-04T16:59:00Z', 'Asia/Jakarta', '2026-10-04'],
    ['2026-10-04T17:00:00Z', 'Asia/Jakarta', '2026-10-05'],
    ['2026-10-04T17:00:00Z', 'Asia/Jayapura', '2026-10-05'],
    ['2026-10-04T14:59:00Z', 'Asia/Jayapura', '2026-10-04'],
    ['2026-12-31T23:30:00Z', 'Asia/Jakarta', '2027-01-01'],
  ])('%s di %s → %s', (utc, zona, tanggal) => {
    expect(tanggalLokal(Date.parse(utc), zona)).toBe(tanggal);
  });
  it('jam lokal dan selisih zona', () => {
    const ms = Date.parse('2026-10-04T23:15:00Z');
    expect(jamLokal(ms)).toEqual({ jam: 6, menit: 15 });
    expect(selisihZonaMenit(ms)).toBe(420);
    expect(selisihZonaMenit(ms, 'Asia/Makassar')).toBe(480);
    expect(selisihZonaMenit(ms, 'UTC')).toBe(0);
  });
  it('waktu UTC dari tanggal dan jam lokal', () => {
    expect(utcDariLokal('2026-10-05', 6, 0)).toBe('2026-10-04T23:00:00.000Z');
    expect(utcDariLokal('2026-10-05', 6, 0, 'Asia/Jayapura')).toBe('2026-10-04T21:00:00.000Z');
    expect(utcDariLokal('2026-10-05', 6, 0, 'UTC')).toBe('2026-10-05T06:00:00.000Z');
  });
  it('nama zona sah', () => {
    expect(zonaSah('Asia/Makassar')).toBe(true);
    expect(zonaSah('Bulan/Purnama')).toBe(false);
  });
});
