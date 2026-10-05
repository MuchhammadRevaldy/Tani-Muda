import { describe, expect, it } from 'vitest';
import type { HasilPengukuran } from '../tipe';
import {
  hasilUkurTerakhir,
  jumlahTerlambat,
  pinPenggaris,
  persenTerpakai,
  tugasBesok,
  tugasHariIni,
  type TugasSiklus,
} from './beranda';

const HARI_INI = '2026-10-03';

function tugas(id: string, tanggal: string, lain: Partial<TugasSiklus> = {}): TugasSiklus {
  return {
    id,
    siklusId: 's1',
    resepTugasId: id.split('@')[0] ?? id,
    tipe: 'sekali',
    judul: id,
    tanggal,
    hst: 0,
    status: 'belum',
    bolehDigeser: true,
    ...lain,
  };
}

describe('tugasHariIni', () => {
  it('tugas sekali terlambat dan hari ini tampil; tugas mendatang tidak', () => {
    const daftar = [
      tugas('siangi', '2026-10-01'),
      tugas('pupuk-2', '2026-10-04'),
      tugas('cek-hama', HARI_INI),
    ];
    expect(tugasHariIni(daftar, HARI_INI).map((t) => t.id)).toEqual(['siangi', 'cek-hama']);
  });

  it('tugas sekali yang sudah selesai sebelum hari ini tidak tampil, yang selesai hari ini tampil di akhir', () => {
    const daftar = [
      tugas('pupuk-1', '2026-09-27', { status: 'selesai' }),
      tugas('cek-hama', HARI_INI, { status: 'selesai' }),
      tugas('siangi', HARI_INI),
    ];
    expect(tugasHariIni(daftar, HARI_INI).map((t) => t.id)).toEqual(['siangi', 'cek-hama']);
  });

  it('tugas berulang hanya kemunculan terakhir sampai hari ini per pola', () => {
    const daftar = [
      tugas('siram@11', '2026-10-01', { tipe: 'berulang', resepTugasId: 'siram' }),
      tugas('siram@12', '2026-10-02', { tipe: 'berulang', resepTugasId: 'siram' }),
      tugas('siram@13', HARI_INI, { tipe: 'berulang', resepTugasId: 'siram' }),
      tugas('siram@14', '2026-10-04', { tipe: 'berulang', resepTugasId: 'siram' }),
    ];
    expect(tugasHariIni(daftar, HARI_INI).map((t) => t.id)).toEqual(['siram@13']);
  });

  it('berulang yang terakhir terlewat dan belum selesai tampil sebagai terlambat lebih dulu', () => {
    const daftar = [
      tugas('siram@13', HARI_INI, { tipe: 'berulang', resepTugasId: 'siram' }),
      tugas('daun@10', '2026-09-30', { tipe: 'berulang', resepTugasId: 'daun', status: 'selesai' }),
      tugas('daun@12', '2026-10-02', { tipe: 'berulang', resepTugasId: 'daun' }),
    ];
    expect(tugasHariIni(daftar, HARI_INI).map((t) => t.id)).toEqual(['daun@12', 'siram@13']);
  });

  it('berulang yang kemunculan terakhirnya sudah selesai kemarin tidak tampil', () => {
    const daftar = [
      tugas('daun@12', '2026-10-02', {
        tipe: 'berulang',
        resepTugasId: 'daun',
        status: 'selesai',
      }),
    ];
    expect(tugasHariIni(daftar, HARI_INI)).toEqual([]);
  });

  it('pola yang sama di dua siklus dihitung terpisah', () => {
    const daftar = [
      tugas('siram@13', HARI_INI, { tipe: 'berulang', resepTugasId: 'siram' }),
      tugas('siram@5', HARI_INI, { tipe: 'berulang', resepTugasId: 'siram', siklusId: 's2' }),
    ];
    expect(tugasHariIni(daftar, HARI_INI)).toHaveLength(2);
  });

  it('kosong tetap kosong', () => {
    expect(tugasHariIni([], HARI_INI)).toEqual([]);
  });
});

