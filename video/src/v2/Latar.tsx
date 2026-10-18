import React from 'react';
import { interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { acak } from './gerak';
import type { Kamera } from './gerak';
import { W } from './tema';

export type JenisLatar = 'sawah' | 'bedengan' | 'kota' | 'jalan' | 'langit';

interface Props {
  jenis: JenisLatar;
  kamera: Kamera;
  /** 0 = cerah, 1 = hujan */
  hujan?: number;
  /** 0 = siang, 1 = senja */
  senja?: number;
  /** geser horizon (px, + turun) */
  horizon?: number;
}

const KIRI = -400;
const KANAN = 2320;

/** Garis bukit bergelombang dari kiri ke kanan, ditutup ke bawah layar. */
function bukit(y: number, amp: number, gelombang: number, fase: number, tutup = true) {
  const n = 14;
  const lebar = (KANAN - KIRI) / n;
  let d = `M${KIRI} ${y + Math.sin(fase) * amp}`;
  for (let i = 1; i <= n; i++) {
    const x = KIRI + i * lebar;
    const yy = y + Math.sin(fase + (i / n) * Math.PI * gelombang) * amp;
    const cx = x - lebar / 2;
    const cy = y + Math.sin(fase + ((i - 0.5) / n) * Math.PI * gelombang) * amp * 1.15;
    d += ` Q${cx} ${cy} ${x} ${yy}`;
  }
  return tutup ? `${d} L${KANAN} 1300 L${KIRI} 1300 Z` : d;
}

const Lapis: React.FC<{ k: Kamera; dalam: number; children: React.ReactNode }> = ({ k, dalam, children }) => (
  <g transform={`translate(${-k.x * dalam} ${-k.y * dalam})`}>{children}</g>
);

function Awan({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="14" rx="120" ry="20" fill={W.bayang} opacity="0.25" />
      <path d="M-110 10 C-120 -20 -80 -36 -55 -22 C-45 -60 10 -66 28 -30 C48 -52 96 -40 96 -6 C122 -4 126 16 104 18 L-96 18 C-112 18 -116 14 -110 10 Z" fill={W.awan} />
      <path d="M-96 14 L104 14" stroke="#E6EEF2" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}

function Rumah({ x, y, s, warna }: { x: number; y: number; s: number; warna: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-40" y="-40" width="80" height="60" rx="4" fill={warna} />
      <path d="M-52 -38 L0 -82 L52 -38 Z" fill={W.tanah} />
      <rect x="-12" y="-10" width="24" height="30" rx="3" fill={W.kayu} />
      <rect x="-32" y="-28" width="14" height="14" rx="2" fill={W.matahariLembut} />
      <rect x="18" y="-28" width="14" height="14" rx="2" fill={W.matahariLembut} />
    </g>
  );
}

function Pohon({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-10" width="10" height="40" rx="3" fill={W.kayu} />
      <circle cx="0" cy="-34" r="34" fill={W.sawahGelap} />
      <circle cx="-18" cy="-20" r="22" fill={W.daun} />
      <circle cx="14" cy="-46" r="16" fill={W.bukitTengah} opacity="0.7" />
    </g>
  );
}

export const Latar: React.FC<Props> = ({ jenis, kamera: k, hujan = 0, senja = 0, horizon = 0 }) => {
  const frame = useCurrentFrame();
  const langitBawah = interpolateColors(hujan, [0, 1], [interpolateColors(senja, [0, 1], [W.langit, W.senja]), W.mendung]);
  const langitAtas = interpolateColors(hujan, [0, 1], [interpolateColors(senja, [0, 1], [W.langitAtas, W.senjaAtas]), '#9AAAB5']);
  const redup = interpolate(hujan, [0, 1], [1, 0.82]);
  const h = horizon;

  // posisi matahari: siang tinggi, senja rendah
  const yMatahari = interpolate(senja, [0, 1], [190, 470]) + h * 0.3;

  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern id="padi" width="58" height="34" patternUnits="userSpaceOnUse">
          <path d="M10 30 L14 16 M17 30 L17 13 M24 30 L20 17" stroke={W.sawahGelap} strokeWidth="2.6" strokeLinecap="round" opacity="0.45" />
          <path d="M40 30 L43 20 M46 30 L46 18" stroke={W.daun} strokeWidth="2.2" strokeLinecap="round" opacity="0.3" />
        </pattern>
        <pattern id="bintik-kertas" width="140" height="140" patternUnits="userSpaceOnUse">
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={acak(i) * 140} cy={acak(i + 50) * 140} r={0.6 + acak(i + 99) * 1.2} fill="#7A5A3A" opacity={0.05 + acak(i + 7) * 0.06} />
          ))}
        </pattern>
      </defs>

      {/* langit dua warna polos, dibelah garis lembut */}
      <rect x="0" y="0" width="1920" height="1080" fill={langitBawah} />
      <Lapis k={k} dalam={0.05}>
        <path d={bukit(260 + h * 0.2, 40, 1.4, 0.3)} fill={langitAtas} opacity="0.55" transform="scale(1 -1) translate(0 -520)" />
      </Lapis>

      {/* matahari */}
      <Lapis k={k} dalam={0.08}>
        <g opacity={1 - hujan} transform={`translate(1790 ${yMatahari - 40})`}>
          <circle r="120" fill={W.matahariLembut} opacity="0.7" />
          <circle r="76" fill={interpolateColors(senja, [0, 1], [W.matahari, W.oranye])} />
          <circle r="76" fill="none" stroke={W.matahariLembut} strokeWidth="6" opacity="0.6" transform={`rotate(${frame * 0.4})`} strokeDasharray="20 28" />
        </g>
      </Lapis>

      {/* awan berjalan */}
      <Lapis k={k} dalam={0.12}>
        {[0, 1, 2, 3].map((i) => {
          const lebar = KANAN - KIRI + 400;
          const x = ((acak(i + 3) * lebar + frame * (0.35 + i * 0.12)) % lebar) + KIRI - 200;
          return <Awan key={i} x={x} y={120 + acak(i + 11) * 170 + h * 0.2} s={0.7 + acak(i + 5) * 0.6} />;
        })}
      </Lapis>

      {/* bukit jauh */}
      <Lapis k={k} dalam={0.2}>
        <path d={bukit(560 + h, 46, 2.2, 1.2)} fill={W.bukitJauh} opacity={redup} />
      </Lapis>

      {/* bukit tengah dengan garis terasering */}
      <Lapis k={k} dalam={0.38}>
        <path d={bukit(640 + h, 58, 1.6, 2.4)} fill={W.bukitTengah} opacity={redup} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={bukit(668 + h + i * 34, 58 - i * 6, 1.6, 2.4, false)} fill="none" stroke={W.limauTerang} strokeWidth="5" opacity="0.65" />
        ))}
        {jenis !== 'langit' &&
          [180, 520, 980, 1320, 1760].map((x, i) => <Pohon key={i} x={x} y={630 + h + Math.sin(i * 1.7) * 30} s={0.55 + acak(i) * 0.3} />)}
      </Lapis>

      {jenis === 'kota' && (
        <Lapis k={k} dalam={0.5}>
          {[260, 420, 560, 1260, 1420, 1580, 1720].map((x, i) => (
            <Rumah key={i} x={x} y={735 + h + (i % 2) * 12} s={0.75 + acak(i + 2) * 0.35} warna={[W.matahariLembut, W.tanahLembut, W.putih][i % 3]} />
          ))}
        </Lapis>
      )}

      {/* lahan dekat */}
      <Lapis k={k} dalam={0.62}>
        <path d={bukit(760 + h, 30, 1.2, 0.8)} fill={W.bukitDekat} opacity={redup} />
        {jenis === 'sawah' || jenis === 'kota' || jenis === 'langit' ? (
          <>
            <path d={bukit(800 + h, 26, 1.2, 0.8)} fill={W.sawah} />
            <path d={bukit(800 + h, 26, 1.2, 0.8)} fill="url(#padi)" />
            {[0, 1, 2].map((i) => (
              <path key={i} d={bukit(860 + h + i * 70, 22, 1.2, 0.8 + i * 0.2, false)} fill="none" stroke={W.sawahGelap} strokeWidth="6" opacity="0.5" />
            ))}
          </>
        ) : null}
        {jenis === 'jalan' && (
          <>
            <path d={bukit(800 + h, 26, 1.2, 0.8)} fill={W.sawah} />
            <path d={bukit(800 + h, 26, 1.2, 0.8)} fill="url(#padi)" />
            <path
              d={`M760 1200 C 900 1000, 1250 960, 1060 860 S 820 760, 1000 ${700 + h}`}
              fill="none"
              stroke={W.tanahLembut}
              strokeWidth="120"
              strokeLinecap="round"
            />
            <path
              d={`M760 1200 C 900 1000, 1250 960, 1060 860 S 820 760, 1000 ${700 + h}`}
              fill="none"
              stroke={W.matahariLembut}
              strokeWidth="6"
              strokeDasharray="30 30"
            />
          </>
        )}
        {jenis === 'bedengan' && (
          <>
            <path d={bukit(800 + h, 18, 1.2, 0.8)} fill={W.tanahBedengTerang} />
            {Array.from({ length: 9 }, (_, i) => {
              const xHorizon = 960 + (i - 4) * 90;
              const xBawah = 960 + (i - 4) * 420;
              return (
                <g key={i}>
                  <path
                    d={`M${xHorizon - 30} ${805 + h} L${xHorizon + 30} ${805 + h} L${xBawah + 150} 1100 L${xBawah - 150} 1100 Z`}
                    fill={W.tanahBedeng}
                  />
                  {Array.from({ length: 6 }, (_, j) => {
                    const t = (j + 1) / 7;
                    const y = 805 + h + t * t * 300;
                    const x = xHorizon + (xBawah - xHorizon) * t * t;
                    const s = 0.4 + t * t * 1.4;
                    return (
                      <g key={j} transform={`translate(${x} ${y}) scale(${s})`}>
                        <path d="M0 0 C-18 -6 -22 -26 -6 -30 C-2 -18 0 -10 0 0 Z" fill={W.limau} />
                        <path d="M0 0 C18 -6 22 -26 6 -30 C2 -18 0 -10 0 0 Z" fill={W.limauTekan} />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </>
        )}
      </Lapis>

      {/* rumput depan */}
      <Lapis k={k} dalam={0.9}>
        {Array.from({ length: 30 }, (_, i) => {
          const x = KIRI + i * 95 + acak(i) * 40;
          const y = 1062 + acak(i + 4) * 30;
          return (
            <path
              key={i}
              d={`M${x} ${y} q 6 -40 ${14 + acak(i) * 10} -58 M${x + 10} ${y} q 0 -30 -12 -46`}
              stroke={W.daun}
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
              transform={`rotate(${Math.sin((frame + i * 9) / 30) * 3} ${x} ${y})`}
            />
          );
        })}
      </Lapis>

      {/* hujan */}
      {hujan > 0 && (
        <g opacity={hujan}>
          {Array.from({ length: 90 }, (_, i) => {
            const x = acak(i) * 2000 - 40;
            const y = ((acak(i + 30) * 1100 + frame * 28) % 1160) - 60;
            return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 34} stroke="#E8F4FA" strokeWidth="3.2" strokeLinecap="round" opacity="0.8" />;
          })}
        </g>
      )}

      {/* tekstur kertas halus */}
      <rect x="0" y="0" width="1920" height="1080" fill="url(#bintik-kertas)" />
    </svg>
  );
};
