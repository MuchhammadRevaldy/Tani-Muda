import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { SapuanBukit } from '../v2/Sapuan';
import { W } from '../v2/tema';
import { SHOT_DOK, TOTAL_FRAME_DOK, type ShotDok } from './linimasa';
import { PitaTanggal } from './Pita';
import { S01, S02, S03, S04, S05, S06, S07 } from './shot/Awal';
import { S08, S09, S10, S11, S12 } from './shot/Desain';
import { S13, S14, S15, S16 } from './shot/Alur';
import { S17, S18, S19, S20 } from './shot/Kode';
import { S21, S22, S23, S24, S25, S26 } from './shot/Akhir';

/**
 * Video dokumentasi proses pembuatan Tani Muda [AG-52]: tanpa narasi, musik latar
 * public/audio/musik.mp3, potongan di ketukan, sapuan bukit di setiap pergantian adegan,
 * dan pita tanggal 5–19 Oktober di sepanjang video.
 */
const SHOT: Record<string, React.FC<{ d: number }>> = {
  '01': S01, '02': S02, '03': S03, '04': S04, '05': S05, '06': S06, '07': S07,
  '08': S08, '09': S09, '10': S10, '11': S11, '12': S12,
  '13': S13, '14': S14, '15': S15, '16': S16,
  '17': S17, '18': S18, '19': S19, '20': S20,
  '21': S21, '22': S22, '23': S23, '24': S24, '25': S25, '26': S26,
};

const LAMA_SAPUAN = 18;

/** Satu shot berikut pita tanggalnya (untuk lembar kontak dan pratinjau per shot). */
export const ShotDokumentasi: React.FC<{ shot: ShotDok; denganPita?: boolean }> = ({ shot, denganPita = true }) => {
  const frame = useCurrentFrame();
  const Komp = SHOT[shot.id];
  return (
    <AbsoluteFill style={{ backgroundColor: W.langit }}>
      <Komp d={shot.durasiFrame} />
      {denganPita && <PitaTanggal frame={shot.mulaiFrame + frame} />}
    </AbsoluteFill>
  );
};

const PitaGlobal: React.FC = () => <PitaTanggal frame={useCurrentFrame()} />;

export const Dokumentasi: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: W.langit }}>
    {SHOT_DOK.map((s) => (
      <Sequence key={s.id} from={s.mulaiFrame} durationInFrames={s.durasiFrame} name={`${s.id} ${s.ringkas}`}>
        <ShotDokumentasi shot={s} denganPita={false} />
      </Sequence>
    ))}
    <PitaGlobal />
    {SHOT_DOK.filter((s, i) => s.awalAdegan && i > 0).map((s, i) => (
      <Sequence key={`sapuan-${s.id}`} from={s.mulaiFrame - LAMA_SAPUAN / 2} durationInFrames={LAMA_SAPUAN} name={`Sapuan ${s.adegan}`}>
        <SapuanBukit durasi={LAMA_SAPUAN} varian={i} />
      </Sequence>
    ))}
    <Audio
      src={staticFile('audio/musik.mp3')}
      volume={(f) => 0.55 * interpolate(f, [0, 30, TOTAL_FRAME_DOK - 75, TOTAL_FRAME_DOK], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
    />
  </AbsoluteFill>
);
