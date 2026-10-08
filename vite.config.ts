/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
