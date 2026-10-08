import { describe, expect, it } from 'vitest';
import { angkaContoh, pinContoh } from './contoh-landing';
import { CONTOH_RESEP_BAYAM_BEDENGAN } from './fixtures/contoh-resep-bayam-kangkung';
import { CONTOH_RESEP_PADI_SAWAH } from './fixtures/contoh-resep-padi-sawah';
import { CONTOH_RESEP_SAWI_BEDENGAN } from './fixtures/contoh-resep-sawi-bedengan';

const HARI = '2026-10-05';

describe('angka contoh halaman depan (D-08, D-44)', () => {
  it('sawi bedengan 100 m² sama dengan papan 01: modal Rp430.000, impas 86 kg, untung Rp320.000', () => {
    expect(angkaContoh(CONTOH_RESEP_SAWI_BEDENGAN, 100, 5000, HARI)).toEqual({
      ok: true,
      nilai: { modal: 430_000, titikImpasKg: 86, perkiraanKg: 150, untung: 320_000 },
    });
  });

  it('padi sawah 1.000 m² tanpa subsidi (bawaan kalkulator untuk yang belum terdaftar)', () => {
    expect(angkaContoh(CONTOH_RESEP_PADI_SAWAH, 1000, 6500, HARI)).toEqual({
      ok: true,
      nilai: { modal: 1_715_000, titikImpasKg: 264, perkiraanKg: 550, untung: 1_860_000 },
    });
  });

  it('luas tidak sah dan harga jual kosong diteruskan sebagai galat', () => {
    expect(angkaContoh(CONTOH_RESEP_SAWI_BEDENGAN, 0, 5000, HARI).ok).toBe(false);
    expect(angkaContoh(CONTOH_RESEP_SAWI_BEDENGAN, 100, 0, HARI)).toMatchObject({
      ok: false,
      galat: 'HARGA_JUAL_KOSONG',
    });
  });
});

describe('pin penggaris contoh', () => {
  it('sawi hari ke-13: tugas sebelumnya selesai, Pupuk 2 besok, Panen di ujung', () => {
    expect(pinContoh(CONTOH_RESEP_SAWI_BEDENGAN, 13, HARI)).toEqual([
      { hari: 7, label: 'Pupuk 1', status: 'selesai' },
      { hari: 11, label: 'Siangi rumput', status: 'selesai' },
      { hari: 14, label: 'Pupuk 2', status: 'besok' },
      { hari: 20, label: 'Cek hama', status: 'belum' },
      { hari: 28, label: 'Panen', status: 'panen' },
    ]);
  });

  it('bayam hari ke-18', () => {
    expect(pinContoh(CONTOH_RESEP_BAYAM_BEDENGAN, 18, HARI).map((p) => p.status)).toEqual([
      'selesai',
      'selesai',
      'panen',
    ]);
  });
});
