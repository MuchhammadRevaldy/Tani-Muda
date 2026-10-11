# Keputusan Produk dan Teknis Tani Muda

**Aturan utama: jika isi dokumen ini bertentangan dengan PRD atau desain, dokumen ini yang berlaku.** Urutan kekuatan: `keputusan.md` > `aturan-proyek.md` > PRD dan desain (`design/`). Keputusan baru ditambahkan di bawah dengan nomor berikutnya; jangan mengubah isi keputusan lama tanpa memberi tahu pemilik produk.

Ditetapkan oleh pemilik produk, 4 Oktober 2026. Butir bertanda **(turunan)** adalah konsekuensi yang saya tarik dari keputusan pemilik dan masih perlu dikonfirmasi.

---

> **Jalur berkas.** Sejak T5.01 (D-49) proyek React ada di `frontend/`. Keputusan yang ditulis sebelumnya menyebut jalur dari akar lama (`src/…`, `scripts/…`, `public/…`); bacalah sebagai `frontend/src/…` dan seterusnya. Isi keputusan lama tidak diubah.

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

## D-39. Tafsiran gelombang 4 Tahap 4 (Jual sisi petani); ditanggapi di D-40
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

## D-40. Tanggapan atas gelombang 4 Tahap 4 dan tes yang sempat gagal
- Tangkapan layar gelombang 4 diperiksa pemilik produk. Tanggapan atas tafsiran D-39:
  1. **Lencana di perangkat:** disetujui.
  2. **Jadwal yang terkejar umur panen:** disetujui. Ditulis dengan bahasa petani: "Kamu bisa ikut mulai kiriman tanggal 2 November, jadi 7 kiriman. Kiriman sebelum itu tetap terbuka untuk petani lain, karena panenmu belum sempat." Galat `JADWAL_TERLALU_DEKAT` punya teks ramah di `src/teks/galat.ts`.
  3. **Diubah: tanam bertahap untuk pesanan rutin.** Setiap kiriman yang ditanggung petani menjadi satu siklus (petak) dengan tanggal tanam sendiri (tanggal kiriman − umur panen) dan jadwal perawatan sendiri. Kolom baru `siklus.petak_ke` (kiriman ke-n). Petak satu alokasi dikelompokkan lewat `siklus.alokasi_pesanan_id`; API menambahkan `kelompok_pesanan` (dihitung server) pada siklus dan `siklus_ids` pada alokasi. Saat diambil, petak tersimpan sebagai `rencana` dengan tanggal tanam rencananya; saat disetujui semuanya menjadi `aktif` dan tugasnya dibuat. Petak yang tanggal tanamnya sudah lewat saat disetujui dilepas beserta kirimannya. Pesanan sekali panen tetap satu siklus.
     - **Kapasitas lahan** untuk petak satu alokasi dihitung dari **puncak petak yang tumbuh bersamaan** (rentang tanam sampai panen, hari panen tidak termasuk), sama dengan rumus PRD "luas per panen × jumlah petak bersamaan" (`puncakBersamaan`, `muatSiklusBanyak`, `rencanaPetak`). Siklus biasa tetap dijumlah utuh.
     - **Tampilan:** Beranda dan pil siklus menampilkan satu pil per pesanan ("Sawi hijau untuk Katering Bu Ratna"); kartunya menampilkan petak yang paling mendesak atau yang sudah ditanam dan paling dulu dipanen; tugas hari ini dikelompokkan per pesanan dengan nama petak ("Petak panen 20 Okt") di setiap tugas. Menu Kebun menampilkan satu kartu kelompok yang bisa dibuka berisi semua petak, dengan ringkasan "12 petak · 2 sedang tumbuh · tanam berikutnya …". Petak dinamai menurut tanggal kirimannya.
     - **Data contoh:** Arif memenuhi Katering Bu Ratna dengan 12 petak sawi (6,67 m², bergilir mingguan) dan Warung Nasi Bu Imas dengan 4 petak bayam (dua sudah dipanen). Sawi 100 m² di kebun belakang menjadi siklus biasa. Kebun belakang diperluas dari 140 menjadi 180 m² supaya pesanan Kafe dan Lestari tetap muat (sisa 44,98 m²).
  4. **Satu alokasi per petani:** disetujui. Jumlah masih bisa diubah sebelum menekan Setuju: tombol "Ubah jumlah" di kesepakatan, endpoint baru `PATCH /alokasi/{id}` yang membuat ulang petaknya (`ubahAlokasi`).
  5. **Alamat setelah diambil:** disetujui. Sebelum diambil hanya jarak dan nama desa (peta memakai titik tengah desa).
  6. **"Tanya pembeli dulu" lewat admin:** disetujui untuk v1. **Fitur pesan petani–pembeli dicatat sebagai P1-12** di PRD.
  7. **Diubah: dua foto per kiriman.** Foto hasil panen (`foto_kualitas`, wajib sebelum dikirim) dan foto di timbangan (`foto_timbangan`, opsional, endpoint `POST /kiriman/{id}/foto-timbangan`, bisa dihapus). **Kolom opsional `pesanan.batas_jam_antar`** ("HH:MM", divalidasi), tampil sebagai "Antar sebelum 07.00" di daftar, detail, kesepakatan, dan Kiriman saya; data contoh mengisinya.
