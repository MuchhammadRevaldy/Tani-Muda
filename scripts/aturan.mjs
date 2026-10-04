/**
 * Pemeriksa aturan proyek (aturan-proyek.md bagian 2, 1, dan 6; keputusan.md D-09).
 * Fungsi murni supaya bisa diuji; dijalankan oleh scripts/cek-aturan.mjs.
 */

const WARNA_BAWAAN =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black';
const AWALAN_WARNA =
  'bg|text|border|ring|fill|stroke|from|to|via|outline|divide|placeholder|shadow|accent|caret|decoration';

/** Aturan pola untuk semua berkas di src/. */
export const ATURAN_POLA = [
  {
    kode: 'HEX',
    pesan: 'Warna hex langsung. Pakai token di tailwind.config.ts',
    pola: /#[0-9a-fA-F]{3,8}\b/,
  },
  { kode: 'RGB', pesan: 'Warna rgb()/hsl() langsung. Pakai token', pola: /\b(rgba?|hsla?)\(/ },
  {
    kode: 'WARNA_BAWAAN',
    pesan: 'Warna bawaan Tailwind. Pakai token desain (daun-tua, tanah, …)',
    pola: new RegExp(`\\b(${AWALAN_WARNA})-(${WARNA_BAWAAN})(-\\d{2,3})?\\b`),
  },
  {
    kode: 'TEKS_KECIL',
    pesan: 'Teks lebih kecil dari 16px dilarang',
    pola: /\btext-(xs|sm|base|lg|xl|[2-9]xl)\b/,
  },
  {
    kode: 'BAYANGAN',
    pesan: 'Bayangan jatuh dilarang. Hanya shadow-fokus/pilihan/garis',
    pola: /\bshadow-(sm|md|lg|xl|2xl|inner)\b/,
  },
  {
    kode: 'NILAI_SEMBARANG',
    pesan: 'Ukuran sembarang [..px/rem] atau warna [#..]. Tambahkan token',
    pola: /-\[(-?\d+(\.\d+)?(px|rem|em)|#)[^\]]*\]/,
  },
  {
    kode: 'SERVICE_ROLE',
    pesan: 'Service role key Supabase dilarang di frontend',
    pola: /service[_-]?role|SERVICE_ROLE|VITE_SUPABASE_SERVICE/i,
  },
];

/** Ambil isi string literal ('…', "…", `…`) dari kode TS. Sederhana, cukup untuk berkas teks. */
export function stringLiteral(kode) {
  const hasil = [];
  const re = /'((?:\\.|[^'\\\n])*)'|"((?:\\.|[^"\\\n])*)"|`((?:\\.|[^`\\])*)`/g;
  let m;
  while ((m = re.exec(kode))) hasil.push({ isi: m[1] ?? m[2] ?? m[3] ?? '', indeks: m.index });
  return hasil;
}

/** Teks JSX yang tampil: simpul teks dan atribut aria-label/title/placeholder/alt. */
export function teksJsx(kode) {
  const hasil = [];
  const reSimpul = />([^<>{}]*[A-Za-z][^<>{}]*)</g;
  let m;
  while ((m = reSimpul.exec(kode))) hasil.push({ isi: m[1], indeks: m.index + 1 });
  const reAtribut = /\b(aria-label|title|placeholder|alt)="([^"]*)"/g;
  while ((m = reAtribut.exec(kode))) hasil.push({ isi: m[2], indeks: m.index });
  return hasil;
}

/** Periksa satu potong teks tampilan terhadap kata terlarang dan huruf kapital semua. */
export function cekTeksTampil(isi, daftar) {
  const salah = [];
  for (const k of daftar.kata) {
    if (new RegExp(`(^|[^\\p{L}])${k}([^\\p{L}]|$)`, 'iu').test(isi))
      salah.push(`kata terlarang "${k}"`);
  }
  for (const k of daftar.kataPersis) {
    if (new RegExp(`(^|[^\\p{L}])${k}([^\\p{L}]|$)`, 'u').test(isi))
      salah.push(`kata terlarang "${k}"`);
  }
  // Huruf kapital semua: minimal dua kata berhuruf semua kapital berurutan (mis. "SIMPAN RENCANA").
  if (/\b\p{Lu}{2,}\b[\s,.:]+\b\p{Lu}{2,}\b/u.test(isi)) salah.push('huruf kapital semua');
  return salah;
}

function nomorBaris(kode, indeks) {
  return kode.slice(0, indeks).split('\n').length;
}

/** Hapus komentar supaya catatan pengembang tidak ikut diperiksa. */
export function buangKomentar(kode) {
  return kode
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`])\/\/[^\n]*/g, (m, awal) => awal + ' '.repeat(m.length - awal.length));
}

/**
 * Periksa satu berkas. `jalur` relatif terhadap akar proyek dengan garis miring "/".
 * Mengembalikan daftar pelanggaran { jalur, baris, kode, pesan }.
 */
export function periksaBerkas(jalur, isi, daftar) {
  const pelanggaran = [];
  const kode = buangKomentar(isi);
  const barisBarisan = kode.split('\n');
  barisBarisan.forEach((baris, i) => {
    for (const a of ATURAN_POLA) {
      if (a.pola.test(baris))
        pelanggaran.push({ jalur, baris: i + 1, kode: a.kode, pesan: a.pesan });
    }
  });
  const potong = [];
  if (jalur.startsWith('src/teks/')) potong.push(...stringLiteral(kode));
  if (jalur.endsWith('.tsx')) potong.push(...teksJsx(kode));
  for (const p of potong) {
    for (const s of cekTeksTampil(p.isi, daftar)) {
      pelanggaran.push({
        jalur,
        baris: nomorBaris(kode, p.indeks),
        kode: 'BAHASA',
        pesan: `Teks tampilan: ${s}`,
      });
    }
  }
  return pelanggaran;
}
