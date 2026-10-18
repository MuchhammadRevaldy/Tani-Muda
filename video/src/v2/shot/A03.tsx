import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { EASE, ayun, maju, pegas } from '../gerak';
import { TandaTanya } from '../ilustrasi/Benda';
import { DaunBesar, KacaPembesar, Karung, PapanArah, PapanHarga, Truk, TumpukanPanen, Ulat } from '../ilustrasi/Benda2';
import { Sosok } from '../ilustrasi/Sosok';
import { frameKata, type Shot } from '../linimasa';
import { JudulKata, Panggung, kataJudul } from '../Panggung';
import { W } from '../tema';

const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 03.1 Petani muda di pinggir sawah; tanda tanya besar tergambar; kamera mendekat. */
export const S03_1: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const tanya = maju(frame, frameKata(shot, /ragu/i, 20) - 10, 26, EASE.keluar);
  return (
    <Panggung
      shot={shot}
      latar="sawah"
      horizon={30}
      kamera={{ dari: { zoom: 1.0, x: -20 }, ke: { zoom: 1.22, x: 120, y: -40 } }}
      aksen={['daun', 'benih', 'tetes', 'sawi', 'matahari']}
      atas={<JudulKata kata={kataJudul(shot, 'Kenapa anak muda ragu bertani?', ['ragu'])} top={70} ukuran={88} />}
    >
      {() => (
        <>
          <div style={{ position: 'absolute', left: 1020, top: 330 }}>
            <Sosok gaya="muda" baju={W.limau} tinggi={600} lambai={ayun(frame, 0, 6, 70)} />
          </div>
          <div style={{ position: 'absolute', left: 1280, top: 190, transform: `rotate(${ayun(frame, 10, 5, 50)}deg) scale(${0.8 + tanya * 0.2})` }}>
            <TandaTanya p={tanya} tinggi={330} />
          </div>
        </>
      )}
    </Panggung>
  );
};

/** 03.2 Pasar penuh hasil panen; papan harga jatuh; garis harga merah menukik. */
export const S03_2: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const fJatuh = frameKata(shot, /jatuh/i, 12);
  const turun = maju(frame, fJatuh - 4, shot.durasiFrame - fJatuh, EASE.keluar);
  const harga = Math.round(interpolate(turun, [0, 1], [12000, 3000]) / 500) * 500;
  const papanJatuh = pegas(frame, fJatuh, 'pantul');
  const garis = maju(frame, 2, 40, EASE.tajam);
  return (
    <Panggung
      shot={shot}
      latar="kota"
      kamera={{ dari: { zoom: 1.06, x: 40 }, ke: { zoom: 1.0, x: -40 } }}
      aksen={['tomat', 'cabai', 'sawi', 'koin', 'keranjang']}
      atas={<JudulKata kata={kataJudul(shot, 'Harga jatuh pas panen raya', ['jatuh'])} top={70} ukuran={90} />}
    >
      {() => (
        <>
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <clipPath id="klip-harga-032">
                <rect x="0" y="0" width={1920 * garis} height="1080" />
              </clipPath>
            </defs>
            <path d="M80 300 L420 340 L700 320 L960 470 L1200 520 L1480 700 L1860 900" fill="none" stroke={W.tomat} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#klip-harga-032)" opacity="0.9" />
            <path d="M1860 900 L1800 860 M1860 900 L1810 940" stroke={W.tomat} strokeWidth="30" strokeLinecap="round" opacity={garis > 0.98 ? 0.9 : 0} />
          </svg>
          <div style={{ position: 'absolute', left: 220, top: 500 }}>
            <TumpukanPanen lebar={760} muncul={maju(frame, 0, 18)} />
          </div>
          <div style={{ position: 'absolute', left: 1060, top: 420 }}>
            <TumpukanPanen lebar={620} isi={['sawi', 'tomat', 'cabai']} muncul={maju(frame, 6, 18)} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 1380,
              top: 190,
              transformOrigin: '50% 100%',
              transform: `rotate(${papanJatuh * 24}deg) translateY(${papanJatuh * 30}px)`,
            }}
          >
            <PapanHarga teks={`Rp${harga.toLocaleString('id-ID')}`} lebar={380} />
          </div>
        </>
      )}
    </Panggung>
  );
};

