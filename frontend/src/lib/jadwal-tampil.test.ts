import { describe, expect, it } from 'vitest';
import type { Tugas } from '../tipe';
import { tugasJadwal } from './jadwal-tampil';

const HARI_INI = '2026-10-03';
const t = (id: string, tanggal: string, lain: Partial<Tugas> = {}): Tugas => ({
  id,
  resepTugasId: id.split('@')[0] as string,
  tipe: 'berulang',
  judul: id,
  tanggal,
  hst: 0,
  status: 'belum',
  bolehDigeser: true,
  ...lain,
});

describe('tugasJadwal (papan 20)', () => {
  it('berulang harian: hari ini dan besok saja; yang lalu dan jauh tidak tampil', () => {
    const daftar = [
      t('siram@11', '2026-10-01', { status: 'selesai' }),
      t('siram@12', '2026-10-02'),
      t('siram@13', HARI_INI),
      t('siram@14', '2026-10-04'),
      t('siram@15', '2026-10-05'),
    ];
    expect(tugasJadwal(daftar, HARI_INI).map((x) => x.id)).toEqual(['siram@13', 'siram@14']);
  });

  it('tanpa kemunculan hari ini: yang terlambat terakhir dan berikutnya tampil', () => {
    const daftar = [
      t('daun@7', '2026-09-27'),
      t('daun@10', '2026-09-30'),
      t('daun@16', '2026-10-06'),
      t('daun@19', '2026-10-09'),
    ];
    expect(tugasJadwal(daftar, HARI_INI).map((x) => x.id)).toEqual(['daun@10', 'daun@16']);
  });

  it('tugas sekali tampil semua termasuk yang selesai; ukur diperlakukan seperti berulang', () => {
    const daftar = [
      t('pupuk-1@7', '2026-09-27', { tipe: 'sekali', status: 'selesai' }),
      t('panen@28', '2026-10-18', { tipe: 'sekali' }),
      t('ukur@12', '2026-10-02', { tipe: 'ukur', status: 'selesai' }),
      t('ukur@14', '2026-10-04', { tipe: 'ukur' }),
    ];
    expect(tugasJadwal(daftar, HARI_INI).map((x) => x.id)).toEqual([
      'pupuk-1@7',
      'panen@28',
      'ukur@14',
    ]);
    expect(tugasJadwal([], HARI_INI)).toEqual([]);
  });
});