- **Tes yang sempat gagal (1 dari 792, satu kali, saat coverage pada 7 Oktober sekitar pukul 21.50 WIB).** Nama tesnya tidak tercatat karena saat itu hanya baris ringkasan yang disimpan; kelalaian ini diperbaiki (skrip pengulang sekarang mencatat nama tes yang gagal). Percobaan mengulang: 12 putaran (biasa dan coverage, urutan biasa dan acak), 8 jam berbeda (lewat `UJI_WAKTU`), dan 3 putaran coverage dengan semua inti CPU dibebani; semuanya lulus. Yang ditemukan adalah kelemahan struktural yang cukup untuk menjelaskan kegagalan sekali-sekali:
  1. **Jam.** Tes halaman memakai jam asli, padahal data contoh dibuat relatif terhadap "sekarang" dan halaman membaca Date. Hasilnya bergantung pada jam saat tes dijalankan: kiriman Imas ke-3 dianggap diterima setelah 13.00 (tes Kiriman saya gagal karena ini pada malam hari saat ditulis, lalu ditambal dengan jam tiruan hanya di klien tiruan, sehingga ada dua jam berbeda di satu tes), salam pagi/siang/sore/malam, dan pergantian hari di antara pembuatan data dan pemeriksaan.
  2. **Beban mesin.** Batas tunggu `findBy`/`waitFor` 1 detik, padahal satu tes halaman bisa memakan 1,7 detik; saat coverage atau peramban lain berjalan, satu penantian bisa melewati 1 detik.
  3. **Keadaan bersama.** localStorage tidak dikosongkan di antara tes (lencana Pesanan menyimpan waktu terakhir dilihat), dan pewaktu palsu bisa bocor bila tes gagal sebelum `useRealTimers`.
  - **Perbaikan akar** di `src/uji/persiapan.ts`: Date dikunci ke Senin 5 Oktober 2026 pukul 08.00 WIB untuk semua tes jsdom (tetap berjalan, sama dengan tes kontrak API), bisa diganti lewat `UJI_WAKTU` untuk menyapu jam lain; localStorage dan sessionStorage dikosongkan sebelum setiap tes; batas tunggu Testing Library 5 detik; pewaktu nyata selalu dipulihkan setelah setiap tes.
  - **Penyapuan jam sesudah perbaikan** (`UJI_WAKTU`, 8 jam sepanjang 5 Oktober WIB) menemukan satu ketergantungan jam lagi di tes baru Kiriman saya (setelah 13.30 kiriman ke-3 terkonfirmasi otomatis); tes itu dikunci ke jam pagi, lalu kedelapan jam lulus. Penyapuan yang mengganti tanggal sengaja tidak dipakai sebagai bukti, karena tes halaman memeriksa tanggal yang dihitung dari tanggal kunci.
  - **Bukti:** seluruh tes (813) dijalankan 21 kali berturut-turut pada kode akhir: 7 kali urutan acak, 7 kali coverage dengan urutan acak, 7 kali coverage; tidak ada yang gagal.
- Berdampak ke: T3.01, T3.02, T4.09, T4.10, T4.18–T4.21, T4.24–T4.27 (pembeli melihat petak terkini dan dua foto), T5.05, T5.10, T5.13.

## D-41. Tafsiran gelombang 5 Tahap 4 (sisi pembeli); ditanggapi di D-42
- **Simulasi hasil bayar di mode uji coba.** Penyedia pembayaran tiruan selalu berhasil, padahal T4.41 meminta hasil gagal dan menunggu juga bisa diperagakan. `POST /pembeli/pesanan/{id}/bayar-uang-muka` menerima `simulasi: 'berhasil' | 'gagal' | 'menunggu'` yang **hanya berlaku di mode uji coba** (diabaikan di mode nyata). Gagal mencatat baris pembayaran `gagal` dan menjawab galat baru `402 PEMBAYARAN_GAGAL`; pesanan tetap belum dibayar. Menunggu mencatat baris `menunggu`; bila kemudian berhasil, baris itu diperbarui menjadi `ditahan`. Konfigurasi punya kolom baru `pembayaran_uji_coba` (true selama D-10 berlaku) supaya halaman tahu kapan menampilkan label "Mode uji coba" dan pilihan simulasi.
- **`rating_saya` pada kiriman** (dihitung server): nilai yang sudah diberikan pengguna pembaca, supaya halaman tidak menawarkan rating dua kali.
- **Dasbor pembeli:** penggaris tiap kebun hanya menampilkan pin Panen, karena pembeli tidak menerima jadwal tugas petani (papan 36 menggambar pin Pupuk dan Cek hama). "Ubah tawaran" pada bagian yang belum ada petaninya tidak dibuat (belum ada endpoint ubah pesanan); yang tersedia "Batalkan pesanan" dengan aturan P0-27.
- **Formulir pesanan:** pilihan frekuensi "Seminggu sekali" dan "Dua minggu sekali" (papan juga menggambar "Dua kali seminggu", yang tidak bisa dinyatakan dengan `frekuensi_hari` bilangan bulat); lama 1–3 bulan (papan menggambar 6 bulan, PRD membatasi 3 bulan). Kiriman pertama paling cepat = hari kirim pilihan setelah hari ini + umur panen, supaya petani yang menanam hari ini terkejar. Batas jam antar memakai `batas_jam_antar` (D-40); titik peta tidak dibuat, desa titik antar = desa usaha pembeli.
- **Konfirmasi kiriman:** alasan penolakan memakai empat pilihan D-14 (papan menggambar lima kotak centang). Pratinjau pembayaran dihitung di halaman dengan `konfirmasiKiriman`; angka final dari server.
- **Data usaha pembeli:** pembeli yang belum punya data usaha diarahkan ke `/pembeli/daftar`; desa usaha dipilih di formulir ini karena pilih peran pembeli tidak menanyakan desa.
- **Tes yang sempat gagal di gelombang ini** (1 dari 3 putaran acak): tes data usaha pembeli mencari teks "Menunggu verifikasi" tepat setelah pindah ke dasbor, padahal formulir sebelumnya memuat teks yang sama; kadang yang ditemukan adalah elemen formulir yang sedang dilepas. Tes sekarang menunggu judul dasbor dulu. Pola ini (mencari teks yang juga ada di halaman sebelumnya tepat setelah navigasi) dihindari di tes berikutnya.
- Berdampak ke: T3.02, T4.22–T4.28, T4.41, T5.07, T5.11.

## D-42. Tanggapan atas gelombang 5 Tahap 4
- Tangkapan layar gelombang 5 dan perbaikan D-40 diperiksa; penanganan tes yang kadang gagal disetujui.
- **Simulasi hasil bayar** hanya di mode uji coba: disetujui.
- **Penggaris di sisi pembeli** hanya menampilkan umur tanaman dan pin Panen; pin Pupuk dan Cek hama tidak tampil: disetujui.
- **"Ubah tawaran" tidak dibuat di v1.** Dicatat sebagai **P1-13**: pesanan hanya bisa diubah selama belum ada alokasi; setelah ada alokasi, hanya bisa dibatalkan sesuai aturan pembatalan PRD (P0-27).
- **Frekuensi "Dua kali seminggu"**: dicatat sebagai **P1-14**.
- **Durasi maksimal tetap 3 bulan** sesuai PRD (P0-19).
- **Titik peta pada titik antar**: tidak dibuat.
- **Alasan penolakan**: tetap empat pilihan D-14, satu alasan utama ditambah keterangan.
- Berdampak ke: T4.22, T4.23, T4.25.

