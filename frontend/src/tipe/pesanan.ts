/** Tipe domain marketplace (Model Data PRD + D-01, D-02, D-03, D-14). */

export type JenisPesanan = 'rutin' | 'sekali_panen';

/** Alasan penolakan kiriman (D-06, D-14). "lainnya" wajib disertai keterangan. */
export type AlasanPenolakan =
  'layu_atau_busuk' | 'jumlah_kurang' | 'tidak_sesuai_standar' | 'lainnya';
export const DAFTAR_ALASAN_PENOLAKAN: readonly AlasanPenolakan[] = [
  'layu_atau_busuk',
  'jumlah_kurang',
  'tidak_sesuai_standar',
  'lainnya',
];

/** Konfigurasi bisnis. Semua angka bisnis datang dari sini, bukan dari kode (D-08). */
export interface KonfigurasiBisnis {
  /** Persen uang muka dari nilai pesanan (D-02: 20). */
  persenUangMuka: number;
  /** Persen biaya layanan, dibayar pembeli (5). */
  persenLayanan: number;
  /** Batas periksa kiriman dalam jam (D-01: rutin 6, sekali panen 24). */
  jamPeriksa: Record<JenisPesanan, number>;
  /** Kabar gagal panen paling lambat n hari sebelum jadwal kirim (D-03: 3). */
  hariKabarGagalPanen: number;
  /** Radius pesanan di sekitar (km). */
  radiusKm: number;
}

export interface Titik {
  lintang: number;
  bujur: number;
}

export interface Wilayah extends Titik {
  id: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
}
