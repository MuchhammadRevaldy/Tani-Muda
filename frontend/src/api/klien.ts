/**
 * Antarmuka klien API (D-20). Satu metode per endpoint di docs/kontrak-api.md bagian 3. Halaman hanya
 * memakai antarmuka ini lewat hook di src/api/kueri/; implementasinya tiruan (Tahap 3) atau HTTP
 * (Tahap 6). Setiap metode mengembalikan isi `data` respons, atau melempar `GalatApi`.
 */
import type {
  AkhiriSiklusHasil,
  AkhiriSiklusMasukan,
  Akun,
  AlokasiPesanan,
  AmbilPesananHasil,
  AmbilPesananMasukan,
  UbahAlokasiMasukan,
  BatalkanPesananHasil,
  BayarUangMukaMasukan,
  Berkas,
  BuatPesananMasukan,
  BuatSiklusMasukan,
  CatatanPetani,
  EntriJurnal,
  Halaman,
  HasilPengukuran,
  JurnalMasukan,
  KelayakanSubsidi,
  KirimOtpHasil,
  KirimOtpMasukan,
  Komoditas,
  Konfigurasi,
  KonfirmasiKirimanHasil,
  KonfirmasiKirimanMasukan,
  KonversiSatuan,
  Lahan,
  LahanMasukan,
  LanggananPush,
  LaporanHarga,
  LaporGagalPanenHasil,
  LaporGagalPanenMasukan,
  LaporHargaMasukan,
  MetodeTanam,
  MintaResepHasil,
  MintaResepMasukan,
  Modul,
  ParamHalaman,
  ParamKomoditas,
  ParamModul,
  ParamPesananSekitar,
  ParamResep,
  ParamSengketa,
  ParamWilayah,
  PembeliUntukAdmin,
  Pembayaran,
  Pengeluaran,
  PengeluaranMasukan,
  PengaturanPengingat,
  GantiNomorHpMasukan,
  ContohPublik,
  PengaturanPengingatMasukan,
  Pengiriman,
  PengukuranHasil,
  PengukuranMasukan,
  PermintaanResep,
  Pesanan,
  PesananDenganKebun,
  PesananUntukPetani,
  PetaniUntukAdmin,
  PetaniRingkasAdmin,
  ParamPetaniAdmin,
  PilihPeranMasukan,
  ProfilPembeli,
  ProfilPembeliMasukan,
  Promo,
  PutuskanSengketaMasukan,
  Rating,
  RatingMasukan,
  ResepTanam,
  RingkasanMerek,
  RingkasanPermintaanResep,
  RingkasanRating,
  SelesaikanTugasMasukan,
  SengketaUntukAdmin,
  SiklusDetail,
  SiklusTanam,
  SimpanResepMasukan,
  SistemHidroponik,
  Tugas,
  TundaTugasHasil,
  TundaTugasMasukan,
  TulisCatatanMasukan,
  UbahProfilMasukan,
  UbahStatusPetaniMasukan,
  UnggahBerkasMasukan,
  VerifikasiOtpHasil,
  VerifikasiOtpMasukan,
  VerifikasiPembeliMasukan,
  Wilayah,
} from './tipe';

export interface KlienAkun {
  /** POST /auth/otp/kirim */
  kirimOtp(m: KirimOtpMasukan): Promise<KirimOtpHasil>;
  /** POST /auth/otp/verifikasi */
  verifikasiOtp(m: VerifikasiOtpMasukan): Promise<VerifikasiOtpHasil>;
  /** POST /auth/keluar */
  keluar(): Promise<void>;
  /** GET /akun — null bila belum masuk (respons 401 diterjemahkan menjadi null). */
  ambil(): Promise<Akun | null>;
  /** PUT /akun/peran */
  pilihPeran(m: PilihPeranMasukan): Promise<Akun>;
  /** PATCH /akun */
  ubahProfil(m: UbahProfilMasukan): Promise<Akun>;
  /** POST /akun/nomor-hp/otp — kirim kode ke nomor baru sebelum ganti nomor (T4.36). */
  kirimOtpNomorBaru(m: KirimOtpMasukan): Promise<KirimOtpHasil>;
  /** PUT /akun/nomor-hp — ganti nomor setelah kode dari nomor baru cocok. */
  gantiNomorHp(m: GantiNomorHpMasukan): Promise<Akun>;
  /** GET /akun/catatan — catatan petani untuk dirinya (D-03). */
  catatanSaya(): Promise<CatatanPetani[]>;
  /** PUT /akun/profil-pembeli */
  simpanProfilPembeli(m: ProfilPembeliMasukan): Promise<ProfilPembeli>;
  /** GET /akun/level (PRD Tambahan F-03, D-64). */
  level(): Promise<import('./tipe').LevelPengguna>;
  /** POST /akun/setuju-ai (PRD Tambahan F-04, D-64). */
  setujuAi(): Promise<{ setuju_ai_pada: string }>;
  /** PUT /akun/lokasi (PRD Tambahan F-08, D-64). */
  perbaruiLokasi(m: import('./tipe').PermintaanPerbaruiLokasi): Promise<Akun>;
}