## D-43. Tafsiran gelombang 6 Tahap 4 (Belajar); ditanggapi di D-44
- **Modul tahap berjalan (P0-06):** modul punya kolom baru `hst_mulai` (hari mulai tahap dihitung dari tanggal tanam, negatif = sebelum tanam). Modul tahap berjalan = modul terakhir yang hari mulainya sudah tiba menurut hari ke-n siklus (`modulTahapBerjalan`); belum tanam = modul pertama. Beranda menampilkan tautan "Tahap sekarang" di bawah kartu siklus.
- **"Sisa 1 menit" (sedang ditonton):** posisi tonton disimpan **di perangkat** per pengguna, bukan di server; modul selesai tetap dicatat lewat `progres_modul` saat video habis ditonton atau "Tandai selesai".
- **"Tersimpan offline":** tombol unduh menyimpan video di Cache Storage peramban; batas total dari konfigurasi (`batas_unduhan_offline_mb`, 200 MB). Pemutaran dari simpanan saat tanpa sinyal dilayani service worker di Tahap 6 (T6.05, T6.06). Bila Cache Storage tidak tersedia, tombol unduh disembunyikan. "Kelola unduhan" belum dibuat; panel Unduhan menampilkan pemakaian.
- **Video contoh:** tiga klip pengganti WebM ±20 detik dibuat dengan `scripts/buat-video-contoh.mjs` (canvas + MediaRecorder di Chrome), bertuliskan "Video contoh · rekaman asli menyusul", sampai tim merekam MP4 360p (D-29). Modul lain menampilkan "Video modul ini sedang disiapkan bersama penyuluh".
- **Pemutar:** kontrol sendiri berteks Indonesia ≥ 48px (Putar/Jeda, −10/+10 detik, penggeser posisi, Layar penuh), bukan kontrol bawaan peramban. "Pilih kualitas rendah": hanya 360p yang tersedia (D-29), jadi ditampilkan sebagai keterangan, bukan pilihan.
- **Ketahanan tes:** saat gelombang ini dikerjakan, RAM bebas mesin sekitar 2 GB (memori sudah dimampatkan Windows). Dengan banyak pekerja paralel, tes halaman yang biasanya 0,2–2 detik menjadi 5–16 detik. Perbaikan: Vitest memakai 2 pekerja, batas waktu tes halaman 15 detik, tes pendaftaran yang panjang dipecah dua, dan tes `siapkanKlien` (memuat modul tiruan dan latensi buatan) diberi batas sendiri 20 detik. Tes terakhir ini memakan ±2 detik saat mesin sepi dan bisa melewati 5 detik saat mesin sibuk, jadi kandidat kuat untuk kegagalan sekali-sekali 7 Oktober yang namanya tidak tercatat. Putaran acak juga menemukan satu cacat nyata di kode gelombang ini: tautan modul tahap di Beranda sempat menunjuk modul pertama sebelum detail siklus termuat; diperbaiki.
- Berdampak ke: T3.06, T4.09, T4.30, T4.31, T6.05, T6.06.

## D-44. Tanggapan D-43; tafsiran gelombang 7 Tahap 4 (halaman depan, profil, halaman statis); ditanggapi di D-45

**Tanggapan pemilik produk atas D-43 (8 Okt 2026):**
- **Modul per tahap dan tautan di Beranda:** setuju.
- **Posisi tonton di HP:** setuju. **Status selesai ditonton wajib lewat klien API** (`progres_modul`), karena dipakai untuk progres dan metrik. Sudah begitu sejak gelombang 6: video habis ditonton dan "Tandai selesai" sama-sama memanggil `POST /modul/{id}/selesai`; yang disimpan di perangkat hanya posisi detik untuk melanjutkan. Kini dikunci tes halaman (peristiwa `ended` → `progres_modul` tercatat, posisi di perangkat dihapus).
- **Unduhan di peramban:** setuju. **"Kelola unduhan" dikerjakan di T6.06 dan wajib ada sebelum fitur offline didemokan:** hapus unduhan per modul dan sekaligus semua, dengan ukuran setiap unduhan ditampilkan.
- **Video contoh:** setuju untuk pengembangan. Tim merekam 2–3 video asli MP4 360p. Cara pasang: taruh `<id-modul>.mp4` di `public/video/modul/`, jalankan `npm run pasang-video`. Skrip memeriksa nama, format, dan batas `batas_video_mb`, lalu menulis `src/api/tiruan/data/video-modul.json` beserta ukurannya. Klien tiruan langsung memakai video itu tanpa perlu atur ulang data demo; seeder Tahap 5 membaca berkas yang sama. Langkahnya ada di README bagian "Memasang video modul".
- **Kontrol pemutar buatan sendiri:** setuju, dengan syarat semua kontrol bisa dipakai dengan keyboard dan berlabel untuk pembaca layar. Diperiksa dan dirapikan: semua kontrol tombol asli atau penggeser `range` asli (Tab, Enter, Spasi, panah); tombol tanpa teks punya `aria-label` dan `title`; penggeser punya `aria-valuetext` "0:04 dari 0:19"; teks waktu disembunyikan dari pembaca layar supaya tidak terbaca ganda; tombol Layar penuh disembunyikan bila peramban tidak mendukung; pesan video gagal berperan `status`. Dikunci tes keyboard.
- **Catatan performa:** RAM bebas laptop sekitar 2 GB. Dicatat di `arsitektur-backend.md` bagian 2b beserta saran hemat memori untuk Tahap 5 dan demo.

