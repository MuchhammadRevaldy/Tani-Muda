import type { Config } from 'tailwindcss';

/**
 * Token desain Tani Muda. Sumber: design/extracted/pages/00-sistem-desain-desktop.html (papan sistem desain)
 * dan docs/ringkasan-desain.md bagian 1.
 *
 * Bagian tema di bawah sengaja MENGGANTI tema bawaan Tailwind (bukan `extend`), sehingga
 * warna bawaan (`bg-green-600`), ukuran teks kecil (`text-sm`), dan bayangan (`shadow-md`)
 * tidak tersedia sama sekali. Menambah token: ubah di sini DAN di ringkasan-desain.md.
 */

/** 17 warna desain. Satu-satunya tempat hex boleh ditulis. */
export const warna = {
  'daun-tua': '#1E6B45',
  'daun-tekan': '#16573A',
  'daun-lembut': '#E3F0E5',
  'embun-pagi': '#F3F7EF',
  putih: '#FFFFFF',
  tanah: '#6B4A2E',
  'tanah-lembut': '#F4ECE3',
  matahari: '#D99A1E',
  'matahari-teks': '#8A5A00',
  'matahari-lembut': '#FFF4DA',
  tomat: '#C8402E',
  'tomat-teks': '#A93624',
  'tomat-lembut': '#FCEBE7',
  teks: '#1F2420',
  'teks-pendukung': '#5B665D',
  garis: '#DDE6D8',
  'garis-kuat': '#738076',
} as const;

/** Ukuran bernama yang dipakai berulang di desain. */
const ukuranBernama = {
  sentuh: '48px', // target sentuh minimum
  kontrol: '52px', // tinggi tombol dan kolom isian
  chip: '34px',
  lingkaran: '30px', // lingkaran centang tugas
  pin: '28px',
  'pin-lebar': '32px',
  'nav-ikon': '56px',
  'nav-item': '64px',
  'baris-tugas': '72px',
  sidebar: '256px',
  'tab-siklus': '360px',
  dialog: '480px',
};

/** Skala jarak dan ukuran berbasis 4px (dan 2px untuk detail kecil). */
const skala = {
  0: '0px',
  px: '1px',
  0.5: '2px',
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
      tirai: 'rgb(31 36 32 / 0.56)',
    },
    fontFamily: {
      sans: ['"Plus Jakarta Sans"', 'system-ui', '"Segoe UI"', 'sans-serif'],
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
      // Satu-satunya bayangan: cincin fokus dan cincin pilihan. Tidak ada bayangan jatuh.
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
    extend: {
      textUnderlineOffset: { 3: '3px' },
      // Tata letak halaman /komponen (meniru papan 00).
      gridTemplateColumns: {
        'label-dok': '200px minmax(0, 1fr)',
        'penggaris-dok': '392px minmax(0, 1fr)',
      },
      height: { 'demo-sidebar': '620px' },
      minWidth: ukuranBernama,
      minHeight: { ...ukuranBernama, layar: '100vh' },
    },
  },
  plugins: [],
};

export default config;
