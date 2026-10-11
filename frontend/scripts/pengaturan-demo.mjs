/**
 * Pengaturan demo bersama untuk `npm run demo` (server pengembangan, D-37) dan `npm run build:demo`
 * (cadangan demo lokal, D-48): data tiruan dan resep contoh tampil, tanpa bergantung isi `.env`.
 */
export const PENGATURAN_DEMO = {
  VITE_SUMBER_DATA: 'tiruan',
  VITE_TAMPILKAN_RESEP_CONTOH: 'true',
};
