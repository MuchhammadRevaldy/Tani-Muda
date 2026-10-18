#!/usr/bin/env node
/* global document, window -- dipakai di dalam page.evaluate / addInitScript (berjalan di browser) */
/**
 * Jalankan docs/naskah-demo.md di peramban sungguhan (Chrome/Edge terpasang, playwright-core),
 * diawali "Atur ulang data demo". Dipakai untuk mode tiruan maupun mode backend (D-57, [AG-11]).
 *
 * Pemakaian:
 *   npm run uji:naskah -- [--url http://localhost:4174] [--ulang 15] [--skenario naskah]
 *                         [--catatan <folder>] [--layar] [--dingin] [--tampil] [--lebar 390]
 *
 * --skenario  naskah (bawaan), daftar-petani, daftar-pembeli, verifikasi-pembeli, akun-pembeli,
 *             stok-cod, chat, chat-nomor, navigasi-pembeli-hp, atau semua (berurutan per putaran).
 * --ulang     jalankan N putaran, masing-masing diawali atur ulang (bawaan 1).
 * --catatan   folder diagnosis. Saat langkah gagal: tangkapan layar seluruh halaman, isi DOM,
 *             tombol dan tautan yang terlihat, log konsol, dan waktu setiap permintaan API.
 *             Juga ringkasan.json berisi waktu tiap langkah di setiap putaran.
 * --layar     simpan juga tangkapan layar setiap langkah yang berhasil.
 * --dingin    proses Chrome baru di setiap putaran (bawaan: konteks baru, cache tetap kosong).
 * --tampil    jendela peramban terlihat.
 * --lebar     lebar layar dalam px (bawaan 1440; 390 untuk tampilan HP, tinggi 844).
 * --tanpa-animasi  emulasi prefers-reduced-motion: reduce (pembanding waktu dengan animasi, D-61).
 * --layar-hp  dengan --layar: setelah tiap langkah, buka alamat yang sama di peramban kedua selebar
 *             390px dengan cookie yang sama, lalu potret seluruh halaman. Keadaan sama hanya di mode
 *             backend (data di server); di mode tiruan data ada di peramban masing-masing.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const argumen = process.argv.slice(2);
const nilai = (nama, bawaan) => {
  const i = argumen.indexOf(nama);
  return i >= 0 ? argumen[i + 1] : bawaan;
};
const URL_DASAR = nilai('--url', 'http://localhost:5173').replace(/\/$/, '');
const ULANG = Number(nilai('--ulang', '1'));
const FOLDER = nilai('--catatan', null) ?? nilai('--layar', null);
const LAYAR_SEMUA = argumen.includes('--layar');
const DINGIN = argumen.includes('--dingin');
const TAMPIL = argumen.includes('--tampil');
const REKAM = argumen.includes('--rekam');
const PILIH_SKENARIO = nilai('--skenario', REKAM ? 'semua-rekam' : 'naskah');
const LEBAR = Number(nilai('--lebar', '1440'));
const LAYAR_HP = argumen.includes('--layar-hp');
const TANPA_ANIMASI = argumen.includes('--tanpa-animasi');
/** Opsi konteks peramban bersama: gerak dikurangi bila --tanpa-animasi. */
const GERAK = TANPA_ANIMASI ? { reducedMotion: 'reduce' } : {};

const FOLDER_REKAM = nilai('--folder-rekam', join(__dirname, '..', '..', 'video', 'rekaman'));
const FOLDER_PUBLIC_REKAM = join(__dirname, '..', '..', 'video', 'public', 'rekaman');
const FOLDER_REKAM_TEMP = join(FOLDER_REKAM, '.temp');

if (REKAM) {
  mkdirSync(FOLDER_REKAM, { recursive: true });
  mkdirSync(FOLDER_PUBLIC_REKAM, { recursive: true });
  mkdirSync(FOLDER_REKAM_TEMP, { recursive: true });
}

const BERKAS_SKENARIO_REKAM = {
  'rekam-hitung': '04-hitung',
  'rekam-rawat': '05-rawat',
  'rekam-jual': '06-jual',
  'rekam-deteksi': '07-deteksi',
  'rekam-chatbot': '07-chatbot',
  'rekam-cuaca': '07-cuaca',
  'rekam-peta': '07-peta',
  'rekam-stok': '07-stok',
  'rekam-chat': '07-chat',
  'rekam-level': '08-level',
};

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
if (FOLDER) mkdirSync(FOLDER, { recursive: true });

const TUNGGU = 15_000;

/** Tombol, tautan, radio, atau tab terlihat dengan nama yang cocok (teks atau pola). */
const tombol = (page, nama) =>
  page
    .getByRole('button', { name: nama })
    .or(page.getByRole('link', { name: nama }))
    .or(page.getByRole('radio', { name: nama }))
    .or(page.getByRole('tab', { name: nama }))
    .locator('visible=true')
    .first();

/**
 * Tunggu animasi CSS yang sedang berjalan pada elemen target atau leluhurnya (mis. masuk halaman,
 * kartu bertahap, muncul saat digulir) supaya klik tidak mendarat di posisi yang masih bergerak
 * (D-61). Animasi berulang tanpa akhir diabaikan; paling lama 2 detik.
 */
async function tungguAnimasi(locator) {
  await locator
    .evaluate(async (el) => {
      const berjalan = document.getAnimations().filter((a) => {
        const sasaran = a.effect && a.effect.target;
        if (!sasaran || a.playState === 'finished') return false;
        if (a.effect.getComputedTiming().iterations === Infinity) return false;
        return sasaran === el || (sasaran.contains && sasaran.contains(el));
      });
      if (!berjalan.length) return;
      await Promise.race([
        Promise.all(berjalan.map((a) => a.finished.catch(() => undefined))),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
    })
    .catch(() => undefined);
}

/** Suntikkan penunjuk kursor dan efek klik yang terlihat natural saat perekaman video. */
async function pasangKursorRekaman(page) {
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('penunjuk-kursor-rekaman')) return;
      const kursor = document.createElement('div');
      kursor.id = 'penunjuk-kursor-rekaman';
      kursor.style.cssText = `
        position: fixed;
        top: -100px;
        left: -100px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(34, 197, 94, 0.9);
        border: 2.5px solid #ffffff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        pointer-events: none;
        z-index: 2147483647;
        transform: translate(-50%, -50%);
        transition: transform 0.08s ease-out, background 0.15s ease;
      `;
      document.body.appendChild(kursor);

      window.addEventListener('mousemove', (e) => {
        kursor.style.left = e.clientX + 'px';
        kursor.style.top = e.clientY + 'px';
      });

      window.addEventListener('mousedown', (e) => {
        kursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        kursor.style.background = 'rgba(234, 179, 8, 0.95)';
        const riak = document.createElement('div');
        riak.style.cssText = `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #22c55e;
          pointer-events: none;
          z-index: 2147483646;
          transform: translate(-50%, -50%) scale(1);
          animation: anim-riak 0.45s ease-out forwards;
        `;
        document.body.appendChild(riak);
        setTimeout(() => riak.remove(), 500);
      });

      window.addEventListener('mouseup', () => {
        kursor.style.transform = 'translate(-50%, -50%) scale(1)';
        kursor.style.background = 'rgba(34, 197, 94, 0.9)';
      });

      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes anim-riak {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    });
  });
}