**Tafsiran gelombang 7 (menunggu konfirmasi):**
- **Angka di halaman depan (D-08):** endpoint baru tanpa masuk `GET /publik/contoh` mengembalikan komoditas, cara tanam, dan resep terbaru yang terlihat publik. Modal, titik impas, perkiraan panen, dan untung dihitung `angkaContoh` dengan rantai fungsi yang sama dengan kalkulator, tanpa subsidi dan tanpa harga laporan sekitar. Sawi 100 m² = Rp430.000, impas 86 kg, untung Rp320.000 (sama dengan papan). Padi 1.000 m² = **Rp1.715.000, impas 264 kg gabah**, berbeda dari papan (Rp1.289.000, 199 kg) karena papan memakai harga subsidi; angka tanpa subsidi dipakai karena itu bawaan kalkulator bagi yang belum terdaftar di kelompok tani. Masukan contoh (100 m², 1.000 m², hari ke-13 dan ke-18, 8 kg per minggu, dua pembeli ilustrasi) ditaruh di `CONTOH_LANDING`. Bila resep contoh tidak terlihat publik, bagian berangka disembunyikan dan teksnya tetap tampil.
- **Kalimat "Panduan sudah siap untuk …":** dari `status_resep` komoditas. Yang menyusul diambil tiga komoditas pertama yang segera hadir (kini Pakcoy, Cabai rawit, Tomat; papan menulis cabai, tomat, jagung).
- **"Mulai sebagai petani" / "Saya pembeli":** ke `/masuk?peran=…`. Peran disimpan di sessionStorage dan menjadi pilihan awal di Lengkapi akun. Pengguna lama tidak terpengaruh.
- **Kartu "Besok: …" di hero desktop:** dari tugas besok resep sawi contoh dan langkah pertama cara mengerjakannya, bukan contoh pupuk padi di papan.
- **Profil:** statistik dari data: siklus selesai dari `GET /siklus`, kg terjual = bagian kiriman yang diterima (kiriman diterima dan ditolak sebagian, dikurangi bagian ditolak), rating dari `GET /pengguna/{id}/rating`. Nomor HP tampil "0812••••0001". Kebun: desa, ringkasan lahan ("180 m² · 200 lubang · 2 lahan", ke Lahan saya), komoditas dari semua siklus, dan "Terdaftar di kelompok tani" tanpa nama kelompok (tidak disimpan, D-38). **Pengingat diatur per siklus (P0-38)**, jadi kartu Pengingat berisi satu baris per siklus atau kelompok petak aktif dengan jam pagi, menuju pengaturan siklus itu, bukan saklar global seperti papan. Catatan admin (D-03) tampil sebagai kartu tersendiri hanya bila ada.
- **Ubah profil:** foto lewat `AmbilFoto` (dikecilkan di HP) lalu `POST /berkas`; Hapus foto; nama; desa dicari dengan `GET /wilayah`; isian "Saya terdaftar di kelompok tani"; pratinjau untuk pembeli di desktop. Simpan hanya mengirim yang berubah lalu kembali ke Profil dengan "Profil tersimpan". Mengganti desa membatalkan cache pesanan dan referensi, sehingga jarak pesanan dan jumlah pesanan sekitar dihitung ulang.
- **Ganti nomor HP:** endpoint baru `POST /akun/nomor-hp/otp` dan `PUT /akun/nomor-hp`, dengan galat baru `409 NOMOR_SUDAH_DIPAKAI` dan validasi `NOMOR_SAMA`. Kode dikirim ke nomor baru; nomor diganti setelah kode cocok. Panel "Kode uji" ikut tampil di dialog ini hanya di mode pengembangan.
- **Halaman statis:** `/aturan-pakai`, `/privasi`, `/tentang`, `/kontak`, `/bantuan`, terbuka tanpa masuk, berlabel "Draf, belum ditinjau ahli hukum". Angka aturan dan kontak admin dari konfigurasi. Kaki halaman depan menambah tautan Aturan pakai dan Bantuan di samping tiga tautan papan. Kontak membuka WhatsApp admin (`wa.me`). Isi Tentang tidak menyebut lokasi pilot karena belum ditetapkan. Tangkapan diberi nomor turunan 52–56.
- **Penggaris umur tanam:** di halaman depan ditemukan tangkai pin tingkat atas menembus label pin tingkat bawah (Pupuk 2 hari ke-14 di atas Siangi rumput hari ke-11); cacat yang sama ada di Beranda desktop. Tata letak kini menggeser label yang tertembus ke posisi lain yang muat, atau menaikkan pinnya ke tingkat di atas, sehingga penggaris sawi hari ke-13 menjadi tiga tingkat. Tes paritas dengan algoritma desain tetap lulus; aturan tambahan ini di luar algoritma desain.
- Berdampak ke: T4.09, T4.31, T4.32, T4.34, T4.35, T4.36, T4.37, T5.03, T6.06.

## D-45. Tanggapan D-44 (halaman depan, ganti nomor, penggaris, ukuran bundel)
- **`GET /publik/contoh`:** setuju dengan batasan: hanya data untuk contoh perhitungan halaman depan, bukan seluruh isi resep; tanpa data pengguna; diberi batas jumlah permintaan di backend. Respons kini `{ komoditas, contoh }`: komoditas hanya `id`, `nama`, `satuan_panen`, `status_resep`; `contoh` hanya untuk tiga pasangan yang dihitung halaman depan (sawi bedengan, padi sawah, bayam bedengan), berisi harga jual contoh, hasil per satuan, umur panen, input untuk modal, dan tugas tanpa rentang ukur atau saran (cara mengerjakan hanya langkah pertama). Batas laju backend: 60 permintaan per menit per alamat IP (`arsitektur-backend.md` bagian 14).
- **Angka padi tanpa subsidi:** setuju. Keterangan "Dihitung dengan harga tanpa subsidi" ditambahkan di bawah angka di pilar Hitung, dan kartu contoh di hero berlabel "Contoh perhitungan" supaya tidak terbaca sebagai janji untung.
- **Pengingat per siklus di Profil:** setuju.
- **Ganti nomor HP:** setuju. **Setelah nomor berhasil diganti, semua sesi lain pengguna itu berakhir**; sesi yang sedang dipakai tetap, dengan ID sesi diperbarui. Ditulis di kontrak (`PUT /akun/nomor-hp`), `arsitektur-backend.md` bagian 5, dan syarat tes T5.09. Klien tiruan hanya punya satu sesi per peramban, jadi aturan ini diuji di backend.
- **Perbaikan penggaris:** setuju, tanpa perubahan label pin di HP.
- **Selisih kg terjual:** wajar, tidak diubah.
- **Ukuran bundel (P-22):** tetap dikerjakan di Tahap 6, dengan target terukur: **JavaScript yang dimuat di halaman pertama paling besar 200 kB setelah gzip**, dengan pemecahan per halaman (lazy route). Ditambahkan di T6.03 dan diperiksa otomatis di `scripts/cek-build.mjs`.
- Berdampak ke: T4.32, T4.36, T5.09, T5.13, T6.03.

