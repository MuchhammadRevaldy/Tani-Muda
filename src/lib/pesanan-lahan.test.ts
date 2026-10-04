import { describe, expect, it } from 'vitest';
import { CONTOH_RESEP_SAWI_BEDENGAN, CONTOH_RESEP_SAWI_HIDROPONIK } from './fixtures/contoh-resep';
import { pastikan } from './hasil';
import {
  batasAlokasi,
  cekAmbilSebagian,
  jumlahPetakBersamaan,
  kebutuhanLahanPesanan,
  luasPerPanen,
  saranTanamBertahap,
} from './pesanan-lahan';

const HASIL_SAWI = CONTOH_RESEP_SAWI_BEDENGAN.hasilPerSatuan; // 1,5 kg/m²
const UMUR_SAWI = CONTOH_RESEP_SAWI_BEDENGAN.umurPanenHari; // 28 hari

describe('luasPerPanen dan petak bersamaan', () => {
  it.each([
    [10, 1.5, 6.67],
    [6, 1.5, 4],
    [9, 0.15, 60],
  ])('%s kg ÷ %s = %s', (kg, hasil, luas) => {
    expect(luasPerPanen(kg, hasil)).toEqual({ ok: true, nilai: luas });
  });
  it.each([
    [7, 28, 4],
    [7, 25, 4],
    [14, 28, 2],
    [7, 35, 5],
    [3, 21, 7],
  ])('setiap %s hari, umur %s → %s petak', (f, umur, n) => {
    expect(jumlahPetakBersamaan(f, umur)).toEqual({ ok: true, nilai: n });
  });
  it('galat', () => {
    expect(luasPerPanen(10, 0)).toEqual({ ok: false, galat: 'HASIL_KOSONG' });
    expect(luasPerPanen(0, 1.5)).toEqual({ ok: false, galat: 'JUMLAH_KOSONG' });
    expect(jumlahPetakBersamaan(0, 28)).toEqual({ ok: false, galat: 'FREKUENSI_TIDAK_VALID' });
    expect(jumlahPetakBersamaan(7, 0)).toEqual({ ok: false, galat: 'FREKUENSI_TIDAK_VALID' });
  });
});

describe('kebutuhanLahanPesanan', () => {
  it('rutin mingguan 10 kg sawi → 4 petak × 6,67 m²', () => {
    expect(
      pastikan(
        kebutuhanLahanPesanan({
          jenis: 'rutin',
          jumlahKg: 10,
          hasilPerSatuan: HASIL_SAWI,
          frekuensiHari: 7,
          umurPanenHari: UMUR_SAWI,
        }),
      ),
    ).toEqual({
      luasPerPanen: 6.67,
      jumlahPetak: 4,
      luasTotal: 26.68,
    });
  });
  it('sekali panen tidak memakai petak bertahap', () => {
    expect(
      pastikan(
        kebutuhanLahanPesanan({ jenis: 'sekali_panen', jumlahKg: 550, hasilPerSatuan: 0.55 }),
      ),
    ).toEqual({
      luasPerPanen: 1000,
      jumlahPetak: 1,
      luasTotal: 1000,
    });
  });
  it('rutin tanpa frekuensi ditolak', () => {
    expect(kebutuhanLahanPesanan({ jenis: 'rutin', jumlahKg: 10, hasilPerSatuan: 1.5 })).toEqual({
      ok: false,
      galat: 'FREKUENSI_TIDAK_VALID',
    });
  });
});

describe('saranTanamBertahap', () => {
  it('mingguan + umur 4 minggu → 4 petak berjarak 1 minggu', () => {
    expect(
      pastikan(
        saranTanamBertahap({
          tanggalKirimPertama: '2026-11-02',
          frekuensiHari: 7,
          umurPanenHari: 28,
        }),
      ),
    ).toEqual([
      { ke: 1, tanggalTanam: '2026-10-05', tanggalPanen: '2026-11-02' },
      { ke: 2, tanggalTanam: '2026-10-12', tanggalPanen: '2026-11-09' },
      { ke: 3, tanggalTanam: '2026-10-19', tanggalPanen: '2026-11-16' },
      { ke: 4, tanggalTanam: '2026-10-26', tanggalPanen: '2026-11-23' },
    ]);
  });
  it('frekuensi tidak valid ditolak', () => {
    expect(
      saranTanamBertahap({ tanggalKirimPertama: '2026-11-02', frekuensiHari: 0, umurPanenHari: 28 })
        .ok,
    ).toBe(false);
  });
});

