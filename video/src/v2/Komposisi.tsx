import React from 'react';
import { AbsoluteFill, Audio, Sequence, getStaticFiles, interpolate, staticFile, useVideoConfig } from 'remotion';
import { DAFTAR_SHOT } from './shot';
import { KALIMAT, SHOT, TOTAL_FRAME, type Shot } from './linimasa';
import { SapuanBukit } from './Sapuan';
import { SubtitelNarasi } from './Subtitel';
import { HURUF, W } from './tema';

const LAMA_SAPUAN = 18;

/** Shot yang belum dibuat: kartu sementara supaya linimasa tetap utuh. */
const ShotSementara: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill style={{ background: W.daunLembut, alignItems: 'center', justifyContent: 'center', fontFamily: HURUF }}>
    <div style={{ fontSize: 72, fontWeight: 800, color: W.daun }}>{shot.id}</div>
    <div style={{ fontSize: 40, color: W.teks, maxWidth: 1400, textAlign: 'center' }}>{shot.teks}</div>
  </AbsoluteFill>
);

export const KomponenShot: React.FC<{ shot: Shot }> = ({ shot }) => {
  const Komp = DAFTAR_SHOT[shot.id] ?? ShotSementara;
  return <Komp shot={shot} />;
};

function adaBerkas(nama: string) {
  try {
    return getStaticFiles().some((f) => f.name === nama);
  } catch {
    return true;
  }
}

/** Musik turun ke sekitar 30% saat kata diucapkan, naik lagi di jeda panjang. */
function volumeMusik(frame: number, fps: number) {
  const t = frame / fps;
  let jarak = Infinity;
  for (const k of KALIMAT) {
    const d = t < k.mulai ? k.mulai - t : t > k.selesai ? t - k.selesai : 0;
    if (d < jarak) jarak = d;
  }
  const duck = interpolate(jarak, [0, 0.6], [0.09, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const total = TOTAL_FRAME / fps;
  const pudar = interpolate(t, [0, 1.5, total - 2.5, total], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return duck * pudar;
}

export const TeaserV2: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: W.langit }}>
      {SHOT.map((s) => (
        <Sequence key={s.id} from={s.mulaiFrame} durationInFrames={s.durasiFrame} name={`${s.id} ${s.teks.slice(0, 30)}`}>
          <KomponenShot shot={s} />
        </Sequence>
      ))}

      {/* sapuan bukit di setiap pergantian adegan */}
      {SHOT.filter((s, i) => s.awalAdegan && i > 0).map((s, i) => (
        <Sequence key={`sapuan-${s.id}`} from={s.mulaiFrame - LAMA_SAPUAN / 2} durationInFrames={LAMA_SAPUAN} name={`Sapuan ${s.adegan}`}>
          <SapuanBukit durasi={LAMA_SAPUAN} varian={i} />
        </Sequence>
      ))}

      <SubtitelNarasi />

      {adaBerkas('audio/narasi/rekaman.wav') && <Audio src={staticFile('audio/narasi/rekaman.wav')} />}
      {adaBerkas('audio/musik.mp3') && <Audio src={staticFile('audio/musik.mp3')} volume={(f) => volumeMusik(f, fps)} />}
    </AbsoluteFill>
  );
};
