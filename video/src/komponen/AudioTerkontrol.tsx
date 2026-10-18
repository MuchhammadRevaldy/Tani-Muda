import React from 'react';
import { Audio, Sequence, getStaticFiles, interpolate, staticFile, useVideoConfig } from 'remotion';
import type { Linimasa } from '../linimasa';

const VOLUME_MUSIK = 0.35;
// Saat narasi berbunyi musik turun ke sekitar 30% dari volume normalnya (kira-kira -10 dB).
const VOLUME_MUSIK_SAAT_NARASI = 0.1;
const TRANSISI_DUCK_DETIK = 0.35;

function adaBerkas(nama: string): boolean {
  try {
    return getStaticFiles().some((f) => f.name === nama);
  } catch {
    return true;
  }
}

/**
 * Narasi per adegan + musik latar. Musik turun halus hanya saat
 * kalimat narasi sedang berbunyi, lalu naik lagi di jeda antaradegan.
 */
export const AudioTerkontrol: React.FC<{ linimasa: Linimasa }> = ({ linimasa }) => {
  const { fps } = useVideoConfig();
  // Rentang bicara dalam detik absolut video.
  const rentang = linimasa.adegan.flatMap((a) =>
    a.kalimat.length
      ? [{
          mulai: (a.mulaiFrame + a.awalNarasiFrame) / fps + a.kalimat[0].mulai,
          selesai: (a.mulaiFrame + a.awalNarasiFrame) / fps + a.kalimat[a.kalimat.length - 1].selesai,
        }]
      : [],
  );
  const totalDetik = linimasa.totalFrame / fps;

  const volumeMusik = (frame: number) => {
    const t = frame / fps;
    // Jarak ke rentang bicara terdekat (0 bila sedang bicara).
    const jarak = Math.min(
      ...rentang.map((r) => (t < r.mulai ? r.mulai - t : t > r.selesai ? t - r.selesai : 0)),
    );
    const duck = interpolate(jarak, [0, TRANSISI_DUCK_DETIK], [VOLUME_MUSIK_SAAT_NARASI, VOLUME_MUSIK], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const pudar = interpolate(t, [0, 2, totalDetik - 3, totalDetik], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return duck * pudar;
  };

  return (
    <>
      {linimasa.adegan.map((a) =>
        adaBerkas(`audio/narasi/${a.id}.mp3`) ? (
          <Sequence
            key={a.id}
            from={a.mulaiFrame + a.awalNarasiFrame}
            durationInFrames={a.durasiFrame - a.awalNarasiFrame}
            name={`Narasi ${a.id}`}
            layout="none"
          >
            <Audio src={staticFile(`audio/narasi/${a.id}.mp3`)} />
          </Sequence>
        ) : null,
      )}

      {/* Video tetap bisa dirender bila musik.mp3 dihapus. */}
      {adaBerkas('audio/musik.mp3') && (
        <Audio src={staticFile('audio/musik.mp3')} volume={volumeMusik} />
      )}
    </>
  );
};
