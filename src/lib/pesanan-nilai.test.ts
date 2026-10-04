import { describe, expect, it } from 'vitest';
import { CONTOH_KONFIGURASI } from './fixtures/contoh-referensi';
import { pastikan } from './hasil';
import { hitungNilaiPesanan, hitungPembayaranKiriman, jumlahKirimanRutin } from './pesanan-nilai';

const K = CONTOH_KONFIGURASI;

describe('hitungNilaiPesanan (P0-19, P0-23)', () => {
  it('rutin 10 kg × 12 kiriman × Rp5.000', () => {
    expect(
      pastikan(
        hitungNilaiPesanan(
          { jenis: 'rutin', jumlahPerKirimanKg: 10, jumlahKiriman: 12, hargaPerKg: 5000 },
          K,
        ),
      ),
    ).toEqual({
      jumlahTotalKg: 120,
      jumlahKiriman: 12,
      nilaiPesanan: 600000,
      uangMuka: 120000,
      biayaLayanan: 30000,
      dibayarSekarang: 150000,
      nilaiPerKiriman: 50000,
    });
  });
  it.each([
    // [jumlahPerKiriman, jumlahKiriman, harga, nilai, uangMuka, layanan]
    [10, 12, 5000, 600000, 120000, 30000],
    [5, 8, 6000, 240000, 48000, 12000],
    [7.5, 4, 4500, 135000, 27000, 6750],
    [3, 1, 3333, 9999, 2000, 500],
  ])('rutin %s kg × %s × %s', (kg, n, harga, nilai, um, layanan) => {
    const r = pastikan(
      hitungNilaiPesanan(
        { jenis: 'rutin', jumlahPerKirimanKg: kg, jumlahKiriman: n, hargaPerKg: harga },
        K,
      ),
    );
    expect([r.nilaiPesanan, r.uangMuka, r.biayaLayanan]).toEqual([nilai, um, layanan]);
  });
  it('sekali panen: gabah 2.000 kg × Rp6.500 dalam satu kiriman', () => {
    expect(
      pastikan(
        hitungNilaiPesanan({ jenis: 'sekali_panen', jumlahTotalKg: 2000, hargaPerKg: 6500 }, K),
      ),
    ).toMatchObject({
      jumlahKiriman: 1,
      nilaiPesanan: 13000000,
      uangMuka: 2600000,
      biayaLayanan: 650000,
      nilaiPerKiriman: 13000000,
    });
  });
  it('persen 0 → tanpa uang muka dan biaya layanan', () => {
    expect(
      pastikan(
        hitungNilaiPesanan(
          { jenis: 'sekali_panen', jumlahTotalKg: 10, hargaPerKg: 5000 },
          { persenUangMuka: 0, persenLayanan: 0 },
        ),
      ),
    ).toMatchObject({
      uangMuka: 0,
      biayaLayanan: 0,
      dibayarSekarang: 0,
    });
  });
  it('biaya layanan tidak memotong bagian petani: dana kiriman tetap harga kesepakatan', () => {
    const n = pastikan(
      hitungNilaiPesanan(
        { jenis: 'rutin', jumlahPerKirimanKg: 10, jumlahKiriman: 12, hargaPerKg: 5000 },
        K,
      ),
    );
    const p = pastikan(
      hitungPembayaranKiriman({
        nilaiKiriman: n.nilaiPerKiriman,
        nilaiDiterima: n.nilaiPerKiriman,
        saldoUangMuka: n.uangMuka,
        persenUangMuka: 20,
        kirimanTerakhir: false,
      }),
    );
    expect(p.nilaiDiterima).toBe(50000);
  });
  it.each([
    [
      { jenis: 'rutin' as const, jumlahPerKirimanKg: 0, jumlahKiriman: 12, hargaPerKg: 5000 },
      'JUMLAH_KOSONG',
    ],
    [{ jenis: 'sekali_panen' as const, jumlahTotalKg: 0, hargaPerKg: 5000 }, 'JUMLAH_KOSONG'],
    [
      { jenis: 'rutin' as const, jumlahPerKirimanKg: 10, jumlahKiriman: 12, hargaPerKg: 0 },
      'HARGA_KOSONG',
    ],
    [
      { jenis: 'rutin' as const, jumlahPerKirimanKg: 10, jumlahKiriman: 0, hargaPerKg: 5000 },
      'FREKUENSI_TIDAK_VALID',
    ],
    [
      { jenis: 'rutin' as const, jumlahPerKirimanKg: -1, jumlahKiriman: 2, hargaPerKg: 5000 },
      'JUMLAH_KOSONG',
    ],
  ])('galat %#', (m, galat) => {
    expect(hitungNilaiPesanan(m, K)).toEqual({ ok: false, galat });
  });
});

