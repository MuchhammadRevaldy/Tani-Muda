# Kontrak API Tani Muda

Kontrak antara frontend React dan backend Laravel (D-19, D-20). Dokumen ini adalah **sumber bentuk data dan daftar endpoint**:

- tipe TypeScript di `src/api/tipe/` ditulis persis dari dokumen ini;
- klien tiruan (`src/api/tiruan/`) dan backend Laravel (Tahap 5) wajib berperilaku sama;
- rangkaian tes kontrak `src/api/kontrak.test-suite.ts` dijalankan terhadap keduanya.

Bila ada beda, dokumen ini yang berlaku. Perubahan kontrak dicatat di bagian Riwayat dan disetujui pemilik produk bila menyentuh perilaku.

---

## 1. Konvensi

### 1.1 Dasar

- Alamat dasar: **`/api/v1`**. Semua permintaan dan respons berupa JSON UTF-8, kecuali unggah berkas (`multipart/form-data` di HTTP).
- Nama kolom memakai **`snake_case`**, sama dengan Model Data PRD dan `keputusan.md`. Tidak ada pengubahan ke camelCase di lapisan API; pemetaan ke tipe domain `src/tipe` ada di `src/api/peta.ts`.
- ID berupa string. ID wilayah memakai **kode Kemendagri** `PP.KK.CC.DDDD`, mis. `32.17.01.2003` (D-27).

### 1.2 Respons sukses

```json
{ "data": { "id": "lahan-1", "nama": "Kebun belakang rumah" } }
```

`204 No Content` untuk aksi tanpa isi (keluar, hapus). Klien API membuka bungkus `data` dan mengembalikan isinya.

### 1.3 Paginasi

Daftar yang bisa panjang berhalaman. Parameter: `?halaman=1&per_halaman=20`; bawaan 20, maksimal 100. Nilai di luar batas dipotong ke batas terdekat.

```json
{
  "data": [ { "id": "pesanan-ratna-sawi" } ],
  "meta": { "halaman": 1, "per_halaman": 20, "total": 3, "halaman_terakhir": 1 }
}
```

Endpoint berhalaman ditandai **(berhalaman)** di bagian 3.

### 1.4 Galat

```json
{
  "galat": {
    "kode": "VALIDASI",
    "pesan": "Ada isian yang belum benar",
    "rincian": { "harga_kemasan": ["Harga tidak boleh kurang dari nol"] }
  }
}
```

- `kode`: stabil, dipakai frontend untuk memilih perilaku. Daftar lengkap di `src/lib/hasil.ts` (logika inti) dan `src/api/galat.ts` (khusus API).
- `pesan`: siap tampil, Bahasa Indonesia, menyebut apa yang harus dilakukan (D-09). Teksnya di `src/teks/galat.ts` dan `src/teks/galat-api.ts`; backend mengirim teks yang sama.
- `rincian`: galat per kolom (`nama_kolom` atau `nilai.pH` untuk isian bersarang). Kode logika inti yang berasal dari satu kolom juga diberi rincian kolom itu.
- `429` juga mengirim kolom `coba_lagi_dalam` (detik) di dalam `galat`.

| Status | Kode | Arti |
| --- | --- | --- |
| 401 | `BELUM_MASUK` | Belum masuk |
| 403 | `TIDAK_DIIZINKAN` | Peran tidak mengizinkan |
| 403 | `PERAN_BELUM_DIPILIH` | Pengguna baru belum memilih peran |
| 403 | `AKUN_NONAKTIF` | Petani dinonaktifkan sementara mencoba mengambil pesanan (D-13) |
| 403 | `BELUM_TERVERIFIKASI` | Pembeli belum terverifikasi memasang pesanan (P0-02) |
| 404 | `TIDAK_DITEMUKAN` | Tidak ada **atau milik pengguna lain** (D-22) |
| 409 | `MELEBIHI_PESANAN` | Total alokasi akan melebihi pesanan |
| 409 | `LAHAN_TIDAK_CUKUP` | Kapasitas lahan tidak cukup (D-15, D-34) |
| 409 | `JADWAL_TERLALU_DEKAT` | Tidak ada kiriman pesanan yang terkejar umur panen bila tanam hari ini (D-39) |
| 409 | `STATUS_TIDAK_SESUAI` | Langkah tidak berlaku pada status sekarang |
| 409 | `SUDAH_DINILAI` | Rating untuk kiriman ini sudah diberikan |
| 409 | `MELEBIHI_SALDO` | Pencairan melebihi dana yang ditahan |
| 409 | `BENTROK` | Data berubah di tempat lain |
| 422 | `VALIDASI` | Isian salah; lihat `rincian` |
| 422 | kode logika inti | mis. `LUAS_KOSONG`, `HARGA_NEGATIF`, `TUNDA_DI_LUAR_BATAS`, `KETERANGAN_WAJIB`, `NILAI_DI_LUAR_SKALA`, `NOMOR_HP_TIDAK_VALID`, `OTP_SALAH`, `OTP_KEDALUWARSA`, `FOTO_WAJIB` |
| 423 | `OTP_TERKUNCI` | Lima percobaan kode gagal |
| 429 | `TERLALU_SERING` | Kirim ulang OTP terlalu cepat atau terlalu banyak |
| 500 | `GALAT_SERVER` | Galat server |
| 503 | `SUMBER_BELUM_TERSEDIA` | Klien HTTP belum tersambung (hanya frontend sebelum Tahap 6) |

### 1.5 Tipe nilai

| Jenis | Bentuk | Contoh |
| --- | --- | --- |
| Uang | bilangan bulat rupiah | `430000` |
| Berat, luas | desimal | `13.32` |
| Tanggal kalender | `YYYY-MM-DD` tanpa jam | `"2026-10-05"` |
| Bulan | `YYYY-MM` | `"2026-12"` |
| Waktu | ISO 8601 **UTC** dengan `Z` (D-31) | `"2026-10-05T01:00:00.000Z"` |
| Jam lokal pengguna | `HH:MM` | `"06:00"` |
| Kosong | `null` (kolom tetap dikirim) | |

"Hari ini" dan tanggal tugas dihitung menurut **`pengguna.zona_waktu`** (bawaan `Asia/Jakarta`).

### 1.6 Autentikasi

- Aplikasi web memakai **cookie sesi Sanctum** (D-21). Klien memanggil `GET /sanctum/csrf-cookie` sebelum permintaan yang mengubah data, lalu mengirim cookie `XSRF-TOKEN` sebagai header `X-XSRF-TOKEN`.
- Aplikasi React Native kelak memakai token Sanctum (`Authorization: Bearer`). Endpoint dan bentuk datanya sama.
- Semua endpoint wajib masuk, kecuali: `POST /auth/otp/kirim`, `POST /auth/otp/verifikasi`, `GET /akun` (mengembalikan 401 bila belum masuk; klien menerjemahkannya menjadi `null`), dan `GET /konfigurasi`.

