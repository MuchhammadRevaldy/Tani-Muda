import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const folderVideo = join(__dirname, '..');
const folderPapanGaya = join(folderVideo, 'keluaran', 'papan-gaya');

if (!existsSync(folderPapanGaya)) {
  mkdirSync(folderPapanGaya, { recursive: true });
}

const remotionBin = `"${join(
  folderVideo,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'remotion.cmd' : 'remotion',
)}"`;

// Bingkai diambil di 60% durasi tiap adegan (dihitung dari narasi.json) [AG-44].
const data = JSON.parse(readFileSync(join(folderVideo, 'src', 'data', 'narasi.json'), 'utf-8'));
const adeganList = data.adegan.map((a) => {
  const detik = Math.max(a.minimumDetik, data.awalNarasiDetik + a.durasiDetik + data.ekorDetik);
  return { id: a.id, komposisi: `PapanGaya${a.id}`, frame: Math.round(detik * data.fps * 0.6) };
});

console.log('====================================================');
console.log('  PEMBUATAN PAPAN GAYA [AG-44] (10 BINGKAI STILL)');
console.log('====================================================');

for (const a of adeganList) {
  const targetOutput = `keluaran/papan-gaya/${a.id}.png`;
  console.log(`Rendering ${a.komposisi} (frame ${a.frame}) -> ${targetOutput}...`);

  const hasil = spawnSync(
    remotionBin,
    ['still', 'src/index.ts', a.komposisi, targetOutput, `--frame=${a.frame}`],
    {
      cwd: folderVideo,
      stdio: 'inherit',
      shell: true,
    },
  );

  if (hasil.status !== 0) {
    console.error(`✗ Gagal merender papan gaya adegan ${a.id}`);
    process.exit(1);
  }
}

console.log('====================================================');
console.log('✓ 10 Bingkai gaya berhasil disimpan di video/keluaran/papan-gaya/');
console.log('====================================================');
