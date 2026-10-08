/**
 * Peran yang dipilih dari halaman depan ("Mulai sebagai petani" / "Saya pembeli", T4.32), dibawa
 * lewat Masuk sampai halaman pilih peran supaya pilihannya sudah terisi. Disimpan di sessionStorage
 * per tab; bila penyimpanan tidak tersedia, pilihan cukup tidak terisi.
 */
const KUNCI = 'tani-muda:peran-awal';

export type PeranAwal = 'petani' | 'pembeli';

export function bacaPeranDariAlamat(search: string): PeranAwal | null {
  const p = new URLSearchParams(search).get('peran');
  return p === 'petani' || p === 'pembeli' ? p : null;
}

export function simpanPeranAwal(peran: PeranAwal): void {
  try {
    sessionStorage.setItem(KUNCI, peran);
  } catch {
    // Penyimpanan diblokir: pilihan peran tidak terisi otomatis.
  }
}

export function bacaPeranAwal(): PeranAwal | null {
  try {
    const p = sessionStorage.getItem(KUNCI);
    return p === 'petani' || p === 'pembeli' ? p : null;
  } catch {
    return null;
  }
}
