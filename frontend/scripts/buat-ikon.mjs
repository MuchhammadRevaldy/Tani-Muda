#!/usr/bin/env node
/**
 * Buat ikon aplikasi dari ikon "kebun" design system (logo Tani Muda): garis putih di atas kotak
 * warna token `daun-tua`. Warna dibaca dari tailwind.config.ts supaya tetap satu sumber token.
 *   node scripts/buat-ikon.mjs
 * Hasil di public/:
 *   - favicon.svg (tab peramban modern), favicon.ico (16, 32, 48 px);
 *   - apple-touch-icon.png (180 px, layar utama iPhone; latar penuh, iOS membulatkan sendiri);
 *   - ikon/ikon-192.png, ikon/ikon-512.png, ikon/ikon-maskable-512.png (layar utama Android,
 *     dipakai manifest PWA di T6.03).
 * Rasterisasi memakai Chrome terpasang lewat playwright-core (sama dengan skrip tangkapan).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const akar = fileURLToPath(new URL('..', import.meta.url));
const config = readFileSync(join(akar, 'tailwind.config.ts'), 'utf8');
const token = (nama) => {
  const m = config.match(new RegExp(`'${nama}':\\s*'(#[0-9A-Fa-f]{6})'`));
  if (!m) throw new Error(`Token warna ${nama} tidak ditemukan di tailwind.config.ts`);
  return m[1];
};
const DAUN = token('daun-tua');
const PUTIH = config.match(/putih:\s*'(#[0-9A-Fa-f]{6})'/)[1];

// Garis ikon "kebun" dari src/komponen/ikon.tsx (viewBox 24).
const KEBUN =
  '<path d="M12 20.5v-8.5"/><path d="M12 12c0-3.9-2.6-6.5-7.5-6.5 0 4.2 2.8 6.5 7.5 6.5Z"/>' +
  '<path d="M12 14.5c0-3.4 2.3-5.8 7-5.8 0 3.6-2.6 5.8-7 5.8Z"/><path d="M4.5 20.5h15"/>';

/**
 * @param skala ukuran ikon terhadap kotak (0–1); ikon maskable butuh zona aman 80%.
 * @param sudut jari-jari sudut dalam satuan viewBox 32 (0 = kotak penuh).
 * @param tebal tebal garis dalam satuan ikon 24; ukuran kecil butuh garis lebih tebal.
 */
function svg({ skala = 0.72, sudut = 7, tebal = 2.2 } = {}) {
  const ukuran = 32 * skala;
  const geser = (32 - ukuran) / 2;
  const k = ukuran / 24;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" rx="${sudut}" fill="${DAUN}"/>` +
    `<g transform="translate(${geser} ${geser}) scale(${k})" fill="none" stroke="${PUTIH}" ` +
    `stroke-width="${tebal}" stroke-linecap="round" stroke-linejoin="round">${KEBUN}</g></svg>`
  );
}

const publik = join(akar, 'public');
mkdirSync(join(publik, 'ikon'), { recursive: true });
writeFileSync(join(publik, 'favicon.svg'), svg() + '\n');

const b = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const p = await b.newPage();
async function png(isiSvg, px) {
  await p.setViewportSize({ width: px, height: px });
  await p.setContent(
    `<html><body style="margin:0;background:transparent">` +
      isiSvg.replace('<svg ', `<svg width="${px}" height="${px}" `) +
      `</body></html>`,
  );
  return p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: px, height: px } });
}

// ICO berisi PNG (didukung peramban modern dan Windows Vista ke atas).
const ukuranIco = [16, 32, 48];
const gambar = [];
for (const px of ukuranIco) gambar.push(await png(svg({ tebal: px <= 16 ? 2.8 : 2.4 }), px));
const kepala = Buffer.alloc(6 + 16 * gambar.length);
kepala.writeUInt16LE(0, 0);
kepala.writeUInt16LE(1, 2);
kepala.writeUInt16LE(gambar.length, 4);
let posisi = kepala.length;
gambar.forEach((g, i) => {
  const o = 6 + 16 * i;
  kepala.writeUInt8(ukuranIco[i], o);
  kepala.writeUInt8(ukuranIco[i], o + 1);
  kepala.writeUInt8(0, o + 2);
  kepala.writeUInt8(0, o + 3);
  kepala.writeUInt16LE(1, o + 4);
  kepala.writeUInt16LE(32, o + 6);
  kepala.writeUInt32LE(g.length, o + 8);
  kepala.writeUInt32LE(posisi, o + 12);
  posisi += g.length;
});
writeFileSync(join(publik, 'favicon.ico'), Buffer.concat([kepala, ...gambar]));

writeFileSync(join(publik, 'apple-touch-icon.png'), await png(svg({ sudut: 0, skala: 0.62 }), 180));
writeFileSync(join(publik, 'ikon', 'ikon-192.png'), await png(svg(), 192));
writeFileSync(join(publik, 'ikon', 'ikon-512.png'), await png(svg(), 512));
writeFileSync(
  join(publik, 'ikon', 'ikon-maskable-512.png'),
  await png(svg({ sudut: 0, skala: 0.56 }), 512),
);
await b.close();
console.log(
  'Ikon tersimpan di public/: favicon.svg, favicon.ico, apple-touch-icon.png, ikon/*.png',
);
