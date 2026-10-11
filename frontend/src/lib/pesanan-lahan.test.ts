/** Tabel kasus fungsi uang, kapasitas, dan jarak ada di shared/kasus-uji/*.json (T5.02). */
import { describe, expect, it } from 'vitest';
import { CONTOH_RESEP_SAWI_BEDENGAN } from './fixtures/contoh-resep';
import { pastikan } from './hasil';
import { tambahHari } from './tanggal';
import {
  jadwalKirimPesanan,
  kirimanTerkejar,
  rencanaPetak,
  saranTanamBertahap,
} from './pesanan-lahan';

const UMUR_SAWI = CONTOH_RESEP_SAWI_BEDENGAN.umurPanenHari; // 28 hari

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
