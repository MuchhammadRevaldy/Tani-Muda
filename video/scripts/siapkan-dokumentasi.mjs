#!/usr/bin/env node
/**
 * Bahan video dokumentasi [AG-52], semuanya dari jejak asli proyek (tanpa gambar karangan):
 *
 * 1. Data git: jumlah commit per hari 5–19 Oktober 2026, daftar commit, tag, dan tanggal
 *    commit pertama setiap bahan → src/data/dokumentasi.json
 * 2. Empat dokumen docs/*.md dirender jadi halaman kertas (PNG) + posisi setiap judul.
 * 3. Papan desain dari design/extracted/tampil/ (hasil `npm run ekstrak-desain` di frontend).
 * 4. Aplikasi versi tag demo-aman, di-build di git worktree TERPISAH di luar repo, ditangkap
 *    layar, lalu worktree dihapus. Versi sekarang (build demo frontend saat ini) ditangkap
 *    dengan langkah yang sama untuk perbandingan dan adegan hasil akhir.
 * 5. Tangkapan lama yang sudah ada di repo disalin apa adanya.
 *
 * Keluaran gambar: public/dokumentasi/ (tidak masuk git; buat ulang dengan skrip ini).
 * Pakai: npm run bahan:dokumentasi [-- --lewati-aplikasi]
 */
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const VIDEO = join(dirname(fileURLToPath(import.meta.url)), '..');
const AKAR = join(VIDEO, '..');
const FRONTEND = join(AKAR, 'frontend');
const KELUAR = join(VIDEO, 'public', 'dokumentasi');
const DATA = join(VIDEO, 'src', 'data', 'dokumentasi.json');
mkdirSync(KELUAR, { recursive: true });
const lewatiAplikasi = process.argv.includes('--lewati-aplikasi');

const git = (...a) => execFileSync('git', a, { cwd: AKAR, encoding: 'utf8' }).trim();
const awalBerkas = (p) => git('log', '--diff-filter=A', '--format=%ad', '--date=short', '--', p).split('\n').filter(Boolean).pop() ?? null;
const akhirBerkas = (p) => git('log', '-1', '--format=%ad', '--date=short', '--', p) || null;

// ------------------------------------------------------------------ 1. data git

const HARI = Array.from({ length: 15 }, (_, i) => `2026-10-${String(5 + i).padStart(2, '0')}`);
const semuaCommit = git('log', '--reverse', '--format=%ad%x09%h%x09%s', '--date=format:%Y-%m-%d %H:%M')
  .split('\n')
  .map((b) => {
    const [waktu, hash, ...s] = b.split('\t');
    return { tanggal: waktu.slice(0, 10), jam: waktu.slice(11), hash, judul: s.join('\t') };
  })
  .filter((c) => HARI.includes(c.tanggal));
const perHari = HARI.map((t) => ({ tanggal: t, jumlah: semuaCommit.filter((c) => c.tanggal === t).length }));
const puncak = perHari.reduce((a, b) => (b.jumlah > a.jumlah ? b : a));
const tag = git('tag', '--format=%(refname:short)')
  .split('\n')
  .filter(Boolean)
  .map((nama) => ({ nama, hash: git('rev-list', '-n', '1', nama).slice(0, 7), tanggal: git('log', '-1', '--format=%ad', '--date=short', nama) }))
  .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.nama.localeCompare(b.nama));

