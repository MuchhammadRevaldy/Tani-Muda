/**
 * Ikon garis 24px, ujung bulat, warna mengikuti teks (currentColor).
 * Sumber: pustaka desain (design/extracted/assets/18ad3183d4.js) dan design/icons/.
 * Tanpa `label` → dekoratif (aria-hidden). Dengan `label` → role="img".
 */

// Isi SVG statis dari desain. Bukan masukan pengguna, aman disisipkan.
const IKON = {
  beranda:
    '<path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.8 9v10.2c0 .5.4.8.8.8H10v-5.5h4V20h3.4c.4 0 .8-.3.8-.8V9"/>',
  kebun:
    '<path d="M12 20.5v-8.5"/><path d="M12 12c0-3.9-2.6-6.5-7.5-6.5 0 4.2 2.8 6.5 7.5 6.5Z"/><path d="M12 14.5c0-3.4 2.3-5.8 7-5.8 0 3.6-2.6 5.8-7 5.8Z"/><path d="M4.5 20.5h15"/>',
  pesanan:
    '<path d="M6 3.5h12v17l-2.4-1.6-2.4 1.6-1.2-.8-1.2.8-2.4-1.6L6 20.5Z"/><path d="M9.5 8.5h5"/><path d="M9.5 12.5h5"/>',
  belajar:
    '<path d="M12 6.8C10.4 5.2 7.9 4.6 3.8 4.6v13.2c4.1 0 6.6.6 8.2 2.2 1.6-1.6 4.1-2.2 8.2-2.2V4.6c-4.1 0-6.6.6-8.2 2.2Z"/><path d="M12 6.8V20"/>',
  centang: '<path d="M5 12.6 9.6 17.2 19 7.6"/>',
  kamera:
    '<path d="M3.8 8.6c0-.9.7-1.6 1.6-1.6h2.3l1.6-2.5h5.4L16.3 7h2.3c.9 0 1.6.7 1.6 1.6v9.3c0 .9-.7 1.6-1.6 1.6H5.4c-.9 0-1.6-.7-1.6-1.6Z"/><circle cx="12" cy="12.8" r="3.4"/>',
  jam: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.6V12l3 2"/>',
  peringatan:
    '<path d="M10.4 4.4 3 17.6c-.7 1.2.2 2.7 1.6 2.7h14.8c1.4 0 2.3-1.5 1.6-2.7L13.6 4.4c-.7-1.2-2.5-1.2-3.2 0Z"/><path d="M12 9.4v4.2"/><path d="M12 16.9h.01"/>',
  kunci:
    '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/><path d="M12 14.4v2.4"/>',
  'jam-pasir':
    '<path d="M6.5 3.5h11"/><path d="M6.5 20.5h11"/><path d="M8 3.5v2.2c0 2.3 4 4 4 6.3s-4 4-4 6.3v2.2"/><path d="M16 3.5v2.2c0 2.3-4 4-4 6.3s4 4 4 6.3v2.2"/>',
  uang: '<rect x="2.8" y="6.5" width="18.4" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.4 10v4"/><path d="M17.6 10v4"/>',
  offline:
    '<path d="M3.5 3.5l17 17"/><path d="M9.4 6.4a5.6 5.6 0 0 1 8 3.6 4.1 4.1 0 0 1 2.5 6.6"/><path d="M16.6 18.3H7.2a4.3 4.3 0 0 1-.9-8.5"/>',
  panen:
    '<path d="M3.8 10.2h16.4l-1.7 8.6c-.2.9-1 1.5-1.9 1.5H7.4c-.9 0-1.7-.6-1.9-1.5Z"/><path d="M8 10.2 11 4.6"/><path d="M16 10.2 13 4.6"/><path d="M9.6 13.6v3.2"/><path d="M14.4 13.6v3.2"/>',
  lonceng:
    '<path d="M6.2 16.6v-5.4a5.8 5.8 0 0 1 11.6 0v5.4l1.7 1.7h-15Z"/><path d="M10 20.6a2.1 2.1 0 0 0 4 0"/>',
  'panah-kanan': '<path d="M9.5 5.8 15.7 12l-6.2 6.2"/>',
  'panah-kiri': '<path d="M14.5 5.8 8.3 12l6.2 6.2"/>',
  // Ikon tipe tugas (P0-12): tertanam di halaman desain, diekstrak ke design/extracted/icons-inline/.
  kalender:
    '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><path d="M11.9 14.6h.2"/>',
  ulang:
    '<path d="M4.5 11.5a7.5 7.5 0 0 1 13-5.1l2 2.1"/><path d="M19.5 4v4.5H15"/><path d="M19.5 12.5a7.5 7.5 0 0 1-13 5.1l-2-2.1"/><path d="M4.5 20v-4.5H9"/>',
  pengukur:
    '<path d="M3.5 16.5a8.5 8.5 0 0 1 17 0"/><path d="M12 16.5l4-5"/><circle cx="12" cy="16.5" r="1.4"/><path d="M6.2 12.4l1 .8M17.8 12.4l-1 .8M12 8v1.3"/>',
  // Panah naik-turun di tombol akun sidebar (papan desktop).
  'panah-naik-turun': '<path d="M8 9l4-4 4 4"/><path d="M8 15l4 4 4-4"/>',
  // Tambahan di luar desain: tombol tutup dialog, gaya garis yang sama.
  silang: '<path d="M6.5 6.5l11 11"/><path d="M17.5 6.5l-11 11"/>',
} as const;

export type NamaIkon = keyof typeof IKON;
export const daftarIkon = Object.keys(IKON) as NamaIkon[];
/** 16 ikon resmi di design/icons/. */
export const ikonDesain: NamaIkon[] = [
  'beranda',
  'kebun',
  'pesanan',
  'belajar',
  'centang',
  'kamera',
  'jam',
  'peringatan',
  'kunci',
  'jam-pasir',
  'uang',
  'offline',
  'panen',
  'lonceng',
  'panah-kanan',
  'panah-kiri',
];

export interface IkonProps {
  nama: NamaIkon;
  ukuran?: number;
  tebal?: number;
  /** Label untuk pembaca layar. Kosongkan bila ikon hanya hiasan di samping kata. */
  label?: string;
  className?: string;
}

export function Ikon({ nama, ukuran = 24, tebal = 2, label, className }: IkonProps) {
  const berlabel = Boolean(label);
  return (
    <svg
      className={['block flex-none', className].filter(Boolean).join(' ')}
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={tebal}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={berlabel ? 'img' : undefined}
      aria-label={berlabel ? label : undefined}
      aria-hidden={berlabel ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: IKON[nama] }}
    />
  );
}

/** Tipe tugas resep (P0-12): ikon berbeda untuk sekali, berulang, pengukuran. */
export type TipeTugas = 'sekali' | 'berulang' | 'ukur';

const IKON_TIPE: Record<TipeTugas, NamaIkon> = {
  sekali: 'kalender',
  berulang: 'ulang',
  ukur: 'pengukur',
};

export function IkonTipeTugas({
  tipe,
  ukuran = 20,
  label,
  className,
}: {
  tipe: TipeTugas;
  ukuran?: number;
  label?: string;
  className?: string;
}) {
  return (
    <Ikon
      nama={IKON_TIPE[tipe]}
      ukuran={ukuran}
      label={label}
      className={['text-daun-tua', className].filter(Boolean).join(' ')}
    />
  );
}
