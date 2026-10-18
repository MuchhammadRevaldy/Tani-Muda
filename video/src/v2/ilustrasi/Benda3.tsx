import React from 'react';
import { interpolateColors } from 'remotion';
import { Bayang, Jalur } from '../Bentuk';
import { W } from '../tema';

/** Grafik titik impas: garis modal datar, garis pendapatan naik, titik potong. Kotak 520×380. */
export const GrafikImpas: React.FC<{ p?: number; lebar?: number }> = ({ p = 1, lebar = 520 }) => (
  <svg viewBox="0 0 520 380" width={lebar} height={(lebar * 380) / 520} style={{ overflow: 'visible' }}>
    <rect x="0" y="0" width="520" height="380" rx="28" fill={W.putih} />
    <path d="M50 320 L490 320 M50 320 L50 40" stroke={W.teks} strokeWidth="6" strokeLinecap="round" />
    <Jalur p={p} d="M50 190 L490 190" garis={W.tomat} tebal={10} />
    <Jalur p={p} d="M50 310 L470 70" garis={W.limauTekan} tebal={12} />
    <circle cx="279" cy="190" r={22 * Math.max(0, (p - 0.6) / 0.4)} fill={W.oranye} stroke={W.putih} strokeWidth="6" />
    <text x="300" y="250" fontFamily="Outfit" fontWeight={800} fontSize="42" fill={W.oranye} opacity={Math.max(0, (p - 0.7) / 0.3)}>
      titik impas
    </text>
    <text x="60" y="176" fontFamily="Outfit" fontWeight={700} fontSize="30" fill={W.tomat}>
      modal
    </text>
  </svg>
);

/** Bola lampu dengan daun di dalamnya (saran). Kotak 300×420. */
export const BolaLampu: React.FC<{ p?: number; nyala?: number; tinggi?: number }> = ({ p = 1, nyala = 1, tinggi = 420 }) => (
  <svg viewBox="0 0 300 420" width={(tinggi * 300) / 420} height={tinggi} style={{ overflow: 'visible' }}>
    <circle cx="150" cy="150" r={140 * nyala} fill={W.matahariLembut} opacity={0.8 * nyala} />
    <Jalur p={p} d="M150 20 C230 20 280 80 280 150 C280 210 240 240 220 280 L80 280 C60 240 20 210 20 150 C20 80 70 20 150 20 Z" isi={interpolateColors(nyala, [0, 1], ['#FFFFFF', '#FFF3C4'])} garis={W.matahari} tebal={10} />
    <Jalur p={p} d="M150 250 L150 130" garis={W.limauTekan} tebal={10} />
    <Jalur p={p} d="M150 170 C110 170 90 140 96 110 C126 110 150 130 150 170 Z" isi={W.limau} />
    <Jalur p={p} d="M150 150 C190 150 210 120 204 90 C174 90 150 110 150 150 Z" isi={W.limauTekan} />
    <Jalur p={p} d="M86 290 L214 290 L206 330 L94 330 Z" isi={W.logam} />
    <Jalur p={p} d="M100 336 L200 336 L190 370 L110 370 Z" isi={W.logamGelap} />
  </svg>
);

/** Garis waktu tanam: titik hari dan tanaman yang makin besar. Kotak 700×300. */
export const GarisWaktuTanaman: React.FC<{ p?: number; lebar?: number }> = ({ p = 1, lebar = 700 }) => (
  <svg viewBox="0 0 700 300" width={lebar} height={(lebar * 300) / 700} style={{ overflow: 'visible' }}>
    <rect x="0" y="0" width="700" height="300" rx="30" fill={W.putih} />
    <Jalur p={p} d="M50 230 L650 230" garis="#E4E7EC" tebal={16} />
    <Jalur p={p} d={`M50 230 L${50 + 600 * Math.min(1, p)} 230`} garis={W.limau} tebal={16} />
    {[0, 1, 2, 3, 4].map((i) => {
      const x = 50 + i * 150;
      const s = Math.max(0, Math.min(1, p * 5 - i));
      const t = 0.3 + i * 0.25;
      return (
        <g key={i} transform={`translate(${x} 230)`}>
          <circle r="16" fill={s > 0 ? W.limauTekan : '#C9CEDA'} />
          <g transform={`scale(${s * t})`}>
            <path d="M0 -20 L0 -120" stroke={W.limauTekan} strokeWidth="10" strokeLinecap="round" />
            <path d="M0 -60 C-40 -60 -60 -90 -50 -120 C-20 -118 0 -96 0 -60 Z" fill={W.limau} />
            <path d="M0 -80 C40 -80 60 -110 50 -140 C20 -138 0 -116 0 -80 Z" fill={W.limauTekan} />
          </g>
          <text y="60" textAnchor="middle" fontFamily="Outfit" fontWeight={700} fontSize="30" fill={W.teksPendukung}>
            {['hari 0', 'ke-7', 'ke-14', 'ke-21', 'panen'][i]}
          </text>
        </g>
      );
    })}
  </svg>
);

