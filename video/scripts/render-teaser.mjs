#!/usr/bin/env node
/**
 * Script render video teaser Tani Muda ke MP4.
 * Menggunakan konfigurasi stabil: concurrency 1, h264, yuv420p.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const folderVideo = join(__dirname, '..');
const folderKeluaran = join(folderVideo, 'keluaran');
mkdirSync(folderKeluaran, { recursive: true });

// 1. Jalankan cek durasi terlebih dahulu
const cek = spawn(process.execPath, [join(__dirname, 'cek-durasi.mjs')], {
  stdio: 'inherit',
  cwd: folderVideo,
});

cek.on('exit', (kode) => {
  if (kode !== 0) {
    console.error('Render dibatalkan karena pemeriksaan durasi gagal.');
    process.exit(kode ?? 1);
  }

  console.log('Memulai proses render Remotion ke video/keluaran/teaser-tani-muda.mp4...');
  const mulai = Date.now();

  const remotionBin = `"${join(
    folderVideo,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'remotion.cmd' : 'remotion',
  )}"`;

  const argumen = [
    'render',
    'src/index.ts',
    'TeaserTaniMuda',
    'keluaran/teaser-tani-muda.mp4',
    '--concurrency=1',
  ];

  const render = spawn(remotionBin, argumen, {
    stdio: 'inherit',
    cwd: folderVideo,
    shell: true,
  });

  render.on('exit', (kodeRender) => {
    const durasi = ((Date.now() - mulai) / 1000).toFixed(1);
    if (kodeRender === 0) {
      console.log(`\n✓ Render video selesai dengan sukses dalam ${durasi} detik.`);
      console.log(`  Berkas video: ${join(folderKeluaran, 'teaser-tani-muda.mp4')}\n`);
    } else {
      console.error(`\n✗ Render video gagal dengan kode keluar ${kodeRender} (${durasi} detik).`);
    }
    process.exit(kodeRender ?? 0);
  });
});
