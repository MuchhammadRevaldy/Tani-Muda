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
- **OTP:** di balik antarmuka **`PenyediaOtp`** supaya penyedia SMS mudah dipasang nanti. Selama Tahap 3–4 memakai implementasi tiruan di frontend; mulai Tahap 5 memakai backend Laravel dengan driver log untuk pengembangan (D-19).
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
- Server juga menolak pengambilan pesanan oleh akun nonaktif (klien API tiruan di Tahap 3, lalu Policy dan endpoint `ambil pesanan` di backend), tidak hanya tombolnya yang disembunyikan.
- Berdampak ke: T3.02, T3.08, T4.18, T4.19, T4.29.

## D-14. Alasan penolakan kiriman (jawaban P-3)
- Pemetaan disetujui. Pilihan **"Lainnya" wajib disertai keterangan teks**. Kolom tambahan: `pengiriman.keterangan_penolakan` (teks). Server menolak `alasan_penolakan = 'lainnya'` tanpa keterangan (validasi permintaan dan batasan CHECK di tabel), dan formulir pembeli menampilkan galat "Tulis alasannya dulu".

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
- Siklus baru ditolak bila melebihi kapasitas tersisa. Yang dihitung memakai lahan: siklus aktif dan siklus rencana yang terhubung ke alokasi pesanan (D-34). Fungsi di `src/lib/kapasitas-lahan.ts` (T2.15a) menangani kedua jenis dan diuji.
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

Ditetapkan oleh pemilik produk, 5 Oktober 2026 (perubahan arsitektur).

## D-19. Backend Laravel dan MariaDB, tanpa Docker
- **Backend memakai Laravel versi terbaru sebagai API** (saat ini Laravel 13), **bukan Supabase**. Semua rujukan Supabase, PostGIS, RLS, Edge Function, dan Supabase Storage di dokumen proyek tidak berlaku lagi.
- **Database: MySQL/MariaDB dari XAMPP** (terpasang: MariaDB 10.4.32; Laravel 13 mendukung MariaDB 10.3+).
- **Frontend React yang sudah ada tetap dipakai** sebagai aplikasi terpisah yang berbicara dengan backend lewat API JSON.
- **Semuanya harus bisa berjalan lokal tanpa Docker**: frontend dengan `npm run dev`, backend dengan `php artisan serve`, database dari XAMPP, scheduler dengan `php artisan schedule:work`, dan antrean dengan `php artisan queue:work`.
- **Prasyarat lokal:** Laravel 13 membutuhkan **PHP 8.3 atau lebih baru**. PHP di PATH saat ini 8.1.25 (XAMPP), jadi PHP perlu diperbarui sebelum Tahap 5.
- **Kunci rahasia hanya ada di file `.env` backend dan tidak pernah dikirim ke frontend.** Frontend hanya punya variabel publik berawalan `VITE_`.
- Hak akses dijaga di server (Policy per peran dan validasi permintaan), bukan di frontend.
- Mulai Tahap 5, struktur repositori menjadi:
  - `frontend/` untuk proyek React;
  - `backend/` untuk Laravel;
  - `shared/kasus-uji/` untuk kasus uji perhitungan dalam JSON, yang dipakai Vitest dan Pest.
- Rancangan rinci ada di `docs/arsitektur-backend.md`. Bentuk data dan endpoint ada di `docs/kontrak-api.md` (dibuat di Tahap 3).
- Berdampak ke: `rencana-kerja.md` Tahap 3–6, `aturan-proyek.md` bagian 6–9, `ringkasan-desain.md`, `.env.example`, dan pemeriksa lint.

## D-20. Tampilan dulu, backend setelah semua halaman selesai
- **Fokus saat ini adalah tampilan.** Backend Laravel baru dikerjakan setelah semua halaman selesai.
- Urutan tahap:
  - Tahap 2: logika inti di `src/lib`.
  - Tahap 3: kontrak API dan data tiruan.
  - Tahap 4: semua halaman memakai data tiruan.
  - Tahap 5: backend Laravel.
  - Tahap 6: penyambungan ke backend, mode offline, notifikasi, dan uji menyeluruh.
