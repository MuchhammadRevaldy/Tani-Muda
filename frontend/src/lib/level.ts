/**
 * Level petani dan lencana pencapaian (PRD Tambahan F-03, D-64).
 * Fungsi murni untuk menghitung poin, menentukan level, dan memeriksa kelayakan lencana.
 */

export interface AmbangLevel {
  level: string;
  poin_minimal: number;
  ikon: string;
}

export const AMBANG_LEVEL_BAWAAN: AmbangLevel[] = [
  { level: 'Benih', poin_minimal: 0, ikon: 'level-benih' },
  { level: 'Tunas', poin_minimal: 100, ikon: 'level-tunas' },
  { level: 'Daun', poin_minimal: 300, ikon: 'level-daun' },
  { level: 'Berbunga', poin_minimal: 700, ikon: 'level-berbunga' },
  { level: 'Panen Raya', poin_minimal: 1500, ikon: 'level-panen-raya' },
];

export interface PeristiwaPoin {
  tugas_tepat_waktu: number;
  tugas_terlambat: number;
  foto_bukti: number;
  pengukuran_ph_ppm: number;
  modul_selesai: number;
  siklus_selesai: number;
  kiriman_diterima: number;
  rating_bintang_lima: number;
}

export const POIN_PERISTIWA = {
  tugas_tepat_waktu: 10,
  tugas_terlambat: 3,
  foto_bukti: 2,
  pengukuran_ph_ppm: 5,
  modul_selesai: 5,
  siklus_selesai: 100,
  kiriman_diterima: 50,
  rating_bintang_lima: 20,
} as const;

export function hitungPoin(peristiwa: PeristiwaPoin): number {
  return (
    peristiwa.tugas_tepat_waktu * POIN_PERISTIWA.tugas_tepat_waktu +
    peristiwa.tugas_terlambat * POIN_PERISTIWA.tugas_terlambat +
    peristiwa.foto_bukti * POIN_PERISTIWA.foto_bukti +
    peristiwa.pengukuran_ph_ppm * POIN_PERISTIWA.pengukuran_ph_ppm +
    peristiwa.modul_selesai * POIN_PERISTIWA.modul_selesai +
    peristiwa.siklus_selesai * POIN_PERISTIWA.siklus_selesai +
    peristiwa.kiriman_diterima * POIN_PERISTIWA.kiriman_diterima +
    peristiwa.rating_bintang_lima * POIN_PERISTIWA.rating_bintang_lima
  );
}

export interface HasilLevel {
  poin: number;
  level: string;
  ikon: string;
  levelBerikutnya: string | null;
  ikonBerikutnya: string | null;
  poinKeBerikutnya: number;
  persenKemajuan: number;
}

export function levelDariPoin(
  poin: number,
  ambang: AmbangLevel[] = AMBANG_LEVEL_BAWAAN,
): HasilLevel {
  const urut = [...ambang].sort((a, b) => a.poin_minimal - b.poin_minimal);
  let indeksSekarang = 0;

  for (let i = 0; i < urut.length; i++) {
    const item = urut[i];
    if (item && poin >= item.poin_minimal) {
      indeksSekarang = i;
    }
  }

  const sekarang = urut[indeksSekarang] ?? { level: 'Benih', poin_minimal: 0, ikon: 'level-benih' };
  const berikutnya = indeksSekarang + 1 < urut.length ? urut[indeksSekarang + 1] ?? null : null;

  let poinKeBerikutnya = 0;
  let persenKemajuan = 100;

  if (berikutnya) {
    poinKeBerikutnya = Math.max(0, berikutnya.poin_minimal - poin);
    const rentang = berikutnya.poin_minimal - sekarang.poin_minimal;
    const progress = poin - sekarang.poin_minimal;
    persenKemajuan = rentang > 0 ? Math.min(100, Math.round((progress / rentang) * 100)) : 100;
  }

  return {
    poin,
    level: sekarang.level,
    ikon: sekarang.ikon,
    levelBerikutnya: berikutnya ? berikutnya.level : null,
    ikonBerikutnya: berikutnya ? berikutnya.ikon : null,
    poinKeBerikutnya,
    persenKemajuan,
  };
}

export interface StatistikLencana {
  siklus_aktif: number;
  siklus_selesai: number;
  hari_berturut_tepat_waktu: number;
  jumlah_foto: number;
  jumlah_pengukuran: number;
  modul_per_metode_selesai: boolean;
  kiriman_diterima_penuh: number;
  rata_rata_rating: number;
  jumlah_ulasan: number;
  pesanan_dibayar: number;
  pesanan_selesai: number;
}

export interface DefinisiLencana {
  kode: string;
  nama: string;
  syarat: string;
  peran: ('petani' | 'pembeli')[];
  cek: (s: StatistikLencana) => boolean;
  kemajuan: (s: StatistikLencana) => string;
}

