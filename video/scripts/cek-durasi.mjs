#!/usr/bin/env node
/**
 * Pemeriksaan sebelum render [AG-45]. Gagal bila:
 *  - rekaman suara public/audio/narasi/rekaman.wav tidak ada;
 *  - durasi rekaman di src/data/waktu-kalimat.json tidak cocok dengan berkasnya;
 *  - total video (rekaman + ekor penutup) lebih dari 3:00, atau ekor lebih dari 3 detik;
 *  - jumlah kalimat bukan 35, atau ada kalimat tanpa komponen shot.
 * Rumus total sama dengan src/v2/linimasa.ts.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(__dirname, '..');
const BATAS_DETIK = 180;
const kesalahan = [];

const data = JSON.parse(readFileSync(join(VIDEO, 'src', 'data', 'waktu-kalimat.json'), 'utf-8'));
const linimasa = readFileSync(join(VIDEO, 'src', 'v2', 'linimasa.ts'), 'utf-8');
const ekor = Number(linimasa.match(/EKOR_DETIK = ([\d.]+)/)[1]);
const daftarShot = readFileSync(join(VIDEO, 'src', 'v2', 'shot', 'index.ts'), 'utf-8');

const wav = join(VIDEO, 'public', 'audio', 'narasi', 'rekaman.wav');
if (!existsSync(wav)) kesalahan.push('public/audio/narasi/rekaman.wav tidak ada. Jalankan: npm run suara');
else {
  const ffprobe = join(VIDEO, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffprobe.exe');
  const terukur = Number(spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], { encoding: 'utf-8' }).stdout.trim());
  if (Math.abs(terukur - data.durasiRekamanDetik) > 0.1)
    kesalahan.push(`Durasi rekaman ${terukur.toFixed(2)} dtk berbeda dengan waktu-kalimat.json (${data.durasiRekamanDetik}). Jalankan: npm run selaraskan`);
}
if (ekor > 3) kesalahan.push(`Ekor penutup ${ekor} dtk, maksimal 3 dtk`);
if (data.kalimat.length !== 35) kesalahan.push(`Ada ${data.kalimat.length} kalimat, seharusnya 35`);
for (const k of data.kalimat) if (!daftarShot.includes(`'${k.id}':`)) kesalahan.push(`Kalimat ${k.id} belum punya shot`);

const total = data.durasiRekamanDetik + ekor;
const mmss = `${Math.floor(total / 60)}:${(total % 60).toFixed(1).padStart(4, '0')}`;
console.log(`Rekaman ${data.durasiRekamanDetik} dtk + ekor ${ekor} dtk = ${total.toFixed(2)} dtk (${mmss}), batas 3:00`);
console.log(`${data.kalimat.length} kalimat, ${data.kalimat.length} shot`);
if (total > BATAS_DETIK) kesalahan.push(`Durasi ${mmss} melebihi 3:00`);

if (kesalahan.length) {
  console.error('\nGAGAL:\n- ' + kesalahan.join('\n- '));
  process.exit(1);
}
console.log('LOLOS');
