import React from 'react';
import { useCurrentFrame } from 'remotion';
import { EASE, ayun, maju, pegas } from '../gerak';
import { GundukTanah, TumpukKoin } from '../ilustrasi/Benda';
import { Sosok } from '../ilustrasi/Sosok';
import { IkonTani } from '../IkonTani';
import { LogoAsli } from '../LogoAsli';
import { frameKata, type Shot } from '../linimasa';
import { JudulKata, Panggung, kataJudul } from '../Panggung';
import { HURUF, W } from '../tema';

/** 01.1 Kamera turun dari langit ke sawah; koin melompat keluar dari tanah. */
export const S01_1: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const fUntung = frameKata(shot, /untung/i, 30);
  return (
    <Panggung
      shot={shot}
      latar="sawah"
      kamera={{ dari: { y: -380, zoom: 1.18 }, ke: { y: 10, zoom: 1.02 } }}
      aksen={['daun', 'tetes', 'benih', 'sawi', 'matahari', 'koin']}
      atas={<JudulKata kata={kataJudul(shot, 'Bertani itu bisa untung', ['untung'])} top={110} ukuran={104} />}
    >
      {() => (
        <>
          <div style={{ position: 'absolute', left: 660, top: 700, transform: `scale(${pegas(frame, 4, 'berat')})`, transformOrigin: '50% 100%' }}>
            <GundukTanah lebar={600} />
          </div>
          {[0, 1, 2, 3].map((i) => {
            const mulai = fUntung - 6 + i * 5;
            const t = maju(frame, mulai, 26, EASE.keluar);
            const arah = [-1, 1, -0.4, 0.5][i];
            const x = 960 + arah * t * 260;
            const y = 760 - Math.sin(t * Math.PI * 0.85) * (330 + i * 50) - t * 60;
            const ukuran = 190 - i * 20;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - ukuran / 2,
                  top: y - ukuran / 2 + ayun(frame, i * 20, 8, 50) * t,
                  transform: `rotate(${t * 360 * arah}deg) scale(${t > 0 ? 1 : 0})`,
                }}
              >
                <IkonTani nama="koin" ukuran={ukuran} />
              </div>
            );
          })}
        </>
      )}
    </Panggung>
  );
};

/** 01.2 Benih, tumpukan koin, pembeli masuk bergantian, disambung garis putus. */
export const S01_2: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const f1 = frameKata(shot, /ditanam/i, 20);
  const f2 = frameKata(shot, /modalnya/i, 60);
  const f3 = frameKata(shot, /pembelinya/i, 100);
  const s1 = pegas(frame, f1 - 10, 'pantul');
  const s2 = pegas(frame, f2 - 10, 'pantul');
  const s3 = pegas(frame, f3 - 10, 'pantul');
  const garis = 'M520 560 C 700 420, 760 420, 960 520 S 1240 640, 1400 520';
  const pGaris = maju(frame, f1, f3 - f1 + 10, EASE.halus);
  const label = (teks: string, x: number, s: number) => (
    <div style={{ position: 'absolute', left: x - 260, top: 700, width: 520, textAlign: 'center', fontFamily: HURUF, fontWeight: 800, fontSize: 64, color: W.teks, opacity: s, transform: `translateY(${(1 - s) * 30}px)` }}>
      {teks}
    </div>
  );
  return (
    <Panggung shot={shot} latar="sawah" kamera={{ dari: { x: -60, zoom: 1.04 }, ke: { x: 60, zoom: 1.08 } }} aksen={['daun', 'tetes', 'cabai', 'tomat', 'matahari', 'sawi']}>
      {() => (
        <>
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <clipPath id="klip-garis-012">
                <rect x="480" y="300" width={pGaris * 980} height="500" />
              </clipPath>
            </defs>
            <path d={garis} clipPath="url(#klip-garis-012)" fill="none" stroke={W.teks} strokeWidth="9" strokeDasharray="1 24" strokeLinecap="round" opacity="0.55" />
          </svg>
          <div style={{ position: 'absolute', left: 520 - 150, top: 300 + ayun(frame, 0, 10, 80), transform: `scale(${s1})` }}>
            <IkonTani nama="benih" ukuran={300} />
          </div>
          <div style={{ position: 'absolute', left: 960 - 140, top: 280 + ayun(frame, 30, 10, 80), transform: `scale(${s2})`, transformOrigin: '50% 100%' }}>
            <TumpukKoin lebar={280} muncul={Math.min(1, s2 * 1.2)} />
          </div>
          <div style={{ position: 'absolute', left: 1400 - 100, top: 200 + ayun(frame, 60, 6, 90), transform: `translateX(${(1 - s3) * 400}px)`, opacity: Math.min(1, s3 * 2) }}>
            <Sosok
              gaya="pembeli"
              baju={W.oranye}
              tinggi={440}
              lambai={ayun(frame, 0, 8, 40)}
              bawa={<g transform="translate(118 180) scale(0.9)"><IkonTaniSvg /></g>}
            />
          </div>
          {label('Apa yang ditanam', 520, s1)}
          {label('Berapa modalnya', 960, s2)}
          {label('Siapa pembelinya', 1400, s3)}
        </>
      )}
    </Panggung>
  );
};