export interface KlienWilayah {
  /** GET /wilayah */
  daftar(p?: ParamWilayah & ParamHalaman): Promise<Halaman<Wilayah>>;
  /** GET /wilayah/terdekat?lintang=&bujur= */
  terdekat(lintang: number, bujur: number): Promise<Wilayah & { jarak_km?: number }>;
  /** GET /wilayah/{id} */
  ambil(id: string): Promise<Wilayah>;
}

export interface KlienReferensi {
  /** GET /komoditas */
  komoditas(p?: ParamKomoditas): Promise<Komoditas[]>;
  /** GET /metode */
  metode(): Promise<MetodeTanam[]>;
  /** GET /sistem-hidroponik */
  sistemHidroponik(): Promise<SistemHidroponik[]>;
  /** GET /konversi-satuan?wilayah_id= */
  konversiSatuan(wilayahId: string): Promise<KonversiSatuan[]>;
  /** GET /konfigurasi */
  konfigurasi(): Promise<Konfigurasi>;
  /** GET /input/{id}/merek — terurut laporan terbaru di kecamatan pengguna. */
  merek(inputId: string): Promise<RingkasanMerek[]>;
  /** POST /laporan-harga */
  laporHarga(m: LaporHargaMasukan): Promise<LaporanHarga>;
  /** GET /promo — bagian "Promo dari toko tani", terpisah dari rekomendasi (P0-35). */
  promo(): Promise<Promo[]>;
  /** GET /kelayakan-subsidi?komoditas_id= */
  kelayakanSubsidi(komoditasId: string): Promise<KelayakanSubsidi[]>;
  /** GET /harga-sekitar?input_id= — rata-rata per satuan, null bila laporan kurang (P1-02). */
  hargaSekitar(
    inputId: string,
  ): Promise<{ input_id: string; harga_per_satuan: number | null; jumlah_laporan: number }>;
}

export interface KlienResep {
  /** GET /resep */
  daftar(p?: ParamResep): Promise<ResepTanam[]>;
  /** GET /resep/{id} */
  ambil(id: string): Promise<ResepTanam>;
  /** POST /permintaan-resep */
  minta(m: MintaResepMasukan): Promise<MintaResepHasil>;
  /** GET /permintaan-resep/saya */
  permintaanSaya(): Promise<PermintaanResep[]>;
  /** GET /publik/contoh — tanpa masuk, untuk angka contoh di halaman depan (D-44). */
  contohPublik(): Promise<ContohPublik>;
}

export interface KlienLahan {
  /** GET /lahan */
  daftar(): Promise<Lahan[]>;
  /** POST /lahan */
  buat(m: LahanMasukan): Promise<Lahan>;
  /** PATCH /lahan/{id} */
  ubah(id: string, m: Partial<LahanMasukan>): Promise<Lahan>;
  /** DELETE /lahan/{id} */
  hapus(id: string): Promise<void>;
}

