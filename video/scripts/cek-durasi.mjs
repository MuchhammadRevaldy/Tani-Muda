#!/usr/bin/env node
/**
 * Pemeriksaan otomatis sebelum render [AG-44]. Gagal bila:
 *  - total durasi video lebih dari 3:00;
 *  - berkas narasi tidak ada, atau isinya nada/hening (tidak ada jeda bicara);
 *  - kecepatan bicara suatu adegan di atas 160 kata per menit.
 * Rumus durasi sama dengan src/linimasa.ts.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(__dirname, '..');
const BIN = join(VIDEO, 'node_modules', '@remotion', 'compositor-win32-x64-msvc');
const BATAS_DETIK = 180;
const TARGET_MIN_DETIK = 160;
const MAKS_KPM = 160;

const data = JSON.parse(readFileSync(join(VIDEO, 'src', 'data', 'narasi.json'), 'utf-8'));
const kesalahan = [];

function ukur(berkas) {
  const r = spawnSync(join(BIN, 'ffprobe.exe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', berkas], { encoding: 'utf-8' });
  return Number(r.stdout.trim());
}

/** Jumlah jeda hening (>= 0,15 dtk di bawah -35 dB) dan total heningnya. */
function jedaHening(berkas) {
  const r = spawnSync(join(BIN, 'ffmpeg.exe'), ['-hide_banner', '-i', berkas, '-af', 'silencedetect=noise=-35dB:d=0.15', '-f', 'null', '-'], { encoding: 'utf-8' });
  const durasi = [...r.stderr.matchAll(/silence_duration: ([\d.]+)/g)].map((m) => Number(m[1]));
  return { jumlah: durasi.length, total: durasi.reduce((a, b) => a + b, 0) };
}

console.log('Adegan  Narasi   Adegan   Kata/mnt  Jeda  Sumber');
let totalFrame = 0;
for (const a of data.adegan) {
  const berkas = join(VIDEO, 'public', 'audio', 'narasi', `${a.id}.mp3`);
  let narasi = a.durasiDetik;
  let catatan = '';
  if (!existsSync(berkas)) {
    kesalahan.push(`Narasi ${a.id}.mp3 tidak ada. Jalankan: npm run narasi`);
  } else {
    narasi = Math.max(narasi, ukur(berkas));
    const hening = jedaHening(berkas);
    const kpm = Math.round((a.kata / narasi) * 60);
    if (a.kalimat.length > 1 && hening.jumlah === 0) {
      kesalahan.push(`Narasi ${a.id} tidak punya jeda bicara sama sekali (nada atau suara rusak?)`);
    }
    if (hening.total > narasi * 0.6) kesalahan.push(`Narasi ${a.id} sebagian besar hening`);
    if (kpm > MAKS_KPM) kesalahan.push(`Narasi ${a.id} terlalu cepat: ${kpm} kata/menit (maks ${MAKS_KPM})`);
    catatan = `${String(kpm).padStart(8)}  ${String(hening.jumlah).padStart(4)}  ${a.sumber}`;
  }
  const detik = Math.max(a.minimumDetik, data.awalNarasiDetik + narasi + data.ekorDetik);
  totalFrame += Math.ceil(detik * data.fps);
  console.log(`${a.id}      ${narasi.toFixed(1).padStart(5)}s  ${detik.toFixed(1).padStart(6)}s ${catatan}`);
}

const total = totalFrame / data.fps;
const mmss = `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, '0')}`;
console.log(`\nTotal ${total.toFixed(1)} detik (${mmss}), batas ${BATAS_DETIK} detik (3:00)`);
if (total > BATAS_DETIK) kesalahan.push(`Durasi ${mmss} melebihi 3:00`);
if (total < TARGET_MIN_DETIK) console.warn(`Peringatan: durasi di bawah target 2:40`);

if (kesalahan.length) {
  console.error('\nGAGAL:\n- ' + kesalahan.join('\n- '));
  process.exit(1);
}
console.log('LOLOS');
