// Lencana 3D Tani Muda (F-03): 5 level (bentuk segi enam) dan 10 pencapaian (bentuk bulat).
// Medali bergradasi + kilau, ikon garis putih tebal. viewBox 120x120, latar transparan.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const di = (n) => fileURLToPath(new URL(n, import.meta.url));

const IKON = {
  benih: '<ellipse cx="12" cy="13" rx="5" ry="7" transform="rotate(-25 12 13)"/><path d="M10 9.5c1.5 1 2.5 3 2.5 5.5"/>',
  tunas: '<path d="M12 20v-7"/><path d="M12 13c0-3.5-2.5-6-7-6 0 3.5 2.5 6 7 6z"/><path d="M12 13c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z"/><path d="M6 20h12"/>',
  daun: '<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19L14 10"/>',
  bunga: '<path d="M7 5c0 4 2 6.5 5 6.5S17 9 17 5l-2.5 2L12 4 9.5 7z"/><path d="M12 11.5V21M12 17c-2.5 0-4-1.2-4.5-3M12 18.5c2.2 0 3.5-1 4-2.5"/>',
  panen: '<path d="M4 10h16l-1.5 9h-13z"/><path d="M8 10l2-5M16 10l-2-5"/><path d="M9 14v2M12 14v2M15 14v2"/>',
  kalender: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 14.5l2.2 2.2 4.5-4.5"/>',
  kamera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  ukur: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 10v6"/>',
  belajar: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4-2.5-4-2.5z"/>',
  perisai: '<path d="M12 3l7 3v5c0 5-3.2 8.3-7 10-3.8-1.7-7-5-7-10V6z"/><path d="M8.7 12.2l2.3 2.3 4.4-4.6"/>',
  bintang: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"/>',
  tas: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  hati: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
};

// warna: [tepi gelap, tepi terang, muka gelap, muka terang]
const WARNA = {
  tanah: ['#7A4A2E', '#C98F63', '#A86A42', '#E3B488'],
  limau: ['#5E9A1E', '#B8E35A', '#7DB92E', '#C9EE7A'],
  hijau: ['#2B7516', '#7CCB2B', '#3E9B1F', '#8FD13A'],
  oranye: ['#C4521C', '#FFB27E', '#EE6F2C', '#FFA36B'],
  emas: ['#A87414', '#FFE08A', '#E3A62A', '#FFD25E'],
  biru: ['#1F2535', '#56638A', '#2E3547', '#4A5578'],
};

const SEGI_ENAM = 'M60 8 L102 32 L102 84 L60 108 L18 84 L18 32 Z';
const SEGI_ENAM_DALAM = 'M60 19 L93 38 L93 78 L60 97 L27 78 L27 38 Z';

function lencana({ kode, judul, bentuk, warna, ikon }) {
  const [tg, tt, mg, mt] = WARNA[warna];
  const id = kode;
  const luar =
    bentuk === 'segi6'
      ? `<path d="${SEGI_ENAM}" fill="url(#${id}-tepi)" stroke="url(#${id}-tepi)" stroke-width="8" stroke-linejoin="round"/>`
      : `<circle cx="60" cy="58" r="50" fill="url(#${id}-tepi)"/>`;
  const dalam =
    bentuk === 'segi6'
      ? `<path d="${SEGI_ENAM_DALAM}" fill="url(#${id}-muka)" stroke="url(#${id}-muka)" stroke-width="6" stroke-linejoin="round"/>`
      : `<circle cx="60" cy="58" r="40" fill="url(#${id}-muka)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${judul}">
  <title>${judul}</title>
  <defs>
    <linearGradient id="${id}-tepi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tt}"/><stop offset="1" stop-color="${tg}"/></linearGradient>
    <linearGradient id="${id}-muka" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mt}"/><stop offset="1" stop-color="${mg}"/></linearGradient>
    <radialGradient id="${id}-bayang" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2E3547" stop-opacity=".28"/><stop offset="1" stop-color="#2E3547" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-kilau" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="113" rx="34" ry="5" fill="url(#${id}-bayang)"/>
  ${luar}
  ${dalam}
  <ellipse cx="60" cy="36" rx="30" ry="14" fill="url(#${id}-kilau)"/>
  <g transform="translate(31.2 29.2) scale(2.4)" fill="none" stroke="#2E3547" stroke-opacity=".22" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" transform-origin="0 0"><g transform="translate(.4 .6)">${IKON[ikon]}</g></g>
  <g transform="translate(31.2 29.2) scale(2.4)" fill="none" stroke="#FFFFFF" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${IKON[ikon]}</g>
</svg>
`;
}