async function klik(page, nama) {
  const t = tombol(page, nama);
  await t.waitFor({ state: 'visible', timeout: TUNGGU });
  await tungguAnimasi(t);
  if (REKAM) {
    const box = await t.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await page.waitForTimeout(150);
    }
  }
  await t.click({ timeout: TUNGGU });
  if (REKAM) {
    await page.waitForTimeout(400);
  }
}

async function lihat(page, teks) {
  await page.getByText(teks).locator('visible=true').first().waitFor({ timeout: TUNGGU });
}

async function aturUlang(page) {
  await page.goto(`${URL_DASAR}/akun-demo`);
  await klik(page, 'Atur ulang data demo');
  await lihat(page, 'Data demo sudah dikembalikan');
}

/** Periksa setiap gambar di halaman berhasil dimuat tanpa gambar rusak (AG-35). */
async function periksaSemuaGambarUtuh(page) {
  const rusak = await page.evaluate(async () => {
    const gambar = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      gambar.map((img) => {
        if (img.complete) return;
        return new Promise((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
          setTimeout(resolve, 3000);
        });
      }),
    );
    return gambar
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.src || img.getAttribute('src') || '<tanpa-src>');
  });
  if (rusak.length > 0) {
    throw new Error(`Ditemukan ${rusak.length} gambar gagal dimuat (rusak): ${rusak.join(', ')}`);
  }
}

// ---------------------------------------------------------------- skenario

