import { FPS } from '../v2/tema';

/**
 * Linimasa video dokumentasi [AG-52]. Musik (public/audio/musik.mp3) berdenyut tiap 0,5 detik,
 * jadi setiap durasi shot kelipatan 0,5 detik supaya semua potongan jatuh di ketukan.
 * `tanggal` = rentang pita tanggal untuk adegan itu (hari Oktober 2026).
 */
export interface Adegan {
  id: string;
  nama: string;
  tanggal: [number, number];
}

export const ADEGAN: Adegan[] = [
  { id: 'ide', nama: 'Ide dan masalah', tanggal: [5, 5] },
  { id: 'rencana', nama: 'Perencanaan', tanggal: [5, 8] },
  { id: 'desain', nama: 'Desain', tanggal: [9, 14] },
  { id: 'alur', nama: 'Flowchart', tanggal: [15, 15] },
  { id: 'kode', nama: 'Coding', tanggal: [16, 18] },
  { id: 'uji', nama: 'Pengujian', tanggal: [18, 19] },
  { id: 'hasil', nama: 'Hasil akhir', tanggal: [19, 19] },
  { id: 'tutup', nama: 'Penutup', tanggal: [19, 19] },
];

const DAFTAR: [id: string, adegan: string, detik: number, ringkas: string][] = [
  ['01', 'ide', 4, 'Pembuka: bahan asli berhamburan'],
  ['02', 'ide', 5, 'PRD: latar belakang masalah'],
  ['03', 'ide', 5, 'Empat ketidakpastian dari PRD'],
  ['04', 'rencana', 5.5, 'PRD: kebutuhan wajib P0'],
  ['05', 'rencana', 5.5, 'Keputusan D-01 sampai D-68'],
  ['06', 'rencana', 5, 'Rencana kerja per tahap'],
  ['07', 'rencana', 5, 'Kontrak API'],
  ['08', 'desain', 6, 'Papan desain menyebar, zoom satu'],
  ['09', 'desain', 4.5, 'Kerangka Tahap 1'],
  ['10', 'desain', 6, 'Geser: demo-aman ke sekarang'],
  ['11', 'desain', 6, 'Logo tumbuh jadi empat versi'],
  ['12', 'desain', 5.5, 'Ikon, ilustrasi, lencana'],
  ['13', 'alur', 5, 'Flowchart naskah demo 1–5'],
  ['14', 'alur', 3.5, 'Kotak alur jadi layar Hitung'],
  ['15', 'alur', 5, 'Flowchart naskah demo 6–10'],
  ['16', 'alur', 3.5, 'Kotak alur jadi layar Pesanan'],
  ['17', 'kode', 5.5, 'Layar IDE'],
  ['18', 'kode', 6, 'Grafik commit per hari'],
  ['19', 'kode', 5, 'Daftar commit dan tag'],
  ['20', 'uji', 6, 'Terminal: tes otomatis'],
  ['21', 'uji', 5, 'Terminal: uji naskah'],
  ['22', 'uji', 6, 'XAMPP dan phpMyAdmin'],
  ['23', 'hasil', 6, 'HP dan laptop: Belajar, Hitung, Rawat, Jual'],
  ['24', 'hasil', 5, 'Panel admin'],
  ['25', 'tutup', 6, 'Penutup'],
];

export interface ShotDok {
  id: string;
  adegan: string;
  ringkas: string;
  mulaiFrame: number;
  durasiFrame: number;
  awalAdegan: boolean;
}

let jalan = 0;
export const SHOT_DOK: ShotDok[] = DAFTAR.map(([id, adegan, detik, ringkas], i) => {
  const durasiFrame = Math.round(detik * FPS);
  const s = { id, adegan, ringkas, mulaiFrame: jalan, durasiFrame, awalAdegan: i === 0 || DAFTAR[i - 1][1] !== adegan };
  jalan += durasiFrame;
  return s;
});

export const TOTAL_FRAME_DOK = jalan;
