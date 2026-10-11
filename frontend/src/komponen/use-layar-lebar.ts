/**
 * Benar mulai titik patah `lg` (1024px, D-16). Dipakai bila isi yang sama harus pindah tempat antara
 * HP dan desktop (mis. formulir ukuran di kolom isi vs panel samping) tanpa dirender dua kali.
 */
import { useEffect, useState } from 'react';

const KUERI = '(min-width: 1024px)';

export function useLayarLebar(): boolean {
  const [lebar, setLebar] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(KUERI).matches,
  );
  useEffect(() => {
    const m = window.matchMedia?.(KUERI);
    if (!m) return;
    const ubah = () => setLebar(m.matches);
    m.addEventListener('change', ubah);
    return () => m.removeEventListener('change', ubah);
  }, []);
  return lebar;
}
