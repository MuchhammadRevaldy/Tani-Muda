/**
 * Bentuk data contoh (shared/data-contoh/*.json), yang juga dibaca seeder Laravel (T5.08). Tanggal
 * ditulis relatif terhadap hari ini supaya demo selalu segar:
 * - "H-13"       → tanggal 13 hari sebelum hari ini;
 * - "H+0T07:00"  → hari ini pukul 07.00 waktu pengguna (disimpan UTC setelah diselesaikan);
 * - "B+3"        → bulan ketiga dari bulan ini ("YYYY-MM");
 * - "J-1"        → satu jam sebelum data dibuat atau diatur ulang (adegan demo yang bergantung jam,
 *                  mis. kiriman yang sedang menunggu konfirmasi pembeli; D-47).
 */
import type {
  AlokasiTersimpan,
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
  PengirimanTersimpan,
  PermintaanResep,
  Pesanan,
  ProfilPembeli,
  Promo,
  Rating,
  RencanaItem,
  ResepTanam,
  Sengketa,
  SiklusTersimpan,
  SistemHidroponik,
  Tugas,
  Wilayah,
} from '../../tipe';

/** Baris wilayah tersimpan; `tersedia_pilot` dihitung saat dikirim (D-56). */
export interface WilayahContoh extends Omit<Wilayah, 'tersedia_pilot'> {
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
  siklus: SiklusTersimpan[];
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
  alokasi: AlokasiTersimpan[];
  pengiriman: PengirimanTersimpan[];
  pembayaran: Pembayaran[];
  rating: Rating[];
  sengketa: Sengketa[];
  permintaan_resep: PermintaanResep[];
}

export interface StokContoh {
  id: string;
  petani_id: string;
  komoditas_id: string;
  lahan_id: string | null;
  jumlah_kg: number;
  sisa_kg: number;
  harga_per_kg: number;
  tanggal_panen: string;
  foto: string | null;
  status: 'tersedia' | 'habis' | 'ditarik';
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface PercakapanContoh {
  id: string;
  jenis: 'alokasi' | 'pesanan_stok' | 'peta' | 'kontak';
  rujukan_id: string | null;
  petani_id: string;
  pembeli_id: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface PesanContoh {
  id: string;
  percakapan_id: string;
  pengirim_id: string;
  isi: string;
  dibaca_pada: string | null;
  kunci_idempoten: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface DataStok {
  stok: StokContoh[];
}

export interface DataChat {
  percakapan: PercakapanContoh[];
  pesan: PesanContoh[];
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
  stok: DataStok;
  chat: DataChat;
}