### 1.7 Kunci idempoten

Operasi uang dan operasi yang bisa diantrekan offline menerima **`kunci_idempoten`** (string unik, mis. UUID) di badan permintaan. Permintaan ulang dengan kunci dan endpoint yang sama mengembalikan hasil pertama tanpa mengulang efeknya. Endpoint bertanda **(idempoten)** di bagian 3 mewajibkan kunci ini.

### 1.8 Angka dihitung server

Server **tidak menerima angka uang dari klien** (D-08). Nilai pesanan, uang muka, biaya layanan, pembayaran per kiriman (80% pembeli + 20% dari saldo uang muka, D-02), dana cair, pengembalian, kapasitas lahan, jarak, dan perkiraan panen dihitung server dengan rumus yang sama dengan `src/lib`.

### 1.9 Resep contoh

Resep berstatus `draf` dengan `contoh = true` dikirim server apa adanya (selalu dengan `contoh: true`). Frontend menyaringnya keluar bila `VITE_TAMPILKAN_RESEP_CONTOH` tidak bernilai `true` (D-12). Basis data produksi tidak memuat resep contoh. Resep `draf` yang bukan contoh tidak pernah dikirim ke petani.

---

## 2. Bentuk data

Kolom bertanda † adalah tambahan di luar Model Data PRD; dasar keputusannya disebut di kolom Keterangan (lihat juga D-35).

### 2.1 `pengguna` (`Pengguna`)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | string | |
| `nomor_hp` | string | ternormalisasi `+62…` (`src/lib/nomor-hp.ts`) |
| `nama` | string \| null | null sampai memilih peran |
| `peran` | `petani` \| `pembeli` \| `mentor` \| `admin` \| null | admin tidak bisa dipilih sendiri |
| `wilayah_id` | string \| null | desa; wajib untuk petani |
| `foto_profil` | string \| null | URL berkas (D-06) |
| `status_akun` | `aktif` \| `dinonaktifkan_sementara` | D-13 |
| `zona_waktu`† | string | IANA, bawaan `Asia/Jakarta` (D-31) |
| `terdaftar_kelompok_tani`† | boolean | petani menyatakan terdaftar di kelompok tani; bawaan pilihan subsidi di kalkulator (D-38) |
| `setuju_privasi_pada`† | waktu \| null | D-30 |
| `versi_privasi`† | string \| null | D-30 |
| `dibuat_pada` | waktu | |

Tidak ada kolom kata sandi atau nama pengguna (D-04).

**`Akun`** = `{ pengguna: Pengguna, profil_pembeli: ProfilPembeli | null }`.

### 2.2 `profil_pembeli` (`ProfilPembeli`)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `pengguna_id` | string | |
| `nama_usaha` | string | |
| `jenis_usaha` | `katering` \| `restoran` \| `warung` \| `koperasi` \| `penggilingan` \| `lainnya` | |
| `alamat` | string | |
| `wilayah_id` | string | |
| `foto_tempat_usaha` | string \| null | |
| `status_verifikasi` | `menunggu` \| `terverifikasi` \| `ditolak` | |
| `alasan_ditolak`† | string \| null | wajib bila ditolak |

### 2.3 `catatan_petani` (`CatatanPetani`), `wilayah` (`Wilayah`)

| `catatan_petani` | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `petani_id` | string | |
| `jenis` | `tidak_memberi_kabar` \| `lainnya` | D-03 |
| `pengiriman_id` | string \| null | |
| `isi` | string | |
| `dibuat_pada` | waktu | |

| `wilayah` | Tipe | Keterangan |
| --- | --- | --- |
| `id` | string | kode Kemendagri (D-27) |
| `desa`, `kecamatan`, `kabupaten`, `provinsi` | string | |
| `lintang`, `bujur` | desimal | titik tengah desa; dasar jarak (D-06) |

### 2.4 Referensi

