import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Jalur } from '../Bentuk';
import { EASE, ayun, maju, pegas } from '../gerak';
import { Sosok } from '../ilustrasi/Sosok';
import { frameKata, type Shot } from '../linimasa';
import { JudulKata, Panggung, kataJudul } from '../Panggung';
import { HURUF, W } from '../tema';

const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * 02.1 Buku Sensus Pertanian 2023 terbuka; halamannya menjadi diagram batang.
 * Hanya dua batang dengan angka resmi: 19–39 tahun 21,93% dan usia lain 78,07%.
 */
export const S02_1: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const buka = maju(frame, 6, 34, EASE.keluar);
  const fAngka = frameKata(shot, /21,93|21|dua/i, 150);
  const tumbuh = maju(frame, 40, 60, EASE.keluar);
  const fPetani = frameKata(shot, /^petani/i, 90);
  const hitung = maju(frame, fPetani, Math.max(20, fAngka - fPetani + 10), EASE.halus);
  const nyala = maju(frame, fAngka - 10, 20);
  const angka = (21.93 * hitung).toFixed(2).replace('.', ',');
  const tinggiMaks = 360;
  const batang = [
    { label: '19–39 tahun', nilai: 21.93, warna: W.limau, sorot: true },
    { label: 'usia lain', nilai: 78.07, warna: '#C9CEDA', sorot: false },
  ];
  return (
    <Panggung shot={shot} latar="langit" horizon={140} kamera={{ dari: { zoom: 1.0, y: 20 }, ke: { zoom: 1.08, x: 20 } }} aksen={['benih', 'daun', 'sawi', 'koin', 'tetes', 'tomat']}>
      {() => (
        <div style={{ position: 'absolute', left: 260, top: 150, width: 1400, height: 760, filter: 'drop-shadow(0 26px 30px rgba(46,53,71,0.22))' }}>
          {/* halaman kiri */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: 700, height: 700, background: W.kertas, borderRadius: '26px 0 0 26px', borderRight: `4px solid #E7DFCF`, padding: 60, fontFamily: HURUF }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: W.teksPendukung, opacity: buka }}>Hasil pencacahan lengkap</div>
            <div style={{ fontSize: 80, fontWeight: 800, color: W.daun, lineHeight: 1.02, marginTop: 10, opacity: buka }}>Sensus Pertanian 2023</div>
            <div style={{ marginTop: 50, fontSize: 40, fontWeight: 700, color: W.teks, opacity: maju(frame, fPetani - 6, 16) }}>Petani berusia 19–39 tahun</div>
            <div style={{ fontSize: 190, fontWeight: 800, color: W.oranye, lineHeight: 1, letterSpacing: '-0.03em', opacity: maju(frame, fPetani, 10) }}>{angka}%</div>
            <div style={{ position: 'absolute', bottom: 44, left: 60, fontSize: 26, color: W.teksPendukung }}>Sumber: BPS</div>
          </div>
          {/* halaman kanan: diagram */}
          <div style={{ position: 'absolute', left: 700, top: 0, width: 700, height: 700, background: W.kertas, borderRadius: '0 26px 26px 0', padding: 60, fontFamily: HURUF }}>
            <svg viewBox="0 0 580 580" width={580} height={580}>
              <line x1="40" y1="470" x2="560" y2="470" stroke={W.teks} strokeWidth="4" strokeLinecap="round" opacity={tumbuh} />
              {batang.map((b, i) => {
                const h = (b.nilai / 100) * tinggiMaks * tumbuh * 1.2;
                const x = 90 + i * 250;
                return (
                  <g key={b.label}>
                    {b.sorot && <rect x={x - 16} y={470 - h - 16} width={172} height={h + 16} rx="18" fill={W.limauTerang} opacity={nyala * 0.45} />}
                    <rect x={x} y={470 - h} width={140} height={h} rx="12" fill={b.sorot ? interpolateWarna(nyala) : b.warna} />
                    <rect x={x} y={470 - h} width={30} height={h} rx="10" fill="#fff" opacity="0.25" />
                    <text x={x + 70} y={520} textAnchor="middle" fontFamily="Outfit" fontWeight={700} fontSize="34" fill={W.teks}>
                      {b.label}
                    </text>
                    <text x={x + 70} y={470 - h - 24} textAnchor="middle" fontFamily="Outfit" fontWeight={800} fontSize="40" fill={b.sorot ? W.oranye : W.teksPendukung} opacity={tumbuh}>
                      {(b.nilai * hitung).toFixed(2).replace('.', ',')}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          {/* sampul yang membuka */}
          <div
            style={{
              position: 'absolute',
              left: 700,
              top: 0,
              width: 700,
              height: 700,
              transformOrigin: '0% 50%',
              transform: `perspective(2400px) rotateY(${-178 * buka}deg)`,
              background: W.daun,
              borderRadius: '0 26px 26px 0',
              backfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 70,
              fontFamily: HURUF,
              color: W.daunLembut,
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.8 }}>Badan Pusat Statistik</div>
            <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>Sensus Pertanian 2023</div>
          </div>
        </div>
      )}
    </Panggung>
  );
};

function interpolateWarna(t: number) {
  return t > 0.5 ? W.limau : W.limauTerang;
}

/** 02.2 Satu dari lima: empat petani memudar, petani muda maju, pecahan 1/5 tergambar. */
export const S02_2: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const masuk = (i: number) => pegas(frame, i * 3, 'pantul');
  const abu = maju(frame, 14, 18);
  const maju1 = pegas(frame, 18, 'berat');
  const lingkar = maju(frame, 22, 26, EASE.keluar);
  const bajuAbu = ['#7FA06A', '#B9875E', '#7C8FA8', '#A88C7C'];
  return (
    <Panggung
      shot={shot}
      latar="sawah"
      horizon={60}
      kamera={{ dari: { zoom: 1.0 }, ke: { zoom: 1.08, x: -40 } }}
      aksen={['daun', 'benih', 'sawi', 'tetes', 'matahari']}
      atas={<JudulKata kata={kataJudul(shot, 'Satu dari lima', ['Satu'])} top={70} ukuran={96} />}
    >
      {() => (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const muda = i === 2;
            const x = 260 + i * 250;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: 270 + (muda ? -maju1 * 20 : 0),
                  transform: `translateY(${(1 - masuk(i)) * 300}px) scale(${muda ? 1 + maju1 * 0.18 : 1})`,
                  transformOrigin: '50% 100%',
                  zIndex: muda ? 2 : 1,
                }}
              >
                <Sosok gaya={muda ? 'muda' : 'petani'} baju={muda ? W.limau : bajuAbu[i > 2 ? i - 1 : i]} tinggi={540} abu={muda ? 0 : abu} lambai={muda ? ayun(frame, 0, 14, 30) * maju1 : 0} />
              </div>
            );
          })}
          {/* pecahan 1/5 */}
          <svg viewBox="0 0 300 300" width={280} height={280} style={{ position: 'absolute', left: 1500, top: 300, overflow: 'visible' }}>
            <circle cx="150" cy="150" r="120" fill={W.putih} stroke="#C9CEDA" strokeWidth="6" />
            {[0, 1, 2, 3, 4].map((i) => {
              const a0 = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const a1 = ((i + 1) / 5) * Math.PI * 2 - Math.PI / 2;
              const d = `M150 150 L${150 + 120 * Math.cos(a0)} ${150 + 120 * Math.sin(a0)} A120 120 0 0 1 ${150 + 120 * Math.cos(a1)} ${150 + 120 * Math.sin(a1)} Z`;
              return <Jalur key={i} d={d} p={Math.max(0, Math.min(1, lingkar * 5 - i))} isi={i === 0 ? W.limau : '#E4E7EC'} garis={W.putih} tebal={6} />;
            })}
            <text x="150" y="340" textAnchor="middle" fontFamily="Outfit" fontWeight={800} fontSize="80" fill={W.teks} opacity={lingkar}>
              1/5
            </text>
          </svg>
        </>
      )}
    </Panggung>
  );
};