- **Halaman hanya mengambil data lewat klien API**, tidak pernah langsung dari data tiruan. Dengan begitu, peralihan ke backend cukup dilakukan dengan mengganti implementasi klien API tiruan menjadi HTTP.
- Klien API tiruan menegakkan aturan yang sama dengan server nanti (kepemilikan data, peran, status akun, verifikasi pembeli, batas alokasi, privasi titik lahan), supaya perilaku halaman tidak berubah saat disambungkan.
- Berdampak ke: `rencana-kerja.md` (urutan dan isi Tahap 3–6).

Ditetapkan oleh pemilik produk, 5 Oktober 2026 (jawaban atas pertanyaan backend P-15 sampai P-19 di `rencana-kerja.md`).

## D-21. Sesi login: cookie Sanctum untuk web, token untuk aplikasi seluler
- Aplikasi web memakai **Sanctum mode SPA dengan cookie sesi** (`HttpOnly`, dilindungi CSRF). Tidak ada token yang disimpan di `localStorage`.
- Saat deploy, frontend dan backend harus berada di domain induk yang sama (mis. `app.contoh.id` dan `api.contoh.id`), dengan `SESSION_DOMAIN` dan `SANCTUM_STATEFUL_DOMAINS` diatur lewat `.env`.
- **Bila nanti ada aplikasi React Native, aplikasi itu memakai mode token Sanctum** (token API per perangkat). Endpoint OTP dan kontrak API tetap sama; hanya cara menyimpan sesi yang berbeda.
- Berdampak ke: `arsitektur-backend.md` bagian 5, T5.09, T6.01.

## D-22. Data milik pengguna lain dijawab 404
- Permintaan atas data milik pengguna lain dijawab **404**, sehingga keberadaan data itu tidak bocor.
- **403** dipakai bila peran atau status akun tidak mengizinkan tindakan (mis. pembeli membuka halaman petani, petani nonaktif mengambil pesanan, pembeli belum terverifikasi memasang pesanan).
- Berlaku sama di klien API tiruan (Tahap 3) dan backend (Policy, Tahap 5).
- Berdampak ke: `kontrak-api.md`, T3.09, T3.10, T3.12, T5.10.

## D-23. Konfirmasi otomatis kiriman setiap 15 menit
- Perintah konfirmasi otomatis kiriman berjalan **setiap 15 menit**, bersamaan dengan scheduler pengingat. Keterlambatan pencairan setelah batas 6 jam (rutin) atau 24 jam (sekali panen) paling lama 15 menit.
- Mengganti: jadwal per jam di rancangan sebelumnya.
- Berdampak ke: `arsitektur-backend.md` bagian 11, T5.17.

## D-24. Demo dari laptop, siap deploy ke VPS
- **Demo lomba dijalankan dari laptop** untuk sekarang (D-19).
- Aplikasi harus **siap di-deploy ke VPS kapan saja**:
  - **semua konfigurasi lewat `.env`** (alamat, basis data, domain sesi, kunci, driver OTP dan pembayaran), tidak ada nilai lingkungan yang ditulis di kode;
  - **tidak ada path khusus Windows di kode** (huruf drive, garis miring terbalik, `C:\…`). Jalur dibangun dengan fungsi bawaan (`base_path()`, `storage_path()`, `path.join`) atau dari `.env`;
  - langkah deploy dicatat di `arsitektur-backend.md` bagian 17.
- Berdampak ke: `aturan-proyek.md` bagian 6 dan 7, T5.03, T6.08.

## D-25. PHP 8.3+ dipasang terpisah, MariaDB XAMPP tetap
- **PHP 8.3 atau lebih baru dipasang terpisah** dari XAMPP. PHP XAMPP (8.1.25) tidak dipakai untuk backend.
- **MariaDB dari XAMPP tetap dipakai** sebagai basis data lokal.
- Langkah pemasangan dan cara memeriksanya ada di `arsitektur-backend.md` bagian 2. Pemasangan yang lolos pemeriksaan itu menjadi **prasyarat Tahap 5** (tugas T5.00).
- Berdampak ke: `rencana-kerja.md` Tahap 5.

