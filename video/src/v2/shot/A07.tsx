import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BingkaiHp, detikPenanda } from '../BingkaiHp';
import { EASE, antara, ayun, maju, pegas } from '../gerak';
import { Truk } from '../ilustrasi/Benda2';
import { Brankas, CentangBesar, RumahPembeli } from '../ilustrasi/Benda3';
import { IkonTani } from '../IkonTani';
import { frameKata, type Shot } from '../linimasa';
import { JudulKata, Panggung, kataJudul } from '../Panggung';
import { HURUF, W } from '../tema';

const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Tata letak layar terbagi: HP pembeli kiri, HP petani kanan, brankas di tengah. */
const KIRI = { x: 110, y: 150 };
const KANAN = { x: 1440, y: 150 };
const SKALA = 0.86;
const TENGAH = { x: 960, y: 520 };

const Label: React.FC<{ teks: string; x: number }> = ({ teks, x }) => (
  <div style={{ position: 'absolute', left: x - 200, top: 60, width: 400, textAlign: 'center', fontFamily: HURUF, fontWeight: 800, fontSize: 64, color: W.teks, textShadow: '0 3px 0 rgba(255,255,255,0.7)' }}>
    {teks}
  </div>
);

/** Koin yang terbang di lintasan melengkung. */
const KoinTerbang: React.FC<{ t: number; dari: { x: number; y: number }; ke: { x: number; y: number }; tinggi?: number; ukuran?: number }> = ({ t, dari, ke, tinggi = 260, ukuran = 120 }) => {
  if (t <= 0 || t >= 1) return null;
  const x = antara(t, dari.x, ke.x);
  const y = antara(t, dari.y, ke.y) - Math.sin(t * Math.PI) * tinggi;
  return (
    <div style={{ position: 'absolute', left: x - ukuran / 2, top: y - ukuran / 2, transform: `rotate(${t * 540}deg)` }}>
      <IkonTani nama="koin" ukuran={ukuran} />
    </div>
  );
};

type PropsShot = { shot: Shot };

/** 07.1 Pembeli memesan sebelum panen dan membayar uang muka: koin terbang ke brankas. */
export const S07_1: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const fUang = frameKata(shot, /uang/i, d * 0.75);
  return (
    <Panggung shot={shot} latar="kota" kamera={{ dari: { zoom: 1.0, x: -30 }, ke: { zoom: 1.05, x: 30 } }} aksen={['koin', 'sawi', 'tomat', 'daun']} atas={<><Label teks="Pembeli" x={KIRI.x + 168} /><Label teks="Petani" x={KANAN.x + 168} /></>}>
      {() => (
        <>
          <BingkaiHp rekaman="pembeli" dari={detikPenanda('pembeli', 'pesan', -0.5)} sampai={detikPenanda('pembeli', 'uang-muka-masuk', 1.2)} durasi={d} x={KIRI.x} y={KIRI.y} skala={SKALA} miring={14} fokus={[{ f: 0, x: 0.5, y: 0.45, zoom: 1.1 }, { f: fUang, x: 0.5, y: 0.4, zoom: 1.25 }]} />
          <BingkaiHp rekaman="petani" dari={detikPenanda('petani', 'pesanan-sekitar', 3.05)} sampai={detikPenanda('petani', 'pesanan-sekitar', 4.3)} durasi={d} x={KANAN.x} y={KANAN.y} skala={SKALA} miring={-14} />
          <div style={{ position: 'absolute', left: TENGAH.x - 170, top: TENGAH.y - 150, transform: `scale(${pegas(frame, 6, 'berat')})` }}>
            <Brankas lebar={340} kunci={0} />
          </div>
          {[0, 1, 2].map((i) => (
            <KoinTerbang key={i} t={maju(frame, fUang - 6 + i * 5, 26, EASE.halus)} dari={{ x: 420, y: 480 }} ke={{ x: TENGAH.x, y: TENGAH.y }} />
          ))}
        </>
      )}
    </Panggung>
  );
};

/** 07.2 Uangnya ditahan dulu dengan aman: gembok tergambar pada brankas. */
export const S07_2: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const kunci = maju(frame, 2, d * 0.6, EASE.keluar);
  return (
    <Panggung shot={shot} latar="kota" kamera={{ dari: { zoom: 0.98 }, ke: { zoom: 1.05 } }} aksen={['koin', 'daun', 'tetes']} atas={<JudulKata kata={kataJudul(shot, 'Ditahan dulu dengan aman', ['aman'])} top={70} ukuran={88} />}>
      {() => (
        <>
          <BingkaiHp rekaman="pembeli" dari={detikPenanda('pembeli', 'uang-muka-masuk', 0.3)} sampai={detikPenanda('pembeli', 'uang-muka-masuk', 2.5)} durasi={d} x={KIRI.x} y={KIRI.y} skala={SKALA} miring={14} fokus={[{ f: 0, x: 0.5, y: 0.35, zoom: 1.25 }]} />
          <BingkaiHp rekaman="petani" dari={detikPenanda('petani', 'detail', 0.5)} sampai={detikPenanda('petani', 'detail', 2.5)} durasi={d} x={KANAN.x} y={KANAN.y} skala={SKALA} miring={-14} />
          <div style={{ position: 'absolute', left: TENGAH.x - 200, top: TENGAH.y - 170 + ayun(frame, 0, 6, 60) }}>
            <Brankas lebar={400} kunci={kunci} />
          </div>
        </>
      )}
    </Panggung>
  );
};

