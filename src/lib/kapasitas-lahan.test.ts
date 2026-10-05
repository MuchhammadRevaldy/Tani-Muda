import { describe, expect, it } from 'vitest';
import type { Lahan, SiklusTanam } from '../tipe';
import { pastikan } from './hasil';
import { dipakaiSiklus, kapasitasLahan, memakaiLahan, muatSiklusBaru } from './kapasitas-lahan';

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
  it.each([
    // [luas lahan, siklus aktif m², sisa]
    [120, [100], 20],
    [120, [], 120],
    [120, [40, 30, 20], 30],
    [100, [60, 50], 0],
    [7.5, [2.25], 5.25],
  ])('lahan %s m², siklus %j → sisa %s m²', (luas, dipakai, sisa) => {
    const k = kapasitasLahan(
      lahan({ luasM2: luas }),
      dipakai.map((m) => siklus({ luasM2: m })),
    );
    expect(k).toEqual({
      satuan: 'm2',
      total: luas,
      dipakai: Math.round(dipakai.reduce((a, b) => a + b, 0) * 100) / 100,
      sisa,
    });
  });
  it('siklus selesai, rencana tanpa pesanan, dan milik lahan lain tidak dihitung', () => {
    const daftar = [
      siklus({ luasM2: 50 }),
      siklus({ luasM2: 30, status: 'selesai' }),
      siklus({ luasM2: 30, status: 'rencana' }),
      siklus({ luasM2: 70, lahanId: 'lahan-2' }),
    ];
    expect(kapasitasLahan(lahan(), daftar).sisa).toBe(70);
  });
  it('rencana yang terhubung alokasi pesanan ikut memakai lahan (D-34)', () => {
    const daftar = [
      siklus({ luasM2: 50 }),
      siklus({ luasM2: 40, status: 'rencana', alokasiPesananId: 'alokasi-1' }),
      siklus({ luasM2: 30, status: 'rencana' }),
    ];
    expect(kapasitasLahan(lahan(), daftar)).toEqual({
      satuan: 'm2',
      total: 120,
      dipakai: 90,
      sisa: 30,
    });
  });
  it('lahan yang sama tidak bisa dipakai untuk dua pesanan sebelum menanam (D-34)', () => {
    // pesanan pertama sudah diambil sebagai rencana 100 m²; pesanan kedua 30 m² tidak muat
    const pesananPertama = siklus({
      luasM2: 100,
      status: 'rencana',
      alokasiPesananId: 'alokasi-1',
    });
    expect(muatSiklusBaru(lahan(), [pesananPertama], 30)).toEqual({
      ok: false,
      galat: 'LAHAN_TIDAK_CUKUP',
    });
    expect(pastikan(muatSiklusBaru(lahan(), [pesananPertama], 20)).sisa).toBe(0);
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
  it('200 lubang dengan dua siklus aktif 100 + 50 lubang → sisa 50 lubang, luas diabaikan', () => {
    const daftar = [
      siklus({ lahanId: 'hidro', jumlahLubang: 100, luasM2: 5 }),
      siklus({ lahanId: 'hidro', jumlahLubang: 50, luasM2: 5 }),
    ];
    expect(kapasitasLahan(HIDRO, daftar)).toEqual({
      satuan: 'lubang',
      total: 200,
      dipakai: 150,
      sisa: 50,
    });
  });
  it('lahan hidroponik tanpa kapasitas lubang → 0', () => {
    expect(kapasitasLahan({ ...HIDRO, kapasitasLubang: null }, []).total).toBe(0);
  });
  it('nilai negatif di siklus diabaikan', () => {
    expect(dipakaiSiklus(HIDRO, [siklus({ lahanId: 'hidro', jumlahLubang: -10 })])).toBe(0);
  });
});

describe('muatSiklusBaru', () => {
  it('muat → kapasitas setelah siklus baru', () => {
    expect(pastikan(muatSiklusBaru(lahan(), [siklus({ luasM2: 100 })], 20))).toEqual({
      satuan: 'm2',
      total: 120,
      dipakai: 120,
      sisa: 0,
    });
    expect(
      pastikan(muatSiklusBaru(HIDRO, [siklus({ lahanId: 'hidro', jumlahLubang: 150 })], 50)).sisa,
    ).toBe(0);
  });
  it('melebihi sisa ditolak', () => {
    expect(muatSiklusBaru(lahan(), [siklus({ luasM2: 100 })], 20.5)).toEqual({
      ok: false,
      galat: 'LAHAN_TIDAK_CUKUP',
    });
    expect(muatSiklusBaru(HIDRO, [siklus({ lahanId: 'hidro', jumlahLubang: 150 })], 51)).toEqual({
      ok: false,
      galat: 'LAHAN_TIDAK_CUKUP',
    });
  });
  it('ukuran kosong ditolak', () => {
    expect(muatSiklusBaru(lahan(), [], 0)).toEqual({ ok: false, galat: 'UKURAN_KOSONG' });
  });
});