Ditetapkan oleh pemilik produk, 5 Oktober 2026 (jawaban P-6 sampai P-14 dan tanggapan atas tafsiran Tahap 2).

## D-26. Menu Kebun (jawaban P-6)
- Profil dan Pengaturan notifikasi dibuka dari avatar di kepala halaman HP (usul P-6 disetujui).
- Menu **Kebun**:
  - satu siklus aktif → langsung membuka siklus itu;
  - **lebih dari satu siklus aktif → membuka daftar siklus**;
  - **belum ada siklus → keadaan kosong "Mulai siklus tanam pertamamu"**.
- Mengganti: K4 di `rencana-kerja.md` (hanya satu siklus aktif yang ditampilkan).
- Berdampak ke: T3.02 (endpoint daftar siklus), T4.09, T4.10, navigasi.

## D-27. Data wilayah (jawaban P-7)
- Untuk demo, beberapa desa diisi manual. Kecamatan pilot di jawaban pemilik produk masih berupa templat, jadi data demo memakai **Kecamatan Lembang, Kabupaten Bandung Barat** (sesuai desain, mis. "Petani · Lembang"). Ganti bila kecamatan pilot berbeda.
- **ID wilayah memakai format kode wilayah Kemendagri** `PP.KK.CC.DDDD` (provinsi, kabupaten/kota, kecamatan, desa/kelurahan), mis. `32.17.01.2003` untuk Desa Lembang. Dengan begitu data resmi bisa diimpor kelak.
- Koordinat titik tengah desa diisi manual. Kode dan koordinat yang belum dicek ke sumber resmi ditandai di data contoh.
- Berdampak ke: T3.01, T3.06, T5.04.

## D-28. Konfigurasi bisnis (jawaban P-8)
- Hanya admin yang mengubah konfigurasi bisnis, **lewat seeder atau file konfigurasi yang tercatat di git**, bukan dengan mengedit langsung di phpMyAdmin. Setiap perubahan dengan demikian punya riwayat.
- Halaman admin untuk konfigurasi masuk **P1**.
- Berdampak ke: T3.06 (`konfigurasi.json`), T5.08.

## D-29. Video modul (jawaban P-9)
- Video direkam tim, idealnya bersama penyuluh. Untuk demo cukup **2–3 video contoh**, sisanya placeholder.
- Format **MP4 360p**, disimpan di storage backend.
- Batas **15 MB per video** dan **200 MB total unduhan offline**. Keduanya nilai awal di konfigurasi dan bisa diubah.
- Berdampak ke: T3.06, T3.07, T4.30, T4.31, T6.06.

## D-30. Persetujuan kebijakan privasi (jawaban P-10)
- Persetujuan data masih menunggu pembimbing dan ahli hukum.
- Sementara itu, saat mendaftar (verifikasi OTP pertama) ada **centang persetujuan kebijakan privasi** dengan teks draf yang **ditandai jelas sebagai draf**.
- Waktu setuju dan versi kebijakan disimpan per pengguna (`pengguna.setuju_privasi_pada`, `pengguna.versi_privasi`). Pendaftaran tanpa centang ditolak.
- Berdampak ke: T3.01, T3.02, T4.33, T4.37, T5.09.

## D-31. Zona waktu (jawaban P-11)
- Pilot memakai **WIB**.
- **Semua waktu disimpan dalam UTC** di basis data. Tanggal kalender tanpa jam (tanggal tanam, tanggal tugas) tetap `YYYY-MM-DD`.
- Kolom **`pengguna.zona_waktu`** dengan nilai bawaan **`Asia/Jakarta`**. Pengingat dan "hari ini" dihitung menurut zona waktu pengguna.
- Berdampak ke: T3.01, T3.09, T5.04, T5.17.

## D-32. iPhone (jawaban P-12)
- Jawaban pemilik produk masih berupa templat; yang dipakai adalah pilihan bawaannya: **anggap mayoritas peserta memakai Android**.
- Banner **"Tambahkan ke layar utama"** tetap tampil di iPhone, karena web push di iPhone membutuhkannya.
- Berdampak ke: T6.03, T6.07.

