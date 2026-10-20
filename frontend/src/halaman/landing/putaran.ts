/**
 * Putaran cara kerja Pesan Sebelum Tanam [AG-55]: garis terisi rata dari langkah 1 ke langkah
 * terakhir dalam 6 detik, setiap langkah menyala tepat saat garis sampai, berhenti 2 detik di
 * langkah terakhir, lalu mulai lagi (satu putaran 8 detik). Hanya berjalan saat bagiannya terlihat
 * di layar; keluar layar = berhenti, masuk lagi = mulai dari awal. Bila gerak dikurangi atau
 * sakelar animasi mati: keadaan akhir yang diam (semua langkah menyala, garis penuh).
 */
import { useEffect, useRef, useState, type RefObject } from 'react';
import { geraknyaDikurangi } from './gulir';

export const LAMA_ISI_MS = 6000;
const JEDA_AKHIR_MS = 2000;

export interface KeadaanPutaran {
  /** Langkah terakhir yang sudah dicapai garis (0 = langkah pertama). */
  langkah: number;
  /** Target garis 0..1; `lamaMs` = lama transisi menuju target (0 = lompat). */
  kemajuan: number;
  lamaMs: number;
}

export function usePutaranLangkah(ref: RefObject<HTMLElement | null>, jumlah: number): KeadaanPutaran {
  const akhir: KeadaanPutaran = { langkah: jumlah - 1, kemajuan: 1, lamaMs: 0 };
  const [keadaan, setKeadaan] = useState<KeadaanPutaran>(akhir);
  const pewaktu = useRef<number[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el || jumlah < 2 || typeof IntersectionObserver === 'undefined' || geraknyaDikurangi())
      return;
    const hentikan = () => {
      pewaktu.current.forEach((id) => window.clearTimeout(id));
      pewaktu.current = [];
    };
    const jarak = LAMA_ISI_MS / (jumlah - 1);
    const putar = () => {
      hentikan();
      setKeadaan({ langkah: 0, kemajuan: 0, lamaMs: 0 });
      // Satu bingkai kemudian garis mulai berjalan ke ujung dengan kecepatan tetap.
      pewaktu.current.push(
        window.setTimeout(() => setKeadaan((k) => ({ ...k, kemajuan: 1, lamaMs: LAMA_ISI_MS })), 50),
      );
      for (let i = 1; i < jumlah; i++)
        pewaktu.current.push(
          window.setTimeout(() => setKeadaan((k) => ({ ...k, langkah: i })), 50 + i * jarak),
        );
      pewaktu.current.push(window.setTimeout(putar, 50 + LAMA_ISI_MS + JEDA_AKHIR_MS));
    };
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) putar();
      else hentikan();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      hentikan();
    };
  }, [ref, jumlah]);

  return keadaan;
}