| `komoditas` (`Komoditas`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `nama` | string | |
| `kategori` | `sayuran_daun` \| `sayuran_buah` \| `tanaman_pangan` | |
| `jenis_lahan_cocok` | (`sawah` \| `kebun` \| `pekarangan` \| `hidroponik`)[] | |
| `satuan_panen` | string | `kg` atau `kg gabah` |
| `umur_panen_hari` | bilangan bulat | |
| `harga_jual_contoh`† | rupiah \| null | harga jual contoh per satuan panen untuk kalkulator (D-38) |
| `status_resep` | `tersedia` \| `segera_hadir` | dihitung per pengguna (D-12) |
| `jumlah_pesanan_sekitar` | bilangan bulat | pesanan terbuka dalam radius petani; 0 untuk peran lain |

| `metode_tanam` (`MetodeTanam`) | Tipe |
| --- | --- |
| `id`, `nama`, `kebutuhan_lahan`, `frekuensi_perawatan` | string |
| `dasar_ukuran` | `luas` \| `polybag` \| `lubang` |
| `modal_awal` | `rendah` \| `sedang` \| `tinggi` |
| `bisa_vertikultur` | boolean |

| `sistem_hidroponik`† (`SistemHidroponik`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `nama`, `keterangan` | string | sumbu, NFT, rakit apung (papan 14) |
| `liter_tandon_per_lubang`, `tempat_per_lubang_m2` | desimal | faktor saran tandon dan tempat |

| `konversi_satuan` (`KonversiSatuan`) | Tipe |
| --- | --- |
| `wilayah_id` | string |
| `satuan` | `ru` \| `bata` |
| `nilai_m2` | desimal |

| `input_pertanian` (`InputPertanian`) | Tipe |
| --- | --- |
| `id`, `nama`, `satuan` | string |
| `kategori` | `benih` \| `organik_padat` \| `organik_cair` \| `anorganik_tunggal` \| `anorganik_majemuk` \| `nutrisi_hidroponik` \| `pembenah_tanah` \| `bahan_lain` |
| `kandungan` | string \| null |

| `merek_input` (`MerekInput`) | Tipe |
| --- | --- |
| `id`, `input_id`, `nama`, `teks_kemasan` | string |
| `produsen`, `nomor_pendaftaran` | string \| null |
| `isi_kemasan` | desimal (satuan input) |

**`RingkasanMerek`** = `{ merek: MerekInput, harga_kemasan: rupiah | null, harga_per_satuan: desimal | null, jumlah_pelapor, hari_lalu: bilangan | null }`, terurut laporan terbaru, lalu jumlah pelapor, lalu nama (P0-34). Promo tidak memengaruhi urutan (P0-35).

| `laporan_harga` (`LaporanHarga`) | Tipe |
| --- | --- |
| `id`, `merek_id`, `pelapor_id`, `kecamatan` | string |
| `harga_kemasan` | rupiah |
| `tanggal` | tanggal |

| `kelayakan_subsidi` (`KelayakanSubsidi`) | Tipe |
| --- | --- |
| `input_id`, `komoditas_id` | string |
| `berlaku_mulai`, `berlaku_sampai` | tanggal |
| `het_per_satuan`† | rupiah (harga eceran tertinggi subsidi) |

| `promo` (`Promo`) | Tipe |
| --- | --- |
| `id`, `pemasang`, `isi`, `wilayah_id` | string |
| `jarak_km` | desimal \| null |
| `berlaku_mulai`, `berlaku_sampai` | tanggal |

**`konfigurasi`**† (`Konfigurasi`, D-28: diubah lewat seeder atau file konfigurasi yang tercatat di git):
`persen_uang_muka`, `persen_layanan`, `jam_periksa_rutin`, `jam_periksa_sekali_panen`, `hari_kabar_gagal_panen`, `radius_km`, `radius_maks_km`, `maks_durasi_rutin_hari`, `hari_kembali_uang_muka`, `laporan_harga_minimal`, `laporan_harga_rentang_hari`, `batas_video_mb`, `batas_unduhan_offline_mb` (angka); `kontak_admin: { whatsapp, jam_layanan }`; `versi_privasi` (string); `diperbarui_pada` (waktu).

### 2.5 Resep

| `resep_tanam` (`ResepTanam`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `komoditas_id`, `metode_id` | string | |
| `versi` | bilangan bulat | setiap simpan = baris baru (K3) |
| `status`† | `draf` \| `divalidasi` | D-11 |
| `contoh`† | boolean | D-11, D-12 |
| `asal_angka_contoh`† | `desain` \| `dikarang` \| null | D-34 |
| `validator` | string \| null | |
| `tanggal_validasi` | tanggal \| null | |
| `hasil_per_satuan` | desimal | kg per m², per lubang, atau per polybag |
| `dasar_ukuran`† | `luas` \| `polybag` \| `lubang` | dari metode |
| `umur_panen_hari` | bilangan bulat | |
| `jumlah_pengisian_larutan`† | bilangan \| null | hidroponik, untuk dosis per liter |
| `persen_panen_jelek`† | bilangan 1–100 \| null | persen hasil saat panen jelek, diisi penyuluh (D-38) |
| `alasan_panen_jelek`† | string \| null | alasan umum panen jelek (D-38) |
| `standar_kualitas` | string[] | |
| `input` | `ResepInput[]` | |
| `tugas` | `ResepTugas[]` | |

| `resep_input` (`ResepInput`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `nama`, `grup`, `satuan_dosis`, `satuan_beli` | string | |
| `input_id` | string \| null | kosong untuk tenaga dan listrik |
| `dosis` | desimal | |
| `dasar_dosis` | `per_m2` \| `per_tanaman` \| `per_liter` \| `per_siklus` | |
| `isi_satuan_beli`† | desimal \| null | mis. 25 g per bungkus |
| `ukuran_kemasan` | desimal | kelipatan beli |
| `alat_sekali_beli` | boolean | |
| `harga_contoh` | rupiah \| null | |

| `resep_tugas` (`ResepTugas`) | Tipe |
| --- | --- |
| `id`, `judul` | string |
| `tipe` | `sekali` \| `berulang` \| `ukur` |
| `hst_mulai` | bilangan bulat |
| `hst_selesai`, `interval` | bilangan \| null |
| `ukur` | `BesaranUkur[]` \| null |
| `boleh_digeser` | boolean |
| `saran_terlambat` | string \| null |
| `cara_mengerjakan`† | string[] \| null |

**`BesaranUkur`** = `{ nama, satuan, batas_bawah, batas_atas, skala_min†, skala_maks† (null = tanpa batas atas), saran_terlalu_rendah, saran_terlalu_tinggi }`. Skala sah: pH 0–14, PPM minimal 0 (D-34).

| `permintaan_resep` (`PermintaanResep`) | Tipe |
| --- | --- |
| `id`, `pengguna_id`, `komoditas_id` | string |
| `metode_id`, `wilayah_id` | string \| null |
| `dibuat_pada` | waktu |

### 2.6 Lahan dan siklus

| `lahan` (`Lahan`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `petani_id`, `nama`, `wilayah_id`, `satuan_asli` | string | |
| `jenis_lahan` | `sawah` \| `kebun` \| `pekarangan` \| `hidroponik` | |
| `luas_m2`, `nilai_asli` | desimal | nilai asli = angka yang diketik petani (D-06) |
| `lintang`, `bujur` | desimal \| null | **hanya untuk pemilik dan admin** (D-06) |
| `kapasitas_lubang` | bilangan \| null | wajib untuk hidroponik |
| `kapasitas` | `{ satuan: 'm2' \| 'lubang', total, dipakai, sisa }` | dihitung server (D-15, D-34) |

| `siklus_tanam` (`SiklusTanam`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `petani_id`, `lahan_id`, `resep_id`, `komoditas_id`, `metode_id`, `satuan_asli` | string | |
| `resep_versi` | bilangan bulat | versi saat dibuat (P0-04) |
| `status`† | `rencana` \| `aktif` \| `selesai` | |
| `luas_m2`, `jumlah_lubang`, `jumlah_polybag`†, `volume_tandon_liter`† | desimal \| null | sesuai metode (D-15) |
| `sistem_hidroponik` | string \| null | |
| `vertikultur` | boolean | |
| `nilai_asli` | desimal | |
| `tanggal_tanam` | tanggal \| null | null = rencana belum ditanam |
| `dapat_subsidi` | boolean | |
| `harga_jual` | rupiah | harga kesepakatan bila dari pesanan |
| `perkiraan_panen_kg` | desimal | |
| `alokasi_pesanan_id` | string \| null | rencana dengan alokasi ikut memakai lahan (D-34) |
| `resep_contoh`† | boolean | label "CONTOH, belum divalidasi penyuluh" wajib tampil (D-12) |
| `pendapatan_nyata`† | rupiah \| null | akhir siklus |
| `dibuat_pada` | waktu | |

**`SiklusDetail`** = `SiklusTanam` + `rencana_item: RencanaItem[]`, `modal: { total_bahan, total_alat, biaya_alat_per_siklus, total_modal, lengkap, sudah_keluar }`, `hari_ke: bilangan | null`, `perkiraan_tanggal_panen: tanggal | null`.

| `rencana_item` (`RencanaItem`) | Tipe |
| --- | --- |
| `id`, `siklus_id`, `nama`, `grup`, `satuan` | string |
| `resep_input_id`, `input_id`, `merek_id` | string \| null |
| `jumlah` | desimal |
| `harga_satuan` | desimal \| null ("Harga belum diisi") |
| `asal` | `resep` \| `tambahan` |
| `alat_sekali_beli` | boolean |
| `jumlah_siklus_pembagian` | bilangan bulat |

### 2.7 Tugas, pengukuran, pengeluaran, jurnal, pengingat

| `tugas` (`Tugas`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `siklus_id`, `resep_tugas_id`, `judul` | string | ID `siklus:pola@hst` |
| `tipe` | `sekali` \| `berulang` \| `ukur` | |
| `tanggal` | tanggal | |
| `hst` | bilangan bulat | |
| `status` | `belum` \| `selesai` | status "terlambat" tidak disimpan |
| `selesai_pada` | waktu \| null | |
| `boleh_digeser` | boolean | |
| `interval` | bilangan \| null | |
| `ukur` | `BesaranUkur[]` \| null | |
| `foto`, `catatan` | string \| null | |

| `hasil_pengukuran` (`HasilPengukuran`) | Tipe |
| --- | --- |
| `id`, `tugas_id`, `siklus_id`, `besaran` | string |
| `nilai` | desimal (0 sah, D-34) |
| `status` | `normal` \| `terlalu-rendah` \| `terlalu-tinggi` |
| `sumber` | `manual` \| `sensor` |
| `tanggal` | tanggal |
| `dicatat_pada` | waktu |

| `pengeluaran` (`Pengeluaran`) | Tipe |
| --- | --- |
| `id`, `siklus_id`, `nama` | string |
| `rencana_item_id`, `foto_nota` | string \| null |
| `nominal` | rupiah |
| `tanggal` | tanggal |

| `jurnal`† (`EntriJurnal`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `siklus_id` | string | |
| `tanggal` | tanggal | |
| `hari_ke` | bilangan bulat | |
| `foto`, `catatan`, `tugas_id`, `judul_tugas` | string \| null | foto tugas selesai otomatis masuk jurnal (P0-14) |

| `pengaturan_pengingat` (`PengaturanPengingat`) | Tipe |
| --- | --- |
| `siklus_id` | string |
| `jam_pagi` | `HH:MM`, 05:00–07:00 |
| `pengingat_sore` | boolean |
| `tipe_aktif` | `{ sekali, berulang, ukur }`: boolean |

### 2.8 Belajar

| `modul` (`Modul`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `komoditas_id`, `metode_id`, `tahap`, `judul`, `ringkasan` | string | |
| `menit`, `urutan` | bilangan bulat | |
| `video_url` | string \| null | MP4 360p; null = placeholder (D-29) |
| `ukuran_video_mb`† | desimal \| null | maks 15 MB |
| `selesai`, `selesai_pada` | boolean, waktu \| null | dari `progres_modul` pengguna yang masuk |

`progres_modul` (`pengguna_id`, `modul_id`, `selesai_pada`) tidak dikirim terpisah; tercermin di `selesai`.

### 2.9 Pesanan dan alokasi

| `pesanan` (`Pesanan`, dilihat pembelinya) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `pembeli_id`, `komoditas_id`, `wilayah_id`, `alamat_antar` | string | wilayah = desa titik antar |
| `jenis` | `rutin` \| `sekali_panen` | |
| `jumlah_per_kiriman_kg`, `frekuensi_hari` | desimal \| null | rutin |
| `jumlah_kiriman` | bilangan bulat | 1 untuk sekali panen |
| `jumlah_total_kg` | desimal | |
| `tanggal_mulai`, `tanggal_selesai` | tanggal \| null | rutin |
| `perkiraan_bulan_panen` | bulan \| null | sekali panen |
| `harga_per_kg` | rupiah | |
| `standar_kualitas` | string[] | |
| `patokan` | string \| null | |
| `status` | `menunggu_pembayaran` \| `mencari_petani` \| `berjalan` \| `selesai` \| `dibatalkan` | |
| `nilai_pesanan`, `uang_muka`, `biaya_layanan`, `saldo_uang_muka`† | rupiah | dihitung server |
| `terambil_kg`† | desimal | |
| `dibuat_pada` | waktu | |

**`PesananUntukPetani`** (dilihat petani; tanpa titik lahan, D-06): `id`, `jenis`, `komoditas_id`, `nama_pembeli`, `jenis_usaha`, `desa_antar`, `kecamatan_antar`, `titik_desa_antar: { lintang, bujur } | null`† (titik tengah desa dari tabel wilayah, untuk peta pembeli), `alamat_antar`†, `patokan`† (null kecuali petani punya alokasi aktif di pesanan ini, D-39), `jarak_km`, `jumlah_per_kiriman_kg`, `frekuensi_hari`, `jumlah_kiriman`, `jumlah_total_kg`, `sisa_kg`, `tanggal_mulai`, `perkiraan_bulan_panen`, `harga_per_kg`, `standar_kualitas`, `boleh_ambil_sebagian`, `uang_muka_diterima`, `rating_pembeli: { rata_rata, jumlah }`, `alokasi_saya: AlokasiPesanan | null`† (alokasi aktif petani pembaca), `dibuat_pada`† (lencana menu Pesanan, D-37).

| `alokasi_pesanan` (`AlokasiPesanan`) | Tipe |
| --- | --- |
| `id`, `pesanan_id`, `petani_id` | string |
| `siklus_id` | string \| null |
| `jumlah_kg` | desimal (per kiriman untuk rutin) |
| `status` | `menunggu_kesepakatan` \| `disepakati` \| `berjalan` \| `selesai` \| `gagal` \| `dibatalkan` |
| `disetujui_pada` | waktu \| null |
| `dibuat_pada` | waktu |

**`PesananDenganKebun`** (dasbor pembeli) = `Pesanan` + `kebun: KebunUntukPembeli[]`, `kiriman_berikutnya: Pengiriman | null`, `kiriman_menunggu: Pengiriman[]`. **`KebunUntukPembeli`** = `{ alokasi_id, nama_petani, desa, jarak_km, jumlah_kg, hari_ke, hari_panen, perkiraan_tanggal_panen, foto_terbaru }`, **tanpa titik lahan** (D-06).

### 2.10 Pengiriman, pembayaran

| `pengiriman` (`Pengiriman`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `alokasi_id`, `pesanan_id` | string | |
| `ke`† | bilangan bulat | urutan kiriman |
| `tanggal_jadwal` | tanggal | |
| `jumlah_kg` | desimal | |
| `harga_per_kg`† | rupiah | harga kesepakatan |
| `foto_kualitas` | string \| null | wajib sebelum dikirim |
| `status` | `terjadwal` \| `dikirim` \| `diterima` \| `ditolak_sebagian` \| `gagal`† | gagal = dilaporkan gagal panen (D-03) |
| `dikirim_pada`†, `batas_periksa_pada`†, `dikonfirmasi_pada`† | waktu \| null | batas: 6 jam rutin, 24 jam sekali panen (D-01) |
| `dianggap_diterima`† | boolean | konfirmasi otomatis |
| `jumlah_ditolak_kg` | desimal | |
| `alasan_penolakan` | `layu_atau_busuk` \| `jumlah_kurang` \| `tidak_sesuai_standar` \| `lainnya` \| null | D-06, D-14 |
| `keterangan_penolakan` | string \| null | wajib bila `lainnya` (D-14) |
| `foto_penolakan` | string \| null | |
| `nilai_diterima`† | rupiah \| null | dana cair untuk petani (P0-26) |

| `pembayaran` (`Pembayaran`) | Tipe | Keterangan |
| --- | --- | --- |
| `id`, `pesanan_id`, `referensi` | string | referensi tiruan diawali `TIRUAN-` |
| `pengiriman_id` | string \| null | |
| `jenis` | `uang_muka` \| `biaya_layanan` \| `kiriman` \| `pencairan`† \| `pengembalian`† \| `kompensasi`† | |
| `nominal` | rupiah | |
| `status` | `menunggu` \| `ditahan` \| `cair` \| `dikembalikan` \| `gagal` | |
| `mode_uji_coba`† | boolean | UI menampilkan "Mode uji coba" (D-10) |
| `dibuat_pada` | waktu | |

`pembayaran` hanya ditulis server. `kunci_idempoten` disimpan server, tidak dikirim.

### 2.11 Rating, sengketa

| `rating` (`Rating`) | Tipe |
| --- | --- |
| `id`, `pengiriman_id`, `pemberi_id`, `penerima_id` | string |
| `nilai` | bilangan bulat 1–5 |
| `komentar` | string \| null |
| `dibuat_pada` | waktu |

`RingkasanRating` = `{ pengguna_id, rata_rata (satu desimal) | null, jumlah }`.

| `sengketa` (`Sengketa`) | Tipe |
| --- | --- |
| `id`, `pengiriman_id` | string |
| `status` | `terbuka` \| `diputuskan` |
| `keputusan` | `cairkan_ke_petani` \| `kembalikan_ke_pembeli` \| null |
| `catatan` | string \| null |
| `dibuat_pada`, `diputuskan_pada` | waktu (\| null) |

### 2.12 Admin, mentor, notifikasi, berkas, kelompok tani

- **`PembeliUntukAdmin`** = `ProfilPembeli` + `nama`, `nomor_hp`.
- **`SengketaUntukAdmin`** = `Sengketa` + `pengiriman: Pengiriman`, `nama_petani`, `nama_pembeli`.
- **`PetaniUntukAdmin`** = `{ pengguna: Pengguna, catatan: CatatanPetani[] }`.
- **`RingkasanPermintaanResep`** = `{ komoditas_id, metode_id | null, kecamatan, jumlah }`.
- **`langganan_notifikasi`** (`LanggananPush`) = `{ endpoint, keys: { p256dh, auth } }`.
- **`Berkas`** = `{ id, url, jenis, ukuran_byte }`. `url` di backend adalah URL bertanda tangan berumur 10 menit.
- **`kelompok_tani`** (`id`, `nama`, `wilayah_id`, `ketua_id`) dan **`anggota_kelompok_tani`** (`kelompok_id`, `petani_id`, `bergabung_pada`): tabel dibuat di Tahap 5, **belum ada endpoint** sampai P1 (D-06).

---

## 3. Endpoint per fitur

Peran: P = petani, B = pembeli, M = mentor, A = admin, semua = semua pengguna masuk, publik = tanpa masuk. Kolom "Klien" = metode di `src/api/klien.ts`.

### 3.1 Masuk dan akun

| Metode dan jalur | Peran | Masukan → respons | Galat khusus | Klien |
| --- | --- | --- | --- | --- |
| `POST /auth/otp/kirim` | publik | `{ nomor_hp }` → `{ nomor_hp, kirim_ulang_dalam_detik, kedaluwarsa_dalam_detik }`; **kode tidak pernah ada di respons** | `NOMOR_HP_TIDAK_VALID`, `TERLALU_SERING` (60 detik, 5/jam) | `akun.kirimOtp` |
| `POST /auth/otp/verifikasi` | publik | `{ nomor_hp, kode, setuju_privasi? }` → `{ akun, pengguna_baru }`; pengguna baru wajib `setuju_privasi: true` | `VALIDASI` (`setuju_privasi`), `OTP_SALAH`, `OTP_KEDALUWARSA` (5 menit), `OTP_TERKUNCI` (5 percobaan) | `akun.verifikasiOtp` |
| `POST /auth/keluar` | semua | → 204 | | `akun.keluar` |
| `GET /akun` | semua | → `Akun` (401 bila belum masuk) | | `akun.ambil` |
| `PUT /akun/peran` | semua, peran kosong | `{ peran, nama, wilayah_id? }` → `Akun` | `WILAYAH_WAJIB` (petani), `STATUS_TIDAK_SESUAI` (sudah berperan) | `akun.pilihPeran` |
| `PATCH /akun` | semua | `{ nama?, wilayah_id?, zona_waktu?, foto_profil?, terdaftar_kelompok_tani? }` → `Akun` | `VALIDASI` | `akun.ubahProfil` |
| `GET /akun/catatan` | P | → `CatatanPetani[]` milik sendiri | | `akun.catatanSaya` |
| `PUT /akun/profil-pembeli` | B | `ProfilPembeliMasukan` → `ProfilPembeli` (baru → `menunggu`) | `VALIDASI` | `akun.simpanProfilPembeli` |

### 3.2 Wilayah dan referensi

| Metode dan jalur | Peran | Masukan → respons | Klien |
| --- | --- | --- | --- |
| `GET /wilayah?cari=` (berhalaman) | semua | → `Halaman<Wilayah>` | `wilayah.daftar` |
| `GET /wilayah/{id}` | semua | → `Wilayah` | `wilayah.ambil` |
| `GET /komoditas?jenis_lahan=` | semua | → `Komoditas[]` | `referensi.komoditas` |
| `GET /metode` | semua | → `MetodeTanam[]` | `referensi.metode` |
| `GET /sistem-hidroponik` | semua | → `SistemHidroponik[]` | `referensi.sistemHidroponik` |
| `GET /konversi-satuan?wilayah_id=` | semua | → `KonversiSatuan[]` | `referensi.konversiSatuan` |
| `GET /konfigurasi` | publik | → `Konfigurasi` | `referensi.konfigurasi` |
| `GET /input/{id}/merek` | semua | → `RingkasanMerek[]` di kecamatan pengguna | `referensi.merek` |
| `GET /harga-sekitar?input_id=` | semua | → `{ input_id, harga_per_satuan \| null, jumlah_laporan }` (min. 3 laporan dalam 30 hari, dari konfigurasi); rata-rata dibulatkan ke ratusan rupiah terdekat, di bawah Rp100 ke puluhan (D-38) | `referensi.hargaSekitar` |
| `POST /laporan-harga` | semua | `{ merek_id, harga_kemasan }` atau `{ merek_baru: {…}, harga_kemasan }` → `LaporanHarga` | `referensi.laporHarga` |
| `GET /promo` | semua | → `Promo[]` berlaku di kecamatan pengguna | `referensi.promo` |
| `GET /kelayakan-subsidi?komoditas_id=` | semua | → `KelayakanSubsidi[]` | `referensi.kelayakanSubsidi` |

### 3.3 Resep

| Metode dan jalur | Peran | Masukan → respons | Klien |
| --- | --- | --- | --- |
| `GET /resep?komoditas_id=&metode_id=` | semua | → `ResepTanam[]` versi terbaru yang terlihat (bagian 1.9) | `resep.daftar` |
| `GET /resep/{id}` | semua | → `ResepTanam`; versi lama tetap bisa dibuka pemilik siklusnya | `resep.ambil` |
| `POST /permintaan-resep` | P | `{ komoditas_id, metode_id? }` → `{ permintaan, sudah_diminta }` (tidak ganda) | `resep.minta` |
| `GET /permintaan-resep/saya` | P | → `PermintaanResep[]` | `resep.permintaanSaya` |

### 3.4 Lahan

| Metode dan jalur | Peran | Masukan → respons | Galat khusus | Klien |
| --- | --- | --- | --- | --- |
| `GET /lahan` | P | → `Lahan[]` milik sendiri, dengan kapasitas | | `lahan.daftar` |
| `POST /lahan` | P | `LahanMasukan` (satuan asli dikonversi server) → `Lahan` | `UKURAN_KOSONG`, `VALIDASI` (`kapasitas_lubang` untuk hidroponik) | `lahan.buat` |
| `PATCH /lahan/{id}` | P (pemilik) | `Partial<LahanMasukan>` → `Lahan` | 404 bukan pemilik | `lahan.ubah` |
| `DELETE /lahan/{id}` | P (pemilik) | → 204 | `STATUS_TIDAK_SESUAI` (masih dipakai siklus) | `lahan.hapus` |

### 3.5 Kebun

| Metode dan jalur | Peran | Masukan → respons | Galat khusus | Klien |
| --- | --- | --- | --- | --- |
| `GET /siklus?status=` | P | → `SiklusTanam[]` milik sendiri (D-26: menu Kebun) | | `kebun.daftarSiklus` |
| `POST /siklus` | P | `BuatSiklusMasukan` → `SiklusDetail`; dengan tanggal tanam: aktif, tugas dibuat server | `LUAS_KOSONG`/`LUBANG_KOSONG`/`POLYBAG_KOSONG`, `HARGA_JUAL_KOSONG`, `HARGA_NEGATIF`, `LAHAN_TIDAK_CUKUP` | `kebun.buatSiklus` |
| `GET /siklus/{id}` | P (pemilik) | → `SiklusDetail` | | `kebun.ambilSiklus` |
| `PATCH /siklus/{id}/tanggal-tanam` | P (pemilik) | `{ tanggal_tanam }` → `SiklusDetail`; rencana → aktif; tugas selesai tidak berubah (P0-17) | `LAHAN_TIDAK_CUKUP`, `STATUS_TIDAK_SESUAI` | `kebun.ubahTanggalTanam` |
| `POST /siklus/{id}/akhiri` | P (pemilik) | `{ pendapatan_nyata }` → `{ siklus, untung_sebenarnya, untung_rencana }` (P0-18) | `STATUS_TIDAK_SESUAI` | `kebun.akhiriSiklus` |
| `GET /siklus/{id}/tugas` | P (pemilik) | → `Tugas[]` | | `kebun.daftarTugas` |
| `GET /tugas/hari-ini` | P | → `Tugas[]` terlambat dan hari ini dari siklus aktif | | `kebun.tugasHariIni` |
| `POST /tugas/{id}/selesai` (idempoten) | P (pemilik) | `{ foto?, catatan? }` → `Tugas`; foto masuk jurnal (P0-14) | `STATUS_TIDAK_SESUAI` (tugas ukur) | `kebun.selesaikanTugas` |
| `POST /tugas/{id}/tunda` | P (pemilik) | `{ hari: 1–3, konfirmasi? }` → `{ diterapkan, perlu_konfirmasi, tugas }`; melewati panen tanpa konfirmasi tidak diterapkan (P0-15) | `TUNDA_DI_LUAR_BATAS`, `TIDAK_BOLEH_DIGESER` | `kebun.tundaTugas` |
| `POST /tugas/{id}/pengukuran` (idempoten) | P (pemilik) | `{ nilai: [{ besaran, nilai }], sumber? }` → `{ hasil, tugas_ukur_ulang, tugas }` (P0-37) | `VALIDASI` (`nilai.<besaran>`: kosong atau `NILAI_DI_LUAR_SKALA`) | `kebun.catatPengukuran` |
| `GET /siklus/{id}/pengukuran?besaran=` | P (pemilik) | → `HasilPengukuran[]` | | `kebun.riwayatPengukuran` |
| `GET /siklus/{id}/pengeluaran` | P (pemilik) | → `Pengeluaran[]` | | `kebun.daftarPengeluaran` |
| `POST /siklus/{id}/pengeluaran` (idempoten) | P (pemilik) | `PengeluaranMasukan` → `Pengeluaran` | `VALIDASI` | `kebun.catatPengeluaran` |
| `GET /siklus/{id}/jurnal` | P (pemilik) | → `EntriJurnal[]` terbaru dulu | | `kebun.jurnal` |
| `POST /siklus/{id}/jurnal` | P (pemilik) | `{ tanggal, foto?, catatan? }` → `EntriJurnal` | `VALIDASI` (keduanya kosong) | `kebun.tambahJurnal` |
| `GET /siklus/{id}/pengingat` | P (pemilik) | → `PengaturanPengingat` | | `kebun.ambilPengingat` |
| `PUT /siklus/{id}/pengingat` | P (pemilik) | `{ jam_pagi, pengingat_sore, tipe_aktif }` → `PengaturanPengingat` | `VALIDASI` (`jam_pagi` 05:00–07:00) | `kebun.ubahPengingat` |

### 3.6 Belajar

| Metode dan jalur | Peran | Masukan → respons | Klien |
| --- | --- | --- | --- |
| `GET /modul?komoditas_id=&metode_id=` | semua | → `Modul[]` berurutan, dengan `selesai` | `belajar.daftarModul` |
| `GET /modul/{id}` | semua | → `Modul` | `belajar.ambilModul` |
| `POST /modul/{id}/selesai` | semua | → `Modul` (tidak ganda) | `belajar.tandaiSelesai` |

### 3.7 Pesanan (petani)

| Metode dan jalur | Peran | Masukan → respons | Galat khusus | Klien |
| --- | --- | --- | --- | --- |
| `GET /pesanan/sekitar?jenis=&radius_km=` (berhalaman) | P (termasuk nonaktif, D-13) | → `Halaman<PesananUntukPetani>` terbuka, berresep, dalam radius (bawaan 10 km, maks 25 km), terdekat dulu | `VALIDASI` (`radius_km`) | `pesanan.sekitar` |
| `GET /pesanan/{id}` | P | → `PesananUntukPetani` (yang belum dibayar uang mukanya → 404) | | `pesanan.ambil` |
| `POST /pesanan/{id}/ambil` (idempoten) | P aktif | `{ jumlah_kg, lahan_id }` → `{ alokasi, siklus_id }`; membuat siklus rencana berharga kesepakatan dan rencana item dari resep; satu alokasi aktif per petani per pesanan (D-39). Server: transaksi + penguncian baris (T5.13) | `AKUN_NONAKTIF`, `MELEBIHI_PESANAN`, `LAHAN_TIDAK_CUKUP`, `JADWAL_TERLALU_DEKAT`, `VALIDASI` (`lahan_id` tanpa resep), `STATUS_TIDAK_SESUAI` (sudah punya alokasi) | `pesanan.ambilPesanan` |
| `POST /alokasi/{id}/setuju` | P (pemilik) | → `AlokasiPesanan`; jadwal kiriman dibuat hanya untuk kiriman yang terkejar umur panen; siklus rencana menjadi aktif dengan tanggal tanam = umur panen sebelum kiriman pertama, tugas dibuat (P0-22, D-39) | `STATUS_TIDAK_SESUAI`, `JADWAL_TERLALU_DEKAT` | `pesanan.setujuiKesepakatan` |
| `GET /alokasi/saya` | P | → `AlokasiPesanan[]` | | `pesanan.alokasiSaya` |
| `POST /alokasi/{id}/gagal-panen` | P (pemilik) | `{ pengiriman_id, alasan }` → `{ tepat_waktu, dikembalikan, catatan_profil, alokasi }`; tanpa denda (D-03) | `VALIDASI`, `STATUS_TIDAK_SESUAI` | `pesanan.laporGagalPanen` |

### 3.8 Kiriman

| Metode dan jalur | Peran | Masukan → respons | Galat khusus | Klien |
| --- | --- | --- | --- | --- |
| `GET /kiriman/saya` | P | → `Pengiriman[]` milik alokasinya | | `kiriman.saya` |
| `GET /kiriman/{id}` | P atau B terkait | → `Pengiriman` | 404 bukan pihak terkait | `kiriman.ambil` |
| `POST /kiriman/{id}/foto-kualitas` | P (pemilik) | `{ foto }` → `Pengiriman` | `FOTO_WAJIB`, `STATUS_TIDAK_SESUAI` | `kiriman.unggahFotoKualitas` |
| `POST /kiriman/{id}/dikirim` | P (pemilik) | → `Pengiriman`; bagian pembeli (80%) ditahan; batas periksa diset (D-01) | `FOTO_WAJIB`, `STATUS_TIDAK_SESUAI` | `kiriman.tandaiDikirim` |
| `POST /kiriman/{id}/konfirmasi` (idempoten) | B (pemilik pesanan) | `{ keputusan: 'terima_semua' }` atau `{ keputusan: 'tolak_sebagian', jumlah_ditolak_kg, alasan_penolakan, keterangan_penolakan?, foto_penolakan? }` → `{ pengiriman, pembayaran, sengketa }` | `KETERANGAN_WAJIB` (D-14), `MELEBIHI_KIRIMAN`, `TOLAK_KOSONG`, `STATUS_TIDAK_SESUAI` | `kiriman.konfirmasi` |
| `POST /kiriman/{id}/rating` | P atau B terkait | `{ nilai, komentar? }` → `Rating` | `SUDAH_DINILAI`, `VALIDASI`, `STATUS_TIDAK_SESUAI` | `kiriman.beriRating` |
| `GET /pengguna/{id}/rating` | semua | → `RingkasanRating` | | `kiriman.ringkasanRating` |

Konfirmasi otomatis: kiriman `dikirim` yang lewat `batas_periksa_pada` dianggap diterima. Backend menjalankannya setiap 15 menit (D-23); klien tiruan menjalankannya setiap kali data kiriman dibaca.

### 3.9 Pembeli

| Metode dan jalur | Peran | Masukan → respons | Galat khusus | Klien |
| --- | --- | --- | --- | --- |
| `GET /pembeli/pesanan` | B | → `PesananDenganKebun[]` (dasbor) | | `pembeli.pesananSaya` |
| `POST /pembeli/pesanan` | B terverifikasi | `BuatPesananMasukan` (rutin atau sekali panen) → `Pesanan` berstatus `menunggu_pembayaran`; komoditas wajib berresep (P0-19) | `BELUM_TERVERIFIKASI`, `VALIDASI`, `FREKUENSI_TIDAK_VALID` (durasi maks 3 bulan) | `pembeli.buatPesanan` |
| `POST /pembeli/pesanan/{id}/bayar-uang-muka` (idempoten) | B (pemilik) | → `Pembayaran[]` (uang muka ditahan, biaya layanan) | `STATUS_TIDAK_SESUAI` | `pembeli.bayarUangMuka` |
| `POST /pembeli/pesanan/{id}/batalkan` | B (pemilik) | → `{ pesanan, kompensasi_petani, dikembalikan_ke_pembeli }` (P0-27) | `STATUS_TIDAK_SESUAI` | `pembeli.batalkan` |
| `GET /pembeli/pembayaran` (berhalaman) | B | → `Halaman<Pembayaran>` terbaru dulu | | `pembeli.pembayaran` |

### 3.10 Admin dan mentor

| Metode dan jalur | Peran | Masukan → respons | Klien |
| --- | --- | --- | --- |
| `GET /admin/pembeli?status=menunggu` | A | → `PembeliUntukAdmin[]` | `admin.pembeliMenunggu` |
| `POST /admin/pembeli/{id}/verifikasi` | A | `{ keputusan, alasan? }` (alasan wajib bila ditolak) → `PembeliUntukAdmin` | `admin.verifikasiPembeli` |
| `GET /admin/sengketa?status=` | A | → `SengketaUntukAdmin[]` | `admin.sengketa` |
| `POST /admin/sengketa/{id}/putuskan` | A | `{ keputusan, catatan? }` → `SengketaUntukAdmin`; menentukan pencairan sisa bagian | `admin.putuskanSengketa` |
| `GET /admin/petani/{id}` | A | → `PetaniUntukAdmin` | `admin.petani` |
| `POST /admin/petani/{id}/catatan` | A | `{ jenis, isi, pengiriman_id? }` → `CatatanPetani` | `admin.tulisCatatan` |
| `POST /admin/petani/{id}/status` | A | `{ status_akun }` → `PetaniUntukAdmin` (D-13) | `admin.ubahStatusPetani` |
| `GET /mentor/resep` | M, A | → `ResepTanam[]` semua versi | `mentor.daftarResep` |
| `POST /mentor/resep` | M, A | `SimpanResepMasukan` → `ResepTanam` versi baru, `draf` (K3) | `mentor.simpanResep` |
| `POST /mentor/resep/{id}/validasi` | M, A | → `ResepTanam` `divalidasi` (resep contoh → `STATUS_TIDAK_SESUAI`) | `mentor.validasiResep` |
| `GET /mentor/permintaan-resep` | M, A | → `RingkasanPermintaanResep[]` terbanyak dulu | `mentor.ringkasanPermintaan` |

### 3.11 Notifikasi dan berkas

| Metode dan jalur | Peran | Masukan → respons | Klien |
| --- | --- | --- | --- |
| `POST /notifikasi/langganan` | semua | `LanggananPush` → 204 | `notifikasi.simpanLangganan` |
| `DELETE /notifikasi/langganan` | semua | `{ endpoint }` → 204 | `notifikasi.hapusLangganan` |
| `POST /berkas` | semua | `multipart` (`image/jpeg`, `image/png`, `image/webp`; maks 2 MB) → `Berkas` | `berkas.unggah` |

---

## 4. Halaman → endpoint

| Tugas dan halaman | Endpoint yang dipakai |
| --- | --- |
| T4.01 pemilih akun demo, penjaga rute | `GET /akun` (+ kontrol pengembangan tiruan) |
| T4.02 Hitung 1: pilih tanaman | `GET /komoditas`, `GET /akun` |
| T4.03 Segera hadir | `POST /permintaan-resep`, `GET /permintaan-resep/saya` |
| T4.04 Hitung 2: cara tanam dan ukuran | `GET /metode`, `GET /resep`, `GET /sistem-hidroponik`, `GET /konversi-satuan` |
| T4.05–T4.07 Hitung 3: kalkulator, merek, subsidi, promo, alat | `GET /resep/{id}`, `GET /input/{id}/merek`, `GET /harga-sekitar`, `POST /laporan-harga`, `GET /kelayakan-subsidi`, `GET /promo`, `GET /konfigurasi` |
| T4.08 Simpan rencana, tanggal tanam | `GET /lahan`, `POST /siklus` |
| T4.09 Beranda petani | `GET /tugas/hari-ini`, `GET /siklus`, `GET /siklus/{id}`, `GET /pesanan/sekitar`, `POST /tugas/{id}/selesai` |
| T4.10 Jadwal | `GET /siklus/{id}`, `GET /siklus/{id}/tugas` |
| T4.11 Detail tugas | `POST /tugas/{id}/selesai`, `POST /tugas/{id}/tunda`, `POST /berkas` |
| T4.12 Cek pH dan PPM | `POST /tugas/{id}/pengukuran`, `GET /siklus/{id}/pengukuran` |
| T4.13 Ubah tanggal tanam | `PATCH /siklus/{id}/tanggal-tanam` |
| T4.14 Pengingat per siklus | `GET`/`PUT /siklus/{id}/pengingat` |
| T4.15 Detail siklus: modal | `GET /siklus/{id}`, `GET`/`POST /siklus/{id}/pengeluaran` |
| T4.16 Detail siklus: jurnal | `GET`/`POST /siklus/{id}/jurnal`, `POST /berkas` |
| T4.17 Akhir siklus | `POST /siklus/{id}/akhiri` |
| T4.18 Pesanan di sekitar | `GET /pesanan/sekitar` |
| T4.19 Detail pesanan, ambil sebagian | `GET /pesanan/{id}`, `GET /lahan`, `GET /resep`, `POST /pesanan/{id}/ambil`, `GET /akun`, `GET /konfigurasi` |
| T4.20 Kesepakatan | `POST /alokasi/{id}/setuju`, `GET /alokasi/saya` |
| T4.21 Kiriman saya | `GET /kiriman/saya`, `POST /kiriman/{id}/foto-kualitas`, `POST /kiriman/{id}/dikirim` |
| T4.22 Dasbor pembeli | `GET /pembeli/pesanan` |
| T4.23–T4.24 Buat pesanan | `GET /komoditas`, `GET /harga-sekitar`, `GET /wilayah`, `POST /pembeli/pesanan` |
| T4.25 Konfirmasi kiriman | `GET /kiriman/{id}`, `POST /kiriman/{id}/konfirmasi`, `POST /berkas` |
| T4.26 Rating | `POST /kiriman/{id}/rating`, `GET /pengguna/{id}/rating` |
| T4.27 Gagal panen, pembatalan | `POST /alokasi/{id}/gagal-panen`, `POST /pembeli/pesanan/{id}/batalkan` |
| T4.28 Daftar pembeli | `PUT /akun/profil-pembeli`, `GET /akun` |
| T4.29 Panel admin | `GET /admin/pembeli`, `POST /admin/pembeli/{id}/verifikasi`, `GET /admin/sengketa`, `POST /admin/sengketa/{id}/putuskan`, `GET /admin/petani/{id}`, `POST /admin/petani/{id}/catatan`, `POST /admin/petani/{id}/status` |
| T4.30–T4.31 Belajar, pemutar modul | `GET /modul`, `GET /modul/{id}`, `POST /modul/{id}/selesai` |
| T4.32 Halaman depan | `GET /konfigurasi` |
| T4.33 Masuk | `POST /auth/otp/kirim`, `POST /auth/otp/verifikasi` |
| T4.34 Pilih peran dan desa | `GET /wilayah`, `PUT /akun/peran` |
| T4.35–T4.36 Profil | `GET /akun`, `PATCH /akun`, `GET /akun/catatan`, `GET /pengguna/{id}/rating`, `GET /lahan`, `POST /berkas`, `POST /auth/keluar` |
| T4.36a Lahan saya | `GET`/`POST /lahan`, `PATCH`/`DELETE /lahan/{id}`, `GET /konversi-satuan`, `GET /wilayah` |
| T4.38–T4.39 Mentor | `GET`/`POST /mentor/resep`, `POST /mentor/resep/{id}/validasi`, `GET /mentor/permintaan-resep` |
| T4.41 Bayar uang muka, pembayaran | `POST /pembeli/pesanan/{id}/bayar-uang-muka`, `GET /pembeli/pembayaran` |
| T6.07 Notifikasi | `POST`/`DELETE /notifikasi/langganan` |

---

## Riwayat

| Tanggal | Perubahan |
| --- | --- |
| 2026-10-05 | Versi pertama (T3.01, T3.02), bersama tipe `src/api/tipe/`, klien tiruan, dan tes kontrak |
| 2026-10-07 | D-38: `pengguna.terdaftar_kelompok_tani`, `komoditas.harga_jual_contoh`, `resep_tanam.persen_panen_jelek` dan `alasan_panen_jelek`, pembulatan harga sekitar ke ratusan. Tunda tugas terlambat dihitung dari hari ini. |
| 2026-10-07 | D-39: `PesananUntukPetani` ditambah `titik_desa_antar`, `alamat_antar`, `patokan`, `alokasi_saya`, `dibuat_pada`; galat `409 JADWAL_TERLALU_DEKAT`; satu alokasi per petani per pesanan; setuju kesepakatan hanya menjadwalkan kiriman yang terkejar dan mengaktifkan siklus. |
