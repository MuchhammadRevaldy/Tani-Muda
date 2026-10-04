#!/usr/bin/env node
/**
 * Bongkar file desain (design/desain-tani-muda.html) menjadi bahan kerja di design/extracted/.
 * Folder hasil tidak masuk git; jalankan ulang kapan saja dengan `npm run ekstrak-desain`.
 *
 * Hasil:
 *   design/extracted/pages/<nomor>-<nama>-<versi>.html         isi templat papan (untuk dibaca)
 *   design/extracted/pages/<nomor>-<nama>-<versi>.assets.json  peta id aset → file di assets/
 *   design/extracted/pages/indeks.json                         daftar papan
 *   design/extracted/tampil/<nomor>-<nama>-<versi>.html        papan mandiri, bisa dibuka di browser
 *   design/extracted/assets/                                   font dan skrip (pustaka komponen
 *                                                              disimpan sebagai pustaka-komponen-tani-muda.js)
 *   design/extracted/ikon-sebaris/                             ikon yang tertanam di halaman desain
 *
 * File desain asli hanya dibaca, tidak pernah diubah.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { PAPAN_DESAIN, namaFilePapan } from './papan-desain.mjs';

const akar = join(dirname(fileURLToPath(import.meta.url)), '..');
const sumber = join(akar, 'design', 'desain-tani-muda.html');
const keluar = join(akar, 'design', 'extracted');

const EKSTENSI = {
  'text/html': 'html',
  'text/css': 'css',
  'image/svg+xml': 'svg',
  'text/javascript': 'js',
  'application/javascript': 'js',
  'font/woff2': 'woff2',
  'font/woff': 'woff',
  'font/ttf': 'ttf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'application/json': 'json',
};

/** Ambil isi `<script type="__bundler/<jenis>">` terakhir dari sebuah bundle. */
function ambilBagian(html, jenis) {
  const tanda = `<script type="__bundler/${jenis}">`;
  const awal = html.lastIndexOf(tanda);
  if (awal < 0) return null;
  return html.slice(awal + tanda.length, html.indexOf('</script>', awal));
}

function bacaTemplat(html) {
  const mentah = ambilBagian(html, 'template');
  try {
    return JSON.parse(mentah);
  } catch {
    return mentah;
  }
}

function bukaAset(entri) {
  const isi = Buffer.from(entri.data, 'base64');
  return entri.compressed ? gunzipSync(isi) : isi;
}

function namaAset(isi, mime) {
  if (isi.subarray(0, 20).toString().startsWith('/* @ds-bundle'))
    return 'pustaka-komponen-tani-muda.js';
  const hash = createHash('md5').update(isi).digest('hex').slice(0, 10);
  return `${hash}.${EKSTENSI[mime] ?? 'bin'}`;
}

const bundle = readFileSync(sumber, 'utf8');
const manifes = JSON.parse(ambilBagian(bundle, 'manifest'));
const kanvas = bacaTemplat(bundle);

// Urutan papan diambil dari kanvas: <h2>judul</h2><iframe src="about:blank#uuid">
const pola = /<h2[^>]*>([^<]*)<\/h2><iframe src="about:blank#([0-9a-f-]+)"/g;
const daftar = [...kanvas.matchAll(pola)].map((m) => ({ judul: m[1], uuid: m[2] }));
if (daftar.length !== PAPAN_DESAIN.length)
  throw new Error(`Jumlah papan ${daftar.length}, peta berisi ${PAPAN_DESAIN.length}.`);
daftar.forEach((p, i) => {
  if (p.judul !== PAPAN_DESAIN[i].judul)
    throw new Error(
      `Papan ke-${i}: "${p.judul}" tidak cocok dengan peta "${PAPAN_DESAIN[i].judul}".`,
    );
});

rmSync(keluar, { recursive: true, force: true });
for (const sub of ['pages', 'tampil', 'assets', 'ikon-sebaris'])
  mkdirSync(join(keluar, sub), { recursive: true });

const sudahDitulis = new Set();
const indeks = [];
daftar.forEach((p, i) => {
  const papan = PAPAN_DESAIN[i];
  const nama = namaFilePapan(papan);
  const htmlPapan = bukaAset(manifes[p.uuid]).toString('utf8');
  writeFileSync(join(keluar, 'tampil', `${nama}.html`), htmlPapan);
  writeFileSync(join(keluar, 'pages', `${nama}.html`), bacaTemplat(htmlPapan));

  const peta = {};
  for (const [id, entri] of Object.entries(
    JSON.parse(ambilBagian(htmlPapan, 'manifest') ?? '{}'),
  )) {
    const isi = bukaAset(entri);
    const file = namaAset(isi, entri.mime);
    if (!sudahDitulis.has(file)) {
      writeFileSync(join(keluar, 'assets', file), isi);
      sudahDitulis.add(file);
    }
    peta[id] = file;
  }
  writeFileSync(join(keluar, 'pages', `${nama}.assets.json`), JSON.stringify(peta, null, 1));
  indeks.push({ file: `${nama}.html`, ...papan });
});
writeFileSync(join(keluar, 'pages', 'indeks.json'), JSON.stringify(indeks, null, 1));

// Ikon yang tertanam di halaman (tipe tugas, metode tanam, komoditas).
function ambilIkon(filePapan, penanda, nama) {
  const html = readFileSync(join(keluar, 'pages', filePapan), 'utf8');
  const i = html.indexOf(`<sc-if value="{{${penanda}}}"`);
  if (i < 0) throw new Error(`Ikon ${nama} tidak ditemukan di ${filePapan}.`);
  const awal = html.indexOf('<svg', i);
  const akhir = html.indexOf('</svg>', awal) + 6;
  const svg = html
    .slice(awal, akhir)
    .replace(/sc-camel-view-box/g, 'viewBox')
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  writeFileSync(join(keluar, 'ikon-sebaris', `${nama}.svg`), svg);
}
const jadwal = '20-jadwal-sawi-bedengan-mobile.html';
ambilIkon(jadwal, 't.tSekali', 'tipe-sekali-kalender');
ambilIkon(jadwal, 't.tBerulang', 'tipe-berulang-ulang');
ambilIkon(jadwal, 't.tUkur', 'tipe-ukur-pengukur');
for (const k of ['bedengan', 'polybag', 'hidroponik', 'sawah'])
  ambilIkon('13-hitung-cara-tanam-sawi-bedengan-mobile.html', `k.ik.${k}`, `metode-${k}`);
for (const k of [
  'daun',
  'bayam',
  'kangkung',
  'cabai',
  'tomat',
  'mentimun',
  'terong',
  'padi',
  'jagung',
  'kedelai',
])
  ambilIkon('10-hitung-pilih-tanaman-mobile.html', `it.ik.${k}`, `komoditas-${k}`);

console.log(`${indeks.length} papan dan ${sudahDitulis.size} aset ditulis ke design/extracted/.`);
