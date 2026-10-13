import { describe, expect, it } from 'vitest';
import { GalatApi, statusHttp } from '../api/galat';
import { teksGagalMuat, teksUntukGalat } from './galat-api';

describe('BELUM_TERSEDIA ([AG-19])', () => {
  it('501 dengan pesan versi demo, sama dengan backend KodeGalat', () => {
    expect(statusHttp('BELUM_TERSEDIA')).toBe(501);
    expect(teksUntukGalat('BELUM_TERSEDIA')).toBe('Fitur ini belum tersedia di versi demo');
  });
  it('halaman gagal dimuat: pesan versi demo hanya untuk BELUM_TERSEDIA', () => {
    expect(teksGagalMuat(new GalatApi('BELUM_TERSEDIA', 'x'))).toBe(
      'Fitur ini belum tersedia di versi demo',
    );
    expect(teksGagalMuat(new GalatApi('GALAT_SERVER', 'x'))).toBe(
      'Halaman ini belum bisa dibuka. Coba muat ulang sebentar lagi.',
    );
    expect(teksGagalMuat(new Error('lain'))).toBe(
      'Halaman ini belum bisa dibuka. Coba muat ulang sebentar lagi.',
    );
  });
});
