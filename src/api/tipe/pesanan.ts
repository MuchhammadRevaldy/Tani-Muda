/** Pesanan, alokasi, kiriman, pembayaran, rating, sengketa (kontrak 2.9–2.11). */
import type { JenisUsaha } from './akun';
import type { DenganKunciIdempoten, Rupiah, TanggalISO, WaktuISO } from './umum';

export type JenisPesanan = 'rutin' | 'sekali_panen';
export type StatusPesanan =
  'menunggu_pembayaran' | 'mencari_petani' | 'berjalan' | 'selesai' | 'dibatalkan';

/** Pesanan dilihat pembelinya. Nilai uang dihitung server (D-02, D-08). */
export interface Pesanan {
  id: string;
  pembeli_id: string;
  jenis: JenisPesanan;
  komoditas_id: string;
  jumlah_per_kiriman_kg: number | null;
  frekuensi_hari: number | null;
  jumlah_kiriman: number;
  jumlah_total_kg: number;
  tanggal_mulai: TanggalISO | null;
  tanggal_selesai: TanggalISO | null;
  /** "YYYY-MM" untuk pesanan sekali panen. */
  perkiraan_bulan_panen: string | null;
  harga_per_kg: Rupiah;
  standar_kualitas: string[];
  /** Desa titik antar (kode wilayah). */
  wilayah_id: string;
  alamat_antar: string;
  patokan: string | null;
  status: StatusPesanan;
  nilai_pesanan: Rupiah;
  uang_muka: Rupiah;
  biaya_layanan: Rupiah;
  saldo_uang_muka: Rupiah;
  /** Jumlah per kiriman (rutin) atau total (sekali panen) yang sudah diambil petani. */
  terambil_kg: number;
  dibuat_pada: WaktuISO;
}

/**
 * Pesanan dilihat petani di sekitar. Hanya nama desa dan jarak dari titik tengah desa (D-06);
 * alamat lengkap tidak dikirim.
 */
export interface PesananUntukPetani {
  id: string;
  jenis: JenisPesanan;
  komoditas_id: string;
  nama_pembeli: string;
  jenis_usaha: JenisUsaha;
  desa_antar: string;
  kecamatan_antar: string;
  jarak_km: number;
  jumlah_per_kiriman_kg: number | null;
  frekuensi_hari: number | null;
  jumlah_kiriman: number;
  jumlah_total_kg: number;
  /** Sisa yang bisa diambil (per kiriman untuk rutin, total untuk sekali panen). */
  sisa_kg: number;
  tanggal_mulai: TanggalISO | null;
  perkiraan_bulan_panen: string | null;
  harga_per_kg: Rupiah;
  standar_kualitas: string[];
  boleh_ambil_sebagian: boolean;
  uang_muka_diterima: boolean;
  rating_pembeli: { rata_rata: number | null; jumlah: number };
}

export type StatusAlokasi =
  'menunggu_kesepakatan' | 'disepakati' | 'berjalan' | 'selesai' | 'gagal' | 'dibatalkan';

export interface AlokasiPesanan {
  id: string;
  pesanan_id: string;
  petani_id: string;
  siklus_id: string | null;
  jumlah_kg: number;
  status: StatusAlokasi;
  disetujui_pada: WaktuISO | null;
  dibuat_pada: WaktuISO;
}

/** `gagal`: bagian ini dilaporkan gagal panen dan ditawarkan ulang (D-03). */
export type StatusPengiriman = 'terjadwal' | 'dikirim' | 'diterima' | 'ditolak_sebagian' | 'gagal';
export type AlasanPenolakan =
  'layu_atau_busuk' | 'jumlah_kurang' | 'tidak_sesuai_standar' | 'lainnya';

export interface Pengiriman {
  id: string;
  alokasi_id: string;
  pesanan_id: string;
  ke: number;
  tanggal_jadwal: TanggalISO;
  jumlah_kg: number;
  harga_per_kg: Rupiah;
  foto_kualitas: string | null;
  status: StatusPengiriman;
  dikirim_pada: WaktuISO | null;
  /** Batas periksa pembeli (D-01: 6 jam rutin, 24 jam sekali panen). */
  batas_periksa_pada: WaktuISO | null;
  dikonfirmasi_pada: WaktuISO | null;
  dianggap_diterima: boolean;
  jumlah_ditolak_kg: number;
  alasan_penolakan: AlasanPenolakan | null;
  keterangan_penolakan: string | null;
  foto_penolakan: string | null;
  /** Dana cair untuk petani = nilai bagian diterima (P0-26). */
  nilai_diterima: Rupiah | null;
}

