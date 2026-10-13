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

export const PENGATURAN_DEMO = {
  VITE_SUMBER_DATA: 'tiruan',
  VITE_TAMPILKAN_RESEP_CONTOH: 'true',
  VITE_ANIMASI: ANIMASI_DEMO,
};
