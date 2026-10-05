import { describe, expect, it } from 'vitest';
import { normalisasiNomorHp, samarkanNomorHp } from './nomor-hp';

describe('normalisasiNomorHp', () => {
  it.each([
    ['081234567890', '+6281234567890'],
    ['0812-3456-7890', '+6281234567890'],
    ['62 812 3456 7890', '+6281234567890'],
    ['+6281234567890', '+6281234567890'],
    ['81234567890', '+6281234567890'],
    ['(0812) 345 678', '+62812345678'],
    ['0812345678901', '+62812345678901'],
  ])('%s → %s', (masukan, hasil) => {
    expect(normalisasiNomorHp(masukan)).toEqual({ ok: true, nilai: hasil });
  });
  it.each(['', '0212345678', '08123', '+1 555 123 4567', '0812abc5678', '08123456789012345', '62'])(
    '%j ditolak',
    (m) => {
      expect(normalisasiNomorHp(m)).toEqual({ ok: false, galat: 'NOMOR_HP_TIDAK_VALID' });
    },
  );
});

describe('samarkanNomorHp', () => {
  it('menyisakan awalan dan empat digit terakhir', () => {
    expect(samarkanNomorHp('+6281234567890')).toBe('+62812****7890');
    expect(samarkanNomorHp('+62812345678')).toBe('+62812**5678');
    expect(samarkanNomorHp('+628')).toBe('+628');
  });
});
