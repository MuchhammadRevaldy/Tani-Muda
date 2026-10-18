import React from 'react';
import { CalculateMetadataFunction, Composition, staticFile } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { KOMPONEN_ADEGAN, KomposisiTeaser, PropsTeaser } from './KomposisiTeaser';
import { LEBAR, TINGGI } from './konfigurasi';
import { FPS, hitungLinimasa } from './linimasa';
import { LembarPratinjauIkon } from './ikon/LembarPratinjauIkon';

const linimasaAwal = hitungLinimasa();

/**
 * Durasi video dihitung dari panjang berkas narasi yang diukur langsung,
 * supaya rekaman baru yang lebih panjang tidak terpotong [AG-44].
 */
const hitungMetadata: CalculateMetadataFunction<PropsTeaser> = async () => {
  const terukur: Record<string, number> = {};
  await Promise.all(
    linimasaAwal.adegan.map(async (a) => {
      try {
        terukur[a.id] = await getAudioDurationInSeconds(staticFile(`audio/narasi/${a.id}.mp3`));
      } catch {
        // Berkas belum ada: pakai angka dari narasi.json.
      }
    }),
  );
  const linimasa = hitungLinimasa(terukur);
  return { durationInFrames: linimasa.totalFrame, props: { linimasa } };
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PratinjauIkon"
        component={LembarPratinjauIkon}
        durationInFrames={1}
        fps={FPS}
        width={LEBAR}
        height={TINGGI}
      />

      <Composition
        id="TeaserTaniMuda"
        component={KomposisiTeaser}
        durationInFrames={linimasaAwal.totalFrame}
        fps={FPS}
        width={LEBAR}
        height={TINGGI}
        defaultProps={{ linimasa: linimasaAwal }}
        calculateMetadata={hitungMetadata}
      />

      {/* Papan gaya: satu komposisi per adegan untuk still render. */}
      {linimasaAwal.adegan.map((a) => (
        <Composition
          key={a.id}
          id={`PapanGaya${a.id}`}
          component={KOMPONEN_ADEGAN[a.id]}
          durationInFrames={a.durasiFrame}
          fps={FPS}
          width={LEBAR}
          height={TINGGI}
        />
      ))}
    </>
  );
};
