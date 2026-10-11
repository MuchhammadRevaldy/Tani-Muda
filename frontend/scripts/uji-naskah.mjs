#!/usr/bin/env node
/**
 * Jalankan 10 langkah docs/naskah-demo.md di peramban sungguhan (Chrome/Edge terpasang,
 * playwright-core), diawali "Atur ulang data demo". Dipakai untuk mode tiruan maupun mode backend
 * (D-57: titik putus Kamis, dua kali dari atur ulang).
 *
 * Pemakaian:
 *   node scripts/uji-naskah.mjs [--url http://localhost:5173] [--ulang 2] [--layar <folder>] [--tampil]
 *
 * --ulang   jalankan seluruh naskah N kali, masing-masing diawali atur ulang (bawaan 1).
 * --layar   simpan tangkapan layar setiap langkah ke folder itu.
 * --tampil  jendela peramban terlihat (bawaan tanpa jendela).
 *
 * Mode backend juga mencatat setiap permintaan /api/v1 dan menandai jawaban 4xx/5xx yang tidak
 * diharapkan, supaya endpoint yang belum ada langsung terlihat.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const argumen = process.argv.slice(2);
const nilai = (nama, bawaan) => {
  const i = argumen.indexOf(nama);
  return i >= 0 ? argumen[i + 1] : bawaan;
};
const URL_DASAR = nilai('--url', 'http://localhost:5173').replace(/\/$/, '');
const ULANG = Number(nilai('--ulang', '1'));
const FOLDER_LAYAR = nilai('--layar', null);
const TAMPIL = argumen.includes('--tampil');

const executablePath = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]
  .filter(Boolean)
  .find((p) => existsSync(p));
if (!executablePath) {
  console.error('Chrome/Edge tidak ditemukan. Setel CHROME_PATH.');
  process.exit(1);
}
if (FOLDER_LAYAR) mkdirSync(FOLDER_LAYAR, { recursive: true });

const TUNGGU = 15_000;

/** Tombol atau tautan dengan nama yang cocok (teks persis atau pola). */
const tombol = (page, nama) =>
  page
    .getByRole('button', { name: nama })
    .or(page.getByRole('link', { name: nama }))
    .or(page.getByRole('radio', { name: nama }))
    .or(page.getByRole('tab', { name: nama }))
    .locator('visible=true')
    .first();

async function klik(page, nama) {
  const t = tombol(page, nama);
  await t.waitFor({ state: 'visible', timeout: TUNGGU });
  await t.click();
}

async function lihat(page, teks) {
  await page.getByText(teks).locator('visible=true').first().waitFor({ timeout: TUNGGU });
}