const DAFTAR = [
  { kode: 'level-benih', judul: 'Level Benih', bentuk: 'segi6', warna: 'tanah', ikon: 'benih' },
  { kode: 'level-tunas', judul: 'Level Tunas', bentuk: 'segi6', warna: 'limau', ikon: 'tunas' },
  { kode: 'level-daun', judul: 'Level Daun', bentuk: 'segi6', warna: 'hijau', ikon: 'daun' },
  { kode: 'level-berbunga', judul: 'Level Berbunga', bentuk: 'segi6', warna: 'oranye', ikon: 'bunga' },
  { kode: 'level-panen-raya', judul: 'Level Panen Raya', bentuk: 'segi6', warna: 'emas', ikon: 'panen' },
  { kode: 'tanam-pertama', judul: 'Tanam pertama', bentuk: 'bulat', warna: 'limau', ikon: 'tunas' },
  { kode: 'tepat-waktu-7-hari', judul: 'Tepat waktu 7 hari', bentuk: 'bulat', warna: 'hijau', ikon: 'kalender' },
  { kode: 'kebun-terdokumentasi', judul: 'Kebun terdokumentasi', bentuk: 'bulat', warna: 'biru', ikon: 'kamera' },
  { kode: 'pengukur-teliti', judul: 'Pengukur teliti', bentuk: 'bulat', warna: 'oranye', ikon: 'ukur' },
  { kode: 'pelajar-rajin', judul: 'Pelajar rajin', bentuk: 'bulat', warna: 'biru', ikon: 'belajar' },
  { kode: 'panen-pertama', judul: 'Panen pertama', bentuk: 'bulat', warna: 'emas', ikon: 'panen' },
  { kode: 'dipercaya-pembeli', judul: 'Dipercaya pembeli', bentuk: 'bulat', warna: 'hijau', ikon: 'perisai' },
  { kode: 'bintang-lima', judul: 'Bintang lima', bentuk: 'bulat', warna: 'emas', ikon: 'bintang' },
  { kode: 'pesanan-pertama', judul: 'Pesanan pertama', bentuk: 'bulat', warna: 'oranye', ikon: 'tas' },
  { kode: 'pembeli-setia', judul: 'Pembeli setia', bentuk: 'bulat', warna: 'limau', ikon: 'hati' },
];

for (const l of DAFTAR) writeFileSync(di(`${l.kode}.svg`), lencana(l));

const kartu = (l, terkunci = false) =>
  `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:6px;width:120px"><img src="${l.kode}.svg" width="96" height="96" style="${terkunci ? 'filter:grayscale(1);opacity:.45' : ''}"><figcaption style="font-size:14px;text-align:center">${l.judul}${terkunci ? ' (terkunci)' : ''}</figcaption></figure>`;
writeFileSync(
  di('pratinjau.html'),
  `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:24px;background:#F7F8FA;font-family:system-ui;color:#2E3547;width:820px">
<h3 style="margin:0 0 12px">Level</h3><div style="display:flex;gap:16px;flex-wrap:wrap">${DAFTAR.slice(0, 5).map((l) => kartu(l)).join('')}</div>
<h3 style="margin:20px 0 12px">Pencapaian</h3><div style="display:flex;gap:16px;flex-wrap:wrap">${DAFTAR.slice(5).map((l) => kartu(l)).join('')}${kartu(DAFTAR[10], true)}</div>
</body></html>`,
);
console.log(`selesai: ${DAFTAR.length} lencana`);
