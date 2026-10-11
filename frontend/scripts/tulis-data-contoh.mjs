#!/usr/bin/env node
/**
 * Tulis data contoh ke src/api/tiruan/data/*.json dari pembuat-data.ts (lewat Vite, supaya modul
 * TypeScript bisa dimuat). Jalankan ulang setelah mengubah fixture atau pembuat data:
 *   npm run data-contoh
 * Tes `data.test.ts` gagal bila JSON tidak sama dengan keluaran pembuat.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const akar = fileURLToPath(new URL('..', import.meta.url));
const keluar = join(akar, 'src', 'api', 'tiruan', 'data');

const server = await createServer({
  root: akar,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});
try {
  const { buatDataContoh } = await server.ssrLoadModule('/src/api/tiruan/data/pembuat-data.ts');
  const { pecahDataContoh } = await server.ssrLoadModule('/src/api/tiruan/data/berkas-data.ts');
  for (const [nama, isi] of Object.entries(pecahDataContoh(buatDataContoh()))) {
    writeFileSync(join(keluar, `${nama}.json`), JSON.stringify(isi, null, 2) + '\n');
    console.log('Tersimpan:', `src/api/tiruan/data/${nama}.json`);
  }
} finally {
  await server.close();
}
