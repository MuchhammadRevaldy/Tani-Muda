# Arsitektur Backend Tani Muda

Rancangan backend Laravel untuk Tahap 5 dan penyambungannya di Tahap 6 (keputusan D-19 sampai D-25 di `keputusan.md`). Dokumen ini menjelaskan **bagaimana** backend dibangun. Bentuk data dan daftar endpoint ditetapkan di `docs/kontrak-api.md` (dibuat di Tahap 3). Bila kedua dokumen bertentangan soal bentuk data, `kontrak-api.md` yang berlaku.

Semua pilihan di dokumen ini sudah diputuskan pemilik produk (D-19 sampai D-25). Pilihan baru yang belum diputuskan ditandai **(usulan)** dan dicantumkan di bagian Pertanyaan `rencana-kerja.md`.

---

## 1. Gambaran umum

```
┌─────────────────────────┐  JSON over HTTP   ┌──────────────────────────┐      ┌────────────────┐
│ frontend/ (React, PWA)  │ ────────────────▶ │ backend/ (Laravel 13 API) │ ───▶ │ MariaDB (XAMPP) │
│ klien API: tiruan → HTTP│ ◀──────────────── │ Policy, Domain/Hitung,    │      └────────────────┘
│ frontend/src/lib (rumus)         │   cookie Sanctum  │ scheduler, antrean, push  │
└─────────────────────────┘                   └──────────────────────────┘
            ▲                                              ▲
            └──────── shared/kasus-uji/*.json ─────────────┘
              (kasus uji perhitungan yang sama untuk Vitest dan Pest)
```

Prinsip:

1. **Server adalah sumber kebenaran.** Frontend boleh menghitung angka untuk tampilan (kalkulator, pratinjau), tetapi setiap angka uang yang disimpan dihitung ulang di server dengan rumus yang sama (bagian 9).
2. **Hak akses dijaga di server**, lewat Policy per peran dan validasi permintaan, bukan dengan menyembunyikan tombol.
3. **Kunci rahasia hanya ada di `backend/.env`** dan tidak pernah dikirim ke frontend. Frontend hanya punya variabel publik berawalan `VITE_`.
4. **Berjalan lokal tanpa Docker, siap deploy ke VPS** (D-24): semua konfigurasi lewat `.env`, tanpa path khusus Windows di kode.
5. **Antarmuka penyedia** untuk layanan luar (OTP/SMS, pembayaran, push), sehingga implementasi tiruan bisa diganti tanpa mengubah kode lain.

## 2. Lingkungan lokal (tanpa Docker)

| Bagian | Versi | Catatan |
| --- | --- | --- |
| PHP | **8.3 atau lebih baru, dipasang terpisah dari XAMPP** (D-25); terpasang 8.5.11 NTS di `C:\php-8.5.11-nts-Win32-vs17-x64` (D-50) | Wajib untuk Laravel 13. PHP XAMPP (8.1.25) tidak dipakai. Langkah pemasangan di bagian 2a. |
| Composer | 2.x | Sudah terpasang; harus memakai PHP baru (dicek di bagian 2a). |
| MariaDB | 10.4.32 (XAMPP) | Tetap dipakai (D-25). Didukung Laravel 13 (minimal 10.3). Cukup jalankan modul **MySQL** di XAMPP Control Panel (Apache tidak perlu). Dua basis data: `tani_muda` dan `tani_muda_uji`. Laragon tidak dipakai; bila terpasang, MySQL-nya jangan dinyalakan karena berebut port 3306 (D-50). |
| Node.js | 24 | Untuk frontend, sudah dipakai. |

Proses yang dijalankan saat pengembangan. **Satu perintah** `npm run dev` di akar repositori (`frontend/scripts/dev-lengkap.mjs`) menjalankan API dan frontend sekaligus setelah memeriksa PHP, `backend/.env`, dan basis data. MariaDB tetap dinyalakan manual di XAMPP Control Panel.

| Proses | Perintah | Alamat |
| --- | --- | --- |
| Frontend | `npm run dev` (di `frontend/`), atau bagian dari `npm run dev` di akar | http://localhost:5173, proxy `/api` dan `/sanctum` ke API (bagian 5a) |
| API | `php artisan serve` (di `backend/`), atau bagian dari `npm run dev` di akar | http://127.0.0.1:8000 |
| Scheduler | `php artisan schedule:work`, atau `npm run dev -- --jadwal` | menjalankan jadwal setiap menit |
| Antrean | `php artisan queue:work`, atau `npm run dev -- --antrean` | mengirim notifikasi dan pekerjaan latar |

Reset data: `php artisan migrate:fresh --seed`. Langkah lengkap ditulis di `docs/menjalankan-lokal.md` (T5.03).

## 2b. Hemat memori: laptop dengan sekitar 2 GB RAM bebas (D-44)

Laptop pengembangan hanya punya sekitar 2 GB RAM bebas saat IDE dan peramban terbuka. Di gelombang 6 Tahap 4, tes halaman yang biasanya selesai dalam 0,2–2 detik menjadi 5–16 detik karena kekurangan memori (D-43). Tahap 5 menambah MariaDB, PHP, scheduler, dan antrean di samping Vite, jadi batas ini ikut menentukan cara kerja dan cara demo.

Pemakaian memori tiap proses. Baris bertanda * diukur di T5.03 (11 Oktober 2026, private bytes saat `npm run dev` menyala; rincian di `docs/menjalankan-lokal.md` bagian 6); sisanya masih perkiraan.

