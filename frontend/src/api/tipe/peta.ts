/**
 * Tipe data untuk F-08: Peta Petani di sekitar pembeli (D-64).
 */

export interface StokTersediaPeta {
  id: string;
  komoditas_id: string;
  komoditas_nama: string;
  sisa_kg: number;
  harga_per_kg: number;
  tanggal_panen: string | null;
  foto: string | null;
}

export interface PetaniPeta {
  id: string;
  nama: string;
  level: {
    level: number;
    ikon: string;
  };
  titik: {
    lintang: number;
    bujur: number;
  };
  jarak_km: number;
  stok_tersedia: StokTersediaPeta[];
}

export interface ParameterPetaPetani {
  lintang?: number;
  bujur?: number;
  radius_km?: 10 | 15;
}

export interface PermintaanPerbaruiLokasi {
  lintang?: number;
  bujur?: number;
  tampil_di_peta?: boolean;
}
