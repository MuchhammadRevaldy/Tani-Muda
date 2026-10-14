import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ujiKontrak } from '../kontrak.test-suite';
import { periksaInvarianPesanan, periksaInvarianStok } from './invarian';
import { buatKlienTiruan } from './klien-tiruan';
import type { PenyimpananKunciNilai } from './penyimpanan';

/** 2026-10-05 08.00 WIB: hari acuan data contoh, sehingga "hari ke-13" dan jarak waktu tepat. */
const AWAL = Date.parse('2026-10-05T01:00:00Z');

ujiKontrak('klien tiruan', async ({ tampilkanResepContoh }) => {
  let sekarang = AWAL;
  const t = buatKlienTiruan({ tampilkanResepContoh, kv: null, jam: () => sekarang });
  return {
    klien: t.klien,
    masukSebagai: (id) => t.kontrol.masukSebagai(id),
    kodeOtp: async (nomor) => t.kontrol.kodeUji(nomor),
    majukanJam: (ms) => (sekarang += ms),
    periksaInvarian: async () => {
      const dbAny = t.konteks.db as unknown as {
        stok?: import('../tipe').StokRingkas[] | { stok: import('../tipe').StokRingkas[] };
        pesanan_stok?: import('../tipe').PesananStok[];
      };
      return [
        ...periksaInvarianPesanan(t.konteks.db.pesanan),
        ...periksaInvarianStok(dbAny.stok, dbAny.pesanan_stok ?? []),
      ];
    },
  };
});

describe('cakupan rangkaian kontrak', () => {
  it('setiap metode KlienApi dipanggil minimal sekali di rangkaian kontrak', () => {
    const sumber = readFileSync(
      fileURLToPath(new URL('../kontrak.test-suite.ts', import.meta.url)),
      'utf8',
    );
    const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null, jam: () => AWAL });
    const metode = Object.entries(t.klien).flatMap(([fitur, isi]) =>
      Object.keys(isi as object).map((m) => `${fitur}.${m}`),
    );
    expect(metode.length).toBeGreaterThan(70);
    expect(metode.filter((m) => !sumber.includes(`.${m}(`))).toEqual([]);
  });
});

describe('klien tiruan: penyimpanan, kontrol, latensi, galat buatan', () => {
  function kvMemori(): PenyimpananKunciNilai & { isi: Map<string, string> } {
    const isi = new Map<string, string>();
    return {
      isi,
      getItem: (k) => isi.get(k) ?? null,
      setItem: (k, v) => void isi.set(k, v),
      removeItem: (k) => void isi.delete(k),
    };
  }

  it('data bertahan di localStorage antar-instans; atur ulang kembali ke data contoh', async () => {
    const kv = kvMemori();
    const a = buatKlienTiruan({ tampilkanResepContoh: true, kv, jam: () => AWAL });
    await a.kontrol.masukSebagai('petani-arif');
    await a.klien.resep.minta({ komoditas_id: 'tomat' });
    const b = buatKlienTiruan({ tampilkanResepContoh: true, kv, jam: () => AWAL });
    expect((await b.klien.akun.ambil())?.pengguna.id).toBe('petani-arif');
    expect((await b.klien.resep.permintaanSaya()).map((p) => p.komoditas_id)).toContain('tomat');
    await b.kontrol.aturUlang();
    expect(await b.klien.akun.ambil()).toBeNull();
  });

  it('localStorage rusak, versi lama, atau gagal menyimpan tidak membuat aplikasi gagal', async () => {
    const kv = kvMemori();
    kv.isi.set('tani-muda:data-tiruan', '{rusak');
    const a = buatKlienTiruan({ tampilkanResepContoh: true, kv, jam: () => AWAL });
    await a.kontrol.masukSebagai('petani-arif');
    expect((await a.klien.lahan.daftar()).length).toBe(2);
    kv.isi.set('tani-muda:data-tiruan', JSON.stringify({ versi: -1 }));
    expect(
      await buatKlienTiruan({ tampilkanResepContoh: true, kv, jam: () => AWAL }).klien.akun.ambil(),
    ).toBeNull();
    const penuh: PenyimpananKunciNilai = {
      getItem: () => null,
      setItem: () => {
        throw new Error('kuota penuh');
      },
      removeItem: () => {
        throw new Error('diblokir');
      },
    };
    const c = buatKlienTiruan({ tampilkanResepContoh: true, kv: penuh, jam: () => AWAL });
    await c.kontrol.masukSebagai('petani-arif');
    await c.kontrol.aturUlang();
    expect(await c.klien.akun.ambil()).toBeNull();
  });

  it('pengguna uji per peran untuk pemilih akun demo', () => {
    const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null, jam: () => AWAL });
    const uji = t.kontrol.penggunaUji();
    expect(new Set(uji.map((u) => u.peran))).toEqual(
      new Set(['petani', 'pembeli', 'mentor', 'admin']),
    );
    expect(uji[0]).toMatchObject({ id: 'petani-arif', nama: 'Arif Setiawan' });
  });

  it('galat buatan sekali pakai dan latensi', async () => {
    const t = buatKlienTiruan({
      tampilkanResepContoh: true,
      kv: null,
      jam: () => AWAL,
      latensiMs: [1, 2],
    });
    t.galatBuatan.gagalkanBerikutnya('GALAT_SERVER');
    await expect(t.klien.referensi.konfigurasi()).rejects.toMatchObject({
      kode: 'GALAT_SERVER',
      status: 500,
    });
    await expect(t.klien.referensi.konfigurasi()).resolves.toMatchObject({ radius_km: 10 });
  });

  it('respons adalah salinan: mengubahnya tidak mengubah data tiruan', async () => {
    const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null, jam: () => AWAL });
    await t.kontrol.masukSebagai('petani-arif');
    const l = await t.klien.lahan.daftar();
    l[0]!.nama = 'diubah';
    expect((await t.klien.lahan.daftar())[0]?.nama).not.toBe('diubah');
  });
});
