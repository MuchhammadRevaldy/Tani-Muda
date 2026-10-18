import React from 'react';
import { useCurrentFrame } from 'remotion';
import { EASE, antara, ayun, maju, pegas } from '../gerak';
import { TanamanTumbuh } from '../ilustrasi/Benda';
import { BukuTunas, Gembor, Kalkulator } from '../ilustrasi/Benda3';
import { Sosok } from '../ilustrasi/Sosok';
import { IkonTani } from '../IkonTani';
import { frameKata, type Shot } from '../linimasa';
import { JudulKata, Panggung, kataJudul } from '../Panggung';
import { HURUF, W } from '../tema';

/** 04.1 Satu tanaman besar tumbuh dari benih sampai berbuah. */
export const S04_1: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const tumbuh = maju(frame, 4, shot.durasiFrame - 10, EASE.keluar);
  return (
    <Panggung
      shot={shot}
      latar="bedengan"
      kamera={{ dari: { zoom: 1.12, y: 30 }, ke: { zoom: 1.0, y: -20 } }}
      aksen={['tetes', 'matahari', 'daun', 'benih', 'tomat']}
      atas={<JudulKata kata={kataJudul(shot, 'Menemani dalam satu siklus', ['siklus'])} top={60} ukuran={86} />}
    >
      {() => (
        <div style={{ position: 'absolute', left: 960 - 230, top: 260 }}>
          <TanamanTumbuh tahap={tumbuh} lebar={460} />
        </div>
      )}
    </Panggung>
  );
};

/** Jalur tanah melingkar; pos berurutan searah jarum jam. */
const POS = [
  { nama: 'Belajar', x: 470, y: 520, kata: /belajar/i },
  { nama: 'Hitung', x: 1450, y: 520, kata: /hitung/i },
  { nama: 'Rawat', x: 1450, y: 880, kata: /rawat/i },
  { nama: 'Jual', x: 470, y: 880, kata: /jual/i },
];

/** 04.2 Kamera menyusuri jalur siklus; empat pos aktif bergantian; benih kembali ke awal. */
export const S04_2: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const waktuPos = POS.map((p, i) => frameKata(shot, p.kata, 4 + i * 30));
  const aktif = waktuPos.filter((f) => frame >= f - 4).length - 1;
  const jalur = maju(frame, 0, waktuPos[3] + 10, EASE.halus);
  // kamera mengarah ke pos aktif
  const sasaran = aktif >= 0 ? POS[aktif] : { x: 960, y: 620 };
  const sebelumnya = aktif > 0 ? POS[aktif - 1] : { x: 960, y: 620 };
  const tPindah = aktif >= 0 ? maju(frame, waktuPos[aktif] - 6, 14, EASE.halus) : 0;
  const fokusX = antara(tPindah, sebelumnya.x, sasaran.x);
  const fokusY = antara(tPindah, sebelumnya.y, sasaran.y);
  const benihJatuh = maju(frame, waktuPos[3] + 20, 20, EASE.masuk);
  const keranjang = (i: number) => pegas(frame, waktuPos[i] - 4, 'pantul');
  const loop = 'M470 640 C 760 420, 1160 420, 1450 640 C 1680 760, 1680 900, 1450 980 C 1160 1080, 760 1080, 470 980 C 240 900, 240 760, 470 640 Z';
  return (
    <Panggung
      shot={shot}
      latar="sawah"
      horizon={-40}
      kamera={{ dari: { zoom: 1.0 }, ke: { zoom: 1.0 } }}
      aksen={['benih', 'koin', 'tetes', 'keranjang', 'daun', 'sawi']}
    >
      {() => (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${(960 - fokusX) * 0.35}px, ${(620 - fokusY) * 0.25}px) scale(1.08)`,
            transformOrigin: `${fokusX}px ${fokusY}px`,
          }}
        >
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <clipPath id="klip-jalur-042">
                <rect x="0" y="0" width={240 + jalur * 1500} height="1080" />
              </clipPath>
            </defs>
            <path d={loop} fill="none" stroke={W.tanahBedengTerang} strokeWidth="96" strokeLinejoin="round" clipPath="url(#klip-jalur-042)" />
            <path d={loop} fill="none" stroke={W.matahariLembut} strokeWidth="8" strokeDasharray="26 30" clipPath="url(#klip-jalur-042)" />
          </svg>
          {POS.map((p, i) => {
            const nyala = aktif === i ? 1 : aktif > i ? 0.55 : 0.25;
            const s = keranjang(i);
            return (
              <div key={p.nama} style={{ position: 'absolute', left: p.x - 170, top: p.y - 360, width: 340, height: 340, opacity: 0.35 + nyala * 0.65, transform: `scale(${0.85 + (aktif === i ? 0.2 : 0) * s})` }}>
                {i === 0 && (
                  <div style={{ position: 'absolute', left: 0, top: 70 }}>
                    <BukuTunas lebar={340} tumbuh={Math.min(1, s)} />
                  </div>
                )}
                {i === 1 && (
                  <>
                    <div style={{ position: 'absolute', left: 90, top: 40 }}>
                      <Kalkulator lebar={170} />
                    </div>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{ position: 'absolute', left: 120 + (k - 1) * 90 * s, top: 60 - s * (90 + k * 20), transform: `scale(${s})` }}>
                        <IkonTani nama="koin" ukuran={80} />
                      </div>
                    ))}
                  </>
                )}
                {i === 2 && (
                  <div style={{ position: 'absolute', left: 10, top: 100, transform: `rotate(${aktif === 2 ? 14 : 0}deg)` }}>
                    <Gembor lebar={300} siram={aktif === 2 ? 1 : 0} frame={frame} />
                  </div>
                )}
                {i === 3 && (
                  <>
                    <div style={{ position: 'absolute', left: 20 + s * 60, top: 130 }}>
                      <IkonTani nama="keranjang" ukuran={150} />
                    </div>
                    <div style={{ position: 'absolute', left: 210, top: 60 }}>
                      <Sosok gaya="pembeli" baju={W.oranye} tinggi={240} lambai={aktif === 3 ? ayun(frame, 0, 10, 20) : 0} />
                    </div>
                  </>
                )}
                <div style={{ position: 'absolute', left: -80, top: 300, width: 500, textAlign: 'center', fontFamily: HURUF, fontWeight: 800, fontSize: 76, color: aktif === i ? W.oranye : W.teks }}>{p.nama}</div>
              </div>
            );
          })}
          {/* benih dari panen jatuh kembali ke awal jalur */}
          {benihJatuh > 0 && (
            <div style={{ position: 'absolute', left: antara(benihJatuh, 520, 450), top: antara(benihJatuh, 700, 540) - Math.sin(benihJatuh * Math.PI) * 160, transform: `rotate(${benihJatuh * 360}deg)` }}>
              <IkonTani nama="benih" ukuran={90} />
            </div>
          )}
        </div>
      )}
    </Panggung>
  );
};
