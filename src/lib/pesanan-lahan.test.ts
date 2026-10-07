import { describe, expect, it } from 'vitest';
import { CONTOH_RESEP_SAWI_BEDENGAN, CONTOH_RESEP_SAWI_HIDROPONIK } from './fixtures/contoh-resep';
import { pastikan } from './hasil';
import { tambahHari } from './tanggal';
import {
  batasAlokasi,
  cekAmbilSebagian,
  jumlahPetakBersamaan,
  kebutuhanLahanPesanan,
  luasPerPanen,
  jadwalKirimPesanan,
  kirimanTerkejar,
  rencanaPetak,
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
      luasTotal: 26.67,
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
  it('jumlah maksimal yang disarankan selalu dinyatakan cukup (luas total tanpa pembulatan ganda)', () => {
    // Kangkung 1,5 kg/m², umur 21 hari, kirim mingguan → 3 petak; lahan kosong 8 m² → maks 4 kg.
    const r = pastikan(
      cekAmbilSebagian({
        jenis: 'rutin',
        jumlahKg: 4,
        hasilPerSatuan: 1.5,
        kapasitas: 8,
        frekuensiHari: 7,
        umurPanenHari: 21,
      }),
    );
    expect(r).toEqual({ cukup: true, dibutuhkan: 8, kapasitas: 8, jumlahMaksimalKg: 4 });
  });
  it.each([
    // [jumlahKg, kapasitas m², cukup, dibutuhkan, maksimal]
    [5, 20, true, 13.33, 7.5],
    [7.5, 20, true, 20, 7.5],
    [8, 20, false, 21.33, 7.5],
    [10, 120, true, 26.67, 45],
    [10, 0, false, 26.67, 0],
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
    expect(r).toEqual({ cukup: false, dibutuhkan: 166.67, kapasitas: 50, jumlahMaksimalKg: 1.5 });
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

describe('jadwal kiriman dan kiriman terkejar (D-39)', () => {
  const rutin = {
    jenis: 'rutin' as const,
    tanggalMulai: '2026-10-19',
    frekuensiHari: 7,
    jumlahKiriman: 4,
    perkiraanBulanPanen: null,
  };
  it('rutin: tiap frekuensi sejak tanggal mulai', () => {
    expect(jadwalKirimPesanan(rutin)).toEqual([
      { ke: 1, tanggal: '2026-10-19' },
      { ke: 2, tanggal: '2026-10-26' },
      { ke: 3, tanggal: '2026-11-02' },
      { ke: 4, tanggal: '2026-11-09' },
    ]);
  });
  it('sekali panen: tanggal 15 bulan panen; tanpa bulan atau tanggal mulai → kosong', () => {
    expect(
      jadwalKirimPesanan({ ...rutin, jenis: 'sekali_panen', perkiraanBulanPanen: '2026-12' }),
    ).toEqual([{ ke: 1, tanggal: '2026-12-15' }]);
    expect(jadwalKirimPesanan({ ...rutin, jenis: 'sekali_panen' })).toEqual([]);
    expect(jadwalKirimPesanan({ ...rutin, tanggalMulai: null })).toEqual([]);
    expect(jadwalKirimPesanan({ ...rutin, frekuensiHari: 0 })).toEqual([]);
  });
  it('hanya kiriman pada atau setelah hari ini + umur panen', () => {
    const j = jadwalKirimPesanan(rutin);
    expect(kirimanTerkejar(j, '2026-10-05', UMUR_SAWI).map((x) => x.ke)).toEqual([3, 4]);
    expect(kirimanTerkejar(j, '2026-09-21', UMUR_SAWI).map((x) => x.ke)).toEqual([1, 2, 3, 4]);
    expect(kirimanTerkejar(j, '2026-11-01', UMUR_SAWI)).toEqual([]);
  });
});

describe('rencanaPetak (D-40)', () => {
  const kiriman = (n: number, dari = 2) =>
    Array.from({ length: n }, (_, i) => ({
      ke: dari + i,
      tanggal: tambahHari('2026-11-02', i * 7),
    }));
  it('satu petak per kiriman, bedengan bergilir, lahan dari petak bersamaan', () => {
    const r = pastikan(
      rencanaPetak({
        kiriman: kiriman(7),
        frekuensiHari: 7,
        umurPanenHari: 25,
        jumlahKg: 4,
        hasilPerSatuan: 1.2,
      }),
    );
    expect(r.petak).toHaveLength(7);
    expect(r.petak[0]).toEqual({
      ke: 2,
      tanggalTanam: '2026-10-08',
      tanggalPanen: '2026-11-02',
      bedengan: 1,
    });
    expect(r.petak.map((p) => p.bedengan)).toEqual([1, 2, 3, 4, 1, 2, 3]);
    expect(r).toMatchObject({ luasPerPetak: 3.33, bersamaan: 4, luasDibutuhkan: 13.33 });
  });
  it('kiriman lebih sedikit dari petak bersamaan: lahan secukupnya', () => {
    const r = pastikan(
      rencanaPetak({
        kiriman: kiriman(2),
        frekuensiHari: 7,
        umurPanenHari: 28,
        jumlahKg: 3,
        hasilPerSatuan: 1.5,
      }),
    );
    expect(r).toMatchObject({ bersamaan: 2, luasDibutuhkan: 4 });
  });
  it('masukan tidak sah diteruskan sebagai galat', () => {
    const dasar = { kiriman: kiriman(2), frekuensiHari: 7, umurPanenHari: 28, jumlahKg: 3 };
    expect(rencanaPetak({ ...dasar, hasilPerSatuan: 0 })).toEqual({
      ok: false,
      galat: 'HASIL_KOSONG',
    });
    expect(rencanaPetak({ ...dasar, frekuensiHari: 0, hasilPerSatuan: 1 })).toEqual({
      ok: false,
      galat: 'FREKUENSI_TIDAK_VALID',
    });
  });
});
