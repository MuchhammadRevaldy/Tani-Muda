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

// 1. Pemeriksaan dulu: ikon aplikasi sinkron, narasi berisi suara, durasi <= 3:00.
const cek = spawn('npm', ['run', 'cek'], {
  stdio: 'inherit',
  cwd: folderVideo,
  shell: true,
});

cek.on('exit', (kode) => {
  if (kode !== 0) {
    console.error('Render dibatalkan karena pemeriksaan gagal.');
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

  const isPratinjau = process.argv.includes('--pratinjau') || process.argv.includes('--scale=0.5');
  const targetFile = isPratinjau ? 'keluaran/pratinjau-teaser-0.5x.mp4' : 'keluaran/teaser-tani-muda.mp4';

  const argumen = [
    'render',
    'src/index.ts',
    'TeaserTaniMuda',
    targetFile,
    '--concurrency=1',
  ];

  if (isPratinjau) {
    argumen.push('--scale=0.5');
  }

  const render = spawn(remotionBin, argumen, {
    stdio: 'inherit',
    cwd: folderVideo,
    shell: true,
  });

  render.on('exit', (kodeRender) => {
    const durasi = ((Date.now() - mulai) / 1000).toFixed(1);
    if (kodeRender === 0) {
      console.log(`\n✓ Render video selesai dengan sukses dalam ${durasi} detik.`);
      console.log(`  Berkas video: ${join(folderVideo, targetFile)}\n`);
    } else {
      console.error(`\n✗ Render video gagal dengan kode keluar ${kodeRender} (${durasi} detik).`);
    }
    process.exit(kodeRender ?? 0);
  });
});
