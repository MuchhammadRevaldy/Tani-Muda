#!/usr/bin/env node
/**
 * Script pembuatan audio narasi dan musik latar teaser Tani Muda.
 * Menghasilkan:
 *  - video/audio/narasi.mp3 (suara narator tersinkron 9 adegan)
 *  - video/audio/musik.mp3 (musik latar akustik hangat 170 detik)
 * Serta menyalin ke video/public/audio/ untuk Remotion staticFile().
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOLDER_AUDIO = join(__dirname, '..', 'audio');
const FOLDER_PUBLIC_AUDIO = join(__dirname, '..', 'public', 'audio');
mkdirSync(FOLDER_AUDIO, { recursive: true });
mkdirSync(FOLDER_PUBLIC_AUDIO, { recursive: true });

const FFMPEG = join(
  __dirname,
  '..',
  'node_modules',
  '@remotion',
  'compositor-win32-x64-msvc',
  'ffmpeg.exe',
);

console.log('--- 1. Membuat Suara Narasi (narasi.mp3) ---');
const naskahPerAdegan = [
  {
    adegan: '01-pembuka',
    mulaiDetik: 0.5,
    teks: 'Indonesia adalah negeri agraris yang kaya. Namun, masa depan pangan kita membutuhkan tenaga baru, ide baru, dan semangat generasi muda. Selamat datang di Tani Muda — platform agrikultur presisi yang menghubungkan petani muda dengan pembeli pasti sejak awal tanam.',
  },
  {
    adegan: '02-masalah',
    mulaiDetik: 12.5,
    teks: 'Berdasarkan data BPS, hanya 21,93 persen pemuda Indonesia yang mau bertani. Ketidakpastian harga yang sering anjlok, takaran pupuk dan hama yang sulit ditebak, jeratan tengkulak, hingga pasar yang tak menentu menjadi momok utama. Menuju Indonesia Emas 2045, regenerasi petani adalah kunci utama kedaulatan pangan.',
  },
  {
    adegan: '03-solusi',
    mulaiDetik: 30.5,
    teks: 'Tani Muda hadir menjawab tantangan ini melalui siklus empat pilar terpadu: Belajar resep tani teruji, Hitung simulasi modal dan laba, Rawat tanaman dengan panduan presisi, dan Jual panen langsung dengan kontrak pasti.',
  },
  {
    adegan: '04-hitung',
    mulaiDetik: 42.5,
    teks: 'Sebelum mencangkul lahan, petani muda dapat memilih komoditas dan menghitung kebutuhan modal secara transparan. Sistem secara otomatis menyajikan kalkulasi bibit, nutrisi, titik impas atau BEP, serta estimasi keuntungan. Tak ada lagi risiko modal tebak-tebakan tanpa perhitungan bisnis yang matang.',
  },
  {
    adegan: '05-rawat',
    mulaiDetik: 65.5,
    teks: 'Saat siklus berjalan, beranda cerdas memandu petani dengan penggaris umur tanaman dan tugas harian terjadwal. Fitur pencatatan pH dan PPM larutan memberikan rekomendasi instan: apakah nutrisi tanaman kurang, berlebih, atau sudah tepat sesuai fase pertumbuhan.',
  },
  {
    adegan: '06-jual',
    mulaiDetik: 85.5,
    teks: 'Inilah kunci pembeda Tani Muda: kepastian pasar sejak awal tanam. Pembeli dan kafe memesan serta membayar uang muka di awal. Petani menerima kesepakatan dan mengirim hasil panen saat tiba masanya. Dana tersimpan aman, transparansi terjaga, dan ulasan pembeli membangun reputasi terpercaya bagi petani muda.',
  },
  {
    adegan: '07-fitur-pintar',
    mulaiDetik: 115.5,
    teks: 'Tani Muda diperkuat teknologi modern: asisten kecerdasan buatan untuk deteksi dini gejala penyakit tanaman berlabel dugaan dengan tindakan aman, chatbot penyuluh pertanian 24 jam, prakiraan cuaca BMKG 3 hari untuk efisiensi siram, serta peta sebaran petani lokal yang tetap melindungi privasi lokasi kebun.',
  },
  {
    adegan: '08-petani-bertahan',
    mulaiDetik: 145.5,
    teks: 'Agar semangat bertani terus berkobar, sistem gamifikasi menghadirkan poin capaian dan lencana 3D yang membanggakan. Terlebih lagi, aplikasi mengusung konsep offline first, tetap lancar digunakan di tengah ladang tanpa sinyal internet.',
  },
  {
    adegan: '09-penutup',
    mulaiDetik: 160.5,
    teks: 'Tani Muda: Tanam dengan Pembeli yang Pasti. Mewujudkan masa depan pertanian Indonesia yang modern, presisi, dan berdaya saing. Saya Sandy dari Kabupaten Klaten, Jawa Tengah — mari bersama kita bangun kedaulatan pangan Nusantara!',
  },
];

// Buat script PowerShell untuk membangkitkan rekaman per adegan dan menggabungkannya
const tempPs1 = join(FOLDER_AUDIO, 'sintesis_narasi.ps1');
const berkasWavGabung = join(FOLDER_AUDIO, 'narasi_gabung.wav');

let psScript = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$voices = $synth.GetInstalledVoices()
`;

for (let i = 0; i < naskahPerAdegan.length; i++) {
  const item = naskahPerAdegan[i];
  const safeText = item.teks
    .replace(/[—–]/g, ', ')
    .replace(/["']/g, '')
    .trim();
  const tempWav = join(FOLDER_AUDIO, `segmen_${i}.wav`).replace(/\\/g, '/');
  psScript += `
$synth.SetOutputToWaveFile("${tempWav}")
$synth.Speak("${safeText}")
`;
}
psScript += `$synth.Dispose()\n`;
writeFileSync(tempPs1, psScript, 'utf-8');

spawnSync('powershell', ['-ExecutionPolicy', 'Bypass', '-File', tempPs1], { stdio: 'inherit' });

// Gabungkan segmen WAV ke dalam satu track 170 detik dengan padding silence sesuai mulaiDetik
console.log('Menyelaraskan segmen narasi ke timeline 170 detik...');
const SAMPLE_RATE = 44100;
const TOTAL_DURASI_DETIK = 170;
const totalSampel = SAMPLE_RATE * TOTAL_DURASI_DETIK;
const bufferPcm = new Int16Array(totalSampel);

for (let i = 0; i < naskahPerAdegan.length; i++) {
  const tempWav = join(FOLDER_AUDIO, `segmen_${i}.wav`);
  if (!existsSync(tempWav)) continue;

  // Baca WAV dan ekstraksi PCM 16-bit
  const data = readFileSync(tempWav);
  // Cari chunk data
  const idxData = data.indexOf('data');
  if (idxData !== -1) {
    const pcmOffset = idxData + 8;
    const sampleRate = data.readUInt32LE(24);
    const channels = data.readUInt16LE(22);
    const bytesPerSample = 2;
    const stride = channels * bytesPerSample;
    const numSamples = Math.floor((data.length - pcmOffset) / stride);

    const mulaiSampel = Math.floor(naskahPerAdegan[i].mulaiDetik * SAMPLE_RATE);
    for (let s = 0; s < numSamples; s++) {
      const posAsal = pcmOffset + s * stride;
      if (posAsal + 1 >= data.length) break;
      const val = data.readInt16LE(posAsal);
      const posTujuan = mulaiSampel + Math.floor((s * SAMPLE_RATE) / sampleRate);
      if (posTujuan < totalSampel) {
        bufferPcm[posTujuan] = val;
      }
    }
  }
}

// Tulis narasi_gabung.wav
function tulisWavMono(filePath, pcm16) {
  const header = Buffer.alloc(44);
  const dataLen = pcm16.length * 2;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLen, 40);

  const bufData = Buffer.from(pcm16.buffer);
  writeFileSync(filePath, Buffer.concat([header, bufData]));
}

import { readFileSync, unlinkSync } from 'node:fs';
tulisWavMono(berkasWavGabung, bufferPcm);

// Konversi ke narasi.mp3
const berkasNarasiMp3 = join(FOLDER_AUDIO, 'narasi.mp3');
spawnSync(
  FFMPEG,
  ['-i', berkasWavGabung, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', berkasNarasiMp3, '-y'],
  { stdio: 'ignore' },
);
copyFileSync(berkasNarasiMp3, join(FOLDER_PUBLIC_AUDIO, 'narasi.mp3'));
console.log('✓ Berkas narasi.mp3 berhasil dibuat!');

// Bersihkan segmen temp
try {
  unlinkSync(tempPs1);
  unlinkSync(berkasWavGabung);
  for (let i = 0; i < naskahPerAdegan.length; i++) {
    const f = join(FOLDER_AUDIO, `segmen_${i}.wav`);
    if (existsSync(f)) unlinkSync(f);
  }
} catch {}

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
copyFileSync(berkasMusikMp3, join(FOLDER_PUBLIC_AUDIO, 'musik.mp3'));
unlinkSync(berkasWavMusik);
console.log('✓ Berkas musik.mp3 berhasil dibuat!');
console.log('\nAudio narasi dan musik siap digunakan untuk render Remotion!');
