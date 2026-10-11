#!/usr/bin/env node
/**
 * `npm run demo`: server pengembangan dengan semua pengaturan demo menyala (D-37), tanpa bergantung
 * pada isi `.env`. Variabel yang sudah ada di process.env didahulukan Vite di atas file `.env`.
 * Port bisa diganti: `npm run demo -- --port 5174`.
 */
import { PENGATURAN_DEMO } from './pengaturan-demo.mjs';

Object.assign(process.env, PENGATURAN_DEMO);
const argumen = process.argv.slice(2);
const iPort = argumen.indexOf('--port');
const port = iPort >= 0 ? Number(argumen[iPort + 1]) : undefined;

const { createServer } = await import('vite');
const server = await createServer({ server: port ? { port, strictPort: true } : {} });
await server.listen();
console.log('\n  Mode demo: data tiruan, resep contoh tampil. Pemilih akun demo di /akun-demo.\n');
server.printUrls();
server.bindCLIShortcuts({ print: true });
