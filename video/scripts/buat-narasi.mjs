#!/usr/bin/env node
/**
 * Pembuat narasi teaser [AG-44].
 *
 * Urutan sumber per adegan:
 *   1. Rekaman manusia di public/audio/narasi/NN.mp3 (berkas yang tidak dibuat
 *      skrip ini). Tidak pernah ditimpa, kecuali dengan --timpa.
 *   2. Edge TTS (suara bawaan id-ID-ArdiNeural, ganti dengan --suara=...).
 *
 * Supaya tidak terdengar seperti mesin: suara dibuat per kalimat, hening di
 * ujung kalimat dipotong, lalu disambung dengan jeda yang sedikit bervariasi.
 * Hasil akhir diberi high-pass, kompresi ringan, dan normalisasi -16 LUFS.
 *
 * Keluaran:
 *   public/audio/narasi/NN.mp3
 *   src/data/narasi.json  (sumber, durasi, waktu tiap kalimat untuk subtitel)
 *
 * Pemakaian: npm run narasi [-- --suara=id-ID-GadisNeural] [-- --timpa]
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AWAL_NARASI_DETIK, EKOR_DETIK, FPS, naskah } from './naskah.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(__dirname, '..');
const FOLDER_NARASI = join(VIDEO, 'public', 'audio', 'narasi');
const BERKAS_DATA = join(VIDEO, 'src', 'data', 'narasi.json');
const FOLDER_SEMENTARA = join(VIDEO, '.narasi-sementara');
const BIN = join(VIDEO, 'node_modules', '@remotion', 'compositor-win32-x64-msvc');
const PYTHON_TTS = join(VIDEO, '.venv-tts', 'Scripts', 'python.exe');
const FFPROBE = join(BIN, 'ffprobe.exe');
const EDGE_TTS = join(VIDEO, '.venv-tts', 'Scripts', 'edge-tts.exe');
// ffmpeg bawaan Remotion tidak punya filter silenceremove/highpass/acompressor,
// jadi olah suara memakai ffmpeg lengkap dari paket imageio-ffmpeg di .venv-tts.
let FFMPEG = '';

const argumen = process.argv.slice(2);
const SUARA = (argumen.find((a) => a.startsWith('--suara=')) ?? '--suara=id-ID-ArdiNeural').split('=')[1];
const TIMPA = argumen.includes('--timpa');
const LAJU_BAWAAN = '-6%';

function jalankan(bin, args, keterangan) {
  const hasil = spawnSync(bin, args, { encoding: 'utf-8' });
  if (hasil.status !== 0) {
    throw new Error(`${keterangan} gagal:\n${hasil.stderr || hasil.stdout}`);
  }
  return hasil.stdout;
}

export function durasiBerkas(berkas) {
  const keluaran = jalankan(
    FFPROBE,
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', berkas],
    `ffprobe ${berkas}`,
  );
  return Number(keluaran.trim());
}

function md5(berkas) {
  return createHash('md5').update(readFileSync(berkas)).digest('hex');
}

/** Angka acak yang sama setiap kali dijalankan, supaya hasil bisa diulang. */
function acak(benih) {
  let x = 0;
  for (const c of benih) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  x ^= x << 13; x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5; x >>>= 0;
  return (x % 1000) / 1000;
}

function hitungKata(teks) {
  return teks.split(/\s+/).filter(Boolean).length;
}

/** Bagi durasi berkas ke kalimat menurut panjang huruf (untuk rekaman manusia). */
function waktuProporsional(kalimat, durasi) {
  const total = kalimat.reduce((n, k) => n + k.teks.length, 0);
  let t = 0;
  return kalimat.map((k) => {
    const panjang = (k.teks.length / total) * durasi;
    const item = { teks: k.teks, mulai: +t.toFixed(3), selesai: +(t + panjang).toFixed(3) };
    t += panjang;
    return item;
  });
}