| Proses | Memori | Catatan |
| --- | --- | --- |
| MariaDB XAMPP* | 207 MB | Tabel bawaan Laravel saja; diukur ulang di gelombang 5.2. Bawaan XAMPP sudah hemat (`innodb_buffer_pool_size` kecil). Jangan dinaikkan. |
| `php artisan serve`* | 52 MB | Dua proses PHP (`artisan serve` dan `php -S` yang dibukanya). |
| `queue:work` dan `schedule:work` | 50–80 MB per proses | Bisa diganti mode hemat di bawah. |
| Vite + skrip dev dalam satu proses* | 377 MB | `npm run dev` dari akar menambah dua proses `npm` perantara ±60 MB masing-masing; `node scripts/dev-lengkap.mjs` di `frontend/` lebih hemat. |
| Vitest (2 pekerja) | 600 MB–1 GB | Hanya saat tes berjalan. |
| Chrome untuk tangkapan layar | 300–600 MB | Hanya saat skrip tangkap berjalan. |

Saran pengaturan:

1. **Jangan jalankan semua sekaligus.** Tes, tangkapan layar, dan server pengembangan dijalankan bergantian. Tutup IDE kedua dan tab peramban yang tidak dipakai. Hentikan layanan basis data lain yang tidak dipakai proyek ini (mis. layanan Oracle) selama pengembangan.
2. **MariaDB.** Pakai pengaturan bawaan XAMPP. Bila perlu, tambahkan di `my.ini` bagian `[mysqld]`: `performance_schema = OFF` dan `max_connections = 20`. Apache XAMPP tidak dinyalakan.
3. **Antrean dan scheduler di lokal.** Untuk pengembangan sehari-hari, pakai `QUEUE_CONNECTION=sync` di `.env` lokal, sehingga `queue:work` tidak perlu dijalankan. `schedule:work` hanya dinyalakan saat menguji batas 6 atau 24 jam dan pengingat. Bila antrean dijalankan, pakai `php artisan queue:work --memory=128 --sleep=3`.
4. **Tes backend.** Pest dijalankan tanpa `--parallel` (atau paling banyak `--processes=2`), seperti Vitest yang dibatasi 2 pekerja (D-43). Saat tes backend berjalan, Vite tidak perlu menyala.
5. **Composer.** `composer install` dan `composer update` bisa butuh lebih dari 1 GB. Jalankan saat Vite, tes, dan Chrome ditutup.
6. **Demo.** Sebelum demo, mulai ulang laptop. Buka hanya peramban demo, server Vite (`npm run demo`), dan di Tahap 6 `php artisan serve` dengan MariaDB. IDE ditutup. Antrean memakai `sync` dan scheduler hanya dinyalakan bila adegan demo membutuhkannya (mis. kiriman dianggap diterima setelah 6 jam).
7. **Ukur, jangan menebak.** Angka bertanda * di tabel sudah diukur di T5.03. Ukur ulang setiap kali proses baru ditambahkan (antrean, scheduler, web push) dan catat di `docs/menjalankan-lokal.md`.

## 2a. Memasang PHP 8.3+ terpisah (prasyarat Tahap 5, T5.00)

PHP baru dipasang di folder sendiri. XAMPP tetap dipakai hanya untuk MariaDB (D-25). Contoh di bawah memakai folder `C:\php\8.3`; di laptop pengembangan terpasang `C:\php-8.5.11-nts-Win32-vs17-x64` (PHP 8.5.11 NTS, D-50). Lokasinya bebas, asal PATH menunjuk ke sana.

**Langkah pemasangan (Windows 11):**

1. Pasang **Microsoft Visual C++ Redistributable 2015–2022 (x64)** bila belum ada. PHP untuk Windows membutuhkannya.
2. Unduh PHP **8.3.x atau lebih baru**, varian **x64 Non Thread Safe** (zip), dari https://windows.php.net/download/.
3. Ekstrak ke `C:\php\8.3`.
4. Salin `php.ini-development` menjadi `php.ini` di folder yang sama. Lalu ubah isinya:
   - `extension_dir = "ext"`
   - aktifkan (hapus `;` di depan): `extension=curl`, `extension=fileinfo`, `extension=gd`, `extension=gmp`, `extension=intl`, `extension=mbstring`, `extension=openssl`, `extension=pdo_mysql`, `extension=sodium`, `extension=zip`
   - `upload_max_filesize = 4M`, `post_max_size = 8M` (foto sudah dikecilkan di HP, maksimal 2 MB)