## D-46. Tafsiran gelombang 8 Tahap 4 (panel admin, panel mentor, pemeriksaan menyeluruh); ditanggapi di D-47
- **Daftar petani untuk admin:** endpoint baru `GET /admin/petani` → `PetaniRingkasAdmin[]` (`id`, `nama`, `desa`, `status_akun`, `jumlah_catatan`, `siklus_aktif`), tanpa nomor HP dan titik lahan (D-06), terurut menurut jumlah catatan. Tanpa daftar ini admin tidak bisa menemukan petani untuk menulis catatan atau menonaktifkan (kontrak sebelumnya hanya `GET /admin/petani/{id}`).
- **Panel:** satu kepala dengan menu sesuai peran. Admin: Verifikasi pembeli (`/admin`), Sengketa (`/admin/sengketa`), Petani (`/admin/petani`, `/admin/petani/:id`), dan juga menu mentor. Mentor: Resep (`/mentor`), Permintaan resep (`/mentor/permintaan`), editor (`/mentor/resep/baru`, `/mentor/resep/:id`). Desktop saja dengan tabel sederhana (D-07); di HP tabel digeser di dalam wadahnya dengan catatan "Panel ini dirancang untuk layar komputer".
- **Verifikasi pembeli:** Setujui langsung; Tolak lewat dialog dengan alasan wajib yang dikirim ke pembeli. Foto tempat usaha tampil kecil di tabel.
- **Sengketa:** penyaring Terbuka/Diputuskan; tiap baris memuat petani → pembeli, kiriman ke-n, alasan dan keterangan, foto kualitas dari petani dan foto penolakan, jumlah dan nilai bagian yang ditolak. Keputusan lewat dialog dengan catatan tidak wajib.
- **Catatan dan status petani:** jenis "Tidak memberi kabar" atau "Lainnya"; catatan terlihat petani di profilnya (D-03). Nonaktifkan sementara / Aktifkan kembali satu tombol.
- **Editor resep:** semua kolom resep bisa diubah: tanaman dan hasil, standar kualitas, bahan dan alat (dosis, dasar dosis, satuan, isi per satuan beli, kemasan, harga contoh, alat sekali beli), tugas (sekali, berulang, ukur dengan rentang, skala, dan saran), cara mengerjakan, saran bila terlambat. Saat mengubah, tanaman dan cara tanam dikunci; simpan selalu versi baru berstatus draf (K3). Resep contoh tidak bisa divalidasi langsung; versi barunya yang divalidasi.
- **Aturan validasi resep** di `src/lib/validasi-resep.ts`, dipakai editor dan klien API (acuan backend): hasil > 0; umur panen bilangan bulat ≥ 1; panen jelek 0–100%; bahan bernama, dosis ≥ 0, kemasan > 0, harga ≥ 0; minimal satu tugas; HST tidak negatif dan tidak melewati umur panen; interval ≥ 1; skala min ≤ batas bawah ≤ batas atas ≤ skala maks. Kode galat baru `UMUR_PANEN_TIDAK_VALID`, `PERSEN_PANEN_JELEK_TIDAK_VALID`, `BATAS_UKUR_TIDAK_VALID`. **`POST /mentor/resep` kini selalu menjawab `422 VALIDASI` dengan rincian per kolom** (sebelumnya sebagian kode tingkat atas seperti `HST_TIDAK_VALID`), sama dengan endpoint lain.
- **Pemeriksaan menyeluruh (T4.40):** 53 alamat di 390, 768, 1280, dan 1440 px diperiksa otomatis (gulir mendatar, teks di bawah 16px, elemen keluar layar); satu masalah ditemukan dan diperbaiki (label pembaca layar di tabel editor melebarkan halaman). Hasil per papan di `docs/cek-halaman.md`. Semua tangkapan diambil ulang.
- **Naskah demo:** `docs/naskah-demo.md`. Adegan konfirmasi kiriman hanya bisa diperagakan **pukul 07.00–13.00 WIB**, karena data demo menjadwalkan kiriman ke Bu Imas dikirim pukul 07.00 dengan batas periksa 6 jam (D-01); di luar jam itu kiriman sudah dianggap diterima. Usulan: tombol "Jam demo" di pemilih akun demo (mode pengembangan saja) di T6.08.
- **Favicon dan ikon layar utama:** dari ikon "kebun" design system (logo), garis putih di atas kotak `daun-tua`, dibuat ulang dengan `node scripts/buat-ikon.mjs` (warna dibaca dari token): `favicon.svg`, `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), dan `ikon/ikon-192.png`, `ikon-512.png`, `ikon-maskable-512.png` untuk manifest PWA T6.03. Galat 404 favicon hilang.
- **Arsip Tahap 1:** enam tangkapan kerangka Tahap 1 dipindah ke `docs/tangkapan/arsip/tahap-1/`; README kini menampilkan Beranda petani dan dasbor pembeli.
- **"HST" di panel mentor:** pemeriksa bahasa kini mengizinkan "HST" hanya di `src/teks/panel.ts` dan `src/halaman/mentor/`, sesuai aturan-proyek.md 1.3; di halaman lain tetap ditolak.
- Berdampak ke: T4.29, T4.38, T4.39, T4.40, T5 (admin, mentor), T6.03, T6.08.

## D-47. Tanggapan D-46; Tahap 4 disetujui
- **Tahap 4 disetujui** pemilik produk setelah memeriksa tangkapan gelombang 8.
- **`GET /admin/petani`:** setuju, dengan pencarian nama atau desa (`?cari=`, tidak peka huruf besar), paginasi (`?halaman=&per_halaman=`, bentuk `Halaman<T>` seperti endpoint lain), khusus peran admin, dan hanya kolom yang dibutuhkan panel (`id`, `nama`, `desa`, `status_akun`, `jumlah_catatan`, `siklus_aktif`; tanpa nomor HP dan titik lahan). Panel admin mendapat kolom cari dan tombol Sebelumnya/Berikutnya (20 per halaman).
- **Galat simpan resep sebagai `VALIDASI` dengan rincian per kolom:** setuju.
- **Adegan demo yang bergantung jam:** diperbaiki sekarang, tanpa tombol "Jam demo". Data demo mengenal notasi baru **`J±n`** = n jam relatif terhadap saat data dibuat atau **Atur ulang data demo** ditekan (`tanggal-relatif.ts`, `jenis-data.ts`). Kiriman ke Bu Imas yang menunggu konfirmasi kini `dikirim_pada: J-1` dan `batas_periksa_pada: J+5` (6 jam, D-01), jadi selalu masih dalam batas periksa hingga 5 jam setelah atur ulang. Pada jam tes (08.00) hasilnya tetap 07.00 dan 13.00, sehingga tes lama tidak berubah. Versi data contoh naik ke 9 supaya peramban memakai data baru.
- **Pemeriksaan adegan naskah:** satu-satunya adegan yang bergantung jam adalah konfirmasi kiriman (langkah 9); langkah lain berbasis tanggal. Batasan jam dihapus dari `naskah-demo.md`. Naskah dijalankan dari awal sampai akhir setelah atur ulang pada pukul **09.00, 14.00, 19.00, dan 23.00 WIB**: ke-14 langkah berhasil di keempat jam. Pada pukul 23.00 banner menulis "Tiba pukul 22.00 … Periksa sebelum pukul 04.00" (batas di hari berikutnya).
- **"HST" hanya di panel mentor:** setuju.
- Berdampak ke: T4.29, T4.40, T5.08 (seeder membaca notasi `J±n`), T6.08.

## D-48. Perbaikan tampilan dan cadangan demo lokal sebelum Tahap 5
- **Jam yang melewati tengah malam:** satu pemformat untuk semua batas periksa dan jam kiriman: `waktuRelatif` (`src/lib/waktu-relatif.ts`, menentukan kemarin, hari ini, besok, atau tanggal lain di zona pengguna), `teksPukul` (`src/teks/waktu.ts`), dan hook `usePukul` (`src/api/use-pukul.ts`). Hasilnya "pukul 13.00", "besok pukul 04.00", "kemarin pukul 22.00", atau "Kamis, 8 Oktober pukul 04.00". Dipakai banner kiriman tiba di dasbor pembeli, "Periksa sebelum …" di Periksa kiriman, dan tahap uang serta "Dikirim … sampai …" di Kiriman saya. Diuji termasuk tengah malam tepat dan zona WITA/WIT.
- **Cadangan demo lokal (T6.09), tanpa deploy:** `npm run build:demo` membangun `dist-demo/` dengan MODE "demo": data tiruan, resep contoh tampil, pemilih akun demo dengan **Atur ulang data demo**, panel kode uji di Masuk, dan label **"Mode demo"** yang selalu terlihat (pojok kanan bawah; di HP di atas navigasi bawah) sekaligus tautan ke pemilih akun. `npm run preview:demo` menjalankannya di `http://localhost:4173`, termasuk membuka langsung atau memuat ulang rute dalam. Peramban yang belum punya data langsung disiapkan data demo dengan waktu relatif terhadap saat pertama dibuka (D-47). Fitur demo aktif bila `DEV || MODE === "demo"`, ditulis di setiap titik supaya dibuang dari build produksi; `cek-build.mjs` kini juga menolak teks "Mode demo" di `dist/`, dan `build-demo.mjs` memastikan semua bagian demo ada di `dist-demo/`. Pengaturan demo dipakai bersama `npm run demo` (`scripts/pengaturan-demo.mjs`).
- **Pemecahan bundel (P-22):** 43 halaman dimuat per rute (`React.lazy`); kerangka petani, pembeli, dan panel tetap tampil selama halaman dimuat. Penyedia rencana Hitung dipisah ke `konteks-rencana.tsx` supaya logika kalkulator tidak ikut entry. Ukuran diukur `scripts/ukur-bundel.mjs` dari manifest Vite (gzip level 9):

  | Rute | Sebelum | Sesudah (produksi, tanpa klien tiruan) | Sesudah, dengan klien tiruan (build sekarang dan build demo) |
  | --- | --- | --- | --- |
  | `/` | 236,7 kB (837,6 kB mentah, 1 berkas) | **151,3 kB** (459,3 kB mentah) | 196,4 kB |
  | `/beranda` | 236,7 kB | **163,4 kB** (487,4 kB mentah) | 212,2 kB |

  Target 200 kB (D-45) terpenuhi untuk build produksi yang memakai backend, dan diperiksa otomatis di `npm run build` (`ukur-bundel.mjs --batas 200`). Dengan klien tiruan, `/beranda` masih 12 kB di atas target karena klien tiruan dan data contoh (±45 kB gzip; `kebun.json` saja 370 kB mentah berisi 697 tugas yang dibuat lebih dulu). Bagian itu hilang saat klien HTTP tersambung di Tahap 6. Bila build demo juga harus di bawah 200 kB, usulannya: tugas data contoh dibuat dari resep saat data disiapkan, bukan disimpan di JSON.
