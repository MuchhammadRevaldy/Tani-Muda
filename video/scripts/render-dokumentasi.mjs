#!/usr/bin/env node
/**
 * Render video dokumentasi [AG-52] ke keluaran/dokumentasi-tani-muda.mp4 (concurrency 1).
 * `--pratinjau` merender skala 0,5 ke keluaran/pratinjau-dokumentasi-0.5x.mp4.
 * Bahan gambar harus sudah ada: npm run bahan:dokumentasi.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VIDEO = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(VIDEO, 'keluaran'), { recursive: true });
if (!existsSync(join(VIDEO, 'public', 'dokumentasi', 'dok-prd.png'))) {
  console.error('Bahan belum ada: jalankan npm run bahan:dokumentasi dulu.');
  process.exit(1);
}
const pratinjau = process.argv.includes('--pratinjau');
const target = pratinjau ? 'keluaran/pratinjau-dokumentasi-0.5x.mp4' : 'keluaran/dokumentasi-tani-muda.mp4';
const bin = `"${join(VIDEO, 'node_modules', '.bin', process.platform === 'win32' ? 'remotion.cmd' : 'remotion')}"`;
const argumen = ['render', 'src/index.ts', 'Dokumentasi', target, '--concurrency=1', ...(pratinjau ? ['--scale=0.5'] : [])];
const mulai = Date.now();
spawn(bin, argumen, { stdio: 'inherit', cwd: VIDEO, shell: true }).on('exit', (kode) => {
  const dtk = ((Date.now() - mulai) / 1000).toFixed(1);
  console.log(kode === 0 ? `\n✓ ${target} selesai dalam ${dtk} dtk` : `\n✗ Render gagal (kode ${kode}, ${dtk} dtk)`);
  process.exit(kode ?? 1);
});