async function buatSuaraKalimat(teks, laju, keluaran) {
  for (let percobaan = 1; percobaan <= 3; percobaan++) {
    const hasil = spawnSync(
      EDGE_TTS,
      ['--voice', SUARA, `--rate=${laju}`, '--text', teks, '--write-media', keluaran],
      { encoding: 'utf-8' },
    );
    if (hasil.status === 0 && existsSync(keluaran)) {
      // Beri jarak antarpermintaan supaya tidak ditolak server (HTTP 429).
      await new Promise((r) => setTimeout(r, 400));
      return;
    }
    console.warn(`  percobaan ${percobaan} gagal: ${(hasil.stderr || '').trim().split('\n').pop()}`);
    await new Promise((r) => setTimeout(r, 1500 * percobaan));
  }
  throw new Error(`Edge TTS gagal untuk: "${teks}"`);
}

const TAMBAHAN_JEDA_MAKS = 1.0;

async function buatAdeganTts(adegan, berkasAkhir) {
  const folder = join(FOLDER_SEMENTARA, adegan.id);
  mkdirSync(folder, { recursive: true });

  // 1. Suara tiap kalimat, hening di ujungnya dipotong.
  const potongan = [];
  for (const [i, k] of adegan.kalimat.entries()) {
    const mentah = join(folder, `${i}-mentah.mp3`);
    const bersih = join(folder, `${i}.wav`);
    await buatSuaraKalimat(k.ucap ?? k.teks, k.laju ?? LAJU_BAWAAN, mentah);
    jalankan(FFMPEG, [
      '-y', '-i', mentah,
      '-af',
      'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,' +
        'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse',
      '-ar', '24000', '-ac', '1', '-c:a', 'pcm_s16le', bersih,
    ], 'potong hening');
    potongan.push({ berkas: bersih, panjang: durasiBerkas(bersih) });
  }

  // 2. Jeda dasar yang sedikit bervariasi, lalu sisa waktu adegan dibagi ke jeda.
  const jeda = adegan.kalimat.map((k, i) => (i === 0 ? 0 : k.jeda ?? 0.28 + acak(`${adegan.id}-${i}`) * 0.17));
  const jumlahJeda = adegan.kalimat.length - 1;
  const panjangDasar = potongan.reduce((n, p) => n + p.panjang, 0) + jeda.reduce((n, j) => n + j, 0);
  const sisa = adegan.minimumDetik - (AWAL_NARASI_DETIK + panjangDasar + EKOR_DETIK);
  if (sisa > 0 && jumlahJeda > 0) {
    const tambahan = Math.min(TAMBAHAN_JEDA_MAKS, sisa / jumlahJeda);
    for (let i = 1; i < jeda.length; i++) jeda[i] += tambahan;
  }

  // 3. Sambung dan catat waktu tiap kalimat.
  const daftar = [];
  const kalimat = [];
  let t = 0;
  for (const [i, k] of adegan.kalimat.entries()) {
    if (jeda[i] > 0) {
      const hening = join(folder, `${i}-jeda.wav`);
      jalankan(FFMPEG, [
        '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', jeda[i].toFixed(3),
        '-c:a', 'pcm_s16le', hening,
      ], 'buat jeda');
      daftar.push(hening);
      t += durasiBerkas(hening);
    }
    const { berkas, panjang } = potongan[i];
    kalimat.push({ teks: k.teks, mulai: +t.toFixed(3), selesai: +(t + panjang).toFixed(3) });
    daftar.push(berkas);
    t += panjang;
  }

  const berkasDaftar = join(folder, 'daftar.txt');
  writeFileSync(berkasDaftar, daftar.map((b) => `file '${b.replace(/\\/g, '/')}'`).join('\n'));
  jalankan(FFMPEG, [
    '-y', '-f', 'concat', '-safe', '0', '-i', berkasDaftar,
    '-af', 'highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=90,loudnorm=I=-16:TP=-1.5:LRA=11',
    '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '128k', berkasAkhir,
  ], 'gabung dan olah suara');

  return kalimat;
}

function mmss(detik) {
  return `${Math.floor(detik / 60)}:${String(Math.floor(detik % 60)).padStart(2, '0')}`;
}

