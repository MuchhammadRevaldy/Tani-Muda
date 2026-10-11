/** Muat data contoh dari berkas JSON (yang kelak dipakai juga oleh seeder Laravel). */
import indeks from './indeks.json';
import kebun from './kebun.json';
import konfigurasi from './konfigurasi.json';
import modul from './modul.json';
import pengguna from './pengguna.json';
import pesanan from './pesanan.json';
import referensi from './referensi.json';
import resep from './resep.json';
import wilayah from './wilayah.json';
import { gabungDataContoh, type BerkasDataContoh } from './berkas-data';
import type { DataContoh } from './jenis-data';

/** Versi data contoh (indeks.json); data tersimpan versi lain diganti. */
export const VERSI_DATA_CONTOH: number = indeks.versi;

/** Data contoh mentah (tanggal masih relatif). */
export function muatDataContoh(): DataContoh {
  return gabungDataContoh({
    indeks,
    konfigurasi,
    wilayah,
    referensi,
    resep,
    modul,
    pengguna,
    kebun,
    pesanan,
  } as unknown as BerkasDataContoh);
}
