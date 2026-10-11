/**
 * Ringkasan hasil kalkulator (PRD P0-10, P1-03): pendapatan = panen × harga jual;
 * untung = pendapatan − total modal; titik impas = total modal ÷ harga jual (kg, dibulatkan ke atas).
 * Bila siklus terhubung pesanan, harga kesepakatan menggantikan harga jual.
 */
import { bulatkanRupiah } from './format';
import { berhasil, gagal, type Hasil } from './hasil';

export interface MasukanRingkasan {
  totalModal: number;
  perkiraanPanenKg: number;
  hargaJual: number;
  /** Luas dalam m² untuk modal per m²; kosong untuk hidroponik dan polybag. */
  ukuranM2?: number | null;
  /** Harga kesepakatan pesanan; bila ada, menggantikan harga jual. */
  hargaKesepakatan?: number | null;
  /** Skenario "kalau panen jelek" (kg). */
  panenJelekKg?: number | null;
}

export interface Skenario {
  panenKg: number;
  pendapatan: number;
  untung: number;
  rugi: boolean;
}

export interface Ringkasan extends Skenario {
  hargaJualDipakai: number;
  sumberHargaJual: 'kesepakatan' | 'isian';
  modalPerM2: number | null;
  /** Panen minimal (kg) agar tidak rugi. */
  titikImpasKg: number;
  skenarioJelek: Skenario | null;
}

const EPS = 1e-9;

function skenario(panenKg: number, harga: number, totalModal: number): Skenario {
  const pendapatan = bulatkanRupiah(panenKg * harga);
  const untung = pendapatan - totalModal;
  return { panenKg, pendapatan, untung, rugi: untung < 0 };
}

export function hitungRingkasan(m: MasukanRingkasan): Hasil<Ringkasan> {
  const pakaiKesepakatan = m.hargaKesepakatan !== null && m.hargaKesepakatan !== undefined;
  const harga = pakaiKesepakatan ? (m.hargaKesepakatan as number) : m.hargaJual;
  if (!(harga > 0)) return gagal('HARGA_JUAL_KOSONG');
  if (m.perkiraanPanenKg < 0 || (m.panenJelekKg ?? 0) < 0) return gagal('PANEN_NEGATIF');
  if (m.totalModal < 0) return gagal('HARGA_NEGATIF');

  const q = m.totalModal / harga;
  const titikImpasKg = Math.abs(q - Math.round(q)) < EPS ? Math.round(q) : Math.ceil(q);
  const modalPerM2 =
    m.ukuranM2 && m.ukuranM2 > 0 ? bulatkanRupiah(m.totalModal / m.ukuranM2) : null;
  return berhasil({
    ...skenario(m.perkiraanPanenKg, harga, m.totalModal),
    hargaJualDipakai: harga,
    sumberHargaJual: pakaiKesepakatan ? 'kesepakatan' : 'isian',
    modalPerM2,
    titikImpasKg,
    skenarioJelek:
      m.panenJelekKg === null || m.panenJelekKg === undefined
        ? null
        : skenario(m.panenJelekKg, harga, m.totalModal),
  });
}