## D-33. Repositori dan pemeriksaan visual (jawaban P-13, P-14)
- Repositori akan menjadi **GitHub privat**. **Jangan push sampai pemilik produk memberi alamatnya.**
- Pemilik produk memeriksa tangkapan layar dan memberi tahu bila ada yang berbeda.

## D-34. Tanggapan atas tafsiran Tahap 2
- **Uang muka per kiriman**: tafsiran disetujui. Bagian dari uang muka = persen uang muka × nilai yang diterima. Kiriman terakhir yang diterima penuh memakai seluruh sisa saldo. Pada penolakan, sisa bagian yang ditolak dibiarkan untuk sengketa atau pengembalian.
- **Kapasitas lahan (mengubah D-15)**: yang dihitung memakai lahan adalah **siklus aktif dan siklus berstatus rencana yang sudah terhubung ke alokasi pesanan**, supaya petani tidak bisa mengambil dua pesanan untuk lahan yang sama sebelum mulai menanam. Rencana tanpa pesanan tidak dihitung.
- **Resep bayam dan kangkung**: boleh, tetapi data contoh menandai bahwa **dosis dan harganya dikarang**, bukan dari desain (`asal_angka_contoh = 'dikarang'`).
- **Nilai pengukuran**:
  - "belum diisi" ditandai dengan `null`, bukan 0;
  - nilai 0 sah dan divalidasi terhadap skala besaran (pH 0–14, PPM minimal 0);
  - PPM 0 menghasilkan status **Terlalu rendah** beserta sarannya.
- **Jarak Haversine**: sudah benar.

## D-35. Kontrak API dan data tiruan (Tahap 3)
Tafsiran teknis saat menulis `docs/kontrak-api.md`. Tidak mengubah perilaku produk; bila ada yang keliru, pemilik produk tinggal mengoreksi.
- **Kolom tambahan di luar Model Data PRD** (ditandai † di kontrak), masing-masing turunan keputusan yang sudah ada: `status`, `contoh`, `asal_angka_contoh` resep (D-11, D-12, D-34); `skala_min`/`skala_maks` besaran ukur (D-34); `status` dan `resep_contoh` siklus; `jumlah_polybag` dan `volume_tandon_liter` (D-15); `ke`, `harga_per_kg`, `dikirim_pada`, `batas_periksa_pada`, `dikonfirmasi_pada`, `dianggap_diterima`, `nilai_diterima` pada pengiriman dan status pengiriman `gagal` (D-01, D-03); jenis pembayaran `pencairan`, `pengembalian`, `kompensasi` dan `mode_uji_coba` (D-02, D-03, D-10); tabel `jurnal`, `sistem_hidroponik`, `konfigurasi` (P0-14, papan 14, D-28); `zona_waktu`, `setuju_privasi_pada`, `versi_privasi` (D-30, D-31); `alasan_ditolak` profil pembeli; `het_per_satuan` kelayakan subsidi.
- **Format waktu**: ISO 8601 UTC berakhiran `Z`; tanggal kalender `YYYY-MM-DD`; uang bilangan bulat rupiah.
- **Data contoh** memakai tanggal relatif (`H-13`, `H+0T07:00`, `B+2`) yang diterjemahkan saat dimuat, supaya demo selalu "hari ini" tanpa mengubah jam komputer.
- **Klien tiruan menyimpan perubahan di `localStorage`** perangkat (kunci `tani-muda:data-tiruan`), dan bisa diatur ulang lewat kontrol pengembangan. Bila versi data contoh berubah, data tersimpan diabaikan.
- **Kode OTP tiruan** tidak pernah dikirim lewat respons. Di mode tiruan, kode dibaca lewat kontrol pengembangan (pemilih akun demo, T4.01); aturan 5 menit, 5 percobaan, 60 detik kirim ulang, dan 5 kali per jam sama dengan backend.
- **`VITE_SUMBER_DATA=http`** sampai Tahap 6 menghasilkan galat `SUMBER_BELUM_TERSEDIA` di setiap pemanggilan, bukan layar kosong.
- Berdampak ke: T3.01 sampai T3.12, T5.03, T5.04.