describe('jumlahKirimanRutin', () => {
  it.each([
    [7, 84, 12],
    [7, 90, 12],
    [3, 30, 10],
    [1, 7, 7],
  ])('setiap %s hari selama %s hari → %s kiriman', (f, d, n) => {
    expect(jumlahKirimanRutin(f, d, 92)).toEqual({ ok: true, nilai: n });
  });
  it.each([
    [0, 84],
    [7, 0],
    [7, 120],
    [10, 5],
    [1.5, 30],
  ])('frekuensi %s, durasi %s ditolak', (f, d) => {
    expect(jumlahKirimanRutin(f, d, 92)).toEqual({ ok: false, galat: 'FREKUENSI_TIDAK_VALID' });
  });
});

describe('hitungPembayaranKiriman (D-02: 80% pembeli + 20% dari uang muka)', () => {
  it('tiap kiriman Rp50.000 → bayar Rp40.000 + Rp10.000 dari saldo; saldo habis tepat setelah kiriman ke-12', () => {
    let saldo = 120000;
    for (let i = 1; i <= 12; i++) {
      const p = pastikan(
        hitungPembayaranKiriman({
          nilaiKiriman: 50000,
          nilaiDiterima: 50000,
          saldoUangMuka: saldo,
          persenUangMuka: 20,
          kirimanTerakhir: i === 12,
        }),
      );
      expect(p).toMatchObject({ dariUangMuka: 10000, dibayarPembeli: 40000 });
      saldo = p.sisaSaldoUangMuka;
      if (i < 12) expect(saldo).toBeGreaterThan(0);
    }
    expect(saldo).toBe(0);
  });
  it('selisih pembulatan habis di kiriman terakhir', () => {
    // 3 kiriman × Rp33.333 = Rp99.999; uang muka 20% = Rp20.000; bagian per kiriman Rp6.667
    let saldo = 20000;
    const bayar: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const p = pastikan(
        hitungPembayaranKiriman({
          nilaiKiriman: 33333,
          nilaiDiterima: 33333,
          saldoUangMuka: saldo,
          persenUangMuka: 20,
          kirimanTerakhir: i === 3,
        }),
      );
      bayar.push(p.dariUangMuka);
      saldo = p.sisaSaldoUangMuka;
    }
    expect(bayar).toEqual([6667, 6667, 6666]);
    expect(saldo).toBe(0);
  });
  it('sekali panen = satu kiriman: 80% dibayar pembeli, 20% dari uang muka', () => {
    expect(
      pastikan(
        hitungPembayaranKiriman({
          nilaiKiriman: 13000000,
          nilaiDiterima: 13000000,
          saldoUangMuka: 2600000,
          persenUangMuka: 20,
          kirimanTerakhir: true,
        }),
      ),
    ).toEqual({
      nilaiDiterima: 13000000,
      dariUangMuka: 2600000,
      dibayarPembeli: 10400000,
      sisaSaldoUangMuka: 0,
    });
  });
  it('ditolak sebagian: dihitung dari bagian yang diterima, sisa saldo bagian ditolak tetap', () => {
    expect(
      pastikan(
        hitungPembayaranKiriman({
          nilaiKiriman: 30000,
          nilaiDiterima: 24000,
          saldoUangMuka: 6000,
          persenUangMuka: 20,
          kirimanTerakhir: true,
        }),
      ),
    ).toEqual({
      nilaiDiterima: 24000,
      dariUangMuka: 4800,
      dibayarPembeli: 19200,
      sisaSaldoUangMuka: 1200,
    });
  });
  it('saldo tidak pernah negatif', () => {
    const p = pastikan(
      hitungPembayaranKiriman({
        nilaiKiriman: 50000,
        nilaiDiterima: 50000,
        saldoUangMuka: 3000,
        persenUangMuka: 20,
        kirimanTerakhir: false,
      }),
    );
    expect(p).toMatchObject({ dariUangMuka: 3000, dibayarPembeli: 47000, sisaSaldoUangMuka: 0 });
  });
  it('persen 0 → seluruhnya dibayar pembeli', () => {
    const p = pastikan(
      hitungPembayaranKiriman({
        nilaiKiriman: 50000,
        nilaiDiterima: 50000,
        saldoUangMuka: 0,
        persenUangMuka: 0,
        kirimanTerakhir: false,
      }),
    );
    expect(p).toMatchObject({ dariUangMuka: 0, dibayarPembeli: 50000 });
  });
  it('galat', () => {
    const dasar = {
      nilaiKiriman: 100,
      nilaiDiterima: 100,
      saldoUangMuka: 20,
      persenUangMuka: 20,
      kirimanTerakhir: false,
    };
    expect(hitungPembayaranKiriman({ ...dasar, nilaiDiterima: 120 })).toEqual({
      ok: false,
      galat: 'MELEBIHI_KIRIMAN',
    });
    expect(hitungPembayaranKiriman({ ...dasar, saldoUangMuka: -1 })).toEqual({
      ok: false,
      galat: 'JUMLAH_NEGATIF',
    });
  });
});
