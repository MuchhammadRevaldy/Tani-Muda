import { describe, expect, it } from 'vitest';
import {
  idKelompok,
  kelompokkanSiklus,
  petakTerkini,
  ringkasKelompok,
  type SiklusUntukKelompok,
} from './kelompok-siklus';

const s = (
  id: string,
  tanggalTanam: string | null,
  sebagian: Partial<SiklusUntukKelompok> = {},
): SiklusUntukKelompok => ({
  id,
  status: 'aktif',
  tanggalTanam,
  alokasiId: null,
  jumlahPetak: 1,
  ...sebagian,
});
const petak = (id: string, tanam: string, status: SiklusUntukKelompok['status'] = 'aktif') =>
  s(id, tanam, { alokasiId: 'a1', jumlahPetak: 4, status });

describe('kelompokkanSiklus (D-40)', () => {
  it('petak satu alokasi menjadi satu unit; siklus biasa dan sekali panen tetap sendiri', () => {
    const u = kelompokkanSiklus([
      s('sawi', '2026-09-22'),
      petak('p3', '2026-10-06'),
      petak('p1', '2026-09-22'),
      s('padi', '2026-08-26', { alokasiId: 'a2', jumlahPetak: 1 }),
      petak('p2', '2026-09-29'),
    ]);
    expect(u.map((x) => [x.id, x.kelompok, x.anggota.map((a) => a.id)])).toEqual([
      ['sawi', false, ['sawi']],
      [idKelompok('a1'), true, ['p1', 'p2', 'p3']],
      ['padi', false, ['padi']],
    ]);
  });
});

describe('petakTerkini dan ringkasKelompok', () => {
  const hariIni = '2026-10-05';
  const anggota = [
    petak('p1', '2026-09-08', 'selesai'),
    petak('p2', '2026-09-22'),
    petak('p3', '2026-09-29'),
    petak('p4', '2026-10-06'),
  ];
  it('wakil kelompok: yang sudah ditanam dan paling dulu dipanen', () => {
    expect(petakTerkini(anggota, hariIni)?.id).toBe('p2');
  });
  it('belum ada yang ditanam: petak berikutnya; semua selesai: anggota pertama; kosong: null', () => {
    expect(petakTerkini([petak('a', '2026-10-08'), petak('b', '2026-10-15')], hariIni)?.id).toBe(
      'a',
    );
    expect(petakTerkini([petak('x', '2026-09-01', 'selesai')], hariIni)?.id).toBe('x');
    expect(petakTerkini([], hariIni)).toBeNull();
  });
  it('ringkasan: tumbuh, selesai, tanam berikutnya', () => {
    expect(ringkasKelompok(anggota, hariIni)).toEqual({
      total: 4,
      tumbuh: 2,
      selesai: 1,
      tanamBerikutnya: '2026-10-06',
    });
    expect(ringkasKelompok([petak('p', '2026-09-01')], hariIni).tanamBerikutnya).toBeNull();
  });
});
