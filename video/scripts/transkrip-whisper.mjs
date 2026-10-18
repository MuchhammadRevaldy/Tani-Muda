#!/usr/bin/env node
/**
 * Transkrip rekaman suara dengan whisper.cpp lokal [AG-45].
 * Memasang whisper.cpp 1.5.5 dan model `small` ke .whisper/ (tidak di-commit),
 * lalu menulis .whisper/transkrip.json berisi waktu per token.
 * Jalankan dulu: node scripts/siapkan-suara.mjs
 */
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadWhisperModel, installWhisperCpp, transcribe } from '@remotion/install-whisper-cpp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOLDER = join(__dirname, '..', '.whisper');
const WHISPER = join(FOLDER, 'whisper.cpp');
const VERSI = '1.5.5';
const MODEL = process.argv.find((a) => a.startsWith('--model='))?.split('=')[1] ?? 'small';
const WAV = join(FOLDER, 'rekaman-16k.wav');

if (!existsSync(WAV)) {
  console.error('Belum ada .whisper/rekaman-16k.wav. Jalankan: node scripts/siapkan-suara.mjs');
  process.exit(1);
}

await installWhisperCpp({ to: WHISPER, version: VERSI, printOutput: false });
await downloadWhisperModel({ model: MODEL, folder: WHISPER, printOutput: false });
console.log(`Mentranskrip dengan model ${MODEL}...`);
const hasil = await transcribe({
  inputPath: WAV,
  whisperPath: WHISPER,
  whisperCppVersion: VERSI,
  model: MODEL,
  modelFolder: WHISPER,
  language: 'id',
  tokenLevelTimestamps: true,
  printOutput: false,
});
writeFileSync(join(FOLDER, 'transkrip.json'), JSON.stringify(hasil, null, 1));
for (const s of hasil.transcription) console.log(`[${s.timestamps.from}] ${s.text.trim()}`);
