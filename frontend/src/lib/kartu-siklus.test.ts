import { describe, expect, it } from 'vitest';
import {
  progresSiklus,
  ringkasKartuSiklus,
  umurPanenSiklus,
  type TugasKartu,
} from './kartu-siklus';

const HARI_INI = '2026-10-13';
const tugas: TugasKartu[] = [
  { siklusId: 'a', tipe: 'sekali', hst: 7, tanggal: '2026-10-07', status: 'selesai' },
  { siklusId: 'a', tipe: 'sekali', hst: 11, tanggal: '2026-10-11', status: 'belum' },
  { siklusId: 'a', tipe: 'sekali', hst: 28, tanggal: '2026-10-28', status: 'belum' },
  { siklusId: 'a', tipe: 'berulang', hst: 40, tanggal: '2026-11-09', status: 'belum' },
  { siklusId: 'b', tipe: 'berulang', hst: 3, tanggal: '2026-10-12', status: 'belum' },
];

describe('kartu pemilih siklus', () => {
  it('umur panen dari tugas sekali paling akhir; tanpa tugas memakai umur komoditas', () => {
    expect(umurPanenSiklus('a', tugas, 30)).toBe(28);
    expect(umurPanenSiklus('c', tugas, 30)).toBe(30);
  });
  it('progres: belum tanam 0, sedang tumbuh hari/umur, selesai 1, tidak lebih dari 1', () => {
    const a = { id: 'a', status: 'aktif' as const, tanggalTanam: '2026-09-30' };
    expect(progresSiklus(a, tugas, 30, HARI_INI)).toBeCloseTo(13 / 28);
    expect(progresSiklus({ ...a, tanggalTanam: '2026-10-20' }, tugas, 30, HARI_INI)).toBe(0);
    expect(progresSiklus({ ...a, tanggalTanam: null }, tugas, 30, HARI_INI)).toBe(0);
    expect(progresSiklus({ ...a, status: 'selesai' }, tugas, 30, HARI_INI)).toBe(1);
    expect(progresSiklus({ ...a, tanggalTanam: '2026-08-01' }, tugas, 30, HARI_INI)).toBe(1);
  });
  it('kelompok petak: satu segmen per petak, terlambat dijumlah dari semua petak', () => {
    const a = { id: 'a', status: 'aktif' as const, tanggalTanam: '2026-09-30' };
    const b = { id: 'b', status: 'aktif' as const, tanggalTanam: '2026-10-09' };
    const r = ringkasKartuSiklus([a, b], a, tugas, 30, HARI_INI);
    expect(r.segmen).toHaveLength(2);
    expect(r.hariKe).toBe(13);
    expect(r.umurPanen).toBe(28);
    // Tugas a hari ke-11 (11 Okt) dan tugas b (12 Okt) sudah lewat dan belum selesai.
    expect(r.terlambat).toBe(2);
  });
});
