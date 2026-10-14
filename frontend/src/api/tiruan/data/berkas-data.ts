/**
 * Pembagian data contoh ke beberapa berkas JSON di shared/data-contoh/ dan penggabungannya kembali.
 * Berkas yang sama dibaca seeder Laravel (T5.01, T5.08).
 */
import type { DataContoh } from './jenis-data';

export interface BerkasDataContoh {
  indeks: { versi: number; catatan: string };
  konfigurasi: DataContoh['konfigurasi'];
  wilayah: DataContoh['wilayah'];
  referensi: DataContoh['referensi'];
  resep: DataContoh['resep'];
  modul: DataContoh['modul'];
  pengguna: DataContoh['pengguna'];
  kebun: DataContoh['kebun'];
  pesanan: DataContoh['pesanan'];
  stok: DataContoh['stok'];
  chat: DataContoh['chat'];
}

const CATATAN =
  'DATA CONTOH dan fiktif, bukan rekomendasi. Resep berstatus draf dan berlabel "CONTOH, belum divalidasi penyuluh". ' +
  'Tanggal relatif: "H-13" = 13 hari sebelum hari ini; "H+0T07:00" = hari ini pukul 07.00 waktu pengguna; "B+2" = dua bulan dari bulan ini. ' +
  'Dibuat dari frontend/src/api/tiruan/data/pembuat-data.ts dengan "npm run data-contoh"; jangan diubah manual.';

export function pecahDataContoh(d: DataContoh): BerkasDataContoh {
  return {
    indeks: { versi: d.versi, catatan: CATATAN },
    konfigurasi: d.konfigurasi,
    wilayah: d.wilayah,
    referensi: d.referensi,
    resep: d.resep,
    modul: d.modul,
    pengguna: d.pengguna,
    kebun: d.kebun,
    pesanan: d.pesanan,
    stok: d.stok,
    chat: d.chat,
  };
}

export function gabungDataContoh(b: BerkasDataContoh): DataContoh {
  return {
    versi: b.indeks.versi,
    konfigurasi: b.konfigurasi,
    wilayah: b.wilayah,
    referensi: b.referensi,
    resep: b.resep,
    modul: b.modul,
    pengguna: b.pengguna,
    kebun: b.kebun,
    pesanan: b.pesanan,
    stok: b.stok,
    chat: b.chat,
  };
}