export const DAFTAR_LENCANA: DefinisiLencana[] = [
  {
    kode: 'tanam-pertama',
    nama: 'Tanam pertama',
    syarat: 'Siklus pertama aktif',
    peran: ['petani'],
    cek: (s) => s.siklus_aktif >= 1 || s.siklus_selesai >= 1,
    kemajuan: (s) => `${Math.min(1, s.siklus_aktif + s.siklus_selesai)}/1 siklus`,
  },
  {
    kode: 'tepat-waktu-7-hari',
    nama: 'Tepat waktu 7 hari',
    syarat: '7 hari berturut-turut semua tugas selesai tepat waktu',
    peran: ['petani'],
    cek: (s) => s.hari_berturut_tepat_waktu >= 7,
    kemajuan: (s) => `${Math.min(7, s.hari_berturut_tepat_waktu)}/7 hari`,
  },
  {
    kode: 'kebun-terdokumentasi',
    nama: 'Kebun terdokumentasi',
    syarat: '20 foto bukti tugas',
    peran: ['petani'],
    cek: (s) => s.jumlah_foto >= 20,
    kemajuan: (s) => `${Math.min(20, s.jumlah_foto)}/20 foto`,
  },
  {
    kode: 'pengukur-teliti',
    nama: 'Pengukur teliti',
    syarat: '10 pengukuran pH/PPM diisi',
    peran: ['petani'],
    cek: (s) => s.jumlah_pengukuran >= 10,
    kemajuan: (s) => `${Math.min(10, s.jumlah_pengukuran)}/10 pengukuran`,
  },
  {
    kode: 'pelajar-rajin',
    nama: 'Pelajar rajin',
    syarat: 'Semua modul satu cara tanam selesai',
    peran: ['petani'],
    cek: (s) => s.modul_per_metode_selesai,
    kemajuan: (s) => (s.modul_per_metode_selesai ? 'Selesai' : 'Belum selesai'),
  },
  {
    kode: 'panen-pertama',
    nama: 'Panen pertama',
    syarat: 'Siklus pertama selesai dipanen',
    peran: ['petani'],
    cek: (s) => s.siklus_selesai >= 1,
    kemajuan: (s) => `${Math.min(1, s.siklus_selesai)}/1 panen`,
  },
  {
    kode: 'dipercaya-pembeli',
    nama: 'Dipercaya pembeli',
    syarat: '5 kiriman diterima tanpa penolakan',
    peran: ['petani'],
    cek: (s) => s.kiriman_diterima_penuh >= 5,
    kemajuan: (s) => `${Math.min(5, s.kiriman_diterima_penuh)}/5 kiriman`,
  },
  {
    kode: 'bintang-lima',
    nama: 'Bintang lima',
    syarat: 'Rata-rata rating ≥ 4,8 dari ≥ 5 ulasan',
    peran: ['petani', 'pembeli'],
    cek: (s) => s.jumlah_ulasan >= 5 && s.rata_rata_rating >= 4.8,
    kemajuan: (s) => `${s.rata_rata_rating.toFixed(1)}/5.0 (${s.jumlah_ulasan} ulasan)`,
  },
  {
    kode: 'pesanan-pertama',
    nama: 'Pesanan pertama',
    syarat: 'Pesanan pertama berhasil dibayar',
    peran: ['pembeli'],
    cek: (s) => s.pesanan_dibayar >= 1,
    kemajuan: (s) => `${Math.min(1, s.pesanan_dibayar)}/1 pesanan`,
  },
  {
    kode: 'pembeli-setia',
    nama: 'Pembeli setia',
    syarat: '3 pesanan selesai diterima',
    peran: ['pembeli'],
    cek: (s) => s.pesanan_selesai >= 3,
    kemajuan: (s) => `${Math.min(3, s.pesanan_selesai)}/3 pesanan`,
  },
];

export function cekLencana(
  peran: 'petani' | 'pembeli',
  statistik: StatistikLencana,
): { diraih: string[]; terkunci: { kode: string; nama: string; syarat: string; kemajuan: string }[] } {
  const yangCocok = DAFTAR_LENCANA.filter((l) => l.peran.includes(peran));
  const diraih: string[] = [];
  const terkunci: { kode: string; nama: string; syarat: string; kemajuan: string }[] = [];

  for (const l of yangCocok) {
    if (l.cek(statistik)) {
      diraih.push(l.kode);
    } else {
      terkunci.push({
        kode: l.kode,
        nama: l.nama,
        syarat: l.syarat,
        kemajuan: l.kemajuan(statistik),
      });
    }
  }

  return { diraih, terkunci };
}
