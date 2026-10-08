/**
 * Waktu terhadap hari ini di zona pengguna, untuk teks seperti "Periksa sebelum besok pukul 04.00"
 * (D-48): batas periksa atau jam kiriman yang melewati tengah malam tidak boleh terbaca seolah-olah
 * hari ini. Teksnya disusun di src/teks/waktu.ts.
 */
import type { TanggalISO } from './format';
import { selisihHari } from './tanggal';
import { jamLokal, tanggalLokal, ZONA_BAWAAN } from './zona-waktu';

export type HariRelatif = 'kemarin' | 'hari_ini' | 'besok' | 'lain';

export interface WaktuRelatif {
  hari: HariRelatif;
  /** Tanggal lokal waktu itu (dipakai bila `hari` = "lain"). */
  tanggal: TanggalISO;
  jam: number;
  menit: number;
}

export function waktuRelatif(
  ms: number,
  sekarangMs: number,
  zona: string = ZONA_BAWAAN,
): WaktuRelatif {
  const tanggal = tanggalLokal(ms, zona);
  const selisih = selisihHari(tanggalLokal(sekarangMs, zona), tanggal);
  const hari: HariRelatif =
    selisih === 0 ? 'hari_ini' : selisih === 1 ? 'besok' : selisih === -1 ? 'kemarin' : 'lain';
  const { jam, menit } = jamLokal(ms, zona);
  return { hari, tanggal, jam, menit };
}
