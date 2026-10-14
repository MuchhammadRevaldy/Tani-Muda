export type StatusStok = 'tersedia' | 'habis' | 'ditarik';

export type StatusPesananStok = 'menunggu' | 'diterima' | 'dikirim' | 'selesai' | 'dibatalkan' | 'ditolak';

export type MetodeBayarStok = 'cod' | 'bayar_di_aplikasi';

export interface StokRingkas {
  id: string;
  petani_id: string;
  komoditas_id: string;
  komoditas?: {
    id: string;
    nama: string;
  } | null;
  lahan_id?: string | null;
  jumlah_kg: number;
  sisa_kg: number;
  harga_per_kg: number;
  tanggal_panen: string;
  foto?: string | null;
  status: StatusStok;
  dibuat_pada: string;
  // Metadata tambahan bila dari sekitar
  nama_petani?: string;
  desa?: string;
  kecamatan?: string;
  jarak_km?: number | null;
}

export interface PesananStok {
  id: string;
  pembeli_id: string;
  stok_id: string;
  petani_id: string;
  nama_petani?: string | null;
  nama_pembeli?: string | null;
  komoditas_nama?: string;
  jumlah_kg: number;
  harga_per_kg: number;
  nilai: number;
  metode_bayar: MetodeBayarStok;
  alamat_antar: string;
  status: StatusPesananStok;
  alasan_batal?: string | null;
  waktu_menunggu?: string | null;
  waktu_diterima?: string | null;
  waktu_dikirim?: string | null;
  waktu_selesai?: string | null;
  waktu_dibatalkan?: string | null;
  waktu_ditolak?: string | null;
  dibuat_pada: string;
}

export interface PayloadBuatStok {
  komoditas_id: string;
  jumlah_kg: number;
  harga_per_kg: number;
  tanggal_panen: string;
  lahan_id?: string | null;
  catatan?: string | null;
  foto?: string | null;
}

export interface PayloadUbahStok {
  harga_per_kg?: number;
  status?: StatusStok;
  foto?: string | null;
}

export interface PayloadBeliStok {
  jumlah_kg: number;
  metode_bayar: MetodeBayarStok;
  alamat_antar: string;
  kunci_idempoten?: string;
}
