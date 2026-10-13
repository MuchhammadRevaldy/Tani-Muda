/**
 * Kartu dan baris yang muncul berurutan saat halaman pertama dibuka (D-61): jeda 50 ms per item,
 * paling banyak 8 item yang ditunda (sisanya langsung), durasi 300 ms (token `muncul-bertahap`).
 * Kelas animasi hanya dipasang pada item yang ada di render pertama setelah data siap; item yang
 * muncul kemudian (data diperbarui, tugas dicentang, siklus diganti) tidak beranimasi.
 */
import { useEffect, useState, type CSSProperties } from 'react';

export const MAKS_DITUNDA = 8;
/** Jendela animasi: 300 ms + 7 × 50 ms jeda, ditambah sedikit cadangan. */
const JENDELA_MS = 300 + (MAKS_DITUNDA - 1) * 50 + 200;

/** True selama jendela animasi pertama setelah `siap` menjadi true; sesudahnya false selamanya. */
export function useBertahap(siap: boolean): boolean {
  const [selesai, setSelesai] = useState(false);
  useEffect(() => {
    if (!siap || selesai) return;
    const t = setTimeout(() => setSelesai(true), JENDELA_MS);
    return () => clearTimeout(t);
  }, [siap, selesai]);
  return siap && !selesai;
}

/** Kelas dan --urutan untuk item ke-`i` (0, 1, …); item ke-8 dan seterusnya tanpa jeda. */
export function gayaBertahap(
  aktif: boolean,
  i: number,
): { className?: string; style?: CSSProperties } {
  if (!aktif) return {};
  return {
    className: 'muncul-bertahap',
    style: { '--urutan': i < MAKS_DITUNDA ? i : 0 } as CSSProperties,
  };
}
