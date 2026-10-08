/** Resep tanam dan permintaan resep (kontrak 2.5). */
import type { DasarUkuran, Komoditas, MetodeTanam } from './referensi';
import type { Rupiah, TanggalISO, WaktuISO } from './umum';

export type DasarDosis = 'per_m2' | 'per_tanaman' | 'per_liter' | 'per_siklus';
export type TipeTugas = 'sekali' | 'berulang' | 'ukur';
export type StatusResep = 'draf' | 'divalidasi';
export type AsalAngkaContoh = 'desain' | 'dikarang';

export interface ResepInput {
  id: string;
  input_id: string | null;
  nama: string;
  grup: string;
  dosis: number;
  satuan_dosis: string;
  dasar_dosis: DasarDosis;
  satuan_beli: string;
  isi_satuan_beli: number | null;
  ukuran_kemasan: number;
  alat_sekali_beli: boolean;
  harga_contoh: Rupiah | null;
}

export interface BesaranUkur {
  nama: string;
  satuan: string;
  batas_bawah: number;
  batas_atas: number;
  skala_min: number;
  skala_maks: number | null;
  saran_terlalu_rendah: string;
  saran_terlalu_tinggi: string;
}

export interface ResepTugas {
  id: string;
  tipe: TipeTugas;
  judul: string;
  hst_mulai: number;
  hst_selesai: number | null;
  interval: number | null;
  ukur: BesaranUkur[] | null;
  boleh_digeser: boolean;
  saran_terlambat: string | null;
  cara_mengerjakan: string[] | null;
}

export interface ResepTanam {
  id: string;
  komoditas_id: string;
  metode_id: string;
  versi: number;
  status: StatusResep;
  /** Resep contoh: wajib berlabel "CONTOH, belum divalidasi penyuluh" (D-11, D-12). */
  contoh: boolean;
  asal_angka_contoh: AsalAngkaContoh | null;
  validator: string | null;
  tanggal_validasi: TanggalISO | null;
  hasil_per_satuan: number;
  dasar_ukuran: DasarUkuran;
  umur_panen_hari: number;
  jumlah_pengisian_larutan: number | null;
  /** Persen hasil saat panen jelek (0–100) dan alasan umumnya, diisi penyuluh (D-38). */
  persen_panen_jelek: number | null;
  alasan_panen_jelek: string | null;
  standar_kualitas: string[];
  input: ResepInput[];
  tugas: ResepTugas[];
}

export interface PermintaanResep {
  id: string;
  pengguna_id: string;
  komoditas_id: string;
  metode_id: string | null;
  wilayah_id: string | null;
  dibuat_pada: WaktuISO;
}

/**
 * Contoh untuk halaman depan tanpa masuk (T4.32, D-44): komoditas, cara tanam, dan resep terbaru yang
 * terlihat publik. Angka modal dan titik impas dihitung frontend dari resep ini (D-08).
 */
export interface ContohPublik {
  komoditas: Komoditas[];
  metode: MetodeTanam[];
  resep: ResepTanam[];
}

// ---- masukan

export interface ParamResep {
  komoditas_id?: string;
  metode_id?: string;
}
export interface MintaResepMasukan {
  komoditas_id: string;
  metode_id?: string | null;
}
/** Hasil minta resep: `sudah_diminta` true bila permintaan yang sama sudah ada (tidak ganda). */
export interface MintaResepHasil {
  permintaan: PermintaanResep;
  sudah_diminta: boolean;
}
/** Mentor menyimpan resep: selalu menjadi versi baru (K3). */
export type SimpanResepMasukan = Omit<
  ResepTanam,
  'id' | 'versi' | 'status' | 'validator' | 'tanggal_validasi' | 'contoh' | 'asal_angka_contoh'
> & { resep_asal_id?: string | null };
