#!/usr/bin/env node
/**
 * `npm run build:demo` (T6.09, D-48): build cadangan demo lokal di `dist-demo/` dengan MODE "demo":
 * data tiruan, resep contoh tampil, pemilih akun demo (/akun-demo) dengan tombol "Atur ulang data
 * demo", panel kode uji di Masuk, dan label "Mode demo" yang selalu terlihat. Peramban yang belum
 * punya data langsung disiapkan data demo relatif terhadap saat pertama dibuka.
 * Jalankan di laptop dengan `npm run preview:demo` (http://localhost:4173).
 * Build produksi biasa (`npm run build`, `dist/`) tetap tanpa semua itu (scripts/cek-build.mjs).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { PENGATURAN_DEMO } from './pengaturan-demo.mjs';

Object.assign(process.env, PENGATURAN_DEMO);
const akar = fileURLToPath(new URL('..', import.meta.url));
const keluar = join(akar, 'dist-demo');

await build({ root: akar, mode: 'demo', build: { outDir: keluar, emptyOutDir: true } });

// Pastikan bagian demo memang ikut (kebalikan cek-build.mjs).
const telusuri = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const j = join(dir, n);
    return statSync(j).isDirectory() ? telusuri(j) : [j];
  });
const semua = telusuri(keluar)
  .filter((b) => b.endsWith('.js'))
  .map((b) => readFileSync(b, 'utf8'))
  .join('\n');
const wajib = ['Pilih akun demo', 'Atur ulang data demo', 'Kode uji:', 'Mode demo'];
const hilang = wajib.filter((w) => !semua.includes(w));
if (hilang.length) {
  console.error('Build demo tidak memuat: ' + hilang.join(', '));
  process.exit(1);
}
console.log(
  '\nBuild demo siap di dist-demo/: pemilih akun demo, kode uji, dan label "Mode demo" ikut.',
);
console.log('Jalankan: npm run preview:demo  →  http://localhost:4173');
