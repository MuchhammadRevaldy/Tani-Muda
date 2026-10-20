/**
 * Putaran cara kerja Pesan Sebelum Tanam [AG-55]: garis terisi rata dari langkah 1 ke langkah
 * terakhir dalam 6 detik, setiap langkah menyala tepat saat garis sampai, berhenti 2 detik di
 * langkah terakhir, lalu mulai lagi (satu putaran 8 detik). Hanya berjalan saat bagiannya terlihat
 * di layar; keluar layar = berhenti, masuk lagi = mulai dari awal. Bila gerak dikurangi atau
 * sakelar animasi mati: keadaan akhir yang diam (semua langkah menyala, garis penuh).
 *
 * [AG-56] `sorot(i)`: putaran berhenti dan garis melompat ke langkah i (disorot kursor atau
 * difokus); `sorot(null)` melanjutkan putaran dari awal bila bagiannya masih terlihat.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { geraknyaDikurangi } from './gulir';

export const LAMA_ISI_MS = 6000;
const JEDA_AKHIR_MS = 2000;
const LAMA_LOMPAT_MS = 300;

export interface KeadaanPutaran {
  /** Langkah terakhir yang sudah dicapai garis (0 = langkah pertama). */
  langkah: number;
  /** Target garis 0..1; `lamaMs` = lama transisi menuju target (0 = lompat). */
  kemajuan: number;
  lamaMs: number;
}

export function usePutaranLangkah(
  ref: RefObject<HTMLElement | null>,
  jumlah: number,
): [KeadaanPutaran, (i: number | null) => void] {
  const akhir: KeadaanPutaran = { langkah: jumlah - 1, kemajuan: 1, lamaMs: 0 };
  const [keadaan, setKeadaan] = useState<KeadaanPutaran>(akhir);
  const pewaktu = useRef<number[]>([]);
  const terlihat = useRef(false);
  const disorot = useRef(false);
  /** Putaran berikutnya memanggil versi terbaru dirinya lewat ref (tanpa rujukan diri langsung). */
  const putarLagi = useRef<() => void>(() => undefined);

  const hentikan = useCallback(() => {
    pewaktu.current.forEach((id) => window.clearTimeout(id));
    pewaktu.current = [];
  }, []);

  const putar = useCallback(() => {
    hentikan();
    if (jumlah < 2) return;
    const jarak = LAMA_ISI_MS / (jumlah - 1);
    setKeadaan({ langkah: 0, kemajuan: 0, lamaMs: 0 });
    // Satu jeda pendek kemudian garis mulai berjalan ke ujung dengan kecepatan tetap.
    pewaktu.current.push(
      window.setTimeout(() => setKeadaan((k) => ({ ...k, kemajuan: 1, lamaMs: LAMA_ISI_MS })), 50),
    );
    for (let i = 1; i < jumlah; i++)
      pewaktu.current.push(
        window.setTimeout(() => setKeadaan((k) => ({ ...k, langkah: i })), 50 + i * jarak),
      );
    pewaktu.current.push(
      window.setTimeout(() => putarLagi.current(), 50 + LAMA_ISI_MS + JEDA_AKHIR_MS),
    );
  }, [hentikan, jumlah]);

  useEffect(() => {
    putarLagi.current = putar;
  }, [putar]);

  useEffect(() => {
    const el = ref.current;
    if (!el || jumlah < 2 || typeof IntersectionObserver === 'undefined' || geraknyaDikurangi())
      return;
    const io = new IntersectionObserver(([e]) => {
      terlihat.current = Boolean(e?.isIntersecting);
      if (disorot.current) return;
      if (terlihat.current) putar();
      else hentikan();
    });
    io.observe(el);
    return () => {
      io.disconnect();
      hentikan();
    };
  }, [ref, jumlah, putar, hentikan]);

  const sorot = useCallback(
    (i: number | null) => {
      if (jumlah < 2) return;
      if (i === null) {
        disorot.current = false;
        if (geraknyaDikurangi()) setKeadaan({ langkah: jumlah - 1, kemajuan: 1, lamaMs: 0 });
        else if (terlihat.current) putar();
        return;
      }
      disorot.current = true;
      hentikan();
      setKeadaan({
        langkah: i,
        kemajuan: i / (jumlah - 1),
        lamaMs: geraknyaDikurangi() ? 0 : LAMA_LOMPAT_MS,
      });
    },
    [jumlah, hentikan, putar],
  );

  return [keadaan, sorot];
}
