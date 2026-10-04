#!/usr/bin/env node
/* global document -- dipakai di dalam page.evaluate (berjalan di browser) */
/**
 * Ambil tangkapan layar halaman aplikasi di lebar mobile (390px) dan desktop (1440px),
 * memakai Chrome/Edge yang terpasang (playwright-core, tanpa mengunduh browser).
 *
 * Pemakaian:
 *   node scripts/tangkap-layar.mjs <url> <folder-keluaran> [--penuh]
 * Contoh:
 *   node scripts/tangkap-layar.mjs http://localhost:5173/komponen docs/tangkapan/T1.17
 *   node scripts/tangkap-layar.mjs file:///…/design/extracted/pages/00.html docs/tangkapan/desain-00 --desain
 *
 * --desain: membuka papan desain hasil ekstraksi (lebar mengikuti papan).
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const [url, keluar, ...opsi] = process.argv.slice(2);
if (!url || !keluar) {
  console.error('Pemakaian: node scripts/tangkap-layar.mjs <url> <folder-keluaran>');
  process.exit(1);
}

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

mkdirSync(keluar, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const ukuran = [
  { nama: 'mobile', width: 390, height: 844 },
  { nama: 'desktop', width: 1440, height: 900 },
];
try {
  for (const u of ukuran) {
    const page = await browser.newPage({
      viewport: { width: u.width, height: u.height },
      deviceScaleFactor: 1,
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const lebarDokumen = await page.evaluate(() => document.documentElement.scrollWidth);
    if (lebarDokumen > u.width)
      console.warn(`PERINGATAN ${u.nama}: gulir horizontal (${lebarDokumen}px > ${u.width}px)`);
    const berkas = join(keluar, `${u.nama}.png`);
    await page.screenshot({ path: berkas, fullPage: !opsi.includes('--layar') });
    console.log('Tersimpan:', berkas);
    await page.close();
  }
} finally {
  await browser.close();
}
