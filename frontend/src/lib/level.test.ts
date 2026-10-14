import { describe, expect, it } from 'vitest';
import kasusLevel from '../../../shared/kasus-uji/level.json';
import { cekLencana, hitungPoin, levelDariPoin, type PeristiwaPoin } from './level';

describe('Level dan Lencana Pengguna (F-03)', () => {
  it('menghitung poin dan level sesuai kasus bersama level.json', () => {
    for (const k of kasusLevel.kasus) {
      if (k.fungsi === 'hitungPoin' && k.masukan.peristiwa) {
        const poin = hitungPoin(k.masukan.peristiwa as unknown as PeristiwaPoin);
        expect(poin).toBe(k.keluaran);
      } else if (k.fungsi === 'levelDariPoin' && typeof k.masukan.poin === 'number') {
        const hasil = levelDariPoin(k.masukan.poin);
        const ekspektasi = k.keluaran as {
          level: string;
          levelBerikutnya: string | null;
          poinKeBerikutnya: number;
        };
        expect(hasil.level).toBe(ekspektasi.level);
        expect(hasil.levelBerikutnya).toBe(ekspektasi.levelBerikutnya);
        expect(hasil.poinKeBerikutnya).toBe(ekspektasi.poinKeBerikutnya);
      }
    }
  });

  it('memverifikasi kelayakan lencana berdasarkan statistik peran', () => {
    const hasilPetani = cekLencana('petani', {
      siklus_aktif: 1,
      siklus_selesai: 0,
      hari_berturut_tepat_waktu: 7,
      jumlah_foto: 20,
      jumlah_pengukuran: 10,
      modul_per_metode_selesai: true,
      kiriman_diterima_penuh: 5,
      rata_rata_rating: 4.9,
      jumlah_ulasan: 6,
      pesanan_dibayar: 0,
      pesanan_selesai: 0,
    });
    expect(hasilPetani.diraih).toContain('tanam-pertama');
    expect(hasilPetani.diraih).toContain('tepat-waktu-7-hari');
    expect(hasilPetani.diraih).toContain('kebun-terdokumentasi');
    expect(hasilPetani.diraih).toContain('pengukur-teliti');
    expect(hasilPetani.diraih).toContain('pelajar-rajin');
    expect(hasilPetani.diraih).toContain('dipercaya-pembeli');
    expect(hasilPetani.diraih).toContain('bintang-lima');

    const hasilPembeli = cekLencana('pembeli', {
      siklus_aktif: 0,
      siklus_selesai: 0,
      hari_berturut_tepat_waktu: 0,
      jumlah_foto: 0,
      jumlah_pengukuran: 0,
      modul_per_metode_selesai: false,
      kiriman_diterima_penuh: 0,
      rata_rata_rating: 5.0,
      jumlah_ulasan: 5,
      pesanan_dibayar: 2,
      pesanan_selesai: 3,
    });
    expect(hasilPembeli.diraih).toContain('pesanan-pertama');
    expect(hasilPembeli.diraih).toContain('pembeli-setia');
    expect(hasilPembeli.diraih).toContain('bintang-lima');
  });

  it('menghitung persentase kemajuan menuju level berikutnya dengan benar', () => {
    const hasilTunasTengah = levelDariPoin(200);
    expect(hasilTunasTengah.level).toBe('Tunas');
    expect(hasilTunasTengah.levelBerikutnya).toBe('Daun');
    // Rentang 100 ke 300 adalah 200 poin. 200 - 100 = 100 -> 50%
    expect(hasilTunasTengah.persenKemajuan).toBe(50);
  });
});
