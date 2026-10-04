import { describe, expect, it } from 'vitest';
import { CONTOH_KONFIGURASI } from './fixtures/contoh-referensi';
import { angkaJarak, dalamRadius, jarakKm, urutkanTerdekat } from './jarak';

const BANDUNG = { lintang: -6.9175, bujur: 107.6191 };
const JAKARTA = { lintang: -6.2088, bujur: 106.8456 };
const LEMBANG = { lintang: -6.8117, bujur: 107.6175 };

describe('jarakKm (Haversine)', () => {
  it.each([
    [BANDUNG, BANDUNG, 0, 0.001],
    [BANDUNG, JAKARTA, 116.4, 1],
    [BANDUNG, LEMBANG, 11.8, 0.2],
    [{ lintang: 0, bujur: 0 }, { lintang: 0, bujur: 1 }, 111.19, 0.01],
    [{ lintang: 0, bujur: 0 }, { lintang: 0, bujur: 180 }, 20015.09, 0.1],
  ])('%j ke %j ≈ %s km', (a, b, km, toleransi) => {
    expect(Math.abs(jarakKm(a, b) - km)).toBeLessThanOrEqual(toleransi);
  });
  it('simetris', () => {
    expect(jarakKm(BANDUNG, JAKARTA)).toBeCloseTo(jarakKm(JAKARTA, BANDUNG), 10);
  });
});

describe('dalamRadius', () => {
  const pusat = { lintang: 0, bujur: 0 };
  // 10 km ke utara ≈ 0,0899322° lintang
  it('tepat di tepi radius 10 km termasuk; sedikit di luar tidak', () => {
    const tepi = { lintang: 10 / 111.19492664455873, bujur: 0 };
    expect(dalamRadius(tepi, pusat, CONTOH_KONFIGURASI.radiusKm)).toBe(true);
    expect(dalamRadius({ lintang: 10.1 / 111.19492664455873, bujur: 0 }, pusat, 10)).toBe(false);
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
