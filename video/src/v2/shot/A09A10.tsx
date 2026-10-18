import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, acak, antara, ayun, maju, pegas } from '../gerak';
import { IDENTITAS } from '../identitas';
import { IkonTani } from '../IkonTani';
import { frameKata, type Shot } from '../linimasa';
import { LogoAsli } from '../LogoAsli';
import { JudulKata, Panggung, kataJudul } from '../Panggung';
import { HURUF, W } from '../tema';

const LEVEL = [
  { nama: 'Benih', berkas: 'lencana/level-benih.svg' },
  { nama: 'Tunas', berkas: 'lencana/level-tunas.svg' },
  { nama: 'Daun', berkas: 'lencana/level-daun.svg' },
  { nama: 'Berbunga', berkas: 'lencana/level-berbunga.svg' },
  { nama: 'Panen Raya', berkas: 'lencana/level-panen-raya.svg' },
];

/** 09.1 Lima lencana level naik berurutan di atas tangga bedengan, dengan percikan daun. */
export const S09_1: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const fBenih = frameKata(shot, /benih/i, d * 0.55);
  const fRaya = frameKata(shot, /raya/i, d * 0.85);
  const jarak = Math.max(6, (fRaya - fBenih) / 4);
  const anak = (i: number) => {
    const x = 260 + i * 330;
    const y = 830 - i * 105;
    return { x, y };
  };
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.05, x: -60, y: 30 }, ke: { zoom: 1.0, x: 60, y: -30 } }} aksen={['daun', 'sawi', 'koin', 'benih', 'tetes']} atas={<JudulKata kata={kataJudul(shot, 'Makin rajin, level naik', ['naik'])} top={70} ukuran={88} />}>
      {() => (
        <>
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            {LEVEL.map((_, i) => {
              const { x, y } = anak(i);
              return (
                <g key={i} opacity={maju(frame, i * 3, 10)}>
                  <path d={`M${x - 170} ${y} L${x + 170} ${y} L${x + 150} ${y + 70} L${x - 150} ${y + 70} Z`} fill={W.tanahBedeng} />
                  <path d={`M${x - 170} ${y} L${x + 170} ${y} L${x + 166} ${y + 14} L${x - 166} ${y + 14} Z`} fill={W.tanahBedengTerang} />
                  {[-110, -40, 30, 100].map((dx) => (
                    <path key={dx} d={`M${x + dx} ${y} c -10 -20 -4 -34 8 -40 c 4 14 2 28 -8 40 Z`} fill={W.limau} />
                  ))}
                </g>
              );
            })}
          </svg>
          {LEVEL.map((l, i) => {
            const mulai = fBenih + i * jarak - 6;
            const sp = pegas(frame, mulai, 'pantul');
            const { x, y } = anak(i);
            const percik = maju(frame, mulai + 6, 18, EASE.keluar);
            return (
              <div key={l.nama} style={{ position: 'absolute', left: x - 110, top: y - 250 - (1 - sp) * 260 + ayun(frame, i * 20, 5, 60) * sp, opacity: Math.min(1, sp * 2) }}>
                <Img src={staticFile(l.berkas)} style={{ width: 220, height: 220 }} />
                <div style={{ textAlign: 'center', fontFamily: HURUF, fontWeight: 800, fontSize: 40, color: W.teks, marginTop: -6 }}>{l.nama}</div>
                {percik > 0 && percik < 1 &&
                  [0, 1, 2, 3, 4].map((k) => {
                    const a = (k / 5) * Math.PI * 2 + i;
                    return (
                      <div key={k} style={{ position: 'absolute', left: 90 + Math.cos(a) * percik * 170, top: 190 + Math.sin(a) * percik * 90 - percik * 40, opacity: 1 - percik, transform: `rotate(${percik * 200}deg)` }}>
                        <IkonTani nama="daun" ukuran={48} />
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </>
      )}
    </Panggung>
  );
};

const PENCAPAIAN = [
  'tanam-pertama',
  'tepat-waktu-7-hari',
  'kebun-terdokumentasi',
  'pengukur-teliti',
  'pelajar-rajin',
  'panen-pertama',
  'dipercaya-pembeli',
  'bintang-lima',
  'pesanan-pertama',
  'pembeli-setia',
];

/** 09.2 Lencana pencapaian berjatuhan mengisi rak. */
export const S09_2: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  return (
    <Panggung shot={shot} latar="sawah" horizon={80} kamera={{ dari: { zoom: 1.0 }, ke: { zoom: 1.06, y: -20 } }} aksen={['daun', 'koin', 'benih', 'sawi']} atas={<JudulKata kata={kataJudul(shot, 'Setiap pencapaian dapat lencana', ['lencana'])} top={60} ukuran={84} />}>
      {() => (
        <>
          {[0, 1].map((r) => (
            <div key={r} style={{ position: 'absolute', left: 300, top: 560 + r * 250, width: 1320, height: 34, borderRadius: 10, background: W.kayu, boxShadow: `0 10px 0 ${W.kayuTerang} inset, 0 18px 24px rgba(46,53,71,0.2)` }} />
          ))}
          {PENCAPAIAN.map((n, i) => {
            const baris = i < 5 ? 0 : 1;
            const kolom = i % 5;
            const mulai = 4 + i * ((d * 0.7) / PENCAPAIAN.length);
            const sp = pegas(frame, mulai, 'pantul');
            const x = 350 + kolom * 255;
            const yAkhir = 560 + baris * 250 - 180;
            const y = antara(sp, -260, yAkhir);
            return (
              <div key={n} style={{ position: 'absolute', left: x, top: y, transform: `rotate(${(1 - Math.min(1, sp)) * (acak(i) * 80 - 40)}deg)` }}>
                <Img src={staticFile(`lencana/${n}.svg`)} style={{ width: 170, height: 170 }} />
              </div>
            );
          })}
        </>
      )}
    </Panggung>
  );
};

/** 10.1 Kamera mundur dari kebun; bagian logo asli mulai merakit diri. */
export const S10_1: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const urutan = ['tanah', 'batang', 'daunKiri', 'daunKanan', 'kilapKiri', 'kilapKanan'] as const;
  const geser = Object.fromEntries(
    urutan.map((b, i) => {
      const s = pegas(frame, i * 2, 'cepat');
      const a = (i / urutan.length) * Math.PI * 2;
      return [b, { x: Math.cos(a) * 140 * (1 - s), y: Math.sin(a) * 140 * (1 - s), putar: (1 - s) * 120, skala: 0.5 + s * 0.5, o: Math.min(1, s * 2) }];
    }),
  );
  return (
    <Panggung shot={shot} latar="sawah" horizon={180} kamera={{ dari: { zoom: 1.35, y: 80 }, ke: { zoom: 1.0, y: 0 } }} aksen={['daun', 'benih', 'tetes', 'koin', 'sawi', 'matahari', 'cabai', 'tomat']}>
      {() => (
        <div style={{ position: 'absolute', left: 960 - 200, top: 260 }}>
          <LogoAsli ukuran={400} geser={geser} idPrefix="logo-101" />
        </div>
      )}
    </Panggung>
  );
};

/** 10.2 Logo asli, tema lomba per kata, daerah, dan nama peserta. */
export const S10_2: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const kataTema = kataJudul(shot, IDENTITAS.tema, ['Generasi', 'Emas', '2045'], 4);
  const akhirTema = Math.max(...kataTema.map((k) => k.f));
  const sIdentitas = pegas(frame, Math.min(shot.durasiFrame - 50, akhirTema + 12), 'lembut');
  return (
    <Panggung shot={shot} latar="sawah" horizon={220} kamera={{ dari: { zoom: 1.0 }, ke: { zoom: 0.96, y: 10 } }} aksen={['daun', 'benih', 'tetes', 'koin', 'sawi', 'matahari']}>
      {() => (
        <>
          <div style={{ position: 'absolute', left: 960 - 330, top: 70, display: 'flex', alignItems: 'center', gap: 20 }}>
            <LogoAsli ukuran={170} idPrefix="logo-102" />
            <div style={{ fontFamily: HURUF, fontWeight: 800, fontSize: 104, color: W.daun, letterSpacing: '-0.02em' }}>
              Tani <span style={{ color: W.limauTekan }}>Muda</span>
            </div>
          </div>
          <JudulKata kata={kataTema} top={300} ukuran={72} lebar={1500} />
          <div style={{ position: 'absolute', top: 640, width: 1920, textAlign: 'center', fontFamily: HURUF, opacity: sIdentitas, transform: `translateY(${(1 - sIdentitas) * 30}px)` }}>
            <div style={{ fontSize: 64, fontWeight: 800, color: W.teks }}>Kabupaten {IDENTITAS.kabupaten}, Jawa Tengah</div>
            <div style={{ fontSize: 52, fontWeight: 700, color: W.daun, marginTop: 8 }}>{IDENTITAS.nama}</div>
          </div>
        </>
      )}
    </Panggung>
  );
};
