#!/usr/bin/env node
/**
 * Mengambil tangkapan layar bukti [AG-37]:
 * - stok kartu (1440px & 390px)
 * - peta (1440px & 390px)
 * - form tambah stok (1440px & 390px)
 * - pojok kanan bawah (1440px & 390px)
 */
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright-core';

const URL_DASAR = process.env.URL_DASAR || 'http://localhost:4174';
const TARGET_DIR = resolve('../docs/tangkapan/aplikasi');
mkdirSync(TARGET_DIR, { recursive: true });

const kandidat = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = kandidat.find((p) => existsSync(p));
if (!executablePath) {
  console.error('Browser tidak ditemukan.');
  process.exit(1);
}

const browser = await chromium.launch({ executablePath, headless: true });

async function ambil(nama, aksi, { mobile = false, fullPage = false } = {}) {
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const page = await browser.newPage({ viewport });
  try {
    if (aksi) {
      await aksi(page);
    }
    const path = join(TARGET_DIR, `${nama}.png`);
    await page.screenshot({ path, fullPage });
    console.log(`Tersimpan: ${nama}.png`);
  } finally {
    await page.close();
  }
}

// Reset data demo dulu
const halInit = await browser.newPage();
await halInit.goto(`${URL_DASAR}/akun-demo`);
await halInit.getByRole('button', { name: 'Atur ulang data demo' }).click();
await halInit.waitForTimeout(1000);
await halInit.close();

console.log('Mengambil tangkapan layar bukti AG-37...');

// 1. Stok kartu di halaman pembeli (1440px & 390px)
for (const mobile of [false, true]) {
  const suf = mobile ? 'mobile' : 'desktop';
  await ambil(`ag37-stok-kartu-${suf}`, async (p) => {
    await p.goto(`${URL_DASAR}/akun-demo`);
    await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
    await p.waitForURL(/\/pembeli/);
    await p.goto(`${URL_DASAR}/pembeli/stok`);
    await p.waitForTimeout(1500);
  }, { mobile, fullPage: true });
}

// 2. Peta di halaman pembeli (1440px & 390px)
for (const mobile of [false, true]) {
  const suf = mobile ? 'mobile' : 'desktop';
  await ambil(`ag37-peta-${suf}`, async (p) => {
    await p.goto(`${URL_DASAR}/akun-demo`);
    await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
    await p.waitForURL(/\/pembeli/);
    await p.goto(`${URL_DASAR}/pembeli/peta`);
    await p.locator('#kartu-lokasi-pembeli').waitFor({ state: 'visible' });
    await p.waitForTimeout(1500);
  }, { mobile, fullPage: true });
}

// 3. Form tambah stok di halaman petani (1440px & 390px)
for (const mobile of [false, true]) {
  const suf = mobile ? 'mobile' : 'desktop';
  await ambil(`ag37-form-tambah-stok-${suf}`, async (p) => {
    await p.goto(`${URL_DASAR}/akun-demo`);
    await p.getByRole('button', { name: 'Masuk sebagai Arif' }).click();
    await p.waitForURL(/\/beranda/);
    await p.goto(`${URL_DASAR}/stok`);
    const btnTambah = p.getByRole('button', { name: /Tambah stok siap jual/i });
    if (await btnTambah.isVisible()) {
      await btnTambah.click();
      await p.waitForTimeout(800);
    }
  }, { mobile, fullPage: true });
}

// 4. Pojok kanan bawah (tombol mengambang & mode demo tidak saling menutupi)
for (const mobile of [false, true]) {
  const suf = mobile ? 'mobile' : 'desktop';
  await ambil(`ag37-pojok-kanan-bawah-${suf}`, async (p) => {
    await p.goto(`${URL_DASAR}/akun-demo`);
    await p.getByRole('button', { name: 'Masuk sebagai Arif' }).click();
    await p.waitForURL(/\/beranda/);
    await p.locator('#tombol-buka-chatbot').waitFor({ state: 'visible' });
    await p.locator('#label-mode-demo').waitFor({ state: 'visible' });
    await p.waitForTimeout(1000);
  }, { mobile, fullPage: false });
}

await browser.close();
console.log('Semua tangkapan layar bukti AG-37 selesai diambil!');
