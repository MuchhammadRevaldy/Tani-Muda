#!/usr/bin/env node
/**
 * Buat favicon dan ikon PWA dari logo merek (D-63, [AG-24]):
 *   node scripts/buat-ikon.mjs
 * Sumber di public/logo/:
 *   - logo-ikon.svg (kotak limau bersudut, tanda putih) → favicon.svg, favicon.ico (16, 32, 48 px),
 *     ikon/ikon-192.png, ikon/ikon-512.png;
 *   - logo-ikon-maskable.svg (latar penuh, tanda di zona aman 80%) → ikon/ikon-maskable-512.png dan
 *     apple-touch-icon.png (180 px). iOS mengisi bagian transparan dengan hitam dan membulatkan
 *     sudut sendiri, jadi ikon Apple memakai versi berlatar penuh.
 * Rasterisasi memakai Chrome terpasang lewat playwright-core (sama dengan skrip tangkapan).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const akar = fileURLToPath(new URL('..', import.meta.url));
const publik = join(akar, 'public');
const baca = (nama) => readFileSync(join(publik, 'logo', nama), 'utf8').trim();
const IKON = baca('logo-ikon.svg');
const MASKABLE = baca('logo-ikon-maskable.svg');

mkdirSync(join(publik, 'ikon'), { recursive: true });
writeFileSync(join(publik, 'favicon.svg'), IKON + '\n');

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
for (const px of ukuranIco) gambar.push(await png(IKON, px));
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

writeFileSync(join(publik, 'apple-touch-icon.png'), await png(MASKABLE, 180));
writeFileSync(join(publik, 'ikon', 'ikon-192.png'), await png(IKON, 192));
writeFileSync(join(publik, 'ikon', 'ikon-512.png'), await png(IKON, 512));
writeFileSync(join(publik, 'ikon', 'ikon-maskable-512.png'), await png(MASKABLE, 512));
await b.close();
console.log(
  'Ikon tersimpan di public/: favicon.svg, favicon.ico, apple-touch-icon.png, ikon/*.png',
);
