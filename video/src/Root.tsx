import React from 'react';
import { Composition } from 'remotion';
import { KomposisiTeaser } from './KomposisiTeaser';
import { DURASI_FRAME_TOTAL, FPS, LEBAR, TINGGI } from './konfigurasi';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="TeaserTaniMuda"
        component={KomposisiTeaser}
        durationInFrames={DURASI_FRAME_TOTAL}
        fps={FPS}
        width={LEBAR}
        height={TINGGI}
      />
    </>
  );
};