5. Atur PATH. Windows membaca **PATH sistem lebih dulu** daripada PATH pengguna, jadi bila `C:\xampp\php` ada di PATH sistem, menambah PHP baru di PATH pengguna saja tidak cukup. Langkahnya (butuh izin administrator): buka *Edit the system environment variables* → *Environment Variables* → *System variables* → `Path` → hapus `C:\xampp\php`, lalu tambahkan `C:\php\8.3` dan pindahkan ke atas `C:\ProgramData\ComposerSetup\bin`. Tutup lalu buka lagi semua terminal (termasuk VS Code).
6. Pastikan Composer memakai PHP baru. `composer.bat` memanggil `php` dari PATH, jadi setelah langkah 5 biasanya sudah benar. Bila `composer -V` masih menyebut PHP 8.1, jalankan ulang installer Composer dan pilih `C:\php\8.3\php.exe`.
7. Di XAMPP Control Panel, jalankan modul **MySQL** (MariaDB). Buat dua basis data dengan charset eksplisit (bawaan server `utf8mb4_general_ci`):
   ```
   C:\xampp\mysql\bin\mysql.exe -uroot -e "CREATE DATABASE tani_muda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE DATABASE tani_muda_uji CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

**Cara memeriksa** (semua harus lolos sebelum T5.01 dimulai):

| Perintah | Hasil yang diharapkan |
| --- | --- |
| `where php` | Baris pertama adalah `C:\php\8.3\php.exe`, bukan `C:\xampp\php\php.exe` |
| `php -v` | `PHP 8.3.x` atau lebih baru |
| `php -r "echo PHP_VERSION_ID >= 80300 ? 'OK' : 'TERLALU LAMA';"` | `OK` |
| `php -m` | Memuat `curl`, `fileinfo`, `gd`, `gmp`, `intl`, `mbstring`, `openssl`, `pdo_mysql`, `sodium`, `zip` |
| `composer -V` | `Composer version 2.x` dengan `PHP version 8.3.x` (atau lebih baru) |
| `composer diagnose` | Tidak ada baris `FAIL` |
| `php -r "new PDO('mysql:host=127.0.0.1;port=3306', 'root', ''); echo 'MariaDB OK';"` | `MariaDB OK` (modul MySQL XAMPP sedang berjalan; sesuaikan pengguna dan kata sandi) |
| `mysql -u root -e "SELECT VERSION();"` (pakai `C:\xampp\mysql\bin\mysql.exe`) | `10.4.32-MariaDB` |
| `mysql -u root -e "SHOW DATABASES LIKE 'tani_muda%';"` | `tani_muda` dan `tani_muda_uji` |

Setelah proyek Laravel dibuat (T5.03), `php artisan about` menampilkan versi PHP, Laravel, dan koneksi basis data dalam satu layar. Hasil pemeriksaan ditulis sebagai catatan di T5.00.

## 3. Struktur repositori (mulai T5.01)

```
tani-muda/
├── frontend/            proyek React (src/, public/, scripts/, package.json, …), dipindah dari akar di T5.01
├── backend/             proyek Laravel
│   ├── app/
│   │   ├── Domain/
│   │   │   ├── Hitung/        port rumus frontend/src/lib ke PHP (fungsi murni, tanpa Eloquent)
│   │   │   ├── Otp/           antarmuka PengirimOtp + PengirimOtpLog (+ SMS nanti)
│   │   │   └── Pembayaran/    antarmuka PenyediaPembayaran + PembayaranTiruan
│   │   ├── Enums/             enum PHP (Peran, StatusAkun, AlasanPenolakan, …)
│   │   ├── Http/
│   │   │   ├── Galat/         GalatApi, KodeGalat (kode, status, teks), PenerjemahGalat (satu handler)
│   │   │   ├── Respons.php    { data }, paginasi { data, meta }
│   │   │   ├── Controllers/Api/V1/
│   │   │   ├── Requests/      validasi + pesan galat Bahasa Indonesia
│   │   │   ├── Resources/     bentuk JSON sesuai kontrak-api.md
│   │   │   └── Middleware/    PastikanPeran, PastikanAkunAktif
│   │   ├── Models/
│   │   ├── Notifications/     notifikasi web push
│   │   ├── Policies/
│   │   ├── Services/          proses bisnis yang melibatkan basis data (AmbilPesanan, KonfirmasiKiriman, …)
│   │   └── Support/           Waktu (ISO 8601 UTC `…000Z`)
│   ├── database/migrations/, database/seeders/
│   ├── routes/api.php, routes/console.php (jadwal)
│   ├── lang/id/               pesan validasi Bahasa Indonesia
│   └── tests/Feature/, tests/Unit/ (Pest; Unit/KasusUjiBersamaTest.php membaca shared/kasus-uji)
├── shared/
│   ├── kasus-uji/       kasus uji perhitungan (JSON) untuk Vitest dan Pest
│   └── data-contoh/     data contoh (JSON) untuk klien API tiruan dan seeder Laravel
├── design/  docs/
├── package.json         skrip akar yang meneruskan ke frontend/ (dev, demo, build:demo, preview:demo)
└── README.md
```

`shared/data-contoh/` dibuat dengan memindahkan data tiruan Tahap 3 (yang sejak awal ditulis sebagai JSON). Hasilnya, frontend tiruan dan seeder Laravel memakai data yang persis sama.

## 4. Bentuk API

Rincian ada di `kontrak-api.md`. Ringkasnya:

- Awalan **`/api/v1`**. Nama kolom JSON memakai `snake_case` yang sama dengan Model Data PRD dan `keputusan.md`.
- **Sukses:** `{ "data": … }`. Daftar berhalaman memakai `{ "data": [ … ], "meta": { "halaman", "per_halaman", "total", "halaman_terakhir" } }` dengan parameter `?halaman=&per_halaman=` (bawaan 20, maksimal 100).
- **Galat:** `{ "galat": { "kode": "UKURAN_KOSONG", "pesan": "Isi luas lahan dulu", "rincian": { "luas_m2": ["…"] } } }`. `kode` stabil dan dipakai frontend; `pesan` siap tampil dalam Bahasa Indonesia; `rincian` berisi galat per kolom untuk validasi.
- **Kode status:** 200/201, 204, 401 (belum masuk), 403 (peran atau status akun tidak mengizinkan), 404 (tidak ada **atau milik pengguna lain**, supaya keberadaan data orang lain tidak bocor; D-22), 409 (bentrok, mis. alokasi melebihi pesanan), 422 (validasi), 429 (terlalu sering).
- **Uang** dalam rupiah bulat (integer, kolom `BIGINT UNSIGNED`). **Berat** dalam kg desimal. **Tanggal** tanpa jam `YYYY-MM-DD`, sama dengan `frontend/src/lib`. **Waktu** dalam ISO 8601 UTC berakhiran `Z` (D-31); frontend menampilkannya menurut `pengguna.zona_waktu`.
- Laravel menangani semua galat lewat satu handler (`bootstrap/app.php` → `withExceptions`) yang mengubah `ValidationException`, `AuthorizationException`, `ModelNotFoundException`, dan sejenisnya ke format galat di atas.

## 5. Masuk dengan nomor HP dan OTP (Sanctum)

**Cara sesi: Sanctum mode SPA dengan cookie sesi (D-21).** Aplikasi ini adalah SPA pihak pertama, jadi cookie `HttpOnly` lebih aman daripada token di `localStorage`, karena cookie tidak bisa dicuri lewat XSS. Pengaturan lokal (semuanya dari `.env`):

- `SANCTUM_STATEFUL_DOMAINS=localhost:5173`, `SESSION_DOMAIN=localhost`;
- CORS `supports_credentials=true` dengan asal hanya `http://localhost:5173`;
- frontend memanggil `GET /sanctum/csrf-cookie` sebelum permintaan yang mengubah data.

