import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BingkaiHp, KeluarDariLayar, detikPenanda, type Fokus } from '../BingkaiHp';
import { EASE, maju, pegas } from '../gerak';
import { TumpukKoin } from '../ilustrasi/Benda';
import { BolaLampu, CentangBesar, GarisWaktuTanaman, GrafikImpas, Kalkulator, KertasPh, SkalaJarum } from '../ilustrasi/Benda3';
import { IkonTani } from '../IkonTani';
import { frameKata, type Shot } from '../linimasa';
import { JudulKata, Panggung, kataJudul } from '../Panggung';

const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Posisi bersama: HP di kiri, ilustrasi di kanan. */
const HP = { x: 300, y: 130 };
const ASAL = { x: 500, y: 520 };
const KANAN = { x: 1340, y: 600 };

const JudulKanan: React.FC<{ shot: Shot; frasa: string; sorot?: string[] }> = ({ shot, frasa, sorot = [] }) => (
  <JudulKata kata={kataJudul(shot, frasa, sorot)} top={110} left={860} lebar={980} ukuran={84} />
);

type PropsShot = { shot: Shot };

/** 05.1 Pilih tanaman yang cocok di daerahmu. */
export const S05_1: React.FC<PropsShot> = ({ shot }) => {
  const d = shot.durasiFrame;
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.0, x: 30 }, ke: { zoom: 1.06, x: -20 } }} aksen={['sawi', 'tomat', 'cabai', 'benih', 'daun']} atas={<JudulKanan shot={shot} frasa="Pilih tanaman yang cocok" sorot={['cocok']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="hitung" dari={detikPenanda('hitung', 'pilih-tanaman', 0.9)} sampai={detikPenanda('hitung', 'isi-luas', 0.2)} durasi={d} x={HP.x} y={HP.y} fokus={[{ f: 0, x: 0.5, y: 0.4, zoom: 1.05 }, { f: d, x: 0.5, y: 0.45, zoom: 1.25 }]} />
          {(['sawi', 'tomat', 'cabai'] as const).map((n, i) => (
            <KeluarDariLayar key={n} mulai={8 + i * 6} dari={ASAL} ke={{ x: 1100 + i * 250, y: 560 + (i % 2) * 90 }}>
              <IkonTani nama={n} ukuran={230} />
            </KeluarDariLayar>
          ))}
        </>
      )}
    </Panggung>
  );
};

/** 05.2 Luas lahan → modal (tumpukan koin) → titik impas (grafik). */
export const S05_2: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const fModal = frameKata(shot, /^modal/i, d * 0.45);
  const fImpas = frameKata(shot, /impasnya/i, d * 0.85);
  const fokus: Fokus[] = [
    { f: 0, x: 0.5, y: 0.55, zoom: 1.3 },
    { f: fModal - 8, x: 0.5, y: 0.8, zoom: 1.3 },
    { f: fImpas - 8, x: 0.5, y: 0.35, zoom: 1.3 },
    { f: d, x: 0.5, y: 0.4, zoom: 1.35 },
  ];
  const tukar = maju(frame, fImpas - 10, 10);
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.02, x: -20 }, ke: { zoom: 1.08, x: 30 } }} aksen={['koin', 'benih', 'sawi', 'tetes']} atas={<JudulKanan shot={shot} frasa="modal, untung, dan titik impas" sorot={['impas']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="hitung" dari={detikPenanda('hitung', 'isi-luas', 0.3)} sampai={detikPenanda('hitung', 'impas', 2.4)} durasi={d} x={HP.x} y={HP.y} fokus={fokus} />
          <div style={{ opacity: 1 - tukar }}>
            <KeluarDariLayar mulai={fModal - 6} dari={ASAL} ke={KANAN}>
              <TumpukKoin lebar={340} muncul={maju(frame, fModal - 6, 24)} />
            </KeluarDariLayar>
          </div>
          <div style={{ opacity: tukar }}>
            <KeluarDariLayar mulai={fImpas - 10} dari={ASAL} ke={KANAN}>
              <GrafikImpas lebar={620} p={maju(frame, fImpas - 8, 30, EASE.keluar)} />
            </KeluarDariLayar>
          </div>
        </>
      )}
    </Panggung>
  );
};

/** 05.3 Kalau berpotensi rugi, ada saran supaya untung naik. */
export const S05_3: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const fSaran = frameKata(shot, /saran/i, d * 0.45);
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.06 }, ke: { zoom: 1.0, x: 30 } }} aksen={['koin', 'daun', 'matahari', 'sawi']} atas={<JudulKanan shot={shot} frasa="Ada saran supaya untung naik" sorot={['saran']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="hitung" dari={detikPenanda('hitung', 'saran', -0.4)} sampai={detikPenanda('hitung', 'saran', 3.2)} durasi={d} x={HP.x} y={HP.y} fokus={[{ f: 0, x: 0.5, y: 0.5, zoom: 1.2 }, { f: fSaran, x: 0.5, y: 0.55, zoom: 1.3 }]} />
          <KeluarDariLayar mulai={fSaran - 10} dari={ASAL} ke={KANAN}>
            <BolaLampu tinggi={460} p={maju(frame, fSaran - 10, 24)} nyala={maju(frame, fSaran + 10, 14)} />
          </KeluarDariLayar>
          {[0, 1, 2].map((i) => (
            <KeluarDariLayar key={i} mulai={fSaran + 8 + i * 5} dari={{ x: 1340, y: 560 }} ke={{ x: 1600 + (i - 1) * 60, y: 420 + i * 130 }}>
              <IkonTani nama="koin" ukuran={110} />
            </KeluarDariLayar>
          ))}
        </>
      )}
    </Panggung>
  );
};

