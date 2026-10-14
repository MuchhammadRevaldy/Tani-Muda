#!/usr/bin/env node
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright-core';

const URL_DASAR = 'http://localhost:5173';
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

async function ambil(nama, url, aksi, opts = {}) {
  const mobile = opts.mobile ?? false;
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(`${URL_DASAR}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    if (aksi) {
      await aksi(page);
      await page.waitForTimeout(500);
    }
    const path = join(TARGET_DIR, `${nama}.png`);
    await page.screenshot({ path, fullPage: opts.fullPage ?? true });
    console.log(`Tersimpan: ${nama}.png`);
  } finally {
    await page.close();
  }
}

// 1. Reset data demo dulu
const halInit = await browser.newPage();
await halInit.goto(`${URL_DASAR}/akun-demo`);
await halInit.getByRole('button', { name: 'Atur ulang data demo' }).click();
await halInit.waitForTimeout(1000);
await halInit.close();

console.log('Mengambil tangkapan layar bukti AG-35...');

// 1. Pojok kanan bawah dengan Mode demo + chatbot (tidak saling menutupi)
await ambil('73-tombol-mengambang-demo-chatbot-desktop', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.waitForURL(/\/pembeli/);
  await p.locator('#tombol-buka-chatbot').waitFor({ state: 'visible' });
  await p.locator('#label-mode-demo').waitFor({ state: 'visible' });
}, { mobile: false, fullPage: false });

await ambil('73-tombol-mengambang-demo-chatbot-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.waitForURL(/\/pembeli/);
  await p.locator('#tombol-buka-chatbot').waitFor({ state: 'visible' });
  await p.locator('#label-mode-demo').waitFor({ state: 'visible' });
}, { mobile: true, fullPage: false });

// 2. Panel chatbot di HP (lembar penuh layar)
await ambil('74-panel-chatbot-hp-lembar-penuh-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.waitForURL(/\/pembeli/);
  const btnChatbot = p.locator('#tombol-buka-chatbot');
  await btnChatbot.waitFor({ state: 'visible' });
  await btnChatbot.click();
  await p.locator('#panel-chatbot').waitFor({ state: 'visible' });
  await p.locator('#tombol-tutup-chatbot').waitFor({ state: 'visible' });
}, { mobile: true, fullPage: false });

// 3. Kartu lokasi pembeli di halaman Peta (desktop dan mobile)
await ambil('75-kartu-lokasi-pembeli-peta-desktop', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/peta`);
  await p.locator('#kartu-lokasi-pembeli').waitFor({ state: 'visible' });
  await p.locator('#tombol-perbarui-lokasi').waitFor({ state: 'visible' });
  await p.waitForTimeout(1000);
}, { mobile: false });

await ambil('75-kartu-lokasi-pembeli-peta-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/peta`);
  await p.locator('#kartu-lokasi-pembeli').waitFor({ state: 'visible' });
  await p.locator('#tombol-perbarui-lokasi').waitFor({ state: 'visible' });
  await p.waitForTimeout(1000);
}, { mobile: true });

// 4. Halaman Stok siap jual (foto stok ilustrasi komoditas)
await ambil('76-stok-siap-jual-ilustrasi-desktop', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/stok`);
  await p.waitForTimeout(1000);
}, { mobile: false });

await ambil('76-stok-siap-jual-ilustrasi-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/stok`);
  await p.waitForTimeout(1000);
}, { mobile: true });

await browser.close();
console.log('Semua tangkapan layar bukti AG-35 selesai!');