export type JenisPembayaran =
  'uang_muka' | 'biaya_layanan' | 'kiriman' | 'pencairan' | 'pengembalian' | 'kompensasi';
export type StatusPembayaran = 'menunggu' | 'ditahan' | 'cair' | 'dikembalikan' | 'gagal';

export interface Pembayaran {
  id: string;
  pesanan_id: string;
  pengiriman_id: string | null;
  jenis: JenisPembayaran;
  nominal: Rupiah;
  status: StatusPembayaran;
  /** Referensi penyedia pembayaran; tiruan diawali "TIRUAN-" (D-10). */
  referensi: string;
  mode_uji_coba: boolean;
  dibuat_pada: WaktuISO;
}

export interface Rating {
  id: string;
  pengiriman_id: string;
  pemberi_id: string;
  penerima_id: string;
  nilai: number;
  komentar: string | null;
  dibuat_pada: WaktuISO;
}

export interface RingkasanRating {
  pengguna_id: string;
  rata_rata: number | null;
  jumlah: number;
}

export type StatusSengketa = 'terbuka' | 'diputuskan';
export type KeputusanSengketa = 'cairkan_ke_petani' | 'kembalikan_ke_pembeli';

export interface Sengketa {
  id: string;
  pengiriman_id: string;
  status: StatusSengketa;
  keputusan: KeputusanSengketa | null;
  catatan: string | null;
  dibuat_pada: WaktuISO;
  diputuskan_pada: WaktuISO | null;
}

/** Kebun pemenuh pesanan dilihat pembeli: tanpa titik lahan (D-06). */
export interface KebunUntukPembeli {
  alokasi_id: string;
  nama_petani: string;
  desa: string;
  jarak_km: number;
  jumlah_kg: number;
  hari_ke: number | null;
  hari_panen: number | null;
  perkiraan_tanggal_panen: TanggalISO | null;
  foto_terbaru: string | null;
}

/** Baris dasbor pembeli. */
export interface PesananDenganKebun extends Pesanan {
  kebun: KebunUntukPembeli[];
  kiriman_berikutnya: Pengiriman | null;
  /** Kiriman yang menunggu konfirmasi pembeli. */
  kiriman_menunggu: Pengiriman[];
}

// ---- masukan

export interface ParamPesananSekitar {
  jenis?: JenisPesanan;
  radius_km?: number;
  halaman?: number;
  per_halaman?: number;
}
export interface AmbilPesananMasukan extends DenganKunciIdempoten {
  jumlah_kg: number;
  lahan_id: string;
}
export interface AmbilPesananHasil {
  alokasi: AlokasiPesanan;
  siklus_id: string;
}
export interface LaporGagalPanenMasukan {
  pengiriman_id: string;
  alasan: string;
}
export interface LaporGagalPanenHasil {
  tepat_waktu: boolean;
  dikembalikan: Rupiah;
  catatan_profil: boolean;
  alokasi: AlokasiPesanan;
}
export type KonfirmasiKirimanMasukan = DenganKunciIdempoten &
  (
    | { keputusan: 'terima_semua' }
    | {
        keputusan: 'tolak_sebagian';
        jumlah_ditolak_kg: number;
        alasan_penolakan: AlasanPenolakan;
        keterangan_penolakan?: string | null;
        foto_penolakan?: string | null;
      }
  );
export interface KonfirmasiKirimanHasil {
  pengiriman: Pengiriman;
  pembayaran: Pembayaran[];
  sengketa: Sengketa | null;
}
export interface RatingMasukan {
  nilai: number;
  komentar?: string | null;
}
export type BuatPesananMasukan =
  | {
      jenis: 'rutin';
      komoditas_id: string;
      jumlah_per_kiriman_kg: number;
      frekuensi_hari: number;
      durasi_hari: number;
      tanggal_mulai: TanggalISO;
      harga_per_kg: Rupiah;
      standar_kualitas: string[];
      wilayah_id: string;
      alamat_antar: string;
      patokan?: string | null;
    }
  | {
      jenis: 'sekali_panen';
      komoditas_id: string;
      jumlah_total_kg: number;
      perkiraan_bulan_panen: string;
      harga_per_kg: Rupiah;
      standar_kualitas: string[];
      wilayah_id: string;
      alamat_antar: string;
      patokan?: string | null;
    };
export type BayarUangMukaMasukan = DenganKunciIdempoten;
export interface BatalkanPesananHasil {
  pesanan: Pesanan;
  kompensasi_petani: Rupiah;
  dikembalikan_ke_pembeli: Rupiah;
}
