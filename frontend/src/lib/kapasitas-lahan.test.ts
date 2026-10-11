/** Tabel kasus fungsi uang, kapasitas, dan jarak ada di shared/kasus-uji/*.json (T5.02). */
import { describe, expect, it } from 'vitest';
import type { Lahan, SiklusTanam } from '../tipe';
import { pastikan } from './hasil';
import {
  dipakaiSiklus,
  kapasitasLahan,
  memakaiLahan,
  muatSiklusBanyak,
  puncakBersamaan,
} from './kapasitas-lahan';
import { tambahHari } from './tanggal';

const lahan = (sebagian: Partial<Lahan> = {}): Lahan => ({
  id: 'lahan-1',
  petaniId: 'arif',
  nama: 'Kebun belakang',
  jenisLahan: 'kebun',
  luasM2: 120,
  satuanAsli: 'm2',
  nilaiAsli: 120,
  wilayahId: 'w',
  kapasitasLubang: null,
  ...sebagian,
});
const siklus = (
  sebagian: Partial<SiklusTanam>,
): Pick<SiklusTanam, 'lahanId' | 'status' | 'luasM2' | 'jumlahLubang' | 'alokasiPesananId'> => ({
  lahanId: 'lahan-1',
  status: 'aktif',
  luasM2: null,
  jumlahLubang: null,
  alokasiPesananId: null,
  ...sebagian,
});
const HIDRO = lahan({ id: 'hidro', jenisLahan: 'hidroponik', luasM2: 12, kapasitasLubang: 200 });

describe('kapasitasLahan lahan tanah (D-06, D-15)', () => {
  it('siklus milik lahan lain tidak dihitung', () => {
    const daftar = [siklus({ luasM2: 50 }), siklus({ luasM2: 70, lahanId: 'lahan-2' })];
    expect(kapasitasLahan(lahan(), daftar).sisa).toBe(70);
  });
  it.each([
    ['aktif', null, true],
    ['aktif', 'a', true],
    ['rencana', 'a', true],
    ['rencana', null, false],
    ['selesai', 'a', false],
    ['selesai', null, false],
  ] as const)('status %s dengan alokasi %s → memakai lahan %s', (status, alokasi, hasil) => {
    expect(memakaiLahan({ status, alokasiPesananId: alokasi })).toBe(hasil);
  });
  it('satuan asli tidak memengaruhi hitungan', () => {
    expect(
      kapasitasLahan(lahan({ satuanAsli: 'ru', nilaiAsli: 8.57 }), [siklus({ luasM2: 100 })]).sisa,
    ).toBe(20);
  });
});

describe('kapasitasLahan hidroponik dari jumlah lubang (D-15)', () => {
  it('nilai negatif di siklus diabaikan', () => {
    expect(dipakaiSiklus(HIDRO, [siklus({ lahanId: 'hidro', jumlahLubang: -10 })])).toBe(0);
  });
});

describe('petak pesanan rutin: puncak yang tumbuh bersamaan (D-40)', () => {
  /** Petak kirim mingguan mulai 2 Nov, umur panen `umur` hari, `n` petak, masing-masing `luas` m². */
  const petak = (
    alokasi: string,
    n: number,
    umur: number,
    luas: number,
    status: 'aktif' | 'rencana' = 'aktif',
  ) =>
    Array.from({ length: n }, (_, i) => {
      const panen = tambahHari('2026-11-02', i * 7);
      return {
        ...siklus({ luasM2: luas, status, alokasiPesananId: alokasi }),
        petakKe: i + 1,
        tanggalTanam: tambahHari(panen, -umur),
        tanggalPanen: panen,
      };
    });
  it('puncakBersamaan: rentang tanam sampai panen, panen tidak termasuk', () => {
    expect(
      puncakBersamaan([
        { mulai: '2026-10-01', akhir: '2026-10-29', ukuran: 5 },
        { mulai: '2026-10-08', akhir: '2026-11-05', ukuran: 5 },
        { mulai: '2026-10-29', akhir: '2026-11-26', ukuran: 5 },
      ]),
    ).toBe(10);
    expect(puncakBersamaan([])).toBe(0);
  });
  it.each([
    // [umur panen, jumlah petak, petak bersamaan] sama dengan jumlahPetakBersamaan (PRD)
    [28, 12, 4],
    [25, 8, 4],
    [21, 12, 3],
    [35, 3, 3],
  ])('umur %s hari, %s petak mingguan → %s petak bersamaan', (umur, n, bersamaan) => {
    expect(dipakaiSiklus(lahan(), petak('a', n, umur, 6.67))).toBe(
      Math.round(bersamaan * 667) / 100,
    );
  });
  it('kelompok berbeda dijumlah; siklus biasa tetap dijumlah utuh; petak rencana ikut dihitung', () => {
    const daftar = [
      ...petak('a', 12, 28, 6.67),
      ...petak('b', 4, 25, 4.17, 'rencana'),
      siklus({ luasM2: 100 }),
    ];
    expect(dipakaiSiklus(lahan({ luasM2: 180 }), daftar)).toBe(26.68 + 16.68 + 100);
  });
  it('petak tanpa tanggal panen dihitung seperti siklus biasa', () => {
    const p = petak('a', 3, 28, 5).map((x) => ({ ...x, tanggalPanen: null }));
    expect(dipakaiSiklus(lahan(), p)).toBe(15);
  });
  it('muatSiklusBanyak: cukup bila puncaknya muat; ditolak bila tidak; daftar kosong ditolak', () => {
    const baru = petak('baru', 7, 25, 3.34);
    expect(pastikan(muatSiklusBanyak(lahan({ luasM2: 20 }), [], baru))).toEqual({
      satuan: 'm2',
      total: 20,
      dipakai: 13.36,
      sisa: 6.64,
    });
    expect(muatSiklusBanyak(lahan({ luasM2: 13 }), [], baru)).toEqual({
      ok: false,
      galat: 'LAHAN_TIDAK_CUKUP',
    });
    expect(muatSiklusBanyak(lahan(), [], [])).toEqual({ ok: false, galat: 'UKURAN_KOSONG' });
  });
});