Saat deploy, frontend dan backend berada di domain induk yang sama (bagian 17). **Bila nanti ada aplikasi React Native, aplikasi itu memakai mode token Sanctum** (token per perangkat, dibuat setelah verifikasi OTP dengan `createToken`, dikirim sebagai `Authorization: Bearer`). Endpoint OTP dan kontrak API tetap sama; middleware `auth:sanctum` menerima kedua cara (D-21).

Alur:

1. `POST /api/v1/auth/otp/kirim` `{ nomor_hp }`
   - Nomor dinormalisasi ke `+62…` (rumus sama dengan `frontend/src/lib/nomor-hp.ts`).
   - Kode 6 digit dibuat dengan `random_int`.
   - **Kode hanya disimpan sebagai hash** di tabel `kode_otp` (`nomor_hp`, `hash_kode`, `kedaluwarsa_pada`, `percobaan`, `dipakai_pada`). Hash memakai `hash_hmac('sha256', kode, APP_KEY)`.
   - **Kedaluwarsa 5 menit.** Kode lama untuk nomor yang sama dibatalkan.
   - Batas kirim ulang: sekali per 60 detik dan paling banyak 5 kali per jam per nomor, ditambah batas per alamat IP (`RateLimiter`). Bila terlampaui: 429 dengan `coba_lagi_dalam` detik.
   - Respons tidak pernah memuat kode.
2. `POST /api/v1/auth/otp/verifikasi` `{ nomor_hp, kode }`
   - Ditolak bila kode kedaluwarsa, sudah dipakai, atau **percobaan sudah 5 kali**. Setiap kegagalan menambah `percobaan`; setelah 5 kali kode itu terkunci dan pengguna harus meminta kode baru.
   - Kode dicocokkan dengan `hash_equals`.
   - Bila berhasil: kode ditandai dipakai, `pengguna` dibuat bila belum ada (peran kosong, lalu memilih peran di T4.34), sesi diperbarui (`session()->regenerate()`).
3. `POST /api/v1/auth/keluar`, `GET /api/v1/akun` (pengguna yang sedang masuk).
4. Ganti nomor HP (T4.36, D-45): `POST /api/v1/akun/nomor-hp/otp` mengirim kode ke **nomor baru** dengan aturan OTP yang sama; `PUT /api/v1/akun/nomor-hp` mencocokkan kode, mengecek ulang nomor belum dipakai, lalu mengganti nomor dalam satu transaksi. Setelah itu **semua sesi lain pengguna itu diakhiri**: baris tabel `sessions` milik pengguna selain sesi ini dihapus (`Auth::logoutOtherDevices` tidak dipakai karena tanpa kata sandi), token `personal_access_tokens` miliknya dicabut, dan sesi ini diperbarui dengan `session()->regenerate()`.

**Pengirim OTP** di balik antarmuka `PengirimOtp::kirim(string $nomorHp, string $kode)`:

- `OTP_DRIVER=log` (pengembangan) menulis kode ke `storage/logs/laravel.log` dan **hanya boleh aktif bila `APP_ENV=local`**; aplikasi menolak menyala bila disetel di lingkungan lain.
- Penyedia SMS ditambahkan nanti tanpa mengubah alur di atas.

Peran `admin` tidak bisa dipilih sendiri; admin hanya dibuat oleh seeder atau oleh admin lain.

## 5a. Proxy Vite ke Laravel (pengembangan lokal)

Saat pengembangan, peramban hanya berbicara dengan server Vite di `http://localhost:5173`. Vite meneruskan `/api/*` dan `/sanctum/*` ke Laravel di `http://127.0.0.1:8000` (`frontend/vite.config.ts`, berlaku juga untuk `vite preview`).

```
peramban ──▶ localhost:5173 ──┬── /api/v1/…, /sanctum/csrf-cookie ──▶ 127.0.0.1:8000 (Laravel)
                              └── halaman, aset, HMR ──────────────▶ Vite
```

Akibatnya:

- **Satu asal.** Cookie sesi Laravel dan `XSRF-TOKEN` dipasang untuk `localhost`, jadi klien HTTP (Tahap 6) cukup memanggil alamat relatif `/api/v1/…` dengan `credentials: 'include'`. CORS tidak dipakai di jalur ini; `config/cors.php` (asal dari `CORS_ALLOWED_ORIGINS` atau `FRONTEND_URL`, `supports_credentials=true`) hanya berlaku bila frontend memanggil backend langsung.
- **`Host` tidak diubah** (`changeOrigin: false`), dan peramban mengirim `Origin`/`Referer` `localhost:5173`. Sanctum mengenalinya sebagai permintaan SPA karena `SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173`, lalu memakai cookie sesi (`$middleware->statefulApi()` di `bootstrap/app.php`).
- **Alamat backend lain** diatur dengan variabel proses `TANI_MUDA_API` (bukan `.env` frontend, karena `.env` frontend hanya boleh berisi `VITE_*`).
- Selama Tahap 5 frontend tetap memakai klien tiruan (`VITE_SUMBER_DATA=tiruan`), jadi proxy hanya dipakai untuk mencoba API, mis. `http://localhost:5173/api/v1/kesehatan`.
- Saat deploy (bagian 17), nginx berperan seperti proxy ini: frontend dan `/api` dilayani dari domain yang sama.

