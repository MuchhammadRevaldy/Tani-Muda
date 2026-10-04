import { describe, expect, it } from 'vitest';
import { pastikan } from './hasil';
import { hitungRingkasan } from './ringkasan';

describe('hitungRingkasan (P0-10)', () => {
  it('contoh sawi: 150 kg × Rp5.000 − Rp430.000 = Rp320.000; titik impas 86 kg', () => {
    expect(
      pastikan(
        hitungRingkasan({
          totalModal: 430000,
          perkiraanPanenKg: 150,
          hargaJual: 5000,
          ukuranM2: 100,
          panenJelekKg: 70,
        }),
      ),
    ).toEqual({
      panenKg: 150,
      pendapatan: 750000,
      untung: 320000,
      rugi: false,
      hargaJualDipakai: 5000,
      sumberHargaJual: 'isian',
      modalPerM2: 4300,
      titikImpasKg: 86,
      skenarioJelek: { panenKg: 70, pendapatan: 350000, untung: -80000, rugi: true },
    });
  });
  it.each([
    // [totalModal, panen, harga, untung, titikImpas]
    [430000, 150, 5000, 320000, 86],
    [397500, 30, 15000, 52500, 27],
    [1715000, 550, 6500, 1860000, 264],
    [430000, 50, 5000, -180000, 86],
    [0, 10, 5000, 50000, 0],
  ])(
    'modal %s, panen %s kg × %s → untung %s, impas %s kg',
    (modal, panen, harga, untung, impas) => {
      const r = pastikan(
        hitungRingkasan({ totalModal: modal, perkiraanPanenKg: panen, hargaJual: harga }),
      );
      expect(r.untung).toBe(untung);
      expect(r.titikImpasKg).toBe(impas);
      expect(r.rugi).toBe(untung < 0);
    },
  );
  it('untung negatif ditandai rugi (pesan "Dengan angka ini, kamu berpotensi rugi.")', () => {
    expect(
      pastikan(hitungRingkasan({ totalModal: 430000, perkiraanPanenKg: 50, hargaJual: 5000 })).rugi,
    ).toBe(true);
  });
  it('harga kesepakatan menimpa harga jual (P0-10)', () => {
    const r = pastikan(
      hitungRingkasan({
        totalModal: 430000,
        perkiraanPanenKg: 150,
        hargaJual: 5000,
        hargaKesepakatan: 6000,
      }),
    );
    expect(r.hargaJualDipakai).toBe(6000);
    expect(r.sumberHargaJual).toBe('kesepakatan');
    expect(r.untung).toBe(470000);
  });
  it('tanpa luas (hidroponik) modal per m² kosong; tanpa skenario jelek → null', () => {
    const r = pastikan(
      hitungRingkasan({
        totalModal: 397500,
        perkiraanPanenKg: 30,
        hargaJual: 15000,
        ukuranM2: null,
      }),
    );
    expect(r.modalPerM2).toBeNull();
    expect(r.skenarioJelek).toBeNull();
  });
  it.each([
    [{ totalModal: 1, perkiraanPanenKg: 1, hargaJual: 0 }, 'HARGA_JUAL_KOSONG'],
    [
      { totalModal: 1, perkiraanPanenKg: 1, hargaJual: 5000, hargaKesepakatan: 0 },
      'HARGA_JUAL_KOSONG',
    ],
    [{ totalModal: 1, perkiraanPanenKg: -1, hargaJual: 5000 }, 'PANEN_NEGATIF'],
    [{ totalModal: 1, perkiraanPanenKg: 1, hargaJual: 5000, panenJelekKg: -2 }, 'PANEN_NEGATIF'],
    [{ totalModal: -1, perkiraanPanenKg: 1, hargaJual: 5000 }, 'HARGA_NEGATIF'],
  ])('galat %#', (m, galat) => {
    expect(hitungRingkasan(m)).toEqual({ ok: false, galat });
  });
});