- **Uji:** naskah demo dijalankan terhadap `preview:demo` di peramban kosong (tanpa menekan Atur ulang) pada pukul 10.00 dan 21.00, dengan langkah tambahan membuka `/kebun` sebelum masuk (diarahkan ke Masuk), lalu membuka dan memuat ulang `/kebun` dan `/kebun/siklus-arif-sawi/jadwal` setelah masuk: 15 langkah berhasil di kedua jam.
- Berdampak ke: T4.21, T4.22, T4.25, T6.03, T6.08, T6.09.

## D-49. Tanggapan D-48; pembagian Tahap 5 per gelombang
- **Hasil D-48 disetujui.**
- **Kelebihan 12 kB di build mode tiruan:** diterima; model data tiruan tidak diubah. **Target 200 kB berlaku untuk build produksi** (sudah diperiksa otomatis di `npm run build`).
- **Label "Mode demo":** konten dan kaki halaman diberi ruang kosong setinggi label selama label terpasang (`html.ada-label-demo` di `index.css`), dan di HP label naik ke atas navigasi bawah bila halaman memilikinya, sehingga label tidak menutupi banner atau konten apa pun. Tangkapan baru: `64-mode-demo-beranda`, `64-mode-demo-halaman-depan`, `64-mode-demo-dasbor-pembeli` (mobile dan desktop, build demo).
- **Tahap 5 dibagi enam gelombang** dengan tanda prioritas (rencana-kerja.md, bagian Tahap 5):
  - 5.1 [WAJIB]: T5.00 PHP 8.3+, susun ulang folder (T5.01), kerangka Laravel dan sambungan MariaDB, Pest, kasus uji bersama (T5.02, T5.03).
  - 5.2 [WAJIB]: migrasi dan seeder (T5.04–T5.08), termasuk memindah data contoh ke `shared/data-contoh/`.
  - 5.3 [WAJIB]: login OTP, akun, pilih peran, dasar Policy (T5.09, T5.10, bagian akun T5.11).
  - 5.4 [WAJIB]: endpoint Hitung dan Kebun: resep, lahan, siklus, rencana, tugas, pengukuran, pengeluaran (T5.11, T5.12, bagian kapasitas T5.14).
  - 5.5 [WAJIB]: endpoint Jual: pesanan, alokasi dengan penguncian baris, kesepakatan, pembayaran tiruan, kiriman, konfirmasi, rating (T5.13–T5.16 bagian Jual).
  - 5.6: scheduler dan web push [SEBAIKNYA] (T5.17, T5.18), lalu endpoint mentor, admin, dan sengketa [BOLEH DITUNDA] (T5.16 bagian admin/mentor), dan kecocokan kontrak (T5.19).
- Selama Tahap 5, frontend tetap memakai `VITE_SUMBER_DATA=tiruan` sebagai bawaan, sehingga demo bisa berjalan kapan saja.
- Berdampak ke: T5.00–T5.19.

