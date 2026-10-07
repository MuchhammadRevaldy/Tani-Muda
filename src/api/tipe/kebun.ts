/** Lahan, siklus tanam, tugas, pengukuran, pengeluaran, jurnal, pengingat (kontrak 2.6–2.7). */
import type { StatusAlokasi } from './pesanan';
import type { JenisLahan } from './referensi';
import type { BesaranUkur, TipeTugas } from './resep';
import type { DenganKunciIdempoten, Rupiah, TanggalISO, WaktuISO } from './umum';

export interface KapasitasLahan {
  satuan: 'm2' | 'lubang';
  total: number;
  dipakai: number;
  sisa: number;
}

/** Lahan milik petani. Titik koordinat hanya untuk pemilik dan admin (D-06). */
export interface Lahan {
  id: string;
  petani_id: string;
  nama: string;
  jenis_lahan: JenisLahan;
  luas_m2: number;
  satuan_asli: string;
  nilai_asli: number;
  wilayah_id: string;
  lintang: number | null;
  bujur: number | null;
  kapasitas_lubang: number | null;
  /** Dihitung server dari siklus yang memakai lahan (D-15, D-34). */
  kapasitas: KapasitasLahan;
}

export type StatusSiklus = 'rencana' | 'aktif' | 'selesai';

export interface SiklusTanam {
  id: string;
  petani_id: string;
  lahan_id: string;
  resep_id: string;
  resep_versi: number;
  komoditas_id: string;
  metode_id: string;
  status: StatusSiklus;
  luas_m2: number | null;
  jumlah_lubang: number | null;
  jumlah_polybag: number | null;
  volume_tandon_liter: number | null;
  sistem_hidroponik: string | null;
  vertikultur: boolean;
  satuan_asli: string;
  nilai_asli: number;
  tanggal_tanam: TanggalISO | null;
  dapat_subsidi: boolean;
  harga_jual: Rupiah;
  perkiraan_panen_kg: number;
  alokasi_pesanan_id: string | null;
  /** Petak pesanan rutin: kiriman ke-n yang dipenuhi petak ini (D-40); null untuk siklus lain. */
  petak_ke: number | null;
  /** Untuk resep contoh, label "CONTOH" wajib terlihat di setiap angka resep (D-12). */
  resep_contoh: boolean;
  /** Dihitung server: pesanan yang dipenuhi siklus ini, untuk mengelompokkan petak (D-40). */
  kelompok_pesanan: KelompokPesananSiklus | null;
  pendapatan_nyata: Rupiah | null;
  dibuat_pada: WaktuISO;
}

/** Pesanan yang dipenuhi sebuah siklus; petak-petak satu alokasi tampil berkelompok (D-40). */
export interface KelompokPesananSiklus {
  alokasi_id: string;
  pesanan_id: string;
  nama_pembeli: string;
  /** Jumlah petak (siklus) di alokasi ini; 1 untuk pesanan sekali panen. */
  jumlah_petak: number;
  status_alokasi: StatusAlokasi;
  /** Tanggal kiriman yang dipenuhi petak ini (pesanan rutin); null untuk sekali panen. */
  tanggal_kirim: TanggalISO | null;
}

/** Baris siklus seperti tersimpan di basis data (tanpa kolom yang dihitung server). */
export type SiklusTersimpan = Omit<SiklusTanam, 'resep_contoh' | 'kelompok_pesanan'>;

export interface RencanaItem {
  id: string;
  siklus_id: string;
  resep_input_id: string | null;
  input_id: string | null;
  merek_id: string | null;
  nama: string;
  grup: string;
  jumlah: number;
  satuan: string;
  harga_satuan: number | null;
  asal: 'resep' | 'tambahan';
  alat_sekali_beli: boolean;
  jumlah_siklus_pembagian: number;
}

/** Ringkasan modal dihitung server dengan rumus src/lib/modal.ts (D-08). */
export interface RingkasanModalSiklus {
  total_bahan: Rupiah;
  total_alat: Rupiah;
  biaya_alat_per_siklus: Rupiah;
  total_modal: Rupiah;
  lengkap: boolean;
  /** Pengeluaran nyata yang sudah dicatat. */
  sudah_keluar: Rupiah;
}

export interface SiklusDetail extends SiklusTanam {
  rencana_item: RencanaItem[];
  modal: RingkasanModalSiklus;
  /** Hari ke-n dari tanggal tanam menurut zona pengguna; null bila belum tanam. */
  hari_ke: number | null;
  perkiraan_tanggal_panen: TanggalISO | null;
}

export type StatusTugas = 'belum' | 'selesai';

