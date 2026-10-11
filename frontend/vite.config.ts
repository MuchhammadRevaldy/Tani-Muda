/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Proxy ke backend Laravel (D-21, arsitektur-backend.md 5a): peramban hanya berbicara dengan
 * localhost:5173, jadi cookie sesi Sanctum dan XSRF-TOKEN berasal dari asal yang sama dan tidak
 * perlu CORS. `Host` tidak diubah (`changeOrigin: false`) agar Sanctum mengenali permintaan dari
 * SANCTUM_STATEFUL_DOMAINS. Alamat backend lain: variabel proses TANI_MUDA_API (bukan .env
 * frontend, karena .env frontend hanya untuk VITE_*).
 */
const API = process.env.TANI_MUDA_API ?? 'http://127.0.0.1:8000';
const proxy = {
  '/api': { target: API, changeOrigin: false },
  '/sanctum': { target: API, changeOrigin: false },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
  // Manifest dipakai scripts/ukur-bundel.mjs untuk mengukur JavaScript halaman pertama (D-48).
  build: { manifest: true },
  test: {
    css: false,
    // Dua pekerja: tes halaman (jsdom) berat di memori. Dengan RAM bebas sekitar 2 GB, empat pekerja
    // atau lebih membuat tes 5–15 kali lebih lambat dan melewati batas waktu (D-43). Seluruh tes
    // tetap selesai sekitar 2 menit.
    maxWorkers: 2,
    projects: [
      {
        extends: true,
        test: {
          name: 'murni',
          environment: 'node',
          include: [
            'src/lib/**/*.test.ts',
            'src/teks/**/*.test.ts',
            'src/api/**/*.test.ts',
            'src/penyedia/**/*.test.ts',
            'scripts/**/*.test.mjs',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'komponen',
          environment: 'jsdom',
          // Tes halaman biasanya 0,2–2 detik; batas 15 detik memberi ruang saat mesin sibuk tanpa
          // menyembunyikan tes yang macet (D-43).
          testTimeout: 15_000,
          setupFiles: ['./src/uji/persiapan.ts'],
          include: ['src/**/*.test.tsx'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts', 'src/lib/fixtures/**'],
      thresholds: { lines: 90, functions: 90, statements: 90, branches: 85 },
    },
  },
});
