#!/usr/bin/env node
/**
 * Lembar kontak [AG-45]: satu bingkai diam dari tengah setiap shot, lalu digabung
 * menjadi keluaran/lembar-kontak.png (5 kolom × 7 baris).
 *
 * Pemakaian: node scripts/lembar-kontak.mjs [--id 01.1,02.3] [--frame-rel 0.5]
 * Dengan --id hanya shot itu yang dirender (lembar tidak digabung).
 *
 * Bundel dibuat sekali (lebih cepat daripada `npx remotion still` per shot).
 * Penggabungan memakai ffmpeg lengkap dari .venv-tts, karena ffmpeg bawaan Remotion
 * tidak punya filter xstack.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderStill } from '@remotion/renderer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(__dirname, '..');
const FOLDER = join(VIDEO, 'keluaran', 'kontak');
mkdirSync(FOLDER, { recursive: true });

const argumen = process.argv.slice(2);
const nilai = (n, b) => {
  const i = argumen.indexOf(n);
  return i >= 0 ? argumen[i + 1] : b;
};
const pilihId = nilai('--id', null)?.split(',');
const rel = Number(nilai('--frame-rel', '0.5'));

const serveUrl = await bundle({ entryPoint: join(VIDEO, 'src', 'index.ts'), publicDir: join(VIDEO, 'public') });
const semua = (await getCompositions(serveUrl)).filter((c) => c.id.startsWith('Shot-'));
const dipilih = pilihId ? semua.filter((c) => pilihId.includes(c.id.replace('Shot-', '').replace('-', '.'))) : semua;

for (const c of dipilih) {
  const frame = Math.min(c.durationInFrames - 1, Math.floor(c.durationInFrames * rel));
  const keluaran = join(FOLDER, `${c.id.replace('Shot-', '')}.png`);
  await renderStill({ composition: c, serveUrl, output: keluaran, frame, inputProps: c.defaultProps, imageFormat: 'png' });
  console.log(`${c.id} frame ${frame} → ${keluaran}`);
}

if (!pilihId) {
  const python = join(VIDEO, '.venv-tts', 'Scripts', 'python.exe');
  if (!existsSync(python)) {
    console.error('Lembar tidak digabung: ffmpeg lengkap belum ada (npm run siapkan-alat).');
    process.exit(1);
  }
  const ffmpeg = spawnSync(python, ['-c', 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())'], { encoding: 'utf-8' }).stdout.trim();
  const kolom = 5;
  const w = 384;
  const h = 216;
  const masukan = dipilih.flatMap((c) => ['-i', join(FOLDER, `${c.id.replace('Shot-', '')}.png`)]);
  const skala = dipilih.map((c, i) => `[${i}]scale=${w}:${h},drawtext=text='${c.id.replace('Shot-', '').replace('-', '.')}':x=10:y=8:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=6[v${i}]`).join(';');
  const tata = dipilih.map((_, i) => `${(i % kolom) * w}_${Math.floor(i / kolom) * h}`).join('|');
  const susun = dipilih.map((_, i) => `[v${i}]`).join('');
  const hasil = spawnSync(
    ffmpeg,
    ['-y', '-v', 'error', ...masukan, '-filter_complex', `${skala};${susun}xstack=inputs=${dipilih.length}:layout=${tata}:fill=white`, join(VIDEO, 'keluaran', 'lembar-kontak.png')],
    { encoding: 'utf-8' },
  );
  if (hasil.status !== 0) {
    console.error(hasil.stderr);
    process.exit(1);
  }
  console.log('Lembar kontak: keluaran/lembar-kontak.png');
}
