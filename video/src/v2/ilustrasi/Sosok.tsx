import React from 'react';
import { Bayang, Jalur } from '../Bentuk';
import { W } from '../tema';

/**
 * Sosok orang datar berlapis (bukan ikon garis). Kotak 200×400, kaki di y=390.
 * `gaya`: petani (caping), pembeli (kerudung + keranjang), muda (rambut), perantara (topi).
 */
export type GayaSosok = 'petani' | 'pembeli' | 'muda' | 'perantara' | 'penyuluh';

export const Sosok: React.FC<{
  gaya?: GayaSosok;
  baju?: string;
  celana?: string;
  tinggi?: number;
  p?: number;
  abu?: number;
  lambai?: number;
  bawa?: React.ReactNode;
}> = ({ gaya = 'petani', baju = W.limau, celana = W.teks, tinggi = 400, p = 1, abu = 0, lambai = 0, bawa }) => {
  const kulit = W.kulit;
  return (
    <svg
      viewBox="0 0 200 400"
      width={tinggi / 2}
      height={tinggi}
      style={{ overflow: 'visible', filter: abu ? `grayscale(${abu}) opacity(${1 - abu * 0.45})` : undefined }}
    >
      <Bayang cx={100} cy={392} rx={62} />
      {/* kaki */}
      <Jalur p={p} d="M74 250 L70 380 L94 380 L100 262 L106 380 L130 380 L126 250 Z" isi={celana} />
      <Jalur p={p} d="M64 380 L96 380 L96 392 L60 392 Z" isi={W.teks} />
      <Jalur p={p} d="M104 380 L136 380 L140 392 L104 392 Z" isi={W.teks} />
      {/* badan */}
      <Jalur p={p} d="M62 140 C62 118 80 108 100 108 C120 108 138 118 138 140 L134 262 L66 262 Z" isi={baju} />
      <Jalur p={p} d="M100 108 C120 108 138 118 138 140 L134 262 L110 262 C118 210 118 150 100 108 Z" isi="rgba(0,0,0,0.12)" />
      {/* lengan */}
      <g transform={`rotate(${-lambai} 64 132)`}>
        <Jalur p={p} d="M64 132 C48 150 42 190 46 226 L60 226 C60 196 66 168 76 150 Z" isi={baju} />
        <Jalur p={p} d="M44 224 A9 9 0 1 0 62 224 Z" isi={kulit} />
      </g>
      <Jalur p={p} d="M136 132 C152 150 158 190 154 226 L140 226 C140 196 134 168 124 150 Z" isi={baju} />
      <Jalur p={p} d="M138 224 A9 9 0 1 0 156 224 Z" isi={kulit} />
      {/* leher dan kepala */}
      <Jalur p={p} d="M90 92 L110 92 L110 112 L90 112 Z" isi={W.kulitGelap} />
      <Jalur p={p} d="M100 34 C122 34 130 50 130 66 C130 86 116 100 100 100 C84 100 70 86 70 66 C70 50 78 34 100 34 Z" isi={kulit} />
      <Jalur p={p} d="M86 70 A3.5 3.5 0 1 0 86.1 70 Z M114 70 A3.5 3.5 0 1 0 114.1 70 Z" isi={W.teks} />
      <Jalur p={p} d="M90 84 C96 90 104 90 110 84" garis={W.teks} tebal={3} />
      {gaya === 'petani' && (
        <>
          <Jalur p={p} d="M100 6 L168 52 C140 58 60 58 32 52 Z" isi={W.kayuTerang} />
          <Jalur p={p} d="M100 6 L168 52 C150 55 120 57 100 57 Z" isi={W.kayu} />
        </>
      )}
      {gaya === 'muda' && (
        <Jalur p={p} d="M70 64 C66 36 88 24 104 26 C124 28 134 44 130 64 C124 50 112 44 98 46 C86 48 76 54 70 64 Z" isi={W.rambut} />
      )}
      {gaya === 'pembeli' && (
        <Jalur p={p} d="M66 72 C62 40 82 24 100 24 C118 24 138 40 134 72 C134 96 124 112 100 116 C76 112 66 96 66 72 Z M78 70 C80 88 90 98 100 98 C110 98 120 88 122 70 C120 52 110 44 100 44 C90 44 80 52 78 70 Z" isi={W.oranye} />
      )}
      {gaya === 'perantara' && (
        <>
          <Jalur p={p} d="M64 52 L136 52 L130 40 C126 26 74 26 70 40 Z" isi={W.teksPendukung} />
          <Jalur p={p} d="M56 52 L144 52 L144 58 L56 58 Z" isi={W.teks} />
        </>
      )}
      {gaya === 'penyuluh' && (
        <>
          <Jalur p={p} d="M68 50 C70 28 130 28 132 50 L150 54 L50 54 Z" isi={W.daun} />
          <Jalur p={p} d="M84 140 L116 140 L112 170 L88 170 Z" isi={W.putih} />
        </>
      )}
      {bawa}
    </svg>
  );
};
