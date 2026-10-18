#!/usr/bin/env node
/**
 * Musik latar teaser Tani Muda, disintesis langsung dengan kode (tanpa sampel
 * atau rekaman pihak ketiga): progresi G - D - Em - C dengan nada marimba dan piano
 * sintetis. Panjang 180 detik; Remotion memotong dan memudarkan sesuai durasi video.
 * Keluaran: public/audio/musik.mp3
 *
 * Bagian narasi lama dari skrip AG-43 sudah dihapus; narasi dibuat lewat
 * scripts/buat-narasi.mjs [AG-44].
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOLDER_AUDIO = join(__dirname, '..', 'public', 'audio');
mkdirSync(FOLDER_AUDIO, { recursive: true });

const FFMPEG = join(__dirname, '..', 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
const SAMPLE_RATE = 44100;
const TOTAL_DURASI_DETIK = 180;
console.log('\n--- 2. Membuat Musik Latar Akustik (musik.mp3) ---');
// Membangkitkan komposisi musik akustik hangat 170 detik (G - D - Em - C progresif dengan melodi marimba & piano)
const totalSampelMusik = SAMPLE_RATE * TOTAL_DURASI_DETIK;
const bufferPcmMusikL = new Float32Array(totalSampelMusik);
const bufferPcmMusikR = new Float32Array(totalSampelMusik);

// Frekuensi nada (Hz)
const NADA = {
  G2: 98.0,
  B2: 123.47,
  D3: 146.83,
  E3: 164.81,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  Fs4: 369.99,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};

// Progresi akor: G major (G, D, Em, C) tiap 4 detik
const AKOR_LIST = [
  { bass: NADA.G2, akor: [NADA.G3, NADA.B3, NADA.D4, NADA.G4] },
  { bass: NADA.D3, akor: [NADA.Fs4, NADA.A3, NADA.D4, NADA.Fs4] },
  { bass: NADA.E3, akor: [NADA.E3, NADA.G3, NADA.B3, NADA.E4] },
  { bass: NADA.C4, akor: [NADA.C4, NADA.E4, NADA.G4, NADA.C5] },
];

const detikPerAkor = 3.5;
for (let tDetik = 0; tDetik < TOTAL_DURASI_DETIK; tDetik += 0.5) {
  const indexAkor = Math.floor(tDetik / detikPerAkor) % AKOR_LIST.length;
  const akor = AKOR_LIST[indexAkor];

  // Pluck note
  const pluck = (freq, tStart, durasi, amp, pan = 0) => {
    const sStart = Math.floor(tStart * SAMPLE_RATE);
    const sLen = Math.floor(durasi * SAMPLE_RATE);
    for (let i = 0; i < sLen; i++) {
      const idx = sStart + i;
      if (idx >= totalSampelMusik) break;
      const t = i / SAMPLE_RATE;
      // Synthesize warm guitar/marimba: fundamental + 2nd + 3rd harmonic
      const env = Math.exp(-t * 2.8) * Math.sin(Math.min(1, t * 100) * Math.PI * 0.5);
      const val =
        (Math.sin(2 * Math.PI * freq * t) * 0.6 +
          Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
          Math.sin(2 * Math.PI * freq * 3 * t) * 0.1) *
        env *
        amp;
      bufferPcmMusikL[idx] += val * (1 - pan * 0.5);
      bufferPcmMusikR[idx] += val * (1 + pan * 0.5);
    }
  };

  // Mainkan bass pada awal akor
  if (Math.abs(tDetik % detikPerAkor) < 0.1) {
    pluck(akor.bass, tDetik, detikPerAkor, 0.25, -0.2);
  }

  // Petikan arpeggio gitar / marimba
  const step = Math.floor((tDetik % detikPerAkor) / 0.5);
  const nadaAkor = akor.akor[step % akor.akor.length];
  pluck(nadaAkor, tDetik, 1.2, 0.18, ((step % 2) - 0.5) * 0.6);

  // Melodi lembut di atasnya tiap 1-2 detik
  if (step === 2 || step === 5) {
    const melodi = akor.akor[(step + 2) % akor.akor.length] * 1.5;
    pluck(melodi, tDetik, 1.5, 0.12, 0.3);
  }
}

// Convert float stereo to 16-bit PCM WAV
const pcmStereo16 = Buffer.alloc(44 + totalSampelMusik * 4);
pcmStereo16.write('RIFF', 0);
pcmStereo16.writeUInt32LE(36 + totalSampelMusik * 4, 4);
pcmStereo16.write('WAVE', 8);
pcmStereo16.write('fmt ', 12);
pcmStereo16.writeUInt32LE(16, 16);
pcmStereo16.writeUInt16LE(1, 20); // PCM
pcmStereo16.writeUInt16LE(2, 22); // stereo
pcmStereo16.writeUInt32LE(SAMPLE_RATE, 24);
pcmStereo16.writeUInt32LE(SAMPLE_RATE * 4, 28);
pcmStereo16.writeUInt16LE(4, 32);
pcmStereo16.writeUInt16LE(16, 34);
pcmStereo16.write('data', 36);
pcmStereo16.writeUInt32LE(totalSampelMusik * 4, 40);

for (let i = 0; i < totalSampelMusik; i++) {
  // Fade in 2 detik pertama, fade out 3 detik terakhir
  const t = i / SAMPLE_RATE;
  let fade = 1.0;
  if (t < 2.0) fade = t / 2.0;
  else if (t > TOTAL_DURASI_DETIK - 3.0) fade = (TOTAL_DURASI_DETIK - t) / 3.0;

  const left = Math.max(-1, Math.min(1, bufferPcmMusikL[i] * fade));
  const right = Math.max(-1, Math.min(1, bufferPcmMusikR[i] * fade));
  pcmStereo16.writeInt16LE(Math.floor(left * 32767), 44 + i * 4);
  pcmStereo16.writeInt16LE(Math.floor(right * 32767), 44 + i * 4 + 2);
}

const berkasWavMusik = join(FOLDER_AUDIO, 'musik_temp.wav');
writeFileSync(berkasWavMusik, pcmStereo16);

// Encode to musik.mp3
const berkasMusikMp3 = join(FOLDER_AUDIO, 'musik.mp3');
spawnSync(
  FFMPEG,
  ['-i', berkasWavMusik, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', berkasMusikMp3, '-y'],
  { stdio: 'ignore' },
);
unlinkSync(berkasWavMusik);
console.log('✓ Berkas musik.mp3 berhasil dibuat!');
