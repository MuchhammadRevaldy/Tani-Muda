import type { Config } from 'tailwindcss';

/**
 * Token desain Tani Muda. Sumber: tema baru D-59 (artifact "Tema Baru Tani Muda", papan Sistem tema) dan
 * docs/ringkasan-desain.md bagian 1. Nama token lama dipertahankan dengan nilai baru (D-59) supaya
 * pemakaian di halaman tidak perlu diganti sebelum lomba; penggantian nama dikerjakan setelahnya.
 *
 * Bagian tema di bawah sengaja MENGGANTI tema bawaan Tailwind (bukan `extend`), sehingga
 * warna bawaan (`bg-green-600`), ukuran teks kecil (`text-sm`), dan bayangan (`shadow-md`)
 * tidak tersedia sama sekali. Menambah token: ubah di sini DAN di ringkasan-desain.md.
 */

/** Warna desain (D-59). Satu-satunya tempat hex boleh ditulis. */
export const warna = {
  // Limau: tombol utama dan progres. Teks putih di atas limau kontrasnya 1,8–2,5:1, diterima
  // pemilik produk sebagai utang desain yang wajib ditinjau sebelum pilot (D-59).
  limau: '#86C232',
  'limau-terang': '#95D23B',
  'limau-tekan': '#76B52A',
  // Limau tua: peran teks, garis pilihan, dan ikon aktif (6,4:1 di atas putih).
  'daun-tua': '#3D6B0E',
  'daun-tekan': '#2F540A',
  'daun-lembut': '#EEF8DF',
  'embun-pagi': '#F7F8FA',
  putih: '#FFFFFF',
  // Oranye: aksen, tombol tambah, lencana. Untuk teks dipakai oranye tua (tanah, 5,1:1).
  oranye: '#F27F3D',
  'oranye-terang': '#F79459',
  'oranye-tekan': '#EE6F2C',
  tanah: '#B4501A',
  'tanah-lembut': '#FEEEE4',
  matahari: '#F5A524',
  'matahari-teks': '#8A5200',
  'matahari-lembut': '#FFF5E0',
  tomat: '#E5484D',
  'tomat-teks': '#B4262B',
  'tomat-lembut': '#FDECEC',
  // Biru tua: teks utama dan kartu sorotan.
  teks: '#2E3547',
  // Teks pendukung di atas kartu sorotan biru tua (7,8:1).
  'teks-redup': '#C9CEDA',
  'teks-pendukung': '#687083',
  garis: '#EEF0F3',
  // Garis kontrol (kolom isian, lingkaran centang): minimal 3:1 terhadap putih (WCAG 1.4.11).
  'garis-kuat': '#8A91A0',
} as const;

/** Bayangan bernama (D-59). Bayangan bawaan Tailwind tetap dilarang (cek-aturan BAYANGAN). */
const bayangan = {
  kartu: '0 24px 48px rgba(46,53,71,.10)',
  ikon: '0 10px 24px rgba(46,53,71,.10)',
  'cahaya-limau': '0 16px 32px rgba(134,194,50,.45)',
  'cahaya-oranye': '0 14px 28px rgba(242,127,61,.45)',
  // Hover di perangkat berkursor (D-61): sedikit lebih tebal atau lebih terang.
  'kartu-angkat': '0 28px 56px rgba(46,53,71,.14)',
  'cahaya-limau-terang': '0 18px 36px rgba(134,194,50,.55)',
  'cahaya-oranye-terang': '0 16px 32px rgba(242,127,61,.55)',
};

/**
 * Gerak (D-61): durasi, kurva, dan keyframes sebagai token. Hanya transform dan opacity; semuanya
 * mati di prefers-reduced-motion (src/index.css). Setiap animasi berakhir di `transform: none`
 * supaya pembungkus konten tidak menjadi blok penampung bagi dialog `position: fixed`.
 */
const kurvaKeluar = 'cubic-bezier(.2,.8,.2,1)';
const gerak = {
  durasi: { cepat: '150ms', sedang: '200ms', lambat: '250ms', bertahap: '300ms', muncul: '400ms' },
  kurva: { keluar: kurvaKeluar },
  jeda: { bertahap: '50ms' },
  keyframes: {
    'masuk-halaman': {
      from: { opacity: '0', transform: 'translateY(8px)' },
      to: { opacity: '1', transform: 'none' },
    },
    'muncul-bertahap': {
      from: { opacity: '0', transform: 'translateY(8px)' },
      to: { opacity: '1', transform: 'none' },
    },
    denyut: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '.55' } },
  },
  animasi: {
    'masuk-halaman': `masuk-halaman 200ms ${kurvaKeluar} both`,
    'muncul-bertahap': `muncul-bertahap 300ms ${kurvaKeluar} both`,
    denyut: 'denyut 1.6s ease-in-out infinite',
  },
};

/** Ukuran bernama yang dipakai berulang di desain. */
const ukuranBernama = {
  sentuh: '48px', // target sentuh minimum
  kontrol: '56px', // tinggi tombol dan kolom isian (D-59: 56–60px)
  chip: '34px',
  lingkaran: '30px', // lingkaran centang tugas
  pin: '28px',
  'pin-lebar': '32px',
  'nav-ikon': '56px',
  'nav-item': '64px',
  'baris-tugas': '72px',
  sidebar: '256px',
  'tab-siklus': '360px',
  panel: '360px', // panel samping desktop alur Hitung (papan 10–19)
  dialog: '480px',
  // Kartu pemilih siklus di Beranda (AG-17): HP memperlihatkan tepi kartu berikutnya.
  'kartu-siklus': '264px',
  'kartu-siklus-lebar': '288px',
};

