/**
 * Rangkaian tes kontrak (kontrak.test-suite.ts) terhadap backend Laravel lokal lewat klien HTTP
 * (T5.19, T6.01, D-58). Hanya jalan bila `UJI_KONTRAK_HTTP` berisi alamat aplikasi, mis.
 *   UJI_KONTRAK_HTTP=http://localhost:4174 npx vitest run src/api/http/kontrak-http.test.ts
 * (dengan `npm run demo:backend` menyala). Setiap tes diawali atur ulang lewat /demo/atur-ulang.
 * Jam memakai header X-Tani-Muda-Waktu yang hanya berlaku di backend lokal, sama dengan jam tiruan.
 */
import { describe, it, vi } from 'vitest';
import { ujiKontrak } from '../kontrak.test-suite';
import { buatKlienHttp } from './klien-http';

const ALAMAT = process.env.UJI_KONTRAK_HTTP?.replace(/\/$/, '');
/** 2026-10-05 08.00 WIB, hari acuan data contoh (sama dengan tiruan/kontrak.test.ts). */
const AWAL = Date.parse('2026-10-05T01:00:00Z');

/** fetch dengan wadah cookie, asal frontend (Sanctum mode SPA), dan jam uji. */
function fetchSesi(alamat: string, jam: () => number) {
  const wadah = new Map<string, string>();
  const f = (async (masukan: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set('Origin', alamat);
    headers.set('Referer', `${alamat}/`);
    headers.set('X-Tani-Muda-Waktu', new Date(jam()).toISOString());
    if (wadah.size) headers.set('Cookie', [...wadah].map(([k, v]) => `${k}=${v}`).join('; '));
    const r = await fetch(masukan, { ...init, headers, redirect: 'manual' });
    for (const c of r.headers.getSetCookie()) {
      const kv = c.split(';')[0] ?? '';
      const i = kv.indexOf('=');
      wadah.set(kv.slice(0, i), kv.slice(i + 1));
    }
    return r;
  }) as typeof fetch;
  const bacaCookie = (nama: string) => {
    const v = wadah.get(nama);
    return v === undefined ? null : decodeURIComponent(v);
  };
  return { f, bacaCookie };
}

if (!ALAMAT) {
  describe('kontrak API: klien HTTP + backend lokal', () => {
    it.skip('dilewati: setel UJI_KONTRAK_HTTP untuk menjalankan terhadap backend lokal', () => {});
  });
} else {
  vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 });
  ujiKontrak('klien HTTP + backend lokal', async () => {
    let sekarang = AWAL;
    const { f, bacaCookie } = fetchSesi(ALAMAT, () => sekarang);
    const h = buatKlienHttp({ asal: ALAMAT, fetch: f, bacaCookie, demo: true });
    await h.kontrol.aturUlang();
    return {
      klien: h.klien,
      masukSebagai: (id) => h.kontrol.masukSebagai(id),
      kodeOtp: async (nomor) => h.kontrol.kodeUji(nomor),
      majukanJam: (ms) => (sekarang += ms),
    };
  });
}
