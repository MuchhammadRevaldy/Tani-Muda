import { describe, expect, it } from 'vitest';
import type { PengaturanPengingat, Tugas } from '../tipe';
import { CONTOH_RESEP_SAWI_BEDENGAN } from './fixtures/contoh-resep';
import { pastikan } from './hasil';
import { buatJadwal } from './jadwal-buat';
import { perluPengingatSore, tugasUntukNotifikasi } from './pengingat';

const SEMUA: PengaturanPengingat = {
  jamPagi: 6,
  menitPagi: 0,
  soreAktif: true,
  tipeAktif: { sekali: true, berulang: true, ukur: true },
};
const HARI_INI = '2026-10-03'; // hari ke-13 dari tanam 20 Sep

/** Jadwal sawi: semua sebelum hari ke-13 selesai kecuali "Siangi rumput" (hari ke-11, terlambat 2 hari). */
const jadwal = (): Tugas[] =>
  pastikan(buatJadwal(CONTOH_RESEP_SAWI_BEDENGAN.tugas, '2026-09-20')).map((t) =>
    t.hst < 13 && t.id !== 'siangi@11' ? { ...t, status: 'selesai' } : t,
  );

describe('tugasUntukNotifikasi (P0-13)', () => {
  it('tugas terlambat dulu, lalu tugas hari ini', () => {
    const r = tugasUntukNotifikasi(jadwal(), SEMUA, HARI_INI);
    expect(r.kirim).toBe(true);
    expect(r.butir).toEqual([
      { tugasId: 'siangi@11', judul: 'Siangi rumput', terlambat: true },
      { tugasId: 'siram@13', judul: 'Siram pagi dan sore', terlambat: false },
      { tugasId: 'cek-daun@13', judul: 'Cek daun berlubang', terlambat: false },
    ]);
  });
  it('mematikan tipe menghilangkannya dari pengingat, tidak dari jadwal (P0-38)', () => {
    const j = jadwal();
    const r = tugasUntukNotifikasi(
      j,
      { ...SEMUA, tipeAktif: { sekali: true, berulang: false, ukur: true } },
      HARI_INI,
    );
    expect(r.butir.map((b) => b.tugasId)).toEqual(['siangi@11']);
    expect(j.some((t) => t.id === 'siram@13')).toBe(true);
  });
  it('semua tipe mati → tanpa pengingat pagi', () => {
    expect(
      tugasUntukNotifikasi(
        jadwal(),
        { ...SEMUA, tipeAktif: { sekali: false, berulang: false, ukur: false } },
        HARI_INI,
      ),
    ).toEqual({
      tanpaPengingatPagi: true,
      kirim: false,
      butir: [],
    });
  });
  it('tidak ada tugas hari ini → tidak mengirim', () => {
    const selesai = jadwal().map((t) => ({ ...t, status: 'selesai' as const }));
    expect(tugasUntukNotifikasi(selesai, SEMUA, HARI_INI)).toEqual({
      tanpaPengingatPagi: false,
      kirim: false,
      butir: [],
    });
  });
  it('tugas berulang yang tertunggak beberapa kali disebut sekali', () => {
    const j = jadwal().map((t) =>
      t.resepTugasId === 'siram' ? { ...t, status: 'belum' as const } : t,
    );
    const siram = tugasUntukNotifikasi(j, SEMUA, HARI_INI).butir.filter(
      (b) => b.judul === 'Siram pagi dan sore',
    );
    expect(siram).toEqual([{ tugasId: 'siram@1', judul: 'Siram pagi dan sore', terlambat: true }]);
  });
});

describe('perluPengingatSore (P1-05)', () => {
  it('hanya bila aktif dan masih ada yang belum selesai', () => {
    expect(perluPengingatSore(jadwal(), SEMUA, HARI_INI)).toBe(true);
    expect(perluPengingatSore(jadwal(), { ...SEMUA, soreAktif: false }, HARI_INI)).toBe(false);
    const selesai = jadwal().map((t) => ({ ...t, status: 'selesai' as const }));
    expect(perluPengingatSore(selesai, SEMUA, HARI_INI)).toBe(false);
  });
});
