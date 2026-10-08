/**
 * Unduhan video modul untuk ditonton tanpa sinyal (P0-29, D-29, D-43). Video disimpan di Cache
 * Storage peramban dengan nama `tani-muda-video`. Pemutaran dari simpanan ini saat tidak ada sinyal
 * dilayani service worker di Tahap 6 (T6.05, T6.06); sampai saat itu status "tersimpan offline"
 * sudah benar, tetapi pemutaran tetap mengambil dari jaringan bila ada.
 * Bila Cache Storage tidak tersedia (mis. tes, peramban lama), fitur unduh disembunyikan.
 */
import { useCallback, useEffect, useState } from 'react';

const NAMA_SIMPANAN = 'tani-muda-video';

const didukung = () => typeof caches !== 'undefined';

export interface UnduhanModul {
  didukung: boolean;
  /** URL video yang sudah tersimpan. */
  tersimpan: Set<string>;
  /** Total ukuran video tersimpan (MB). */
  ukuranMb: number;
  sedang: Set<string>;
  unduh: (url: string) => Promise<boolean>;
  hapus: (url: string) => Promise<void>;
}

/** Baca isi simpanan: path video → ukuran (byte). */
async function bacaSimpanan(): Promise<Map<string, number>> {
  const peta = new Map<string, number>();
  if (!didukung()) return peta;
  try {
    const c = await caches.open(NAMA_SIMPANAN);
    for (const req of await c.keys()) {
      const res = await c.match(req);
      const ukuran = res ? Number(res.headers.get('content-length')) || (await res.blob()).size : 0;
      peta.set(new URL(req.url).pathname, ukuran);
    }
  } catch {
    // Simpanan tidak bisa dibaca: anggap kosong.
  }
  return peta;
}

export function useUnduhanModul(): UnduhanModul {
  const [tersimpan, setTersimpan] = useState<Map<string, number>>(new Map());
  const [sedang, setSedang] = useState<Set<string>>(new Set());
  // Naik setiap kali isi simpanan berubah, supaya efek membaca ulang.
  const [versi, setVersi] = useState(0);

  useEffect(() => {
    let aktif = true;
    void bacaSimpanan().then((peta) => {
      if (aktif) setTersimpan(peta);
    });
    return () => {
      aktif = false;
    };
  }, [versi]);

  const unduh = useCallback(async (url: string) => {
    if (!didukung()) return false;
    setSedang((s) => new Set(s).add(url));
    try {
      const res = await fetch(url);
      if (!res.ok) return false;
      const c = await caches.open(NAMA_SIMPANAN);
      await c.put(url, res);
      setVersi((v) => v + 1);
      return true;
    } catch {
      return false;
    } finally {
      setSedang((s) => {
        const baru = new Set(s);
        baru.delete(url);
        return baru;
      });
    }
  }, []);

  const hapus = useCallback(async (url: string) => {
    if (!didukung()) return;
    const c = await caches.open(NAMA_SIMPANAN);
    await c.delete(url);
    setVersi((v) => v + 1);
  }, []);

  const totalByte = [...tersimpan.values()].reduce((a, b) => a + b, 0);
  return {
    didukung: didukung(),
    tersimpan: new Set(tersimpan.keys()),
    ukuranMb: Math.round((totalByte / 1e6) * 10) / 10,
    sedang,
    unduh,
    hapus,
  };
}