Pemeriksaan kesehatan: `GET /api/v1/kesehatan` (tanpa masuk) menjawab `{ "data": { "status": "sehat", "basis_data": "tersambung", "waktu": "…Z" } }`, atau 503 `SUMBER_BELUM_TERSEDIA` bila basis data tidak terjangkau.

## 6. Otorisasi: peran, Policy, dan pengujian

Peran: `petani`, `pembeli`, `mentor`, `admin`. Status akun: `aktif`, `dinonaktifkan_sementara` (D-13). Pembeli punya status verifikasi (`menunggu`, `terverifikasi`, `ditolak`).

| Lapisan | Isi |
| --- | --- |
| Middleware rute | `auth:sanctum`, `peran:petani` / `peran:pembeli` / `peran:mentor,admin` / `peran:admin` |
| Gate | `ambil-pesanan` (petani aktif saja, D-13), `pasang-pesanan` (pembeli terverifikasi saja, P0-02) |
| Policy per model | `LahanPolicy`, `SiklusTanamPolicy` (berikut tugas, pengukuran, pengeluaran, jurnal), `PesananPolicy`, `AlokasiPesananPolicy`, `PengirimanPolicy`, `PembayaranPolicy` (baca saja), `RatingPolicy`, `SengketaPolicy`, `ResepTanamPolicy`, `PermintaanResepPolicy`, `PenggunaPolicy` |
| API Resource | Bentuk data dibedakan per penonton. Contohnya `KebunUntukPembeliResource` hanya memuat nama desa dan jarak, **tidak pernah titik lahan** (D-06). |

Aturan utama:

- Petani hanya membaca dan mengubah lahan, siklus, tugas, pengukuran, pengeluaran, dan jurnalnya sendiri.
- Pembeli hanya membaca pesanannya sendiri, serta kiriman dan pembayaran yang terkait.
- Petani hanya membaca pesanan dalam radius, ditambah alokasi dan kiriman miliknya.
- Tabel `pembayaran` **tidak pernah ditulis langsung dari permintaan klien**, hanya oleh layanan pembayaran di server.
- Resep `draf` yang bukan contoh tidak pernah dikirim ke petani. Seeder produksi tidak memuat resep contoh (D-12).
- Mentor dan admin mengelola resep. Admin memverifikasi pembeli, memutus sengketa, menulis catatan petani, dan menonaktifkan petani.

**Tes Pest akses silang (wajib, T5.10).** Untuk setiap endpoint yang membaca atau mengubah data milik seseorang, dataset Pest memeriksa:

- pemilik mendapat 200/201;
- pengguna lain dengan peran yang sama mendapat 404;
- peran yang salah mendapat 403;
- tanpa sesi mendapat 401.

Ditambah kasus khusus: pembeli tidak menerima koordinat lahan, pembeli belum terverifikasi tidak bisa memasang pesanan, petani nonaktif tidak bisa mengambil pesanan, dan klien tidak bisa menulis `pembayaran`. Daftar endpoint di tes dibandingkan dengan `php artisan route:list`, sehingga endpoint baru tanpa tes akses membuat tes gagal.

## 7. Basis data

- MariaDB 10.4, InnoDB, `utf8mb4` / `utf8mb4_unicode_ci`.
- Nama tabel dan kolom mengikuti Model Data PRD dan `keputusan.md` (aturan proyek 8).
- Konfigurasi bisnis (uang muka 20%, layanan 5%, batas periksa 6/24 jam, batas kabar 3 hari, radius 10 km, kontak admin) disimpan di tabel `konfigurasi` (`kunci`, `nilai`, `keterangan`), tidak ditulis tetap di kode.

| Jenis data | Tipe kolom |
| --- | --- |
| Uang | `BIGINT UNSIGNED` (rupiah) |
| Berat dan luas | `DECIMAL(12,2)` |
| Persen | `DECIMAL(5,2)` |
| Koordinat | `DECIMAL(9,6)` lintang dan bujur (tanpa tipe spasial) |
| Tanggal tanpa jam | `DATE` |
| Waktu | `TIMESTAMP` dalam UTC (`config/app.php` `timezone = UTC`); dikirim sebagai ISO 8601 `Z`, ditampilkan menurut `pengguna.zona_waktu` (D-31) |
| Pilihan tetap | kolom `enum` Laravel dipadukan dengan PHP backed enum |

Batasan di tingkat tabel (MariaDB 10.4 menegakkan `CHECK`):

- `pengiriman`: `alasan_penolakan <> 'lainnya' OR keterangan_penolakan IS NOT NULL` (D-14);
- `jumlah_ditolak <= jumlah_dikirim`;
- harga dan jumlah tidak negatif;
- kunci unik untuk satu permintaan resep per pengguna, komoditas, dan metode.

Status "terlambat" tidak disimpan; status itu dihitung dari tanggal (PRD).

Tabel tambahan yang khusus backend: `kode_otp`, `konfigurasi`, `log_notifikasi` (mencegah notifikasi terkirim ganda), `jobs`, `sessions`, dan `personal_access_tokens` (bawaan Laravel). Langganan push disimpan di `langganan_notifikasi`, dengan nama tabel paket web push diarahkan ke nama itu.

## 8. Radius pesanan dan alokasi

**Radius (Haversine dari tabel `wilayah`).**

- Jarak dihitung dari **titik tengah desa** petani (`pengguna.wilayah_id`) ke titik tengah desa titik antar pesanan (`pesanan.wilayah_id`). Koordinat lahan dan alamat lengkap tidak pernah dipakai untuk daftar atau dikirim ke pihak lain (D-06).
- Kueri memakai prasaring kotak batas (lintang dan bujur ± radius, memakai indeks), lalu rumus Haversine dalam SQL:

  ```sql
  6371 * 2 * ASIN(SQRT(
    POWER(SIN(RADIANS(w2.lintang - w1.lintang) / 2), 2) +
    COS(RADIANS(w1.lintang)) * COS(RADIANS(w2.lintang)) *
    POWER(SIN(RADIANS(w2.bujur - w1.bujur) / 2), 2)
  )) AS jarak_km
  ```

