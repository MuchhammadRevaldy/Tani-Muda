/**
 * Lencana menu Pesanan (D-37, D-39): jumlah pesanan baru di sekitar sejak petani terakhir membuka
 * menu Pesanan. Waktu terakhir dibuka disimpan di perangkat per pengguna; bila penyimpanan tidak
 * tersedia, lencana tetap dihitung dari awal sesi.
 */
import { useCallback, useSyncExternalStore } from 'react';
import { jumlahPesananBaru } from '../lib/pesanan-tampil';
import { usePesananSekitar } from './kueri';
import { useSesi } from './sesi';

const awalan = 'tani-muda:pesanan-dilihat:';
const cadangan = new Map<string, string>();
const pendengar = new Set<() => void>();

function baca(penggunaId: string): string | null {
  try {
    return localStorage.getItem(awalan + penggunaId);
  } catch {
    // Penyimpanan diblokir: pakai cadangan di memori.
    return cadangan.get(penggunaId) ?? null;
  }
}

function tulis(penggunaId: string, waktu: string) {
  cadangan.set(penggunaId, waktu);
  try {
    localStorage.setItem(awalan + penggunaId, waktu);
  } catch {
    // Abaikan: cadangan di memori sudah diisi.
  }
  pendengar.forEach((f) => f());
}

function langgan(f: () => void) {
  pendengar.add(f);
  return () => {
    pendengar.delete(f);
  };
}

/** Waktu terakhir menu Pesanan dibuka dan fungsi untuk menandainya sekarang. */
export function usePesananDilihat(): { dilihatPada: string | null; tandaiDilihat: () => void } {
  const { akun } = useSesi();
  const id = akun?.pengguna.id ?? null;
  const dilihatPada = useSyncExternalStore(langgan, () => (id ? baca(id) : null));
  const tandaiDilihat = useCallback(() => {
    if (id) tulis(id, new Date().toISOString());
  }, [id]);
  return { dilihatPada, tandaiDilihat };
}

/** Jumlah pesanan baru untuk lencana; pesanan yang sudah diambil petani ini tidak dihitung. */
export function useLencanaPesanan(aktif: boolean): number {
  const { dilihatPada } = usePesananDilihat();
  const q = usePesananSekitar();
  if (!aktif || !q.data) return 0;
  return jumlahPesananBaru(
    q.data.data.filter((p) => !p.alokasi_saya).map((p) => p.dibuat_pada),
    dilihatPada,
  );
}
