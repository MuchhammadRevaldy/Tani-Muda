/**
 * Format angka, uang, dan tanggal untuk tampilan. Fungsi murni: tanpa Intl/toLocaleString
 * supaya hasilnya sama di semua browser dan dengan port PHP di backend.
 * Aturan format: docs/ringkasan-desain.md bagian 4, keputusan.md D-09.
 */

/** Tanda minus tipografis (U+2212) untuk angka negatif. */
export const MINUS = '−';

/** Sisipkan titik ribuan pada bilangan bulat non-negatif: 1250000 → "1.250.000". */
export function titikRibuan(n: number): string {
  return String(Math.trunc(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Bulatkan ke rupiah penuh. Satu-satunya tempat pembulatan uang. */
export function bulatkanRupiah(n: number): number {
  // Math.round membulatkan -0,5 ke 0; untuk uang dibulatkan menjauhi nol.
  return Math.sign(n) * Math.round(Math.abs(n));
}

/** "Rp1.250.000", negatif "−Rp80.000". Kosong untuk null/NaN. */
export function formatRupiah(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const bulat = bulatkanRupiah(n);
  return (bulat < 0 ? MINUS : '') + 'Rp' + titikRibuan(bulat);
}

const SATUAN = [
  '',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
];

function eja(n: number): string {
  if (n < 12) return SATUAN[n] ?? '';
  if (n < 20) return eja(n - 10) + ' belas';
  if (n < 100) return eja(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + eja(n % 10) : '');
  if (n < 200) return 'seratus' + (n - 100 ? ' ' + eja(n - 100) : '');
  if (n < 1000) return eja(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + eja(n % 100) : '');
  if (n < 2000) return 'seribu' + (n - 1000 ? ' ' + eja(n - 1000) : '');
  if (n < 1e6) return eja(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + eja(n % 1000) : '');
  if (n < 1e9) return eja(Math.floor(n / 1e6)) + ' juta' + (n % 1e6 ? ' ' + eja(n % 1e6) : '');
  if (n < 1e12) return eja(Math.floor(n / 1e9)) + ' miliar' + (n % 1e9 ? ' ' + eja(n % 1e9) : '');
  return eja(Math.floor(n / 1e12)) + ' triliun' + (n % 1e12 ? ' ' + eja(n % 1e12) : '');
}

/** Ejaan rupiah: 5000 → "Lima ribu rupiah". Pecahan diabaikan. Kosong untuk null/NaN. */
export function terbilang(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const b = Math.floor(Math.abs(n));
  const kata = b === 0 ? 'nol' : eja(b);
  const awal = (n < 0 && b > 0 ? 'minus ' : '') + kata;
  return awal.charAt(0).toUpperCase() + awal.slice(1) + ' rupiah';
}

/**
 * Angka desimal dengan koma: 6.1 → "6,1"; 1250.5 → "1.250,5".
 * `digit` = jumlah desimal maksimum; `tetap` = selalu tampilkan sejumlah digit itu.
 */
export function formatDesimal(n: number, digit = 1, tetap = false): string {
  if (Number.isNaN(n)) return '';
  const faktor = 10 ** digit;
  const bulat = Math.round(Math.abs(n) * faktor) / faktor;
  const [utuh = '0', pecahan = ''] = (tetap ? bulat.toFixed(digit) : String(bulat)).split('.');
  const tanda = n < 0 && bulat !== 0 ? MINUS : '';
  return tanda + titikRibuan(Number(utuh)) + (pecahan ? ',' + pecahan : '');
}

/**
 * Baca angka ketikan pengguna Indonesia: "1.250,5" → 1250.5; "6,2" → 6.2; " 100 " → 100.
 * Kosong atau tidak valid → null (bukan 0, supaya "belum diisi" bisa dibedakan dari nol).
 */
export function parseAngka(teks: string | null | undefined): number | null {
  if (teks === null || teks === undefined) return null;
  const s = String(teks).replace(/\s/g, '').replace(MINUS, '-');
  if (s === '') return null;
  if (!/^-?[\d.]*(,\d*)?$/.test(s)) return null;
  const angka = s.replace(/\./g, '').replace(',', '.');
  if (angka === '' || angka === '-' || angka === '.') return null;
  const v = Number(angka);
  return Number.isFinite(v) ? v : null;
}

/** Hitung mundur menit:detik: 42 → "0:42", 125 → "2:05". Negatif dianggap 0. */
export function formatHitungMundur(detik: number): string {
  const d = Math.max(0, Math.ceil(detik));
  return `${Math.floor(d / 60)}:${String(d % 60).padStart(2, '0')}`;
}

/** Jam dengan titik: (6, 0) → "06.00". */
export function formatJam(jam: number, menit = 0): string {
  return String(jam).padStart(2, '0') + '.' + String(menit).padStart(2, '0');
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const BULAN_PENDEK = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/** Tanggal kalender tanpa jam, "YYYY-MM-DD". Dipakai di seluruh jadwal agar bebas zona waktu. */
export type TanggalISO = string;

function urai(tanggal: TanggalISO): { th: number; bl: number; tg: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggal);
  if (!m) throw new Error('Tanggal harus berformat YYYY-MM-DD: ' + tanggal);
  const th = Number(m[1]);
  const bl = Number(m[2]);
  const tg = Number(m[3]);
  const d = new Date(Date.UTC(th, bl - 1, tg));
  if (d.getUTCMonth() !== bl - 1 || d.getUTCDate() !== tg) {
    throw new Error('Tanggal tidak ada: ' + tanggal);
  }
  return { th, bl, tg };
}

/** Nama hari dari tanggal ISO. */
export function namaHari(tanggal: TanggalISO): string {
  const { th, bl, tg } = urai(tanggal);
  return HARI[new Date(Date.UTC(th, bl - 1, tg)).getUTCDay()] ?? '';
}

/**
 * "Sabtu, 3 Oktober". `denganTahun` → "Sabtu, 3 Oktober 2026". `tanpaHari` → "3 Oktober".
 */
export function formatTanggal(
  tanggal: TanggalISO,
  opsi: { denganTahun?: boolean; tanpaHari?: boolean } = {},
): string {
  const { th, bl, tg } = urai(tanggal);
  const inti = `${tg} ${BULAN[bl - 1]}` + (opsi.denganTahun ? ` ${th}` : '');
  return opsi.tanpaHari ? inti : `${namaHari(tanggal)}, ${inti}`;
}

/** "5 Okt". */
export function formatTanggalPendek(tanggal: TanggalISO): string {
  const { bl, tg } = urai(tanggal);
  return `${tg} ${BULAN_PENDEK[bl - 1]}`;
}

/** Kisaran dengan en dash: (5.5, 6.5) → "5,5–6,5"; dengan pemformat lain bila diberikan. */
export function formatKisaran(
  bawah: number,
  atas: number,
  format: (n: number) => string = (n) => formatDesimal(n, 1),
): string {
  return `${format(bawah)}–${format(atas)}`;
}