/** 07.3 Petani mengambil pesanan, merawat, lalu mengirim: truk dari kebun ke rumah pembeli. */
export const S07_3: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const fKirim = frameKata(shot, /mengirim/i, d * 0.65);
  const jalan = maju(frame, fKirim - 10, d - fKirim + 6, EASE.halus);
  const xTruk = interpolate(jalan, [0, 1], [1080, 640], klem);
  return (
    <Panggung shot={shot} latar="kota" kamera={{ dari: { zoom: 1.02, x: 30 }, ke: { zoom: 1.06, x: -30 } }} aksen={['sawi', 'cangkul', 'tetes', 'daun']} atas={<><Label teks="Pembeli" x={KIRI.x + 168} /><Label teks="Petani" x={KANAN.x + 168} /></>}>
      {() => (
        <>
          <BingkaiHp rekaman="pembeli" dari={detikPenanda('pembeli', 'uang-muka-masuk', 1)} sampai={detikPenanda('pembeli', 'uang-muka-masuk', 3)} durasi={d} x={KIRI.x} y={KIRI.y} skala={SKALA} miring={14} />
          <BingkaiHp rekaman="petani" dari={detikPenanda('petani', 'kesepakatan', 1.0)} sampai={detikPenanda('petani', 'disetujui', 2)} durasi={d} x={KANAN.x} y={KANAN.y} skala={SKALA} miring={-14} fokus={[{ f: 0, x: 0.5, y: 0.5, zoom: 1.1 }, { f: d * 0.6, x: 0.5, y: 0.6, zoom: 1.25 }]} />
          <div style={{ position: 'absolute', left: TENGAH.x - 140, top: 250 }}>
            <Brankas lebar={280} kunci={1} />
          </div>
          <div style={{ position: 'absolute', left: 520, top: 600 }}>
            <RumahPembeli lebar={250} />
          </div>
          <div style={{ position: 'absolute', left: xTruk, top: 740, transform: 'scaleX(-1)' }}>
            <Truk lebar={330} roda={-frame * 10 * (jalan > 0 && jalan < 1 ? 1 : 0)} />
          </div>
        </>
      )}
    </Panggung>
  );
};

/** 07.4 Pembeli mengonfirmasi kiriman: centang, brankas terbuka, koin mengalir ke petani. */
export const S07_4: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const fKonfirmasi = frameKata(shot, /mengonfirmasi/i, d * 0.3);
  const fCair = frameKata(shot, /cair/i, d * 0.65);
  const centang = maju(frame, fKonfirmasi - 6, 20, EASE.keluar);
  const buka = maju(frame, fCair - 12, 14, EASE.keluar);
  return (
    <Panggung shot={shot} latar="kota" kamera={{ dari: { zoom: 1.05 }, ke: { zoom: 1.0 } }} aksen={['koin', 'keranjang', 'sawi', 'daun']} atas={<><Label teks="Pembeli" x={KIRI.x + 168} /><Label teks="Petani" x={KANAN.x + 168} /></>}>
      {() => (
        <>
          <BingkaiHp rekaman="konfirmasi" dari={detikPenanda('konfirmasi', 'periksa', 0.3)} sampai={detikPenanda('konfirmasi', 'dana-cair', 0.5)} durasi={d} x={KIRI.x} y={KIRI.y} skala={SKALA} miring={14} fokus={[{ f: 0, x: 0.5, y: 0.45, zoom: 1.1 }, { f: fCair, x: 0.5, y: 0.35, zoom: 1.25 }]} />
          <BingkaiHp rekaman="petani" dari={detikPenanda('petani', 'disetujui', 0.5)} sampai={detikPenanda('petani', 'disetujui', 2.6)} durasi={d} x={KANAN.x} y={KANAN.y} skala={SKALA} miring={-14} />
          <div style={{ position: 'absolute', left: TENGAH.x - 180, top: TENGAH.y - 120 }}>
            <Brankas lebar={360} kunci={1} buka={buka} />
          </div>
          <div style={{ position: 'absolute', left: 520, top: 220, transform: `scale(${pegas(frame, fKonfirmasi - 6, 'pantul')})` }}>
            <CentangBesar ukuran={200} p={centang} />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <KoinTerbang key={i} t={maju(frame, fCair - 4 + i * 4, 24, EASE.halus)} dari={{ x: TENGAH.x, y: TENGAH.y }} ke={{ x: 1560, y: 520 }} tinggi={220} ukuran={110} />
          ))}
        </>
      )}
    </Panggung>
  );
};

/** 07.5 Judul besar penuh layar: Tanam dengan pembeli yang pasti. */
export const S07_5: React.FC<PropsShot> = ({ shot }) => (
  <Panggung shot={shot} latar="sawah" horizon={120} kamera={{ dari: { zoom: 1.12, y: -30 }, ke: { zoom: 1.0, y: 0 } }} aksen={['koin', 'sawi', 'tomat', 'cabai', 'keranjang', 'benih', 'daun', 'matahari']}>
    {() => <JudulKata kata={kataJudul(shot, 'Tanam dengan pembeli yang pasti', ['pasti'], 4)} top={300} ukuran={150} lebar={1600} />}
  </Panggung>
);