/** naskah-narasi.md dibuat ulang setiap kali, supaya selalu cocok dengan suara yang ada. */
function tulisNaskahMd(hasil) {
  const baris = [
    '# Naskah narasi teaser Tani Muda',
    '',
    'Berkas ini dibuat otomatis oleh `npm run narasi` dari `scripts/naskah.mjs`. Ubah teks di sana, bukan di sini.',
    '',
    'Gaya bicara: santai dan jelas, seperti menjelaskan ke teman. Kalimat pendek, tempo sekitar 120–150 kata per menit,',
    'beri napas di setiap titik. Untuk merekam sendiri: satu berkas per adegan, simpan sebagai',
    '`public/audio/narasi/NN.mp3`, lalu jalankan `npm run narasi` (rekaman tidak akan ditimpa).',
    '',
  ];
  let mulai = 0;
  let total = 0;
  for (const a of hasil) {
    const detik = Math.max(a.minimumDetik, AWAL_NARASI_DETIK + a.durasiDetik + EKOR_DETIK);
    const frame = Math.ceil(detik * FPS);
    const selesai = mulai + frame / FPS;
    baris.push(`## ${a.id}. ${a.judul} (${mmss(mulai)}–${mmss(selesai)})`, '');
    baris.push(`Suara: ${a.sumber}, ${a.durasiDetik.toFixed(1)} detik, ${a.kataPerMenit} kata/menit`, '');
    for (const k of a.kalimat) baris.push(`- (${(AWAL_NARASI_DETIK + k.mulai).toFixed(1)} dtk) ${k.teks}`);
    baris.push('');
    mulai = selesai;
    total += frame;
  }
  baris.push(`Total: ${(total / FPS).toFixed(1)} detik (${mmss(total / FPS)}).`, '');
  writeFileSync(join(VIDEO, 'naskah-narasi.md'), baris.join('\n'));
}

async function utama() {
  if (!existsSync(EDGE_TTS)) {
    console.error('Edge TTS belum terpasang. Jalankan dulu: npm run siapkan-tts');
    process.exit(1);
  }
  FFMPEG = jalankan(PYTHON_TTS, ['-c', 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())'], 'cari ffmpeg').trim();
  mkdirSync(FOLDER_NARASI, { recursive: true });
  mkdirSync(dirname(BERKAS_DATA), { recursive: true });

  const lama = existsSync(BERKAS_DATA) ? JSON.parse(readFileSync(BERKAS_DATA, 'utf-8')) : { adegan: [] };
  const lamaPerId = Object.fromEntries(lama.adegan.map((a) => [a.id, a]));
  const hasil = [];

  for (const adegan of naskah) {
    const berkas = join(FOLDER_NARASI, `${adegan.id}.mp3`);
    const catatanLama = lamaPerId[adegan.id];
    const adaBerkas = existsSync(berkas);
    const buatanSkrip = adaBerkas && catatanLama?.md5 === md5(berkas) && catatanLama.sumber.startsWith('edge-tts');

    let sumber;
    let kalimat;
    if (adaBerkas && !buatanSkrip && !TIMPA) {
      sumber = 'rekaman';
      kalimat = waktuProporsional(adegan.kalimat, durasiBerkas(berkas));
      console.log(`${adegan.id} ${adegan.judul}: memakai rekaman yang ada (tidak ditimpa)`);
    } else {
      console.log(`${adegan.id} ${adegan.judul}: membuat suara ${SUARA}...`);
      sumber = `edge-tts:${SUARA}`;
      kalimat = await buatAdeganTts(adegan, berkas);
    }

    const durasi = durasiBerkas(berkas);
    const kata = adegan.kalimat.reduce((n, k) => n + hitungKata(k.teks), 0);
    const kpm = Math.round((kata / durasi) * 60);
    hasil.push({ id: adegan.id, judul: adegan.judul, minimumDetik: adegan.minimumDetik, sumber, durasiDetik: +durasi.toFixed(3), kata, kataPerMenit: kpm, md5: md5(berkas), kalimat });
    console.log(`   ${durasi.toFixed(1)} dtk, ${kata} kata, ${kpm} kata/menit`);
  }

  writeFileSync(BERKAS_DATA, JSON.stringify({ suara: SUARA, awalNarasiDetik: AWAL_NARASI_DETIK, ekorDetik: EKOR_DETIK, fps: FPS, adegan: hasil }, null, 2) + '\n');
  rmSync(FOLDER_SEMENTARA, { recursive: true, force: true });
  tulisNaskahMd(hasil);
  console.log(`\nData narasi ditulis ke ${BERKAS_DATA} dan naskah-narasi.md`);
}

utama().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
