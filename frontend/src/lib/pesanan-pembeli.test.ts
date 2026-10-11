import { describe, expect, it } from 'vitest';
import { jadwalKirimPesanan, kirimanTerkejar } from './pesanan-lahan';
import { hariDalamMinggu, kirimanPertamaPalingCepat, pilihanBulanPanen } from './pesanan-pembeli';

describe('jadwal formulir pesanan pembeli', () => {
  it('hari dalam minggu', () => {
    expect(hariDalamMinggu('2026-10-05')).toBe(1); // Senin
    expect(hariDalamMinggu('2026-10-04')).toBe(0); // Minggu
  });
  it.each([
    // [hari ini, umur, hari kirim, kiriman pertama]
    ['2026-10-05', 28, 1, '2026-11-02'], // Senin + 28 = Senin 2 Nov
    ['2026-10-05', 28, 4, '2026-11-05'], // Kamis berikutnya
    ['2026-10-05', 25, 1, '2026-11-02'], // 30 Okt (Jumat) → Senin 2 Nov
    ['2026-10-05', 0, 1, '2026-10-05'],
  ])('%s, umur %s, hari %s → %s', (hariIni, umur, hari, hasil) => {
    expect(kirimanPertamaPalingCepat(hariIni, umur, hari)).toBe(hasil);
  });
  it('kiriman pertama paling cepat selalu terkejar petani yang menanam hari ini', () => {
    for (const umur of [21, 25, 28, 35])
      for (let hari = 0; hari < 7; hari++) {
        const mulai = kirimanPertamaPalingCepat('2026-10-05', umur, hari);
        const jadwal = jadwalKirimPesanan({
          jenis: 'rutin',
          tanggalMulai: mulai,
          frekuensiHari: 7,
          jumlahKiriman: 4,
          perkiraanBulanPanen: null,
        });
        expect(kirimanTerkejar(jadwal, '2026-10-05', umur)).toHaveLength(4);
      }
  });
  it('bulan panen mulai bulan yang tanggal 15-nya terkejar', () => {
    expect(pilihanBulanPanen('2026-10-05', 110, 3)).toEqual(['2027-02', '2027-03', '2027-04']);
    expect(pilihanBulanPanen('2026-10-05', 30, 2)).toEqual(['2026-11', '2026-12']);
    expect(pilihanBulanPanen('2026-11-20', 30, 2)).toEqual(['2027-01', '2027-02']);
  });
});