/** docs/naskah-demo.md, 10 langkah. */
async function naskah(page, langkah) {
  await langkah('0. Atur ulang data demo', () => aturUlang(page));
  await langkah('1. Halaman depan', async () => {
    await page.goto(`${URL_DASAR}/`);
    await lihat(page, 'Rp430.000');
    await lihat(page, 'Rp320.000');
  });
  await langkah('2. Daftar petani baru, lalu masuk sebagai Arif', async () => {
    await klik(page, 'Mulai sebagai petani');
    await page
      .getByLabel(/nomor HP/i)
      .first()
      .waitFor({ timeout: TUNGGU });
    await masukNomorBaru(page, NOMOR_PETANI_BARU);
    await pilihPeranPetani(page);
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
    // Tersimpan bila halaman pindah ke Beranda dengan siklus barunya terpilih.
    await page.waitForURL(/\/beranda\?siklus=/, { timeout: TUNGGU });
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
    await lihat(page, 'Hasil ukur tersimpan.');
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
}

/** Nomor fiktif untuk daftar akun baru; sama dengan docs/naskah-demo.md langkah 2. */
export const NOMOR_PETANI_BARU = '0857 0000 1001';
const NOMOR_PEMBELI_BARU = '0857 0000 2001';

/** Masuk dengan nomor belum terdaftar: kode dari panel Kode uji, lalu setuju privasi. */
async function masukNomorBaru(page, nomor) {
  await page.goto(`${URL_DASAR}/masuk`);
  await page.getByLabel('Nomor HP').fill(nomor);
  await klik(page, 'Kirim kode');
  const panel = page.getByText(/Kode uji: \d{6}/).first();
  await panel.waitFor({ timeout: TUNGGU });
  const kode = (await panel.textContent()).match(/\d{6}/)[0];
  await page.getByLabel('Angka ke-1').click();
  await page.keyboard.type(kode);
  await klik(page, 'Masuk');
  await lihat(page, 'Nomor ini belum punya akun');
  await page.getByLabel('Saya setuju dengan kebijakan privasi Tani Muda').check();
  await klik(page, 'Masuk');
  await page.getByRole('heading', { name: 'Lengkapi akun' }).waitFor({ timeout: TUNGGU });
}

async function pilihWilayahKlaten(page, prefix) {
  const kab = page.locator(`#${prefix}-kabupaten-tombol`);
  await kab.waitFor({ state: 'visible', timeout: TUNGGU });
  await kab.click();
  const inputCari = page.getByPlaceholder(/Cari /i).first();
  if (await inputCari.isVisible().catch(() => false)) {
    await inputCari.fill('Klaten');
  }
  await page.getByRole('option', { name: /Klaten/i }).first().click();

  const kec = page.locator(`#${prefix}-kecamatan-tombol`);
  await kec.waitFor({ state: 'visible', timeout: TUNGGU });
  await kec.click();
  if (await inputCari.isVisible().catch(() => false)) {
    await inputCari.fill('Delanggu');
  }
  await page.getByRole('option', { name: /Delanggu/i }).first().click();

  const desa = page.locator(`#${prefix}-desa-tombol`);
  await desa.waitFor({ state: 'visible', timeout: TUNGGU });
  await desa.click();
  if (await inputCari.isVisible().catch(() => false)) {
    await inputCari.fill('Delanggu');
  }
  await page.getByRole('option', { name: /Delanggu/i }).first().click();
}

/** Lengkapi akun sebagai petani di desa pilot (nama dan desa sama dengan naskah demo). */
async function pilihPeranPetani(page) {
  await klik(page, /^Petani/);
  await page.getByLabel('Nama lengkap').fill('Rina Agustina');
  await pilihWilayahKlaten(page, 'pilih-desa-petani');
  await klik(page, 'Simpan dan lanjut');
  await lihat(page, 'Mulai siklus tanam pertamamu');
}

/** Daftar petani baru sampai siklus pertama (T4.33, T4.34, T4.36a). */
async function daftarPetani(page, langkah) {
  await langkah('0. Atur ulang data demo', () => aturUlang(page));
  await langkah('1. Masuk dengan nomor baru dan setuju privasi', () =>
    masukNomorBaru(page, NOMOR_PETANI_BARU),
  );
  await langkah('2. Pilih peran petani dan desa', () => pilihPeranPetani(page));
  await langkah('3. Tambah lahan', async () => {
    await page.goto(`${URL_DASAR}/lahan`);
    await lihat(page, 'Belum ada lahan. Tambah lahan pertamamu.');
    // Petani tanpa lahan langsung melihat formulirnya; tombol hanya bila formulir belum terbuka.
    if (!(await page.getByLabel('Nama lahan').isVisible())) await klik(page, 'Tambah lahan');
    await page.getByLabel('Nama lahan').fill('Kebun Rina');
    await page.getByLabel('Luas lahan').fill('50');
    await klik(page, 'Simpan lahan');
    await lihat(page, 'Kebun Rina');
  });
  await langkah('4. Buat siklus pertama', async () => {
    await page.goto(`${URL_DASAR}/beranda`);
    await klik(page, 'Mulai siklus tanam');
    await klik(page, /Sawi hijau/);
    await klik(page, 'Lanjut pilih metode');
    await page
      .getByLabel(/Luas lahan/)
      .first()
      .fill('20');
    await klik(page, 'Lanjut hitung modal');
    await klik(page, 'Simpan rencana');
    await klik(page, /Kebun Rina/);
    await klik(page, 'Hari ini');
    await klik(page, 'Simpan dan buat jadwal');
    await page.waitForURL(/\/beranda\?siklus=/, { timeout: TUNGGU });
    await lihat(page, /hari ke-0/i);
  });
}

/** Daftar pembeli baru sampai data usaha menunggu verifikasi (T4.28, T4.33, T4.34). */
async function daftarPembeli(page, langkah) {
  await langkah('0. Atur ulang data demo', () => aturUlang(page));
  await langkah('1. Masuk dengan nomor baru dan setuju privasi', () =>
    masukNomorBaru(page, NOMOR_PEMBELI_BARU),
  );
  await langkah('2. Pilih peran pembeli', async () => {
    await klik(page, /^Pembeli/);
    await page.getByLabel('Nama lengkap').fill('Dina Lestari');
    await klik(page, 'Simpan dan lanjut');
    await page.waitForURL(/\/pembeli\/daftar/, { timeout: TUNGGU });
  });
  await langkah('3. Data usaha', async () => {
    await page.getByLabel('Nama usaha').fill('Warung Dina');
    await page.getByLabel('Alamat tempat usaha').fill('Jl. Raya Delanggu 12');
    await pilihWilayahKlaten(page, 'pembeli-wilayah');
    await klik(page, 'Kirim untuk diperiksa');
    await page.getByRole('region', { name: 'Menunggu verifikasi' }).waitFor({ timeout: TUNGGU });
  });
}

/** Pembeli baru diverifikasi admin lewat /admin, lalu bisa memasang pesanan (P0-02, kontrak 3.10). */
async function verifikasiPembeli(page, langkah) {
  await daftarPembeli(page, langkah);
  await langkah('4. Admin memverifikasi', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Admin');
    // Pemilih akun mengarahkan ke halaman awal peran; tunggu supaya permintaan masuk selesai.
    await page.waitForURL(/\/admin/, { timeout: TUNGGU });
    await klik(page, 'Setujui Warung Dina');
    await lihat(page, 'Warung Dina sudah terverifikasi.');
  });
}

/** Menu akun pembeli → Profil → Ubah profil (ganti nama) → Keluar → /masuk ([AG-23]). */
async function akunPembeli(page, langkah) {
  await langkah('0. Atur ulang data demo', () => aturUlang(page));
  await langkah('1. Masuk sebagai pembeli', async () => {
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
  });
  await langkah('2. Menu akun lalu Profil', async () => {
    await klik(page, /^Menu akun/);
    await page.getByRole('menuitem', { name: 'Profil' }).click({ timeout: TUNGGU });
    await page.waitForURL(/\/pembeli\/profil$/, { timeout: TUNGGU });
    await lihat(page, 'Data usaha');
  });
  await langkah('3. Ubah profil: ganti nama', async () => {
    await klik(page, 'Ubah profil');
    await page.waitForURL(/\/pembeli\/profil\/ubah/, { timeout: TUNGGU });
    await page.getByLabel('Nama lengkap').fill('Ratna Kusuma Uji');
    await klik(page, 'Simpan perubahan');
    await page.waitForURL(/\/pembeli\/profil$/, { timeout: TUNGGU });
    await lihat(page, 'Ratna Kusuma Uji');
  });
  await langkah('4. Keluar lewat menu akun', async () => {
    await klik(page, /^Menu akun/);
    await page.getByRole('menuitem', { name: 'Keluar' }).click({ timeout: TUNGGU });
    await page.waitForURL(/\/masuk/, { timeout: TUNGGU });
  });
}

/** Transaksi stok siap jual dan bayar di tempat (COD) sampai selesai ([AG-31], F-07). */
async function stokCod(page, langkah) {
  await langkah('0. Atur ulang data demo', () => aturUlang(page));
  await langkah('1. Petani menambah stok siap jual', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/stok`);
    await lihat(page, 'Stok Siap Jual');
    const tombolTambah = page.locator('#tombol-buka-form-stok');
    await tombolTambah.waitFor({ state: 'visible', timeout: TUNGGU });
    await tombolTambah.click();
    const inputJumlah = page.locator('#jumlah-stok');
    await inputJumlah.waitFor({ state: 'visible', timeout: TUNGGU });
    await inputJumlah.fill('20');
    await page.locator('#harga-stok').fill('12000');
    await klik(page, /Simpan dan jual/i);
    await lihat(page, 'Stok siap jual berhasil ditambahkan');
  });
  await langkah('2. Pembeli membeli stok dengan COD', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/pembeli/stok`);
    await lihat(page, 'Stok Siap Jual di Sekitar Anda');
    await klik(page, /Beli panen ini/i);
    await page.locator('#beli-kg').fill('5');
    await page.locator('#beli-alamat').fill('Jl. Cikahuripan No. 12, Lembang');
    const tombolPesan = page.locator('#tombol-pasang-pesanan');
    await tombolPesan.waitFor({ state: 'visible', timeout: TUNGGU });
    await tombolPesan.click({ timeout: TUNGGU });
    await lihat(page, /Pesanan COD berhasil dibuat/);
  });
  await langkah('3. Petani menerima dan mengirim pesanan', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/stok`);
    await klik(page, /Pesanan masuk/i);
    await klik(page, 'Terima');
    await klik(page, /Tandai dikirim/i);
    await lihat(page, /Menunggu konfirmasi penerimaan oleh pembeli/);
  });
  await langkah('4. Pembeli konfirmasi terima dan selesai', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/pembeli/stok`);
    await klik(page, /Pesanan Saya/i);
    await klik(page, /Konfirmasi diterima dan selesai/i);
    await lihat(page, /Transaksi selesai/i);
  });
}

