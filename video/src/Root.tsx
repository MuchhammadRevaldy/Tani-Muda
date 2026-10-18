import React from 'react';
import { Composition } from 'remotion';
import { KomposisiTeaser } from './KomposisiTeaser';
import { DURASI_FRAME_TOTAL, FPS, LEBAR, TINGGI } from './konfigurasi';
import { LembarPratinjauIkon } from './ikon/LembarPratinjauIkon';

// Impor 10 adegan untuk papan gaya still-render
import { Adegan01Pembuka } from './adegan/01-Pembuka';
import { Adegan02Data } from './adegan/02-Data';
import { Adegan03Masalah } from './adegan/03-Masalah';
import { Adegan04Solusi } from './adegan/04-Solusi';
import { Adegan05Hitung } from './adegan/05-Hitung';
import { Adegan06Rawat } from './adegan/06-Rawat';
import { Adegan07Jual } from './adegan/07-Jual';
import { Adegan08FiturPintar } from './adegan/08-FiturPintar';
import { Adegan09Bertahan } from './adegan/09-Bertahan';
import { Adegan10Penutup } from './adegan/10-Penutup';

export const Root: React.FC = () => {
  return (
    <>
      {/* Pratinjau Lembar Ikon Handcrafted */}
      <Composition
        id="PratinjauIkon"
        component={LembarPratinjauIkon}
        durationInFrames={1}
        fps={FPS}
        width={LEBAR}
        height={TINGGI}
      />

      {/* Komposisi Master Video Teaser 170 Detik */}
      <Composition
        id="TeaserTaniMuda"
        component={KomposisiTeaser}
        durationInFrames={DURASI_FRAME_TOTAL}
        fps={FPS}
        width={LEBAR}
        height={TINGGI}
      />

      {/* 10 Komposisi Papan Gaya (Still Render Frame per Adegan) */}
      <Composition id="PapanGaya01" component={Adegan01Pembuka} durationInFrames={360} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya02" component={Adegan02Data} durationInFrames={450} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya03" component={Adegan03Masalah} durationInFrames={540} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya04" component={Adegan04Solusi} durationInFrames={390} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya05" component={Adegan05Hitung} durationInFrames={660} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya06" component={Adegan06Rawat} durationInFrames={570} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya07" component={Adegan07Jual} durationInFrames={810} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya08" component={Adegan08FiturPintar} durationInFrames={660} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya09" component={Adegan09Bertahan} durationInFrames={390} fps={FPS} width={LEBAR} height={TINGGI} />
      <Composition id="PapanGaya10" component={Adegan10Penutup} durationInFrames={270} fps={FPS} width={LEBAR} height={TINGGI} />
    </>
  );
};
