/**
 * Pembungkus klien tiruan (T3.05): latensi buatan supaya keadaan memuat di halaman terlihat, dan
 * galat buatan sekali pakai supaya keadaan gagal ikut teruji.
 */
import { teksUntukGalat } from '../../teks/galat-api';
import { GalatApi, type KodeGalatApi } from '../galat';
import type { KlienApi } from '../klien';

export interface OpsiLatensi {
  /** Rentang latensi (ms); [0, 0] untuk tes. */
  latensiMs: [number, number];
  acak?: () => number;
}

export interface KendaliGalatBuatan {
  /** Panggilan berikutnya (apa pun) gagal dengan kode ini, lalu kembali normal. */
  gagalkanBerikutnya(kode: KodeGalatApi): void;
}

const tunda = (ms: number) =>
  ms > 0 ? new Promise<void>((r) => setTimeout(r, ms)) : Promise.resolve();

export function bungkusLatensi(
  klien: KlienApi,
  opsi: OpsiLatensi,
): { klien: KlienApi; kendali: KendaliGalatBuatan } {
  let galatBerikutnya: KodeGalatApi | null = null;
  const acak = opsi.acak ?? Math.random;
  const [min, maks] = opsi.latensiMs;
  const bungkusFitur = <T extends object>(fitur: T): T =>
    new Proxy(fitur, {
      get(target, nama, penerima) {
        const asli = Reflect.get(target, nama, penerima);
        if (typeof asli !== 'function') return asli;
        return async (...argumen: unknown[]) => {
          await tunda(min + Math.round(acak() * (maks - min)));
          if (galatBerikutnya) {
            const kode = galatBerikutnya;
            galatBerikutnya = null;
            throw new GalatApi(kode, teksUntukGalat(kode));
          }
          return (asli as (...a: unknown[]) => unknown).apply(target, argumen);
        };
      },
    });
  const terbungkus = Object.fromEntries(
    Object.entries(klien).map(([k, v]) => [k, bungkusFitur(v as object)]),
  ) as unknown as KlienApi;
  return { klien: terbungkus, kendali: { gagalkanBerikutnya: (kode) => (galatBerikutnya = kode) } };
}