/** Percakapan petani dan pembeli diawali dari titik peta ([AG-31], F-08, F-09). */
async function skenarioChat(page, langkah) {
  await langkah('0. Atur ulang data demo', () => aturUlang(page));
  await langkah('1. Pembeli membuka chat dari titik peta sekitar', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/pembeli/peta`);
    await lihat(page, 'Peta Petani Sekitar');
    await klik(page, /^Daftar/);
    await klik(page, 'Tanya lewat Chat');
    await page.waitForURL(/\/chat\?tujuan=/, { timeout: TUNGGU });
  });
  await langkah('2. Pembeli mengirim pesan pertama', async () => {
    await lihat(page, 'Chat & Pesan');
    const masukan = page.locator('#masukan-pesan-chat');
    await masukan.waitFor({ state: 'visible', timeout: TUNGGU });
    await masukan.fill('Halo Pak Arif, apakah stok sayur bisa diantar hari ini?');
    await masukan.press('Enter');
    await lihat(page, 'Halo Pak Arif, apakah stok sayur bisa diantar hari ini?');
  });
  await langkah('3. Petani membuka percakapan dan membalas', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/chat`);
    await lihat(page, 'Chat & Pesan');
    await klik(page, /Ratna Kusuma/);
    await page.waitForURL(/\/chat\?id=/, { timeout: TUNGGU });
    await lihat(page, /apakah stok sayur bisa diantar hari ini\?/);
    const masukan = page.locator('#masukan-pesan-chat');
    await masukan.waitFor({ state: 'visible', timeout: TUNGGU });
    await masukan.fill('Halo Bu Ratna, bisa sekali, siap kami siapkan sekarang.');
    await masukan.press('Enter');
    await lihat(page, 'Halo Bu Ratna, bisa sekali, siap kami siapkan sekarang.');
  });
}

/** Percakapan via nomor HP petani demo ([AG-34], butir 10). */
async function chatNomor(page, langkah) {
  await langkah('0. Atur ulang data demo', () => aturUlang(page));
  await langkah('1. Pembeli membuka chat lewat nomor HP', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/pembeli/chat`);
    await lihat(page, 'Chat & Pesan');
    const tombolModal = page.locator('#tombol-chat-nomor-hp');
    await tombolModal.waitFor({ state: 'visible', timeout: TUNGGU });
    await tombolModal.click();
    const masukanNomor = page.locator('#masukan-nomor-hp-chat');
    await masukanNomor.waitFor({ state: 'visible', timeout: TUNGGU });
    await masukanNomor.fill('+6281200000001');
    const tombolBuka = page.locator('#tombol-kirim-buka-nomor');
    await tombolBuka.waitFor({ state: 'visible', timeout: TUNGGU });
    await tombolBuka.click();
    await page.waitForURL(/\/pembeli\/chat\?id=/, { timeout: TUNGGU });
  });
  await langkah('2. Pembeli mengirim pesan', async () => {
    await lihat(page, 'Chat & Pesan');
    const masukanPesan = page.locator('#masukan-pesan-chat');
    await masukanPesan.waitFor({ state: 'visible', timeout: TUNGGU });
    await masukanPesan.fill('Halo Pak Arif, apakah ada panen sawi segar hari ini?');
    await masukanPesan.press('Enter');
    await lihat(page, 'Halo Pak Arif, apakah ada panen sawi segar hari ini?');
  });
  await langkah('3. Petani melihat pesan dan membalas', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/chat`);
    await lihat(page, 'Chat & Pesan');
    await klik(page, /Ratna Kusuma/);
    await page.waitForURL(/\/chat\?id=/, { timeout: TUNGGU });
    await lihat(page, /apakah ada panen sawi segar hari ini\?/);
    const masukanPesan = page.locator('#masukan-pesan-chat');
    await masukanPesan.waitFor({ state: 'visible', timeout: TUNGGU });
    await masukanPesan.fill('Halo Bu Ratna, ada panen sawi baru saja dipetik.');
    await masukanPesan.press('Enter');
    await lihat(page, 'Halo Bu Ratna, ada panen sawi baru saja dipetik.');
  });
}

