import React from 'react';
import { Bayang, Jalur } from '../Bentuk';
import { acak } from '../gerak';
import { IkonTani, type NamaIkonTani } from '../IkonTani';
import { W } from '../tema';

/** Gunungan hasil panen (tomat, cabai, sawi) di atas lapak kayu; kotak 700×420. */
export const TumpukanPanen: React.FC<{ lebar?: number; isi?: NamaIkonTani[]; muncul?: number }> = ({ lebar = 700, isi = ['tomat', 'cabai', 'sawi'], muncul = 1 }) => {
  const n = 22;
  return (
    <div style={{ position: 'relative', width: lebar, height: (lebar * 420) / 700 }}>
      <svg viewBox="0 0 700 420" width={lebar} height={(lebar * 420) / 700} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <Bayang cx={350} cy={410} rx={340} ry={20} />
        <path d="M30 330 L670 330 L640 400 L60 400 Z" fill={W.kayu} />
        <path d="M30 330 L670 330 L668 344 L32 344 Z" fill={W.kayuTerang} />
      </svg>
      {Array.from({ length: n }, (_, i) => {
        const baris = i < 8 ? 0 : i < 14 ? 1 : i < 19 ? 2 : 3;
        const dalamBaris = [8, 6, 5, 3][baris];
        const ke = i - [0, 8, 14, 19][baris];
        const x = (lebar / 2) + (ke - (dalamBaris - 1) / 2) * (lebar * 0.105) + (acak(i) - 0.5) * 20;
        const y = ((330 - 70 - baris * 62) * lebar) / 700;
        const tampak = muncul * n > i ? 1 : 0;
        const u = (lebar * (110 + acak(i + 3) * 20)) / 700;
        return (
          <div key={i} style={{ position: 'absolute', left: x - u / 2, top: y - u / 2, transform: `rotate(${(acak(i + 9) - 0.5) * 50}deg) scale(${tampak})` }}>
            <IkonTani nama={isi[i % isi.length]} ukuran={u} />
          </div>
        );
      })}
    </div>
  );
};

/** Papan harga dengan angka; kotak 360×300. */
export const PapanHarga: React.FC<{ teks: string; lebar?: number }> = ({ teks, lebar = 360 }) => (
  <svg viewBox="0 0 360 300" width={lebar} height={(lebar * 300) / 360} style={{ overflow: 'visible' }}>
    <Bayang cx={180} cy={292} rx={120} />
    <rect x="70" y="150" width="16" height="140" rx="6" fill={W.kayu} />
    <rect x="274" y="150" width="16" height="140" rx="6" fill={W.kayu} />
    <rect x="10" y="20" width="340" height="170" rx="20" fill={W.teks} />
    <rect x="22" y="32" width="316" height="146" rx="14" fill="#3A4258" />
    <text x="180" y="82" textAnchor="middle" fontFamily="Outfit" fontWeight={700} fontSize="30" fill="#C9CEDA">
      harga per kg
    </text>
    <text x="180" y="152" textAnchor="middle" fontFamily="Outfit" fontWeight={800} fontSize="64" fill={W.matahariLembut}>
      {teks}
    </text>
  </svg>
);

