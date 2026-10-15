/**
 * Tipe data untuk F-09: Chat petani dan pembeli (D-64).
 */
import type { Peran } from './akun';

export type JenisPercakapan = 'alokasi' | 'pesanan_stok' | 'peta' | 'kontak';

export interface LawanBicara {
  id: string;
  nama: string;
  peran?: Peran | string | null;
  foto_profil?: string | null;
}

export interface PesanRingkas {
  id: string;
  isi: string;
  pengirim_id: string;
  dibaca_pada?: string | null;
  dibuat_pada: string;
}

export interface Percakapan {
  id: string;
  jenis: JenisPercakapan;
  rujukan_id?: string | null;
  lawan_bicara: LawanBicara;
  pesan_terakhir?: PesanRingkas | null;
  jumlah_belum_dibaca: number;
  dibuat_pada: string;
}

export interface PercakapanBukaHasil {
  id: string;
  jenis: JenisPercakapan;
  rujukan_id?: string | null;
  lawan_bicara: LawanBicara;
  dibuat_pada: string;
}

export interface Pesan {
  id: string;
  percakapan_id: string;
  pengirim_id: string;
  isi: string;
  dibaca_pada?: string | null;
  dibuat_pada: string;
}

export interface PermintaanBukaPercakapan {
  lawan_bicara_id?: string;
  jenis?: JenisPercakapan;
  rujukan_id?: string | null;
}

export interface PermintaanBukaPercakapanNomor {
  nomor_hp: string;
}

export interface PermintaanKirimPesan {
  isi: string;
  kunci_idempoten?: string;
}

export interface LencanaChat {
  belum_dibaca: number;
  permintaan_masuk?: number;
  total?: number;
}

export type StatusPermintaanKontak = 'menunggu' | 'diterima' | 'ditolak';

export interface PermintaanKontakItem {
  id: string;
  pemohon?: LawanBicara;
  target?: LawanBicara;
  nomor_hp?: string;
  pesan?: string | null;
  status: StatusPermintaanKontak;
  dibuat_pada: string;
}

export interface DaftarPermintaanKontakHasil {
  masuk: PermintaanKontakItem[];
  keluar: PermintaanKontakItem[];
}

export interface PermintaanKirimKontak {
  nomor_hp: string;
  pesan?: string;
}

export interface HasilKirimPermintaanKontak {
  status: 'menunggu' | 'diterima' | 'sudah_terhubung';
  id?: string;
  percakapan_id?: string;
  pesan: string;
  target?: LawanBicara;
  dibuat_pada?: string;
}