describe('jumlahTerlambat dan tugasBesok', () => {
  it('menghitung tugas terlambat saja', () => {
    expect(
      jumlahTerlambat(
        [
          tugas('a', '2026-10-01'),
          tugas('b', HARI_INI),
          tugas('c', '2026-10-02', { status: 'selesai' }),
        ],
        HARI_INI,
      ),
    ).toBe(1);
  });

  it('banner besok hanya untuk tugas sekali yang belum selesai', () => {
    const daftar = [
      tugas('siram@14', '2026-10-04', { tipe: 'berulang' }),
      tugas('pupuk-2', '2026-10-04', { judul: 'Pupuk 2' }),
      tugas('cek-hama', '2026-10-10'),
    ];
    expect(tugasBesok(daftar, HARI_INI)?.id).toBe('pupuk-2');
    expect(
      tugasBesok([tugas('pupuk-2', '2026-10-04', { status: 'selesai' })], HARI_INI),
    ).toBeNull();
    expect(tugasBesok([], HARI_INI)).toBeNull();
  });
});

describe('pinPenggaris', () => {
  it('pin dari tugas sekali dengan status seperti papan 03 (hari ke-13 dari 28)', () => {
    const daftar = [
      tugas('siram@1', '2026-09-21', { tipe: 'berulang', hst: 1 }),
      tugas('pupuk-1@7', '2026-09-27', {
        judul: 'Pupuk 1',
        hst: 7,
        status: 'selesai',
        resepTugasId: 'pupuk-1',
      }),
      tugas('siangi@11', '2026-10-01', { judul: 'Siangi rumput', hst: 11, resepTugasId: 'siangi' }),
      tugas('pupuk-2@14', '2026-10-04', { judul: 'Pupuk 2', hst: 14, resepTugasId: 'pupuk-2' }),
      tugas('cek-hama@20', '2026-10-10', { judul: 'Cek hama', hst: 20, resepTugasId: 'cek-hama' }),
      tugas('panen@28', '2026-10-18', { judul: 'Panen', hst: 28, resepTugasId: 'panen' }),
    ];
    expect(pinPenggaris(daftar, HARI_INI, 28)).toEqual([
      { hari: 7, label: 'Pupuk 1', status: 'selesai' },
      { hari: 11, label: 'Siangi rumput', status: 'terlambat' },
      { hari: 14, label: 'Pupuk 2', status: 'besok' },
      { hari: 20, label: 'Cek hama', status: 'belum' },
      { hari: 28, label: 'Panen', status: 'panen' },
    ]);
  });

  it('pola yang muncul dua kali hanya mengambil kemunculan pertama; kosong tanpa tugas sekali', () => {
    const daftar = [
      tugas('a@20', '2026-10-10', { hst: 20, resepTugasId: 'a' }),
      tugas('a@10', '2026-09-30', { hst: 10, resepTugasId: 'a', status: 'selesai' }),
    ];
    expect(pinPenggaris(daftar, HARI_INI, 28)).toEqual([
      { hari: 10, label: 'a@10', status: 'selesai' },
    ]);
    expect(pinPenggaris([tugas('x', HARI_INI, { tipe: 'ukur' })], HARI_INI, 28)).toEqual([]);
  });
});

describe('hasilUkurTerakhir', () => {
  const h = (besaran: string, tanggal: string, nilai: number): HasilPengukuran => ({
    tugasId: 't',
    besaran,
    nilai,
    status: 'normal',
    sumber: 'manual',
    tanggal,
  });
  it('mengambil hasil terbaru per besaran; tanggal sama → yang tercatat belakangan', () => {
    const hasil = hasilUkurTerakhir([
      h('pH', '2026-10-01', 6.0),
      h('PPM', '2026-10-01', 1100),
      h('pH', '2026-10-02', 6.8),
      h('pH', '2026-10-02', 6.3),
      h('PPM', '2026-09-30', 1000),
    ]);
    expect(hasil.map((x) => [x.besaran, x.nilai])).toEqual([
      ['pH', 6.3],
      ['PPM', 1100],
    ]);
    expect(hasilUkurTerakhir([])).toEqual([]);
  });
});

describe('persenTerpakai', () => {
  it('dibulatkan; contoh papan 03: Rp355.000 dari Rp430.000 → 83%', () => {
    expect(persenTerpakai(355_000, 430_000)).toBe(83);
  });
  it('nilai batas', () => {
    expect(persenTerpakai(0, 430_000)).toBe(0);
    expect(persenTerpakai(100, 0)).toBe(0);
    expect(persenTerpakai(-5, 100)).toBe(0);
    expect(persenTerpakai(150, 100)).toBe(150);
  });
});
