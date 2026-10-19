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
 * Sakelar kapsul penafian [AG-50] untuk semua build demo: bawaannya `mati` (kapsul CONTOH, Draf,
 * Mode uji coba, Foto contoh tidak dirender). Di tes dan pengembangan biasa bawaannya nyala.
 * Bisa ditimpa: `$env:VITE_LABEL_PENAFIAN='nyala'; npm run demo:backend`.
 */
export const LABEL_PENAFIAN_DEMO = process.env.VITE_LABEL_PENAFIAN ?? 'mati';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function bacaEnvFile() {
  const p = resolve('.env');
  if (!existsSync(p)) return {};
  const baris = readFileSync(p, 'utf8').split('\n');
  const env = {};
  for (const b of baris) {
    const m = b.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
    if (m && m[1]) {
      env[m[1]] = (m[2] ?? '').trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}
const envLokal = bacaEnvFile();

export const FITUR_DEMO = {
  VITE_FITUR_AI: process.env.VITE_FITUR_AI ?? envLokal.VITE_FITUR_AI ?? 'nyala',
  VITE_FITUR_SARAN_UNTUNG: process.env.VITE_FITUR_SARAN_UNTUNG ?? envLokal.VITE_FITUR_SARAN_UNTUNG ?? 'nyala',
  VITE_FITUR_TANAMAN_BARU: process.env.VITE_FITUR_TANAMAN_BARU ?? envLokal.VITE_FITUR_TANAMAN_BARU ?? 'nyala',
  VITE_FITUR_LEVEL: process.env.VITE_FITUR_LEVEL ?? envLokal.VITE_FITUR_LEVEL ?? 'nyala',
  VITE_FITUR_DETEKSI: process.env.VITE_FITUR_DETEKSI ?? envLokal.VITE_FITUR_DETEKSI ?? 'nyala',
  VITE_FITUR_CHATBOT: process.env.VITE_FITUR_CHATBOT ?? envLokal.VITE_FITUR_CHATBOT ?? 'nyala',
  VITE_FITUR_CUACA: process.env.VITE_FITUR_CUACA ?? envLokal.VITE_FITUR_CUACA ?? 'nyala',
  VITE_FITUR_STOK: process.env.VITE_FITUR_STOK ?? envLokal.VITE_FITUR_STOK ?? 'nyala',
  VITE_FITUR_PETA: process.env.VITE_FITUR_PETA ?? envLokal.VITE_FITUR_PETA ?? 'nyala',
  VITE_FITUR_CHAT: process.env.VITE_FITUR_CHAT ?? envLokal.VITE_FITUR_CHAT ?? 'nyala',
  VITE_FITUR_HARGA_BERITA: process.env.VITE_FITUR_HARGA_BERITA ?? envLokal.VITE_FITUR_HARGA_BERITA ?? 'nyala',
  VITE_FITUR_SARAN_HARIAN: process.env.VITE_FITUR_SARAN_HARIAN ?? envLokal.VITE_FITUR_SARAN_HARIAN ?? 'nyala',
};

export const PENGATURAN_DEMO = {
  VITE_SUMBER_DATA: 'tiruan',
  VITE_TAMPILKAN_RESEP_CONTOH: 'true',
  VITE_ANIMASI: ANIMASI_DEMO,
  VITE_LABEL_PENAFIAN: LABEL_PENAFIAN_DEMO,
  ...FITUR_DEMO,
};