/** Navigasi pembeli di HP selebar 390px ([AG-34], butir 10). */
async function navigasiPembeliHp(page, langkah) {
  await langkah('0. Atur ukuran layar HP dan data demo', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await aturUlang(page);
  });
  await langkah('1. Masuk sebagai pembeli di HP', async () => {
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    const kapsul = page.locator('#navigasi-bawah-pembeli');
    await kapsul.waitFor({ state: 'visible', timeout: TUNGGU });
  });
  await langkah('2. Berpindah antar menu 4 tab', async () => {
    const tabStok = page.locator('#navigasi-bawah-pembeli a[href="/pembeli/stok"]');
    await tabStok.click();
    await page.waitForURL(/\/pembeli\/stok/, { timeout: TUNGGU });
    await lihat(page, 'Stok Siap Jual di Sekitar Anda');

    const tabPeta = page.locator('#navigasi-bawah-pembeli a[href="/pembeli/peta"]');
    await tabPeta.click();
    await page.waitForURL(/\/pembeli\/peta/, { timeout: TUNGGU });
    await lihat(page, 'Peta Petani Sekitar');
    await page.locator('#kartu-lokasi-pembeli').waitFor({ state: 'visible', timeout: TUNGGU });
    await lihat(page, /Lokasimu sekarang: Desa /);
    await lihat(page, /Sumber lokasi:/);
    await page.locator('#tombol-perbarui-lokasi').waitFor({ state: 'visible', timeout: TUNGGU });

    const tabChat = page.locator('#navigasi-bawah-pembeli a[href="/pembeli/chat"]');
    await tabChat.click();
    await page.waitForURL(/\/pembeli\/chat/, { timeout: TUNGGU });
    await lihat(page, 'Chat & Pesan');

    const tabPesanan = page.locator('#navigasi-bawah-pembeli a[href="/pembeli"]');
    await tabPesanan.click();
    await page.waitForURL(/\/pembeli(\/)?$/, { timeout: TUNGGU });
  });
  await langkah('3. Buka dropdown akun pembeli', async () => {
    const tombolMenuAkun = page.locator('#tombol-menu-akun-pembeli');
    await tombolMenuAkun.waitFor({ state: 'visible', timeout: TUNGGU });
    await tombolMenuAkun.click();
    await page.getByRole('menuitem', { name: 'Profil' }).waitFor({ state: 'visible', timeout: TUNGGU });
    await page.getByRole('menuitem', { name: 'Riwayat' }).waitFor({ state: 'visible', timeout: TUNGGU });
    await page.getByRole('menuitem', { name: 'Keluar' }).waitFor({ state: 'visible', timeout: TUNGGU });
  });
  await langkah('4. Chatbot di 390px (buka, ketik halo, ketuk contoh pertanyaan, tutup)', async () => {
    const tombolChatbot = page.locator('#tombol-buka-chatbot');
    const adaChatbot = await tombolChatbot.isVisible().catch(() => false);
    if (!adaChatbot) {
      await page.setViewportSize({ width: LEBAR, height: LEBAR === 390 ? 844 : 900 });
      return;
    }
    await tombolChatbot.click();

    const panel = page.locator('#panel-chatbot');
    await panel.waitFor({ state: 'visible', timeout: TUNGGU });

    const centang = panel.locator('input[type="checkbox"]');
    if (await centang.isVisible()) {
      await centang.check();
      await klik(page, 'Saya Setuju & Mulai Tanya');
    }

    const input = page.locator('#input-chatbot');
    await input.waitFor({ state: 'visible', timeout: TUNGGU });
    await input.fill('halo');
    await page.locator('#tombol-kirim-chatbot').click();
    await lihat(page, /Halo! Senang bisa menyapa Anda/);

    await klik(page, /Kapan pupuk pertama sawi\?/);
    await lihat(page, /Kapan pupuk pertama sawi\?/);
    await page.waitForTimeout(600);

    const tombolTutup = page.locator('#tombol-tutup-chatbot');
    await tombolTutup.waitFor({ state: 'visible', timeout: TUNGGU });
    await tombolTutup.click();
    await panel.waitFor({ state: 'hidden', timeout: TUNGGU });

    await page.setViewportSize({ width: LEBAR, height: LEBAR === 390 ? 844 : 900 });
  });
}

// ---------------------------------------------------------------- skenario rekaman teaser

async function rekamHitung(page, langkah) {
  await langkah('1. Masuk sebagai Arif & buka Beranda', async () => {
    await aturUlang(page);
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.waitForTimeout(800);
  });
  await langkah('2. Buka kalkulator rencana dan pilih sawi hijau', async () => {
    await klik(page, 'Buat siklus baru');
    await page.waitForTimeout(600);
    await klik(page, /Sawi hijau/);
    await page.waitForTimeout(600);
    await klik(page, 'Lanjut pilih metode');
  });
  await langkah('3. Tentukan luas lahan dan hitung modal', async () => {
    const inputLuas = page.getByLabel(/Luas lahan/).first();
    await inputLuas.fill('20');
    await page.waitForTimeout(600);
    await klik(page, 'Lanjut hitung modal');
    await lihat(page, /impas/i);
    await page.waitForTimeout(1500);
  });
  await langkah('4. Simpan rencana tanam ke jadwal', async () => {
    await klik(page, 'Simpan rencana');
    await page.waitForTimeout(400);
    await klik(page, /Kebun belakang rumah/);
    await page.waitForTimeout(400);
    await klik(page, 'Hari ini');
    await page.waitForTimeout(400);
    await klik(page, 'Simpan dan buat jadwal');
    await page.waitForURL(/\/beranda\?siklus=/, { timeout: TUNGGU });
    await page.waitForTimeout(1200);
  });
}

async function rekamRawat(page, langkah) {
  await langkah('1. Masuk dan buka Beranda', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.waitForTimeout(800);
  });
  await langkah('2. Cek penggaris umur dan selesaikan tugas harian', async () => {
    await lihat(page, /hari ke-13/i);
    await page.mouse.move(500, 240, { steps: 10 });
    await page.waitForTimeout(1000);
    const ceklis = page.locator('input[type="checkbox"]').first();
    if (await ceklis.isVisible().catch(() => false)) {
      await ceklis.click();
      await page.waitForTimeout(800);
    }
  });
  await langkah('3. Buka detail siklus dan fitur ukur pH PPM', async () => {
    await klik(page, /Sawi hijau · Rak hidroponik teras/);
    await klik(page, 'Lihat jadwal, modal, dan jurnal');
    await lihat(page, 'Cek pH dan PPM');
    await klik(page, 'Isi angka');
    await page.waitForTimeout(600);
  });
  await langkah('4. Isi angka sensor dan lihat rekomendasi nutrisi instan', async () => {
    await page.getByLabel('pH larutan').fill('6,2');
    await page.waitForTimeout(400);
    await page.getByLabel('PPM (kepekatan nutrisi)').fill('600');
    await lihat(page, /PPM terlalu rendah/i);
    await page.waitForTimeout(1200);
    await klik(page, 'Simpan hasil');
    await lihat(page, 'Hasil ukur tersimpan.');
    await page.waitForTimeout(1200);
  });
}

