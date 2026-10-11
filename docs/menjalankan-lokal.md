# Menjalankan Tani Muda di laptop (tanpa Docker)

Panduan menjalankan frontend dan backend di Windows 11 (D-19). Frontend saja (data tiruan) cukup dengan Node.js; lihat README di akar. Panduan ini untuk backend Laravel Tahap 5.

## 1. Prasyarat

| Bagian | Versi | Cara memeriksa |
| --- | --- | --- |
| PHP | 8.3 atau lebih baru, terpisah dari XAMPP (D-25). Di laptop pengembangan: 8.5.11 NTS di `C:\php-8.5.11-nts-Win32-vs17-x64` (D-50) | `where php` (baris pertama harus PHP baru), `php -v` |
| Composer | 2.10.3 atau lebih baru (versi lebih lama punya celah keamanan) | `composer -V`, `composer diagnose` |
| MariaDB | 10.4 dari XAMPP | `C:\xampp\mysql\bin\mysql.exe -uroot -e "SELECT VERSION();"` |
| Node.js | 24 | `node -v` |

Langkah memasang PHP, mengatur PATH, dan membuat basis data ada di `arsitektur-backend.md` bagian 2a. Ringkasnya: `C:\xampp\php` dihapus dari PATH **sistem** dan folder PHP baru ditaruh di atas `C:\ProgramData\ComposerSetup\bin`, lalu semua terminal dan VS Code dibuka ulang.

Laragon tidak dipakai proyek ini. Bila terpasang, jangan nyalakan MySQL Laragon bersamaan dengan XAMPP karena keduanya memakai port 3306 (D-50).

## 2. Pertama kali

1. Nyalakan modul **MySQL** di XAMPP Control Panel (Apache tidak perlu).
2. Buat dua basis data, sekali saja:

   ```
   C:\xampp\mysql\bin\mysql.exe -uroot -e "CREATE DATABASE IF NOT EXISTS tani_muda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE DATABASE IF NOT EXISTS tani_muda_uji CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

   `tani_muda` untuk pengembangan, `tani_muda_uji` khusus tes (dikosongkan setiap tes berjalan).

3. Pasang backend:

   ```bash
   cd backend
   composer install
   copy .env.example .env        # PowerShell: Copy-Item .env.example .env
   php artisan key:generate
   php artisan migrate
   ```

   Bila MariaDB memakai kata sandi, isi `DB_PASSWORD` di `backend/.env`.

4. Pasang frontend:

   ```bash
   cd frontend
   npm install
   ```

5. Periksa: `php artisan about` (di `backend/`) harus menyebut PHP 8.3+, `Timezone UTC`, `Locale id`, dan `Database mariadb`.

`composer install` bisa butuh lebih dari 1 GB RAM. Jalankan saat Vite, tes, dan Chrome ditutup (`arsitektur-backend.md` 2b).

## 3. Sehari-hari: satu perintah

Nyalakan modul MySQL di XAMPP, lalu di akar repositori:

```bash
npm run dev
```

Perintah ini (`frontend/scripts/dev-lengkap.mjs`) memeriksa PHP, `backend/.env`, dan basis data, lalu menjalankan:

| Proses | Alamat |
| --- | --- |
| API Laravel (`php artisan serve`) | http://127.0.0.1:8000 |
| Frontend Vite, dengan proxy `/api` dan `/sanctum` ke API | http://localhost:5173 |

Coba API lewat proxy: http://localhost:5173/api/v1/kesehatan menjawab `{"data":{"status":"sehat","basis_data":"tersambung","waktu":"…Z"}}`. Hentikan semuanya dengan `Ctrl+C` atau `q`.

Tambahan bila perlu:

- `npm run dev -- --jadwal`: ikut menjalankan `php artisan schedule:work` (hanya saat menguji batas 6/24 jam dan pengingat).
- `npm run dev -- --antrean`: ikut menjalankan `queue:work --memory=128 --sleep=3`. Di lokal antrean memakai `QUEUE_CONNECTION=sync`, jadi biasanya tidak perlu.
- Backend di alamat lain: setel variabel proses `TANI_MUDA_API`, mis. `$env:TANI_MUDA_API="http://127.0.0.1:8001"`.

Selama Tahap 5 aplikasi tetap memakai data tiruan (`VITE_SUMBER_DATA=tiruan`, D-49), jadi `npm run demo` tetap bisa dipakai tanpa backend dan tanpa MariaDB.

## 4. Tes dan kerapian

| Di mana | Perintah | Isi |
| --- | --- | --- |
| `backend/` | `composer uji` | Tes Pest. Tes fitur memakai `tani_muda_uji` (bukan SQLite, bukan basis data pengembangan) |
| `backend/` | `composer rapi:cek` | Laravel Pint tanpa mengubah berkas (`composer rapi` untuk merapikan) |
| `backend/` | `composer analisis` | Larastan (PHPStan) level 5 dengan `phpVersion: 80300`: menolak kode yang hanya jalan di PHP 8.4+, karena laptop memakai PHP 8.5 tetapi VPS PHP 8.3 (D-53, D-54). Bagian yang diloloskan Larastan (`new Kelas()->metode()` tanpa kurung, fungsi baru 8.4/8.5) diperiksa `tests/Unit/SintaksPhp83Test.php` di `composer uji`. Konfigurasi di `backend/phpstan.neon`; naikkan `level` bila kode sudah lolos level berikutnya |
| `frontend/` | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run build:demo` | Pemeriksaan frontend |