## D-36. Tanggapan atas Tahap 3
- **Wilayah pilot**: jawaban pemilik produk masih berupa templat; yang dipakai adalah pilihan bawaannya: **pakai Lembang dulu, diganti setelah lokasi pilot pasti**. Kode wilayah dari situs ensiklopedia hanya untuk demo. **Sebelum seeder Tahap 5, semua kode wilayah wajib dicocokkan dengan data resmi Kemendagri** (kriteria selesai T5.08).
- **iPhone (P-12)**: pilihan bawaan D-32 disetujui.
- **Lahan Arif 140 m²**: disetujui.
- **Tanda contoh di data**: boleh di tingkat berkas dan resep. Di layar, label **"CONTOH, belum divalidasi penyuluh" wajib tampil di setiap tempat angka resep muncul**: kalkulator, perkiraan panen, jadwal (termasuk penggaris dan detail tugas), dan rentang pengukuran, sesuai D-12. Ini menjadi kriteria selesai di setiap tugas Tahap 4 yang menampilkan angka resep.
- **Perubahan T4.33** (halaman Masuk hanya memakai klien API): disetujui.
- **Pemilih akun demo (T4.01)**: hanya aktif di mode data tiruan dan **tidak pernah ada di build produksi**. Dicek otomatis setiap `npm run build`.
- **Tahap 4 dikerjakan per gelombang** berisi paling banyak 8 tugas, mengikuti alur demo (tabel di `rencana-kerja.md`). Setiap gelombang ditutup dengan lint, typecheck, test, build, tangkapan layar setiap halaman, dan satu commit lokal.
- Berdampak ke: T4.01–T4.41, T5.08.

## D-37. Tanggapan atas gelombang 1 Tahap 4
- Tangkapan layar gelombang 1 disetujui tanpa catatan.
- **Beberapa siklus aktif**: pil pemilih siklus di Beranda disetujui. Saat halaman dibuka, pil yang terpilih adalah **siklus dengan tugas paling mendesak**: yang punya tugas terlambat lebih dulu, lalu tugas hari ini, lalu tugas besok. Bila sama, ikuti urutan daftar siklus.
- **Salam ikut desain**: "Selamat pagi/siang/sore/malam, {nama}" menurut **jam setempat pengguna** (`pengguna.zona_waktu`), di semua keadaan Beranda. Batas jam: pagi 04.00–10.59, siang 11.00–14.59, sore 15.00–17.59, malam 18.00–03.59.
- **Tombol kanan atas Beranda di HP tetap avatar ke Profil.** Lonceng tidak dipakai di v1.
- **Banner "Besok" yang rinci** dikerjakan di gelombang 3 bersama langkah cara mengerjakan di resep (T4.11).
- **Lencana menu Pesanan** dikerjakan di gelombang 4: jumlah pesanan baru di sekitar sejak petani terakhir membuka menu Pesanan.
- **Penanda "tersimpan di HP, belum terkirim"** dikerjakan di T6.05.
- **Token `judul-masuk` 32/40** disetujui.
- **Persiapan demo**:
  - `npm run demo` menjalankan mode pengembangan dengan semua pengaturan demo menyala (sumber data tiruan, resep contoh tampil) tanpa bergantung pada isi `.env`. Halaman akun demo punya tombol "Atur ulang data demo".
  - Tugas opsional **T6.09 `build:demo`**: build khusus demo (data tiruan, pemilih akun demo, label "Mode demo" yang selalu terlihat) untuk hosting statis bila juri butuh tautan sebelum backend siap. Build produksi biasa tetap tanpa akun demo.
- Berdampak ke: T4.09, T4.18, T6.05, T6.09.

