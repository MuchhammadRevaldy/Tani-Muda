/**
 * Pemilihan implementasi klien API dari variabel lingkungan publik (D-20):
 * - `VITE_SUMBER_DATA=tiruan` (bawaan): klien tiruan dengan data contoh;
 * - `VITE_SUMBER_DATA=http`: klien HTTP ke backend Laravel (T6.01), lewat proxy Vite.
 * Klien tiruan dimuat dinamis supaya data contoh tidak ikut bundel bila memakai HTTP.
 */
import { bacaTampilkanResepContoh } from '../lib/pengaturan';
import type { KlienApi, KontrolPengembangan, SumberData } from './klien';

export interface LingkunganPublik {
  VITE_SUMBER_DATA?: string;
  VITE_TAMPILKAN_RESEP_CONTOH?: string;
  DEV?: boolean;
  /** "demo" untuk `npm run build:demo` (D-48). */
  MODE?: string;
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

export async function siapkanKlien(env: LingkunganPublik): Promise<KlienSiap> {
  const sumber = bacaSumberData(env.VITE_SUMBER_DATA);
  // Kontrol demo (pemilih akun, kode uji, atur ulang) di pengembangan dan build demo (D-48).
  const demo = env.DEV === true || env.MODE === 'demo';
  if (sumber === 'http') {
    const { buatKlienHttp } = await import('./http/klien-http');
    const h = buatKlienHttp({ demo });
    if (!demo) return { klien: h.klien, sumber, kontrol: null };
    // Endpoint demo hanya ada di backend lokal; bila tidak terjangkau, pemilih akun kosong.
    await h.muatDemo().catch(() => undefined);
    return { klien: h.klien, sumber, kontrol: h.kontrol };
  }
  const [{ buatKlienTiruan }, { localStorageAman }] = await Promise.all([
    import('./tiruan/klien-tiruan'),
    import('./tiruan/penyimpanan'),
  ]);
  const t = buatKlienTiruan({
    tampilkanResepContoh: bacaTampilkanResepContoh(env.VITE_TAMPILKAN_RESEP_CONTOH),
    kv: localStorageAman(),
    latensiMs: env.DEV ? [200, 400] : [0, 0],
  });
  return { klien: t.klien, sumber, kontrol: demo ? t.kontrol : null };
}