export interface KlienKebun {
  /** GET /siklus */
  daftarSiklus(p?: { status?: SiklusTanam['status'] }): Promise<SiklusTanam[]>;
  /** POST /siklus */
  buatSiklus(m: BuatSiklusMasukan): Promise<SiklusDetail>;
  /** GET /siklus/{id} */
  ambilSiklus(id: string): Promise<SiklusDetail>;
  /** PATCH /siklus/{id}/tanggal-tanam */
  ubahTanggalTanam(id: string, tanggalTanam: string): Promise<SiklusDetail>;
  /** POST /siklus/{id}/akhiri */
  akhiriSiklus(id: string, m: AkhiriSiklusMasukan): Promise<AkhiriSiklusHasil>;
  /** GET /siklus/{id}/tugas */
  daftarTugas(siklusId: string): Promise<Tugas[]>;
  /** GET /tugas/hari-ini — tugas hari ini dan terlambat dari semua siklus aktif (beranda). */
  tugasHariIni(): Promise<Tugas[]>;
  /** POST /tugas/{id}/selesai */
  selesaikanTugas(id: string, m: SelesaikanTugasMasukan): Promise<Tugas>;
  /** POST /tugas/{id}/tunda */
  tundaTugas(id: string, m: TundaTugasMasukan): Promise<TundaTugasHasil>;
  /** POST /tugas/{id}/pengukuran */
  catatPengukuran(id: string, m: PengukuranMasukan): Promise<PengukuranHasil>;
  /** GET /siklus/{id}/pengukuran */
  riwayatPengukuran(siklusId: string, besaran?: string): Promise<HasilPengukuran[]>;
  /** GET /siklus/{id}/pengeluaran */
  daftarPengeluaran(siklusId: string): Promise<Pengeluaran[]>;
  /** POST /siklus/{id}/pengeluaran */
  catatPengeluaran(siklusId: string, m: PengeluaranMasukan): Promise<Pengeluaran>;
  /** GET /siklus/{id}/jurnal */
  jurnal(siklusId: string): Promise<EntriJurnal[]>;
  /** POST /siklus/{id}/jurnal */
  tambahJurnal(siklusId: string, m: JurnalMasukan): Promise<EntriJurnal>;
  /** GET /siklus/{id}/pengingat */
  ambilPengingat(siklusId: string): Promise<PengaturanPengingat>;
  /** PUT /siklus/{id}/pengingat */
  ubahPengingat(siklusId: string, m: PengaturanPengingatMasukan): Promise<PengaturanPengingat>;
}

export interface KlienBelajar {
  /** GET /modul */
  daftarModul(p: ParamModul): Promise<Modul[]>;
  /** GET /modul/{id} */
  ambilModul(id: string): Promise<Modul>;
  /** POST /modul/{id}/selesai */
  tandaiSelesai(id: string): Promise<Modul>;
}

export interface KlienPesanan {
  /** GET /pesanan/sekitar */
  sekitar(p?: ParamPesananSekitar): Promise<Halaman<PesananUntukPetani>>;
  /** GET /pesanan/{id} (petani) */
  ambil(id: string): Promise<PesananUntukPetani>;
  /** POST /pesanan/{id}/ambil */
  ambilPesanan(id: string, m: AmbilPesananMasukan): Promise<AmbilPesananHasil>;
  /** PATCH /alokasi/{id} — ubah jumlah sebelum setuju (D-40) */
  ubahAlokasi(alokasiId: string, m: UbahAlokasiMasukan): Promise<AmbilPesananHasil>;
  /** POST /alokasi/{id}/setuju */
  setujuiKesepakatan(alokasiId: string): Promise<AlokasiPesanan>;
  /** GET /alokasi/saya */
  alokasiSaya(): Promise<AlokasiPesanan[]>;
  /** POST /alokasi/{id}/gagal-panen */
  laporGagalPanen(alokasiId: string, m: LaporGagalPanenMasukan): Promise<LaporGagalPanenHasil>;
}

export interface KlienKiriman {
  /** GET /kiriman/saya (petani) */
  saya(): Promise<Pengiriman[]>;
  /** GET /kiriman/{id} (petani atau pembeli terkait) */
  ambil(id: string): Promise<Pengiriman>;
  /** POST /kiriman/{id}/foto-kualitas */
  unggahFotoKualitas(id: string, foto: string): Promise<Pengiriman>;
  /** POST /kiriman/{id}/foto-timbangan — opsional; null menghapus (D-40) */
  unggahFotoTimbangan(id: string, foto: string | null): Promise<Pengiriman>;
  /** POST /kiriman/{id}/dikirim */
  tandaiDikirim(id: string): Promise<Pengiriman>;
  /** POST /kiriman/{id}/konfirmasi (pembeli) */
  konfirmasi(id: string, m: KonfirmasiKirimanMasukan): Promise<KonfirmasiKirimanHasil>;
  /** POST /kiriman/{id}/rating */
  beriRating(id: string, m: RatingMasukan): Promise<Rating>;
  /** GET /pengguna/{id}/rating */
  ringkasanRating(penggunaId: string): Promise<RingkasanRating>;
}

