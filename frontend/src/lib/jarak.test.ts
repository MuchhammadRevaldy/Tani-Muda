/** Tabel kasus fungsi uang, kapasitas, dan jarak ada di shared/kasus-uji/*.json (T5.02). */
import { describe, expect, it } from 'vitest';
import { angkaJarak, jarakKm, urutkanTerdekat } from './jarak';

const BANDUNG = { lintang: -6.9175, bujur: 107.6191 };
const JAKARTA = { lintang: -6.2088, bujur: 106.8456 };

describe('jarakKm (Haversine)', () => {
  it('simetris', () => {
    expect(jarakKm(BANDUNG, JAKARTA)).toBeCloseTo(jarakKm(JAKARTA, BANDUNG), 10);
  });
});

describe('urutkanTerdekat', () => {
  const pesanan = [
    { id: 'jauh', titik: { lintang: 0.08, bujur: 0 } },
    { id: 'sama-1', titik: { lintang: 0.02, bujur: 0 } },
    { id: 'dekat', titik: { lintang: 0.01, bujur: 0 } },
    { id: 'sama-2', titik: { lintang: -0.02, bujur: 0 } },
  ];
  it('dari yang terdekat, stabil untuk jarak sama', () => {
    const r = urutkanTerdekat(pesanan, { lintang: 0, bujur: 0 }, (p) => p.titik);
    expect(r.map((x) => x.item.id)).toEqual(['dekat', 'sama-1', 'sama-2', 'jauh']);
    expect(r[0]?.jarakKm).toBeCloseTo(1.112, 3);
  });
  it('daftar asal tidak berubah', () => {
    urutkanTerdekat(pesanan, { lintang: 0, bujur: 0 }, (p) => p.titik);
    expect(pesanan[0]?.id).toBe('jauh');
  });
});

describe('angkaJarak', () => {
  it.each([
    [4, '4'],
    [9.5, '9,5'],
    [9.96, '10'],
    [12.4, '12'],
    [0.3, '0,3'],
    [1250, '1.250'],
  ])('%s → "%s"', (km, teks) => {
    expect(angkaJarak(km)).toBe(teks);
  });
});