## D-50. T5.00: lokasi PHP dan basis data tetap MariaDB XAMPP
- **PHP 8.5.11 NTS (x64) terpasang di `C:\php-8.5.11-nts-Win32-vs17-x64`** dan berada di PATH sistem. `C:\xampp\php` dihapus dari PATH sistem, sehingga `php` dan Composer memakai PHP 8.5. Folder itu diberi `php.ini` dari `php.ini-development` dengan `extension_dir` berisi jalur lengkap, sepuluh ekstensi wajib, batas unggah 4M/8M, dan `date.timezone = UTC`.
- **Basis data tetap MariaDB 10.4.32 dari XAMPP** sesuai D-25. MySQL 5.7 dari Laragon sempat dipertimbangkan karena memegang port 3306, lalu dibatalkan pemilik produk. Laragon tidak dipakai proyek ini; MySQL Laragon jangan dinyalakan bersamaan dengan XAMPP karena berebut port 3306.
- Dua basis data dibuat di MariaDB XAMPP dengan `utf8mb4` / `utf8mb4_unicode_ci`: `tani_muda` (pengembangan) dan `tani_muda_uji` (tes). Bawaan server `utf8mb4_general_ci`, jadi collation ditulis eksplisit.
- Berdampak ke: `arsitektur-backend.md` bagian 2 dan 2a, T5.00.

## D-51. Gelombang 5.1: kerangka Laravel, format galat, skrip satu perintah
Ditulis 11 Oktober 2026 sebagai tafsiran, **ditetapkan** dengan tanggapan pemilik produk pada hari yang sama:
- **419 memakai kode baru `SESI_KEDALUWARSA`**, bukan `BENTROK`, dengan teks sendiri "Sesimu sudah berakhir. Muat ulang halaman lalu coba lagi". Ditambahkan di `frontend/src/api/galat.ts` (kode dan status), `frontend/src/teks/galat-api.ts` (teks), `backend/app/Http/Galat/KodeGalat.php`, dan `kontrak-api.md` 1.4.
- **405 → 404:** disetujui.
- **`rincian` tidak dikirim bila kosong:** disetujui; `kontrak-api.md` 1.4 menulis tegas bahwa `rincian` opsional.
- **5xx tanpa rincian teknis:** disetujui.
- **`AGENTS.md`/`CLAUDE.md` bawaan Laravel dihapus dan lisensi `proprietary`:** disetujui **sementara**.
- Butir lain di bawah diterima seperti ditulis.

Isi tafsiran:
- **Format galat.** Semua galat `/api/*` diubah di satu tempat (`app/Http/Galat/PenerjemahGalat.php`). Pemetaan yang tidak tertulis di kontrak:
  - `rincian` **tidak dikirim bila kosong**, sama dengan `GalatApi.keJson()` di klien tiruan (rencana T5.03 menulis `{ kode, pesan, rincian }`);
  - **405** (metode salah untuk alamat yang ada) dijawab **404 `TIDAK_DITEMUKAN`**, seperti alamat yang tidak ada;
  - **419** (token CSRF tidak cocok) berstatus 419 dengan kode **`SESI_KEDALUWARSA`** (ditetapkan; tafsiran awal memakai `BENTROK`), supaya klien HTTP Tahap 6 bisa meminta `/sanctum/csrf-cookie` lagi;
  - 400, 413, 415 (permintaan tidak terbaca, terlalu besar) berkode `VALIDASI` dengan status aslinya; galat 5xx berkode `GALAT_SERVER` **tanpa rincian teknis walau `APP_DEBUG` menyala** (rinciannya tetap di log).
- **Teks dan status galat satu sumber.** `app/Http/Galat/KodeGalat.php` menyalin teks `frontend/src/teks/galat-api.ts` dan status `frontend/src/api/galat.ts`; tes Pest membaca kedua berkas TS itu dan gagal bila ada yang berbeda. Teks kode logika inti (`src/teks/galat.ts`) ditambahkan saat rumusnya diport (gelombang 5.4).
- **`GET /api/v1/kesehatan`** (tanpa masuk): `{ data: { status: "sehat", basis_data: "tersambung", waktu } }`, atau 503 `SUMBER_BELUM_TERSEDIA` bila basis data tidak terjangkau. Dicatat di `kontrak-api.md` bagian 3.12.
- **Pesan validasi umum** Bahasa Indonesia di `lang/id/validation.php` ("Isian harga kemasan wajib diisi."). Pesan itu cadangan: setiap Form Request menulis pesan dan nama kolomnya sendiri yang menyebut apa yang harus dilakukan (D-09), karena nama kolom bersarang tampil kurang rapi (mis. `nilai.pH`).
- **Waktu** di JSON selalu `YYYY-MM-DDTHH:MM:SS.mmmZ` (UTC, milidetik) lewat `Date::serializeUsing`, sama dengan klien tiruan.
- **Pembaca Pest kasus uji bersama** ada di `backend/tests/Unit/KasusUjiBersamaTest.php` (bukan `tests/KasusUjiBersama.php` seperti ditulis sebelumnya, karena Pest hanya menjalankan berkas `*Test.php`). Bentuk setiap kasus diperiksa; hasil rumus diperiksa per fungsi dan ditandai "belum diport" (15 fungsi, dilewati) sampai fungsi PHP didaftarkan di `ADAPTOR_HITUNG`.
- **Skrip satu perintah** `frontend/scripts/dev-lengkap.mjs` (`npm run dev:lengkap`, atau `npm run dev` di akar): memeriksa PHP 8.3+, `backend/vendor`, `backend/.env`, dan port basis data, lalu menjalankan `php artisan serve` dan Vite dalam satu proses Node; `--jadwal` dan `--antrean` opsional. Tanpa paket npm baru (`php artisan dev` bawaan Laravel 13 mengunduh `concurrently` lewat `npx`). `package.json` di akar hanya meneruskan `dev`, `demo`, `build:demo`, `preview:demo` ke `frontend/`.
- **Proxy Vite** `/api` dan `/sanctum` ke `http://127.0.0.1:8000` di `vite.config.ts` (juga untuk `vite preview`); alamat lain lewat variabel proses `TANI_MUDA_API`, karena `.env` frontend hanya boleh berisi `VITE_*` (arsitektur-backend.md 5a).
- **Kerangka Laravel yang dibuang atau diubah:** aset frontend Laravel (`package.json`, `vite.config.js`, `resources/css|js`, halaman `welcome`), contoh tes, serta `AGENTS.md`/`CLAUDE.md` bawaan kerangka (panduan umum Laravel Boost yang menyuruh memasang alat lain dan bertentangan dengan `aturan-proyek.md`). Lisensi `composer.json` diganti dari MIT ke `proprietary` sampai ada keputusan lisensi. Migrasi bawaan (`users`, `sessions`, `cache`, `jobs`, `personal_access_tokens`) dibiarkan sampai T5.04 menggantinya dengan tabel `pengguna`.
- **Memori diukur** (bukan perkiraan) saat `npm run dev` menyala: MariaDB 207 MB, PHP 52 MB, Node + Vite 377 MB, ditambah ±120 MB bila dijalankan lewat npm dari akar (`menjalankan-lokal.md` bagian 6).
- **Sisa di luar repositori:** folder `C:\php\8.5` (salinan PHP yang sama, tidak di PATH) dan dua basis data kosong di MySQL Laragon boleh dihapus.
- Berdampak ke: `kontrak-api.md` 1.4, 1.6, 3.12; `arsitektur-backend.md` 2, 2b, 3, 5a; T5.01–T5.03.

