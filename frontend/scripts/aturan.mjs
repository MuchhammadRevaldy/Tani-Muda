/**
 * Pemeriksa aturan proyek (aturan-proyek.md bagian 2, 1, dan 6; keputusan.md D-09).
 * Fungsi murni supaya bisa diuji; dijalankan oleh scripts/cek-aturan.mjs.
 */

const WARNA_BAWAAN =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black';
const AWALAN_WARNA =
  'bg|text|border|ring|fill|stroke|from|to|via|outline|divide|placeholder|shadow|accent|caret|decoration';

/** Token bayangan di tailwind.config.ts (D-59). Selain ini, kelas shadow-* dilarang. */
const BAYANGAN_BERNAMA = [
  'none',
  'fokus',
  'pilihan',
  'garis',
  'kartu',
  'ikon',
  'cahaya-limau',
  'cahaya-oranye',
  'kartu-angkat',
  'cahaya-limau-terang',
  'cahaya-oranye-terang',
];

/**
 * Nama kunci rahasia backend (D-19): APP_KEY, DB_PASSWORD, VAPID_PRIVATE_KEY, …_SECRET, …_TOKEN
 * milik server, dan service role. Hanya boleh ada di .env backend, tidak pernah di frontend.
 */
const POLA_NAMA_RAHASIA =
  /\b(?:VITE_)?(?:APP_KEY|DB_PASSWORD|DB_USERNAME|[A-Z0-9_]*(?:SECRET|PRIVATE_KEY|SERVER_KEY|PASSWORD|SERVICE_ROLE)[A-Z0-9_]*)\b|service[_-]?role/;

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
    pesan: `Bayangan bawaan atau sembarang dilarang. Hanya token bernama: shadow-${BAYANGAN_BERNAMA.join('/')} (D-59)`,
    pola: new RegExp(
      `(^|[\\s'"\`:])shadow(?!-(?:${BAYANGAN_BERNAMA.join('|')})(?![\\w-]))(?=[-\\s'"\`]|$)`,
    ),
  },
  {
    kode: 'NILAI_SEMBARANG',
    pesan: 'Ukuran sembarang [..px/rem] atau warna [#..]. Tambahkan token',
    pola: /-\[(-?\d+(\.\d+)?(px|rem|em)|#)[^\]]*\]/,
  },
  {
    kode: 'RAHASIA_BACKEND',
    pesan: 'Nama kunci rahasia backend di frontend. Rahasia hanya di .env backend (D-19)',
    pola: POLA_NAMA_RAHASIA,
  },
  {
    kode: 'PATH_WINDOWS',
    pesan: 'Path khusus Windows (huruf drive). Bangun jalur dengan path.join atau dari .env (D-24)',
    pola: /['"`][A-Za-z]:[\\/]/,
  },
  {
    kode: 'ENV_BUKAN_PUBLIK',
    pesan: 'Frontend hanya boleh membaca import.meta.env.VITE_* dan variabel bawaan Vite',
    pola: /import\.meta\.env\.(?!VITE_|MODE\b|DEV\b|PROD\b|SSR\b|BASE_URL\b)\w+/,
  },
  {
    kode: 'EMOJI',
    pesan: 'Emoji dilarang sebagai ikon atau teks statis. Gunakan komponen Ikon (D-09, AG-37)',
    pola: /[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}]/u,
  },
];

/**
 * Periksa isi `.env.example` frontend: setiap variabel harus berawalan VITE_ (publik) dan namanya
 * tidak boleh tampak seperti rahasia. Mengembalikan pelanggaran { jalur, baris, kode, pesan }.
 */
export function periksaEnvContoh(jalur, isi) {
  const pelanggaran = [];
  isi.split('\n').forEach((baris, i) => {
    const m = baris.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!m) return;
    const nama = m[1];
    if (!nama.startsWith('VITE_'))
      pelanggaran.push({
        jalur,
        baris: i + 1,
        kode: 'ENV_BUKAN_PUBLIK',
        pesan: `${nama}: .env frontend hanya berisi variabel publik VITE_*; rahasia di .env backend`,
      });
    else if (POLA_NAMA_RAHASIA.test(nama))
      pelanggaran.push({
        jalur,
        baris: i + 1,
        kode: 'RAHASIA_BACKEND',
        pesan: `${nama}: variabel VITE_ terbuka di browser; jangan simpan rahasia di sini`,
      });
  });
  return pelanggaran;
}

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
export function cekTeksTampil(isi, daftar, periksaHurufKapital = false) {
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

  // Pola Huruf Kapital Tiap Kata di src/teks/ (D-09, AG-37)
  if (periksaHurufKapital) {
    const bersih = isi.replace(/\b(?:Tani Muda|Pesan Sebelum Tanam|Katering Bu Ratna|Bu Ratna)\b/gu, '');
    if (/\b\p{Lu}\p{Ll}+\b(?:\s+\b\p{Lu}\p{Ll}+\b){2,}/u.test(bersih)) {
      salah.push('pola Huruf Kapital Tiap Kata dilarang (D-09); gunakan kalimat biasa');
    }
  }

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
      if (a.kode === 'EMOJI' && (jalur.startsWith('src/api/tiruan/') || jalur.includes('/data/'))) {
        continue;
      }
      if (a.pola.test(baris))
        pelanggaran.push({ jalur, baris: i + 1, kode: a.kode, pesan: a.pesan });
    }
  });
  // Panel mentor boleh memakai istilah penyuluh (mis. "HST", aturan-proyek.md 1.3).
  const panelMentor = jalur === 'src/teks/panel.ts' || jalur.startsWith('src/halaman/mentor/');
  const boleh = new Set(panelMentor ? (daftar.bolehPanelMentor ?? []) : []);
  const daftarBerkas = {
    ...daftar,
    kata: daftar.kata.filter((k) => !boleh.has(k)),
    kataPersis: daftar.kataPersis.filter((k) => !boleh.has(k)),
  };
  const potong = [];
  const hanyaTeks = jalur.startsWith('src/teks/');
  if (hanyaTeks) potong.push(...stringLiteral(kode));
  if (jalur.endsWith('.tsx')) potong.push(...teksJsx(kode));
  for (const p of potong) {
    for (const s of cekTeksTampil(p.isi, daftarBerkas, hanyaTeks)) {
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
