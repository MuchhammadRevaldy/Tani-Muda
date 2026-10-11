/**
 * Penyedia suntingan rencana Hitung (T4.05–T4.08), dipisah dari use-rencana.tsx supaya rute bisa
 * memasangnya tanpa ikut memuat logika kalkulator ke JavaScript halaman pertama (P-22, D-48).
 */
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { ItemRencana } from '../../lib/rencana';

export interface Suntingan {
  /** Rencana yang disunting; suntingan diabaikan bila resep atau ukuran berubah. */
  kunci: string | null;
  items: ItemRencana[] | null;
  bagiAlat: boolean;
  hargaJual: number | null;
}

const KonteksRencana = createContext<[Suntingan, Dispatch<SetStateAction<Suntingan>>] | null>(null);

export function PenyediaRencana({ children }: { children: ReactNode }) {
  const nilai = useState<Suntingan>({ kunci: null, items: null, bagiAlat: true, hargaJual: null });
  return <KonteksRencana.Provider value={nilai}>{children}</KonteksRencana.Provider>;
}

export function useSuntingan() {
  const k = useContext(KonteksRencana);
  if (!k) throw new Error('useRencana harus dipakai di dalam <PenyediaRencana>');
  return k;
}
