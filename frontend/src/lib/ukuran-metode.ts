/**
 * Perkiraan panen dan ukuran per metode (PRD P0-32, P0-33). Semua faktor (hasil per satuan,
 * liter tandon per lubang, tempat per unit, faktor vertikultur) dikirim sebagai argumen dari resep
 * dan data metode; tidak ada konstanta agronomis di sini.
 */
import type { DasarUkuran } from '../tipe';
import { berhasil, gagal, type Hasil } from './hasil';
import { validasiUkuran } from './kebutuhan';

const bulat2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Perkiraan panen (kg): luas × hasil per m², lubang × hasil per lubang, atau polybag × hasil per
 * polybag. Ukuran kosong memakai kode galat per metode.
 */
export function perkiraanPanen(
  dasarUkuran: DasarUkuran,
  ukuran: number | null,
  hasilPerSatuan: number,
): Hasil<number> {
  const valid = validasiUkuran(
    dasarUkuran,
    dasarUkuran === 'luas' ? { luasM2: ukuran } : { jumlahTanaman: ukuran },
  );
  if (!valid.ok) return valid;
  if (!(hasilPerSatuan > 0)) return gagal('HASIL_KOSONG');
  return berhasil(bulat2(valid.nilai * hasilPerSatuan));
}

/**
 * Saran volume tandon (liter) seperti papan 14: lubang × liter per lubang, dibulatkan ke kelipatan
 * terdekat, dengan batas bawah. NFT 200 lubang × 0,5 = 100 liter.
 */
export function saranVolumeTandon(
  jumlahLubang: number,
  literPerLubang: number,
  opsi: { kelipatan: number; minimal: number } = { kelipatan: 10, minimal: 10 },
): number {
  if (!(jumlahLubang > 0) || !(literPerLubang > 0)) return opsi.minimal;
  return Math.max(
    opsi.minimal,
    Math.round((jumlahLubang * literPerLubang) / opsi.kelipatan) * opsi.kelipatan,
  );
}

/**
 * Kebutuhan tempat (m²) untuk sejumlah lubang atau polybag. `faktorVertikultur` (> 1) membagi
 * kebutuhan tempat bila disusun bertingkat; null bila tidak disusun vertikal.
 */
export function kebutuhanTempatM2(
  jumlahUnit: number,
  tempatPerUnitM2: number,
  faktorVertikultur: number | null,
): number {
  if (!(jumlahUnit > 0) || !(tempatPerUnitM2 > 0)) return 0;
  const bagi = faktorVertikultur && faktorVertikultur > 1 ? faktorVertikultur : 1;
  return bulat2((jumlahUnit * tempatPerUnitM2) / bagi);
}