async function rekamJual(page, langkah) {
  await langkah('1. Masuk sebagai pembeli (Imas) dan buat pesanan ber-DP', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Imas');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await klik(page, 'Buat pesanan');
    await klik(page, /Sawi hijau/);
    await page.getByLabel('Jumlah per kiriman').fill('10');
    await page.getByLabel(/Harga per kg/).fill('5000');
    await page.waitForTimeout(500);
    await klik(page, /^Lanjut bayar Rp/);
    await klik(page, 'Berhasil');
    await page.waitForTimeout(500);
    await klik(page, /^Bayar Rp/);
    await lihat(page, 'Uang muka sudah masuk');
    await page.waitForTimeout(1000);
  });
  await langkah('2. Masuk sebagai petani (Arif) dan terima kesepakatan pesanan', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await klik(page, /^Pesanan/);
    await klik(page, /Kafe Daun Pagi/);
    const lihatPesanan = tombol(page, 'Lihat pesanan');
    if (await lihatPesanan.isVisible().catch(() => false)) await lihatPesanan.click();
    await page.waitForTimeout(500);
    await klik(page, /^Ambil .* kg/);
    await page.getByRole('checkbox').first().check();
    await page.waitForTimeout(400);
    await klik(page, 'Setuju');
    await lihat(page, /Kesepakatan sudah disetujui|Kiriman saya/);
    await page.waitForTimeout(1000);
  });
  await langkah('3. Pembeli konfirmasi terima kiriman dan beri bintang 5', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Imas');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await klik(page, /Pesanan aktif/);
    await klik(page, 'Periksa kiriman');
    await page.waitForTimeout(500);
    await klik(page, 'Terima semua');
    await page.waitForTimeout(500);
    await klik(page, /^Konfirmasi terima .* kg/);
    await page.waitForTimeout(500);
    await klik(page, '5 bintang');
    await page.waitForTimeout(400);
    await klik(page, 'Kirim nilai');
    await lihat(page, /Terima kasih. Anda memberi 5 bintang/);
    await page.waitForTimeout(1200);
  });
  await langkah('4. Periksa riwayat pembayaran dan kepastian dana', async () => {
    await klik(page, /Pesanan aktif/);
    await klik(page, /^Pembayaran/);
    await lihat(page, /Ref\. /);
    await page.waitForTimeout(1200);
  });
}

async function rekamDeteksi(page, langkah) {
  await langkah('1. Masuk sebagai Arif & buka Jurnal Tanaman', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await klik(page, /Sawi hijau · Rak hidroponik teras/);
    await klik(page, 'Lihat jadwal, modal, dan jurnal');
    await page
      .locator(
        'nav[aria-label="Bagian siklus kebun"] a[href$="/jurnal"], a:has-text("Jurnal"), button:has-text("Jurnal")',
      )
      .first()
      .click();
    await lihat(page, 'Deteksi Gejala Tanaman (AI)');
    await page.waitForTimeout(600);
  });
  await langkah('2. Buka modal deteksi tanaman AI dan setujui fitur', async () => {
    await klik(page, 'Deteksi Gejala Tanaman (AI)');
    const modal = page.getByRole('dialog');
    await modal.waitFor({ state: 'visible', timeout: TUNGGU });
    const centang = modal.locator('input[type="checkbox"]');
    if (await centang.isVisible().catch(() => false)) {
      await centang.check();
      await page.waitForTimeout(400);
      await klik(page, 'Saya Setuju & Mulai');
      await page.waitForTimeout(600);
    }
  });
  await langkah('3. Unggah foto daun dan lakukan analisis AI', async () => {
    const inputFoto = page.locator('input[type="file"]');
    const fotoPath = join(__dirname, '..', 'public', 'foto', 'komoditas', 'sawi.webp');
    await inputFoto.setInputFiles(fotoPath);
    await page.waitForTimeout(600);
    const textarea = page.locator('#catatan-gejala');
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('Bercak kuning kecokelatan di tepi daun.');
      await page.waitForTimeout(400);
    }
    await klik(page, 'Analisis Gejala (AI)');
  });
  await langkah('4. Periksa hasil dugaan masalah dan tindakan aman', async () => {
    await lihat(page, /Dugaan Masalah/i);
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const el = document.querySelector('[role="dialog"]');
      if (el) el.scrollTop += 200;
    });
    await page.waitForTimeout(1500);
  });
}

async function rekamChatbot(page, langkah) {
  await langkah('1. Masuk dan buka asisten chatbot', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.waitForTimeout(800);
    const tombolBot = page.locator('#tombol-buka-chatbot');
    await tombolBot.waitFor({ state: 'visible', timeout: TUNGGU });
    await tombolBot.click();
    const panel = page.locator('#panel-chatbot');
    await panel.waitFor({ state: 'visible', timeout: TUNGGU });
    const centang = panel.locator('input[type="checkbox"]');
    if (await centang.isVisible().catch(() => false)) {
      await centang.check();
      await klik(page, 'Saya Setuju & Mulai Tanya');
      await page.waitForTimeout(500);
    }
  });
  await langkah('2. Ketuk contoh pertanyaan cepat dan terima jawaban', async () => {
    await klik(page, /Kapan pupuk pertama sawi\?/);
    await lihat(page, /Kapan pupuk pertama sawi\?/);
    await page.waitForTimeout(1500);
  });
  await langkah('3. Ketik pertanyaan takaran nutrisi PPM', async () => {
    const input = page.locator('#input-chatbot');
    await input.fill('Berapa PPM ideal sawi hidroponik?');
    await page.waitForTimeout(500);
    await page.locator('#tombol-kirim-chatbot').click();
    await page.waitForTimeout(2000);
  });
}

async function rekamCuaca(page, langkah) {
  await langkah('1. Masuk ke Beranda dan lihat widget cuaca BMKG 3 hari', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.waitForTimeout(800);
    const kartu = page.locator('#kartu-cuaca, section:has-text("Cuaca dan suhu")').first();
    await kartu.waitFor({ state: 'visible', timeout: TUNGGU });
    await kartu.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  });
  await langkah('2. Sorot rekomendasi siram dan suhu desa', async () => {
    await lihat(page, /Cuaca dan suhu/i);
    await page.mouse.move(195, 320, { steps: 10 });
    await page.waitForTimeout(2000);
  });
}

async function rekamPeta(page, langkah) {
  await langkah('1. Buka peta sebaran petani lokal', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/pembeli/peta`);
    await lihat(page, 'Peta Petani Sekitar');
    await page.waitForTimeout(1000);
  });
  await langkah('2. Tampilkan pin peta dan beralih ke daftar petani', async () => {
    await page.mouse.move(600, 450, { steps: 15 });
    await page.waitForTimeout(1000);
    const tombolDaftar = page.locator('button:has-text("Daftar")').first();
    if (await tombolDaftar.isVisible().catch(() => false)) {
      await tombolDaftar.click();
      await page.waitForTimeout(1500);
    } else {
      await page.waitForTimeout(1500);
    }
  });
}

async function rekamStok(page, langkah) {
  await langkah('1. Buka stok siap jual sekitar', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/pembeli/stok`);
    await lihat(page, 'Stok Siap Jual di Sekitar Anda');
    await page.waitForTimeout(1000);
  });
  await langkah('2. Pilih komoditas panen segar dan lihat opsi COD', async () => {
    const kartuStok = page.locator('article, [class*="kartu"]').first();
    await kartuStok.waitFor({ state: 'visible', timeout: TUNGGU });
    await kartuStok.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.mouse.move(195, 300, { steps: 10 });
    await page.waitForTimeout(1500);
  });
}

