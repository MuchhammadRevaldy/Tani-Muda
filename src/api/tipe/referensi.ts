/** Referensi: komoditas, metode, input, merek, harga, subsidi, promo, konfigurasi (kontrak 2.4). */
import type { Rupiah, TanggalISO, WaktuISO } from './umum';

export type KategoriKomoditas = 'sayuran_daun' | 'sayuran_buah' | 'tanaman_pangan';
export type JenisLahan = 'sawah' | 'kebun' | 'pekarangan' | 'hidroponik';

export interface Komoditas {
  id: string;
  nama: string;
  kategori: KategoriKomoditas;
  jenis_lahan_cocok: JenisLahan[];
  satuan_panen: string;
  umur_panen_hari: number;
  /** Ada resep yang boleh dilihat pengguna ini (D-12) → "tersedia"; selain itu "segera_hadir". */
  status_resep: 'tersedia' | 'segera_hadir';
  /** Pesanan terbuka dalam radius pengguna (0 bila bukan petani). */
  jumlah_pesanan_sekitar: number;
}

export type DasarUkuran = 'luas' | 'polybag' | 'lubang';
export type TingkatModal = 'rendah' | 'sedang' | 'tinggi';

export interface MetodeTanam {
  id: string;
  nama: string;
  dasar_ukuran: DasarUkuran;
  modal_awal: TingkatModal;
  kebutuhan_lahan: string;
  frekuensi_perawatan: string;
  bisa_vertikultur: boolean;
}

export interface SistemHidroponik {
  id: string;
  nama: string;
  keterangan: string;
  liter_tandon_per_lubang: number;
  tempat_per_lubang_m2: number;
}

export interface KonversiSatuan {
  wilayah_id: string;
  satuan: 'ru' | 'bata';
  nilai_m2: number;
}

export type KategoriInput =
  | 'benih'
  | 'organik_padat'
  | 'organik_cair'
  | 'anorganik_tunggal'
  | 'anorganik_majemuk'
  | 'nutrisi_hidroponik'
  | 'pembenah_tanah'
  | 'bahan_lain';

export interface InputPertanian {
  id: string;
  nama: string;
  kategori: KategoriInput;
  kandungan: string | null;
  satuan: string;
}

export interface MerekInput {
  id: string;
  input_id: string;
  nama: string;
  produsen: string | null;
  isi_kemasan: number;
  teks_kemasan: string;
  nomor_pendaftaran: string | null;
}

/** Merek terurut menurut laporan terbaru (P0-34); promo tidak memengaruhi urutan. */
export interface RingkasanMerek {
  merek: MerekInput;
  harga_kemasan: Rupiah | null;
  harga_per_satuan: number | null;
  jumlah_pelapor: number;
  hari_lalu: number | null;
}

export interface LaporanHarga {
  id: string;
  merek_id: string;
  pelapor_id: string;
  harga_kemasan: Rupiah;
  kecamatan: string;
  tanggal: TanggalISO;
}

export interface KelayakanSubsidi {
  input_id: string;
  komoditas_id: string;
  berlaku_mulai: TanggalISO;
  berlaku_sampai: TanggalISO;
  het_per_satuan: Rupiah;
}

export interface Promo {
  id: string;
  pemasang: string;
  isi: string;
  wilayah_id: string;
  jarak_km: number | null;
  berlaku_mulai: TanggalISO;
  berlaku_sampai: TanggalISO;
}

/** Konfigurasi bisnis yang boleh dibaca frontend (D-01, D-02, D-03, D-13, D-29, D-30). */
export interface Konfigurasi {
  persen_uang_muka: number;
  persen_layanan: number;
  jam_periksa_rutin: number;
  jam_periksa_sekali_panen: number;
  hari_kabar_gagal_panen: number;
  radius_km: number;
  radius_maks_km: number;
  maks_durasi_rutin_hari: number;
  hari_kembali_uang_muka: number;
  laporan_harga_minimal: number;
  laporan_harga_rentang_hari: number;
  kontak_admin: { whatsapp: string; jam_layanan: string };
  batas_video_mb: number;
  batas_unduhan_offline_mb: number;
  versi_privasi: string;
  diperbarui_pada: WaktuISO;
}

// ---- masukan

export interface ParamKomoditas {
  jenis_lahan?: JenisLahan;
}
/** Laporan harga merek yang ada, atau "Merek lain, isi sendiri" (P0-34). */
export type LaporHargaMasukan =
  | { merek_id: string; harga_kemasan: Rupiah }
  | {
      merek_baru: { input_id: string; nama: string; isi_kemasan: number; teks_kemasan: string };
      harga_kemasan: Rupiah;
    };
