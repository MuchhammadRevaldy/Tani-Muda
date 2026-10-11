#!/usr/bin/env node
/**
 * Ukur JavaScript yang dimuat di halaman pertama (P-22, D-45, D-48), dari manifest Vite di
 * `<dist>/.vite/manifest.json`. Per rute dihitung: entry + semua impor statisnya, ditambah chunk
 * halaman rute itu (setelah pemecahan per halaman) beserta impor statisnya. Ukuran setelah gzip
 * (level 9, mendekati server sungguhan).
 *   node scripts/ukur-bundel.mjs [dist] [--batas 200]
 * Dua angka per rute: tanpa klien tiruan (produksi dengan backend, Tahap 6) dan dengan klien
 * tiruan (mode tiruan dan build demo, yang memuat data contoh saat aplikasi dibuka).
 * Dengan --batas, keluar kode 1 bila angka tanpa klien tiruan melewati batas (kB).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const akar = fileURLToPath(new URL('..', import.meta.url));
const argumen = process.argv.slice(2);
const iBatas = argumen.indexOf('--batas');
const batas = iBatas >= 0 ? Number(argumen[iBatas + 1]) : null;
const dist = join(akar, argumen.find((a, i) => !a.startsWith('--') && i !== iBatas + 1) ?? 'dist');
const jalurManifest = join(dist, '.vite', 'manifest.json');
if (!existsSync(jalurManifest)) {
  console.error(`Manifest tidak ada: ${jalurManifest}. Jalankan build dulu.`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(jalurManifest, 'utf8'));
const kb = (b) => Math.round((b / 1024) * 10) / 10;

/** Kumpulkan berkas JS dari satu entri manifest dan impor statisnya. */
function kumpulkan(kunci, set = new Set()) {
  const e = manifest[kunci];
  if (!e || set.has(e.file)) return set;
  if (e.file.endsWith('.js')) set.add(e.file);
  for (const i of e.imports ?? []) kumpulkan(i, set);
  return set;
}
const ukuran = (set) =>
  [...set].reduce(
    (n, f) => {
      const isi = readFileSync(join(dist, f));
      return { mentah: n.mentah + isi.length, gzip: n.gzip + gzipSync(isi, { level: 9 }).length };
    },
    { mentah: 0, gzip: 0 },
  );
const cari = (akhiran) => Object.keys(manifest).find((k) => k.endsWith(akhiran));

const entry = Object.keys(manifest).find((k) => manifest[k].isEntry);
const tiruan = cari('src/api/tiruan/klien-tiruan.ts');
const RUTE = [
  { jalur: '/', halaman: cari('src/halaman/landing.tsx') },
  { jalur: '/beranda', halaman: cari('src/halaman/beranda.tsx') },
];

let lewat = false;
for (const r of RUTE) {
  const dasar = kumpulkan(entry);
  if (r.halaman && r.halaman !== entry) kumpulkan(r.halaman, dasar);
  const tanpa = ukuran(dasar);
  const dengan = ukuran(tiruan ? kumpulkan(tiruan, new Set(dasar)) : dasar);
  console.log(
    `${r.jalur.padEnd(9)} tanpa klien tiruan: ${kb(tanpa.gzip)} kB gzip (${kb(tanpa.mentah)} kB mentah, ${dasar.size} berkas)` +
      ` · dengan klien tiruan: ${kb(dengan.gzip)} kB gzip (${kb(dengan.mentah)} kB mentah)`,
  );
  if (batas !== null && kb(tanpa.gzip) > batas) lewat = true;
}
if (lewat) {
  console.error(`JavaScript halaman pertama melewati batas ${batas} kB gzip (D-45).`);
  process.exit(1);
}
