import React from 'react';
import { interpolate } from 'remotion';
import { EASE } from '../v2/gerak';
import { HURUF, W } from '../v2/tema';
import { DATA } from './data';
import { ADEGAN, SHOT_DOK } from './linimasa';

const KIRI = 360;
const KANAN = 1560;
const Y = 1040;
const HARI = DATA.git.perHari;
/** Lingkar putih di belakang huruf supaya terbaca di atas latar apa pun (bukan kotak). */
const HALO = { stroke: '#fff', strokeWidth: 5, strokeOpacity: 0.9, paintOrder: 'stroke' as const, strokeLinejoin: 'round' as const };
const xHari = (d: number) => KIRI + ((d - 5) / (HARI.length - 1)) * (KANAN - KIRI);

/** Posisi penanda (hari Oktober, pecahan) pada frame global. */
function hariPenanda(frame: number) {
  let sebelum = ADEGAN[0].tanggal[0];
  for (const a of ADEGAN) {
    const shot = SHOT_DOK.filter((s) => s.adegan === a.id);
    const mulai = shot[0].mulaiFrame;
    const akhir = shot[shot.length - 1].mulaiFrame + shot[shot.length - 1].durasiFrame;
    if (frame < akhir) {
      if (frame < mulai + 20) return interpolate(frame, [mulai, mulai + 20], [sebelum, a.tanggal[0]], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.lompat });
      return interpolate(frame, [mulai + 20, akhir - 10], a.tanggal, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.halus });
    }
    sebelum = a.tanggal[1];
  }
  return sebelum;
}

/**
 * Pita tanggal 5–19 Oktober di bawah layar sepanjang video. Titik tiap hari sebesar jumlah
 * commit hari itu (data git), penanda tunas maju setiap adegan. Teks kecil, tanpa kotak.
 */
export const PitaTanggal: React.FC<{ frame: number }> = ({ frame }) => {
  const h = hariPenanda(frame);
  const x = xHari(h);
  const muncul = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const maks = Math.max(...HARI.map((d) => d.jumlah));
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, opacity: muncul, pointerEvents: 'none' }}>
      <line x1={KIRI - 20} y1={Y} x2={KANAN + 20} y2={Y} stroke="#fff" strokeOpacity={0.85} strokeWidth={9} strokeLinecap="round" />
      <line x1={KIRI - 20} y1={Y} x2={KANAN + 20} y2={Y} stroke={W.teks} strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
      <line x1={KIRI - 20} y1={Y} x2={x} y2={Y} stroke={W.daun} strokeWidth={4} strokeLinecap="round" />
      {HARI.map((d, i) => {
        const hx = xHari(5 + i);
        const lewat = 5 + i <= h + 0.01;
        const r = d.jumlah ? 3 + (d.jumlah / maks) * 6 : 2;
        return (
          <g key={d.tanggal}>
            <circle cx={hx} cy={Y} r={r} fill={lewat ? W.daun : W.putih} stroke={W.daun} strokeOpacity={lewat ? 1 : 0.5} strokeWidth={2} />
            <text x={hx} y={Y + 30} textAnchor="middle" fontFamily={HURUF} fontSize={18} fontWeight={lewat ? 700 : 500} fill={W.teks} fillOpacity={lewat ? 0.95 : 0.6} {...HALO}>
              {5 + i}
            </text>
          </g>
        );
      })}
      <text x={KANAN + 44} y={Y + 6} fontFamily={HURUF} fontSize={18} fontWeight={600} fill={W.teks} fillOpacity={0.75} {...HALO}>
        Okt 2026
      </text>
      {/* penanda: tunas kecil */}
      <g transform={`translate(${x} ${Y - 12})`}>
        <path d="M0 0 L0 -26" stroke={W.daun} strokeWidth={4} strokeLinecap="round" />
        <path d="M0 -16 C-4 -30 -18 -34 -24 -28 C-20 -18 -8 -14 0 -16 Z" fill={W.limau} />
        <path d="M0 -22 C4 -38 18 -42 24 -36 C20 -26 8 -20 0 -22 Z" fill={W.limauTekan} />
        <text y={-48} textAnchor="middle" fontFamily={HURUF} fontSize={21} fontWeight={800} fill={W.daun} {...HALO}>
          {Math.round(h)} Okt
        </text>
      </g>
    </svg>
  );
};
