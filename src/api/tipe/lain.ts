/** Admin, mentor, notifikasi, berkas (kontrak 2.12–2.14). */
import type {
  CatatanPetani,
  JenisCatatanPetani,
  Pengguna,
  ProfilPembeli,
  StatusAkun,
} from './akun';
import type { KeputusanSengketa, Pengiriman, Sengketa, StatusSengketa } from './pesanan';

export interface PembeliUntukAdmin extends ProfilPembeli {
  nama: string | null;
  nomor_hp: string;
}

export interface SengketaUntukAdmin extends Sengketa {
  pengiriman: Pengiriman;
  nama_petani: string;
  nama_pembeli: string;
}

/** Baris daftar petani di panel admin (T4.29, D-46): tanpa nomor HP dan titik lahan. */
export interface PetaniRingkasAdmin {
  id: string;
  nama: string | null;
  desa: string | null;
  status_akun: StatusAkun;
  jumlah_catatan: number;
  siklus_aktif: number;
}

export interface PetaniUntukAdmin {
  pengguna: Pengguna;
  catatan: CatatanPetani[];
}

export interface RingkasanPermintaanResep {
  komoditas_id: string;
  metode_id: string | null;
  kecamatan: string;
  jumlah: number;
}

export interface LanggananPush {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface Berkas {
  id: string;
  /** URL untuk menampilkan berkas (di backend: URL bertanda tangan berumur pendek). */
  url: string;
  jenis: string;
  ukuran_byte: number;
}

// ---- masukan

export interface VerifikasiPembeliMasukan {
  keputusan: 'terverifikasi' | 'ditolak';
  alasan?: string | null;
}
export interface PutuskanSengketaMasukan {
  keputusan: KeputusanSengketa;
  catatan?: string | null;
}
export interface ParamSengketa {
  status?: StatusSengketa;
}
export interface TulisCatatanMasukan {
  jenis: JenisCatatanPetani;
  isi: string;
  pengiriman_id?: string | null;
}
export interface UbahStatusPetaniMasukan {
  status_akun: StatusAkun;
}
export interface UnggahBerkasMasukan {
  nama: string;
  jenis: string;
  /** Isi berkas sebagai data URL (tiruan) atau Blob (HTTP). */
  isi: string | Blob;
}
