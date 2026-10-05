import { describe, expect, it } from 'vitest';
import type { HasilPengukuran } from '../tipe';
import { CONTOH_RESEP_SAWI_HIDROPONIK } from './fixtures/contoh-resep';
import {
  nilaiDariTeks,
  nilaiPengukuran,
  perluUkurUlang,
  posisiPadaSkala,
  saranPengukuran,
  titikGrafik,
  validasiNilaiUkur,
} from './pengukuran';

const [PH, PPM] = CONTOH_RESEP_SAWI_HIDROPONIK.tugas.find((t) => t.tipe === 'ukur')!.ukur!;

describe('nilaiPengukuran (P0-37)', () => {
  it.each([
    [5.5, 'normal'],
    [6.5, 'normal'],
    [6.0, 'normal'],
    [6.6, 'terlalu-tinggi'],
    [5.4, 'terlalu-rendah'],
    [0, 'terlalu-rendah'],
    [null, 'kosong'],
    [undefined, 'kosong'],
    [Number.NaN, 'kosong'],
  ])('pH %s → %s', (nilai, status) => {
    expect(nilaiPengukuran(nilai, PH!.batasBawah, PH!.batasAtas)).toBe(status);
  });
  it.each([
    [1050, 'normal'],
    [1400, 'normal'],
    [900, 'terlalu-rendah'],
    [0, 'terlalu-rendah'],
    [1500, 'terlalu-tinggi'],
  ])('PPM %s → %s', (nilai, status) => {
    expect(nilaiPengukuran(nilai, PPM!.batasBawah, PPM!.batasAtas)).toBe(status);
  });
  it('koma desimal diterima', () => {
    expect(nilaiDariTeks('6,2', PH!)).toEqual({ nilai: 6.2, status: 'normal', galat: null });
    expect(nilaiDariTeks('7,1', PH!)).toEqual({
      nilai: 7.1,
      status: 'terlalu-tinggi',
      galat: null,
    });
    expect(nilaiDariTeks('1.250', PPM!)).toEqual({ nilai: 1250, status: 'normal', galat: null });
  });
  it('belum diisi = null; 0 sah dan dinilai (D-34)', () => {
    expect(nilaiDariTeks('', PH!)).toEqual({ nilai: null, status: 'kosong', galat: null });
    expect(nilaiDariTeks('0', PPM!)).toEqual({ nilai: 0, status: 'terlalu-rendah', galat: null });
    expect(saranPengukuran(nilaiDariTeks('0', PPM!).status, PPM!)).toBe(PPM!.saranTerlaluRendah);
    expect(nilaiDariTeks('0', PH!)).toEqual({ nilai: 0, status: 'terlalu-rendah', galat: null });
  });
  it.each([
    ['15', 'pH'],
    ['14,1', 'pH'],
    ['-0,5', 'pH'],
    ['-1', 'PPM'],
  ])('%s di luar skala %s → NILAI_DI_LUAR_SKALA', (teks, besaran) => {
    const b = besaran === 'pH' ? PH! : PPM!;
    expect(nilaiDariTeks(teks, b)).toMatchObject({
      status: 'kosong',
      galat: 'NILAI_DI_LUAR_SKALA',
    });
  });
  it('tepi skala sah; PPM tanpa batas atas', () => {
    expect(validasiNilaiUkur(14, PH!)).toEqual({ ok: true, nilai: 14 });
    expect(validasiNilaiUkur(0, PH!)).toEqual({ ok: true, nilai: 0 });
    expect(validasiNilaiUkur(5000, PPM!)).toEqual({ ok: true, nilai: 5000 });
    expect(validasiNilaiUkur(Number.NaN, PPM!)).toEqual({
      ok: false,
      galat: 'NILAI_DI_LUAR_SKALA',
    });
  });
});

describe('saran dan ukur ulang', () => {
  it('saran dari resep', () => {
    expect(saranPengukuran('terlalu-tinggi', PH!)).toBe(PH!.saranTerlaluTinggi);
    expect(saranPengukuran('terlalu-rendah', PPM!)).toBe(PPM!.saranTerlaluRendah);
    expect(saranPengukuran('normal', PH!)).toBeNull();
    expect(saranPengukuran('kosong', PH!)).toBeNull();
  });
  it('di luar rentang → ukur ulang besok; normal tidak menambah tugas', () => {
    expect(perluUkurUlang(['normal', 'terlalu-rendah'], '2026-10-05')).toBe('2026-10-06');
    expect(perluUkurUlang(['terlalu-tinggi'], '2026-10-31')).toBe('2026-11-01');
    expect(perluUkurUlang(['normal', 'normal'], '2026-10-05')).toBeNull();
    expect(perluUkurUlang(['kosong'], '2026-10-05')).toBeNull();
  });
});

describe('posisiPadaSkala', () => {
  it.each([
    [6.0, 0.5],
    [5.5, 0.25],
    [6.5, 0.75],
    [3, 0],
    [9, 1],
  ])('pH %s → %s', (nilai, posisi) => {
    expect(posisiPadaSkala(nilai, 5.5, 6.5)).toBeCloseTo(posisi, 10);
  });
  it('rentang tidak valid → tengah', () => {
    expect(posisiPadaSkala(5, 6, 6)).toBe(0.5);
  });
});

describe('titikGrafik', () => {
  const ukur = (tanggal: string, nilai: number, besaran = 'pH'): HasilPengukuran => ({
    tugasId: 't',
    besaran,
    nilai,
    status: nilaiPengukuran(nilai, 5.5, 6.5),
    sumber: 'manual',
    tanggal,
  });
  it('tujuh pengukuran terakhir, urut tanggal, besaran lain diabaikan', () => {
    const riwayat = Array.from({ length: 9 }, (_, i) =>
      ukur(`2026-10-${String(i + 1).padStart(2, '0')}`, 6 + i * 0.05),
    ).reverse();
    riwayat.push(ukur('2026-10-05', 1200, 'PPM'));
    const g = titikGrafik(riwayat, PH!);
    expect(g.titik).toHaveLength(7);
    expect(g.titik[0]?.tanggal).toBe('2026-10-03');
    expect(g.titik.at(-1)?.tanggal).toBe('2026-10-09');
    expect(g.pita.bawah).toBeLessThan(g.pita.atas);
    for (const t of g.titik) expect(t.y).toBeGreaterThanOrEqual(0);
  });
  it('kurang dari 7 data dan nilai jauh di luar rentang tetap di dalam grafik', () => {
    const g = titikGrafik([ukur('2026-10-01', 7.8), ukur('2026-10-03', 6.1)], PH!);
    expect(g.titik).toHaveLength(2);
    expect(g.titik[0]?.y).toBe(1);
    expect(g.titik[0]?.status).toBe('terlalu-tinggi');
  });
  it('tanpa data → hanya pita', () => {
    const g = titikGrafik([], PH!);
    expect(g.titik).toEqual([]);
    expect(g.pita).toEqual({ bawah: 0.25, atas: 0.75 });
  });
});
