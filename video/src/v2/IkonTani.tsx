import React from 'react';
import { Bayang, Jalur } from './Bentuk';
import { W } from './tema';

/**
 * Ikon tani berisi warna untuk aksen melayang [AG-45], digambar sendiri.
 * Kotak 100×100, berlapis (dasar, bayangan dalam, kilap) dengan bayangan di bawah.
 */
export type NamaIkonTani =
  | 'daun'
  | 'benih'
  | 'tetes'
  | 'matahari'
  | 'cangkul'
  | 'keranjang'
  | 'koin'
  | 'cabai'
  | 'tomat'
  | 'sawi';

type IsiIkon = (p: number) => React.ReactNode;

const IKON: Record<NamaIkonTani, IsiIkon> = {
  daun: (p) => (
    <>
      <Bayang cx={50} cy={92} rx={26} />
      <Jalur p={p} d="M18 78 C14 40 44 14 86 12 C88 52 62 82 18 78 Z" isi={W.limau} />
      <Jalur p={p} d="M18 78 C40 70 52 58 86 12 C88 52 62 82 18 78 Z" isi={W.limauTekan} />
      <Jalur p={p} d="M20 76 C40 58 58 40 78 22" garis={W.daunLembut} tebal={3.5} />
    </>
  ),
  benih: (p) => (
    <>
      <Bayang cx={50} cy={90} rx={24} />
      <Jalur p={p} d="M50 22 C72 22 80 46 76 64 C72 82 60 88 50 88 C40 88 28 82 24 64 C20 46 28 22 50 22 Z" isi={W.kayu} />
      <Jalur p={p} d="M50 22 C72 22 80 46 76 64 C72 82 60 88 50 88 C58 70 60 44 50 22 Z" isi={W.tanahBedeng} />
      <Jalur p={p} d="M38 38 C36 48 36 58 40 66" garis={W.kayuTerang} tebal={5} />
      <Jalur p={p} d="M50 22 C50 12 56 6 64 6 C64 14 58 20 50 22 Z" isi={W.limau} />
    </>
  ),
  tetes: (p) => (
    <>
      <Bayang cx={50} cy={92} rx={22} />
      <Jalur p={p} d="M50 8 C62 30 80 46 80 64 C80 80 66 90 50 90 C34 90 20 80 20 64 C20 46 38 30 50 8 Z" isi={W.air} />
      <Jalur p={p} d="M50 90 C66 90 80 80 80 64 C80 56 76 48 70 40 C72 62 64 82 50 90 Z" isi="#3D9FD4" />
      <Jalur p={p} d="M34 60 C34 50 40 42 44 38" garis={W.airTerang} tebal={6} />
    </>
  ),
  matahari: (p) => (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45} 50 50)`}>
          <Jalur p={p} d="M46 4 L54 4 L52 18 L48 18 Z" isi={W.matahari} />
        </g>
      ))}
      <Jalur p={p} d="M50 22 A28 28 0 1 1 49.9 22 Z" isi={W.matahari} />
      <Jalur p={p} d="M50 78 A28 28 0 0 0 78 50 C70 66 62 72 50 78 Z" isi={W.emasGelap} />
      <Jalur p={p} d="M36 42 C38 36 42 32 48 30" garis={W.matahariLembut} tebal={5} />
    </>
  ),
  cangkul: (p) => (
    <>
      <Bayang cx={50} cy={94} rx={30} />
      <Jalur p={p} d="M28 88 L72 20 L78 24 L34 92 Z" isi={W.kayuTerang} />
      <Jalur p={p} d="M31 90 L75 22 L78 24 L34 92 Z" isi={W.kayu} />
      <Jalur p={p} d="M60 12 L90 30 L84 46 L54 28 Z" isi={W.logam} />
      <Jalur p={p} d="M84 46 L54 28 L57 24 L88 42 Z" isi={W.logamGelap} />
    </>
  ),
  keranjang: (p) => (
    <>
      <Bayang cx={50} cy={94} rx={36} />
      <Jalur p={p} d="M30 40 C30 18 70 18 70 40" garis={W.kayu} tebal={6} />
      <Jalur p={p} d="M22 34 C34 20 48 26 50 38 C56 22 72 22 78 34 Z" isi={W.limau} />
      <Jalur p={p} d="M12 40 L88 40 L80 88 L20 88 Z" isi={W.kayuTerang} />
      <Jalur p={p} d="M12 40 L88 40 L86 50 L14 50 Z" isi={W.kayu} />
      {[0, 1, 2].map((i) => (
        <Jalur key={i} p={p} d={`M20 ${60 + i * 9} L80 ${60 + i * 9}`} garis={W.kayu} tebal={3} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Jalur key={`v${i}`} p={p} d={`M${32 + i * 12} 52 L${33 + i * 11} 86`} garis={W.kayu} tebal={3} />
      ))}
    </>
  ),
  koin: (p) => (
    <>
      <Bayang cx={50} cy={92} rx={28} />
      <Jalur p={p} d="M50 10 A38 38 0 1 1 49.9 10 Z" isi={W.emasGelap} />
      <Jalur p={p} d="M46 8 A36 36 0 1 1 45.9 8 Z" isi={W.emas} />
      <Jalur p={p} d="M46 18 A26 26 0 1 1 45.9 18 Z" garis={W.emasGelap} tebal={3} />
      <Jalur p={p} d="M46 62 C36 56 34 44 42 36 C48 42 50 52 46 62 Z" isi={W.matahariLembut} />
      <Jalur p={p} d="M46 62 C56 56 58 44 50 36 C46 42 44 52 46 62 Z" isi={W.matahariLembut} opacity={0.75} />
      <Jalur p={p} d="M26 32 C28 26 32 22 38 20" garis={W.matahariLembut} tebal={4} />
    </>
  ),
  cabai: (p) => (
    <>
      <Bayang cx={50} cy={92} rx={30} />
      <Jalur p={p} d="M30 22 C50 26 66 40 72 60 C76 74 84 84 90 88 C70 90 52 80 40 62 C30 48 24 34 30 22 Z" isi={W.tomat} />
      <Jalur p={p} d="M90 88 C70 90 52 80 40 62 C52 72 70 82 90 88 Z" isi="#B4262B" />
      <Jalur p={p} d="M38 32 C46 38 54 46 58 56" garis="#F7A1A3" tebal={4} />
      <Jalur p={p} d="M30 22 C24 18 22 12 26 6 C30 10 32 16 34 20 Z" isi={W.daun} />
      <Jalur p={p} d="M24 24 C30 18 38 20 40 28 C34 28 28 28 24 24 Z" isi={W.limau} />
    </>
  ),
  tomat: (p) => (
    <>
      <Bayang cx={50} cy={92} rx={32} />
      <Jalur p={p} d="M50 22 C76 22 90 40 88 60 C86 80 70 90 50 90 C30 90 14 80 12 60 C10 40 24 22 50 22 Z" isi={W.tomat} />
      <Jalur p={p} d="M50 90 C70 90 86 80 88 60 C88 54 86 48 84 44 C84 66 70 84 50 90 Z" isi="#B4262B" />
      <Jalur p={p} d="M26 46 C28 38 34 32 42 30" garis="#F7A1A3" tebal={5} />
      <Jalur p={p} d="M50 26 L38 18 L46 26 L34 30 L50 30 L64 32 L56 26 L66 18 L52 24 L50 12 Z" isi={W.limauTekan} />
    </>
  ),
  sawi: (p) => (
    <>
      <Bayang cx={50} cy={94} rx={30} />
      <Jalur p={p} d="M50 90 C30 80 16 54 24 26 C30 10 44 14 46 34 C46 54 50 72 50 90 Z" isi={W.limauTekan} />
      <Jalur p={p} d="M50 90 C70 80 84 54 76 26 C70 10 56 14 54 34 C54 54 50 72 50 90 Z" isi={W.limau} />
      <Jalur p={p} d="M50 90 C40 70 38 40 50 12 C62 40 60 70 50 90 Z" isi={W.limauTerang} />
      <Jalur p={p} d="M50 88 L50 30" garis={W.daunLembut} tebal={4} />
      <Jalur p={p} d="M44 92 L56 92 L54 80 L46 80 Z" isi={W.daunLembut} />
    </>
  ),
};

export const IkonTani: React.FC<{ nama: NamaIkonTani; ukuran?: number; p?: number; style?: React.CSSProperties }> = ({
  nama,
  ukuran = 120,
  p = 1,
  style,
}) => (
  <svg viewBox="0 0 100 100" width={ukuran} height={ukuran} style={{ overflow: 'visible', ...style }}>
    {IKON[nama](p)}
  </svg>
);

export const SEMUA_IKON_TANI = Object.keys(IKON) as NamaIkonTani[];