export interface KlienPembeli {
  /** GET /pembeli/pesanan — dasbor */
  pesananSaya(): Promise<PesananDenganKebun[]>;
  /** POST /pembeli/pesanan */
  buatPesanan(m: BuatPesananMasukan): Promise<Pesanan>;
  /** POST /pembeli/pesanan/{id}/bayar-uang-muka */
  bayarUangMuka(id: string, m: BayarUangMukaMasukan): Promise<Pembayaran[]>;
  /** POST /pembeli/pesanan/{id}/batalkan */
  batalkan(id: string): Promise<BatalkanPesananHasil>;
  /** GET /pembeli/pembayaran */
  pembayaran(p?: ParamHalaman): Promise<Halaman<Pembayaran>>;
}

export interface KlienAdmin {
  /** GET /admin/pembeli?status=menunggu */
  pembeliMenunggu(): Promise<PembeliUntukAdmin[]>;
  /** POST /admin/pembeli/{id}/verifikasi */
  verifikasiPembeli(penggunaId: string, m: VerifikasiPembeliMasukan): Promise<PembeliUntukAdmin>;
  /** GET /admin/sengketa */
  sengketa(p?: ParamSengketa): Promise<SengketaUntukAdmin[]>;
  /** POST /admin/sengketa/{id}/putuskan */
  putuskanSengketa(id: string, m: PutuskanSengketaMasukan): Promise<SengketaUntukAdmin>;
  /** GET /admin/petani?cari=&halaman= — daftar petani ringkas, cari nama atau desa (D-46, D-47). */
  daftarPetani(p?: ParamPetaniAdmin & ParamHalaman): Promise<Halaman<PetaniRingkasAdmin>>;
  /** GET /admin/petani/{id} */
  petani(petaniId: string): Promise<PetaniUntukAdmin>;
  /** POST /admin/petani/{id}/catatan */
  tulisCatatan(petaniId: string, m: TulisCatatanMasukan): Promise<CatatanPetani>;
  /** POST /admin/petani/{id}/status */
  ubahStatusPetani(petaniId: string, m: UbahStatusPetaniMasukan): Promise<PetaniUntukAdmin>;
}

export interface KlienMentor {
  /** GET /mentor/resep — semua versi, termasuk draf. */
  daftarResep(): Promise<ResepTanam[]>;
  /** POST /mentor/resep — selalu versi baru (K3). */
  simpanResep(m: SimpanResepMasukan): Promise<ResepTanam>;
  /** POST /mentor/resep/{id}/validasi */
  validasiResep(id: string): Promise<ResepTanam>;
  /** GET /mentor/permintaan-resep */
  ringkasanPermintaan(): Promise<RingkasanPermintaanResep[]>;
}

export interface KlienNotifikasi {
  /** POST /notifikasi/langganan */
  simpanLangganan(m: LanggananPush): Promise<void>;
  /** DELETE /notifikasi/langganan */
  hapusLangganan(endpoint: string): Promise<void>;
}

export interface KlienBerkas {
  /** POST /berkas — mengembalikan URL untuk ditampilkan. */
  unggah(m: UnggahBerkasMasukan): Promise<Berkas>;
}

export interface KlienDeteksi {
  /** POST /deteksi */
  deteksi(m: { foto_base64: string; catatan?: string; siklus_id?: string; tugas_id?: string }): Promise<import('./tipe').DeteksiTanaman>;
  /** GET /deteksi */
  riwayat(siklusId?: string): Promise<import('./tipe').DeteksiTanaman[]>;
}

export interface KlienChatbot {
  /** POST /chatbot */
  tanya(pesan: string, percakapanId?: string): Promise<import('./tipe').JawabanChatbot>;
  /** GET /chatbot/riwayat */
  riwayat(percakapanId?: string): Promise<import('./tipe').PesanObrolanBot[]>;
}

export interface KlienCuaca {
  /** GET /cuaca */
  ambil(): Promise<import('./tipe').DataCuaca>;
}

