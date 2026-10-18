#!/usr/bin/env node
/**
 * Cocokkan 35 kalimat naskah dengan transkrip whisper [AG-45].
 * Masukan : scripts/naskah.mjs, .whisper/transkrip.json
 * Keluaran: src/data/waktu-kalimat.json (waktu mulai/selesai kalimat dan kata,
 *           detik dari awal rekaman), lalu cetak perbedaan ucapan vs naskah.
 *
 * Penjajaran memakai pemrograman dinamis (seperti edit distance) per kata;
 * kemiripan kata dinilai longgar supaya salah eja whisper ("budhidaya") tetap cocok.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { naskah } from './naskah.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(__dirname, '..');
const transkrip = JSON.parse(readFileSync(join(VIDEO, '.whisper', 'transkrip.json'), 'utf-8'));

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// 1. Token whisper → kata dengan waktu mulai dan selesai.
const kataUcap = [];
for (const item of transkrip.transcription) {
  for (const tok of item.tokens) {
    if (tok.text.startsWith('[')) continue;
    const baru = tok.text.startsWith(' ') || kataUcap.length === 0;
    if (baru) kataUcap.push({ teks: tok.text.trim(), mulai: tok.offsets.from / 1000, selesai: tok.offsets.to / 1000 });
    else {
      const k = kataUcap[kataUcap.length - 1];
      k.teks += tok.text;
      k.selesai = tok.offsets.to / 1000;
    }
  }
}
const ucap = kataUcap.filter((k) => norm(k.teks));

// 2. Kata naskah (teks subtitel) dengan penanda kalimat.
const kataNaskah = [];
const kalimatList = [];
for (const a of naskah) {
  a.kalimat.forEach((k, i) => {
    const id = `${a.id}.${i + 1}`;
    const kata = k.teks.split(/\s+/).filter((w) => norm(w));
    kalimatList.push({ id, adegan: a.id, teks: k.subtitel ?? k.teks, awal: kataNaskah.length, jumlah: kata.length });
    for (const w of kata) kataNaskah.push({ teks: w, kalimat: id });
  });
}

// 3. Penjajaran.
function mirip(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (x === y) return 1;
  if (!x || !y) return 0;
  // jarak Levenshtein ternormalisasi
  const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 1; j <= y.length; j++) d[0][j] = j;
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
  return 1 - d[x.length][y.length] / Math.max(x.length, y.length);
}
const N = kataNaskah.length;
const M = ucap.length;
const LEWAT = 0.6;
const biaya = Array.from({ length: N + 1 }, () => new Float64Array(M + 1));
const asal = Array.from({ length: N + 1 }, () => new Int8Array(M + 1));
for (let i = 1; i <= N; i++) { biaya[i][0] = i * LEWAT; asal[i][0] = 1; }
for (let j = 1; j <= M; j++) { biaya[0][j] = j * LEWAT; asal[0][j] = 2; }
for (let i = 1; i <= N; i++) {
  for (let j = 1; j <= M; j++) {
    const cocok = biaya[i - 1][j - 1] + (1 - mirip(kataNaskah[i - 1].teks, ucap[j - 1].teks)) * 1.2;
    const hapus = biaya[i - 1][j] + LEWAT;
    const sisip = biaya[i][j - 1] + LEWAT;
    const min = Math.min(cocok, hapus, sisip);
    biaya[i][j] = min;
    asal[i][j] = min === cocok ? 0 : min === hapus ? 1 : 2;
  }
}
const pasangan = new Array(N).fill(-1);
const ucapKe = new Array(M).fill(-1);
for (let i = N, j = M; i > 0 || j > 0; ) {
  const a = asal[i][j];
  if (i > 0 && j > 0 && a === 0) { pasangan[i - 1] = j - 1; ucapKe[j - 1] = i - 1; i--; j--; }
  else if (i > 0 && (j === 0 || a === 1)) i--;
  else j--;
}

// 4. Waktu per kalimat dan per kata.
const hasil = [];
const beda = [];
for (const k of kalimatList) {
  const idx = Array.from({ length: k.jumlah }, (_, n) => k.awal + n);
  const cocok = idx.map((i) => pasangan[i]).filter((j) => j >= 0);
  if (!cocok.length) throw new Error(`Kalimat ${k.id} tidak ditemukan di rekaman`);
  const jAwal = Math.min(...cocok);
  const jAkhir = Math.max(...cocok);
  const kata = idx.map((i) => {
    const j = pasangan[i];
    return { teks: kataNaskah[i].teks, mulai: j >= 0 ? ucap[j].mulai : null };
  });
  // kata yang tidak terjajar mengambil waktu kata sebelumnya
  for (let n = 0; n < kata.length; n++) if (kata[n].mulai === null) kata[n].mulai = n ? kata[n - 1].mulai : ucap[jAwal].mulai;
  hasil.push({
    id: k.id,
    adegan: k.adegan,
    teks: k.teks,
    mulai: +ucap[jAwal].mulai.toFixed(2),
    selesai: +ucap[jAkhir].selesai.toFixed(2),
    kata: kata.map((w) => ({ teks: w.teks, mulai: +w.mulai.toFixed(2) })),
  });
  const ucapan = ucap.slice(jAwal, jAkhir + 1).map((w) => w.teks).join(' ');
  if (norm(ucapan) !== norm(k.teks)) beda.push({ id: k.id, naskah: k.teks, ucapan });
}

const durasi = transkrip.transcription.at(-1).offsets.to / 1000;
const ffprobe = join(VIDEO, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffprobe.exe');
const durasiRekaman = Number(
  spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', join(VIDEO, 'public', 'audio', 'narasi', 'rekaman.wav')], { encoding: 'utf-8' }).stdout.trim(),
);
writeFileSync(
  join(VIDEO, 'src', 'data', 'waktu-kalimat.json'),
  JSON.stringify({ sumber: 'record-voiceover.mpeg', durasiRekamanDetik: +durasiRekaman.toFixed(2), kalimat: hasil }, null, 1) + '\n',
);
for (const k of hasil) console.log(`${k.id}  ${k.mulai.toFixed(2).padStart(6)}–${k.selesai.toFixed(2).padStart(6)}  ${k.teks}`);
console.log(`\nAkhir ucapan terakhir: ${durasi.toFixed(2)} dtk`);
console.log(`\nPerbedaan transkrip whisper dengan naskah (${beda.length}):`);
for (const b of beda) console.log(`- ${b.id}\n    naskah: ${b.naskah}\n    whisper: ${b.ucapan}`);

// naskah-narasi.md: transkrip dengan waktu mulai tiap kalimat di rekaman.
const mmss = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const baris = [
  '# Naskah narasi teaser Tani Muda',
  '',
  'Transkrip rekaman suara pemilik produk (`record-voiceover.mpeg`). Satu kalimat = satu shot.',
  'Waktu adalah detik mulai diucapkan di rekaman; video mulai bersamaan dengan rekaman.',
  'Dibuat ulang oleh `npm run selaraskan`; teks naskah ada di `scripts/naskah.mjs`.',
  '',
];
let adeganKini = '';
for (const k of hasil) {
  if (k.adegan !== adeganKini) {
    adeganKini = k.adegan;
    const a = naskah.find((x) => x.id === k.adegan);
    baris.push(`## ${a.id}. ${a.judul}`, '');
  }
  baris.push(`- **${k.id}** (${mmss(k.mulai)}) ${k.teks}`);
  const pisah = hasil.findIndex((x) => x.id === k.id);
  if (!hasil[pisah + 1] || hasil[pisah + 1].adegan !== k.adegan) baris.push('');
}
baris.push(`Durasi rekaman ${durasiRekaman.toFixed(2)} detik.`);
if (beda.length) {
  baris.push('', '## Perbedaan transkrip whisper dengan naskah', '');
  for (const b of beda) baris.push(`- ${b.id}: naskah "${b.naskah}", whisper "${b.ucapan}"`);
}
writeFileSync(join(VIDEO, 'naskah-narasi.md'), baris.join('\n') + '\n');
