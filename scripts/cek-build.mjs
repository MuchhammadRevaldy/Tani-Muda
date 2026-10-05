#!/usr/bin/env node
/**
 * Periksa hasil build produksi di dist/ (D-36): pemilih akun demo dan panel kode uji hanya ada di
 * mode pengembangan dan tidak boleh ikut dibundel. Dipanggil oleh `npm run build`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = fileURLToPath(new URL('..', import.meta.url));
const dist = join(akar, 'dist');

/** Teks yang hanya ada di src/teks/pengembangan.ts dan modul khusus pengembangan. */
const PENANDA = ['Pilih akun demo', 'Atur ulang data demo', 'Buka pemilih akun demo', 'Kode uji:'];

function telusuri(dir) {
  return readdirSync(dir).flatMap((nama) => {
    const jalur = join(dir, nama);
    return statSync(jalur).isDirectory() ? telusuri(jalur) : [jalur];
  });
}

const temuan = [];
for (const berkas of telusuri(dist).filter((b) => /\.(js|html|css)$/.test(b))) {
  const isi = readFileSync(berkas, 'utf8');
  for (const p of PENANDA) {
    if (isi.includes(p)) temuan.push(`${relative(akar, berkas).split(sep).join('/')}: "${p}"`);
  }
}

if (temuan.length) {
  console.error('Build produksi memuat bagian khusus mode pengembangan (D-36):');
  for (const t of temuan) console.error('  ' + t);
  process.exit(1);
}
console.log('Build produksi bersih: pemilih akun demo dan kode uji tidak ikut.');
