import { describe, expect, it } from 'vitest';
import { ringkasanHarian, type FotoHarian, type ResepHarian, type TugasHarian } from './ringkasan-harian';

describe('ringkasanHarian (F-11)', () => {
  const hariIni = '2026-10-15';
  const besok = '2026-10-16';

  const tugasLengkap: TugasHarian[] = [
    {
      id: 't-1',
      judul: 'Penyiraman pagi',
      tanggal: hariIni,
      selesai: true,
      fase_tanam: 'vegetatif',
    },
    {
      id: 't-2',
      judul: 'Pemberian nutrisi AB Mix',
      tanggal: hariIni,
      selesai: true,
      fase_tanam: 'vegetatif',
    },
    {
      id: 't-3',
      judul: 'Pemeriksaan hama daun',
      tanggal: besok,
      selesai: false,
    },
  ];

  const fotoBukti: FotoHarian[] = [
    {
      id: 'foto-1',
      url: '/unggah/foto-sawi-1.jpg',
      tugas_id: 't-1',
    },
  ];

  const resepContoh: ResepHarian = {
    komoditas_id: 'sawi',
    tahap_saran: [
      {
        fase: 'vegetatif',
        saran: [
          'Jaga kepekatan nutrisi pada rentang 1050-1100 PPM.',
          'Pastikan naungan paranet terpasang bila terik matahari berlebih.',
        ],
      },
    ],
    saran_suhu_tinggi: 'Pasang sungkup peneduh di siang terik.',
  };

  it('menghitung semua tugas selesai dan poin dengan tepat', () => {
    const hasil = ringkasanHarian(tugasLengkap, fotoBukti, resepContoh, hariIni);

    expect(hasil.semuaSelesai).toBe(true);
    expect(hasil.jumlahTugasHariIni).toBe(2);
    expect(hasil.jumlahTugasSelesai).toBe(2);
    expect(hasil.jumlahFotoBukti).toBe(1);
    // 2 tugas * 10 poin + 1 foto * 2 poin = 22 poin
    expect(hasil.poinDiperoleh).toBe(22);
    expect(hasil.tugasBesok).toEqual([{ id: 't-3', judul: 'Pemeriksaan hama daun' }]);
    expect(hasil.saranTahap).toHaveLength(2);
    expect(hasil.saranTahap[0]).toBe('Jaga kepekatan nutrisi pada rentang 1050-1100 PPM.');
    expect(hasil.bisaCekKesehatan).toBe(true);
    expect(hasil.fotoCekKesehatanUrl).toBe('/unggah/foto-sawi-1.jpg');
  });

  it('semuaSelesai false bila ada tugas hari ini yang belum selesai', () => {
    const tugasSebagian: TugasHarian[] = [
      { id: 't-1', judul: 'Penyiraman pagi', tanggal: hariIni, selesai: true },
      { id: 't-2', judul: 'Penyiangan gulma', tanggal: hariIni, selesai: false },
    ];

    const hasil = ringkasanHarian(tugasSebagian, [], null, hariIni);
    expect(hasil.semuaSelesai).toBe(false);
    expect(hasil.jumlahTugasSelesai).toBe(1);
    expect(hasil.bisaCekKesehatan).toBe(false);
    expect(hasil.fotoCekKesehatanUrl).toBeNull();
  });

  it('memberikan saran bawaan jika resep tidak menyediakan tahap_saran', () => {
    const hasil = ringkasanHarian(tugasLengkap, [], null, hariIni);
    expect(hasil.saranTahap.length).toBeGreaterThanOrEqual(1);
  });
});
