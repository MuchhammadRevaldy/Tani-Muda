/**
 * Kasus uji perhitungan bersama (T5.02, D-49): dibaca dari shared/kasus-uji/*.json, berkas yang
 * sama dipakai Pest di backend. Setiap kasus: { nama, fungsi, masukan, keluaran } atau
 * { …, galat }; `sebagian` = cocokkan sebagian kolom, `toleransi` = selisih angka yang diterima.
 * Masukan memakai nama argumen bernama; adaptor di bawah mengubahnya menjadi panggilan fungsi.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bulatkanRupiah } from './format';
import { bulatkanKeRatusan } from './harga-item';
import type { Hasil } from './hasil';
import { dalamRadius, jarakKm } from './jarak';
import { kapasitasLahan, muatSiklusBaru } from './kapasitas-lahan';
import { konfirmasiKiriman } from './kiriman';
import { hitungPoin, levelDariPoin } from './level';
import {
  batasAlokasi,
  cekAmbilSebagian,
  jumlahPetakBersamaan,
  kebutuhanLahanPesanan,
  luasPerPanen,
} from './pesanan-lahan';
import { hitungNilaiPesanan, hitungPembayaranKiriman, jumlahKirimanRutin } from './pesanan-nilai';
import { kecocokanSuhu } from './suhu';

interface Kasus {
  nama: string;
  fungsi: string;
  masukan: Record<string, unknown>;
  keluaran?: unknown;
  galat?: string;
  sebagian?: boolean;
  toleransi?: number;
}

const FOLDER = new URL('../../../shared/kasus-uji/', import.meta.url);

/* eslint-disable @typescript-eslint/no-explicit-any -- masukan JSON diteruskan apa adanya */
const lahan = (l: any) => ({ id: 'lahan', ...l });
const siklus = (daftar: any[]) => daftar.map((s) => ({ lahanId: 'lahan', ...s }));

const FUNGSI: Record<string, (m: any) => unknown> = {
  bulatkanRupiah: (m) => bulatkanRupiah(m.n),
  bulatkanKeRatusan: (m) => bulatkanKeRatusan(m.n),
  hitungNilaiPesanan: (m) => hitungNilaiPesanan(m.pesanan, m.konfigurasi),
  jumlahKirimanRutin: (m) => jumlahKirimanRutin(m.frekuensiHari, m.durasiHari, m.maksDurasiHari),
  hitungPembayaranKiriman: (m) => hitungPembayaranKiriman(m.m),
  konfirmasiKiriman: (m) => konfirmasiKiriman(m.kiriman, m.keputusan, m.persenUangMuka),
  kapasitasLahan: (m) => kapasitasLahan(lahan(m.lahan), siklus(m.siklus)),
  muatSiklusBaru: (m) => muatSiklusBaru(lahan(m.lahan), siklus(m.siklus), m.kebutuhan),
  luasPerPanen: (m) => luasPerPanen(m.jumlahKg, m.hasilPerSatuan),
  jumlahPetakBersamaan: (m) => jumlahPetakBersamaan(m.frekuensiHari, m.umurPanenHari),
  kebutuhanLahanPesanan: (m) => kebutuhanLahanPesanan(m.m),
  cekAmbilSebagian: (m) => cekAmbilSebagian(m.m),
  batasAlokasi: (m) => batasAlokasi(m.jumlahPesananKg, m.sudahDiambilKg, m.ambilKg),
  jarakKm: (m) => jarakKm(m.a, m.b),
  dalamRadius: (m) => dalamRadius(m.titik, m.pusat, m.radiusKm),
  hitungPoin: (m) => hitungPoin(m.peristiwa),
  levelDariPoin: (m) => {
    const h = levelDariPoin(m.poin);
    return { level: h.level, levelBerikutnya: h.levelBerikutnya, poinKeBerikutnya: h.poinKeBerikutnya };
  },
  kecocokanSuhu: (m) => kecocokanSuhu(m.suhu, m.rentang),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const adalahHasil = (x: unknown): x is Hasil<unknown> =>
  typeof x === 'object' && x !== null && 'ok' in x;

const berkas = readdirSync(FOLDER).filter((n) => n.endsWith('.json'));

describe('kasus uji bersama shared/kasus-uji (T5.02)', () => {
  it('berkas uang, kapasitas, dan jarak ada; setiap kasus berbentuk sah', () => {
    expect(berkas).toEqual(expect.arrayContaining(['uang.json', 'kapasitas.json', 'jarak.json']));
  });

  for (const nama of berkas) {
    const isi = JSON.parse(readFileSync(new URL(nama, FOLDER), 'utf8')) as {
      keterangan: string;
      kasus: Kasus[];
    };
    describe(nama, () => {
      it.each(isi.kasus.map((k) => [k.fungsi, k.nama, k] as const))('%s: %s', (_f, _n, k) => {
        const jalankan = FUNGSI[k.fungsi];
        expect(jalankan, `fungsi ${k.fungsi} belum punya adaptor`).toBeTypeOf('function');
        expect('keluaran' in k !== 'galat' in k, 'tepat satu dari keluaran atau galat').toBe(true);
        const hasil = jalankan!(k.masukan);
        if (k.galat !== undefined) {
          expect(hasil).toEqual({ ok: false, galat: k.galat });
          return;
        }
        const nilai = adalahHasil(hasil)
          ? (expect(hasil.ok, JSON.stringify(hasil)).toBe(true),
            (hasil as { nilai: unknown }).nilai)
          : hasil;
        if (k.toleransi !== undefined)
          expect(Math.abs((nilai as number) - (k.keluaran as number))).toBeLessThanOrEqual(
            k.toleransi,
          );
        else if (k.sebagian) expect(nilai).toMatchObject(k.keluaran as object);
        else expect(nilai).toEqual(k.keluaran);
      });
    });
  }
});