/** Skala jarak dan ukuran berbasis 4px (dan 2px untuk detail kecil). */
const skala = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  0.75: '3px', // geser panah tautan saat hover (D-61)
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  4.5: '18px',
  5: '20px',
  6: '24px',
  6.5: '26px',
  7: '28px',
  7.5: '30px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  18: '72px',
  20: '80px',
  22: '88px',
  24: '96px',
  26: '104px',
  ...ukuranBernama,
};

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      md: '768px', // dua kolom
      lg: '1024px', // sidebar desktop muncul
      xl: '1280px',
      desktop: '1440px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      ...warna,
      // Tirai di belakang dialog/sheet: warna teks 56% (papan 11).
      tirai: 'rgb(46 53 71 / 0.56)',
    },
    fontFamily: {
      sans: ['Outfit', 'system-ui', '"Segoe UI"', 'sans-serif'],
    },
    // [ukuran, tinggi baris]. Teks paling kecil 16px.
    fontSize: {
      keterangan: ['16px', '22px'],
      isi: ['16px', '24px'],
      nav: ['16px', '20px'],
      'judul-bagian': ['18px', '26px'],
      uang: ['20px', '28px'],
      'judul-halaman': ['22px', '28px'],
      'tampil-1': ['24px', '32px'],
      'tampil-2': ['26px', '34px'],
      'tampil-3': ['34px', '42px'],
      'tampil-4': ['36px', '44px'],
      'tampil-5': ['52px', '60px'],
      // Judul halaman Masuk desktop (papan 02 desktop).
      'judul-masuk': ['32px', '40px'],
      // Hanya untuk halaman /komponen (meniru papan dokumentasi 00).
      'dok-1': ['28px', '36px'],
      'dok-2': ['48px', '56px'],
      'dok-3': ['96px', '96px'],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      // Hanya judul besar (hero halaman depan, nama di Beranda), seperti papan D-59.
      bold: '700',
    },
    lineHeight: {
      none: '1',
      5: '20px',
      5.5: '22px',
      6: '24px',
      6.5: '26px',
      7: '28px',
      8: '32px',
    },
    letterSpacing: {
      normal: '0',
      rapat: '-0.01em',
      // Label kecil berjarak huruf (papan Sistem tema D-59).
      lebar: '0.12em',
    },
    spacing: skala,
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '8px',
      ikon: '10px',
      md: '12px',
      tab: '14px',
      lg: '16px',
      sheet: '20px',
      kartu: '24px',
      nav: '28px', // navigasi bawah mengambang (papan Beranda HP)
      'kartu-besar': '32px',
      full: '9999px',
    },
    borderWidth: {
      DEFAULT: '1px',
      0: '0',
      1.5: '1.5px',
      2: '2px',
      2.5: '2.5px',
      3: '3px',
    },
    boxShadow: {
      none: 'none',
      ...bayangan,
      fokus: `0 0 0 2px ${warna.putih}, 0 0 0 4px ${warna['daun-tua']}`,
      pilihan: `inset 0 0 0 2px ${warna['daun-tua']}`,
      garis: `0 0 0 1px ${warna.garis}`,
    },
    maxWidth: {
      none: 'none',
      'pilihan-kotak': '320px',
      desktop: '1440px',
      full: '100%',
      hp: '390px',
      dialog: '480px',
      teks: '640px',
      dok: '900px',
      pembeli: '1152px',
      konten: '1200px',
    },
    backgroundImage: {
      none: 'none',
      // Gradasi tombol (D-59): atas terang, bawah tekan.
      'tombol-limau': `linear-gradient(180deg, ${warna['limau-terang']} 0%, ${warna['limau-tekan']} 100%)`,
      'tombol-oranye': `linear-gradient(180deg, ${warna['oranye-terang']} 0%, ${warna['oranye-tekan']} 100%)`,
      'progres-limau': `linear-gradient(90deg, ${warna['limau-tekan']} 0%, ${warna['limau-terang']} 100%)`,
    },
    extend: {
      transitionDuration: gerak.durasi,
      transitionTimingFunction: gerak.kurva,
      transitionDelay: gerak.jeda,
      keyframes: gerak.keyframes,
      animation: gerak.animasi,
      textUnderlineOffset: { 3: '3px' },
      // Foto bukti, jurnal, dan foto kiriman (papan 22, 28).
      aspectRatio: { foto: '4 / 3' },
      // Tata letak halaman /komponen (meniru papan 00).
      gridTemplateColumns: {
        // Baris saran tanam bertahap: label petak lalu garis waktu (papan 31).
        'baris-petak': '160px minmax(0, 1fr)',
        'label-dok': '200px minmax(0, 1fr)',
        'penggaris-dok': '392px minmax(0, 1fr)',
      },
      height: { 'demo-sidebar': '620px' },
      minWidth: ukuranBernama,
      minHeight: { ...ukuranBernama, layar: '100vh' },
    },
  },
  plugins: [],
  // Gaya hover hanya di perangkat yang mendukung hover (kursor), tidak menempel di layar sentuh (D-61).
  future: { hoverOnlyWhenSupported: true },
};

export default config;
