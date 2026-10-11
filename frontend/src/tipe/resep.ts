/**
 * Tipe domain resep dan referensi (Model Data PRD + keputusan.md). Nama kolom basis data
 * memakai snake_case; di TypeScript memakai camelCase dan dipetakan di lapisan API (T3.03).
 */

export type KategoriKomoditas = 'sayuran_daun' | 'sayuran_buah' | 'tanaman_pangan';
export type JenisLahan = 'sawah' | 'kebun' | 'pekarangan' | 'hidroponik';

export interface Komoditas {
  id: string;
  nama: string;
  kategori: KategoriKomoditas;
  jenisLahanCocok: JenisLahan[];
  /** Satuan panen, mis. "kg" atau "kg gabah". */
  satuanPanen: string;
  umurPanenHari: number;
  /** Harga jual contoh per satuan panen (D-38). */
  hargaJualContoh?: number;
}

/** Dasar ukuran metode: luas (bedengan, sawah), jumlah polybag, atau lubang tanam (hidroponik). */
export type DasarUkuran = 'luas' | 'polybag' | 'lubang';
export type TingkatModal = 'rendah' | 'sedang' | 'tinggi';

export interface MetodeTanam {
  id: string;
  nama: string;
  dasarUkuran: DasarUkuran;
  modalAwal: TingkatModal;
  bisaVertikultur: boolean;
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
  /** Kandungan, mis. "N 16%, P 16%, K 16%". */
  kandungan?: string;
  satuan: string;
}

/** Dasar dosis resep (PRD P0-07). `per_siklus` = jumlah tetap per siklus (tenaga, listrik, alat). */
export type DasarDosis = 'per_m2' | 'per_tanaman' | 'per_liter' | 'per_siklus';

export interface ResepInput {
  id: string;
  /** Rujukan ke input_pertanian; kosong untuk biaya seperti tenaga dan listrik. */
  inputId?: string;
  nama: string;
  /** Grup tampilan kalkulator, mis. "Pupuk dan pembenah tanah". */
  grup: string;
  dosis: number;
  satuanDosis: string;
  dasarDosis: DasarDosis;
  /** Satuan beli: satuan jumlah dan harga di kalkulator (kg, liter, bungkus, set, …). */
  satuanBeli: string;
  /**
   * Isi satu satuan beli dalam satuan dosis, bila tidak bisa dikonversi otomatis
   * (mis. 1 bungkus = 25 g). Kosong bila satuan dosis dan satuan beli bisa dikonversi (g → kg).
   */
  isiSatuanBeli?: number;
  /** Kelipatan pembelian dalam satuan beli (dibulatkan ke atas ke kelipatan ini). */
  ukuranKemasan: number;
  alatSekaliBeli: boolean;
  /** Harga contoh per satuan beli dari resep (CONTOH, bukan rekomendasi). */
  hargaContoh: number | null;
}

export type TipeTugas = 'sekali' | 'berulang' | 'ukur';

export interface BesaranUkur {
  /** Nama besaran, mis. "pH" atau "PPM". */
  nama: string;
  satuan: string;
  batasBawah: number;
  batasAtas: number;
  /** Skala sah nilai yang diisi (pH 0–14, PPM minimal 0); null = tanpa batas atas. */
  skalaMin: number;
  skalaMaks: number | null;
  saranTerlaluRendah: string;
  saranTerlaluTinggi: string;
}

export interface ResepTugas {
  id: string;
  tipe: TipeTugas;
  judul: string;
  /** Hari setelah tanam (tugas sekali) atau awal rentang (berulang, ukur). */
  hstMulai: number;
  /** Akhir rentang untuk tugas berulang dan ukur. */
  hstSelesai?: number;
  /** Jarak hari antar kemunculan untuk tugas berulang dan ukur. */
  interval?: number;
  /** Besaran yang diukur, hanya untuk tipe `ukur`. */
  ukur?: BesaranUkur[];
  bolehDigeser: boolean;
  saranTerlambat?: string;
  caraMengerjakan?: string[];
}

export type StatusResep = 'draf' | 'divalidasi';

/** Asal angka resep contoh: diturunkan dari desain, atau dikarang untuk demo (D-34). */
export type AsalAngkaContoh = 'desain' | 'dikarang';

export interface ResepTanam {
  id: string;
  komoditasId: string;
  metodeId: string;
  versi: number;
  status: StatusResep;
  /** Resep contoh untuk demo (D-11, D-12): selalu berlabel "CONTOH, belum divalidasi penyuluh". */
  contoh: boolean;
  /** Untuk resep contoh: apakah dosis dan harga berasal dari desain atau dikarang (D-34). */
  asalAngkaContoh: AsalAngkaContoh | null;
  validator: string | null;
  tanggalValidasi: string | null;
  /** Hasil panen per satuan ukuran (kg per m², per lubang, atau per polybag). */
  hasilPerSatuan: number;
  umurPanenHari: number;
  standarKualitas: string[];
  /** Jumlah pengisian ulang larutan dalam satu siklus (hidroponik), untuk dosis per liter. */
  jumlahPengisianLarutan?: number;
  /** Persen hasil saat panen jelek (mis. 70) dan alasan umumnya, untuk skenario kalkulator (D-38). */
  persenPanenJelek?: number;
  alasanPanenJelek?: string;
  input: ResepInput[];
  tugas: ResepTugas[];
}

export interface KelayakanSubsidi {
  inputId: string;
  komoditasId: string;
  berlakuMulai: string;
  berlakuSampai: string;
  /** Harga eceran tertinggi subsidi per satuan beli (contoh). */
  hetPerSatuan: number;
}

export interface MerekInput {
  id: string;
  inputId: string;
  nama: string;
  /** Isi kemasan dalam satuan beli input, mis. 25 (kg). */
  isiKemasan: number;
  teksKemasan: string;
  nomorPendaftaran?: string;
}

export interface LaporanHarga {
  id: string;
  merekId: string;
  hargaKemasan: number;
  kecamatan: string;
  tanggal: string;
  pelaporId: string;
}