---

## Riwayat
| Tanggal | Perubahan |
| --- | --- |
| 2026-10-04 | D-01 sampai D-11 ditetapkan |
| 2026-10-05 | D-12 sampai D-18 ditetapkan. Butir turunan di D-03, D-06, dan D-11 dikonfirmasi dan dirujuk ke keputusan baru. Jalur tangkapan layar di D-07 diganti mengikuti D-18 |
| 2026-10-05 | D-19 dan D-20 ditetapkan: backend Laravel + MariaDB tanpa Docker, tampilan dikerjakan lebih dulu. Butir OTP di D-10 dan butir penegakan di D-13 dan D-14 disesuaikan |
| 2026-10-05 | D-21 sampai D-25 ditetapkan: cookie Sanctum (token untuk React Native), 404 untuk data orang lain, konfirmasi otomatis setiap 15 menit, siap deploy VPS, PHP 8.3+ terpisah |
| 2026-10-11 | D-51 ditetapkan: 419 memakai kode baru `SESI_KEDALUWARSA`; 405 → 404, `rincian` opsional, 5xx tanpa rincian teknis, penghapusan `AGENTS.md`/`CLAUDE.md` dan lisensi `proprietary` (sementara) disetujui |
| 2026-10-11 | D-51 ditulis: tafsiran gelombang 5.1 (rincian galat kosong tidak dikirim, 405 → 404, 419 → BENTROK (diganti saat ditetapkan), GET /kesehatan, pembaca Pest kasus bersama, skrip `npm run dev` satu perintah, proxy Vite, memori terukur) |
| 2026-10-11 | D-50 ditetapkan: PHP 8.5.11 di `C:\php-8.5.11-nts-Win32-vs17-x64`, basis data tetap MariaDB XAMPP (Laragon tidak dipakai) |
| 2026-10-09 | D-49 ditetapkan: D-48 disetujui (kelebihan 12 kB mode tiruan diterima), ruang kosong untuk label Mode demo, Tahap 5 dibagi gelombang 5.1–5.6 |
| 2026-10-09 | D-48 ditulis: jam sadar hari (besok/tanggal), build:demo dan preview:demo untuk cadangan demo lokal, pemecahan bundel per halaman (236,7 → 151,3/163,4 kB gzip) |
| 2026-10-09 | D-47 ditetapkan: Tahap 4 disetujui; GET /admin/petani dengan cari dan paginasi; adegan demo bergantung jam memakai notasi J±n relatif terhadap atur ulang; naskah diuji pada 09.00, 14.00, 19.00, 23.00 |
| 2026-10-09 | D-46 ditulis: tafsiran gelombang 8 (GET /admin/petani, panel admin dan mentor, validasi resep satu sumber, POST /mentor/resep menjawab VALIDASI, pemeriksaan responsif, jam demo konfirmasi kiriman) |
| 2026-10-09 | D-45 ditetapkan: tanggapan D-44 (contoh publik dibatasi, label contoh perhitungan dan tanpa subsidi, sesi lain berakhir setelah ganti nomor, target bundel 200 kB gzip) |
| 2026-10-08 | D-44 ditulis: tanggapan D-43 (selesai ditonton lewat API, Kelola unduhan di T6.06, cara pasang video asli, aksesibilitas pemutar, catatan memori) dan tafsiran gelombang 7 (angka halaman depan dari GET /publik/contoh, ganti nomor HP, profil, halaman statis, perbaikan penggaris) |
| 2026-10-08 | D-43 ditulis: tafsiran gelombang 6 (hst_mulai modul, posisi tonton di perangkat, unduhan lewat Cache Storage, video pengganti WebM, kontrol pemutar, ketahanan tes di mesin sibuk) |
| 2026-10-08 | D-42 ditetapkan: tanggapan gelombang 5 (simulasi bayar hanya mode uji coba, penggaris pembeli hanya pin Panen, Ubah tawaran dan Dua kali seminggu menjadi P1, durasi maks 3 bulan, tanpa titik peta, empat alasan D-14) |
| 2026-10-08 | D-41 ditulis: tafsiran gelombang 5 (simulasi hasil bayar di mode uji coba, `rating_saya`, batasan papan pembeli) |
| 2026-10-08 | D-40 ditetapkan: tanggapan D-39 (tanam bertahap per kiriman, ubah jumlah sebelum setuju, dua foto kiriman, batas jam antar, pesan sebagai P1-12) dan perbaikan akar tes yang sempat gagal (jam dikunci, penyimpanan dibersihkan, batas tunggu) |
| 2026-10-07 | D-39 ditulis: tafsiran gelombang 4 (lencana pesanan di perangkat, jadwal kirim yang terkejar umur panen, siklus aktif setelah setuju, satu alokasi per petani, alamat setelah ambil, Tanya pembeli lewat admin, perbaikan luas total pesanan) |
| 2026-10-05 | D-26 sampai D-34 ditetapkan: menu Kebun, wilayah berkode Kemendagri, konfigurasi lewat git, video, persetujuan privasi draf, UTC + zona waktu per pengguna, iPhone, repositori, tanggapan tafsiran Tahap 2 (kapasitas dan nilai pengukuran diubah) |
| 2026-10-05 | D-35 ditetapkan: tafsiran teknis kontrak API dan data tiruan (kolom tambahan, format waktu UTC, tanggal relatif, penyimpanan tiruan, OTP tiruan) |
| 2026-10-06 | D-38 ditetapkan: tanggapan gelombang 2 (pembulatan rata-rata ke ratusan, sumber harga, subsidi dari profil, rencana di Kebun, panen jelek di resep, urutan harga jual, P-22 di Tahap 6) |
| 2026-10-06 | D-37 ditetapkan: tanggapan gelombang 1 (pil siklus paling mendesak, salam menurut jam setempat, avatar ke profil, lencana pesanan di gelombang 4, `npm run demo`, tugas opsional `build:demo`) |
| 2026-10-05 | D-36 ditetapkan: tanggapan Tahap 3 (wilayah Lembang sementara dan wajib dicocokkan dengan data resmi, label contoh sebagai kriteria Tahap 4, pemilih akun demo hanya mode tiruan, gelombang Tahap 4) |
