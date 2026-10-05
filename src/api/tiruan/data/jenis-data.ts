/**
 * Bentuk data contoh (src/api/tiruan/data/*.json). Kelak dipindah ke shared/data-contoh/ dan dibaca
 * seeder Laravel (T5.08). Tanggal ditulis relatif terhadap hari ini supaya demo selalu segar:
 * - "H-13"       → tanggal 13 hari sebelum hari ini;
 * - "H+0T07:00"  → hari ini pukul 07.00 waktu pengguna (disimpan UTC setelah diselesaikan);
 * - "B+3"        → bulan ketiga dari bulan ini ("YYYY-MM").
 */
import type {
  AlokasiPesanan,
  CatatanPetani,
  EntriJurnal,
  HasilPengukuran,
  InputPertanian,
  KelayakanSubsidi,
  Komoditas,
  Konfigurasi,
  KonversiSatuan,
  Lahan,
  LaporanHarga,
  MerekInput,
  MetodeTanam,
  Modul,
  Pembayaran,
  Pengeluaran,
  PengaturanPengingat,
  Pengguna,
  Pengiriman,
  PermintaanResep,
  Pesanan,
  ProfilPembeli,
  Promo,
  Rating,
  RencanaItem,
  ResepTanam,
  Sengketa,
  SiklusTanam,
  SistemHidroponik,
  Tugas,
  Wilayah,
} from '../../tipe';

export interface WilayahContoh extends Wilayah {
  /** Kode Kemendagri sudah dicek ke sumber resmi (D-27); koordinat selalu perkiraan. */
  kode_terverifikasi: boolean;
}

export interface PenggunaUji {
  pengguna_id: string;
  keterangan: string;
}

export interface ProgresModulContoh {
  pengguna_id: string;
  modul_id: string;
  selesai_pada: string;
}

export interface DataReferensi {
  komoditas: Omit<Komoditas, 'status_resep' | 'jumlah_pesanan_sekitar'>[];
  metode: MetodeTanam[];
  sistem_hidroponik: SistemHidroponik[];
  konversi_satuan: KonversiSatuan[];
  input_pertanian: InputPertanian[];
  merek_input: MerekInput[];
  laporan_harga: LaporanHarga[];
  kelayakan_subsidi: KelayakanSubsidi[];
  promo: Promo[];
}

export interface DataPengguna {
  pengguna: Pengguna[];
  profil_pembeli: ProfilPembeli[];
  catatan_petani: CatatanPetani[];
  /** Pengguna uji per peran dan keadaan (T3.08), untuk pemilih akun demo. */
  pengguna_uji: PenggunaUji[];
}

export interface DataKebun {
  lahan: Omit<Lahan, 'kapasitas'>[];
  siklus: Omit<SiklusTanam, 'resep_contoh'>[];
  rencana_item: RencanaItem[];
  tugas: Tugas[];
  hasil_pengukuran: HasilPengukuran[];
  pengeluaran: Pengeluaran[];
  jurnal: EntriJurnal[];
  pengaturan_pengingat: PengaturanPengingat[];
  progres_modul: ProgresModulContoh[];
}

export interface DataPesanan {
  pesanan: Pesanan[];
  alokasi: AlokasiPesanan[];
  pengiriman: Pengiriman[];
  pembayaran: Pembayaran[];
  rating: Rating[];
  sengketa: Sengketa[];
  permintaan_resep: PermintaanResep[];
}

export interface DataContoh {
  /** Naikkan bila bentuk data berubah; data tersimpan versi lama diganti data contoh baru. */
  versi: number;
  konfigurasi: Konfigurasi;
  wilayah: WilayahContoh[];
  referensi: DataReferensi;
  resep: ResepTanam[];
  modul: Omit<Modul, 'selesai' | 'selesai_pada'>[];
  pengguna: DataPengguna;
  kebun: DataKebun;
  pesanan: DataPesanan;
}
