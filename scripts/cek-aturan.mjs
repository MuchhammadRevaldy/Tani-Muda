#!/usr/bin/env node
/**
 * Jalankan pemeriksa aturan proyek pada src/. Gagal (kode keluar 1) bila ada pelanggaran.
 * Dipanggil oleh `npm run lint`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { periksaBerkas } from './aturan.mjs';

const akar = fileURLToPath(new URL('..', import.meta.url));
const daftar = JSON.parse(readFileSync(new URL('./kata-terlarang.json', import.meta.url), 'utf8'));

function telusuri(dir) {
  const hasil = [];
  for (const nama of readdirSync(dir)) {
    const jalur = join(dir, nama);
    if (statSync(jalur).isDirectory()) hasil.push(...telusuri(jalur));
    else if (/\.(ts|tsx|css)$/.test(nama) && !/\.test\.tsx?$/.test(nama)) hasil.push(jalur);
  }
  return hasil;
}

const pelanggaran = [];
for (const berkas of telusuri(join(akar, 'src'))) {
  const jalur = relative(akar, berkas).split(sep).join('/');
  pelanggaran.push(...periksaBerkas(jalur, readFileSync(berkas, 'utf8'), daftar));
}

if (pelanggaran.length) {
  for (const p of pelanggaran) console.error(`${p.jalur}:${p.baris}  [${p.kode}] ${p.pesan}`);
  console.error(`\n${pelanggaran.length} pelanggaran aturan proyek. Lihat docs/aturan-proyek.md.`);
  process.exit(1);
}
console.log('Aturan proyek: tidak ada pelanggaran.');