## D-38. Tanggapan atas gelombang 2 Tahap 4
- Tangkapan layar gelombang 2 disetujui tanpa temuan.
- **Harga rata-rata laporan** tetap didahulukan di atas harga contoh resep, tetapi **dibulatkan ke ratusan rupiah terdekat** sebelum dipakai menghitung (Rp1.649 → Rp1.600, Rp1.650 → Rp1.700). Harga di bawah Rp100 per satuan (mis. per ml) dibulatkan ke puluhan terdekat, paling kecil Rp10, supaya tidak menjadi nol. Aturan ini masuk kasus uji uang bersama (T5.02) supaya server memakai aturan yang sama. Setiap item menampilkan sumber harganya, misalnya "Rata-rata 5 laporan di kecamatanmu" atau "Harga contoh resep".
- **Merek tidak terpilih otomatis** di lembar Pilih merek: disetujui.
- **Subsidi**: bawaannya Nonsubsidi, **kecuali petani sudah menyatakan terdaftar di kelompok tani di profilnya**. Kolom baru `pengguna.terdaftar_kelompok_tani` (boolean, bawaan false), diisi lewat `PATCH /akun`; isiannya tampil di Ubah profil (T4.36). Di data contoh, Dewi (petani padi) terdaftar, Arif tidak.
- **Padi dengan label contoh** (tanpa "Resepnya sudah dicek penyuluh"): disetujui.
- **Rencana "Nanti saja"** tampil di menu Kebun (gelombang 3). Beranda memberi penanda kecil "n rencana belum dijadwalkan" yang membuka daftar rencana.
- **Panen jelek (jawaban P-20)**: resep punya kolom `persen_panen_jelek` (persen hasil saat panen jelek) dan `alasan_panen_jelek` (alasan umum), diisi penyuluh. Data contoh memakai 70% berlabel contoh. Ringkasan kalkulator menampilkan perkiraan untung atau rugi bila hasil panen hanya sebesar persentase itu.
- **Harga jual di kalkulator (jawaban P-21)**: urutannya harga kesepakatan (bila siklus terhubung ke pesanan), lalu harga pesanan terdekat, lalu **harga jual contoh per tanaman** (`komoditas.harga_jual_contoh`, ditambahkan ke data contoh). Sumbernya selalu tampil ("Dari pesanan Katering Bu Ratna", "Harga contoh"), dan petani tetap bisa mengubahnya.
- **P-22** (memecah bundel per halaman): dikerjakan di Tahap 6.
- Berdampak ke: T3.01, T4.05–T4.07, T4.09, T4.10, T4.36, T5.02, T5.05, T6.03.

## D-39. Tafsiran gelombang 4 Tahap 4 (Jual sisi petani), menunggu konfirmasi
- Gelombang 3 dilanjutkan atas pesan "lanjutkan" tanpa temuan baru.
- **Lencana menu Pesanan (D-37):** jumlah pesanan di sekitar yang dibuat setelah petani terakhir membuka menu Pesanan (tab Di sekitar atau Kiriman saya); pesanan yang sudah ia ambil tidak dihitung; belum pernah membuka = semua dihitung. Waktu terakhir dibuka disimpan **di perangkat** per pengguna (bukan di server); bila nanti perlu sama di semua perangkat, dipindah ke kolom pengguna di Tahap 5. `PesananUntukPetani` ditambah `dibuat_pada`.
- **Jadwal kirim yang masih terkejar:** petani yang mengambil pesanan hanya menanggung kiriman yang tanggalnya paling cepat hari ini + umur panen resep (`kirimanTerkejar`). Kiriman sebelumnya tetap terbuka untuk petani lain. Bila tidak ada satu pun yang terkejar, server menolak dengan galat baru `409 JADWAL_TERLALU_DEKAT`. Detail pesanan menulis "Kiriman ke-1 belum terkejar… Bagianmu mulai kiriman ke-2".
- **Setelah setuju kesepakatan**, siklus rencana dari pesanan menjadi aktif dengan tanggal tanam = umur panen sebelum kiriman pertama yang terkejar, dan tugasnya dibuat (jadwal tanam masuk ke kebun). Tugas dibuat untuk satu kali tanam; jadwal tiap bedengan pada tanam bertahap baru ditampilkan sebagai saran di detail pesanan.
- **Satu petani satu alokasi per pesanan.** Pesanan yang sudah diambil tetap tampil di daftar dengan tanda "Kamu sudah mengambil …"; mengambil lagi ditolak `STATUS_TIDAK_SESUAI`.
- **Alamat titik antar** (`alamat_antar`, `patokan`) dikirim ke petani setelah ia mengambil pesanan (sebelum setuju), karena kesepakatan menampilkan titik antar. Sebelum itu hanya nama desa. Peta pembeli di desktop memakai **titik tengah desa** antar (`titik_desa_antar`, data wilayah publik), bukan alamat (D-06 tetap).
- **"Tanya pembeli dulu"**: v1 belum punya pesan langsung; tombol membuka penjelasan bahwa pertanyaan disampaikan lewat admin, dengan tautan WhatsApp admin dari konfigurasi. Kesepakatan tetap menunggu.
- **Foto kualitas**: satu foto per kiriman (kolom `foto_kualitas`); papan 33 menggambar dua kotak foto. Jam antar ("sebelum pukul 07.00") belum ada di model data, jadi tidak ditampilkan.
- **Perbaikan logika Tahap 2:** luas total pesanan dihitung dari luas per panen sebelum dibulatkan. Sebelumnya 4 kg kangkung di lahan kosong 8 m² dinyatakan "hanya cukup untuk 4 kg" (2,67 × 3 = 8,01 m²).
- Berdampak ke: T3.02, T4.18–T4.21, T5.10, T5.13.

