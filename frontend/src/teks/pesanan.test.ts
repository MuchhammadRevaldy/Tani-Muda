import { describe, expect, it } from 'vitest';
import { teksFrekuensiKirim, teksIsiPesanan, teksLamaPesanan, teksPesanan } from './pesanan';

describe('teks pesanan', () => {
  it('frekuensi dan lama', () => {
    expect(teksFrekuensiKirim(1)).toBe('per hari');
    expect(teksFrekuensiKirim(7)).toBe('per minggu');
    expect(teksFrekuensiKirim(14)).toBe('per 2 minggu');
    expect(teksFrekuensiKirim(3)).toBe('tiap 3 hari');
    expect(teksLamaPesanan(91)).toBe('selama 3 bulan');
    expect(teksLamaPesanan(28)).toBe('selama 1 bulan');
    expect(teksLamaPesanan(14)).toBe('selama 2 minggu');
    expect(teksLamaPesanan(10)).toBe('selama 10 hari');
  });
  it('isi pesanan rutin dan sekali panen seperti papan 03 dan 29', () => {
    expect(
      teksIsiPesanan(
        {
          jenis: 'rutin',
          jumlah_per_kiriman_kg: 10,
          frekuensi_hari: 7,
          jumlah_kiriman: 13,
          jumlah_total_kg: 130,
          perkiraan_bulan_panen: null,
        },
        'Sawi hijau',
      ),
    ).toBe('Sawi hijau 10 kg per minggu, selama 3 bulan');
    expect(
      teksIsiPesanan(
        {
          jenis: 'sekali_panen',
          jumlah_per_kiriman_kg: null,
          frekuensi_hari: null,
          jumlah_kiriman: 1,
          jumlah_total_kg: 2000,
          perkiraan_bulan_panen: '2026-12',
        },
        'Padi sawah',
      ),
    ).toBe('Padi sawah 2.000 kg, sekali panen sekitar Desember');
    expect(
      teksIsiPesanan(
        {
          jenis: 'sekali_panen',
          jumlah_per_kiriman_kg: null,
          frekuensi_hari: null,
          jumlah_kiriman: 1,
          jumlah_total_kg: 12.5,
          perkiraan_bulan_panen: null,
        },
        'Bayam',
      ),
    ).toBe('Bayam 12,5 kg, sekali panen');
  });
  it('jarak', () => {
    expect(teksPesanan.jarakDariKebun(4)).toBe('4 km dari kebunmu');
    expect(teksPesanan.jarakDariKebun(14.8)).toBe('15 km dari kebunmu');
  });
});
