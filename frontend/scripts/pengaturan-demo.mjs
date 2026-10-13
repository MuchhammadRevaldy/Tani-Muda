/**
 * Pengaturan demo bersama untuk `npm run demo` (server pengembangan, D-37) dan `npm run build:demo`
 * (cadangan demo lokal, D-48): data tiruan dan resep contoh tampil, tanpa bergantung isi `.env`.
 */
/**
 * Sakelar animasi D-61 untuk semua build demo (`npm run demo`, `build:demo`, `demo:backend`): `nyala`
 * atau `mati`. `mati` memasang kelas `tanpa-animasi` di <html>, setara prefers-reduced-motion
 * ([AG-23]). Bisa ditimpa sekali jalan: `$env:VITE_ANIMASI='mati'; npm run demo:backend`.
 */
export const ANIMASI_DEMO = process.env.VITE_ANIMASI ?? 'nyala';

/**
 * Sakelar fitur Tahap 7 (D-64): untuk semua demo, bawaan 'nyala' kecuali ditimpa via VITE_FITUR_*.
 */
export const FITUR_DEMO = {
  VITE_FITUR_AI: process.env.VITE_FITUR_AI ?? 'nyala',
  VITE_FITUR_SARAN_UNTUNG: process.env.VITE_FITUR_SARAN_UNTUNG ?? 'nyala',
  VITE_FITUR_TANAMAN_BARU: process.env.VITE_FITUR_TANAMAN_BARU ?? 'nyala',
  VITE_FITUR_LEVEL: process.env.VITE_FITUR_LEVEL ?? 'nyala',
  VITE_FITUR_DETEKSI: process.env.VITE_FITUR_DETEKSI ?? 'nyala',
  VITE_FITUR_CHATBOT: process.env.VITE_FITUR_CHATBOT ?? 'nyala',
  VITE_FITUR_CUACA: process.env.VITE_FITUR_CUACA ?? 'nyala',
  VITE_FITUR_STOK: process.env.VITE_FITUR_STOK ?? 'nyala',
  VITE_FITUR_PETA: process.env.VITE_FITUR_PETA ?? 'nyala',
  VITE_FITUR_CHAT: process.env.VITE_FITUR_CHAT ?? 'nyala',
  VITE_FITUR_HARGA_BERITA: process.env.VITE_FITUR_HARGA_BERITA ?? 'nyala',
  VITE_FITUR_SARAN_HARIAN: process.env.VITE_FITUR_SARAN_HARIAN ?? 'nyala',
};

export const PENGATURAN_DEMO = {
  VITE_SUMBER_DATA: 'tiruan',
  VITE_TAMPILKAN_RESEP_CONTOH: 'true',
  VITE_ANIMASI: ANIMASI_DEMO,
  ...FITUR_DEMO,
};
