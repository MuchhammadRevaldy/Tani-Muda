import { Easing, interpolate, spring } from 'remotion';
import { FPS } from './tema';

const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Beberapa karakter spring supaya gerak tidak seragam. */
export const PEGAS = {
  lembut: { damping: 18, stiffness: 90, mass: 1 },
  pantul: { damping: 9, stiffness: 160, mass: 0.8 },
  cepat: { damping: 22, stiffness: 260, mass: 0.6 },
  berat: { damping: 16, stiffness: 70, mass: 1.6 },
} as const;

export function pegas(frame: number, mulai: number, jenis: keyof typeof PEGAS = 'lembut', durasi?: number) {
  return spring({ frame: frame - mulai, fps: FPS, config: PEGAS[jenis], durationInFrames: durasi });
}

/** 0→1 dengan easing (bukan linier). */
export function maju(
  frame: number,
  mulai: number,
  lama: number,
  ease: (t: number) => number = Easing.inOut(Easing.cubic),
) {
  return interpolate(frame, [mulai, mulai + Math.max(1, lama)], [0, 1], { ...klem, easing: ease });
}

export const EASE = {
  keluar: Easing.out(Easing.cubic),
  masuk: Easing.in(Easing.quad),
  halus: Easing.inOut(Easing.sin),
  lompat: Easing.out(Easing.back(1.6)),
  tajam: Easing.inOut(Easing.exp),
};

export function antara(t: number, a: number, b: number) {
  return a + (b - a) * t;
}

/** Ayun naik turun pelan; fase membedakan setiap objek. */
export function ayun(frame: number, fase = 0, amp = 10, periode = 90) {
  return Math.sin(((frame + fase) / periode) * Math.PI * 2) * amp;
}

export interface Kamera {
  x: number;
  y: number;
  zoom: number;
  putar: number;
}

/**
 * Kamera bergerak dari `dari` ke `ke` sepanjang shot dengan easing halus, ditambah
 * goyangan kecil supaya tidak pernah benar-benar diam.
 */
export function kamera(frame: number, durasi: number, dari: Partial<Kamera>, ke: Partial<Kamera>, ease = EASE.halus): Kamera {
  const t = maju(frame, 0, durasi, ease);
  const a = { x: 0, y: 0, zoom: 1, putar: 0, ...dari };
  const b = { ...a, ...ke };
  return {
    x: antara(t, a.x, b.x) + ayun(frame, 0, 6, 160),
    y: antara(t, a.y, b.y) + ayun(frame, 40, 4, 200),
    zoom: antara(t, a.zoom, b.zoom),
    putar: antara(t, a.putar, b.putar),
  };
}

/** Angka acak tetap dari benih (supaya render selalu sama). */
export function acak(benih: number) {
  const x = Math.sin(benih * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
