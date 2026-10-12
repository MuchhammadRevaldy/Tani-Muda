#!/usr/bin/env node
/**
 * Pasang video modul asli (D-44): taruh berkas MP4 360p di public/video/modul/ dengan nama sama
 * dengan id modulnya (mis. modul-sawi-bedengan-4.mp4), lalu jalankan:
 *   npm run pasang-video
 * Skrip memeriksa nama (harus id modul yang ada), format (.mp4), dan ukuran (paling besar
 * konfigurasi batas_video_mb), lalu menulis shared/data-contoh/video-modul.json berisi berkas dan
 * ukurannya. Klien tiruan memakai daftar ini menggantikan video contoh; backend Tahap 5 membaca
 * berkas yang sama untuk seeder. Berkas yang ditolak tidak dimasukkan dan skrip keluar dengan kode 1.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = fileURLToPath(new URL('..', import.meta.url));
const folder = join(akar, 'public', 'video', 'modul');
const data = join(akar, '..', 'shared', 'data-contoh');
const keluar = join(data, 'video-modul.json');
const modul = JSON.parse(readFileSync(join(data, 'modul.json'), 'utf8'));
const { batas_video_mb: batasMb } = JSON.parse(
  readFileSync(join(data, 'konfigurasi.json'), 'utf8'),
);
const idModul = new Set(modul.map((m) => m.id));

if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
const hasil = {};
const masalah = [];
for (const nama of readdirSync(folder).sort()) {
  if (nama.startsWith('.') || nama === 'BACA.md') continue;
  const ext = extname(nama).toLowerCase();
  const id = nama.slice(0, -ext.length);
  if (ext !== '.mp4') {
    masalah.push(`${nama}: bukan .mp4. Ekspor ulang sebagai MP4 (H.264) 360p.`);
    continue;
  }
  if (!idModul.has(id)) {
    masalah.push(`${nama}: tidak ada modul "${id}". Nama berkas harus sama dengan id modul.`);
    continue;
  }
  const mb = Math.round((statSync(join(folder, nama)).size / 1024 / 1024) * 10) / 10;
  if (mb > batasMb) {
    masalah.push(`${nama}: ${mb} MB, melebihi batas ${batasMb} MB. Kecilkan ke 360p.`);
    continue;
  }
  hasil[id] = { berkas: nama, ukuran_mb: Math.max(0.1, mb) };
}

writeFileSync(keluar, JSON.stringify(hasil, null, 2) + '\n');
const n = Object.keys(hasil).length;
console.log(`${n} video modul terpasang di shared/data-contoh/video-modul.json.`);
for (const [id, v] of Object.entries(hasil))
  console.log(`  ${id}: ${v.berkas} (${v.ukuran_mb} MB)`);
if (masalah.length) {
  console.error('\nBerkas yang belum bisa dipasang:');
  for (const m of masalah) console.error('  - ' + m);
  process.exit(1);
}
