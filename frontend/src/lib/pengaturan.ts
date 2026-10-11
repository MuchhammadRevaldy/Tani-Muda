/** Pembaca pengaturan dari variabel lingkungan publik (VITE_*). Fungsi murni: nilai env dikirim. */

/**
 * D-12: resep contoh hanya tampil bila `VITE_TAMPILKAN_RESEP_CONTOH` bernilai persis "true".
 * Kosong, tidak ada, atau nilai lain berarti mati (nilai bawaan mati).
 */
export function bacaTampilkanResepContoh(nilaiEnv: string | undefined | null): boolean {
  return nilaiEnv === 'true';
}