- Rumus ini sama dengan `frontend/src/lib/jarak.ts` dan `Domain/Hitung/Jarak.php`, dibuktikan oleh `shared/kasus-uji/jarak.json` dengan toleransi 0,01 km.
- Hasil diurutkan dari yang terdekat, dengan ID sebagai pemecah seri supaya urutannya stabil.

**Alokasi (`Services/AmbilPesanan`).** Satu transaksi dengan penguncian baris:

```php
DB::transaction(function () use ($pesananId, $lahanId, $jumlah, $petani) {
    $pesanan = Pesanan::whereKey($pesananId)->lockForUpdate()->firstOrFail(); // kunci pesanan dulu
    $lahan   = Lahan::whereKey($lahanId)->lockForUpdate()->firstOrFail();     // lalu lahan (urutan tetap → tanpa deadlock)
    // 1. petani aktif (D-13), lahan milik petani, pesanan masih terbuka
    // 2. total alokasi + jumlah ≤ jumlah pesanan       → bila tidak: 409 MELEBIHI_PESANAN
    // 3. kapasitas lahan cukup (Domain/Hitung/KapasitasLahan, D-15) → bila tidak: 409 LAHAN_TIDAK_CUKUP
    // 4. buat alokasi_pesanan, siklus_tanam (harga kesepakatan), rencana_item dari resep
}, attempts: 3);
```

Tesnya ada dua lapis:

- tes biasa untuk setiap penolakan;
- tes serentak yang menjalankan dua proses `artisan` bersamaan untuk sisa pesanan yang sama (`Process::pool`), lalu membuktikan total alokasi tidak pernah melebihi pesanan.

Tes ini memakai basis data MariaDB `tani_muda_uji`, **bukan SQLite**, karena SQLite tidak punya `lockForUpdate` dan fungsi trigonometri yang sama.

## 9. Perhitungan uang di server

- `app/Domain/Hitung/` berisi port PHP dari fungsi `frontend/src/lib`: `PesananNilai` (D-02), `Kiriman` (D-01, D-03), `Modal`, `Ringkasan`, `KapasitasLahan` (D-15), `PesananLahan`, `Jarak`, `Pengingat`, dan `Format` (pembulatan). Semuanya fungsi murni: tanpa Eloquent dan tanpa waktu sistem, karena waktu selalu dikirim sebagai argumen.
- **Server tidak menerima angka uang dari klien.** Nilai pesanan, uang muka, biaya layanan, pembayaran per kiriman (80% dari pembeli, 20% dari saldo uang muka), dana cair, dan pengembalian dihitung dari data di basis data dan tabel `konfigurasi`.
- **Bukti kesamaan: `shared/kasus-uji/`.** Setiap berkas JSON berisi daftar kasus:

  ```json
  { "nama": "rutin 10 kg × 12 kiriman × Rp5.000",
    "fungsi": "hitungNilaiPesanan",
    "masukan": { "jumlahTotalKg": 120, "hargaPerKg": 5000, "persenUangMuka": 20, "persenLayanan": 5 },
    "keluaran": { "nilaiPesanan": 600000, "uangMuka": 120000, "biayaLayanan": 30000, "dibayarSekarang": 150000 } }
  ```

  - Vitest menjalankan setiap kasus terhadap fungsi TypeScript.
  - Pest menjalankan kasus yang sama terhadap kelas PHP (`dataset`).
  - Satu kasus yang berbeda hasil di salah satu sisi membuat tes gagal.
- Aturan pembulatan ditulis satu kali di kasus uji: rupiah dibulatkan setengah ke atas, menjauhi nol. Aturan ini sengaja ditulis eksplisit karena `Math.round` di JavaScript dan `round()` di PHP berbeda untuk nilai negatif.

## 10. Pembayaran

- Antarmuka `Domain/Pembayaran/PenyediaPembayaran`: `tahan(Pembayaran)`, `cairkan(Pembayaran, int $nominal)`, `kembalikan(Pembayaran, int $nominal)`, `status(string $referensi)`.
- `PembayaranTiruan` mensimulasikan semuanya seketika. Referensinya diawali `TIRUAN-`, dan frontend menampilkan label "Mode uji coba".
- Implementasi dipilih lewat `PEMBAYARAN_DRIVER=tiruan` di `backend/.env`. Kunci payment gateway sungguhan kelak juga hanya di `backend/.env`.
- Setiap operasi uang tercatat di `pembayaran` (jenis, status `ditahan` / `cair` / `dikembalikan`, nominal, referensi). Permintaan memakai `kunci_idempoten` unik, sehingga klik ganda atau antrean offline tidak membayar dua kali.
- Konfirmasi kiriman memicu pencairan bagian petani. Penolakan sebagian membuat `sengketa`, dan pencairan bagian yang ditolak menunggu keputusan admin.

## 11. Scheduler dan antrean

Jadwal didefinisikan di `routes/console.php` dengan zona waktu **Asia/Jakarta**. Lokal dijalankan oleh `php artisan schedule:work`; di VPS oleh cron `schedule:run` setiap menit (bagian 17). Semua perintah memakai `withoutOverlapping()`, dan pengiriman dicatat di `log_notifikasi` supaya tidak ganda.