export interface Tugas {
  id: string;
  siklus_id: string;
  resep_tugas_id: string;
  tipe: TipeTugas;
  judul: string;
  tanggal: TanggalISO;
  hst: number;
  status: StatusTugas;
  selesai_pada: WaktuISO | null;
  boleh_digeser: boolean;
  interval: number | null;
  ukur: BesaranUkur[] | null;
  foto: string | null;
  catatan: string | null;
}

export type StatusPengukuran = 'normal' | 'terlalu-rendah' | 'terlalu-tinggi' | 'kosong';

export interface HasilPengukuran {
  id: string;
  tugas_id: string;
  siklus_id: string;
  besaran: string;
  nilai: number;
  status: StatusPengukuran;
  sumber: 'manual' | 'sensor';
  tanggal: TanggalISO;
  dicatat_pada: WaktuISO;
}

export interface Pengeluaran {
  id: string;
  siklus_id: string;
  rencana_item_id: string | null;
  nama: string;
  nominal: Rupiah;
  tanggal: TanggalISO;
  foto_nota: string | null;
}

export interface EntriJurnal {
  id: string;
  siklus_id: string;
  tanggal: TanggalISO;
  hari_ke: number;
  foto: string | null;
  catatan: string | null;
  tugas_id: string | null;
  judul_tugas: string | null;
}

export interface PengaturanPengingat {
  siklus_id: string;
  /** "HH:MM" waktu lokal pengguna, 05:00–07:00. */
  jam_pagi: string;
  pengingat_sore: boolean;
  tipe_aktif: Record<TipeTugas, boolean>;
}

// ---- masukan

export interface LahanMasukan {
  nama: string;
  jenis_lahan: JenisLahan;
  satuan_asli: 'm2' | 'ru' | 'bata' | 'hektare';
  nilai_asli: number;
  wilayah_id: string;
  lintang?: number | null;
  bujur?: number | null;
  kapasitas_lubang?: number | null;
}

export interface RencanaItemMasukan {
  resep_input_id?: string | null;
  input_id?: string | null;
  merek_id?: string | null;
  nama: string;
  grup: string;
  jumlah: number;
  satuan: string;
  harga_satuan: number | null;
  alat_sekali_beli: boolean;
}

export interface BuatSiklusMasukan {
  resep_id: string;
  lahan_id: string;
  /** Ukuran sesuai metode; luas sudah dalam m² (konversi di frontend dengan konversi-satuan.ts). */
  luas_m2?: number | null;
  jumlah_lubang?: number | null;
  jumlah_polybag?: number | null;
  volume_tandon_liter?: number | null;
  sistem_hidroponik?: string | null;
  vertikultur?: boolean;
  satuan_asli: string;
  nilai_asli: number;
  /** Boleh tanggal lampau untuk siklus pilot; kosong = rencana belum ditanam. */
  tanggal_tanam: TanggalISO | null;
  dapat_subsidi: boolean;
  harga_jual: Rupiah;
  bagi_alat: boolean;
  jumlah_siklus_pembagian: number;
  rencana_item: RencanaItemMasukan[];
}

export interface SelesaikanTugasMasukan extends DenganKunciIdempoten {
  foto?: string | null;
  catatan?: string | null;
}

export interface TundaTugasMasukan {
  hari: number;
  /** Wajib true bila penundaan melewati perkiraan panen (P0-15). */
  konfirmasi?: boolean;
}
export interface TundaTugasHasil {
  diterapkan: boolean;
  perlu_konfirmasi: boolean;
  tugas: Tugas[];
}

export interface PengukuranMasukan extends DenganKunciIdempoten {
  nilai: { besaran: string; nilai: number }[];
  sumber?: 'manual' | 'sensor';
}
export interface PengukuranHasil {
  hasil: HasilPengukuran[];
  /** Tugas "Ukur ulang" besok bila ada nilai di luar rentang (P0-37). */
  tugas_ukur_ulang: Tugas | null;
  tugas: Tugas;
}

export interface PengeluaranMasukan extends DenganKunciIdempoten {
  rencana_item_id?: string | null;
  nama: string;
  nominal: Rupiah;
  tanggal: TanggalISO;
  foto_nota?: string | null;
}

export interface JurnalMasukan {
  tanggal: TanggalISO;
  foto?: string | null;
  catatan?: string | null;
}

export type PengaturanPengingatMasukan = Omit<PengaturanPengingat, 'siklus_id'>;

export interface AkhiriSiklusMasukan {
  pendapatan_nyata: Rupiah;
}
export interface AkhiriSiklusHasil {
  siklus: SiklusDetail;
  /** Untung sebenarnya = pendapatan nyata − pengeluaran nyata (P0-18). */
  untung_sebenarnya: Rupiah;
  untung_rencana: Rupiah;
}