/** Daun sawi besar; `lubang` 0..1 jumlah gigitan, `bercak` 0..1. Kotak 900×700. */
export const DaunBesar: React.FC<{ lebar?: number; lubang?: number; bercak?: number; p?: number }> = ({ lebar = 900, lubang = 0, bercak = 0, p = 1 }) => {
  const titikLubang = [
    [520, 300, 40],
    [380, 420, 34],
    [600, 470, 46],
    [460, 220, 28],
    [300, 300, 30],
    [680, 330, 32],
  ];
  const titikBercak = [
    [420, 330, 30],
    [560, 380, 38],
    [350, 480, 26],
    [640, 250, 24],
    [480, 520, 34],
    [260, 380, 22],
    [720, 420, 28],
  ];
  return (
    <svg viewBox="0 0 900 700" width={lebar} height={(lebar * 700) / 900} style={{ overflow: 'visible' }}>
      <defs>
        <mask id="mask-lubang">
          <rect x="0" y="0" width="900" height="700" fill="white" />
          {titikLubang.map(([x, y, r], i) => (
            <path
              key={i}
              d={`M${x - r} ${y} C${x - r} ${y - r * 0.8} ${x - r * 0.3} ${y - r} ${x} ${y - r * 0.9} C${x + r * 0.8} ${y - r} ${x + r} ${y - r * 0.2} ${x + r * 0.9} ${y + r * 0.3} C${x + r * 0.6} ${y + r} ${x - r * 0.4} ${y + r * 0.9} ${x - r} ${y} Z`}
              fill="black"
              transform={`translate(${x} ${y}) scale(${Math.max(0, Math.min(1, lubang * titikLubang.length - i))}) translate(${-x} ${-y})`}
            />
          ))}
        </mask>
      </defs>
      <Bayang cx={450} cy={680} rx={360} ry={22} />
      <g mask="url(#mask-lubang)">
        <Jalur p={p} d="M120 640 C60 420 180 120 470 60 C760 10 880 260 820 420 C760 590 560 660 120 640 Z" isi={W.limau} />
        <Jalur p={p} d="M120 640 C380 520 600 360 820 420 C760 590 560 660 120 640 Z" isi={W.limauTekan} />
        <Jalur p={p} d="M130 630 C320 470 520 240 760 110" garis={W.daunLembut} tebal={18} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Jalur key={i} p={p} d={`M${250 + i * 110} ${520 - i * 90} C${300 + i * 110} ${430 - i * 90} ${360 + i * 100} ${380 - i * 80} ${420 + i * 90} ${370 - i * 70}`} garis={W.daunLembut} tebal={8} />
        ))}
        {titikBercak.map(([x, y, r], i) => {
          const s = Math.max(0, Math.min(1, bercak * titikBercak.length - i));
          return (
            <g key={i} opacity={s}>
              <circle cx={x} cy={y} r={r * s} fill="#C9A227" opacity="0.8" />
              <circle cx={x} cy={y} r={r * 0.55 * s} fill={W.tanahBedeng} opacity="0.75" />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** Ulat hijau beruas; kotak 260×90. */
export const Ulat: React.FC<{ lebar?: number; gerak?: number }> = ({ lebar = 260, gerak = 0 }) => (
  <svg viewBox="0 0 260 90" width={lebar} height={(lebar * 90) / 260} style={{ overflow: 'visible' }}>
    {Array.from({ length: 7 }, (_, i) => {
      const y = 50 - Math.max(0, Math.sin(gerak * 0.3 - i * 0.7)) * 16;
      return <circle key={i} cx={30 + i * 30} cy={y} r={i === 6 ? 26 : 22} fill={i % 2 ? '#6FA82A' : '#7FBF2F'} stroke="#4F7E1A" strokeWidth="4" />;
    })}
    <circle cx="218" cy={42 - Math.max(0, Math.sin(gerak * 0.3 - 4.2)) * 16} r="5" fill={W.teks} />
    <path d="M210 24 L200 6 M226 24 L232 6" stroke="#4F7E1A" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

/** Kaca pembesar; kotak 300×300. */
export const KacaPembesar: React.FC<{ lebar?: number; p?: number }> = ({ lebar = 300, p = 1 }) => (
  <svg viewBox="0 0 300 300" width={lebar} height={lebar} style={{ overflow: 'visible' }}>
    <Jalur p={p} d="M180 180 L270 270" garis={W.kayu} tebal={34} />
    <Jalur p={p} d="M110 10 A100 100 0 1 1 109.9 10 Z" isi="rgba(166,221,245,0.35)" garis={W.logamGelap} tebal={18} />
    <Jalur p={p} d="M60 80 C70 56 90 42 112 38" garis={W.putih} tebal={10} />
  </svg>
);

/** Karung panen dengan tumpukan koin di atasnya; `koin` = jumlah keping. Kotak 220×260. */
export const Karung: React.FC<{ lebar?: number; koin?: number }> = ({ lebar = 220, koin = 0 }) => (
  <svg viewBox="0 0 220 260" width={lebar} height={(lebar * 260) / 220} style={{ overflow: 'visible' }}>
    <Bayang cx={110} cy={252} rx={90} />
    <path d="M40 90 C20 160 24 230 50 246 L170 246 C196 230 200 160 180 90 Z" fill="#D8BE8A" />
    <path d="M180 90 C200 160 196 230 170 246 L130 246 C150 200 152 140 140 90 Z" fill="#C2A46C" />
    <path d="M44 92 C70 76 150 76 176 92 L170 70 C150 58 70 58 50 70 Z" fill="#C2A46C" />
    <path d="M70 70 C90 40 130 40 150 70" fill={W.limau} />
    <path d="M70 150 L150 150 M76 180 L146 180" stroke="#B08E58" strokeWidth="5" strokeDasharray="10 8" />
    {Array.from({ length: koin }, (_, i) => (
      <g key={i} transform={`translate(0 ${-i * 16})`}>
        <path d="M66 46 L66 56 A44 10 0 0 0 154 56 L154 46 Z" fill={W.emasGelap} />
        <ellipse cx="110" cy="46" rx="44" ry="10" fill={W.emas} />
      </g>
    ))}
  </svg>
);

/** Truk bak penuh hasil panen; kotak 640×340, `roda` = sudut putar roda. */
export const Truk: React.FC<{ lebar?: number; roda?: number }> = ({ lebar = 640, roda = 0 }) => (
  <svg viewBox="0 0 640 340" width={lebar} height={(lebar * 340) / 640} style={{ overflow: 'visible' }}>
    <Bayang cx={320} cy={326} rx={300} ry={18} />
    {/* muatan */}
    {Array.from({ length: 12 }, (_, i) => (
      <circle key={i} cx={70 + (i % 6) * 62 + (i > 5 ? 30 : 0)} cy={i > 5 ? 70 : 96} r={i % 3 === 0 ? 34 : 30} fill={[W.tomat, W.limau, W.matahari][i % 3]} />
    ))}
    <rect x="30" y="100" width="420" height="150" rx="14" fill={W.oranye} />
    <rect x="30" y="100" width="420" height="22" rx="8" fill={W.tanah} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={60 + i * 100} y="140" width="70" height="80" rx="8" fill="#F79459" />
    ))}
    <path d="M460 130 L560 130 L612 196 L612 250 L460 250 Z" fill={W.limauTekan} />
    <path d="M478 146 L548 146 L586 196 L478 196 Z" fill={W.airTerang} />
    <rect x="590" y="214" width="30" height="16" rx="6" fill={W.matahari} />
    {[130, 520].map((x) => (
      <g key={x} transform={`translate(${x} 260) rotate(${roda})`}>
        <circle r="46" fill={W.teks} />
        <circle r="22" fill={W.logam} />
        <rect x="-4" y="-22" width="8" height="44" fill={W.logamGelap} />
      </g>
    ))}
  </svg>
);

/** Tiang dengan papan arah kosong; kotak 300×500. */
export const PapanArah: React.FC<{ tinggi?: number; goyang?: number }> = ({ tinggi = 500, goyang = 0 }) => (
  <svg viewBox="0 0 300 500" width={(tinggi * 300) / 500} height={tinggi} style={{ overflow: 'visible' }}>
    <Bayang cx={150} cy={492} rx={70} />
    <rect x="138" y="60" width="24" height="430" rx="8" fill={W.kayu} />
    <g transform={`rotate(${-8 + goyang} 150 120)`}>
      <path d="M150 90 L280 90 L300 120 L280 150 L150 150 Z" fill={W.kayuTerang} />
    </g>
    <g transform={`rotate(${10 - goyang} 150 220)`}>
      <path d="M150 190 L20 190 L0 220 L20 250 L150 250 Z" fill={W.kayuTerang} />
    </g>
    <g transform={`rotate(${-4 + goyang * 0.5} 150 310)`}>
      <path d="M150 290 L270 290 L290 320 L270 350 L150 350 Z" fill="#D9A56E" />
    </g>
  </svg>
);
