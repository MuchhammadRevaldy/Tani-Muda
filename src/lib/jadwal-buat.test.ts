import { describe, expect, it } from 'vitest';
import type { ResepTugas } from '../tipe';
import { CONTOH_RESEP_SAWI_BEDENGAN, CONTOH_RESEP_SAWI_HIDROPONIK } from './fixtures/contoh-resep';
import { pastikan } from './hasil';
import { buatJadwal, hstKemunculan, idTugas, validasiResepTugas } from './jadwal-buat';

const sekali = (hst: number, sebagian: Partial<ResepTugas> = {}): ResepTugas => ({
  id: 'pupuk',
  tipe: 'sekali',
  judul: 'Pupuk',
  hstMulai: hst,
  bolehDigeser: true,
  ...sebagian,
});
const berulang = (mulai: number, selesai: number, interval: number): ResepTugas => ({
  id: 'cek',
  tipe: 'berulang',
  judul: 'Cek daun',
  hstMulai: mulai,
  hstSelesai: selesai,
  interval,
  bolehDigeser: true,
});

describe('buatJadwal (P0-12)', () => {
  it('tugas sekali HST 14 dari tanam 20 Sep → 4 Okt', () => {
    const [t] = pastikan(buatJadwal([sekali(14)], '2026-09-20'));
    expect(t).toEqual({
      id: 'pupuk@14',
      resepTugasId: 'pupuk',
      tipe: 'sekali',
      judul: 'Pupuk',
      tanggal: '2026-10-04',
      hst: 14,
      status: 'belum',
      bolehDigeser: true,
    });
  });
  it('berulang HST 1–28 setiap 3 hari → 10 kemunculan', () => {
    const j = pastikan(buatJadwal([berulang(1, 28, 3)], '2026-09-20'));
    expect(j).toHaveLength(10);
    expect(j.map((t) => t.hst)).toEqual([1, 4, 7, 10, 13, 16, 19, 22, 25, 28]);
    expect(j[0]).toMatchObject({ tanggal: '2026-09-21', interval: 3 });
    expect(j.at(-1)?.tanggal).toBe('2026-10-18');
  });
  it('interval 1 → setiap hari', () => {
    expect(hstKemunculan(berulang(0, 4, 1))).toEqual([0, 1, 2, 3, 4]);
  });
  it('tipe ukur membawa besaran, batas bawah, batas atas', () => {
    const j = pastikan(buatJadwal(CONTOH_RESEP_SAWI_HIDROPONIK.tugas, '2026-09-20'));
    const ukur = j.filter((t) => t.tipe === 'ukur');
    expect(ukur).toHaveLength(13);
    expect(ukur[0]?.ukur?.map((b) => [b.nama, b.batasBawah, b.batasAtas])).toEqual([
      ['pH', 5.5, 6.5],
      ['PPM', 1050, 1400],
    ]);
  });
  it('tanggal tanam di masa lalu (siklus pilot) tetap dihitung', () => {
    expect(pastikan(buatJadwal([sekali(7)], '2025-01-01'))[0]?.tanggal).toBe('2025-01-08');
  });
  it.each([
    ['2026-01-25', 7, '2026-02-01'],
    ['2026-12-28', 7, '2027-01-04'],
    ['2028-02-22', 7, '2028-02-29'],
    ['2027-02-22', 7, '2027-03-01'],
  ])('lompat bulan, tahun, dan kabisat: %s + %i', (tanam, hst, tanggal) => {
    expect(pastikan(buatJadwal([sekali(hst)], tanam))[0]?.tanggal).toBe(tanggal);
  });
  it('urut menurut tanggal lalu urutan resep', () => {
    const j = pastikan(
      buatJadwal(
        [
          sekali(7, { id: 'b', judul: 'B' }),
          sekali(3, { id: 'a', judul: 'A' }),
          sekali(7, { id: 'c', judul: 'C' }),
        ],
        '2026-09-20',
      ),
    );
    expect(j.map((t) => t.id)).toEqual(['a@3', 'b@7', 'c@7']);
  });
  it('resep sawi bedengan: jumlah tugas sesuai pola', () => {
    // siram 27 + cek daun 10 + 5 tugas sekali
    expect(pastikan(buatJadwal(CONTOH_RESEP_SAWI_BEDENGAN.tugas, '2026-09-20'))).toHaveLength(42);
  });
  it('idTugas stabil', () => {
    expect(idTugas('panen', 28)).toBe('panen@28');
  });
});

describe('validasiResepTugas', () => {
  it.each([
    [berulang(10, 5, 1), 'HST_TIDAK_VALID'],
    [{ ...berulang(1, 5, 1), hstSelesai: undefined }, 'HST_TIDAK_VALID'],
    [berulang(1, 5, 0), 'INTERVAL_TIDAK_VALID'],
    [{ ...berulang(1, 5, 1), interval: undefined }, 'INTERVAL_TIDAK_VALID'],
    [berulang(1, 5, 1.5), 'INTERVAL_TIDAK_VALID'],
    [sekali(-1), 'HST_TIDAK_VALID'],
    [sekali(2.5), 'HST_TIDAK_VALID'],
    [{ ...berulang(1, 5, 1), tipe: 'ukur' as const }, 'HST_TIDAK_VALID'],
  ])('%# → %s', (t, galat) => {
    expect(validasiResepTugas(t)).toEqual({ ok: false, galat });
    expect(buatJadwal([t], '2026-09-20')).toEqual({ ok: false, galat });
  });
});
