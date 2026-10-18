import { describe, expect, it, vi } from 'vitest';
import {
  ambilLokasiJaringan,
  ambilLokasiPerangkat,
  KOORDINAT_BAWAAN,
} from './lokasi-perangkat';

describe('ambilLokasiJaringan', () => {
  it('berhasil membaca lokasi dari freeipapi.com', async () => {
    const mockFetcher = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        latitude: -7.556,
        longitude: 110.831,
        cityName: 'Surakarta',
        regionName: 'Jawa Tengah',
      }),
    });

    const hasil = await ambilLokasiJaringan(mockFetcher);
    expect(hasil.sumber).toBe('jaringan');
    expect(hasil.lintang).toBe(-7.56);
    expect(hasil.bujur).toBe(110.83);
    expect(hasil.namaTempat).toBe('Surakarta, Jawa Tengah');
    expect(hasil.keterangan).toContain('Surakarta, Jawa Tengah');
  });

  it('fallback ke ipapi.co bila freeipapi gagal', async () => {
    const mockFetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          latitude: -7.62,
          longitude: 110.7,
          city: 'Klaten',
          region: 'Jawa Tengah',
          org: 'PT Telkom Indonesia',
        }),
      });

    const hasil = await ambilLokasiJaringan(mockFetcher);
    expect(hasil.sumber).toBe('jaringan');
    expect(hasil.lintang).toBe(-7.62);
    expect(hasil.bujur).toBe(110.7);
    expect(hasil.namaTempat).toBe('Klaten, Jawa Tengah');
    expect(hasil.penyedia).toBe('PT Telkom Indonesia');
  });

  it('fallback ke koordinat bawaan bila seluruh API offline', async () => {
    const mockFetcher = vi.fn().mockRejectedValue(new Error('Offline'));

    const hasil = await ambilLokasiJaringan(mockFetcher);
    expect(hasil.sumber).toBe('bawaan');
    expect(hasil.lintang).toBe(KOORDINAT_BAWAAN.lintang);
    expect(hasil.bujur).toBe(KOORDINAT_BAWAAN.bujur);
  });
});

describe('ambilLokasiPerangkat', () => {
  it('mode jaringan langsung memanggil ambilLokasiJaringan', async () => {
    const mockFetcher = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        latitude: -7.63,
        longitude: 110.71,
        cityName: 'Delanggu',
      }),
    });

    const hasil = await ambilLokasiPerangkat({ mode: 'jaringan', fetcher: mockFetcher });
    expect(hasil.sumber).toBe('jaringan');
    expect(hasil.lintang).toBe(-7.63);
  });
});
