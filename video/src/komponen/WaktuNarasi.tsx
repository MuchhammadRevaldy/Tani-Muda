import React, { createContext, useContext } from 'react';
import { useVideoConfig } from 'remotion';
import { hitungLinimasa, type AdeganLinimasa } from '../linimasa';

const linimasaBawaan = hitungLinimasa();
const KonteksAdegan = createContext<AdeganLinimasa | null>(null);

export const PenyediaWaktuNarasi: React.FC<{ adegan: AdeganLinimasa; children: React.ReactNode }> = ({
  adegan,
  children,
}) => <KonteksAdegan.Provider value={adegan}>{children}</KonteksAdegan.Provider>;

/**
 * Frame (relatif awal adegan) saat tiap kalimat narasi mulai, supaya pergantian
 * shot dan kejadian penting jatuh tepat saat kalimatnya diucapkan.
 * Di komposisi papan gaya (tanpa penyedia) memakai data narasi.json.
 */
export function useAwalKalimat(id: string): number[] {
  const { fps } = useVideoConfig();
  const adegan = useContext(KonteksAdegan) ?? linimasaBawaan.adegan.find((a) => a.id === id);
  if (!adegan) return [];
  return adegan.kalimat.map((k) => Math.round(adegan.awalNarasiFrame + k.mulai * fps));
}