/** Keranjang kecil di tangan pembeli (SVG dalam SVG). */
const IkonTaniSvg: React.FC = () => (
  <svg viewBox="0 0 100 100" width={90} height={90} x={0} y={0}>
    <path d="M30 40 C30 18 70 18 70 40" stroke={W.kayu} strokeWidth="6" fill="none" />
    <path d="M22 34 C34 20 48 26 50 38 C56 22 72 22 78 34 Z" fill={W.limau} />
    <path d="M12 40 L88 40 L80 88 L20 88 Z" fill={W.kayuTerang} />
    <path d="M12 40 L88 40 L86 50 L14 50 Z" fill={W.kayu} />
  </svg>
);

/** 01.3 Bagian logo asli berkumpul dari ikon melayang; kilau tanah; wordmark. */
export const S01_3: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const rakit = (mulai: number) => pegas(frame, mulai, 'pantul');
  const asal = {
    tanah: { x: 0, y: 60 },
    batang: { x: 0, y: 80 },
    daunKiri: { x: -160, y: -90 },
    daunKanan: { x: 170, y: -100 },
    kilapKiri: { x: -120, y: -140 },
    kilapKanan: { x: 140, y: -150 },
  } as const;
  const urutan: (keyof typeof asal)[] = ['tanah', 'batang', 'daunKiri', 'daunKanan', 'kilapKiri', 'kilapKanan'];
  const geser = Object.fromEntries(
    urutan.map((b, i) => {
      const s = rakit(2 + i * 4);
      return [b, { x: asal[b].x * (1 - s), y: asal[b].y * (1 - s), putar: (1 - s) * (i % 2 ? 140 : -140), skala: 0.4 + s * 0.6, o: Math.min(1, s * 2) }];
    }),
  );
  const kilau = maju(frame, 26, 22, EASE.halus);
  const fMuda = frameKata(shot, /muda/i, 30);
  const sKata = pegas(frame, frameKata(shot, /tani/i, 20) - 4, 'cepat');
  const sMuda = pegas(frame, fMuda - 4, 'pantul');
  return (
    <Panggung shot={shot} latar="sawah" horizon={170} kamera={{ dari: { zoom: 1.12, y: -20 }, ke: { zoom: 1.0, y: 0 } }} aksen={['daun', 'benih', 'tetes', 'koin', 'sawi', 'matahari', 'cangkul', 'keranjang']}>
      {() => (
        <>
          <div style={{ position: 'absolute', left: 960 - 230, top: 150, filter: 'drop-shadow(0 18px 24px rgba(46,53,71,0.18))' }}>
            <LogoAsli ukuran={460} geser={geser} idPrefix="logo-013" />
            {/* kilau melintas di garis tanah */}
            <svg viewBox="0 0 100 100" width={460} height={460} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              <path d="M15 77 Q50 67 85 77" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" strokeDasharray="10 200" strokeDashoffset={-kilau * 90 + 10} opacity={kilau > 0 && kilau < 1 ? 0.9 : 0} />
            </svg>
          </div>
          <div style={{ position: 'absolute', top: 650, width: 1920, textAlign: 'center', fontFamily: HURUF, fontWeight: 800, fontSize: 150, letterSpacing: '-0.02em' }}>
            <span style={{ display: 'inline-block', color: W.daun, opacity: sKata, transform: `translateY(${(1 - sKata) * 50}px)` }}>Tani</span>{' '}
            <span style={{ display: 'inline-block', color: W.limauTekan, opacity: sMuda, transform: `translateY(${(1 - sMuda) * 50}px) scale(${0.8 + sMuda * 0.2})` }}>Muda</span>
          </div>
        </>
      )}
    </Panggung>
  );
};
