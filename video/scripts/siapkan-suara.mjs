#!/usr/bin/env node
/**
 * Rapikan rekaman suara pemilik produk [AG-45].
 *
 * Masukan : record-voiceover.mpeg (tidak diubah)
 * Keluaran: public/audio/narasi/rekaman.wav  (48 kHz, untuk video)
 *           .whisper/rekaman-16k.wav         (16 kHz, untuk whisper.cpp)
 *
 * Olahan dibuat ringan supaya suara tetap terdengar alami:
 * high-pass 80 Hz, pengurang derau FFT ringan (12 dB), kompresor ringan
 * 2:1, lalu kenyaringan -16 LUFS. ffmpeg bawaan Remotion tidak punya filter
 * highpass/afftdn/acompressor, jadi dipakai ffmpeg lengkap dari .venv-tts
 * (paket imageio-ffmpeg, `npm run siapkan-alat`).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(__dirname, '..');
const MASUKAN = join(VIDEO, 'record-voiceover.mpeg');
const KELUARAN = join(VIDEO, 'public', 'audio', 'narasi', 'rekaman.wav');
const UNTUK_WHISPER = join(VIDEO, '.whisper', 'rekaman-16k.wav');
const PYTHON = join(VIDEO, '.venv-tts', 'Scripts', 'python.exe');

function jalankan(bin, args, ket) {
  const h = spawnSync(bin, args, { encoding: 'utf-8' });
  if (h.status !== 0) throw new Error(`${ket} gagal:\n${h.stderr}`);
  return h.stdout;
}

if (!existsSync(MASUKAN)) {
  console.error('record-voiceover.mpeg tidak ditemukan di folder video/.');
  process.exit(1);
}
if (!existsSync(PYTHON)) {
  console.error('ffmpeg lengkap belum ada. Jalankan dulu: npm run siapkan-alat');
  process.exit(1);
}
const FFMPEG = jalankan(PYTHON, ['-c', 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())'], 'cari ffmpeg').trim();
mkdirSync(dirname(KELUARAN), { recursive: true });
mkdirSync(dirname(UNTUK_WHISPER), { recursive: true });

jalankan(FFMPEG, [
  '-y', '-i', MASUKAN,
  '-af',
  'highpass=f=80,afftdn=nr=12:nf=-40,acompressor=threshold=-22dB:ratio=2:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=11',
  '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', KELUARAN,
], 'olah suara');

// whisper.cpp butuh WAV 16 kHz mono; dibuat dari rekaman asli tanpa olahan.
jalankan(FFMPEG, ['-y', '-i', MASUKAN, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', UNTUK_WHISPER], 'buat wav 16 kHz');

console.log(`Suara siap: ${KELUARAN}`);