/** Centang besar tergambar dalam lingkaran. Kotak 300×300. */
export const CentangBesar: React.FC<{ p?: number; ukuran?: number }> = ({ p = 1, ukuran = 300 }) => (
  <svg viewBox="0 0 300 300" width={ukuran} height={ukuran} style={{ overflow: 'visible' }}>
    <Bayang cx={150} cy={292} rx={110} />
    <Jalur p={Math.min(1, p * 1.6)} d="M150 14 A136 136 0 1 1 149.9 14 Z" isi={W.limau} />
    <Jalur p={Math.max(0, p * 1.6 - 0.6)} d="M82 156 L130 204 L222 108" garis={W.putih} tebal={28} />
  </svg>
);

/** Kertas pH universal yang berubah warna, dengan bagan warna. Kotak 420×300. */
export const KertasPh: React.FC<{ warna: number; lebar?: number }> = ({ warna, lebar = 420 }) => {
  const bagan = ['#E5484D', '#F27F3D', '#F5A524', '#C9C430', '#86C232', '#3BA38C', '#3D6FB4'];
  return (
    <svg viewBox="0 0 420 300" width={lebar} height={(lebar * 300) / 420} style={{ overflow: 'visible' }}>
      <rect x="0" y="0" width="420" height="300" rx="26" fill={W.putih} />
      <rect x="40" y="40" width="80" height="220" rx="10" fill="#F4EBD0" />
      <rect x="40" y="40" width="80" height="120" rx="10" fill={interpolateColors(warna, [0, 1], ['#F4EBD0', '#A8C93A'])} />
      {bagan.map((w, i) => (
        <g key={i}>
          <rect x={160 + (i % 4) * 60} y={i < 4 ? 60 : 160} width="48" height="48" rx="10" fill={w} />
          <text x={184 + (i % 4) * 60} y={i < 4 ? 136 : 236} textAnchor="middle" fontFamily="Outfit" fontWeight={700} fontSize="24" fill={W.teksPendukung}>
            {[4, 5, 5.5, 6, 6.5, 7, 8][i].toString().replace('.', ',')}
          </text>
        </g>
      ))}
    </svg>
  );
};

/** Skala busur pH dengan jarum dan pita normal. Kotak 460×300. */
export const SkalaJarum: React.FC<{ nilai: number; lebar?: number }> = ({ nilai, lebar = 460 }) => {
  const sudut = -90 + ((nilai - 4) / 4) * 180; // pH 4..8
  const busur = (a0: number, a1: number) => {
    const r = 170;
    const p = (a: number) => [230 + r * Math.cos(((a - 90) * Math.PI) / 180), 240 + r * Math.sin(((a - 90) * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <svg viewBox="0 0 460 340" width={lebar} height={(lebar * 340) / 460} style={{ overflow: 'visible' }}>
      <rect x="0" y="0" width="460" height="340" rx="26" fill={W.putih} />
      <path d={busur(-90, 90)} stroke="#E4E7EC" strokeWidth="30" fill="none" strokeLinecap="round" />
      <path d={busur(-90 + (1.5 / 4) * 180, -90 + (2.5 / 4) * 180)} stroke={W.limau} strokeWidth="30" fill="none" />
      <g transform={`rotate(${sudut} 230 240)`}>
        <path d="M222 240 L230 90 L238 240 Z" fill={W.teks} />
      </g>
      <circle cx="230" cy="240" r="20" fill={W.teks} />
      <text x="230" y="310" textAnchor="middle" fontFamily="Outfit" fontWeight={800} fontSize="44" fill={W.daun}>
        pH {nilai.toFixed(1).replace('.', ',')}
      </text>
    </svg>
  );
};

/** Brankas dengan gembok; `kunci` 0..1 gembok tergambar, `buka` 0..1 pintu terbuka. Kotak 360×380. */
export const Brankas: React.FC<{ kunci?: number; buka?: number; lebar?: number }> = ({ kunci = 1, buka = 0, lebar = 360 }) => (
  <svg viewBox="0 0 360 380" width={lebar} height={(lebar * 380) / 360} style={{ overflow: 'visible' }}>
    <Bayang cx={180} cy={372} rx={150} />
    <rect x="20" y="40" width="320" height="320" rx="30" fill={W.logamGelap} />
    <rect x="40" y="60" width="280" height="280" rx="22" fill="#2E3547" />
    {Array.from({ length: 5 }, (_, i) => (
      <circle key={i} cx={110 + (i % 3) * 70} cy={200 + Math.floor(i / 3) * 40} r="22" fill={W.emas} opacity={buka} />
    ))}
    <g transform={`translate(40 60) scale(${1 - buka * 0.85} 1)`}>
      <rect x="0" y="0" width="280" height="280" rx="22" fill={W.logam} />
      <circle cx="140" cy="140" r="54" fill={W.logamGelap} />
      <circle cx="140" cy="140" r="34" fill={W.logam} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x="136" y="88" width="8" height="18" rx="3" fill={W.logam} transform={`rotate(${a} 140 140)`} />
      ))}
    </g>
    <g opacity={1 - buka}>
      <Jalur p={kunci} d="M150 34 L150 8 C150 -28 210 -28 210 8 L210 34" garis={W.matahari} tebal={16} />
      <Jalur p={kunci} d="M130 30 L230 30 L230 100 L130 100 Z" isi={W.matahari} />
      <Jalur p={kunci} d="M180 54 L180 76" garis={W.matahariTeks} tebal={10} />
    </g>
  </svg>
);

