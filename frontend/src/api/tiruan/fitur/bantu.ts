/** Fungsi bantu bersama antar fitur klien tiruan. */
import { jarakKm } from '../../../lib/jarak';
import { kapasitasLahan } from '../../../lib/kapasitas-lahan';
import { tambahHari } from '../../../lib/tanggal';
import { lahanKeDomain, siklusKeDomain } from '../../peta';
import type {
  AlokasiPesanan,
  AlokasiTersimpan,
  KelompokPesananSiklus,
  Lahan,
  Pengguna,
  Pengiriman,
  PengirimanTersimpan,
  Pesanan,
  SiklusTanam,
  SiklusTersimpan,
} from '../../tipe';
import type { Konteks } from '../konteks';

const ALOKASI_AKTIF: AlokasiTersimpan['status'][] = [
  'menunggu_kesepakatan',
  'disepakati',
  'berjalan',
  'selesai',
];

export const alokasiAktif = (a: AlokasiTersimpan) => ALOKASI_AKTIF.includes(a.status);

/** Sisa pesanan yang masih bisa diambil: per kiriman (rutin) atau total (sekali panen). */
export function sisaPesananKg(k: Konteks, p: Pesanan): number {
  const terambil = k.db.pesanan.alokasi
    .filter((a) => a.pesanan_id === p.id && alokasiAktif(a))
    .reduce((s, a) => s + a.jumlah_kg, 0);
  return Math.round(((p.jumlah_per_kiriman_kg ?? p.jumlah_total_kg) - terambil) * 100) / 100;
}

/**
 * Hitung ulang `terambil_kg` dari alokasi aktif (invarian D-52). Dipanggil setiap kali jumlah atau
 * status alokasi berubah: ambil, ubah jumlah, gagal panen, batal.
 */
export function segarkanTerambil(k: Konteks, p: Pesanan): void {
  const terambil = k.db.pesanan.alokasi
    .filter((a) => a.pesanan_id === p.id && alokasiAktif(a))
    .reduce((s, a) => s + a.jumlah_kg, 0);
  p.terambil_kg = Math.round(terambil * 100) / 100;
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

/** Siklus untuk perhitungan kapasitas: ditambah perkiraan tanggal panen dari umur panen resep. */
export function siklusKapasitas(k: Konteks, s: SiklusTersimpan) {
  const umur = k.db.resep.find((r) => r.id === s.resep_id)?.umur_panen_hari ?? 0;
  return {
    ...siklusKeDomain(s),
    tanggalPanen: s.tanggal_tanam ? tambahHari(s.tanggal_tanam, umur) : null,
  };
}

/** Lahan dengan kapasitas tersisa (D-15, D-34, D-40). */
export function denganKapasitas(k: Konteks, l: Omit<Lahan, 'kapasitas'>): Lahan {
  const siklus = k.db.kebun.siklus.map((s) => siklusKapasitas(k, s));
  return { ...k.salin(l), kapasitas: kapasitasLahan(lahanKeDomain(l), siklus) };
}

/** Siklus yang memenuhi sebuah alokasi, urut petak. */
export const siklusAlokasi = (k: Konteks, alokasiId: string) =>
  k.db.kebun.siklus
    .filter((s) => s.alokasi_pesanan_id === alokasiId)
    .sort((a, b) => (a.petak_ke ?? 0) - (b.petak_ke ?? 0));

/** Alokasi seperti dikirim API: dengan daftar siklus (petak) yang memenuhinya (D-40). */
export function alokasiKeluar(k: Konteks, a: AlokasiTersimpan): AlokasiPesanan {
  return k.salin({ ...a, siklus_ids: siklusAlokasi(k, a.id).map((s) => s.id) });
}

/** Kelompok pesanan sebuah siklus untuk tampilan berkelompok (D-40). */
export function kelompokPesanan(k: Konteks, s: SiklusTersimpan): KelompokPesananSiklus | null {
  const a = s.alokasi_pesanan_id
    ? k.db.pesanan.alokasi.find((x) => x.id === s.alokasi_pesanan_id)
    : undefined;
  const p = a ? k.db.pesanan.pesanan.find((x) => x.id === a.pesanan_id) : undefined;
  if (!a || !p) return null;
  return {
    alokasi_id: a.id,
    pesanan_id: p.id,
    nama_pembeli: namaPengguna(k, p.pembeli_id),
    jumlah_petak: siklusAlokasi(k, a.id).length,
    status_alokasi: a.status,
    tanggal_kirim:
      s.petak_ke !== null && p.tanggal_mulai && p.frekuensi_hari
        ? tambahHari(p.tanggal_mulai, (s.petak_ke - 1) * p.frekuensi_hari)
        : null,
  };
}

/** Siklus seperti dikirim API: dengan kolom yang dihitung server. */
export function siklusKeluar(k: Konteks, s: SiklusTersimpan): SiklusTanam {
  const contoh = k.db.resep.find((r) => r.id === s.resep_id)?.contoh ?? false;
  return { ...k.salin(s), resep_contoh: contoh, kelompok_pesanan: kelompokPesanan(k, s) };
}

export function namaPengguna(k: Konteks, id: string): string {
  const p = k.db.pengguna.pengguna.find((x) => x.id === id);
  const usaha = k.db.pengguna.profil_pembeli.find((x) => x.pengguna_id === id)?.nama_usaha;
  return usaha ?? p?.nama ?? '';
}

/** Kiriman seperti dikirim API: dengan nilai yang sudah diberikan pengguna pembaca (P0-28). */
export function kirimanKeluar(
  k: Konteks,
  x: PengirimanTersimpan,
  penggunaId: string | null,
): Pengiriman {
  const r = k.db.pesanan.rating.find(
    (y) => y.pengiriman_id === x.id && y.pemberi_id === penggunaId,
  );
  return k.salin({ ...x, rating_saya: r?.nilai ?? null });
}
