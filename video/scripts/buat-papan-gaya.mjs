import { spawnSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
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

const adeganList = [
  { id: '01', komposisi: 'PapanGaya01', frame: 160 },
  { id: '02', komposisi: 'PapanGaya02', frame: 110 },
  { id: '03', komposisi: 'PapanGaya03', frame: 60 },
  { id: '04', komposisi: 'PapanGaya04', frame: 100 },
  { id: '05', komposisi: 'PapanGaya05', frame: 160 },
  { id: '06', komposisi: 'PapanGaya06', frame: 90 },
  { id: '07', komposisi: 'PapanGaya07', frame: 100 },
  { id: '08', komposisi: 'PapanGaya08', frame: 50 },
  { id: '09', komposisi: 'PapanGaya09', frame: 110 },
  { id: '10', komposisi: 'PapanGaya10', frame: 60 },
];

console.log('====================================================');
console.log('  PEMBUATAN PAPAN GAYA [AG-43] (10 BINGKAI STILL)');
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
