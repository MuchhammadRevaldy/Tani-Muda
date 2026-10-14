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

console.log('Mengambil tangkapan layar bukti AG-34...');

// 2. Navigasi pembeli HP (390px) pada 4 tab + dropdown akun terbuka
await ambil('67-navigasi-pembeli-hp-tab-pesanan-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.waitForURL(/\/pembeli/);
  await p.locator('#navigasi-bawah-pembeli').waitFor({ state: 'visible' });
}, { mobile: true, fullPage: false });

await ambil('67-navigasi-pembeli-hp-tab-stok-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/stok`);
  await p.locator('#navigasi-bawah-pembeli').waitFor({ state: 'visible' });
}, { mobile: true, fullPage: false });

await ambil('67-navigasi-pembeli-hp-tab-peta-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/peta`);
  await p.locator('#navigasi-bawah-pembeli').waitFor({ state: 'visible' });
}, { mobile: true, fullPage: false });

await ambil('67-navigasi-pembeli-hp-tab-chat-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/chat`);
  await p.locator('#navigasi-bawah-pembeli').waitFor({ state: 'visible' });
}, { mobile: true, fullPage: false });

await ambil('67-navigasi-pembeli-hp-menu-akun-terbuka-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.waitForURL(/\/pembeli/);
  const btn = p.locator('#tombol-menu-akun-pembeli');
  await btn.waitFor({ state: 'visible' });
  await btn.click();
  await p.getByRole('menuitem', { name: 'Profil' }).waitFor({ state: 'visible' });
}, { mobile: true, fullPage: false });

// 3. Modal chat lewat nomor HP (390px dan 1440px)
await ambil('68-modal-chat-nomor-hp-desktop', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/chat`);
  const btn = p.locator('#tombol-chat-nomor-hp');
  await btn.waitFor({ state: 'visible' });
  await btn.click();
  await p.locator('#masukan-nomor-hp-chat').waitFor({ state: 'visible' });
  await p.locator('#masukan-nomor-hp-chat').fill('+6281200000001');
}, { mobile: false });

await ambil('68-modal-chat-nomor-hp-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/chat`);
  const btn = p.locator('#tombol-chat-nomor-hp');
  await btn.waitFor({ state: 'visible' });
  await btn.click();
  await p.locator('#masukan-nomor-hp-chat').waitFor({ state: 'visible' });
  await p.locator('#masukan-nomor-hp-chat').fill('+6281200000001');
}, { mobile: true });

// 4. Peta petani pembeli dengan pin tersebar (1440px dan 390px)
await ambil('69-peta-petani-sekitar-desktop', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/peta`);
  await p.waitForTimeout(1000);
}, { mobile: false });

await ambil('69-peta-petani-sekitar-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/peta`);
  await p.waitForTimeout(1000);
}, { mobile: true });

// 5. Halaman stok pembeli dengan tombol Chat dan Beli (1440px dan 390px)
await ambil('70-halaman-stok-pembeli-desktop', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/stok`);
  await p.waitForTimeout(500);
}, { mobile: false });

await ambil('70-halaman-stok-pembeli-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Ratna' }).click();
  await p.goto(`${URL_DASAR}/pembeli/stok`);
  await p.waitForTimeout(500);
}, { mobile: true });

// 6. Kotak saran setelah tugas selesai di beranda petani (1440px dan 390px)
await ambil('71-kotak-saran-tugas-selesai-desktop', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Arif' }).click();
  await p.goto(`${URL_DASAR}/beranda`);
  await p.locator('#kotak-saran-harian').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(500);
}, { mobile: false });

await ambil('71-kotak-saran-tugas-selesai-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Arif' }).click();
  await p.goto(`${URL_DASAR}/beranda`);
  await p.locator('#kotak-saran-harian').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(500);
}, { mobile: true });

// 7. Widget harga panen berita di beranda/analisis petani (1440px dan 390px)
await ambil('72-widget-harga-berita-desktop', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Arif' }).click();
  await p.goto(`${URL_DASAR}/beranda`);
  await p.locator('#widget-harga-berita').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(500);
}, { mobile: false });

await ambil('72-widget-harga-berita-mobile', '/akun-demo', async (p) => {
  await p.getByRole('button', { name: 'Masuk sebagai Arif' }).click();
  await p.goto(`${URL_DASAR}/beranda`);
  await p.locator('#widget-harga-berita').scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(500);
}, { mobile: true });

await browser.close();
console.log('Semua tangkapan layar bukti selesai!');