| Perintah | Jadwal | Isi |
| --- | --- | --- |
| `pengingat:kirim` | setiap 15 menit | Mengirim pengingat ke pengguna yang jam pengingat paginya (bawaan 06.00) jatuh di jendela 15 menit ini, berisi tugas hari ini dan yang terlambat menurut tipe yang diaktifkan (`Domain/Hitung/Pengingat`, port `frontend/src/lib/pengingat.ts`). Pengingat sore hanya bila masih ada tugas belum selesai. |
| `kiriman:konfirmasi-otomatis` | setiap 15 menit, bersamaan dengan pengingat (D-23) | Kiriman yang belum ditanggapi pembeli lewat batas periksa (**6 jam rutin, 24 jam sekali panen**, dari `konfigurasi`, D-01) dianggap diterima lalu dicairkan. Pencairan terlambat paling lama 15 menit setelah batas. |
| `pesanan:kembalikan-uang-muka` | harian 01.00 | Uang muka dikembalikan bila 7 hari tanpa petani (PRD P0-23). |
| `pesanan:ingatkan-bayar` | harian 07.00 | Mengingatkan pembayaran paling lambat sehari sebelum jadwal kirim. |
| `kabar:catat-tanpa-kabar` | harian 00.30 | Menulis `catatan_petani` bila bagian gagal panen tidak dikabarkan ≥ 3 hari sebelum jadwal kirim (D-03). |

Antrean memakai driver `database` dengan `php artisan queue:work`. Pengiriman push selalu masuk antrean supaya permintaan API tetap cepat.

## 12. Web push

