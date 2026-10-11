/**
 * Tabel kasus nilai pesanan, jumlah kiriman, dan pembayaran kiriman ada di
 * shared/kasus-uji/uang.json (dibaca kasus-bersama.test.ts, juga dipakai Pest; T5.02).
 * Di sini tinggal tes berurutan yang tidak berbentuk tabel.
 */
import { describe, expect, it } from 'vitest';
import { CONTOH_KONFIGURASI } from './fixtures/contoh-referensi';
import { pastikan } from './hasil';
import { hitungNilaiPesanan, hitungPembayaranKiriman } from './pesanan-nilai';

const K = CONTOH_KONFIGURASI;

describe('hitungNilaiPesanan (P0-19, P0-23)', () => {
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
});