/** 05.4 Jadi kamu tahu hitungannya sebelum mulai menanam. */
export const S05_4: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.0, x: 20 }, ke: { zoom: 1.08, x: -30 } }} aksen={['benih', 'koin', 'daun', 'tetes']} atas={<JudulKanan shot={shot} frasa="Tahu hitungannya sebelum menanam" sorot={['sebelum']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="hitung" dari={detikPenanda('hitung', 'simpan', -0.3)} sampai={detikPenanda('hitung', 'jadwal', 1.8)} durasi={d} x={HP.x} y={HP.y} fokus={[{ f: 0, x: 0.5, y: 0.5, zoom: 1.1 }, { f: d, x: 0.5, y: 0.4, zoom: 1.2 }]} />
          <KeluarDariLayar mulai={4} dari={ASAL} ke={{ x: 1180, y: 610 }}>
            <Kalkulator lebar={250} p={maju(frame, 4, 20)} />
          </KeluarDariLayar>
          <KeluarDariLayar mulai={20} dari={ASAL} ke={{ x: 1530, y: 640 }}>
            <IkonTani nama="benih" ukuran={260} p={maju(frame, 20, 20)} />
          </KeluarDariLayar>
        </>
      )}
    </Panggung>
  );
};

/** 06.1 Beranda: umur tanaman hari ini dan tugas yang perlu dikerjakan. */
export const S06_1: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const fUmur = frameKata(shot, /umur/i, d * 0.35);
  const fTugas = frameKata(shot, /tugas/i, d * 0.7);
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.0 }, ke: { zoom: 1.06, x: 30 } }} aksen={['tetes', 'sawi', 'cangkul', 'daun', 'matahari']} atas={<JudulKanan shot={shot} frasa="Umur tanaman dan tugas hari ini" sorot={['hari', 'ini']} />}>
      {() => (
        <>
          <BingkaiHp
            rekaman="rawat"
            dari={detikPenanda('rawat', 'beranda', 2.8)}
            sampai={detikPenanda('rawat', 'tugas', 1.6)}
            durasi={d}
            x={HP.x}
            y={HP.y}
            fokus={[
              { f: 0, x: 0.5, y: 0.3, zoom: 1.1 },
              { f: fUmur, x: 0.5, y: 0.66, zoom: 1.3 },
              { f: fTugas, x: 0.5, y: 0.75, zoom: 1.3 },
            ]}
          />
          <KeluarDariLayar mulai={fUmur - 6} dari={ASAL} ke={KANAN}>
            <GarisWaktuTanaman lebar={760} p={maju(frame, fUmur - 4, 40, EASE.keluar)} />
          </KeluarDariLayar>
        </>
      )}
    </Panggung>
  );
};

/** 06.2 Tandai yang sudah selesai. */
export const S06_2: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.08 }, ke: { zoom: 1.0 } }} aksen={['daun', 'tetes', 'sawi']} atas={<JudulKanan shot={shot} frasa="Tandai selesai" sorot={['selesai']} />}>
      {() => (
        <>
          <BingkaiHp rekaman="rawat" dari={detikPenanda('rawat', 'centang', -0.4)} sampai={detikPenanda('rawat', 'centang', 1.4)} durasi={d} x={HP.x} y={HP.y} fokus={[{ f: 0, x: 0.5, y: 0.6, zoom: 1.3 }, { f: d, x: 0.5, y: 0.6, zoom: 1.3 }]} />
          <KeluarDariLayar mulai={6} dari={ASAL} ke={KANAN}>
            <CentangBesar ukuran={380} p={maju(frame, 6, 22, EASE.keluar)} />
          </KeluarDariLayar>
        </>
      )}
    </Panggung>
  );
};

/** 06.3 Cek pH pakai kertas pH; kertas berubah warna lalu jarum bergerak. */
export const S06_3: React.FC<PropsShot> = ({ shot }) => {
  const frame = useCurrentFrame();
  const d = shot.durasiFrame;
  const fAngka = frameKata(shot, /angkanya/i, d * 0.5);
  const fSaran = frameKata(shot, /saran/i, d * 0.8);
  const warna = maju(frame, 10, 30, EASE.halus);
  const ph = interpolate(maju(frame, fAngka - 4, 30, EASE.lompat), [0, 1], [4, 6.2], klem);
  return (
    <Panggung shot={shot} latar="bedengan" kamera={{ dari: { zoom: 1.02, x: -30 }, ke: { zoom: 1.08, x: 30 } }} aksen={['tetes', 'daun', 'sawi', 'benih']} atas={<JudulKanan shot={shot} frasa="Cek pH pakai kertas pH" sorot={['pH']} />}>
      {() => (
        <>
          <BingkaiHp
            rekaman="rawat"
            dari={detikPenanda('rawat', 'ph', -0.2)}
            sampai={detikPenanda('rawat', 'saran-ph', 2.6)}
            durasi={d}
            x={HP.x}
            y={HP.y}
            fokus={[
              { f: 0, x: 0.5, y: 0.3, zoom: 1.3 },
              { f: fSaran - 6, x: 0.5, y: 0.45, zoom: 1.3 },
            ]}
          />
          <KeluarDariLayar mulai={4} dari={ASAL} ke={{ x: 1130, y: 720 }}>
            <KertasPh warna={warna} lebar={430} />
          </KeluarDariLayar>
          <KeluarDariLayar mulai={fAngka - 8} dari={ASAL} ke={{ x: 1600, y: 470 }}>
            <SkalaJarum nilai={ph} lebar={430} />
          </KeluarDariLayar>
        </>
      )}
    </Panggung>
  );
};
