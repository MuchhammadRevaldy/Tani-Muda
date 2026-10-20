/**
 * Gulir halaman depan [AG-54]: daftar bagian (id dan label navbar), posisi gulir untuk navbar dan
 * tombol "Kembali ke atas", bagian yang sedang terlihat, dan gulir halus ke sebuah bagian.
 * Satu pendengar scroll pasif per pemakai, diperbarui paling banyak sekali per bingkai, dan state
 * hanya berubah bila nilainya berubah supaya ringan di laptop dengan RAM terbatas.
 */
import { useEffect, useState } from 'react';
import { animasiMati } from '../../lib/gerak';
import { fiturAktif } from '../../lib/fitur';
import { teksLanding as t } from '../../teks/landing';

export type IdBagian = keyof typeof t.bagian;

/** Id elemen = nama bagian dengan tanda hubung (`cara-kerja`), dipakai juga untuk tautan /#id. */
export const idBagian = (k: IdBagian) => k.replace(/[A-Z]/g, (h) => `-${h.toLowerCase()}`);

/** Fitur pendukung yang sakelarnya menyala; bagian Fitur disembunyikan bila tidak ada sama sekali. */
export const FITUR_LANDING = (
  ['deteksi', 'asisten', 'cuaca', 'peta', 'stok', 'chat', 'level'] as const
).filter((f) =>
  fiturAktif(
    (
      {
        deteksi: 'DETEKSI',
        asisten: 'CHATBOT',
        cuaca: 'CUACA',
        peta: 'PETA',
        stok: 'STOK',
        chat: 'CHAT',
        level: 'LEVEL',
      } as const
    )[f],
  ),
);

export const BAGIAN_LANDING: IdBagian[] = (Object.keys(t.bagian) as IdBagian[]).filter(
  (k) => k !== 'fitur' || FITUR_LANDING.length > 0,
);

function geraknyaDikurangi() {
  return (
    animasiMati() ||
    (typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );
}

/** Gulir ke bagian dan pindahkan fokus ke sana (tanpa gulir kedua), supaya papan ketik ikut. */
export function gulirKe(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // scrollIntoView tidak ada di sebagian lingkungan (jsdom); fokus tetap dipindahkan.
  el.scrollIntoView?.({ behavior: geraknyaDikurangi() ? 'auto' : 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
}

export function gulirKeAtas() {
  window.scrollTo({ top: 0, behavior: geraknyaDikurangi() ? 'auto' : 'smooth' });
}

/** `[sudahDigulir, lewatSatuLayar]`. */
export function usePosisiGulir(): [boolean, boolean] {
  const [posisi, setPosisi] = useState<[boolean, boolean]>([false, false]);
  useEffect(() => {
    let bingkai = 0;
    const baca = () => {
      bingkai = 0;
      const y = window.scrollY;
      const baru: [boolean, boolean] = [y > 8, y > window.innerHeight];
      setPosisi((lama) => (lama[0] === baru[0] && lama[1] === baru[1] ? lama : baru));
    };
    const saatGulir = () => {
      if (!bingkai) bingkai = requestAnimationFrame(baca);
    };
    baca();
    window.addEventListener('scroll', saatGulir, { passive: true });
    return () => {
      window.removeEventListener('scroll', saatGulir);
      if (bingkai) cancelAnimationFrame(bingkai);
    };
  }, []);
  return posisi;
}

/** Bagian yang sedang berada di tengah layar (IntersectionObserver); null di halaman lain. */
export function useBagianAktif(aktif: boolean): IdBagian | null {
  const [bagian, setBagian] = useState<IdBagian | null>(null);
  useEffect(() => {
    if (!aktif || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entri) => {
        for (const e of entri) {
          const k = BAGIAN_LANDING.find((b) => idBagian(b) === e.target.id);
          if (!k) continue;
          if (e.isIntersecting) setBagian(k);
        }
        // Kembali ke hero (juga lewat lompatan langsung ke atas): bagian pertama masih di bawah
        // garis, jadi tidak ada yang aktif.
        const pertama = document.getElementById(idBagian(BAGIAN_LANDING[0] ?? 'masalah'));
        if (pertama && pertama.getBoundingClientRect().top > window.innerHeight * 0.4)
          setBagian(null);
      },
      // Garis tipis di sekitar 40% tinggi layar: tepat satu bagian yang memotongnya.
      { rootMargin: '-40% 0px -59% 0px' },
    );
    for (const k of BAGIAN_LANDING) {
      const el = document.getElementById(idBagian(k));
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [aktif]);
  return aktif ? bagian : null;
}

export { geraknyaDikurangi };
