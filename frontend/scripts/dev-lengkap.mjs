#!/usr/bin/env node
/**
 * `npm run dev:lengkap` (atau `npm run dev` di akar repositori): API Laravel dan Vite dengan satu
 * perintah (T5.03). Basis data tidak dinyalakan skrip ini: jalankan modul MySQL di XAMPP Control
 * Panel lebih dulu (D-25, D-50).
 *
 * - API: `php artisan serve` di backend/ → http://127.0.0.1:8000
 * - Frontend: Vite di proses yang sama (hemat memori, arsitektur-backend.md 2b) → http://localhost:5173,
 *   dengan proxy /api dan /sanctum ke API (vite.config.ts).
 * - `--jadwal` ikut menjalankan `schedule:work`; `--antrean` ikut menjalankan `queue:work` hemat
 *   memori. Keduanya bawaan mati, karena di lokal antrean memakai `sync`.
 *
 * Frontend memakai klien HTTP ke API ini (VITE_SUMBER_DATA=http, D-57) dengan resep contoh tampil;
 * `--tiruan` kembali ke data tiruan. Untuk demo di depan juri pakai `npm run demo:backend` (build,
 * tanpa kompilasi saat halaman dibuka); jalan mundur tanpa backend `npm run demo` (data tiruan).
 */
import { jalankanApi, jalankanArtisan, periksaPrasyarat } from './backend-lokal.mjs';

const argumen = process.argv.slice(2);
await periksaPrasyarat();

jalankanApi();
if (argumen.includes('--jadwal')) jalankanArtisan('jadwal', ['schedule:work', '--no-ansi']);
if (argumen.includes('--antrean'))
  jalankanArtisan('antrean', ['queue:work', '--memory=128', '--sleep=3', '--no-ansi']);

// Vite di proses ini. Variabel proses mengalahkan isi .env frontend.
process.env.VITE_SUMBER_DATA = argumen.includes('--tiruan') ? 'tiruan' : 'http';
process.env.VITE_TAMPILKAN_RESEP_CONTOH ??= 'true';
const { createServer } = await import('vite');
const server = await createServer();
await server.listen();
console.log(
  '\n  API Laravel: http://127.0.0.1:8000 (lewat proxy: http://localhost:5173/api/v1/kesehatan)',
);
console.log(`  Sumber data frontend: ${process.env.VITE_SUMBER_DATA}`);
server.printUrls();
server.bindCLIShortcuts({ print: true });