/** Rumah pembeli / warung. Kotak 360×320. */
export const RumahPembeli: React.FC<{ lebar?: number }> = ({ lebar = 360 }) => (
  <svg viewBox="0 0 360 320" width={lebar} height={(lebar * 320) / 360} style={{ overflow: 'visible' }}>
    <Bayang cx={180} cy={312} rx={160} />
    <rect x="40" y="130" width="280" height="180" rx="10" fill={W.matahariLembut} />
    <path d="M10 140 L180 20 L350 140 Z" fill={W.oranye} />
    <path d="M180 20 L350 140 L300 140 Z" fill={W.tanah} />
    <rect x="140" y="200" width="80" height="110" rx="8" fill={W.kayu} />
    <rect x="66" y="170" width="54" height="54" rx="8" fill={W.airTerang} />
    <rect x="240" y="170" width="54" height="54" rx="8" fill={W.airTerang} />
    <path d="M40 130 L320 130 L310 150 L50 150 Z" fill={W.limau} />
  </svg>
);

/** Gelembung chat bertumpuk dengan titik mengetik. Kotak 520×460. */
export const TumpukChat: React.FC<{ muncul: number; frame: number; lebar?: number }> = ({ muncul, frame, lebar = 520 }) => {
  const isi = [
    { x: 0, y: 0, w: 380, warna: W.putih, teks: 'Kapan pupuk pertama?' },
    { x: 140, y: 120, w: 380, warna: W.limau, teks: 'Hari ke-7, ikuti resep' },
    { x: 0, y: 240, w: 300, warna: W.putih, teks: '' },
  ];
  return (
    <svg viewBox="0 0 520 460" width={lebar} height={(lebar * 460) / 520} style={{ overflow: 'visible' }}>
      {isi.map((b, i) => {
        const s = Math.max(0, Math.min(1, muncul * 3 - i));
        return (
          <g key={i} transform={`translate(${b.x} ${b.y + (1 - s) * 40})`} opacity={s}>
            <rect x="0" y="0" width={b.w} height="96" rx="40" fill={b.warna} stroke="#E4E7EC" strokeWidth="4" />
            <path d={i === 1 ? `M${b.w - 40} 90 L${b.w} 120 L${b.w - 70} 92 Z` : 'M40 90 L10 124 L80 92 Z'} fill={b.warna} />
            {b.teks ? (
              <text x="34" y="60" fontFamily="Outfit" fontWeight={700} fontSize="34" fill={i === 1 ? W.putih : W.teks}>
                {b.teks}
              </text>
            ) : (
              [0, 1, 2].map((d) => <circle key={d} cx={70 + d * 50} cy={48 - Math.max(0, Math.sin((frame - d * 6) / 5)) * 14} r="14" fill={W.teksPendukung} />)
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** Peti panen kayu berisi sayur. Kotak 240×190. */
export const Peti: React.FC<{ lebar?: number; isi?: string }> = ({ lebar = 240, isi = W.limau }) => (
  <svg viewBox="0 0 240 190" width={lebar} height={(lebar * 190) / 240} style={{ overflow: 'visible' }}>
    <Bayang cx={120} cy={184} rx={110} />
    {[40, 80, 120, 160, 200].map((x, i) => (
      <circle key={i} cx={x} cy={44 + (i % 2) * 8} r="30" fill={i % 2 ? isi : W.limauTekan} />
    ))}
    <rect x="10" y="50" width="220" height="130" rx="10" fill={W.kayuTerang} />
    <rect x="10" y="88" width="220" height="16" fill={W.kayu} />
    <rect x="10" y="134" width="220" height="16" fill={W.kayu} />
    <rect x="10" y="50" width="18" height="130" fill={W.kayu} />
    <rect x="212" y="50" width="18" height="130" fill={W.kayu} />
  </svg>
);

/** Kalkulator yang mengeluarkan koin. Kotak 280×380. */
export const Kalkulator: React.FC<{ lebar?: number; p?: number }> = ({ lebar = 280, p = 1 }) => (
  <svg viewBox="0 0 280 380" width={lebar} height={(lebar * 380) / 280} style={{ overflow: 'visible' }}>
    <Bayang cx={140} cy={372} rx={120} />
    <Jalur p={p} d="M30 10 L250 10 C262 10 270 18 270 30 L270 350 C270 362 262 370 250 370 L30 370 C18 370 10 362 10 350 L10 30 C10 18 18 10 30 10 Z" isi={W.daun} />
    <Jalur p={p} d="M40 40 L240 40 L240 120 L40 120 Z" isi={W.daunLembut} />
    <text x="226" y="98" textAnchor="end" fontFamily="Outfit" fontWeight={800} fontSize="46" fill={W.daun} opacity={p}>
      Rp
    </text>
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={40 + (i % 3) * 70} y={146 + Math.floor(i / 3) * 52} width="56" height="40" rx="10" fill={i === 11 ? W.oranye : W.limau} opacity={p} />
    ))}
  </svg>
);

/** Gembor penyiram; kotak 360×260; `siram` 0..1 air mengalir. */
export const Gembor: React.FC<{ lebar?: number; siram?: number; frame?: number }> = ({ lebar = 360, siram = 0, frame = 0 }) => (
  <svg viewBox="0 0 360 260" width={lebar} height={(lebar * 260) / 360} style={{ overflow: 'visible' }}>
    <path d="M60 70 C60 30 170 30 170 70" stroke={W.daun} strokeWidth="16" fill="none" />
    <path d="M40 80 L190 80 L180 220 L50 220 Z" fill={W.limau} />
    <path d="M190 80 L180 220 L150 220 L162 80 Z" fill={W.limauTekan} />
    <path d="M180 120 L300 60 L310 76 L188 150 Z" fill={W.limauTekan} />
    <ellipse cx="308" cy="66" rx="14" ry="26" transform="rotate(-30 308 66)" fill={W.daun} />
    {Array.from({ length: 8 }, (_, i) => {
      const t = ((frame * 0.08 + i / 8) % 1) * siram;
      return <circle key={i} cx={316 + i * 4 + t * 30} cy={80 + t * 170} r="7" fill={W.air} opacity={siram * (1 - t)} />;
    })}
  </svg>
);

/** Buku terbuka dengan tunas tumbuh dari halamannya. Kotak 420×320. */
export const BukuTunas: React.FC<{ lebar?: number; tumbuh?: number }> = ({ lebar = 420, tumbuh = 1 }) => (
  <svg viewBox="0 0 420 320" width={lebar} height={(lebar * 320) / 420} style={{ overflow: 'visible' }}>
    <Bayang cx={210} cy={312} rx={190} />
    <path d="M20 120 C80 100 160 110 210 140 L210 300 C160 270 80 262 20 280 Z" fill={W.kertas} stroke="#E7DFCF" strokeWidth="4" />
    <path d="M400 120 C340 100 260 110 210 140 L210 300 C260 270 340 262 400 280 Z" fill={W.putih} stroke="#E7DFCF" strokeWidth="4" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M50 ${170 + i * 30} C90 ${160 + i * 30} 140 ${164 + i * 30} 180 ${180 + i * 30}`} stroke="#D7DCE4" strokeWidth="8" strokeLinecap="round" fill="none" />
    ))}
    <g transform={`translate(210 140) scale(${tumbuh})`}>
      <path d="M0 0 L0 -110" stroke={W.limauTekan} strokeWidth="12" strokeLinecap="round" />
      <path d="M0 -60 C-50 -60 -76 -96 -64 -132 C-26 -128 0 -102 0 -60 Z" fill={W.limau} />
      <path d="M0 -84 C50 -84 76 -120 64 -156 C26 -152 0 -126 0 -84 Z" fill={W.limauTekan} />
    </g>
  </svg>
);
