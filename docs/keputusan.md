# Keputusan Produk dan Teknis Tani Muda

**Aturan utama: jika isi dokumen ini bertentangan dengan PRD atau desain, dokumen ini yang berlaku.** Urutan kekuatan: `keputusan.md` > `aturan-proyek.md` > PRD dan desain (`design/`). Keputusan baru ditambahkan di bawah dengan nomor berikutnya; jangan mengubah isi keputusan lama tanpa memberi tahu pemilik produk.

Ditetapkan oleh pemilik produk, 4 Oktober 2026. Butir bertanda **(turunan)** adalah konsekuensi yang saya tarik dari keputusan pemilik dan masih perlu dikonfirmasi.

---

## D-01. Batas periksa kiriman
- Pesanan **rutin: 6 jam**. Pesanan **sekali panen: 24 jam**.
- Lewat batas tanpa tanggapan pembeli, kiriman **dianggap diterima** dan dana cair ke petani.
- Kedua angka adalah **konfigurasi** (per jenis pesanan), bukan konstanta di kode.
- Mengganti: PRD P0-25 (24 jam untuk semua).
- Berdampak ke: T2.14, T4.25, T4.32, T5.10.

## D-02. Pembayaran uang muka dan per kiriman
- Uang muka = **20%** dari nilai pesanan. Biaya layanan **5%** dibayar pembeli (tidak memotong bagian petani), seperti PRD.
- Untuk **setiap kiriman**: pembeli membayar **80%** dari nilai kiriman itu, dan **20% sisanya diambil dari saldo uang muka**.
- Mengganti: rumus PRD "uang muka diperhitungkan pada kiriman terakhir".
- Persen 20, 5, 80 adalah konfigurasi.
- Berdampak ke: T2.12, T4.23, T4.25, T5.08.

## D-03. Gagal panen dan pembatalan
- **Tidak ada denda Rp25.000.** Aturan "3 kali berturut-turut pembeli boleh mengakhiri" di desain juga tidak dipakai.
- Petani yang tidak sanggup **wajib memberi kabar paling lambat 3 hari sebelum jadwal kirim**.
- Bagian yang tidak terpenuhi **ditawarkan ke petani lain**. Jika tidak ada pengganti, **sisa uang muka untuk bagian itu dikembalikan ke pembeli**.
- Petani yang **tidak memberi kabar** mendapat **catatan di profil** dan bisa **dinonaktifkan sementara oleh admin**.
- Pembatalan oleh pembeli setelah petani mulai menanam tetap mengikuti PRD P0-27 (uang muka menjadi kompensasi petani).
- Batas 3 hari adalah konfigurasi.
- Status akun petani (`aktif` / `dinonaktifkan_sementara`) dan tabel `catatan_petani`; dikonfirmasi dan dirinci di **D-13**.
- Berdampak ke: T2.14, T3.02, T3.07, T4.20, T4.27, T4.29, T5.10.

## D-04. Login
- Hanya **nomor HP dan OTP**. **Kata sandi dan nama pengguna dihapus dari semua halaman** (Masuk, Profil, Ubah profil) dan dari model data.
- Ganti nomor HP tetap lewat OTP ke nomor baru.
- Berdampak ke: T3.02, T4.33, T4.35, T4.36.

## D-05. Hidroponik hanya sawi
- v1 hanya punya resep **sawi hidroponik**. Bayam dan kangkung hidroponik tampil **"Segera hadir"** dan bisa diminta resepnya (P0-31).
- Mengganti: desain yang menampilkan hidroponik tersedia untuk bayam dan kangkung (papan 04 mobile, 08, 09 dan 10 mobile).
- Berdampak ke: T3.11, T4.02, T4.04, T4.30.

## D-06. Tambahan Model Data
Tabel dan kolom berikut ditambahkan ke Model Data PRD. Nama persis seperti ini.

| Tabel / kolom | Isi |
| --- | --- |
| `lahan` | petani, nama lahan, jenis lahan, `luas_m2`, `satuan_asli`, `nilai_asli` (angka yang diketik petani, mis. 7 ru), desa, titik koordinat, `kapasitas_lubang` (kapasitas instalasi hidroponik, jumlah lubang) |
| `wilayah` | desa, kecamatan, kabupaten, koordinat titik tengah desa. Dipakai untuk radius pesanan |
| `pengguna.foto_profil` | foto profil |
| `pengiriman.alasan_penolakan` | pilihan: `layu_atau_busuk`, `jumlah_kurang`, `tidak_sesuai_standar`, `lainnya` |
| `pengiriman.jumlah_ditolak` | berat yang ditolak (kg) |
| `pengiriman.foto_penolakan` | foto bukti penolakan |
| `sengketa` | pengiriman, status, keputusan admin, catatan, waktu |
| `kelompok_tani`, `anggota_kelompok_tani` | **Dibuat sekarang, tampilannya baru di P1** |

