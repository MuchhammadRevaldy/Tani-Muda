/**
 * Sakelar kapsul penafian [AG-50]: VITE_LABEL_PENAFIAN = 'nyala' | 'mati'.
 *
 * Saat mati, kapsul berikut tidak dirender sama sekali:
 * - LabelKecil nada "contoh" ("CONTOH, belum divalidasi penyuluh", "Draf, belum ditinjau ahli
 *   hukum", "Mode uji coba", "Contoh jawaban"), lewat komponen LabelKecil;
 * - label "Foto contoh" di GambarStok.
 * Tombol "Mode demo", label "Segera hadir", dan label lain tetap tampil.
 *
 * Bawaan: nyala (tes dan pengembangan biasa). Build demo mematikannya lewat
 * scripts/pengaturan-demo.mjs; bisa ditimpa: `$env:VITE_LABEL_PENAFIAN='nyala'; npm run demo:backend`.
 */
export function labelPenafianTampil(nilaiUji?: string): boolean {
  const nilai = nilaiUji !== undefined ? nilaiUji : (import.meta.env.VITE_LABEL_PENAFIAN as string | undefined);
  if (nilai === undefined || nilai === null || nilai === '') return true;
  const bersih = nilai.trim().toLowerCase();
  return bersih !== 'mati' && bersih !== 'false' && bersih !== '0';
}