async function rekamChat(page, langkah) {
  await langkah('1. Buka menu chat percakapan pembeli-petani', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Ratna');
    await page.waitForURL(/\/pembeli/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/pembeli/chat`);
    await lihat(page, 'Chat & Pesan');
    await page.waitForTimeout(800);
  });
  await langkah('2. Kirim pesan tanya kesiapan panen', async () => {
    const kontak = page
      .locator(
        'button:has-text("Arif"), button:has-text("Kebun"), [role="button"]:has-text("Arif")',
      )
      .first();
    if (await kontak.isVisible().catch(() => false)) {
      await kontak.click();
      await page.waitForTimeout(600);
    }
    const input = page.locator('#masukan-pesan-chat');
    await input.waitFor({ state: 'visible', timeout: TUNGGU });
    await input.fill('Halo Pak Arif, apa sawi hijaunya bisa dikirim besok pagi?');
    await page.waitForTimeout(500);
    await input.press('Enter');
    await lihat(page, 'Halo Pak Arif, apa sawi hijaunya bisa dikirim besok pagi?');
    await page.waitForTimeout(1500);
  });
}

async function rekamLevel(page, langkah) {
  await langkah('1. Masuk sebagai Arif & buka Profil', async () => {
    await page.goto(`${URL_DASAR}/akun-demo`);
    await klik(page, 'Masuk sebagai Arif');
    await page.waitForURL(/\/beranda/, { timeout: TUNGGU });
    await page.goto(`${URL_DASAR}/profil`);
    await page.waitForTimeout(800);
  });
  await langkah('2. Sorot level petani, poin capaian, dan lencana 3D', async () => {
    await lihat(page, /Level|Poin|Lencana/i);
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(1500);
  });
}

const SKENARIO = {
  naskah,
  'daftar-petani': daftarPetani,
  'daftar-pembeli': daftarPembeli,
  'verifikasi-pembeli': verifikasiPembeli,
  'akun-pembeli': akunPembeli,
  'stok-cod': stokCod,
  chat: skenarioChat,
  'chat-nomor': chatNomor,
  'navigasi-pembeli-hp': navigasiPembeliHp,
  'rekam-hitung': rekamHitung,
  'rekam-rawat': rekamRawat,
  'rekam-jual': rekamJual,
  'rekam-deteksi': rekamDeteksi,
  'rekam-chatbot': rekamChatbot,
  'rekam-cuaca': rekamCuaca,
  'rekam-peta': rekamPeta,
  'rekam-stok': rekamStok,
  'rekam-chat': rekamChat,
  'rekam-level': rekamLevel,
};
const DAFTAR_SKENARIO =
  PILIH_SKENARIO === 'semua-rekam'
    ? Object.keys(BERKAS_SKENARIO_REKAM)
    : PILIH_SKENARIO === 'semua'
      ? Object.keys(SKENARIO)
      : [PILIH_SKENARIO];
for (const s of DAFTAR_SKENARIO)
  if (!SKENARIO[s]) {
    console.error(
      `Skenario tidak dikenal: ${s}. Pilih: ${Object.keys(SKENARIO).join(', ')}, semua, semua-rekam.`,
    );
    process.exit(1);
  }

// ---------------------------------------------------------------- jalankan dan catat

/** Buka `alamat` selebar 390px dengan cookie konteks utama, lalu potret seluruh tinggi halaman. */
async function potretHp(browser, utama, alamat, berkas) {
  const hp = await browser.newContext({ viewport: { width: 390, height: 844 }, ...GERAK });
  try {
    await hp.addCookies(await utama.cookies());
    const p = await hp.newPage();
    await p.goto(alamat);
    await p.waitForLoadState('networkidle').catch(() => {});
    await p.evaluate(() => document.fonts.ready);
    await p
      .getByText('Sedang memuat')
      .first()
      .waitFor({ state: 'detached', timeout: TUNGGU })
      .catch(() => {});
    await p.waitForTimeout(800);
    // Viewport setinggi halaman supaya navigasi bawah yang menempel tampil di tempatnya.
    const tinggi = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.setViewportSize({ width: 390, height: Math.max(844, tinggi) });
    await p.waitForTimeout(300);
    await p.screenshot({ path: berkas });
  } finally {
    await hp.close();
  }
}

/** Satu skenario di konteks peramban baru (cache kosong); kembalikan waktu tiap langkah. */
async function jalankan(browser, nama, putaran) {
  const hpSkenario =
    [
      'rekam-deteksi',
      'rekam-chatbot',
      'rekam-cuaca',
      'rekam-stok',
      'rekam-chat',
      'rekam-level',
      'navigasi-pembeli-hp',
    ].includes(nama) || LEBAR < 768;
  const lebarSkenario = REKAM ? (hpSkenario ? 390 : 1920) : LEBAR;
  const tinggiSkenario = REKAM ? (hpSkenario ? 844 : 1080) : LEBAR < 768 ? 844 : 900;

  const opsiKonteks = {
    viewport: { width: lebarSkenario, height: tinggiSkenario },
    ...GERAK,
  };
  if (REKAM && BERKAS_SKENARIO_REKAM[nama]) {
    opsiKonteks.recordVideo = {
      dir: FOLDER_REKAM_TEMP,
      size: { width: lebarSkenario, height: tinggiSkenario },
    };
  }

  const konteks = await browser.newContext(opsiKonteks);
  const page = await konteks.newPage();
  if (REKAM) await pasangKursorRekaman(page);
  const awal = Date.now();
  const konsol = [];
  const api = [];
  const mulaiMinta = new Map();
  const galatApi = [];
  page.on('console', (m) =>
    konsol.push(`${((Date.now() - awal) / 1000).toFixed(1)}s ${m.type()}: ${m.text()}`),
  );
  page.on('pageerror', (e) => {
    konsol.push(`galat halaman: ${e.message}`);
    galatApi.push(`galat halaman: ${e.message}`);
  });
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/api/v1/')) mulaiMinta.set(r, Date.now());
  });
  const selesaiMinta = (r, status) => {
    const mulai = mulaiMinta.get(r);
    if (mulai === undefined) return;
    const u = new URL(r.url());
    api.push({
      mulai_dtk: Number(((mulai - awal) / 1000).toFixed(2)),
      ms: Date.now() - mulai,
      metode: r.method(),
      jalur: u.pathname + u.search,
      status,
    });
    // Wajar: 401 GET /akun sebelum masuk, dan 422 verifikasi pertama nomor baru tanpa centang
    // privasi (memunculkan "Nomor ini belum punya akun").
    const wajar =
      (status === 401 && u.pathname === '/api/v1/akun') ||
      (status === 422 && u.pathname === '/api/v1/auth/otp/verifikasi');
    if (typeof status === 'number' && status >= 400 && !wajar)
      galatApi.push(`${status} ${r.method()} ${u.pathname}`);
  };
  page.on('requestfinished', async (r) => selesaiMinta(r, (await r.response())?.status() ?? 0));
  page.on('requestfailed', (r) => selesaiMinta(r, `gagal: ${r.failure()?.errorText ?? '?'}`));

  const waktu = [];
  let nomor = 0;
  const langkah = async (judul, kerja) => {
    nomor += 1;
    const mulai = Date.now();
    try {
      await kerja();
      await periksaSemuaGambarUtuh(page);
    } catch (e) {
      const dasar = FOLDER ? join(FOLDER, `${nama}-${putaran}-gagal-${nomor}`) : null;
      if (dasar) {
        await page.screenshot({ path: `${dasar}.png`, fullPage: true }).catch(() => undefined);
        writeFileSync(`${dasar}.html`, await page.content().catch(() => ''));
        const terlihat = await page
          .evaluate(() =>
            [...globalThis.document.querySelectorAll('button, a, [role="radio"], [role="tab"]')]
              .filter((el) => el.getClientRects().length > 0)
              .map(
                (el) =>
                  `${el.tagName.toLowerCase()}: ${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 80)}${el.disabled ? ' (nonaktif)' : ''}`,
              ),
          )
          .catch(() => []);
        writeFileSync(
          `${dasar}.json`,
          JSON.stringify(
            {
              langkah: judul,
              galat: e.message,
              url: page.url(),
              detik_sejak_mulai: (Date.now() - awal) / 1000,
              terlihat,
              konsol,
              api,
            },
            null,
            2,
          ),
        );
      }
      await konteks.close();
      throw new Error(
        `Langkah ${judul} gagal: ${e.message.split('\n')[0]}${dasar ? ` (diagnosis: ${dasar}.*)` : ''}`,
        { cause: e },
      );
    }
    const dtk = (Date.now() - mulai) / 1000;
    waktu.push({ langkah: judul, dtk });
    if (FOLDER && LAYAR_SEMUA) {
      const dasarLayar = join(FOLDER, `${nama}-${putaran}-${String(nomor).padStart(2, '0')}`);
      // Tunggu data halaman tujuan selesai dimuat supaya potret tidak menangkap halaman sebelumnya.
      await page.waitForLoadState('networkidle').catch(() => {});
      // Kueri lanjutan (mis. detail siklus baru) baru mulai sesaat setelah halaman tampil.
      await page.waitForTimeout(1500);
      await page
        .getByText('Sedang memuat')
        .first()
        .waitFor({ state: 'detached', timeout: TUNGGU })
        .catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${dasarLayar}.png` });
      if (LAYAR_HP) await potretHp(browser, konteks, page.url(), `${dasarLayar}-hp.png`);
    }
    console.log(`  ✓ ${judul} (${dtk.toFixed(1)} dtk)`);
  };

  await SKENARIO[nama](page, langkah);
  const videoObj = REKAM ? page.video() : null;
  await konteks.close();

  if (videoObj && BERKAS_SKENARIO_REKAM[nama]) {
    const namaTarget = `${BERKAS_SKENARIO_REKAM[nama]}.webm`;
    const berkas1 = join(FOLDER_REKAM, namaTarget);
    const berkas2 = join(FOLDER_PUBLIC_REKAM, namaTarget);
    await videoObj.saveAs(berkas1);
    copyFileSync(berkas1, berkas2);
    console.log(`  🎥 Video rekaman tersimpan: ${berkas1}`);
  }

  const lambat = api.filter((x) => x.ms >= 1000);
  return { waktu, galatApi, lambat };
}