Aturan:
- **Kapasitas lahan untuk P0-21 = luas lahan dikurangi luas yang sedang dipakai siklus aktif di lahan itu.** Dihitung oleh fungsi di `src/lib` (T2.15a).
- **Privasi lokasi:** ke pembeli hanya tampil **nama desa dan jarak**, tidak pernah titik koordinat lahan. Jarak dihitung dari titik tengah desa (`wilayah`), bukan dari titik lahan.
- Siklus menunjuk lahan: `siklus_tanam.lahan_id`; dikonfirmasi dan dirinci di **D-15** (termasuk kapasitas hidroponik dari jumlah lubang).
- Kolom lain dari desain yang **tidak** dibuat: kata sandi, nama pengguna (D-04).
- Pemetaan alasan penolakan desain ke empat pilihan di atas: lihat tabel di **D-14**.
- Berdampak ke: T3.02, T3.06, T3.07, T3.15, T4.19, T4.25, T4.36a.

## D-07. Halaman tanpa desain dan tata letak
- Halaman yang belum ada desainnya dibuat sebagai **turunan dari pola yang ada**: web mobile **390px dengan navigasi bawah**, desktop **1440px dengan sidebar kiri** dan **dua kolom jika membantu**.
- **Panel mentor dan admin: cukup versi desktop**, tata letak tabel sederhana.
- Untuk setiap tugas halaman bertanda **[DEMO]**: sebelum lanjut ke tugas berikutnya, **tunjukkan tangkapan layar versi mobile dan desktop kepada pemilik produk** dan tunggu tanggapan. Tangkapan layar disimpan di `docs/tangkapan/aplikasi/<nomor>-<nama>-mobile.png` dan `-desktop.png` (penamaan menurut **D-18**).
- Mengganti: asumsi bahwa pembeli hanya di laptop tidak dipakai; halaman pembeli juga dibuat di 390px.
- Berdampak ke: semua tugas halaman Tahap 4, aturan 11 `aturan-proyek.md`.

## D-08. Angka dan rumus
- **Rumus di PRD yang berlaku. Angka di desain hanya ilustrasi.**
- Semua angka di aplikasi (kapasitas, modal, titik impas, uang muka, nilai pembayaran, jumlah kiriman, sisa saldo, luas dibutuhkan) **dihitung oleh fungsi di `src/lib`** dan tidak boleh ditulis langsung di komponen atau teks.
- Contoh: "6 kg per minggu" di papan 31 adalah ilustrasi; angka kapasitas di aplikasi dari `kapasitas-lahan.ts` dan `pesanan-lahan.ts`.
- Teks contoh di desain yang memuat angka (mis. "paling lama 6 jam", "Rp430.000 · impas di 86 kg" di landing) dibuat dari data dan fungsi yang sama, atau dari konfigurasi.
- Berdampak ke: semua tugas Tahap 2 dan halaman yang menampilkan angka.

## D-09. Aturan bahasa (lengkap)
1. Semua teks UI Bahasa Indonesia.
2. **"kamu"** untuk petani, **"Anda"** untuk pembeli.
3. Tombol diawali kata kerja ("Simpan rencana", "Ambil pesanan").
4. Kalimat biasa, **bukan huruf kapital semua**.
5. **Bahasa petani**: "Hari ke-13", bukan "HST 13"; "Uang muka sudah masuk", bukan "Pembayaran DP berhasil". **Hindari istilah escrow, task, pending, submit, DP, HST, dashboard, login** di tampilan.
6. Rupiah ditulis lengkap: `Rp1.250.000` (bukan "1,25 jt", "Rp 1.25jt").
7. Nada tenang, kalimat pendek, tanpa tanda seru; galat menyebut apa yang harus dilakukan.
- Catatan: istilah "HST" boleh dipakai di kode, basis data, dan panel mentor; di tampilan petani selalu "hari ke-n".
- Berdampak ke: `src/teks/`, lint teks (T1.03).

## D-10. Hambatan PRD tidak menghentikan pekerjaan
- **Resep dan rentang pH/PPM:** data contoh dengan status **`draf`** dan label **"CONTOH, belum divalidasi penyuluh"** di data seed. Pemilik produk menggantinya setelah bertemu penyuluh.
- **Payment gateway:** antarmuka **`PenyediaPembayaran`** dengan implementasi **tiruan** untuk demo (menahan, mencairkan, mengembalikan dana secara simulasi). Penyedia sungguhan dipasang nanti tanpa mengubah halaman.
- **OTP:** **nomor uji Supabase** selama pengembangan, di balik antarmuka **`PenyediaOtp`** supaya penyedia SMS mudah dipasang nanti.
- Berdampak ke: T3.09–T3.12, T4.33, T5.08, T5.09.