describe('cekAmbilSebagian (P0-21, D-08)', () => {
  it.each([
    // [jumlahKg, kapasitas m², cukup, dibutuhkan, maksimal]
    [5, 20, true, 13.32, 7.5],
    [7.5, 20, true, 20, 7.5],
    [8, 20, false, 21.32, 7.5],
    [10, 120, true, 26.68, 45],
    [10, 0, false, 26.68, 0],
  ])(
    'rutin mingguan sawi %s kg di lahan kosong %s m²',
    (kg, kapasitas, cukup, dibutuhkan, maks) => {
      const r = pastikan(
        cekAmbilSebagian({
          jenis: 'rutin',
          jumlahKg: kg,
          hasilPerSatuan: HASIL_SAWI,
          kapasitas,
          frekuensiHari: 7,
          umurPanenHari: UMUR_SAWI,
        }),
      );
      expect(r).toEqual({ cukup, dibutuhkan, kapasitas, jumlahMaksimalKg: maks });
    },
  );
  it('hidroponik memakai lubang sebagai satuan kapasitas', () => {
    const r = pastikan(
      cekAmbilSebagian({
        jenis: 'rutin',
        jumlahKg: 5,
        hasilPerSatuan: CONTOH_RESEP_SAWI_HIDROPONIK.hasilPerSatuan,
        kapasitas: 50,
        frekuensiHari: 7,
        umurPanenHari: 35,
      }),
    );
    expect(r).toEqual({ cukup: false, dibutuhkan: 166.65, kapasitas: 50, jumlahMaksimalKg: 1.5 });
  });
  it('sekali panen dibandingkan langsung dengan kapasitas', () => {
    expect(
      pastikan(
        cekAmbilSebagian({
          jenis: 'sekali_panen',
          jumlahKg: 600,
          hasilPerSatuan: 0.55,
          kapasitas: 1000,
        }),
      ),
    ).toEqual({
      cukup: false,
      dibutuhkan: 1090.91,
      kapasitas: 1000,
      jumlahMaksimalKg: 550,
    });
  });
  it('kapasitas negatif dianggap 0; hasil per satuan 0 ditolak', () => {
    expect(
      pastikan(
        cekAmbilSebagian({ jenis: 'sekali_panen', jumlahKg: 1, hasilPerSatuan: 1, kapasitas: -5 }),
      ).kapasitas,
    ).toBe(0);
    expect(
      cekAmbilSebagian({ jenis: 'sekali_panen', jumlahKg: 1, hasilPerSatuan: 0, kapasitas: 5 }),
    ).toEqual({ ok: false, galat: 'HASIL_KOSONG' });
  });
});

describe('batasAlokasi', () => {
  it.each([
    [10, [4, 3], 3, 3, 0],
    [10, [], 6, 10, 4],
    [2000, [500, 750], 750, 750, 0],
  ])(
    'pesanan %s, terambil %j, ambil %s → sisa %s lalu %s',
    (pesanan, ada, baru, sebelum, sesudah) => {
      expect(batasAlokasi(pesanan, ada, baru)).toEqual({
        ok: true,
        nilai: { sisaSebelum: sebelum, sisaSesudah: sesudah },
      });
    },
  );
  it('melebihi pesanan ditolak', () => {
    expect(batasAlokasi(10, [4, 3], 3.5)).toEqual({ ok: false, galat: 'MELEBIHI_PESANAN' });
    expect(batasAlokasi(10, [10], 0.1)).toEqual({ ok: false, galat: 'MELEBIHI_PESANAN' });
  });
  it('jumlah kosong ditolak', () => {
    expect(batasAlokasi(10, [], 0)).toEqual({ ok: false, galat: 'JUMLAH_KOSONG' });
  });
});
