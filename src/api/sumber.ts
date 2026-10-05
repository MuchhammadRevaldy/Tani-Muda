/**
 * Pemilihan implementasi klien API dari variabel lingkungan publik (D-20):
 * - `VITE_SUMBER_DATA=tiruan` (bawaan): klien tiruan dengan data contoh;
 * - `VITE_SUMBER_DATA=http`: klien HTTP ke backend Laravel (Tahap 6; sekarang belum tersedia).
 * Klien tiruan dimuat dinamis supaya data contoh tidak ikut bundel bila memakai HTTP.
 */
import { bacaTampilkanResepContoh } from '../lib/pengaturan';
import { teksUntukGalat } from '../teks/galat-api';
import { GalatApi } from './galat';
import type { KlienApi, KontrolPengembangan, SumberData } from './klien';

export interface LingkunganPublik {
  VITE_SUMBER_DATA?: string;
  VITE_TAMPILKAN_RESEP_CONTOH?: string;
  DEV?: boolean;
}

export interface KlienSiap {
  klien: KlienApi;
  sumber: SumberData;
  /** Hanya di mode pengembangan dengan klien tiruan. */
  kontrol: KontrolPengembangan | null;
}

export function bacaSumberData(nilai: string | undefined): SumberData {
  return nilai === 'http' ? 'http' : 'tiruan';
}

/** Klien yang setiap metodenya gagal dengan galat jelas (sumber HTTP sebelum Tahap 6). */
export function klienBelumTersedia(): KlienApi {
  const gagal = () =>
    Promise.reject(new GalatApi('SUMBER_BELUM_TERSEDIA', teksUntukGalat('SUMBER_BELUM_TERSEDIA')));
  const fitur = new Proxy({}, { get: () => gagal });
  return new Proxy({} as KlienApi, { get: () => fitur });
}

export async function siapkanKlien(env: LingkunganPublik): Promise<KlienSiap> {
  const sumber = bacaSumberData(env.VITE_SUMBER_DATA);
  if (sumber === 'http') return { klien: klienBelumTersedia(), sumber, kontrol: null };
  const [{ buatKlienTiruan }, { localStorageAman }] = await Promise.all([
    import('./tiruan/klien-tiruan'),
    import('./tiruan/penyimpanan'),
  ]);
  const t = buatKlienTiruan({
    tampilkanResepContoh: bacaTampilkanResepContoh(env.VITE_TAMPILKAN_RESEP_CONTOH),
    kv: localStorageAman(),
    latensiMs: env.DEV ? [200, 400] : [0, 0],
  });
  return { klien: t.klien, sumber, kontrol: env.DEV ? t.kontrol : null };
}