/** 03.3 Close-up daun sawi; ulat merayap; lubang dan bercak; kaca pembesar; tanda tanya. */
export const S03_3: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const lubang = maju(frame, 6, d * 0.55, EASE.halus);
  const bercak = maju(frame, d * 0.3, d * 0.5, EASE.halus);
  const kaca = pegas(frame, frameKata(shot, /tidak|tahu/i, d * 0.55) - 6, 'pantul');
  const tanya = maju(frame, frameKata(shot, /menangani/i, d * 0.7) - 8, 20, EASE.keluar);
  const xUlat = interpolate(frame, [0, d], [520, 1040], klem);
  return (
    <Panggung
      shot={shot}
      latar="bedengan"
      kamera={{ dari: { zoom: 1.15, y: 20 }, ke: { zoom: 1.02, y: 0 } }}
      aksen={['daun', 'tetes', 'sawi', 'benih']}
      atas={<JudulKata kata={kataJudul(shot, 'Hama datang, tak tahu caranya', ['Hama'])} top={60} ukuran={84} />}
    >
      {() => (
        <>
          <div style={{ position: 'absolute', left: 380, top: 210, transform: `rotate(${ayun(frame, 0, 2, 120)}deg)` }}>
            <DaunBesar lebar={980} lubang={lubang} bercak={bercak} />
          </div>
          <div style={{ position: 'absolute', left: xUlat, top: 470 - (xUlat - 520) * 0.35, transform: 'rotate(-20deg)' }}>
            <Ulat lebar={240} gerak={frame} />
          </div>
          <div style={{ position: 'absolute', left: 1240, top: 420, transform: `scale(${kaca}) rotate(${ayun(frame, 0, 6, 60)}deg)` }}>
            <KacaPembesar lebar={320} p={Math.min(1, kaca)} />
          </div>
          <div style={{ position: 'absolute', left: 140, top: 430 }}>
            <Sosok gaya="muda" baju={W.limau} tinggi={480} />
          </div>
          <div style={{ position: 'absolute', left: 250, top: 250, transform: `rotate(${ayun(frame, 0, 6, 40)}deg)` }}>
            <TandaTanya p={tanya} tinggi={190} />
          </div>
        </>
      )}
    </Panggung>
  );
};

/** 03.4 Karung berpindah lewat empat perantara di jalan berkelok; koinnya berkurang. */
export const S03_4: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const pos = [
    { x: 300, y: 600 },
    { x: 700, y: 520 },
    { x: 1100, y: 600 },
    { x: 1500, y: 520 },
  ];
  const t = maju(frame, 6, d - 16, EASE.halus) * 3; // 0..3 antar orang
  const ke = Math.min(3, Math.floor(t));
  const sub = t - ke;
  const a = pos[ke];
  const b = pos[Math.min(3, ke + 1)];
  const x = a.x + (b.x - a.x) * sub;
  const y = a.y + (b.y - a.y) * sub - Math.sin(sub * Math.PI) * 120;
  const koin = Math.max(1, 6 - Math.round(t * 1.7));
  return (
    <Panggung
      shot={shot}
      latar="jalan"
      kamera={{ dari: { x: -120, zoom: 1.04 }, ke: { x: 120, zoom: 1.04 } }}
      aksen={['koin', 'sawi', 'daun', 'tomat', 'cabai']}
      atas={<JudulKata kata={kataJudul(shot, 'Lewat banyak tangan', ['banyak'])} top={60} ukuran={90} />}
    >
      {() => (
        <>
          {pos.map((p, i) => (
            <div key={i} style={{ position: 'absolute', left: p.x - 110, top: p.y - 160 + ayun(frame, i * 30, 4, 60) }}>
              <Sosok gaya={i === 0 ? 'petani' : 'perantara'} baju={i === 0 ? W.limau : ['#7C8FA8', '#A88C7C', '#8E7CA8'][i - 1]} tinggi={460} lambai={i === ke ? 30 : 0} />
            </div>
          ))}
          <div style={{ position: 'absolute', left: x - 130, top: y - 330, transform: `rotate(${Math.sin(sub * Math.PI) * 12}deg)` }}>
            <Karung lebar={260} koin={koin} />
          </div>
        </>
      )}
    </Panggung>
  );
};

/** 03.5 Truk penuh panen berhenti di persimpangan tanpa tujuan; matahari terbenam. */
export const S03_5: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const jalan = maju(frame, 0, d * 0.55, EASE.keluar);
  const x = interpolate(jalan, [0, 1], [-500, 520]);
  return (
    <Panggung
      shot={shot}
      latar="sawah"
      senja={1}
      horizon={20}
      kamera={{ dari: { zoom: 1.0 }, ke: { zoom: 1.12, x: 60 } }}
      aksen={['tomat', 'cabai', 'sawi', 'keranjang']}
      atas={<JudulKata kata={kataJudul(shot, 'Belum ada yang beli', ['beli'])} top={70} ukuran={96} />}
    >
      {() => (
        <>
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <path d="M-100 860 L2020 860" stroke={W.tanahLembut} strokeWidth="110" />
            <path d="M1380 1100 L1380 660" stroke={W.tanahLembut} strokeWidth="110" />
            <path d="M-100 860 L2020 860" stroke={W.matahariLembut} strokeWidth="6" strokeDasharray="34 30" />
          </svg>
          <div style={{ position: 'absolute', left: 1430, top: 330 }}>
            <PapanArah tinggi={520} goyang={ayun(frame, 0, 3, 50)} />
          </div>
          <div style={{ position: 'absolute', left: x, top: 560, transform: `translateY(${jalan < 1 ? Math.sin(frame) * 2 : 0}px)` }}>
            <Truk lebar={720} roda={frame * (1 - jalan) * 12} />
          </div>
        </>
      )}
    </Panggung>
  );
};
