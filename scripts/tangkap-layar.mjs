#!/usr/bin/env node
/* global document -- dipakai di dalam page.evaluate (berjalan di browser) */
/**
 * Ambil tangkapan layar halaman di lebar mobile (390px) dan desktop (1440px), memakai Chrome/Edge
 * yang terpasang (playwright-core, tanpa mengunduh browser).
 *
 * Pemakaian:
 *   npm run tangkap -- <url-atau-file> <jalur-dasar> [--hanya mobile|desktop] [--layar]
 *
 * Hasil: <jalur-dasar>-mobile.png dan <jalur-dasar>-desktop.png. Nama dasar mengikuti
 * design/README.md (format <nomor>-<nama-halaman>).
 *
 * Contoh:
 *   npm run tangkap -- http://localhost:5173/komponen docs/tangkapan/aplikasi/00-sistem-desain
 *   npm run tangkap -- design/extracted/tampil/00-sistem-desain-desktop.html \
 *     docs/tangkapan/desain/00-sistem-desain --hanya desktop
 *
 * --hanya   ambil satu ukuran saja (papan desain hanya punya satu versi).
 * --layar   hanya tinggi layar, bukan seluruh halaman.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const argumen = process.argv.slice(2);
const [sumber, dasar] = argumen.filter(
  (a, i) => !a.startsWith('--') && argumen[i - 1] !== '--hanya',
);
if (!sumber || !dasar) {
  console.error(
    'Pemakaian: npm run tangkap -- <url-atau-file> <jalur-dasar> [--hanya mobile|desktop] [--layar]',
  );
  process.exit(1);
}
const hanya = argumen.includes('--hanya') ? argumen[argumen.indexOf('--hanya') + 1] : null;
const url = /^(https?|file):/.test(sumber) ? sumber : pathToFileURL(resolve(sumber)).href;
// Papan desain mandiri merender isinya dengan skrip setelah dimuat; beri waktu lebih lama.
const tunggu = url.startsWith('file:') ? 4000 : 300;

const kandidat = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = kandidat.find((p) => existsSync(p));
if (!executablePath) {
  console.error('Chrome/Edge tidak ditemukan. Setel CHROME_PATH.');
  process.exit(1);
}

const ukuran = [
  { nama: 'mobile', width: 390, height: 844 },
  { nama: 'desktop', width: 1440, height: 900 },
].filter((u) => !hanya || u.nama === hanya);
if (ukuran.length === 0) {
  console.error('--hanya harus "mobile" atau "desktop".');
  process.exit(1);
}

mkdirSync(dirname(dasar), { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const u of ukuran) {
    const page = await browser.newPage({
      viewport: { width: u.width, height: u.height },
      deviceScaleFactor: 1,
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(tunggu);
    const lebarDokumen = await page.evaluate(() => document.documentElement.scrollWidth);
    if (lebarDokumen > u.width)
      console.warn(`PERINGATAN ${u.nama}: gulir horizontal (${lebarDokumen}px > ${u.width}px)`);
    const berkas = `${dasar}-${u.nama}.png`;
    await page.screenshot({ path: berkas, fullPage: !argumen.includes('--layar') });
    console.log('Tersimpan:', berkas);
    await page.close();
  }
} finally {
  await browser.close();
}
