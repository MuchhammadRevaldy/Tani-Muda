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
 * `--tiruan` kembali ke data tiruan. Jalan mundur tanpa backend tetap `npm run demo` (data tiruan).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'backend');
const argumen = process.argv.slice(2);
const DB_HOST = process.env.DB_HOST ?? '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT ?? 3306);

function gagal(pesan) {
  console.error(`\n  ✗ ${pesan}\n`);
  process.exit(1);
}

function portTerbuka(host, port) {
  return new Promise((selesai) => {
    const s = createConnection({ host, port, timeout: 1500 });
    s.once('connect', () => (s.destroy(), selesai(true)));
    s.once('timeout', () => (s.destroy(), selesai(false)));
    s.once('error', () => selesai(false));
  });
}

// 1. Prasyarat: PHP 8.3+, backend terpasang, basis data menyala.
const php = spawnSync('php', ['-r', 'echo PHP_VERSION_ID;'], { encoding: 'utf8' });
if (php.status !== 0)
  gagal('PHP tidak ditemukan di PATH. Lihat docs/arsitektur-backend.md bagian 2a.');
if (Number(php.stdout) < 80300)
  gagal(
    `PHP di PATH terlalu lama (${php.stdout}). Butuh 8.3 atau lebih baru; periksa urutan PATH (bagian 2a).`,
  );
if (!existsSync(join(BACKEND, 'vendor')))
  gagal('backend/vendor belum ada. Jalankan `composer install` di folder backend.');
if (!existsSync(join(BACKEND, '.env')))
  gagal(
    'backend/.env belum ada. Salin backend/.env.example menjadi .env lalu `php artisan key:generate`.',
  );
if (!(await portTerbuka(DB_HOST, DB_PORT)))
  gagal(
    `Basis data belum menyala di ${DB_HOST}:${DB_PORT}. Jalankan modul MySQL di XAMPP Control Panel, lalu ulangi.`,
  );

// 2. Proses PHP. Keluarannya diberi awalan agar tidak tercampur dengan Vite.
const anak = [];
function jalankan(label, perintah) {
  const p = spawn('php', ['artisan', ...perintah], { cwd: BACKEND });
  const cetak = (aliran) => (data) => {
    for (const baris of String(data).split(/\r?\n/))
      if (baris.trim()) aliran.write(`  [${label}] ${baris}\n`);
  };
  p.stdout.on('data', cetak(process.stdout));
  p.stderr.on('data', cetak(process.stderr));
  p.on('exit', (kode) => {
    if (!berhenti) console.error(`  [${label}] berhenti (kode ${kode}).`);
  });
  anak.push(p);
}

let berhenti = false;
function hentikanSemua() {
  if (berhenti) return;
  berhenti = true;
  for (const p of anak) {
    if (p.exitCode !== null) continue;
    // `artisan serve` membuka proses `php -S` sendiri; di Windows seluruh pohon proses dihentikan.
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(p.pid), '/T', '/F']);
    else p.kill('SIGTERM');
  }
}
process.on('exit', hentikanSemua);
for (const sinyal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sinyal, () => process.exit(0));

jalankan('api', ['serve', '--host=127.0.0.1', '--port=8000', '--no-ansi']);
if (argumen.includes('--jadwal')) jalankan('jadwal', ['schedule:work', '--no-ansi']);
if (argumen.includes('--antrean'))
  jalankan('antrean', ['queue:work', '--memory=128', '--sleep=3', '--no-ansi']);

// 3. Vite di proses ini. Variabel proses mengalahkan isi .env frontend.
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