Tes Pest dijalankan tanpa `--parallel` agar hemat memori; saat tes backend berjalan, Vite tidak perlu menyala. Ketiganya (`composer uji`, `composer rapi:cek`, `composer analisis`) dijalankan di pemeriksaan penutup setiap gelombang. Tes di `tests/Serentak` menjalankan proses PHP terpisah dan memakai PHP yang sama dengan yang menjalankan Pest.

## 5. Mengulang data

```bash
cd backend
php artisan migrate:fresh --seed
```

Menghapus semua tabel di `tani_muda` lalu membuatnya lagi, dan mengisi seluruh 83.762 desa/kelurahan dari `shared/wilayah/wilayah.sql` (`WilayahSeeder`, beberapa detik). Seeder data contoh (pengguna uji, pesanan, dan sebagainya; T5.08) menyusul setelah D-55 diputuskan.

## 6. Hemat memori (laptop dengan sekitar 2 GB RAM bebas)

Diukur di laptop pengembangan pada 11 Oktober 2026, saat `npm run dev` menyala dan halaman serta API sudah dibuka (private bytes dari `Win32_Process`; *working set* di kurung):

| Proses | Memori |
| --- | --- |
| MariaDB XAMPP (`mysqld.exe`), tabel bawaan Laravel | 207 MB (16 MB) |
| `php artisan serve` + proses `php -S` yang dibukanya | 36 + 16 MB (50 + 48 MB) |
| Node: skrip dev + Vite dalam satu proses | 377 MB (291 MB) |
| Dua proses `npm` perantara bila dijalankan dari akar (`npm run dev`) | ±60 MB masing-masing |
| **Jumlah** | ±750 MB, atau ±630 MB tanpa perantara npm |

Paling hemat: jalankan langsung `node scripts/dev-lengkap.mjs` di `frontend/`, tanpa dua proses `npm` perantara. Angka MariaDB diukur ulang di gelombang 5.2 setelah tabel dan data contoh ada. Saran lengkap (urutan menjalankan, pengaturan `my.ini`, Pest tanpa paralel, demo) ada di `arsitektur-backend.md` bagian 2b.

## 7. Masalah umum

| Gejala | Penyebab dan jalan keluar |
| --- | --- |
| `php -v` masih 8.1 | `C:\xampp\php` masih di PATH sistem, atau terminal belum dibuka ulang. Terminal di dalam VS Code mewarisi PATH saat VS Code dibuka, jadi tutup dan buka ulang VS Code setelah mengubah PATH. Lihat bagian 1. |
| Composer gagal di `post-autoload-dump` dengan "require a PHP version >= 8.3.0" | Composer berjalan dengan PHP lama (lihat baris di atas). Paketnya sudah terpasang; jalankan ulang `composer dump-autoload -n` dengan PHP 8.3+. |
| `php -m` tidak memuat `pdo_mysql` | Folder PHP belum punya `php.ini`. Salin `php.ini-development` menjadi `php.ini`, isi `extension_dir` dengan jalur lengkap folder `ext`, aktifkan ekstensi di `arsitektur-backend.md` 2a. |
| `npm run dev` berkata basis data belum menyala | Modul MySQL XAMPP belum dinyalakan, atau port 3306 dipakai program lain (mis. MySQL Laragon). |
| Tes Pest gagal "Unknown database 'tani_muda_uji'" | Basis data uji belum dibuat (bagian 2 langkah 2). |
| Composer diam lama tanpa keluaran | Composer sedang menunggu jawaban. Jalankan ulang dengan `-n` (tanpa tanya). |
| Port 8000 atau 5173 sudah dipakai | Server sebelumnya belum berhenti. Tutup terminal lamanya, atau cari prosesnya: `Get-NetTCPConnection -LocalPort 8000`. |
