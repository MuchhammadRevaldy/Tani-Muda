import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import titikJateng from '../../data/titik-jateng.json';
import { BingkaiHp, KeluarDariLayar, detikPenanda } from '../BingkaiHp';
import { Jalur } from '../Bentuk';
import { EASE, ayun, maju, pegas } from '../gerak';
import { Truk } from '../ilustrasi/Benda2';
import { Peti, TumpukChat } from '../ilustrasi/Benda3';
import { Sosok } from '../ilustrasi/Sosok';
import { IkonTani } from '../IkonTani';
import { frameKata, type Shot } from '../linimasa';
import { JudulKata, Panggung, kataJudul } from '../Panggung';
import { HURUF, W } from '../tema';

const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const HP = { x: 230, y: 130 };
const ASAL = { x: 430, y: 520 };

type PropsShot = { shot: Shot };

const JudulKanan: React.FC<{ shot: Shot; frasa: string; sorot?: string[] }> = ({ shot, frasa, sorot = [] }) => (
  <JudulKata kata={kataJudul(shot, frasa, sorot)} top={90} left={760} lebar={1100} ukuran={80} />
);

/** Pin bertunas berisi warna; kotak 160×220. */
const PinTunas: React.FC<{ mekar: number; ukuran?: number }> = ({ mekar, ukuran = 160 }) => (
  <svg viewBox="0 0 160 220" width={ukuran} height={(ukuran * 220) / 160} style={{ overflow: 'visible' }}>
    <ellipse cx="80" cy="212" rx="40" ry="8" fill="#2E3547" opacity="0.2" />
    <path d="M80 210 C50 170 10 130 10 80 C10 36 42 8 80 8 C118 8 150 36 150 80 C150 130 110 170 80 210 Z" fill={W.oranye} />
    <path d="M80 210 C110 170 150 130 150 80 C150 60 144 44 134 32 C140 90 110 150 80 210 Z" fill={W.tanah} />
    <circle cx="80" cy="80" r="44" fill={W.putih} />
    <g transform={`translate(80 104) scale(${mekar})`}>
      <path d="M0 0 L0 -40" stroke={W.limauTekan} strokeWidth="7" strokeLinecap="round" />
      <path d="M0 -26 C-26 -26 -36 -44 -30 -60 C-12 -58 0 -46 0 -26 Z" fill={W.limau} />
      <path d="M0 -32 C26 -32 36 -50 30 -66 C12 -64 0 -52 0 -32 Z" fill={W.limauTekan} />
    </g>
  </svg>
);

