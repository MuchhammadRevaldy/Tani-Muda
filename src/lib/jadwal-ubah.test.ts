import { describe, expect, it } from 'vitest';
import type { Tugas } from '../tipe';
import { CONTOH_RESEP_SAWI_BEDENGAN } from './fixtures/contoh-resep';
import { pastikan } from './hasil';
import { buatJadwal } from './jadwal-buat';
import {
  kelompokkanPerHari,
  ringkasBerulang,
  saringTipe,
  statusTugas,
  tundaTugas,
  ubahTanggalTanam,
} from './jadwal-ubah';
import { tambahHari } from './tanggal';

const TANAM = '2026-09-20';
const PANEN = '2026-10-18';
const jadwalSawi = () => pastikan(buatJadwal(CONTOH_RESEP_SAWI_BEDENGAN.tugas, TANAM));
const cari = (j: Tugas[], id: string) => j.find((t) => t.id === id) as Tugas;
const tugas = (sebagian: Partial<Tugas>): Tugas => ({
  id: 't',
  resepTugasId: 'r',
  tipe: 'sekali',
  judul: 'Tugas',
  tanggal: '2026-10-03',
  hst: 13,
  status: 'belum',
  bolehDigeser: true,
  ...sebagian,
});

describe('tundaTugas (P0-15)', () => {
  it.each([1, 2, 3])('tunda %i hari menggeser tugas itu', (hari) => {
    const r = pastikan(tundaTugas(jadwalSawi(), 'pupuk-1@7', hari, PANEN));
    expect(cari(r.jadwal, 'pupuk-1@7').tanggal).toBe(tambahHari('2026-09-27', hari));
    expect(r.digeser).toEqual(['pupuk-1@7']);
    expect(r.perluKonfirmasi).toBe(false);
  });
  it('tugas sejenis berikutnya ikut bergeser, yang sebelumnya dan yang selesai tidak', () => {
    const j = jadwalSawi().map((t) =>
      t.id === 'cek-daun@22' ? { ...t, status: 'selesai' as const } : t,
    );
    const r = pastikan(tundaTugas(j, 'cek-daun@10', 2, PANEN));
    expect(r.digeser).toEqual([
      'cek-daun@10',
      'cek-daun@13',
      'cek-daun@16',
      'cek-daun@19',
      'cek-daun@25',
      'cek-daun@28',
    ]);
    expect(cari(r.jadwal, 'cek-daun@7').tanggal).toBe('2026-09-27');
    expect(cari(r.jadwal, 'cek-daun@10').tanggal).toBe('2026-10-02');
    expect(cari(r.jadwal, 'cek-daun@22').tanggal).toBe('2026-10-12');
    expect(cari(r.jadwal, 'pupuk-2@14').tanggal).toBe('2026-10-04');
  });
  it('penundaan melewati perkiraan panen → perlu konfirmasi', () => {
    expect(pastikan(tundaTugas(jadwalSawi(), 'cek-daun@28', 1, PANEN)).perluKonfirmasi).toBe(true);
    expect(pastikan(tundaTugas(jadwalSawi(), 'cek-hama@20', 3, PANEN)).perluKonfirmasi).toBe(false);
  });
  it('jadwal asal tidak berubah', () => {
    const j = jadwalSawi();
    tundaTugas(j, 'pupuk-1@7', 2, PANEN);
    expect(cari(j, 'pupuk-1@7').tanggal).toBe('2026-09-27');
  });
  it.each([
    ['pupuk-1@7', 4, 'TUNDA_DI_LUAR_BATAS'],
    ['pupuk-1@7', 0, 'TUNDA_DI_LUAR_BATAS'],
    ['pupuk-1@7', 1.5, 'TUNDA_DI_LUAR_BATAS'],
    ['panen@28', 1, 'TIDAK_BOLEH_DIGESER'],
    ['siram@3', 1, 'TIDAK_BOLEH_DIGESER'],
    ['tidak-ada', 1, 'TUGAS_TIDAK_ADA'],
  ])('%s tunda %s → %s', (id, hari, galat) => {
    expect(tundaTugas(jadwalSawi(), id, hari, PANEN)).toEqual({ ok: false, galat });
  });
  it('tugas yang sudah selesai tidak bisa ditunda', () => {
    const j = jadwalSawi().map((t) =>
      t.id === 'pupuk-1@7' ? { ...t, status: 'selesai' as const } : t,
    );
    expect(tundaTugas(j, 'pupuk-1@7', 1, PANEN)).toEqual({
      ok: false,
      galat: 'TUGAS_SUDAH_SELESAI',
    });
  });
});

describe('ubahTanggalTanam (P0-17)', () => {
  it('tugas belum selesai dihitung ulang, yang selesai tidak berubah', () => {
    const j = jadwalSawi().map((t) =>
      t.id === 'pupuk-1@7' ? { ...t, status: 'selesai' as const } : t,
    );
    const baru = ubahTanggalTanam(j, TANAM, '2026-09-23');
    expect(cari(baru, 'pupuk-1@7').tanggal).toBe('2026-09-27');
    expect(cari(baru, 'pupuk-2@14').tanggal).toBe('2026-10-07');
    expect(cari(baru, 'panen@28').tanggal).toBe('2026-10-21');
  });
  it('mundur ke tanggal lebih awal', () => {
    expect(cari(ubahTanggalTanam(jadwalSawi(), TANAM, '2026-09-18'), 'panen@28').tanggal).toBe(
      '2026-10-16',
    );
  });
});

