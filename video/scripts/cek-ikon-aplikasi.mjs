#!/usr/bin/env node
/**
 * Memastikan ikon yang dipakai ulang di video sama persis dengan ikon aplikasi
 * (frontend/src/komponen/ikon.tsx). Gagal bila ada yang berbeda atau hilang [AG-44].
 * Skrip ini hanya MEMBACA berkas frontend.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const berkasAplikasi = join(__dirname, '..', '..', 'frontend', 'src', 'komponen', 'ikon.tsx');
const berkasVideo = join(__dirname, '..', 'src', 'ikon', 'ikon-aplikasi-data.ts');

function ambilIkon(isi, penanda) {
  const awal = isi.indexOf(penanda);
  const blok = isi.slice(awal, isi.indexOf('} as const', awal));
  return Object.fromEntries([...blok.matchAll(/^\s*'?([a-z-]+)'?:\s*\n?\s*'([^']*)'/gm)].map((m) => [m[1], m[2]]));
}

const aplikasi = ambilIkon(readFileSync(berkasAplikasi, 'utf-8'), 'const IKON = {');
const video = ambilIkon(readFileSync(berkasVideo, 'utf-8'), 'export const IKON_APLIKASI = {');
const salah = [];
for (const [nama, svg] of Object.entries(video)) {
  if (!(nama in aplikasi)) salah.push(`${nama}: tidak ada lagi di aplikasi`);
  else if (aplikasi[nama] !== svg) salah.push(`${nama}: berbeda dari aplikasi, salin ulang`);
}

if (salah.length) {
  console.error('Ikon aplikasi tidak sinkron:\n- ' + salah.join('\n- '));
  process.exit(1);
}
console.log(`Ikon aplikasi sinkron (${Object.keys(video).length} ikon).`);