---

## Riwayat
| Tanggal | Perubahan |
| --- | --- |
| 2026-10-04 | D-01 sampai D-11 ditetapkan |
| 2026-10-05 | D-12 sampai D-18 ditetapkan. Butir turunan di D-03, D-06, dan D-11 dikonfirmasi dan dirujuk ke keputusan baru. Jalur tangkapan layar di D-07 diganti mengikuti D-18 |
| 2026-10-05 | D-19 dan D-20 ditetapkan: backend Laravel + MariaDB tanpa Docker, tampilan dikerjakan lebih dulu. Butir OTP di D-10 dan butir penegakan di D-13 dan D-14 disesuaikan |
| 2026-10-05 | D-21 sampai D-25 ditetapkan: cookie Sanctum (token untuk React Native), 404 untuk data orang lain, konfirmasi otomatis setiap 15 menit, siap deploy VPS, PHP 8.3+ terpisah |
| 2026-10-07 | D-39 ditulis: tafsiran gelombang 4 (lencana pesanan di perangkat, jadwal kirim yang terkejar umur panen, siklus aktif setelah setuju, satu alokasi per petani, alamat setelah ambil, Tanya pembeli lewat admin, perbaikan luas total pesanan) |
| 2026-10-05 | D-26 sampai D-34 ditetapkan: menu Kebun, wilayah berkode Kemendagri, konfigurasi lewat git, video, persetujuan privasi draf, UTC + zona waktu per pengguna, iPhone, repositori, tanggapan tafsiran Tahap 2 (kapasitas dan nilai pengukuran diubah) |
| 2026-10-05 | D-35 ditetapkan: tafsiran teknis kontrak API dan data tiruan (kolom tambahan, format waktu UTC, tanggal relatif, penyimpanan tiruan, OTP tiruan) |
| 2026-10-06 | D-38 ditetapkan: tanggapan gelombang 2 (pembulatan rata-rata ke ratusan, sumber harga, subsidi dari profil, rencana di Kebun, panen jelek di resep, urutan harga jual, P-22 di Tahap 6) |
| 2026-10-06 | D-37 ditetapkan: tanggapan gelombang 1 (pil siklus paling mendesak, salam menurut jam setempat, avatar ke profil, lencana pesanan di gelombang 4, `npm run demo`, tugas opsional `build:demo`) |
| 2026-10-05 | D-36 ditetapkan: tanggapan Tahap 3 (wilayah Lembang sementara dan wajib dicocokkan dengan data resmi, label contoh sebagai kriteria Tahap 4, pemilih akun demo hanya mode tiruan, gelombang Tahap 4) |
