import React from 'react';
import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { ADEGAN_CONFIG, DURASI_FRAME_TOTAL } from '../konfigurasi';

export const AudioTerkontrol: React.FC = () => {
  const frame = useCurrentFrame();

  // Daftar scene dengan narasi
  const adeganList = Object.values(ADEGAN_CONFIG);

  // Cek apakah ada narasi yang sedang aktif di frame saat ini
  const sedangBicara = adeganList.some((a) => {
    // Berikan jeda 0.5 detik awal dan 0.5 detik akhir per adegan
    const mulaiBicara = a.mulaiFrame + 15;
    const selesaiBicara = a.mulaiFrame + a.durasiFrame - 15;
    return frame >= mulaiBicara && frame <= selesaiBicara;
  });

  // Volume musik: 0.38 normal, turun ke 0.20 saat narasi aktif (ducking)
  let volumeMusik = sedangBicara ? 0.20 : 0.38;

  // Fade-in 2 detik pertama (0 - 60 frame)
  if (frame < 60) {
    volumeMusik = interpolate(frame, [0, 60], [0, volumeMusik], {
      extrapolateRight: 'clamp',
    });
  }

  // Fade-out 3 detik terakhir (DURASI_FRAME_TOTAL - 90 hingga akhir)
  if (frame > DURASI_FRAME_TOTAL - 90) {
    volumeMusik = interpolate(
      frame,
      [DURASI_FRAME_TOTAL - 90, DURASI_FRAME_TOTAL],
      [volumeMusik, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      },
    );
  }

  return (
    <>
      {/* 10 Berkas Narasi Terpisah per Adegan (01.mp3 ... 10.mp3) */}
      {adeganList.map((a) => (
        <Sequence
          key={a.id}
          from={a.mulaiFrame}
          durationInFrames={a.durasiFrame}
          name={`Narasi ${a.id}`}
        >
          <Audio src={staticFile(`audio/narasi/${a.id}.mp3`)} volume={1.0} />
        </Sequence>
      ))}

      {/* Musik Latar Akustik Bebas Royalti dengan Ducking Otomatis ke 20% */}
      <Audio src={staticFile('audio/musik.mp3')} volume={volumeMusik} />
    </>
  );
};
