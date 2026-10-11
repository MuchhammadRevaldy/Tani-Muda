/**
 * Inisial untuk avatar. Kata umum di depan nama usaha ("Kebun", "Katering", "Bu", "Pak")
 * diabaikan. Dua kata atau lebih → huruf awal dua kata pertama ("Arif Setiawan" → "AS").
 * Satu kata → dua huruf pertama ("Kebun Sekar" → "SE").
 */
const KATA_UMUM = new Set(['kebun', 'katering', 'bu', 'pak', 'ibu', 'bapak', 'warung', 'toko']);

export function inisialNama(nama: string): string {
  const semua = nama.trim().split(/\s+/).filter(Boolean);
  const berarti = semua.filter((k) => !KATA_UMUM.has(k.toLowerCase()));
  const kata = berarti.length ? berarti : semua;
  if (kata.length === 0) return '';
  if (kata.length === 1) return kata[0]!.slice(0, 2).toUpperCase();
  return (kata[0]!.slice(0, 1) + kata[1]!.slice(0, 1)).toUpperCase();
}
