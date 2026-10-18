#!/usr/bin/env node
/* global document, window -- dipakai di dalam addInitScript (berjalan di peramban) */
/**
 * Rekam ulang adegan aplikasi di layar HP sungguhan untuk teaser [AG-45].
 *
 * Viewport 390×844, isMobile, hasTouch, deviceScaleFactor 2. Video 390×844: Playwright
 * merekam seukuran viewport CSS, jadi 780×1688 hanya berisi bantalan (lihat recordVideo).
 * Setiap skenario menjadi satu berkas public/rekaman/hp-<nama>.webm, dan detik
 * setiap langkah dicatat di src/data/penanda-rekaman.json supaya setiap shot di
 * video bisa memutar potongan yang tepat.
 *
 * Prasyarat: demo backend menyala (`npm run demo:backend` di frontend/, port 4174).
 * Pemakaian: node scripts/rekam-hp.mjs [--url http://localhost:4174] [--skenario hitung,rawat]
 *
 * playwright-core dipinjam dari frontend/node_modules (tidak menambah paket di video/).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(__dirname, '..');
const AKAR = join(VIDEO, '..');
const { chromium } = await import(pathToFileURL(join(AKAR, 'frontend', 'node_modules', 'playwright-core', 'index.mjs')).href);

const argumen = process.argv.slice(2);
const nilai = (nama, bawaan) => {
  const i = argumen.indexOf(nama);
  return i >= 0 ? argumen[i + 1] : bawaan;
};
const URL_DASAR = nilai('--url', 'http://localhost:4174').replace(/\/$/, '');
const FOLDER = join(VIDEO, 'public', 'rekaman');
const FOLDER_TEMP = join(VIDEO, 'rekaman', '.temp-hp');
const BERKAS_PENANDA = join(VIDEO, 'src', 'data', 'penanda-rekaman.json');
const TUNGGU = 20_000;
mkdirSync(FOLDER, { recursive: true });
mkdirSync(FOLDER_TEMP, { recursive: true });

const executablePath = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]
  .filter(Boolean)
  .find((p) => existsSync(p));
if (!executablePath) throw new Error('Chrome/Edge tidak ditemukan. Setel CHROME_PATH.');

/** Lingkaran sentuhan yang terlihat di rekaman (layar sentuh tidak punya kursor). */
async function pasangTandaSentuh(page) {
  await page.addInitScript(() => {
    window.addEventListener('pointerdown', (e) => {
      const titik = document.createElement('div');
      titik.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:34px;height:34px;
        margin:-17px 0 0 -17px;border-radius:50%;background:rgba(82,183,136,.45);border:3px solid #fff;
        box-shadow:0 2px 10px rgba(0,0,0,.3);pointer-events:none;z-index:2147483647;
        animation:sentuh-riak .6s ease-out forwards`;
      document.body.appendChild(titik);
      setTimeout(() => titik.remove(), 650);
    }, true);
    window.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '@keyframes sentuh-riak{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.2);opacity:0}}';
      document.head.appendChild(s);
    });
  });
}

const tombol = (page, nama) =>
  page
    .getByRole('button', { name: nama })
    .or(page.getByRole('link', { name: nama }))
    .or(page.getByRole('radio', { name: nama }))
    .or(page.getByRole('tab', { name: nama }))
    .locator('visible=true')
    .first();

async function ketuk(page, nama) {
  const t = typeof nama === 'string' || nama instanceof RegExp ? tombol(page, nama) : nama;
  await t.waitFor({ state: 'visible', timeout: TUNGGU });
  await t.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(350);
  await t.tap({ timeout: TUNGGU });
  await page.waitForTimeout(650);
}
const lihat = (page, teks) => page.getByText(teks).locator('visible=true').first().waitFor({ timeout: TUNGGU });
const jeda = (page, ms) => page.waitForTimeout(ms);
async function gulirKe(page, teks) {
  const el = page.getByText(teks).locator('visible=true').first();
  await el.waitFor({ timeout: TUNGGU });
  await el.evaluate((n) => n.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await jeda(page, 900);
}
async function masukSebagai(page, nama) {
  await page.goto(`${URL_DASAR}/akun-demo`);
  await ketuk(page, `Masuk sebagai ${nama}`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await jeda(page, 900);
}

// ---------------------------------------------------------------- skenario

const SKENARIO = {
  async hitung(page, tandai) {
    await masukSebagai(page, 'Arif');
    // Tombol "Buat siklus baru" hanya ada di desktop; di HP dibuka dari alamatnya.
    await page.goto(`${URL_DASAR}/hitung/tanaman`);
    tandai('pilih-tanaman');
    await jeda(page, 1500);
    await ketuk(page, /Sawi hijau/);
    await ketuk(page, 'Lanjut pilih metode');
    tandai('isi-luas');
    const luas = page.getByLabel(/Luas lahan/).first();
    await luas.tap();
    await luas.fill('');
    await page.keyboard.type('20', { delay: 180 });
    await jeda(page, 900);
    await ketuk(page, 'Lanjut hitung modal');
    await lihat(page, /impas/i);
    tandai('modal');
    await jeda(page, 2500);
    await gulirKe(page, /impas/i);
    tandai('impas');
    await jeda(page, 2500);
    await gulirKe(page, 'Saran Memperbanyak Untung');
    tandai('saran');
    await jeda(page, 3500);
    await ketuk(page, 'Simpan rencana');
    tandai('simpan');
    await ketuk(page, /Kebun belakang rumah/);
    await ketuk(page, 'Hari ini');
    await ketuk(page, 'Simpan dan buat jadwal');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    tandai('jadwal');
    await jeda(page, 2500);
  },

  async rawat(page, tandai) {
    await masukSebagai(page, 'Arif');
    tandai('beranda');
    await lihat(page, /hari ke-/i);
    await jeda(page, 2500);
    await page.evaluate(() => window.scrollBy({ top: 260, behavior: 'smooth' }));
    tandai('tugas');
    await jeda(page, 1800);
    const centang = page.locator('input[type="checkbox"]').locator('visible=true').first();
    if (await centang.isVisible().catch(() => false)) {
      await centang.scrollIntoViewIfNeeded();
      await jeda(page, 500);
      tandai('centang');
      await centang.tap();
    } else tandai('centang');
    await jeda(page, 2500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await jeda(page, 600);
    await ketuk(page, /Sawi hijau · Rak hidroponik teras/);
    await ketuk(page, 'Lihat jadwal, modal, dan jurnal');
    await lihat(page, 'Cek pH dan PPM');
    await gulirKe(page, 'Cek pH dan PPM');
    await ketuk(page, 'Isi angka');
    tandai('ph');
    const ph = page.getByLabel('pH larutan');
    await ph.tap();
    await page.keyboard.type('6,2', { delay: 200 });
    await jeda(page, 600);
    const ppm = page.getByLabel('PPM (kepekatan nutrisi)');
    await ppm.tap();
    await page.keyboard.type('600', { delay: 200 });
    await lihat(page, /PPM terlalu rendah/i);
    tandai('saran-ph');
    await jeda(page, 3000);
    await ketuk(page, 'Simpan hasil');
    await lihat(page, 'Hasil ukur tersimpan.');
    await jeda(page, 1500);
  },

  async pembeli(page, tandai) {
    await masukSebagai(page, 'Imas');
    tandai('dasbor');
    await ketuk(page, 'Buat pesanan');
    await ketuk(page, /Sawi hijau/);
    tandai('pesan');
    const jumlah = page.getByLabel('Jumlah per kiriman');
    await jumlah.tap();
    await jumlah.fill('10');
    const harga = page.getByLabel(/Harga per kg/);
    await harga.tap();
    await harga.fill('5000');
    await jeda(page, 800);
    await ketuk(page, /^Lanjut bayar Rp/);
    tandai('bayar');
    await ketuk(page, 'Berhasil');
    await ketuk(page, /^Bayar Rp/);
    await lihat(page, 'Uang muka sudah masuk');
    tandai('uang-muka-masuk');
    await jeda(page, 3500);
  },

  async petani(page, tandai) {
    await masukSebagai(page, 'Arif');
    await page.goto(`${URL_DASAR}/pesanan`);
    tandai('pesanan-sekitar');
    await jeda(page, 1200);
    await ketuk(page, /Kafe Daun Pagi/);
    const lihatPesanan = tombol(page, 'Lihat pesanan');
    if (await lihatPesanan.isVisible().catch(() => false)) await ketuk(page, lihatPesanan);
    await lihat(page, /Lahanmu cukup/);
    tandai('detail');
    await jeda(page, 1800);
    await ketuk(page, /^Ambil .* kg/);
    tandai('kesepakatan');
    await jeda(page, 1200);
    await page.getByRole('checkbox').first().tap();
    await ketuk(page, 'Setuju');
    await lihat(page, /Kesepakatan sudah disetujui|Kiriman saya/);
    tandai('disetujui');
    await jeda(page, 3000);
  },

  async konfirmasi(page, tandai) {
    await masukSebagai(page, 'Imas');
    await ketuk(page, 'Periksa kiriman');
    tandai('periksa');
    await jeda(page, 1500);
    await ketuk(page, 'Terima semua');
    await ketuk(page, /^Konfirmasi terima .* kg/);
    tandai('dikonfirmasi');
    await jeda(page, 1500);
    await ketuk(page, '5 bintang');
    await ketuk(page, 'Kirim nilai');
    await lihat(page, /Terima kasih/);
    tandai('dana-cair');
    await jeda(page, 2500);
  },

  async deteksi(page, tandai) {
    await masukSebagai(page, 'Arif');
    await ketuk(page, /Sawi hijau · Rak hidroponik teras/);
    await ketuk(page, 'Lihat jadwal, modal, dan jurnal');
    await ketuk(page, page.locator('a[href$="/jurnal"]').locator('visible=true').first());
    await ketuk(page, 'Deteksi Gejala Tanaman (AI)');
    const modal = page.getByRole('dialog');
    await modal.waitFor({ state: 'visible', timeout: TUNGGU });
    const setuju = modal.locator('input[type="checkbox"]');
    if (await setuju.isVisible().catch(() => false)) {
      await setuju.tap();
      await ketuk(page, 'Saya Setuju & Mulai');
    }
    tandai('foto');
    await page.locator('input[type="file"]').setInputFiles(join(AKAR, 'frontend', 'public', 'foto', 'komoditas', 'bayam.webp'));
    await jeda(page, 1200);
    const catatan = page.locator('#catatan-gejala');
    if (await catatan.isVisible().catch(() => false)) {
      await catatan.tap();
      await page.keyboard.type('Bercak kuning di tepi daun', { delay: 60 });
    }
    // Hasil deteksi tidak direkam: di mode backend POST /deteksi menolak foto_base64
    // (backend meminta berkas_id), jadi hasil "dugaan" digambar di video.
    tandai('foto-siap');
    await jeda(page, 3000);
  },

  async chatbot(page, tandai) {
    await masukSebagai(page, 'Arif');
    const buka = page.locator('#tombol-buka-chatbot');
    await ketuk(page, buka);
    const panel = page.locator('#panel-chatbot');
    await panel.waitFor({ state: 'visible', timeout: TUNGGU });
    const setuju = panel.locator('input[type="checkbox"]');
    if (await setuju.isVisible().catch(() => false)) {
      await setuju.tap();
      await ketuk(page, 'Saya Setuju & Mulai Tanya');
    }
    tandai('tanya');
    await ketuk(page, /Kapan pupuk pertama sawi\?/);
    await jeda(page, 3500);
    tandai('jawaban');
    await jeda(page, 1500);
  },

  async chat(page, tandai) {
    await masukSebagai(page, 'Ratna');
    await page.goto(`${URL_DASAR}/pembeli/chat`);
    await lihat(page, 'Chat & Pesan');
    tandai('daftar');
    await jeda(page, 1000);
    const kontak = page.locator('button:has-text("Arif"), [role="button"]:has-text("Arif")').first();
    if (await kontak.isVisible().catch(() => false)) await ketuk(page, kontak);
    const masukan = page.locator('#masukan-pesan-chat');
    await masukan.waitFor({ state: 'visible', timeout: TUNGGU });
    await masukan.tap();
    tandai('ketik');
    await page.keyboard.type('Pak Arif, sawinya bisa dikirim besok pagi?', { delay: 45 });
    await masukan.press('Enter');
    tandai('terkirim');
    await jeda(page, 2500);
  },

  async cuaca(page, tandai) {
    await masukSebagai(page, 'Arif');
    const kartu = page.locator('#kartu-cuaca, section:has-text("Cuaca dan suhu")').first();
    await kartu.waitFor({ state: 'visible', timeout: TUNGGU });
    await kartu.evaluate((n) => n.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    tandai('cuaca');
    await jeda(page, 4000);
  },

  async peta(page, tandai) {
    await masukSebagai(page, 'Ratna');
    await page.goto(`${URL_DASAR}/pembeli/peta`);
    await lihat(page, 'Peta Petani Sekitar');
    tandai('peta');
    await jeda(page, 3000);
    const daftar = page.locator('button:has-text("Daftar")').first();
    if (await daftar.isVisible().catch(() => false)) await ketuk(page, daftar);
    tandai('daftar');
    await jeda(page, 2500);
  },

  async stok(page, tandai) {
    await masukSebagai(page, 'Ratna');
    await page.goto(`${URL_DASAR}/pembeli/stok`);
    await lihat(page, 'Stok Siap Jual di Sekitar Anda');
    tandai('stok');
    await jeda(page, 2000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await jeda(page, 2500);
  },

  async level(page, tandai) {
    await masukSebagai(page, 'Arif');
    await page.goto(`${URL_DASAR}/profil`);
    await lihat(page, /Level|Lencana/i);
    tandai('level');
    await jeda(page, 2000);
    await page.evaluate(() => window.scrollBy({ top: 360, behavior: 'smooth' }));
    tandai('lencana');
    await jeda(page, 3000);
  },
};

// ---------------------------------------------------------------- jalankan

const pilihan = nilai('--skenario', Object.keys(SKENARIO).join(',')).split(',');
const penanda = existsSync(BERKAS_PENANDA) ? JSON.parse(readFileSync(BERKAS_PENANDA, 'utf-8')) : {};
const browser = await chromium.launch({ executablePath, headless: true });

try {
  // Atur ulang data demo sekali di awal, di konteks tanpa rekaman.
  const awal = await browser.newContext();
  const p0 = await awal.newPage();
  await p0.goto(`${URL_DASAR}/akun-demo`);
  await tombol(p0, 'Atur ulang data demo').click();
  await p0.getByText('Data demo sudah dikembalikan').first().waitFor({ timeout: 60_000 });
  await awal.close();

  for (const nama of pilihan) {
    if (!SKENARIO[nama]) throw new Error(`Skenario tidak dikenal: ${nama}`);
    const folderTemp = join(FOLDER_TEMP, nama);
    rmSync(folderTemp, { recursive: true, force: true });
    const konteks = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36',
      // Playwright merekam layar seukuran viewport CSS (390×844) walau deviceScaleFactor 2.
      // Ukuran 780×1688 hanya menambah bantalan abu-abu di kanan dan bawah, jadi dipakai 390×844.
      recordVideo: { dir: folderTemp, size: { width: 390, height: 844 } },
    });
    const page = await konteks.newPage();
    const t0 = Date.now();
    await pasangTandaSentuh(page);
    const langkah = [];
    const tandai = (n) => langkah.push({ nama: n, detik: +((Date.now() - t0) / 1000).toFixed(2) });
    process.stdout.write(`Merekam ${nama}... `);
    try {
      await SKENARIO[nama](page, tandai);
    } catch (e) {
      await page.screenshot({ path: join(VIDEO, 'rekaman', `gagal-${nama}.png`) }).catch(() => {});
      console.log(`GAGAL: ${e.message.split('\n')[0]}`);
      await konteks.close();
      continue;
    }
    const durasi = +((Date.now() - t0) / 1000).toFixed(2);
    await konteks.close();
    const webm = readdirSync(folderTemp).find((f) => f.endsWith('.webm'));
    renameSync(join(folderTemp, webm), join(FOLDER, `hp-${nama}.webm`));
    penanda[nama] = { berkas: `rekaman/hp-${nama}.webm`, durasi, langkah };
    console.log(`selesai (${durasi} dtk, ${langkah.length} penanda)`);
  }
} finally {
  await browser.close();
  writeFileSync(BERKAS_PENANDA, JSON.stringify(penanda, null, 1) + '\n');
}