## D-11. Resep `draf` tetap tampil di demo (dikonfirmasi di D-12)
PRD P0-03 melarang resep belum divalidasi tampil ke petani, sedangkan D-10 menetapkan resep contoh berstatus `draf`. Penyelesaian yang saya pakai:
- Kolom `resep_tanam.status` (`draf` | `divalidasi`) dan `resep_tanam.contoh` (boolean).
- Petani melihat resep bila `status = 'divalidasi'`, **atau** bila `contoh = true` dan pengaturan `tampilkan_resep_contoh` aktif (sumber dan nilai bawaannya di **D-12**).
- Setiap layar yang memakai resep `contoh` menampilkan label **"CONTOH, belum divalidasi penyuluh"**.
- Jika tidak disetujui: resep contoh disetel `divalidasi` dengan validator "Contoh (demo)" — saya tidak memilih ini karena menyiratkan validasi yang belum terjadi.

---

Ditetapkan oleh pemilik produk, 5 Oktober 2026 (jawaban atas pertanyaan P-1 sampai P-5 dan keputusan teknis Tahap 1).

## D-12. Resep contoh: label dan pengaturan (jawaban P-1)
- D-11 disetujui.
- Label **"CONTOH, belum divalidasi penyuluh"** wajib terlihat **di setiap tempat angka resep muncul**: kalkulator modal (dosis, jumlah, harga, hasil panen), jadwal dan detail tugas (hari ke-n, dosis), serta rentang pengukuran pH/PPM. Satu label di kepala halaman tidak cukup bila angka resep juga tampil di bagian lain yang bisa dilihat terpisah (kartu, lembar bawah, panel).
- Pengaturan `tampilkan_resep_contoh` dibaca dari **variabel lingkungan** `VITE_TAMPILKAN_RESEP_CONTOH`. **Nilai bawaannya mati**: hanya nilai persis `true` yang menyalakannya. Kosong, tidak ada, atau nilai lain berarti mati.
- Variabel ini bukan rahasia (berawalan `VITE_`, terbuka di browser). Penyaringan dilakukan di lapisan data frontend. Basis data produksi tidak diisi resep contoh, sehingga pengaturan yang keliru pun tidak menampilkan resep yang belum divalidasi.
- Berdampak ke: T2 (fungsi pembaca pengaturan + tes), T3.14, T4.05–T4.07, T4.10–T4.12, `.env.example`.

## D-13. Petani dinonaktifkan sementara (jawaban P-2)
- `pengguna.status_akun` (`aktif` | `dinonaktifkan_sementara`) dan tabel `catatan_petani` disetujui.
- Petani yang dinonaktifkan sementara **tetap bisa melihat daftar pesanan** dan detailnya, serta jadwal dan jurnal siklusnya.
- Tombol **"Ambil pesanan" diganti penjelasan singkat** beserta **cara menghubungi admin**, misalnya: "Akunmu sedang dinonaktifkan sementara, jadi belum bisa mengambil pesanan baru. Hubungi admin lewat WhatsApp 08xx." Kontak admin diambil dari konfigurasi, tidak ditulis langsung.
- Basis data juga menolak pengambilan pesanan oleh akun nonaktif (fungsi `ambil_pesanan`), tidak hanya tombolnya yang disembunyikan.
- Berdampak ke: T3.02, T3.08, T4.18, T4.19, T4.29.

## D-14. Alasan penolakan kiriman (jawaban P-3)
- Pemetaan disetujui. Pilihan **"Lainnya" wajib disertai keterangan teks**. Kolom tambahan: `pengiriman.keterangan_penolakan` (teks). Basis data menolak `alasan_penolakan = 'lainnya'` tanpa keterangan (CHECK), dan formulir pembeli menampilkan galat "Tulis alasannya dulu".

| Alasan di desain | Pilihan di aplikasi (`alasan_penolakan`) |
| --- | --- |
| Layu | `layu_atau_busuk` |
| Busuk | `layu_atau_busuk` |
| Menguning | `tidak_sesuai_standar` |
| Daun berlubang | `tidak_sesuai_standar` |
| Kurang berat | `jumlah_kurang` |
| Alasan lain | `lainnya` + `keterangan_penolakan` wajib |

