/**
 * Konfigurasi master video teaser Tani Muda (Remotion).
 * Total durasi: 170 detik (2 menit 50 detik / 5.100 frame pada 30 fps).
 * Batas maksimal lomba: < 180 detik (3 menit).
 */

export const FPS = 30;
export const LEBAR = 1920;
export const TINGGI = 1080;

export const DURASI_DETIK = 170;
export const DURASI_FRAME_TOTAL = 5100; // 170 * 30

/** Timeline dan durasi setiap adegan (dalam detik dan frame) */
export const ADEGAN = {
  pembuka: {
    judul: '01. Pembuka',
    mulaiDetik: 0,
    durasiDetik: 12,
    mulaiFrame: 0,
    durasiFrame: 360,
  },
  masalah: {
    judul: '02. Masalah Regenerasi & Petani Muda',
    mulaiDetik: 12,
    durasiDetik: 18,
    mulaiFrame: 360,
    durasiFrame: 540,
  },
  solusi: {
    judul: '03. Solusi 4 Pilar Tani Muda',
    mulaiDetik: 30,
    durasiDetik: 12,
    mulaiFrame: 900,
    durasiFrame: 360,
  },
  hitung: {
    judul: '04. Hitung Modal & Titik Impas (BEP)',
    mulaiDetik: 42,
    durasiDetik: 23,
    mulaiFrame: 1260,
    durasiFrame: 690,
  },
  rawat: {
    judul: '05. Rawat Tanaman Presisi & pH/PPM',
    mulaiDetik: 65,
    durasiDetik: 20,
    mulaiFrame: 1950,
    durasiFrame: 600,
  },
  jual: {
    judul: '06. Jual Panen Pasti & Kemitraan',
    mulaiDetik: 85,
    durasiDetik: 30,
    mulaiFrame: 2550,
    durasiFrame: 900,
  },
  fiturPintar: {
    judul: '07. Fitur Pintar AI, IoT & Komunitas',
    mulaiDetik: 115,
    durasiDetik: 30,
    mulaiFrame: 3450,
    durasiFrame: 900,
  },
  petaniBertahan: {
    judul: '08. Petani Bertahan, Level & Offline First',
    mulaiDetik: 145,
    durasiDetik: 15,
    mulaiFrame: 4350,
    durasiFrame: 450,
  },
  penutup: {
    judul: '09. Penutup & Identitas Pengembang',
    mulaiDetik: 160,
    durasiDetik: 10,
    mulaiFrame: 4800,
    durasiFrame: 300,
  },
} as const;

/** Palet warna kurasi modern sesuai panduan desain & token Tani Muda */
export const WARNA = {
  daunGelap: '#081c15',
  daunTua: '#1b4332',
  daun: '#2d6a4f',
  daunMuda: '#40916c',
  daunTerang: '#52b788',
  daunLembut: '#d8f3dc',
  emas: '#e9c46a',
  matahari: '#f4a261',
  terakota: '#e76f51',
  latarGelap: '#0d1f18',
  kartuGelap: 'rgba(18, 48, 36, 0.85)',
  kartuTerang: '#ffffff',
  teksUtama: '#ffffff',
  teksPudar: 'rgba(255, 255, 255, 0.75)',
  teksHijau: '#74c69d',
  garisKaca: 'rgba(82, 183, 136, 0.25)',
};
