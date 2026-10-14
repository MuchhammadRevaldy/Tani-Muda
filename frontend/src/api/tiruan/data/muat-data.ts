/** Muat data contoh dari shared/data-contoh/*.json, berkas yang sama dengan seeder Laravel (T5.01, T5.08). */
import indeks from '@data-contoh/indeks.json';
import kebun from '@data-contoh/kebun.json';
import konfigurasi from '@data-contoh/konfigurasi.json';
import modul from '@data-contoh/modul.json';
import pengguna from '@data-contoh/pengguna.json';
import pesanan from '@data-contoh/pesanan.json';
import referensi from '@data-contoh/referensi.json';
import resep from '@data-contoh/resep.json';
import stok from '@data-contoh/stok.json';
import wilayah from '@data-contoh/wilayah.json';
import chat from '@data-contoh/chat.json';
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
    stok,
    chat,
  } as unknown as BerkasDataContoh);
}
