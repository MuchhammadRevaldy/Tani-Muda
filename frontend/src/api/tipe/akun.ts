/** Akun, pengguna, profil pembeli, catatan petani, wilayah (kontrak bagian 2.1–2.3). */
import type { WaktuISO } from './umum';

export type Peran = 'petani' | 'pembeli' | 'mentor' | 'admin';
export type StatusAkun = 'aktif' | 'dinonaktifkan_sementara';

export interface Pengguna {
  id: string;
  /** Nomor HP ternormalisasi "+62…". */
  nomor_hp: string;
  nama: string | null;
  /** Kosong sampai pengguna memilih peran setelah OTP pertama. */
  peran: Peran | null;
  /** Desa (kode wilayah Kemendagri). Wajib untuk petani. */
  wilayah_id: string | null;
  foto_profil: string | null;
  status_akun: StatusAkun;
  /** Zona waktu IANA, bawaan "Asia/Jakarta" (D-31). */
  zona_waktu: string;
  /** Petani menyatakan terdaftar di kelompok tani (dasar bawaan pilihan subsidi, D-38). */
  terdaftar_kelompok_tani: boolean;
  /** Waktu menyetujui kebijakan privasi (D-30). */
  setuju_privasi_pada: WaktuISO | null;
  versi_privasi: string | null;
  /** Waktu menyetujui fitur bantuan pintar AI (PRD Tambahan F-04, D-64). */
  setuju_ai_pada?: WaktuISO | null;
  dibuat_pada: WaktuISO;
}

export type JenisUsaha =
  'katering' | 'restoran' | 'warung' | 'koperasi' | 'penggilingan' | 'lainnya';
export type StatusVerifikasi = 'menunggu' | 'terverifikasi' | 'ditolak';

export interface ProfilPembeli {
  pengguna_id: string;
  nama_usaha: string;
  jenis_usaha: JenisUsaha;
  alamat: string;
  wilayah_id: string;
  foto_tempat_usaha: string | null;
  status_verifikasi: StatusVerifikasi;
  alasan_ditolak: string | null;
}

/** Pengguna yang sedang masuk beserta profil pembelinya (bila pembeli). */
export interface Akun {
  pengguna: Pengguna;
  profil_pembeli: ProfilPembeli | null;
}

export type JenisCatatanPetani = 'tidak_memberi_kabar' | 'lainnya';

export interface CatatanPetani {
  id: string;
  petani_id: string;
  jenis: JenisCatatanPetani;
  pengiriman_id: string | null;
  isi: string;
  dibuat_pada: WaktuISO;
}

export interface Wilayah {
  /** Kode wilayah Kemendagri "PP.KK.CC.DDDD" (D-27). */
  id: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  /** Titik tengah desa (perkiraan); null untuk desa di luar pilot (D-56). */
  lintang: number | null;
  bujur: number | null;
  /** Dihitung server: punya titik tengah, jadi bisa dipilih sebagai desa petani, lahan, atau titik antar. */
  tersedia_pilot: boolean;
}

// ---- masukan

export interface KirimOtpMasukan {
  nomor_hp: string;
}
export interface KirimOtpHasil {
  /** Nomor ternormalisasi tujuan kode. */
  nomor_hp: string;
  kirim_ulang_dalam_detik: number;
  kedaluwarsa_dalam_detik: number;
}
export interface VerifikasiOtpMasukan {
  nomor_hp: string;
  kode: string;
  /** Wajib true untuk pengguna baru (D-30). */
  setuju_privasi?: boolean;
}
export interface VerifikasiOtpHasil {
  akun: Akun;
  /** Pengguna baru: belum memilih peran. */
  pengguna_baru: boolean;
}
export interface PilihPeranMasukan {
  peran: Exclude<Peran, 'admin'>;
  nama: string;
  /** Wajib untuk petani. */
  wilayah_id?: string | null;
}
export interface UbahProfilMasukan {
  nama?: string;
  wilayah_id?: string;
  zona_waktu?: string;
  terdaftar_kelompok_tani?: boolean;
  /** URL berkas hasil unggah. */
  foto_profil?: string | null;
}
/** Ganti nomor HP: kode dikirim ke nomor baru dan wajib dicocokkan (T4.36). */
export interface GantiNomorHpMasukan {
  nomor_hp: string;
  kode: string;
}
export interface ProfilPembeliMasukan {
  nama_usaha: string;
  jenis_usaha: JenisUsaha;
  alamat: string;
  wilayah_id: string;
  foto_tempat_usaha?: string | null;
}
export interface ParamWilayah {
  cari?: string;
}

export interface LencanaDiraih {
  kode: string;
  nama: string;
  diraih_pada: WaktuISO;
  baru: boolean;
}

export interface LencanaTerkunci {
  kode: string;
  nama: string;
  syarat: string;
  kemajuan: string;
}

export interface LevelPengguna {
  poin: number;
  level: string;
  ikon: string;
  level_berikutnya: string | null;
  ikon_berikutnya: string | null;
  poin_ke_berikutnya: number;
  persen_kemajuan: number;
  lencana: LencanaDiraih[];
  lencana_terkunci: LencanaTerkunci[];
}
