#!/usr/bin/env node
/**
 * Pemeriksaan otomatis durasi video teaser Tani Muda.
 * Memastikan durasi video строго < 3 menit (180 detik / 5.400 frame pada 30 fps).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const berkasKonfig = join(__dirname, '..', 'src', 'konfigurasi.ts');

if (!existsSync(berkasKonfig)) {
  console.error(`Berkas konfigurasi ${berkasKonfig} tidak ditemukan.`);
  process.exit(1);
}

const isi = readFileSync(berkasKonfig, 'utf-8');
const matchFps = isi.match(/FPS\s*=\s*(\d+)/);
const matchDurasi = isi.match(/DURASI_FRAME_TOTAL\s*=\s*(\d+)/);

if (!matchFps || !matchDurasi) {
  console.error('Gagal membaca FPS atau DURASI_FRAME_TOTAL dari konfigurasi.ts');
  process.exit(1);
}

const fps = Number(matchFps[1]);
const frameTotal = Number(matchDurasi[1]);
const detikTotal = frameTotal / fps;
const menit = Math.floor(detikTotal / 60);
const sisaDetik = Math.floor(detikTotal % 60);
const formatWaktu = `${String(menit).padStart(2, '0')}:${String(sisaDetik).padStart(2, '0')}`;

console.log('====================================================');
console.log('  PEMERIKSAAN DURASI VIDEO TEASER TANI MUDA');
console.log('====================================================');
console.log(`  FPS                : ${fps}`);
console.log(`  Total Frame        : ${frameTotal}`);
console.log(`  Durasi Total       : ${detikTotal.toFixed(1)} detik (${formatWaktu})`);
console.log(`  Batas Maksimal     : 180.0 detik (03:00)`);
console.log('----------------------------------------------------');

if (detikTotal > 180) {
  console.error(`  ✗ GAGAL: Durasi (${detikTotal.toFixed(1)}s) melampaui batas maksimal 3 menit (180s)!`);
  process.exit(1);
}

console.log(`  ✓ LOLOS: Durasi ${formatWaktu} memenuhi syarat strictly < 3:00 (180 detik).`);
console.log('====================================================\n');
process.exit(0);
