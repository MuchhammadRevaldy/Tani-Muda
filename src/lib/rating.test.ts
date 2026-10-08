import { describe, expect, it } from 'vitest';
import { angkaRating, rataRataRating, validasiRating } from './rating';

describe('rating (P0-28)', () => {
  it.each([1, 3, 5])('nilai %s sah', (n) => {
    expect(validasiRating(n)).toEqual({ ok: true, nilai: n });
  });
  it.each([0, 6, 4.5, Number.NaN])('nilai %s ditolak', (n) => {
    expect(validasiRating(n)).toEqual({ ok: false, galat: 'RATING_TIDAK_VALID' });
  });
  it('rata-rata satu desimal; kosong → null', () => {
    expect(rataRataRating([5, 5, 4, 5, 5, 5, 4, 5, 5])).toBe(4.8);
    expect(rataRataRating([4, 5])).toBe(4.5);
    expect(rataRataRating([])).toBeNull();
  });
  it('angka tampil selalu satu desimal', () => {
    expect(angkaRating(4.8)).toBe('4,8');
    expect(angkaRating(5)).toBe('5,0');
  });
});
