#!/usr/bin/env node
/**
 * `npm run demo:backend` (D-57, [AG-11]): demo hari-H dengan backend Laravel + MariaDB lokal.
 *
 * 1. Memeriksa PHP 8.3+, backend/.env, dan MariaDB (sama dengan `npm run dev`).
 * 2. Membangun frontend ke `dist-demo-backend/` dengan MODE "demo" dan `VITE_SUMBER_DATA=http`:
 *    pemilih akun demo, panel Kode uji, dan label "Mode demo" ikut, tetapi datanya dari backend.
 *    Build produksi (`npm run build`, `dist/`) tidak tersentuh dan tetap diperiksa cek-build.mjs.
 * 3. Menjalankan `php artisan serve` dan `vite preview` di http://localhost:4174, yang mem-proxy
 *    /api dan /sanctum ke Laravel. Tidak ada kompilasi saat halaman pertama kali dibuka, jadi
 *    langkah naskah tidak bergantung pada kecepatan server pengembangan.
 *
 * `--tanpa-build` memakai hasil build sebelumnya (pagi hari, bila kode tidak berubah).
 * Atur ulang data: `php artisan demo:atur-ulang` di backend/, atau tombol di /akun-demo.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gagal, jalankanApi, periksaPrasyarat } from './backend-lokal.mjs';
import { ANIMASI_DEMO } from './pengaturan-demo.mjs';

export const PORT_DEMO_BACKEND = 4174;
const akar = fileURLToPath(new URL('..', import.meta.url));
const keluar = join(akar, 'dist-demo-backend');
const argumen = process.argv.slice(2);

process.env.VITE_SUMBER_DATA = 'http';
process.env.VITE_TAMPILKAN_RESEP_CONTOH = 'true';
process.env.VITE_ANIMASI = ANIMASI_DEMO;

// Build di proses anak (`--hanya-build`) yang selesai sendiri, supaya memori bundler tidak tertahan
// di proses server pratinjau selama demo (laptop ±2 GB RAM bebas, arsitektur-backend.md 2b).
if (argumen.includes('--hanya-build')) {
  const { build } = await import('vite');
  await build({
    root: akar,
    mode: 'demo',
    logLevel: 'warn',
    build: { outDir: keluar, emptyOutDir: true },
  });
  const telusuri = (dir) =>
    readdirSync(dir).flatMap((n) => {
      const j = join(dir, n);
      return statSync(j).isDirectory() ? telusuri(j) : [j];
    });
  const semua = telusuri(keluar)
    .filter((b) => b.endsWith('.js'))
    .map((b) => readFileSync(b, 'utf8'))
    .join('\n');
  const hilang = ['Pilih akun demo', 'Kode uji:', 'Mode demo', '/api/v1'].filter(
    (w) => !semua.includes(w),
  );
  if (hilang.length) gagal('Build demo backend tidak memuat: ' + hilang.join(', '));
  console.log('  Build demo backend siap di dist-demo-backend/.');
  process.exit(0);
}

await periksaPrasyarat();
if (!argumen.includes('--tanpa-build') || !existsSync(join(keluar, 'index.html'))) {
  const b = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--hanya-build'], {
    stdio: 'inherit',
  });
  if (b.status !== 0) gagal('Build demo backend gagal.');
}
const { preview } = await import('vite');

jalankanApi();
const server = await preview({
  root: akar,
  mode: 'demo',
  build: { outDir: keluar },
  preview: { port: PORT_DEMO_BACKEND, strictPort: true },
});
console.log('\n  Demo dengan backend: http://localhost:' + PORT_DEMO_BACKEND);
console.log('  API Laravel: http://127.0.0.1:8000 (atur ulang: php artisan demo:atur-ulang)');
server.printUrls();