- Memakai paket web push untuk notifikasi Laravel (berbasis `minishlink/web-push`), dengan nama tabel langganan diarahkan ke `langganan_notifikasi`.
- Kunci VAPID dibuat sekali dengan perintah paket itu dan disimpan di `backend/.env` (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`). **Kunci privat tidak pernah keluar dari backend.** Kunci publik disalin ke `frontend/.env` sebagai `VITE_VAPID_PUBLIC_KEY`.
- Endpoint: `POST /api/v1/notifikasi/langganan` (simpan), `DELETE /api/v1/notifikasi/langganan` (hapus).
- Langganan yang ditolak layanan push (410 Gone) dihapus otomatis.

## 13. Berkas privat

- Foto jurnal, foto kualitas kiriman, foto penolakan, foto nota, foto profil, dan foto tempat usaha disimpan di disk `local` (`storage/app/private`). **Tidak ada berkas pengguna di folder publik.**
- Unggah lewat `multipart/form-data`. Frontend mengecilkan foto lebih dulu, lalu server memeriksa jenis (`image/jpeg`, `image/png`, `image/webp`) dan ukuran (maks 2 MB setelah dikecilkan) dan menyimpannya dengan nama acak.
- Unduh hanya lewat **URL bertanda tangan** yang berlaku 10 menit (`URL::temporarySignedRoute`). Policy diperiksa saat URL dibuat, dan rute unduh memakai middleware `signed`.
- Respons API tidak pernah memuat jalur disk, hanya URL bertanda tangan.

## 14. Keamanan dan konfigurasi

- **Endpoint publik** (`/auth/otp/*`, `GET /konfigurasi`, `GET /publik/contoh`) memakai `RateLimiter` per alamat IP; `GET /publik/contoh` paling banyak 60 permintaan per menit dan responsnya di-cache sampai resep atau konfigurasi berubah (D-45).

- `backend/.env` berisi semua rahasia: `APP_KEY`, `DB_PASSWORD`, `VAPID_PRIVATE_KEY`, kunci penyedia SMS dan pembayaran. File ini masuk `.gitignore`; yang di-commit hanya `backend/.env.example` dengan nilai kosong.
- `frontend/.env` hanya berisi variabel `VITE_` yang publik: alamat API, kunci publik VAPID, `VITE_TAMPILKAN_RESEP_CONTOH`, dan sumber data (`tiruan` / `http`). `npm run lint` menolak nama variabel rahasia di kode frontend dan di `frontend/.env.example`.
- CORS hanya mengizinkan asal frontend. `APP_DEBUG=false` di luar lokal.
- **Semua konfigurasi lewat `.env`** (D-24): alamat aplikasi dan frontend, basis data, domain sesi, domain stateful Sanctum, asal CORS, driver OTP, pembayaran, dan antrean, kunci VAPID, zona waktu tampilan. Kode membaca nilainya lewat `config()`, dan `env()` hanya dipanggil di berkas `config/`, supaya `config:cache` di server bekerja.
- **Tidak ada path khusus Windows di kode** (D-24): tidak ada huruf drive, garis miring terbalik sebagai pemisah folder, atau `C:\…`. Jalur dibangun dengan `base_path()`, `storage_path()`, dan `database_path()` di PHP, serta `path.join` atau `new URL(…, import.meta.url)` di Node. Berkas kasus uji dan data contoh dibaca dengan jalur relatif terhadap akar repositori.
- Nomor HP disamarkan di log (`+62812****789`).
- Pesan validasi Bahasa Indonesia ada di `lang/id/validation.php`, dengan kata-kata yang mengikuti aturan bahasa D-09.

## 15. Pengujian backend

| Jenis | Isi |
| --- | --- |
| Unit (Pest) | `Domain/Hitung/*` dengan `shared/kasus-uji/*.json`; `PembayaranTiruan`; normalisasi nomor HP |
| Fitur (Pest) | setiap endpoint di `kontrak-api.md`: bentuk respons, kode status, format galat dan paginasi |
| Akses silang (Pest) | bagian 6; daftar endpoint dibandingkan dengan `route:list` |
| OTP | kedaluwarsa tepat 5 menit (waktu dibekukan), percobaan ke-6 ditolak, kode tidak pernah ada di respons, driver log ditolak di luar `local` |
| Serentak | alokasi dua proses (bagian 8) |
| Jadwal | perintah terjadwal dengan waktu dimajukan (`travelTo`) untuk batas 6 dan 24 jam, jendela 15 menit, dan 7 hari |

Semua tes memakai basis data `tani_muda_uji` di MariaDB lokal dengan `RefreshDatabase`.

## 16. Peta ke rencana kerja

| Bagian dokumen ini | Tugas |
| --- | --- |
| 3 Struktur repositori, `shared/` | T5.01, T5.02 |
| 2a Pemasangan PHP 8.3+ | T5.00 |
| 2, 4, 14 Proyek, format respons, keamanan | T5.03 |
| 7 Basis data | T5.04–T5.08 |
| 5 OTP dan Sanctum | T5.09 |
| 6 Policy dan tes akses | T5.10 |
| 13 Berkas privat | T5.12 |
| 8 Radius dan alokasi | T5.13 |
| 9 Uang di server | T5.14 |
| 10 Pembayaran | T5.15 |
| 11 Scheduler, 12 Web push | T5.17, T5.18 |
| 15 Pengujian | semua tugas Tahap 5, ditambah T5.19 |
| Penyambungan frontend | Tahap 6 |
| 17 Deploy ke VPS | T6.08 (uji), dipakai kapan saja |

## 17. Deploy ke VPS (siap kapan saja)

Demo lomba berjalan dari laptop (D-24), tetapi langkah berikut harus bisa dijalankan kapan saja tanpa mengubah kode, cukup mengisi `.env`. Contoh untuk VPS Ubuntu 24.04 LTS dengan domain `app.contoh.id` (frontend) dan `api.contoh.id` (backend). Satu domain induk diperlukan oleh cookie Sanctum (D-21).

**1. Paket server**

- `nginx`, `php8.3-fpm` (atau lebih baru) dengan `php8.3-cli`, `-mysql`, `-mbstring`, `-xml`, `-curl`, `-gd`, `-gmp`, `-intl`, `-zip`, `-bcmath`;
- `mariadb-server` (atau MySQL 8), `composer`, `supervisor`, `certbot` dengan plugin nginx;
- Node.js 24 hanya bila frontend dibangun di server. Frontend juga boleh dibangun di laptop lalu diunggah.

**2. Basis data**

- Buat basis data `tani_muda` dengan collation `utf8mb4_unicode_ci`.
- Buat pengguna khusus dengan kata sandi kuat, hanya untuk basis data itu.
- Jangan memakai `root`.

**3. Backend**

```bash
git clone <repo> /var/www/tani-muda && cd /var/www/tani-muda/backend
composer install --no-dev --optimize-autoloader
cp .env.example .env    # isi nilai produksi, lihat tabel di bawah
php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=ProduksiSeeder --force   # tanpa resep contoh dan pengguna uji (D-12)
php artisan config:cache && php artisan route:cache && php artisan event:cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

Isi `.env` produksi yang wajib diperhatikan:

| Variabel | Nilai |
| --- | --- |
| `APP_ENV`, `APP_DEBUG`, `APP_URL` | `production`, `false`, `https://api.contoh.id` |
| `FRONTEND_URL` (asal CORS) | `https://app.contoh.id` |
| `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE` | `.contoh.id`, `true` |
| `SANCTUM_STATEFUL_DOMAINS` | `app.contoh.id` |
| `DB_*` | pengguna khusus basis data |
| `OTP_DRIVER` | penyedia SMS (bukan `log`; aplikasi menolak `log` di luar `local`) |
| `PEMBAYARAN_DRIVER` | `tiruan` sampai penyedia sungguhan dipasang, dengan label "Mode uji coba" tetap tampil |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | kunci yang sama dengan yang dipakai frontend |
| `QUEUE_CONNECTION` | `database` |

**4. Frontend**

```bash
cd /var/www/tani-muda/frontend
# .env.production berisi VITE_SUMBER_DATA=http, VITE_API_URL=https://api.contoh.id, VITE_VAPID_PUBLIC_KEY=…
npm ci && npm run build      # hasil di frontend/dist
```

**5. nginx**

- `api.contoh.id`: `root /var/www/tani-muda/backend/public;`, permintaan PHP ke `php8.3-fpm`, `client_max_body_size 8m;`.
- `app.contoh.id`: `root /var/www/tani-muda/frontend/dist;` dengan `try_files $uri /index.html;`. Berkas service worker dan `index.html` dikirim dengan `Cache-Control: no-cache` supaya pembaruan PWA cepat sampai.

**6. HTTPS**

`sudo certbot --nginx -d app.contoh.id -d api.contoh.id`. HTTPS **wajib** untuk PWA, web push, dan cookie `Secure`.

**7. Scheduler dan antrean**

- cron pengguna `www-data`: `* * * * * cd /var/www/tani-muda/backend && php artisan schedule:run >> /dev/null 2>&1` (di VPS tidak memakai `schedule:work`).
- supervisor: program `php artisan queue:work --tries=3 --max-time=3600` dengan `autorestart=true`.

**8. Cadangan**

- `mysqldump` harian.
- `backend/storage/app/private` (foto pengguna) disalin ke lokasi lain.
- Simpan paling sedikit 7 hari.

**9. Memperbarui aplikasi**

```bash
git pull
cd backend && composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan queue:restart
cd ../frontend && npm ci && npm run build
```

**10. Pemeriksaan setelah deploy**

- `php artisan about` menunjukkan `production`, debug mati, dan koneksi basis data benar.
- `https://api.contoh.id/api/v1/kesehatan` menjawab dengan format kontrak.
- `php artisan schedule:list` menampilkan semua jadwal dengan zona Asia/Jakarta.
- Masuk dengan OTP dari `https://app.contoh.id` berhasil, dan cookie sesi bertanda `Secure` dan `HttpOnly`.
- Pencarian pada `frontend/dist` tidak menemukan nama variabel rahasia backend.