const BERKAS = {
  prd: 'docs/prd-tani-muda.md',
  keputusan: 'docs/keputusan.md',
  rencana: 'docs/rencana-kerja.md',
  kontrak: 'docs/kontrak-api.md',
  desain: 'design/desain-tani-muda.html',
  kerangka: 'docs/tangkapan/arsip/tahap-1/00-kerangka-petani-desktop.png',
  temaLama: 'docs/tangkapan/aplikasi/03-beranda-petani-desktop.png',
  temaBaru: 'docs/tema-baru/tangkapan/halaman-beranda-desktop.png',
  logo: 'frontend/public/logo/logo-tanda.svg',
  logoIkon: 'frontend/public/logo/logo-ikon.svg',
  logoSatuWarna: 'frontend/public/logo/logo-satu-warna.svg',
  logoMaskable: 'frontend/public/logo/logo-ikon-maskable.svg',
  ilustrasi: 'frontend/public/ilustrasi/komoditas',
  lencana: 'frontend/public/lencana/panen-pertama.svg',
  ikon: 'design/icons',
  ide: 'video/dokumentasi/layar-pengguna/IDE.png',
  xampp: 'video/dokumentasi/layar-pengguna/XAMPP.png',
  phpmyadmin: 'video/dokumentasi/layar-pengguna/phpmyadmin.png',
  ujiNaskah: 'frontend/scripts/uji-naskah.mjs',
  ujiBackend: 'backend/tests',
  naskahDemo: 'docs/naskah-demo.md',
  panelAdmin: 'docs/tangkapan/ag-51/01-daftar-petani.png',
};
const tanggalBahan = Object.fromEntries(
  Object.entries(BERKAS).map(([k, p]) => [k, { berkas: p, awal: awalBerkas(p), akhir: akhirBerkas(p) }]),
);
const keputusanTerakhir = [...readFileSync(join(AKAR, BERKAS.keputusan), 'utf8').matchAll(/^## (D-\d+)/gm)].map((m) => m[1]).pop();
const folderTampil = join(AKAR, 'design', 'extracted', 'tampil');
const jumlahPapan = existsSync(folderTampil) ? readdirSync(folderTampil).filter((n) => n.endsWith('.html')).length : null;

// ------------------------------------------------------------------ peramban

const { chromium } = await import(pathToFileURL(join(FRONTEND, 'node_modules', 'playwright-core', 'index.mjs')).href);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) =>
  existsSync(p),
);
const peramban = await chromium.launch({ executablePath: exe, headless: true });

// ------------------------------------------------------------------ 2. dokumen → kertas

const esc = (s) => s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sebaris = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '<u>$1</u>');

