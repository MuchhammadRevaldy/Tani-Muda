/**
 * Konversi satuan luas (PRD P0-33, rumus "Konversi satuan luas"). 1 hektare = 10.000 m² adalah
 * definisi; nilai ru/bata per wilayah dikirim sebagai argumen `konversi` dari tabel konversi_satuan.
 */
import { formatDesimal, titikRibuan } from './format';
import { berhasil, gagal, type Hasil } from './hasil';

export type SatuanLuas = 'm2' | 'ru' | 'bata' | 'hektare';

/** Nilai satuan lokal dalam m² per wilayah, mis. { ru: 14, bata: 14 }. */
export type KonversiLuas = Partial<Record<'ru' | 'bata', number>>;

const M2_PER_HEKTARE = 10_000;

function m2PerSatuan(satuan: SatuanLuas, konversi: KonversiLuas): number | null {
  if (satuan === 'm2') return 1;
  if (satuan === 'hektare') return M2_PER_HEKTARE;
  const v = konversi[satuan];
  return v !== undefined && v > 0 ? v : null;
}

/** Ubah nilai ke m². Kosong atau 0 → UKURAN_KOSONG; negatif → UKURAN_NEGATIF. */
export function keM2(
  nilai: number | null | undefined,
  satuan: SatuanLuas,
  konversi: KonversiLuas,
): Hasil<number> {
  if (nilai === null || nilai === undefined || Number.isNaN(nilai) || nilai === 0)
    return gagal('UKURAN_KOSONG');
  if (nilai < 0) return gagal('UKURAN_NEGATIF');
  const faktor = m2PerSatuan(satuan, konversi);
  if (faktor === null) return gagal('SATUAN_TIDAK_DIKENAL');
  return berhasil(bulat6(nilai * faktor));
}

/** Ubah m² ke satuan lain. Satuan lokal tanpa nilai konversi → SATUAN_TIDAK_DIKENAL. */
export function dariM2(m2: number, satuan: SatuanLuas, konversi: KonversiLuas): Hasil<number> {
  const faktor = m2PerSatuan(satuan, konversi);
  if (faktor === null) return gagal('SATUAN_TIDAK_DIKENAL');
  return berhasil(bulat6(m2 / faktor));
}

/**
 * Teks bantuan di bawah isian luas, mengikuti papan 13:
 * - m²: "100 m² ≈ 7 ru" (ru dibulatkan ke bilangan bulat terdekat; < 1 ru memakai satu desimal);
 * - ru/bata: "7 ru ≈ 98 m²";
 * - hektare: "0,1 hektare = 1.000 m²" (tanda = karena pasti).
 * Mengembalikan null bila nilai belum valid. `satuanLokal` = satuan pembanding untuk isian m².
 */
export function teksBantuanLuas(
  nilai: number | null | undefined,
  satuan: SatuanLuas,
  konversi: KonversiLuas,
  satuanLokal: 'ru' | 'bata' = 'ru',
): string | null {
  const m2 = keM2(nilai, satuan, konversi);
  if (!m2.ok) return null;
  const v = nilai as number;
  if (satuan === 'hektare') return `${formatDesimal(v, 3)} hektare = ${teksM2(m2.nilai)} m²`;
  if (satuan === 'ru' || satuan === 'bata')
    return `${formatDesimal(v, 2)} ${satuan} ≈ ${teksM2(m2.nilai)} m²`;
  const lokal = dariM2(m2.nilai, satuanLokal, konversi);
  if (!lokal.ok) return null;
  const teksLokal =
    lokal.nilai < 1 ? formatDesimal(lokal.nilai, 1) : titikRibuan(Math.round(lokal.nilai));
  return `${teksM2(m2.nilai)} m² ≈ ${teksLokal} ${satuanLokal}`;
}

function teksM2(m2: number): string {
  return m2 >= 10 ? titikRibuan(Math.round(m2)) : formatDesimal(m2, 1);
}

function bulat6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}