async function jalankanNaskah(browser, putaran, catatan) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const { galatApi, dipanggil } = catatan;
  page.on('response', (r) => {
    const u = new URL(r.url());
    if (!u.pathname.startsWith('/api/v1/')) return;
    const kunci = `${r.request().method()} ${u.pathname.replace(/\/[^/]*[0-9][^/]*$/, '/{id}')}`;
    dipanggil.set(kunci, (dipanggil.get(kunci) ?? 0) + 1);
    // 401 GET /akun wajar sebelum masuk.
    if (r.status() >= 400 && !(r.status() === 401 && u.pathname === '/api/v1/akun'))
      galatApi.push(`${r.status()} ${r.request().method()} ${u.pathname}`);
  });
  page.on('pageerror', (e) => galatApi.push(`galat halaman: ${e.message}`));

  let nomor = 0;
  const langkah = async (judul, kerja) => {
    nomor += 1;
    const mulai = Date.now();
    try {
      await kerja();
    } catch (e) {
      if (FOLDER_LAYAR)
        await page.screenshot({
          path: join(FOLDER_LAYAR, `${putaran}-gagal-${nomor}.png`),
          fullPage: true,
        });
      throw new Error(`Langkah ${judul} gagal: ${e.message.split('\n')[0]}`, { cause: e });
    }
    if (FOLDER_LAYAR)
      await page.screenshot({
        path: join(FOLDER_LAYAR, `${putaran}-${String(nomor).padStart(2, '0')}.png`),
      });
    console.log(`  ✓ ${judul} (${((Date.now() - mulai) / 1000).toFixed(1)} dtk)`);
  };

  await langkah('0. Atur ulang data demo', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Atur ulang data demo');
    await lihat(page, 'Data demo sudah dikembalikan');
  });
  await langkah('1. Halaman depan', async () => {
    await page.goto(`${URL_DASAR}/`);
    await lihat(page, 'Rp430.000');
    await lihat(page, 'Rp320.000');
  });
  await langkah('2. Masuk sebagai petani', async () => {
    await klik(page, 'Mulai sebagai petani');
    await page
      .getByLabel(/nomor HP/i)
      .first()
      .waitFor({ timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
  });
  await langkah('3. Beranda', async () => {
    await lihat(page, /hari ke-13/i);
    await lihat(page, /Tugas hari ini/i);
  });
  await langkah('4. Rencana dan modal', async () => {
    await klik(page, 'Buat siklus baru');
    await klik(page, /Sawi hijau/);
    await klik(page, 'Lanjut pilih metode');
    await page
      .getByLabel(/Luas lahan/)
      .first()
      .fill('20');
    await klik(page, 'Lanjut hitung modal');
    await lihat(page, /impas/i);
    await klik(page, 'Simpan rencana');
    await klik(page, /Kebun belakang rumah/);
    await klik(page, 'Hari ini');
    await klik(page, 'Simpan dan buat jadwal');
    await lihat(page, /Sawi hijau/);
  });
  await langkah('5. Jadwal dan pengukuran', async () => {
    await page.goto(`${URL_DASAR}/beranda`);
    await klik(page, /Sawi hijau · Rak hidroponik teras/);
    await klik(page, 'Lihat jadwal, modal, dan jurnal');
    await lihat(page, /Sawi hijau · Rak hidroponik teras/);
    await lihat(page, 'Cek pH dan PPM');
    await klik(page, 'Isi angka');
    await page.getByLabel('pH larutan').fill('6,2');
    await page.getByLabel('PPM (kepekatan nutrisi)').fill('600');
    await lihat(page, /PPM terlalu rendah/i);
    await klik(page, 'Simpan hasil');
  });
  await langkah('6. Mengambil pesanan', async () => {
    await klik(page, /^Pesanan/);
    await klik(page, /Kafe Daun Pagi/);
    // Desktop: kartu memilih pesanan, panel kanan membuka detailnya.
    const lihatPesanan = tombol(page, 'Lihat pesanan');
    if (await lihatPesanan.isVisible().catch(() => false)) await lihatPesanan.click();
    await lihat(page, /Lahanmu cukup/);
    await klik(page, /^Ambil .* kg/);
    await page.getByRole('checkbox').first().check();
    await klik(page, 'Setuju');
    await lihat(page, /Kesepakatan sudah disetujui|Kiriman saya/);
  });
  await langkah('7. Pindah ke pembeli', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Imas');
    await lihat(page, 'Periksa kiriman');
  });
  await langkah('8. Membuat pesanan dan membayar uang muka', async () => {
    await klik(page, 'Buat pesanan');
    await klik(page, /Sawi hijau/);
    await page.getByLabel('Jumlah per kiriman').fill('10');
    await page.getByLabel(/Harga per kg/).fill('5000');
    await klik(page, /^Lanjut bayar Rp/);
    await klik(page, 'Berhasil');
    await klik(page, /^Bayar Rp/);
    await lihat(page, 'Uang muka sudah masuk');
  });
  await langkah('9. Konfirmasi kiriman', async () => {
    await klik(page, /Pesanan aktif/);
    await klik(page, 'Periksa kiriman');
    await klik(page, 'Terima semua');
    await klik(page, /^Konfirmasi terima .* kg/);
    await klik(page, '5 bintang');
    await klik(page, 'Kirim nilai');
    await lihat(page, /Terima kasih. Anda memberi 5 bintang/);
  });
  await langkah('10. Penutup', async () => {
    await klik(page, /Pesanan aktif/);
    await klik(page, /^Pembayaran/);
    await lihat(page, /Ref\. /);
  });
  await page.close();
}

const browser = await chromium.launch({ executablePath, headless: !TAMPIL });
let gagal = false;
try {
  for (let i = 1; i <= ULANG; i++) {
    console.log(`Putaran ${i} (${URL_DASAR})`);
    const catatan = { galatApi: [], dipanggil: new Map() };
    try {
      await jalankanNaskah(browser, i, catatan);
    } catch (e) {
      gagal = true;
      console.error(`  ✗ ${e.message}`);
    }
    if (catatan.dipanggil.size) {
      console.log(`  Endpoint dipanggil (${catatan.dipanggil.size}):`);
      for (const [k, n] of [...catatan.dipanggil].sort()) console.log(`    ${k} ×${n}`);
    }
    if (catatan.galatApi.length) {
      console.log('  Jawaban galat selama naskah:');
      for (const g of [...new Set(catatan.galatApi)]) console.log(`    ${g}`);
    }
  }
} finally {
  await browser.close();
}
process.exit(gagal ? 1 : 0);
