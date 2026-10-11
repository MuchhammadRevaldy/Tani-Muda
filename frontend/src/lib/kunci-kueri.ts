/**
 * Kunci kueri TanStack Query yang seragam: [fitur, sumber, ...parameter]. Parameter objek dibersihkan
 * dari nilai kosong dan diurutkan supaya kunci yang sama selalu cocok untuk pembatalan cache.
 */

export type NilaiKunci = string | number | boolean | null | undefined | Record<string, unknown>;

function bersihkan(nilai: NilaiKunci): NilaiKunci {
  if (nilai === null || typeof nilai !== 'object') return nilai;
  const hasil: Record<string, unknown> = {};
  for (const k of Object.keys(nilai).sort()) {
    const v = nilai[k];
    if (v !== undefined && v !== null && v !== '') hasil[k] = v;
  }
  return hasil;
}

/** Buat kunci kueri, mis. kunciKueri('kebun', 'tugas', 'siklus-1') → ['kebun', 'tugas', 'siklus-1']. */
export function kunciKueri(
  fitur: string,
  sumber: string,
  ...parameter: NilaiKunci[]
): readonly unknown[] {
  const p = parameter.filter((x) => x !== undefined).map(bersihkan);
  return [fitur, sumber, ...p] as const;
}

/** Awalan untuk membatalkan semua kueri satu fitur, mis. setelah mutasi. */
export const awalanKunci = (fitur: string, sumber?: string): readonly unknown[] =>
  sumber === undefined ? [fitur] : [fitur, sumber];
