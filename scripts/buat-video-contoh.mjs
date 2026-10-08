/**
 * Membuat klip pengganti video modul (D-29, D-43): animasi canvas 640×360 direkam MediaRecorder di
 * Chrome menjadi WebM ±20 detik, bertuliskan judul modul dan "Video contoh". Dipakai sampai tim
 * merekam video MP4 360p bersama penyuluh. Jalankan: `node scripts/buat-video-contoh.mjs`
 * (butuh Google Chrome terpasang). Hasil: public/video/contoh/*.webm.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
/* global document, MediaRecorder, requestAnimationFrame -- dijalankan di peramban lewat page.evaluate */
import { chromium } from 'playwright-core';

const KELUAR = fileURLToPath(new URL('../public/video/contoh/', import.meta.url));
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DETIK = 20;

const KLIP = [
  ['semai-sawi', 'Semai sawi hijau'],
  ['ukur-ph-ppm', 'Mengukur pH dan PPM'],
  ['tanam-pindah-padi', 'Tanam pindah padi'],
];

mkdirSync(KELUAR, { recursive: true });
const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage();
for (const [nama, judul] of KLIP) {
  const base64 = await p.evaluate(
    async ({ judul, detik }) => {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 360;
      const g = c.getContext('2d');
      // Warna token desain: daun-tua, embun-pagi, matahari.
      const gambar = (t) => {
        g.fillStyle = '#1E6B45';
        g.fillRect(0, 0, 640, 360);
        g.fillStyle = '#F3F7EF';
        g.font = '600 34px sans-serif';
        g.textAlign = 'center';
        g.fillText(judul, 320, 160);
        g.font = '24px sans-serif';
        g.fillText('Video contoh · rekaman asli menyusul', 320, 205);
        g.fillStyle = 'rgba(243,247,239,0.3)';
        g.fillRect(60, 290, 520, 8);
        g.fillStyle = '#D99A1E';
        g.fillRect(60, 290, 520 * (t / detik), 8);
        g.beginPath();
        g.arc(560, 70, 26 + 4 * Math.sin(t * 2), 0, Math.PI * 2);
        g.fill();
      };
      const rekam = new MediaRecorder(c.captureStream(24), {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 150_000,
      });
      const potong = [];
      rekam.ondataavailable = (e) => potong.push(e.data);
      const selesai = new Promise((ok) => (rekam.onstop = ok));
      rekam.start(1000);
      const awal = performance.now();
      await new Promise((ok) => {
        const langkah = () => {
          const t = (performance.now() - awal) / 1000;
          gambar(Math.min(t, detik));
          if (t < detik) requestAnimationFrame(langkah);
          else ok();
        };
        langkah();
      });
      rekam.stop();
      await selesai;
      const data = new Uint8Array(await new Blob(potong, { type: 'video/webm' }).arrayBuffer());
      let biner = '';
      for (const x of data) biner += String.fromCharCode(x);
      return btoa(biner);
    },
    { judul, detik: DETIK },
  );
  const isi = Buffer.from(base64, 'base64');
  writeFileSync(`${KELUAR}${nama}.webm`, isi);
  console.log(`${nama}.webm ${(isi.length / 1e6).toFixed(2)} MB`);
}
await b.close();
