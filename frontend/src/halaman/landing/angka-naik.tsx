/**
 * Angka yang berhitung naik sekali saat pertama terlihat [AG-54]. Hanya teks yang berganti (tidak
 * menggeser tata letak: angka tabular dengan lebar tetap). Langsung angka akhir bila gerak dikurangi,
 * sakelar animasi mati, atau IntersectionObserver tidak ada. Pembaca layar selalu mendapat angka akhir.
 */
import { useEffect, useRef, useState } from 'react';
import { formatDesimal } from '../../lib/format';
import { geraknyaDikurangi } from './gulir';

const LAMA_MS = 1400;

export function AngkaNaik({
  nilai,
  desimal,
  akhiran = '',
}: {
  nilai: number;
  desimal: number;
  akhiran?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const [tampil, setTampil] = useState(() =>
    typeof IntersectionObserver === 'undefined' || geraknyaDikurangi() ? nilai : 0,
  );
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || geraknyaDikurangi() || !el.current) {
      setTampil(nilai);
      return;
    }
    let bingkai = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const mulai = performance.now();
        const langkah = (kini: number) => {
          const t = Math.min(1, (kini - mulai) / LAMA_MS);
          // Melambat di akhir (kubik keluar), seperti kurva token `keluar`.
          setTampil(nilai * (1 - (1 - t) ** 3));
          if (t < 1) bingkai = requestAnimationFrame(langkah);
        };
        bingkai = requestAnimationFrame(langkah);
      },
      { threshold: 0.6 },
    );
    io.observe(el.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(bingkai);
    };
  }, [nilai]);
  return (
    <span ref={el} className="tabular-nums">
      <span className="sr-saja">{formatDesimal(nilai, desimal, true) + akhiran}</span>
      <span aria-hidden="true">{formatDesimal(tampil, desimal, true) + akhiran}</span>
    </span>
  );
}
