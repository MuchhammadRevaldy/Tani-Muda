/** Fungsi bantu bersama antar fitur klien tiruan. */
import { jarakKm } from '../../../lib/jarak';
import { kapasitasLahan } from '../../../lib/kapasitas-lahan';
import { lahanKeDomain, siklusKeDomain } from '../../peta';
import type { AlokasiPesanan, Lahan, Pengguna, Pesanan } from '../../tipe';
import type { Konteks } from '../konteks';

const ALOKASI_AKTIF: AlokasiPesanan['status'][] = [
  'menunggu_kesepakatan',
  'disepakati',
  'berjalan',
  'selesai',
];

export const alokasiAktif = (a: AlokasiPesanan) => ALOKASI_AKTIF.includes(a.status);

/** Sisa pesanan yang masih bisa diambil: per kiriman (rutin) atau total (sekali panen). */
export function sisaPesananKg(k: Konteks, p: Pesanan): number {
  const terambil = k.db.pesanan.alokasi
    .filter((a) => a.pesanan_id === p.id && alokasiAktif(a))
    .reduce((s, a) => s + a.jumlah_kg, 0);
  return Math.round(((p.jumlah_per_kiriman_kg ?? p.jumlah_total_kg) - terambil) * 100) / 100;
}

/** Pesanan terbuka untuk petani: sudah dibayar uang mukanya, belum selesai, masih ada sisa. */
export function pesananTerbuka(k: Konteks, p: Pesanan): boolean {
  return (p.status === 'mencari_petani' || p.status === 'berjalan') && sisaPesananKg(k, p) > 0;
}

/** Jarak (km) titik tengah desa petani ke desa titik antar pesanan (D-06). */
export function jarakPesananKm(k: Konteks, petani: Pengguna, p: Pesanan): number | null {
  const a = k.wilayah(petani.wilayah_id);
  const b = k.wilayah(p.wilayah_id);
  return a && b ? Math.round(jarakKm(a, b) * 10) / 10 : null;
}

/** Lahan dengan kapasitas tersisa (D-15, D-34). */
export function denganKapasitas(k: Konteks, l: Omit<Lahan, 'kapasitas'>): Lahan {
  const siklus = k.db.kebun.siklus.map(siklusKeDomain);
  return { ...k.salin(l), kapasitas: kapasitasLahan(lahanKeDomain(l), siklus) };
}

export function namaPengguna(k: Konteks, id: string): string {
  const p = k.db.pengguna.pengguna.find((x) => x.id === id);
  const usaha = k.db.pengguna.profil_pembeli.find((x) => x.pengguna_id === id)?.nama_usaha;
  return usaha ?? p?.nama ?? '';
}
