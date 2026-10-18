#!/usr/bin/env node
/**
 * Memastikan logo di video adalah logo asli aplikasi [AG-45]: setiap path di
 * src/v2/LogoAsli.tsx harus sama persis dengan frontend/public/logo/logo-tanda.svg
 * (frontend hanya dibaca).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgLogo = readFileSync(join(__dirname, '..', '..', 'frontend', 'public', 'logo', 'logo-tanda.svg'), 'utf-8');
const dLogo = [...svgLogo.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
const dVideo = [...readFileSync(join(__dirname, '..', 'src', 'v2', 'LogoAsli.tsx'), 'utf-8').matchAll(/^\s+\w+: '([^']+)',$/gm)].map((m) => m[1]);
const beda = dVideo.filter((d) => !dLogo.includes(d));
if (dVideo.length !== dLogo.length || beda.length) {
  console.error(`Logo di video berbeda dari logo-tanda.svg (${beda.length} bagian tidak cocok).`);
  process.exit(1);
}
const salinan = readFileSync(join(__dirname, '..', 'public', 'logo', 'logo-tanda.svg'), 'utf-8').replace(/\r/g, '');
if (salinan !== svgLogo.replace(/\r/g, '')) {
  console.error('video/public/logo/logo-tanda.svg berbeda dari frontend/public/logo/logo-tanda.svg.');
  process.exit(1);
}
console.log(`Logo asli sinkron (${dVideo.length} bagian).`);
