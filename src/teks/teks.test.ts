import { describe, expect, it } from 'vitest';
import { teksGalat } from './galat';
import { teksFrekuensi, teksNotifikasiPagi, teksStatusWaktu } from './jadwal';

describe('teksGalat', () => {
  it('pesan galat PRD dipakai persis', () => {
    expect(teksGalat.LUAS_KOSONG).toBe('Isi luas lahan dulu');
    expect(teksGalat.LUBANG_KOSONG).toBe('Isi jumlah lubang tanam dulu');
    expect(teksGalat.POLYBAG_KOSONG).toBe('Isi jumlah polybag dulu');
    expect(teksGalat.KETERANGAN_WAJIB).toBe('Tulis alasannya dulu');
  });
  it('tidak ada teks kosong atau bertanda seru', () => {
    for (const t of Object.values(teksGalat)) {
      expect(t.trim()).not.toBe('');
      expect(t).not.toContain('!');
    }
  });
});

describe('teks jadwal', () => {
  it('frekuensi', () => {
    expect(teksFrekuensi(1)).toBe('setiap hari');
    expect(teksFrekuensi(3)).toBe('setiap 3 hari');
  });
  it.each([
    [{ jenis: 'selesai' as const }, 'Selesai'],
    [{ jenis: 'terlambat' as const, hari: 2 }, 'Terlambat 2 hari'],
    [{ jenis: 'hari-ini' as const }, 'Hari ini'],
    [{ jenis: 'besok' as const }, 'Besok'],
    [{ jenis: 'nanti' as const, hari: 5 }, '5 hari lagi'],
  ])('%j → %s', (s, teks) => {
    expect(teksStatusWaktu(s)).toBe(teks);
  });
  it('notifikasi pagi', () => {
    expect(
      teksNotifikasiPagi({
        tanpaPengingatPagi: false,
        kirim: true,
        butir: [
          { tugasId: 'a', judul: 'Siangi rumput', terlambat: true },
          { tugasId: 'b', judul: 'Siram pagi dan sore', terlambat: false },
        ],
      }),
    ).toEqual({ judul: '2 tugas hari ini', isi: 'Siangi rumput (terlambat), Siram pagi dan sore' });
    expect(teksNotifikasiPagi({ tanpaPengingatPagi: false, kirim: false, butir: [] })).toBeNull();
  });
});