/** Markdown sederhana → HTML: judul, paragraf, daftar, tabel, kutipan, blok kode. */
function mdKeHtml(md) {
  const baris = md.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  let nJudul = 0;
  while (i < baris.length) {
    const b = baris[i];
    if (/^```/.test(b)) {
      const isi = [];
      for (i++; i < baris.length && !/^```/.test(baris[i]); i++) isi.push(esc(baris[i]));
      out.push(`<pre>${isi.join('\n')}</pre>`);
      i++;
    } else if (/^#{1,4} /.test(b)) {
      const n = b.match(/^#+/)[0].length;
      out.push(`<h${n} data-j="${nJudul++}">${sebaris(b.slice(n + 1))}</h${n}>`);
      i++;
    } else if (/^\|/.test(b)) {
      const rows = [];
      for (; i < baris.length && /^\|/.test(baris[i]); i++) rows.push(baris[i]);
      const sel = (r) => r.replace(/^\||\|$/g, '').split('|').map((x) => sebaris(x.trim()));
      const kepala = sel(rows[0]);
      const badan = rows.slice(2).map(sel);
      out.push(
        `<table><tr>${kepala.map((x) => `<th>${x}</th>`).join('')}</tr>${badan.map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</table>`,
      );
    } else if (/^\s*([-*]|\d+\.) /.test(b)) {
      const urut = /^\s*\d+\./.test(b);
      const item = [];
      for (; i < baris.length && /^\s*([-*]|\d+\.) /.test(baris[i]); i++) item.push(sebaris(baris[i].replace(/^\s*([-*]|\d+\.) /, '')));
      out.push(`<${urut ? 'ol' : 'ul'}>${item.map((x) => `<li>${x}</li>`).join('')}</${urut ? 'ol' : 'ul'}>`);
    } else if (/^> /.test(b)) {
      const isi = [];
      for (; i < baris.length && /^> ?/.test(baris[i]); i++) isi.push(sebaris(baris[i].replace(/^> ?/, '')));
      out.push(`<blockquote>${isi.join(' ')}</blockquote>`);
    } else if (b.trim() === '' || /^---+$/.test(b)) {
      i++;
    } else {
      const isi = [];
      for (; i < baris.length && baris[i].trim() !== '' && !/^(#|\||```|> |\s*([-*]|\d+\.) )/.test(baris[i]); i++) isi.push(sebaris(baris[i]));
      out.push(`<p>${isi.join(' ')}</p>`);
    }
  }
  return out.join('\n');
}

const HURUF = `data:font/woff2;base64,${readFileSync(join(VIDEO, 'public', 'fonts', 'outfit-latin.woff2')).toString('base64')}`;
const GAYA_KERTAS = `
@font-face { font-family: Outfit; src: url('${HURUF}') format('woff2'); font-weight: 100 900; }
body { margin: 0; background: #FBF8F1; color: #2E3547; font: 400 19px/1.55 Outfit, sans-serif; }
main { box-sizing: border-box; width: 920px; padding: 64px 70px 80px; overflow-wrap: break-word; }
h1 { font-size: 44px; line-height: 1.15; color: #3D6B0E; margin: 0 0 18px; }
h2 { font-size: 30px; margin: 44px 0 12px; color: #2E3547; border-top: 2px solid #E4E0D4; padding-top: 22px; }
h3 { font-size: 23px; margin: 28px 0 8px; color: #3D6B0E; }
h4 { font-size: 20px; margin: 20px 0 6px; }
p, li { margin: 0 0 10px; }
ul, ol { padding-left: 26px; margin: 0 0 14px; }
code { font-family: Consolas, monospace; font-size: 0.86em; background: #EEF8DF; padding: 1px 5px; border-radius: 4px; }
pre { font: 15px/1.45 Consolas, monospace; background: #F1EEE4; padding: 14px 18px; border-radius: 8px; white-space: pre-wrap; }
table { border-collapse: collapse; width: 100%; margin: 8px 0 18px; font-size: 16px; line-height: 1.4; }
th, td { border: 1px solid #DDD8CA; padding: 7px 10px; text-align: left; vertical-align: top; }
th { background: #EEF8DF; }
blockquote { margin: 0 0 14px; padding: 8px 18px; border-left: 4px solid #86C232; background: #F4F7EC; }
u { text-decoration-color: #86C232; }
`;
const BATAS_TINGGI = 16000;
const dokumen = {};
for (const kunci of ['prd', 'keputusan', 'rencana', 'kontrak']) {
  const md = readFileSync(join(AKAR, BERKAS[kunci]), 'utf8');
  const halaman = await peramban.newPage({ viewport: { width: 920, height: 1200 } });
  await halaman.setContent(`<!doctype html><html lang="id"><meta charset="utf-8"><style>${GAYA_KERTAS}</style><main>${mdKeHtml(md)}</main></html>`);
  await halaman.evaluate(() => document.fonts.ready);
  const { tinggi, judul } = await halaman.evaluate(() => ({
    tinggi: document.querySelector('main').getBoundingClientRect().height,
    judul: [...document.querySelectorAll('[data-j]')].map((h) => ({
      teks: h.textContent,
      tingkat: Number(h.tagName.slice(1)),
      y: Math.round(h.getBoundingClientRect().top + window.scrollY),
      tinggi: Math.round(h.getBoundingClientRect().height),
    })),
  }));
  const tinggiAmbil = Math.min(Math.ceil(tinggi), BATAS_TINGGI);
  await halaman.setViewportSize({ width: 920, height: tinggiAmbil });
  await halaman.screenshot({ path: join(KELUAR, `dok-${kunci}.png`), clip: { x: 0, y: 0, width: 920, height: tinggiAmbil } });
  await halaman.close();
  dokumen[kunci] = { gambar: `dokumentasi/dok-${kunci}.png`, lebar: 920, tinggi: tinggiAmbil, judul: judul.filter((j) => j.y < tinggiAmbil) };
  console.log(`✓ dokumen ${kunci}: ${tinggiAmbil}px, ${judul.length} judul`);
}

// ------------------------------------------------------------------ 3. papan desain

const PAPAN = [
  '00-sistem-desain-desktop',
  '01-halaman-depan-desktop',
  '03-beranda-petani-desktop',
  '08-belajar-hidroponik-desktop',
  '16-hitung-modal-sawi-bedengan-desktop',
  '20-jadwal-sawi-bedengan-desktop',
  '29-pesanan-di-sekitar-desktop',
  '03-beranda-petani-mobile',
  '10-hitung-pilih-tanaman-mobile',
  '31-detail-pesanan-mobile',
];
const papan = [];
if (!existsSync(folderTampil)) console.warn('! design/extracted/tampil belum ada: jalankan `npm run ekstrak-desain` di frontend');
for (const nama of PAPAN) {
  const sumber = join(folderTampil, `${nama}.html`);
  if (!existsSync(sumber)) continue;
  const hp = nama.endsWith('-mobile');
  const halaman = await peramban.newPage({ viewport: { width: hp ? 390 : 1440, height: hp ? 844 : 900 }, deviceScaleFactor: hp ? 2 : 1 });
  await halaman.goto(pathToFileURL(sumber).href, { waitUntil: 'load' });
  await halaman.waitForTimeout(800);
  await halaman.screenshot({ path: join(KELUAR, `papan-${nama}.png`) });
  await halaman.close();
  papan.push({ nama, gambar: `dokumentasi/papan-${nama}.png`, hp });
  console.log(`✓ papan ${nama}`);
}

// ------------------------------------------------------------------ 5. tangkapan lama (disalin apa adanya)

const SALIN = {
  'kerangka-petani-desktop.png': 'docs/tangkapan/arsip/tahap-1/00-kerangka-petani-desktop.png',
  'kerangka-pembeli-desktop.png': 'docs/tangkapan/arsip/tahap-1/00-kerangka-pembeli-desktop.png',
  'kerangka-petani-mobile.png': 'docs/tangkapan/arsip/tahap-1/00-kerangka-petani-mobile.png',
  'tema-lama-beranda-desktop.png': BERKAS.temaLama,
  'tema-baru-beranda-desktop.png': BERKAS.temaBaru,
  'ide.png': BERKAS.ide,
  'xampp.png': BERKAS.xampp,
  'phpmyadmin.png': BERKAS.phpmyadmin,
  'admin-daftar-petani.png': 'docs/tangkapan/ag-51/01-daftar-petani.png',
  'admin-detail-arif.png': 'docs/tangkapan/ag-51/04-catatan-tersimpan.png',
  'admin-sengketa.png': 'docs/tangkapan/ag-51/09-sengketa-diputuskan.png',
};
for (const [ke, dari] of Object.entries(SALIN)) copyFileSync(join(AKAR, dari), join(KELUAR, ke));
const ikonResmi = execFileSync('git', ['ls-files', 'design/icons'], { cwd: AKAR, encoding: 'utf8' }).split('\n').filter((n) => n.endsWith('.svg'));
mkdirSync(join(KELUAR, 'ikon'), { recursive: true });
for (const p of ikonResmi) copyFileSync(join(AKAR, p), join(KELUAR, 'ikon', p.split('/').pop()));

// ------------------------------------------------------------------ 4. aplikasi: demo-aman vs sekarang

/** Tunggu sampai URL menjawab. */
async function tunggu(url, ms = 40000) {
  const akhir = Date.now() + ms;
  while (Date.now() < akhir) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* belum siap */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Tidak menjawab: ${url}`);
}

/** Build demo di `frontend`, jalankan preview, tangkap halaman-halaman, matikan. */
async function tangkapAplikasi(folderFrontend, awalan, port, halamanDiambil) {
  const b = spawnSync(process.execPath, ['scripts/build-demo.mjs'], { cwd: folderFrontend, stdio: 'inherit' });
  if (b.status !== 0) throw new Error(`Build demo gagal di ${folderFrontend}`);
  const vite = join(folderFrontend, 'node_modules', 'vite', 'bin', 'vite.js');
  const server = spawn(process.execPath, [vite, 'preview', '--outDir', 'dist-demo', '--port', String(port), '--strictPort'], { cwd: folderFrontend, stdio: 'ignore' });
  const hasil = [];
  try {
    const URL_DASAR = `http://localhost:${port}`;
    await tunggu(URL_DASAR);
    for (const versi of ['desktop', 'mobile']) {
      const hp = versi === 'mobile';
      const ctx = await peramban.newContext({ viewport: hp ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: hp ? 2 : 1 });
      const p = await ctx.newPage();
      await p.goto(`${URL_DASAR}/akun-demo`);
      await p.getByRole('button', { name: 'Masuk sebagai Arif' }).first().click();
      await p.waitForURL(/\/beranda/, { timeout: 20000 });
      for (const [nama, rute] of halamanDiambil) {
        await p.goto(`${URL_DASAR}${rute}`);
        await p.waitForLoadState('networkidle').catch(() => {});
        await p.waitForTimeout(1500);
        const berkas = `${awalan}-${nama}-${versi}.png`;
        await p.screenshot({ path: join(KELUAR, berkas) });
        hasil.push(berkas);
        console.log(`✓ ${berkas}`);
      }
      await ctx.close();
    }
  } finally {
    server.kill();
  }
  return hasil;
}

let aplikasi = null;
if (!lewatiAplikasi) {
  // Worktree demo-aman di luar repo utama; node_modules dipinjam lewat junction (bukan disalin).
  const wt = join(process.env.TANI_MUDA_WORKTREE ?? tmpdir(), 'tani-muda-demo-aman');
  if (existsSync(wt)) {
    spawnSync('git', ['worktree', 'remove', '--force', wt], { cwd: AKAR });
    rmSync(wt, { recursive: true, force: true });
  }
  git('worktree', 'add', '--detach', wt, 'demo-aman');
  const nm = join(wt, 'frontend', 'node_modules');
  execFileSync('cmd', ['/c', 'mklink', '/J', nm, join(FRONTEND, 'node_modules')]);
  let lama;
  try {
    lama = await tangkapAplikasi(join(wt, 'frontend'), 'demo-aman', 4181, [['beranda', '/beranda']]);
  } finally {
    // Lepas junction dulu supaya penghapusan worktree tidak menyentuh node_modules asli.
    execFileSync('cmd', ['/c', 'rmdir', nm]);
    git('worktree', 'remove', '--force', wt);
    console.log('✓ worktree demo-aman dihapus');
  }
  const sekarang = await tangkapAplikasi(FRONTEND, 'sekarang', 4182, [
    ['beranda', '/beranda'],
    ['belajar', '/belajar'],
    ['hitung', '/hitung/tanaman'],
    ['rawat', '/kebun/siklus-arif-sawi/jadwal'],
    ['jual', '/pesanan'],
  ]);
  aplikasi = {
    demoAman: { hash: git('rev-list', '-n', '1', 'demo-aman').slice(0, 7), tanggal: git('log', '-1', '--format=%ad', '--date=short', 'demo-aman'), gambar: lama },
    sekarang: { hash: git('rev-parse', '--short', 'HEAD'), tanggal: git('log', '-1', '--format=%ad', '--date=short', 'HEAD'), gambar: sekarang },
  };
} else if (existsSync(DATA)) {
  aplikasi = JSON.parse(readFileSync(DATA, 'utf8')).aplikasi;
}

await peramban.close();

writeFileSync(
  DATA,
  JSON.stringify(
    {
      dibuat: new Date().toISOString().slice(0, 10),
      git: { perHari, total: semuaCommit.length, puncak, commit: semuaCommit, tag },
      tanggalBahan,
      keputusanTerakhir,
      jumlahPapan,
      dokumen,
      papan,
      ikonResmi: ikonResmi.map((p) => p.split('/').pop()),
      aplikasi,
    },
    null,
    2,
  ) + '\n',
);
console.log(`\nData: ${DATA}\nTotal commit 5–19 Okt: ${semuaCommit.length}; puncak ${puncak.tanggal} (${puncak.jumlah}).`);
