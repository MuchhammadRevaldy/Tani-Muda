import { describe, expect, it } from 'vitest';
import { inisialNama } from './teks-nama';

describe('inisialNama', () => {
  it('dua kata', () => {
    expect(inisialNama('Arif Setiawan')).toBe('AS');
    expect(inisialNama('  dimas   pratama ')).toBe('DP');
  });
  it('mengabaikan kata umum di depan', () => {
    expect(inisialNama('Kebun Sekar')).toBe('SE');
    expect(inisialNama('Katering Bu Ratna')).toBe('RA');
  });
  it('nama yang seluruhnya kata umum tetap diberi inisial', () => {
    expect(inisialNama('Kebun')).toBe('KE');
  });
  it('kosong', () => {
    expect(inisialNama('')).toBe('');
    expect(inisialNama('   ')).toBe('');
  });
});
