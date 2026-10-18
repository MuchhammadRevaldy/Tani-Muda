import type { CSSProperties } from 'react';

export interface IkonProps {
  /** Ukuran lebar & tinggi kotak (bawaan 64) */
  size?: number;
  /** Ketebalan garis stroke (bawaan 4) */
  strokeWidth?: number;
  /** Warna token primer (bawaan #1b4332 - daun-tua) */
  warnaUtama?: string;
  /** Warna token sekunder/aksen (bawaan #52b788 - daun-terang) */
  warnaAksen?: string;
  /** Progres animasi path (0.0 - 1.0) untuk evolvePath */
  progress?: number;
  className?: string;
  style?: CSSProperties;
}

export const WARNA_IKON = {
  daunTua: '#1b4332',
  daun: '#2d6a4f',
  daunTerang: '#52b788',
  daunMuda: '#40916c',
  daunLembut: '#d8f3dc',
  tanah: '#6c584c',
  tanahTua: '#403d39',
  emas: '#d4a373',
  padiEmas: '#c59b27',
  tomat: '#c94a29',
  latarKrem: '#faf8f5',
  latarPutih: '#ffffff',
  teks: '#1f2937',
  teksPudar: '#6b7280',
};
