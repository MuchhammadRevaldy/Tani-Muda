/**
 * Teks khusus build demo (`npm run build:demo`, D-48). Hanya diimpor modul yang dimuat bila
 * MODE = "demo", sehingga tidak ikut build produksi (dicek scripts/cek-build.mjs).
 */
export const teksDemo = {
  label: 'Mode demo',
  labelAria: 'Mode demo, memakai data contoh. Buka pemilih akun demo',
} as const;
