/**
 * Bagian bersama `npm run dev` (dev-lengkap.mjs) dan `npm run demo:backend` (demo-backend.mjs):
 * memeriksa prasyarat backend lokal dan menjalankan proses `php artisan` yang ikut berhenti saat
 * skrip berhenti. Basis data tidak dinyalakan di sini: jalankan modul MySQL di XAMPP lebih dulu.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BACKEND = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'backend');

export function gagal(pesan) {
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

/** PHP 8.3+, backend terpasang, backend/.env ada, dan basis data menyala. */
export async function periksaPrasyarat() {
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
  const host = process.env.DB_HOST ?? '127.0.0.1';
  const port = Number(process.env.DB_PORT ?? 3306);
  if (!(await portTerbuka(host, port)))
    gagal(
      `Basis data belum menyala di ${host}:${port}. Jalankan modul MySQL di XAMPP Control Panel, lalu ulangi.`,
    );
}

const anak = [];
let berhenti = false;

/** Jalankan `php artisan …`; keluarannya diberi awalan agar tidak tercampur dengan Vite. */
export function jalankanArtisan(label, perintah) {
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
  return p;
}

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

/** API Laravel di http://127.0.0.1:8000. */
export const jalankanApi = () =>
  jalankanArtisan('api', ['serve', '--host=127.0.0.1', '--port=8000', '--no-ansi']);