/** 02.3 Piramida penduduk tumbuh; pita usia produktif menyala; siluet anak muda naik. */
export const S02_3: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const fBonus = frameKata(shot, /bonus/i, 30);
  const fMuda = frameKata(shot, /muda/i, 80);
  const baris = 9;
  const nyala = maju(frame, fBonus, 14);
  return (
    <Panggung
      shot={shot}
      latar="kota"
      horizon={40}
      kamera={{ dari: { zoom: 1.1, y: 30 }, ke: { zoom: 1.0, y: -10 } }}
      aksen={['daun', 'koin', 'benih', 'sawi', 'matahari', 'cabai']}
      atas={<JudulKata kata={kataJudul(shot, 'Bonus demografi di tangan anak muda', ['anak', 'muda'])} top={60} ukuran={80} />}
    >
      {() => (
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: baris }, (_, i) => {
            // baris 0 = paling bawah (anak), atas = lansia; lebar sengaja skematis
            const y = 860 - i * 62;
            const lebarPenuh = 760 - i * 62 + (i < 5 ? 40 : 0);
            const t = maju(frame, 4 + i * 4, 20, EASE.keluar);
            const produktif = i >= 2 && i <= 6;
            const warna = produktif ? interpolateWarnaHijau(nyala) : '#D7DCE4';
            return (
              <g key={i}>
                <rect x={960 - (lebarPenuh / 2) * t} y={y} width={lebarPenuh * t} height="52" rx="12" fill={warna} />
              </g>
            );
          })}
          <rect x={560} y={860 - 6 * 62 - 10} width={800} height={5 * 62 + 4} rx="22" fill="none" stroke={W.daun} strokeWidth="8" strokeDasharray="20 16" opacity={nyala} />
          <text x={1390} y={860 - 4 * 62 + 40} fontFamily="Outfit" fontWeight={800} fontSize="56" fill={W.daun} opacity={nyala}>
            usia produktif
          </text>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const naik = maju(frame, fMuda - 20 + i * 4, 30, EASE.keluar);
            const x = 700 + i * 105;
            const y = interpolate(naik, [0, 1], [700, 330], klem) + ayun(frame, i * 20, 6, 50);
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity={naik}>
                <circle cx="0" cy="-60" r="26" fill={W.daun} />
                <path d="M-34 40 C-34 -14 34 -14 34 40 Z" fill={W.daun} />
              </g>
            );
          })}
        </svg>
      )}
    </Panggung>
  );
};

function interpolateWarnaHijau(t: number) {
  return t < 0.5 ? '#D7DCE4' : W.limau;
}
