/**
 * Ikon garis 24px tebal 1,7, ujung bulat, warna mengikuti teks (currentColor) (D-59).
 * Sumber: pustaka desain (design/extracted/assets/pustaka-komponen-tani-muda.js) dan design/icons/.
 * Tanpa `label` → dekoratif (aria-hidden). Dengan `label` → role="img".
 */

// Isi SVG statis dari desain. Bukan masukan pengguna, aman disisipkan.
const IKON = {
  beranda: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  kebun:
    '<path d="M12 21v-9"/><path d="M12 12c0-4 3-7 8-7 0 4-3 7-8 7z"/><path d="M12 14c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5z"/>',
  pesanan: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  belajar: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4-2.5-4-2.5z"/>',
  centang: '<path d="M5 12.6 9.6 17.2 19 7.6"/>',
  kamera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  jam: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.6V12l3 2"/>',
  peringatan:
    '<path d="M10.4 4.4 3 17.6c-.7 1.2.2 2.7 1.6 2.7h14.8c1.4 0 2.3-1.5 1.6-2.7L13.6 4.4c-.7-1.2-2.5-1.2-3.2 0Z"/><path d="M12 9.4v4.2"/><path d="M12 16.9h.01"/>',
  kunci:
    '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/><path d="M12 14.4v2.4"/>',
  'jam-pasir':
    '<path d="M6.5 3.5h11"/><path d="M6.5 20.5h11"/><path d="M8 3.5v2.2c0 2.3 4 4 4 6.3s-4 4-4 6.3v2.2"/><path d="M16 3.5v2.2c0 2.3-4 4-4 6.3s4 4 4 6.3v2.2"/>',
  uang: '<rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v5M17.5 9.5v5"/>',
  offline:
    '<path d="M3.5 3.5l17 17"/><path d="M9.4 6.4a5.6 5.6 0 0 1 8 3.6 4.1 4.1 0 0 1 2.5 6.6"/><path d="M16.6 18.3H7.2a4.3 4.3 0 0 1-.9-8.5"/>',
  panen:
    '<path d="M3.8 10.2h16.4l-1.7 8.6c-.2.9-1 1.5-1.9 1.5H7.4c-.9 0-1.7-.6-1.9-1.5Z"/><path d="M8 10.2 11 4.6"/><path d="M16 10.2 13 4.6"/><path d="M9.6 13.6v3.2"/><path d="M14.4 13.6v3.2"/>',
  lonceng: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  'panah-kanan': '<path d="M9.5 5.8 15.7 12l-6.2 6.2"/>',
  'panah-kiri': '<path d="M14.5 5.8 8.3 12l6.2 6.2"/>',
  // Ikon tipe tugas (P0-12): tertanam di halaman desain, diekstrak ke design/extracted/ikon-sebaris/.
  kalender:
    '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  ulang: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4.5h-4.5"/>',
  luas: '<path d="M8 3v18M5 6l3-3 3 3M5 18l3 3 3-3"/><path d="M15 6h4M15 10h3M15 14h4M15 18h3"/>',
  pengukur:
    '<path d="M3.5 16.5a8.5 8.5 0 0 1 17 0"/><path d="M12 16.5l4-5"/><circle cx="12" cy="16.5" r="1.4"/><path d="M6.2 12.4l1 .8M17.8 12.4l-1 .8M12 8v1.3"/>',
  // Panah naik-turun di tombol akun sidebar (papan desktop).
  'panah-naik-turun': '<path d="M8 9l4-4 4 4"/><path d="M8 15l4 4 4-4"/>',
  // Tambahan di luar desain: tombol tutup dialog, gaya garis yang sama.
  silang: '<path d="M6.5 6.5l11 11"/><path d="M17.5 6.5l-11 11"/>',
  // Ikon inline di papan Hitung (10–19): cari, pilih merek, ubah jumlah, catatan kios resmi, hapus.
  cari: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.4 15.4l4.6 4.6"/>',
  label:
    '<path d="M3.8 12.6V4.8c0-.6.4-1 1-1h7.8l7.6 7.6c.4.4.4 1 0 1.4l-6.8 6.8c-.4.4-1 .4-1.4 0Z"/><circle cx="8.3" cy="8.3" r="1.3"/>',
  pensil:
    '<path d="M4.5 19.5l1-4.2L15.8 5c.8-.8 2-.8 2.8 0l.4.4c.8.8.8 2 0 2.8L8.7 18.5Z"/><path d="M13.8 7l3.2 3.2"/>',
  tambah: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  kurang: '<path d="M5 12h14"/>',
  // Pemutar dan unduhan modul belajar (papan 08, 09, halaman turunan 42).
  putar: '<path d="M8.5 5.5v13l10-6.5Z"/>',
  jeda: '<path d="M8.5 5.5v13"/><path d="M15.5 5.5v13"/>',
  unduh: '<path d="M12 4v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19.5h14"/>',
  'layar-penuh':
    '<path d="M4.5 9V4.5H9"/><path d="M15 4.5h4.5V9"/><path d="M19.5 15v4.5H15"/><path d="M9 19.5H4.5V15"/>',
  bintang: '<path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.6l-5 2.6.9-5.6-4-3.9 5.6-.8Z"/>',
  info: '<circle cx="12" cy="12" r="8.2"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  hapus:
    '<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l.9 12.2c.1.7.6 1.3 1.3 1.3h6.6c.7 0 1.2-.6 1.3-1.3L17.5 7"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
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

export function Ikon({ nama, ukuran = 24, tebal = 1.7, label, className }: IkonProps) {
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

/** Ikon di dalam lingkaran putih berbayang, untuk statistik dan angka ringkas (D-59). */
export function IkonLingkaran({
  nama,
  besar,
  className,
}: {
  nama: NamaIkon;
  /** 56px (halaman depan desktop); bawaan 44px. */
  besar?: boolean;
  className?: string;
}) {
  return (
    <span
      className={[
        'grid flex-none place-items-center rounded-full bg-putih text-teks shadow-ikon',
        besar ? 'h-14 w-14' : 'h-11 w-11',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Ikon nama={nama} ukuran={besar ? 26 : 22} />
    </span>
  );
}