/** 08.1 Ada juga bantuan sehari-hari: lima fitur muncul bergantian. */
export const S08_1: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const fitur: { isi: React.ReactNode; label: string }[] = [
    { isi: <IkonTani nama="daun" ukuran={170} />, label: 'Foto daun' },
    { isi: <TumpukChat muncul={1} frame={frame} lebar={190} />, label: 'Tanya' },
    { isi: <IkonTani nama="matahari" ukuran={170} />, label: 'Cuaca' },
    { isi: <PinTunas mekar={1} ukuran={120} />, label: 'Peta' },
    { isi: <Peti lebar={180} />, label: 'Stok' },
  ];
  return (
    <Panggung shot={shot} latar="sawah" horizon={60} kamera={{ dari: { zoom: 1.05, x: -40 }, ke: { zoom: 1.0, x: 40 } }} aksen={['daun', 'tetes', 'koin', 'benih']} atas={<JudulKata kata={kataJudul(shot, 'Bantuan sehari-hari', ['sehari-hari'])} top={110} ukuran={110} />}>
      {() =>
        fitur.map((f, i) => {
          const s = pegas(frame, 4 + i * 5, 'pantul');
          return (
            <div key={i} style={{ position: 'absolute', left: 230 + i * 300, top: 400 + ayun(frame, i * 17, 12, 60), width: 260, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${s})` }}>
              <div style={{ height: 210, display: 'flex', alignItems: 'center' }}>{f.isi}</div>
              <div style={{ fontFamily: HURUF, fontWeight: 800, fontSize: 64, color: W.teks, marginTop: 20 }}>{f.label}</div>
            </div>
          );
        })
      }
    </Panggung>
  );
};

/**
 * 08.2 Deteksi penyakit: foto daun asli dipindai, bercak dilingkari, label "dugaan",
 * panah ke penyuluh. Hasil digambar di video (lihat laporan: di mode backend fitur ini gagal).
 */
export const S08_2: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const pindai = maju(frame, 6, d * 0.35, EASE.halus);
  const fDugaan = frameKata(shot, /dugaan/i, d * 0.45);
  const fPenyuluh = frameKata(shot, /penyuluh/i, d * 0.85);
  const lingkar = [
    [190, 150],
    [420, 260],
    [300, 360],
  ];
  const panah = maju(frame, fPenyuluh - 18, 18, EASE.keluar);
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.02 }, ke: { zoom: 1.07, x: 30 } }} aksen={['daun', 'tetes', 'sawi']} atas={<JudulKanan shot={shot} frasa="Foto daun, lihat dugaannya" sorot={['dugaannya']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="deteksi" dari={detikPenanda('deteksi', 'foto', -1)} sampai={detikPenanda('deteksi', 'foto-siap', 2.5)} durasi={d} x={HP.x} y={HP.y} miring={-10} fokus={[{ f: 0, x: 0.5, y: 0.5, zoom: 1.1 }]} />
          <KeluarDariLayar mulai={2} dari={ASAL} ke={{ x: 1030, y: 560 }}>
            <div style={{ position: 'relative', width: 600, height: 420, borderRadius: 30, overflow: 'hidden', boxShadow: '0 24px 40px rgba(46,53,71,0.25)', border: `10px solid ${W.putih}` }}>
              <Img src={staticFile('foto/komoditas/bayam.webp')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: `${pindai * 100}%`, height: 8, background: W.limauTerang, boxShadow: `0 0 0 3px ${W.putih}`, opacity: pindai > 0 && pindai < 1 ? 1 : 0 }} />
              <svg viewBox="0 0 580 400" width={580} height={400} style={{ position: 'absolute', inset: 0 }}>
                {lingkar.map(([x, y], i) => (
                  <Jalur key={i} p={maju(frame, d * 0.3 + i * 8, 14)} d={`M${x + 46} ${y} A46 46 0 1 1 ${x + 45.9} ${y - 0.1}`} garis={W.matahari} tebal={9} />
                ))}
              </svg>
            </div>
          </KeluarDariLayar>
          <div style={{ position: 'absolute', left: 760, top: 830, fontFamily: HURUF, fontWeight: 800, fontSize: 64, color: W.teks, opacity: maju(frame, fDugaan - 6, 10), transform: `translateY(${(1 - pegas(frame, fDugaan - 6, 'pantul')) * 30}px)` }}>
            <span style={{ color: W.oranye }}>dugaan:</span> bercak daun
          </div>
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <Jalur p={panah} d="M1340 560 C 1440 520, 1500 520, 1560 560" garis={W.daun} tebal={14} />
            <Jalur p={Math.max(0, panah * 2 - 1)} d="M1530 530 L1566 562 L1522 580" garis={W.daun} tebal={14} />
          </svg>
          <div style={{ position: 'absolute', left: 1580, top: 330, opacity: panah, transform: `translateX(${(1 - panah) * 60}px)` }}>
            <Sosok gaya="penyuluh" baju={W.daun} tinggi={480} lambai={ayun(frame, 0, 8, 40)} />
          </div>
        </>
      )}
    </Panggung>
  );
};

/** 08.3 Tanya asisten dan ngobrol dengan pembeli: gelembung chat bertumpuk. */
export const S08_3: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  return (
    <Panggung shot={shot} latar="sawah" kamera={{ dari: { zoom: 1.0, x: 20 }, ke: { zoom: 1.06, x: -20 } }} aksen={['daun', 'benih', 'sawi', 'tomat']} atas={<JudulKanan shot={shot} frasa="Tanya asisten, ngobrol dengan pembeli" sorot={['asisten', 'pembeli']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="chatbot" dari={detikPenanda('chatbot', 'tanya', -0.5)} sampai={detikPenanda('chatbot', 'jawaban', 0.8)} durasi={d} x={HP.x} y={HP.y} miring={-10} fokus={[{ f: 0, x: 0.5, y: 0.35, zoom: 1.15 }]} />
          <KeluarDariLayar mulai={4} dari={ASAL} ke={{ x: 1180, y: 600 }}>
            <TumpukChat muncul={maju(frame, 6, d * 0.7)} frame={frame} lebar={720} />
          </KeluarDariLayar>
        </>
      )}
    </Panggung>
  );
};

/** 08.4 Prakiraan cuaca: langit di latar berganti dari cerah ke hujan. */
export const S08_4: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const hujan = maju(frame, d * 0.3, d * 0.45, EASE.halus);
  return (
    <Panggung shot={shot} latar="sawah" hujan={hujan} kamera={{ dari: { zoom: 1.0 }, ke: { zoom: 1.05, y: -20 } }} aksen={['tetes', 'tetes', 'matahari', 'daun']} atas={<JudulKanan shot={shot} frasa="Perkiraan cuaca di kebunmu" sorot={['cuaca']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="cuaca" dari={detikPenanda('cuaca', 'cuaca', 0.6)} sampai={detikPenanda('cuaca', 'cuaca', 3.4)} durasi={d} x={HP.x} y={HP.y} miring={-10} fokus={[{ f: 0, x: 0.5, y: 0.45, zoom: 1.2 }, { f: d, x: 0.5, y: 0.5, zoom: 1.3 }]} />
          <div style={{ position: 'absolute', left: 1080, top: 420, transform: `scale(${interpolate(hujan, [0, 1], [1, 0.6], klem)})`, opacity: 1 - hujan }}>
            <IkonTani nama="matahari" ukuran={340} />
          </div>
          <div style={{ position: 'absolute', left: 1200, top: 380, opacity: hujan, transform: `translateY(${(1 - hujan) * -40}px)` }}>
            <svg viewBox="0 0 400 300" width={460} height={345}>
              <path d="M70 200 C30 200 20 150 60 130 C60 80 120 60 150 90 C170 40 260 40 280 100 C330 90 370 130 350 170 C360 200 340 210 320 210 Z" fill={W.awan} stroke="#C9D3DA" strokeWidth="8" />
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 230 + ((frame * 6 + i * 13) % 60);
                return <line key={i} x1={110 + i * 50} y1={y} x2={100 + i * 50} y2={y + 26} stroke={W.air} strokeWidth="10" strokeLinecap="round" />;
              })}
            </svg>
          </div>
        </>
      )}
    </Panggung>
  );
};

/** Peta titik kecamatan Jawa Tengah (data proyek, ODbL) dengan pin bertunas di Klaten. */
const PetaJateng: React.FC<{ tampak: number; mekar: number; lebar?: number }> = ({ tampak, mekar, lebar = 900 }) => {
  const titik = titikJateng.titik as [number, number, number][];
  const bujur = titik.map((t) => t[0]);
  const lintang = titik.map((t) => t[1]);
  const [bMin, bMax, lMin, lMax] = [Math.min(...bujur), Math.max(...bujur), Math.min(...lintang), Math.max(...lintang)];
  const tinggi = (lebar * (lMax - lMin)) / (bMax - bMin);
  const ke = (b: number, l: number) => [((b - bMin) / (bMax - bMin)) * lebar, ((lMax - l) / (lMax - lMin)) * tinggi];
  const klaten = titik.filter((t) => t[2] === 1);
  const [kx, ky] = ke(klaten.reduce((a, t) => a + t[0], 0) / klaten.length, klaten.reduce((a, t) => a + t[1], 0) / klaten.length);
  return (
    <div style={{ position: 'relative', width: lebar, height: tinggi }}>
      <svg viewBox={`-20 -20 ${lebar + 40} ${tinggi + 40}`} width={lebar} height={tinggi} style={{ overflow: 'visible' }}>
        {titik.map(([b, l, k], i) => {
          const [x, y] = ke(b, l);
          const muncul = (b - bMin) / (bMax - bMin) < tampak;
          return <circle key={i} cx={x} cy={y} r={k ? 7 : 5} fill={k ? W.oranye : W.daun} opacity={muncul ? (k ? 1 : 0.6) : 0} />;
        })}
        <circle cx={kx} cy={ky} r={60 * mekar} fill="none" stroke={W.oranye} strokeWidth="6" strokeDasharray="10 10" opacity={mekar} />
      </svg>
      <div style={{ position: 'absolute', left: kx - 60, top: ky - 170, transform: `scale(${mekar})`, transformOrigin: '50% 100%' }}>
        <PinTunas mekar={mekar} ukuran={120} />
      </div>
    </div>
  );
};

/** 08.5 Temukan petani di sekitar: peta Jawa Tengah tergambar, pin bertunas mekar. */
export const S08_5: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const tampak = maju(frame, 4, d * 0.5, EASE.halus);
  const mekar = pegas(frame, d * 0.5, 'pantul');
  return (
    <Panggung shot={shot} latar="langit" horizon={140} kamera={{ dari: { zoom: 1.08 }, ke: { zoom: 1.0 } }} aksen={['daun', 'sawi', 'benih', 'tetes']} atas={<JudulKanan shot={shot} frasa="Petani lain di sekitarmu" sorot={['sekitarmu']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="peta" dari={detikPenanda('peta', 'peta', 0.5)} sampai={detikPenanda('peta', 'daftar', 1.5)} durasi={d} x={HP.x} y={HP.y} miring={-10} fokus={[{ f: 0, x: 0.5, y: 0.4, zoom: 1.15 }]} />
          <div style={{ position: 'absolute', left: 820, top: 330 }}>
            <PetaJateng tampak={tampak} mekar={mekar} lebar={960} />
          </div>
          <div style={{ position: 'absolute', left: 820, top: 780, fontFamily: HURUF, fontWeight: 700, fontSize: 40, color: W.teks, opacity: mekar }}>
            lokasi dibulatkan ±1 km
          </div>
          <div style={{ position: 'absolute', right: 40, top: 840, fontFamily: HURUF, fontSize: 22, color: W.teksPendukung }}>Titik kecamatan © kontributor OpenStreetMap</div>
        </>
      )}
    </Panggung>
  );
};

/** 08.6 Tawarkan stok siap jual: peti panen bertumpuk lalu dimuat. */
export const S08_6: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const muat = maju(frame, d * 0.6, d * 0.4, EASE.masuk);
  return (
    <Panggung shot={shot} latar="kota" kamera={{ dari: { zoom: 1.0, x: -20 }, ke: { zoom: 1.05, x: 30 } }} aksen={['sawi', 'tomat', 'keranjang', 'koin']} atas={<JudulKanan shot={shot} frasa="Tawarkan stok siap jual" sorot={['stok']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="stok" dari={detikPenanda('stok', 'stok', 0.4)} sampai={detikPenanda('stok', 'stok', 4.4)} durasi={d} x={HP.x} y={HP.y} miring={-10} fokus={[{ f: 0, x: 0.5, y: 0.45, zoom: 1.15 }]} />
          {[0, 1, 2, 3, 4].map((i) => {
            const jatuh = pegas(frame, 2 + i * 5, 'pantul');
            const x = 900 + (i % 3) * 170 + (i > 2 ? 85 : 0) + muat * 420;
            const y = (i > 2 ? 480 : 620) - (1 - jatuh) * 500;
            return (
              <div key={i} style={{ position: 'absolute', left: x, top: y, opacity: 1 - muat * 0.9 }}>
                <Peti lebar={180} isi={[W.limau, W.tomat, W.matahari][i % 3]} />
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 1280 + muat * 200, top: 600 }}>
            <Truk lebar={520} roda={muat * 200} />
          </div>
        </>
      )}
    </Panggung>
  );
};
