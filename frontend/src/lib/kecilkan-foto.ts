/**
 * Ukuran foto setelah dikecilkan di HP sebelum diunggah (aturan-proyek 6.7, "Foto dikecilkan otomatis
 * supaya hemat kuota"): sisi terpanjang paling besar `sisiMaks`, rasio tetap, tidak pernah diperbesar.
 */
export const SISI_MAKS_FOTO = 1280;
/** Mutu JPEG hasil pengecilan. */
export const MUTU_FOTO = 0.8;

export function ukuranKecil(
  lebar: number,
  tinggi: number,
  sisiMaks = SISI_MAKS_FOTO,
): { lebar: number; tinggi: number } {
  if (!(lebar > 0) || !(tinggi > 0)) return { lebar: 0, tinggi: 0 };
  const skala = Math.min(1, sisiMaks / Math.max(lebar, tinggi));
  return {
    lebar: Math.max(1, Math.round(lebar * skala)),
    tinggi: Math.max(1, Math.round(tinggi * skala)),
  };
}
