/**
 * Konfigurasi master video teaser Tani Muda [AG-43].
 * Arah visual: Latar terang (krem #faf8f5 / putih), warna token Tani Muda,
 * tanpa emoji, tanpa kaca gelap, tanpa klise.
 * Total durasi: 170 detik (2 menit 50 detik / 5.100 frame pada 30 fps).
 * Batas maksimal lomba: strictly < 180 detik (3 menit).
 */

export const FPS = 30;
export const LEBAR = 1920;
export const TINGGI = 1080;

export const DURASI_DETIK = 170;
export const DURASI_FRAME_TOTAL = 5100;

/** Timeline 10 adegan (dalam detik dan frame) */
export const ADEGAN_CONFIG = {
  1: {
    id: '01',
    judul: '01. Pembuka',
    durasiDetik: 12,
    durasiFrame: 360,
    mulaiFrame: 0,
    subtitel: 'Tanam dengan pembeli yang pasti',
  },
  2: {
    id: '02',
    judul: '02. Data Sensus',
    durasiDetik: 15,
    durasiFrame: 450,
    mulaiFrame: 360,
    subtitel: 'Hanya 21,93% petani berusia muda',
  },
  3: {
    id: '03',
    judul: '03. Masalah Pertanian',
    durasiDetik: 18,
    durasiFrame: 540,
    mulaiFrame: 810,
    subtitel: 'Harga anjlok, takaran pupuk, dan rantai tengkulak',
  },
  4: {
    id: '04',
    judul: '04. Solusi Empat Pilar',
    durasiDetik: 13,
    durasiFrame: 390,
    mulaiFrame: 1350,
    subtitel: 'Belajar, Hitung, Rawat, dan Jual',
  },
  5: {
    id: '05',
    judul: '05. Hitung Modal & BEP',
    durasiDetik: 22,
    durasiFrame: 660,
    mulaiFrame: 1740,
    subtitel: 'Simulasi modal dan titik impas transparan',
  },
  6: {
    id: '06',
    judul: '06. Rawat Tanaman Presisi',
    durasiDetik: 19,
    durasiFrame: 570,
    mulaiFrame: 2400,
    subtitel: 'Penggaris umur, tugas harian, dan sensor nutrisi',
  },
  7: {
    id: '07',
    judul: '07. Jual Panen Pasti',
    durasiDetik: 27,
    durasiFrame: 810,
    mulaiFrame: 2970,
    subtitel: 'Uang muka aman dan kepastian pembeli awal',
  },
  8: {
    id: '08',
    judul: '08. Fitur Pintar Agrikultur',
    durasiDetik: 22,
    durasiFrame: 660,
    mulaiFrame: 3780,
    subtitel: 'Deteksi daun, chatbot budidaya, dan cuaca desa',
  },
  9: {
    id: '09',
    judul: '09. Bertahan & Gamifikasi',
    durasiDetik: 13,
    durasiFrame: 390,
    mulaiFrame: 4440,
    subtitel: 'Lencana capaian dan mode tanpa sinyal',
  },
  10: {
    id: '10',
    judul: '10. Penutup & Identitas',
    durasiDetik: 9,
    durasiFrame: 270,
    mulaiFrame: 4830,
    subtitel: 'Sandy · Kabupaten Klaten, Jawa Tengah',
  },
} as const;

export const TOKEN_WARNA = {
  latarKrem: '#faf8f5',
  latarPutih: '#ffffff',
  latarEmbun: '#f0f7f2',
  daunTua: '#1b4332',
  daun: '#2d6a4f',
  daunTerang: '#52b788',
  daunMuda: '#40916c',
  daunLembut: '#d8f3dc',
  tanah: '#6c584c',
  tanahTua: '#403d39',
  emas: '#d4a373',
  padiEmas: '#c59b27',
  tomat: '#c94a29',
  teks: '#1f2937',
  teksPudar: '#6b7280',
  garis: '#e5ded2',
};
