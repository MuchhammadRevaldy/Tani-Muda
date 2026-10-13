/**
 * Pemeriksa status sakelar fitur Tahap 7 (D-64, PRD Tambahan v1.1).
 *
 * Nilai dari import.meta.env.VITE_FITUR_<NAMA>:
 * - 'mati', 'false', atau '0' = fitur dimatikan.
 * - 'nyala', 'true', atau belum disetel = fitur aktif.
 */
export type NamaFitur =
  | 'AI'
  | 'SARAN_UNTUNG'
  | 'TANAMAN_BARU'
  | 'LEVEL'
  | 'DETEKSI'
  | 'CHATBOT'
  | 'CUACA'
  | 'STOK'
  | 'PETA'
  | 'CHAT'
  | 'HARGA_BERITA'
  | 'SARAN_HARIAN';

export function fiturAktif(nama: NamaFitur, nilaiUji?: string): boolean {
  const nilai =
    nilaiUji !== undefined
      ? nilaiUji
      : (import.meta.env[`VITE_FITUR_${nama}`] as string | undefined);

  if (nilai === undefined || nilai === null || nilai === '') {
    return true;
  }

  const bersih = nilai.trim().toLowerCase();
  return bersih !== 'mati' && bersih !== 'false' && bersih !== '0';
}
