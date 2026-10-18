import React from 'react';
import { Audio, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { DURASI_FRAME_TOTAL } from '../konfigurasi';

/**
 * Rentang frame saat narator berbicara.
 * Pada rentang ini musik latar diturunkan volumenya (ducking) dari 0.38 ke 0.14.
 */
const RENTANG_BICARA = [
  { mulai: 15, selesai: 340 }, // Adegan 1: 0.5s - 11.3s
  { mulai: 375, selesai: 880 }, // Adegan 2: 12.5s - 29.3s
  { mulai: 915, selesai: 1240 }, // Adegan 3: 30.5s - 41.3s
  { mulai: 1275, selesai: 1920 }, // Adegan 4: 42.5s - 64.0s
  { mulai: 1965, selesai: 2520 }, // Adegan 5: 65.5s - 84.0s
  { mulai: 2565, selesai: 3420 }, // Adegan 6: 85.5s - 114.0s
  { mulai: 3465, selesai: 4320 }, // Adegan 7: 115.5s - 144.0s
  { mulai: 4365, selesai: 4770 }, // Adegan 8: 145.5s - 159.0s
  { mulai: 4815, selesai: 5070 }, // Adegan 9: 160.5s - 169.0s
];

export const AudioTerkontrol: React.FC = () => {
  const frame = useCurrentFrame();

  // Hitung volume musik dengan ducking dinamis
  let volumeMusik = 0.38;

  // Cek apakah frame saat ini masuk rentang narasi aktif
  const sedangBicara = RENTANG_BICARA.some((r) => frame >= r.mulai && frame <= r.selesai);

  if (sedangBicara) {
    volumeMusik = 0.14;
  }

  // Fade-in 2 detik pertama (0-60 frame)
  if (frame < 60) {
    volumeMusik = interpolate(frame, [0, 60], [0, volumeMusik], {
      extrapolateRight: 'clamp',
    });
  }

  // Fade-out 3 detik terakhir (DURASI_FRAME_TOTAL - 90 hingga akhir)
  if (frame > DURASI_FRAME_TOTAL - 90) {
    volumeMusik = interpolate(frame, [DURASI_FRAME_TOTAL - 90, DURASI_FRAME_TOTAL], [volumeMusik, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  return (
    <>
      {/* Track Suara Narator */}
      <Audio src={staticFile('audio/narasi.mp3')} volume={1.0} />

      {/* Track Musik Latar Akustik dengan Ducking Otomatis */}
      <Audio src={staticFile('audio/musik.mp3')} volume={volumeMusik} />
    </>
  );
};
