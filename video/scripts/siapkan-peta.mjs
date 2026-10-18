#!/usr/bin/env node
/**
 * Salin titik tengah 576 kecamatan Jawa Tengah (shared/wilayah, ODbL, © kontributor
 * OpenStreetMap) ke src/data/titik-jateng.json dalam bentuk ringkas untuk shot peta [AG-45].
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sumber = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'shared', 'wilayah', 'titik-kecamatan-jateng.json'), 'utf-8'),
);
const titik = Object.values(sumber.kecamatan)
  .filter((k) => k.ditemukan)
  .map((k) => [+k.bujur.toFixed(3), +k.lintang.toFixed(3), k.kabupaten_id === '33.10' ? 1 : 0]);
writeFileSync(
  join(__dirname, '..', 'src', 'data', 'titik-jateng.json'),
  JSON.stringify({ atribusi: sumber.atribusi, titik }) + '\n',
);
console.log(`${titik.length} titik kecamatan ditulis.`);