export interface KlienStok {
  /** GET /stok */
  daftar(): Promise<import('./tipe').StokRingkas[]>;
  /** POST /stok */
  buat(m: import('./tipe').PayloadBuatStok): Promise<import('./tipe').StokRingkas>;
  /** PATCH /stok/{id} */
  ubah(id: string, m: import('./tipe').PayloadUbahStok): Promise<import('./tipe').StokRingkas>;
  /** GET /stok/sekitar */
  sekitar(komoditas?: string, radiusKm?: number): Promise<import('./tipe').StokRingkas[]>;
  /** POST /stok/{id}/beli */
  beli(id: string, m: import('./tipe').PayloadBeliStok): Promise<import('./tipe').PesananStok>;
  /** GET /pesanan-stok/saya */
  pesananSaya(): Promise<import('./tipe').PesananStok[]>;
  /** POST /pesanan-stok/{id}/terima */
  terimaPesanan(id: string): Promise<import('./tipe').PesananStok>;
  /** POST /pesanan-stok/{id}/tolak */
  tolakPesanan(id: string, alasan?: string): Promise<import('./tipe').PesananStok>;
  /** POST /pesanan-stok/{id}/dikirim */
  kirimPesanan(id: string): Promise<import('./tipe').PesananStok>;
  /** POST /pesanan-stok/{id}/selesai */
  selesaiPesanan(id: string): Promise<import('./tipe').PesananStok>;
  /** POST /pesanan-stok/{id}/batalkan */
  batalkanPesanan(id: string, alasan?: string): Promise<import('./tipe').PesananStok>;
}

export interface KlienPeta {
  /** GET /peta/petani?lintang=&bujur=&radius_km=10|15 (PRD Tambahan F-08, D-64). */
  petaniSekitar(params?: import('./tipe').ParameterPetaPetani): Promise<import('./tipe').PetaniPeta[]>;
}

export interface KlienChat {
  /** GET /percakapan */
  daftar(): Promise<import('./tipe').Percakapan[]>;
  /** POST /percakapan */
  buka(m: import('./tipe').PermintaanBukaPercakapan): Promise<import('./tipe').PercakapanBukaHasil>;
  /** POST /percakapan/nomor */
  bukaLewatNomor(nomor_hp: string): Promise<import('./tipe').PercakapanBukaHasil>;
  /** GET /percakapan/permintaan */
  daftarPermintaan(): Promise<import('./tipe').DaftarPermintaanKontakHasil>;
  /** POST /percakapan/permintaan */
  kirimPermintaan(m: import('./tipe').PermintaanKirimKontak): Promise<import('./tipe').HasilKirimPermintaanKontak>;
  /** POST /percakapan/permintaan/{id}/terima */
  terimaPermintaan(id: string): Promise<import('./tipe').PercakapanBukaHasil>;
  /** POST /percakapan/permintaan/{id}/tolak */
  tolakPermintaan(id: string): Promise<{ status: string }>;
  /** GET /percakapan/{id}/pesan?setelah= */
  pesan(id: string, setelah?: string): Promise<import('./tipe').Pesan[]>;
  /** POST /percakapan/{id}/pesan */
  kirim(id: string, m: import('./tipe').PermintaanKirimPesan): Promise<import('./tipe').Pesan>;
  /** POST /percakapan/{id}/dibaca */
  tandaiDibaca(id: string): Promise<{ status: string; jumlah_dibaca: number }>;
  /** GET /percakapan/lencana */
  lencana(): Promise<import('./tipe').LencanaChat>;
}

export interface KlienHargaBerita {
  /** GET /harga-berita?komoditas_id= */
  daftar(komoditasId?: string): Promise<import('./tipe').HargaBeritaItem[]>;
}

export interface KlienApi {
  akun: KlienAkun;
  wilayah: KlienWilayah;
  referensi: KlienReferensi;
  resep: KlienResep;
  lahan: KlienLahan;
  kebun: KlienKebun;
  belajar: KlienBelajar;
  pesanan: KlienPesanan;
  kiriman: KlienKiriman;
  pembeli: KlienPembeli;
  admin: KlienAdmin;
  mentor: KlienMentor;
  notifikasi: KlienNotifikasi;
  berkas: KlienBerkas;
  deteksi: KlienDeteksi;
  chatbot: KlienChatbot;
  cuaca: KlienCuaca;
  stok: KlienStok;
  peta: KlienPeta;
  chat: KlienChat;
  hargaBerita: KlienHargaBerita;
}

/**
 * Kontrol khusus pengembangan, hanya ada pada klien tiruan di mode pengembangan (T4.01 pemilih akun
 * demo, panel "Kode uji"). Tidak pernah ada di build produksi.
 */
export interface KontrolPengembangan {
  /** Pengguna uji per peran dan keadaan, untuk pemilih akun demo. */
  penggunaUji(): { id: string; nama: string; peran: string; keterangan: string }[];
  masukSebagai(penggunaId: string): Promise<void>;
  /** Kode OTP uji terakhir untuk nomor ini (panel "Kode uji"). */
  kodeUji(nomorHp: string): string | null;
  /** Kembalikan semua data ke data contoh. */
  aturUlang(): Promise<void>;
}

export type SumberData = 'tiruan' | 'http';
