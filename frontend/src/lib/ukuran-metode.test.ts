import { describe, expect, it } from 'vitest';
import { CONTOH_SISTEM_HIDROPONIK } from './fixtures/contoh-referensi';
import { kebutuhanTempatM2, perkiraanPanen, saranVolumeTandon } from './ukuran-metode';

const NFT = CONTOH_SISTEM_HIDROPONIK.nft;

describe('perkiraanPanen', () => {
  it.each([
    ['luas', 1000, 0.55, 550],
    ['luas', 100, 1.5, 150],
    ['lubang', 200, 0.15, 30],
    ['polybag', 40, 0.3, 12],
    ['luas', 33, 1.5, 49.5],
  ] as const)('%s %s × %s = %s kg', (dasar, ukuran, hasil, kg) => {
    expect(perkiraanPanen(dasar, ukuran, hasil)).toEqual({ ok: true, nilai: kg });
  });
  it.each([
    ['luas', null, 1.5, 'LUAS_KOSONG'],
    ['lubang', 0, 0.15, 'LUBANG_KOSONG'],
    ['polybag', 0, 0.3, 'POLYBAG_KOSONG'],
    ['luas', 100, 0, 'HASIL_KOSONG'],
  ] as const)('%s %s → %s', (dasar, ukuran, hasil, galat) => {
    expect(perkiraanPanen(dasar, ukuran, hasil)).toEqual({ ok: false, galat });
  });
});

describe('saranVolumeTandon (papan 14)', () => {
  it.each([
    [200, NFT.literTandonPerLubang, 100],
    [200, CONTOH_SISTEM_HIDROPONIK.sumbu.literTandonPerLubang, 60],
    [200, CONTOH_SISTEM_HIDROPONIK.rakit.literTandonPerLubang, 200],
    [10, NFT.literTandonPerLubang, 10],
    [0, NFT.literTandonPerLubang, 10],
  ])('%s lubang × %s liter → %s liter', (lubang, faktor, liter) => {
    expect(saranVolumeTandon(lubang, faktor)).toBe(liter);
  });
  it('kelipatan dan batas bawah bisa diatur', () => {
    expect(saranVolumeTandon(33, 1, { kelipatan: 5, minimal: 20 })).toBe(35);
  });
});

describe('kebutuhanTempatM2', () => {
  it('NFT 200 lubang butuh 10 m²; vertikultur mengurangi tempat', () => {
    expect(kebutuhanTempatM2(200, NFT.tempatPerLubangM2, null)).toBe(10);
    expect(kebutuhanTempatM2(200, NFT.tempatPerLubangM2, 2.5)).toBe(4);
    expect(kebutuhanTempatM2(200, NFT.tempatPerLubangM2, 1)).toBe(10);
  });
  it('nol atau negatif → 0', () => {
    expect(kebutuhanTempatM2(0, 0.05, null)).toBe(0);
    expect(kebutuhanTempatM2(10, 0, null)).toBe(0);
  });
});