- Berdampak ke: T2.14, T3.07, T4.25.

## D-15. Lahan, siklus, dan kapasitas (jawaban P-4)
- `siklus_tanam.lahan_id` disetujui. Setiap siklus menunjuk satu lahan.
- **Satu lahan bisa punya beberapa siklus aktif** sekaligus (mis. dua petak sawi yang ditanam bertahap).
- **Lahan tanah** (bedengan, polybag, sawah): kapasitas tersisa = `lahan.luas_m2` − jumlah luas siklus aktif di lahan itu (`siklus_tanam.luas_m2`).
- **Lahan hidroponik**: kapasitas dihitung dari **jumlah lubang, bukan luas**. Kapasitas tersisa = `lahan.kapasitas_lubang` − jumlah lubang siklus aktif di lahan itu (`siklus_tanam.jumlah_lubang`).
- Siklus baru ditolak bila melebihi kapasitas tersisa. Fungsi di `src/lib/kapasitas-lahan.ts` (T2.15a) menangani kedua jenis dan diuji.
- Berdampak ke: T2.15a, T3.06, T3.06a, T4.08, T4.19, T4.36a.

## D-16. Titik patah layar (jawaban P-5)
- Di bawah 768px: navigasi bawah, satu kolom.
- **768–1023px: tetap navigasi bawah, tetapi konten boleh dua kolom.**
- Mulai 1024px: sidebar kiri, konten satu atau dua kolom.
- Token teks besar halaman depan `tampil-1` sampai `tampil-5` disetujui.
- Sudah sesuai dengan yang terpasang di Tahap 1 (`md` 768, `lg` 1024).

## D-17. Keputusan teknis Tahap 1
- **Tailwind CSS 3.4** dan **jsdom 27** diterima.
- Dua ikon di luar `design/icons/` (`silang` untuk tombol tutup dialog dan `panah-naik-turun` untuk tombol akun sidebar) boleh dipakai, **asalkan gayanya sama** dengan ikon di `design/icons/`: kotak 24×24, garis 2, ujung dan sambungan bulat, tanpa isian, warna `currentColor`.
- **Teks yang terlalu panjang untuk tempatnya dipotong dengan elipsis**, lalu teks lengkapnya ditampilkan saat disentuh atau diarahkan kursor. **Ukuran huruf tidak boleh diperkecil.** Penerapan pertama ada di tombol akun sidebar: teks lengkap tampil sebagai keterangan saat kursor berada di atas tombol atau tombol difokus, dan di bagian atas menu akun saat tombol disentuh.

## D-18. Penamaan file dan kerapian repositori
- Nama file dan folder memakai **kebab-case Bahasa Indonesia** yang deskriptif, tanpa spasi, tanda kurung, atau akhiran angka seperti "(2)". Ini juga berlaku untuk komponen React (`penggaris-umur-tanam.tsx`), sedangkan nama komponen di dalam kode tetap PascalCase (`PenggarisUmurTanam`). Pengecualian: nama baku perkakas (`README.md`, `package.json`, `tailwind.config.ts`, `vite.config.ts`, `main.tsx`, `index.css`, `index.html`).
- File desain asli hanya satu dan berisi sistem desain serta semua halaman, sehingga namanya **`design/desain-tani-muda.html`** (tidak diduplikasi). PRD: `docs/prd-tani-muda.md`.
- Papan desain dinomori menurut **urutan alur aplikasi**, dengan format `<nomor>-<nama-halaman>-<mobile|desktop>`. Versi mobile dan desktop dari halaman yang sama berbagi nomor. Indeks lengkapnya ada di `design/README.md`, dan petanya di `scripts/papan-desain.mjs`.
- `design/extracted/` adalah bahan kerja dan **tidak masuk git**. Folder ini dibuat ulang dengan `npm run ekstrak-desain`. Aplikasi dan tes tidak bergantung padanya.
- Tangkapan layar memakai format yang sama:
  - `docs/tangkapan/aplikasi/<nomor>-<nama>-<mobile|desktop>.png` untuk aplikasi;
  - `docs/tangkapan/desain/…` untuk papan desain asli.
  - Halaman turunan (tanpa desain) memakai nomor lanjutan mulai 39, yang tercantum di `design/README.md`.

---

## Riwayat
| Tanggal | Perubahan |
| --- | --- |
| 2026-10-04 | D-01 sampai D-11 ditetapkan |
| 2026-10-05 | D-12 sampai D-18 ditetapkan. Butir turunan di D-03, D-06, dan D-11 dikonfirmasi dan dirujuk ke keputusan baru. Jalur tangkapan layar di D-07 diganti mengikuti D-18 |