const hasil = [];
let browser = DINGIN ? null : await chromium.launch({ executablePath, headless: !TAMPIL });
let gagal = 0;
try {
  for (let i = 1; i <= ULANG; i++) {
    for (const nama of DAFTAR_SKENARIO) {
      if (DINGIN) browser = await chromium.launch({ executablePath, headless: !TAMPIL });
      console.log(`Putaran ${i} · ${nama} (${URL_DASAR})`);
      try {
        const r = await jalankan(browser, nama, i);
        hasil.push({ putaran: i, skenario: nama, lolos: true, ...r });
        if (r.galatApi.length)
          console.log(`  Jawaban galat: ${[...new Set(r.galatApi)].join('; ')}`);
        if (r.lambat.length)
          console.log(
            `  Permintaan API ≥ 1 dtk: ${r.lambat.map((x) => `${x.metode} ${x.jalur} ${x.ms} ms`).join('; ')}`,
          );
      } catch (e) {
        gagal += 1;
        hasil.push({ putaran: i, skenario: nama, lolos: false, galat: e.message });
        console.error(`  ✗ ${e.message}`);
      }
      if (DINGIN) await browser.close();
    }
  }
} finally {
  if (!DINGIN) await browser.close();
}

// Ringkasan: waktu terlama dan rata-rata tiap langkah dari putaran yang lolos.
console.log(`\nRingkasan: ${hasil.length - gagal} dari ${hasil.length} lolos`);
for (const nama of DAFTAR_SKENARIO) {
  const per = new Map();
  for (const h of hasil.filter((x) => x.skenario === nama && x.lolos))
    for (const w of h.waktu) per.set(w.langkah, [...(per.get(w.langkah) ?? []), w.dtk]);
  if (!per.size) continue;
  console.log(`  ${nama}: langkah, terlama, rata-rata (dtk)`);
  for (const [l, d] of per)
    console.log(
      `    ${l.padEnd(46)} ${Math.max(...d)
        .toFixed(1)
        .padStart(5)} ${(d.reduce((a, b) => a + b, 0) / d.length).toFixed(1).padStart(5)}`,
    );
}
if (FOLDER)
  writeFileSync(
    join(FOLDER, 'ringkasan.json'),
    JSON.stringify({ url: URL_DASAR, dingin: DINGIN, hasil }, null, 2),
  );
process.exit(gagal ? 1 : 0);