describe('statusTugas (P0-16, terlambat tidak disimpan)', () => {
  it.each([
    ['2026-10-01', 'belum', { jenis: 'terlambat', hari: 2 }],
    ['2026-10-03', 'belum', { jenis: 'hari-ini' }],
    ['2026-10-04', 'belum', { jenis: 'besok' }],
    ['2026-10-08', 'belum', { jenis: 'nanti', hari: 5 }],
    ['2026-10-01', 'selesai', { jenis: 'selesai' }],
  ] as const)('%s (%s) pada 3 Okt → %j', (tanggal, status, hasil) => {
    expect(statusTugas({ tanggal, status }, '2026-10-03')).toEqual(hasil);
  });
});

describe('kelompokkanPerHari', () => {
  it('Terlambat, Hari ini, Besok, tanggal berikutnya, Sudah selesai', () => {
    const daftar = [
      tugas({ id: 'e', tanggal: '2026-10-06' }),
      tugas({ id: 'c', tanggal: '2026-10-04', judul: 'B' }),
      tugas({ id: 'x', tanggal: '2026-10-04', judul: 'A' }),
      tugas({ id: 'a', tanggal: '2026-10-01' }),
      tugas({ id: 's', tanggal: '2026-09-30', status: 'selesai' }),
      tugas({ id: 'b', tanggal: '2026-10-03' }),
      tugas({ id: 'd', tanggal: '2026-10-05' }),
    ];
    const k = kelompokkanPerHari(daftar, '2026-10-03');
    expect(k.map((g) => g.kunci)).toEqual([
      'terlambat',
      'hari-ini',
      'besok',
      '2026-10-05',
      '2026-10-06',
      'selesai',
    ]);
    expect(k[2]?.tugas.map((t) => t.id)).toEqual(['x', 'c']);
  });
  it('kelompok kosong tidak muncul', () => {
    expect(
      kelompokkanPerHari([tugas({ tanggal: '2026-10-03' })], '2026-10-03').map((g) => g.kunci),
    ).toEqual(['hari-ini']);
    expect(kelompokkanPerHari([], '2026-10-03')).toEqual([]);
  });
});

describe('saringTipe', () => {
  it('ukur di siklus bedengan → kosong dengan kode TIDAK_ADA_TIPE', () => {
    expect(saringTipe(jadwalSawi(), 'ukur')).toEqual({ tugas: [], kosongKarena: 'TIDAK_ADA_TIPE' });
  });
  it('saring berulang dan semua', () => {
    expect(saringTipe(jadwalSawi(), 'berulang').tugas).toHaveLength(37);
    expect(saringTipe(jadwalSawi(), 'semua').tugas).toHaveLength(42);
    expect(saringTipe(jadwalSawi(), 'sekali').kosongKarena).toBeNull();
  });
});

describe('ringkasBerulang (satu baris per tugas berulang)', () => {
  it('siram dan cek daun masing-masing satu baris', () => {
    const j = jadwalSawi().map((t) => (t.hst <= 12 ? { ...t, status: 'selesai' as const } : t));
    const baris = ringkasBerulang(j);
    expect(baris).toHaveLength(7);
    const siram = baris.find((b) => b.tugas.resepTugasId === 'siram');
    expect(siram).toMatchObject({ jumlahKemunculan: 27, sisaKemunculan: 15 });
    expect(siram?.tugas.hst).toBe(13);
    expect(baris.find((b) => b.tugas.id === 'pupuk-1@7')?.sisaKemunculan).toBe(0);
  });
  it('semua kemunculan selesai → mewakili yang terakhir', () => {
    const j = jadwalSawi().map((t) => ({ ...t, status: 'selesai' as const }));
    expect(ringkasBerulang(j).find((b) => b.tugas.resepTugasId === 'cek-daun')?.tugas.hst).toBe(28);
  });
});

describe('tundaTugas dari hari ini untuk tugas terlambat (papan 22)', () => {
  const jadwal = [
    {
      id: 'siangi@11',
      resepTugasId: 'siangi',
      tipe: 'sekali' as const,
      judul: 'Siangi',
      tanggal: '2026-10-01',
      hst: 11,
      status: 'belum' as const,
      bolehDigeser: true,
    },
    {
      id: 'siangi@20',
      resepTugasId: 'siangi',
      tipe: 'sekali' as const,
      judul: 'Siangi',
      tanggal: '2026-10-10',
      hst: 20,
      status: 'belum' as const,
      bolehDigeser: true,
    },
  ];
  it('terlambat 2 hari, tunda 1 hari → besok; tugas sejenis ikut bergeser 3 hari', () => {
    const r = tundaTugas(jadwal, 'siangi@11', 1, '2026-10-18', '2026-10-03');
    expect(r.ok && r.nilai.jadwal.map((t) => t.tanggal)).toEqual(['2026-10-04', '2026-10-13']);
  });
  it('tugas belum terlambat tetap dihitung dari tanggalnya sendiri', () => {
    const r = tundaTugas(jadwal, 'siangi@20', 2, '2026-10-18', '2026-10-03');
    expect(r.ok && r.nilai.jadwal.map((t) => t.tanggal)).toEqual(['2026-10-01', '2026-10-12']);
  });
});
