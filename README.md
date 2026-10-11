# Tani Muda

Tani Muda adalah aplikasi web responsif (PWA) yang menemani petani muda melewati satu siklus tanam: belajar cara menanam, menghitung modal, merawat tanaman dengan pengingat, sampai menjual panen langsung ke pembeli sebelum menanam. Semua fitur bertumpu pada **Resep Tanam**, yaitu panduan per komoditas dan metode tanam yang divalidasi penyuluh.

Aplikasi ini dirancang untuk HP di lahan, di bawah matahari, dengan sinyal lemah. Karena itu teksnya paling kecil 16px, target sentuh paling kecil 48px, dan aplikasi tetap bisa dipakai saat offline.

> **Status:** v1 untuk lomba dan pilot di satu kecamatan. Semua halaman (Tahap 4) sudah jadi dengan data tiruan. Tahap 5 sedang berjalan: backend Laravel di `backend/` (gelombang 5.1: kerangka API, format respons, kasus uji bersama). Selama Tahap 5 aplikasi tetap memakai data tiruan. Rincian progres ada di [`docs/rencana-kerja.md`](docs/rencana-kerja.md).

## Fitur utama

| Pilar       | Fitur                                                                                                                                                 | Hasil bagi petani muda                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Belajar** | Modul video singkat per tahap tanam, daftar tugas harian                                                                                              | Tahu cara menanam yang benar            |
| **Hitung**  | Kalkulator modal dari resep (benih, pupuk, harga, biaya lain, titik impas), jadwal perawatan otomatis dengan pengingat, catatan pengeluaran           | Modal terukur dan perawatan tepat waktu |
| **Jual**    | Pesan Sebelum Tanam: pembeli memasang pesanan, petani di sekitar mengambilnya, uang muka ditahan dengan aman, pembayaran per kiriman, rating dua arah | Pembeli dan harga pasti sebelum menanam |

## Tangkapan layar

Halaman komponen `/komponen` dibandingkan berdampingan dengan papan sistem desain:

| Desktop 1440px                                                                                                 | Mobile 390px                                                                                             |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| <img src="docs/tangkapan/aplikasi/00-sistem-desain-desktop.png" alt="Halaman komponen di desktop" width="560"> | <img src="docs/tangkapan/aplikasi/00-sistem-desain-mobile.png" alt="Halaman komponen di HP" width="220"> |

Halaman yang sudah jadi: Beranda petani dan dasbor pembeli.

| Petani, desktop                                                                                               | Petani, mobile                                                                                          | Pembeli, desktop                                                                                                              |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/tangkapan/aplikasi/03-beranda-petani-desktop.png" alt="Beranda petani di desktop" width="360"> | <img src="docs/tangkapan/aplikasi/03-beranda-petani-mobile.png" alt="Beranda petani di HP" width="160"> | <img src="docs/tangkapan/aplikasi/36-dasbor-pesanan-pembeli-desktop.png" alt="Dasbor pesanan pembeli di desktop" width="360"> |

Semua tangkapan ada di [`docs/tangkapan/`](docs/tangkapan/); tangkapan kerangka Tahap 1 disimpan di [`docs/tangkapan/arsip/tahap-1/`](docs/tangkapan/arsip/tahap-1/). Penamaannya mengikuti indeks papan di [`design/README.md`](design/README.md).

## Stack

| Bagian            | Teknologi                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Antarmuka         | React 19, TypeScript (strict), Vite, vite-plugin-pwa                                                               |
| Tampilan          | Tailwind CSS 3.4 dengan token dari sistem desain (tema bawaan diganti)                                             |
| Data (sekarang)   | Klien API dengan implementasi tiruan berisi data contoh (memori dan localStorage)                                  |
| Backend (Tahap 5) | Laravel 13 (PHP 8.3+), Sanctum (login nomor HP + OTP), Pest, Pint, MariaDB dari XAMPP, berjalan lokal tanpa Docker |
| Offline           | Dexie (IndexedDB) dan TanStack Query                                                                               |
| Pengujian         | Vitest (fungsi murni di Node, komponen di jsdom), Testing Library                                                  |
| Mutu              | ESLint, Prettier, pemeriksa aturan proyek (`frontend/scripts/cek-aturan.mjs`), Laravel Pint                        |

## Menjalankan

Kebutuhan frontend: Node.js 24 dan npm. Semua perintah `npm` frontend dijalankan di folder `frontend/`.

```bash
cd frontend
npm install
cp .env.example .env    # isi nilainya; jangan commit .env
npm run dev             # http://localhost:5173
```

Backend Laravel (Tahap 5) butuh PHP 8.3+, Composer, dan MariaDB dari XAMPP. Langkah pertama kali, tes, dan masalah umum ada di [`docs/menjalankan-lokal.md`](docs/menjalankan-lokal.md). Setelah terpasang, API dan frontend menyala dengan satu perintah dari akar repositori (nyalakan dulu modul MySQL di XAMPP):

```bash
npm run dev             # di akar: php artisan serve (:8000) + Vite (:5173) dengan proxy /api
```

Skrip di akar (`npm run dev`, `demo`, `build:demo`, `preview:demo`) hanya meneruskan ke `frontend/`.

| Perintah                                 | Fungsi                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                            | Server pengembangan                                                                                                     |
| `npm run dev:lengkap`                    | API Laravel dan server pengembangan sekaligus (sama dengan `npm run dev` di akar)                                       |
| `npm run demo`                           | Server pengembangan dengan pengaturan demo (data tiruan, resep contoh)                                                  |
| `npm test`                               | Semua tes                                                                                                               |
| `npm run test:cakupan`                   | Tes dan cakupan `src/lib` (ambang 90%)                                                                                  |
| `npm run lint`                           | ESLint dan pemeriksa aturan proyek (warna di luar token, teks di bawah 16px, bayangan, kata terlarang, rahasia backend) |
| `npm run typecheck`                      | Cek tipe TypeScript                                                                                                     |
| `npm run build`                          | Cek tipe dan build produksi ke `dist/`                                                                                  |
| `npm run ekstrak-desain`                 | Bongkar file desain ke `design/extracted/` (bahan kerja, tidak masuk git)                                               |
| `npm run tangkap -- <url> <jalur-dasar>` | Tangkapan layar 390px dan 1440px dengan Chrome atau Edge yang terpasang                                                 |
| `npm run data-contoh`                    | Tulis ulang `shared/data-contoh/*.json` dari `pembuat-data.ts`                                                          |
| `npm run pasang-video`                   | Pasang video modul asli dari `public/video/modul/` (lihat "Memasang video modul")                                       |
| `node scripts/buat-ikon.mjs`             | Buat ulang favicon dan ikon layar utama di `public/` dari ikon kebun dan token warna                                    |

Sumber data dipilih dengan `VITE_SUMBER_DATA` di `.env`: `tiruan` (bawaan, data contoh di browser) atau `http` (backend Laravel, tersedia mulai Tahap 6). Data tiruan yang diubah selama demo tersimpan di `localStorage` browser.

### Menjalankan demo

```bash
npm run demo            # http://localhost:5173, semua pengaturan demo menyala
```

`npm run demo` menjalankan mode pengembangan dengan data tiruan dan resep contoh tampil, tanpa bergantung pada isi `.env` (D-37). Lalu:

1. Buka `/akun-demo` dan pilih pengguna uji (petani, pembeli, penyuluh, admin) tanpa kode SMS.
2. Atau buka `/masuk`: kode OTP uji tampil di kotak "Mode pengembangan".
3. Tombol **Atur ulang data demo** di `/akun-demo` mengembalikan semua data ke data contoh awal.

Dengan `npm run dev`, resep contoh hanya tampil bila `.env` berisi `VITE_TAMPILKAN_RESEP_CONTOH=true` (D-12). Pemilih akun demo dan kode uji tidak pernah ikut `npm run build` (dicek otomatis). Cadangan demo lokal (T6.09, D-48), tanpa server pengembangan:

```bash
npm run build:demo      # build dengan data tiruan, pemilih akun demo, dan label "Mode demo" ke dist-demo/
npm run preview:demo    # http://localhost:4173
```

Peramban yang belum punya data langsung disiapkan data demo; **Atur ulang data demo** ada di `/akun-demo` (juga lewat label "Mode demo"). Build produksi biasa (`npm run build`) tetap tanpa akun demo dan label demo.

### Memasang video modul

Video asli modul belajar (MP4 360p, D-29) dipasang tanpa mengubah kode:

1. Ekspor video sebagai **MP4 (H.264) 360p**, paling besar **15 MB** (`batas_video_mb` di konfigurasi). Durasi sekitar 3 menit.
2. Beri nama berkas **sama dengan id modulnya**, lalu taruh di `frontend/public/video/modul/`. Contoh: `modul-sawi-bedengan-4.mp4` untuk modul Perawatan sawi bedengan. Id setiap modul ada di `shared/data-contoh/modul.json` (kolom `id`) dan tampil di alamat halaman pemutar (`/belajar/<id>`).
3. Jalankan:

   ```bash
   cd frontend
   npm run pasang-video
   ```

   Skrip memeriksa nama, format, dan ukuran, lalu menulis `shared/data-contoh/video-modul.json` (nama berkas dan ukurannya). Berkas yang salah nama, bukan MP4, atau terlalu besar disebutkan satu per satu dan tidak dipasang.

4. Muat ulang aplikasi. Modul itu langsung memakai video asli menggantikan video contoh atau keterangan "video sedang disiapkan"; data demo tidak perlu diatur ulang.
5. Commit berkas video dan `video-modul.json` bersama-sama. `npm test` gagal bila daftar menunjuk berkas yang tidak ada.

Untuk mencopot video, hapus berkasnya lalu jalankan `npm run pasang-video` lagi. Di Tahap 5, seeder backend membaca `video-modul.json` yang sama.

## Struktur folder

```
tani-muda/
├── frontend/               aplikasi React (PWA)
│   ├── public/             font lokal, ikon, video contoh
│   ├── scripts/            pemeriksa aturan, build demo, tangkapan layar, dev:lengkap
│   └── src/
│       ├── lib/            fungsi murni dan tesnya (format, hitungan modal, jadwal, ...)
│       ├── tipe/           tipe domain (camelCase)
│       ├── api/            kontrak (tipe snake_case), klien API, hook kueri, klien tiruan + data contoh
│       ├── penyedia/       antarmuka OTP dan pembayaran beserta implementasi tiruannya
│       ├── teks/           semua teks antarmuka (Bahasa Indonesia)
│       ├── komponen/       komponen bersama (tombol, kartu, penggaris umur tanam, ...)
│       ├── halaman/        halaman
│       ├── uji/            persiapan tes
│       ├── rute.tsx        daftar rute
│       └── main.tsx        titik masuk
├── backend/                API Laravel 13 (/api/v1)
│   ├── app/Http/           controller API, format galat (Galat/), respons dan paginasi
│   ├── app/Models/, Enums/ model Eloquent dan pilihan tetap sesuai kontrak
│   ├── database/migrations/ tabel sesuai kontrak-api.md bagian 2, dengan batasan CHECK
│   ├── lang/id/            pesan validasi Bahasa Indonesia
│   └── tests/              tes Pest (Feature memakai basis data tani_muda_uji)
├── shared/
│   ├── kasus-uji/          kasus uji uang, kapasitas, jarak (JSON) untuk Vitest dan Pest
│   └── data-contoh/        data contoh (JSON) untuk klien tiruan dan seeder Laravel
├── design/                 sumber desain (tidak diubah)
│   ├── desain-tani-muda.html   file desain asli: sistem desain + semua halaman
│   ├── icons/                  16 ikon resmi
│   └── README.md               indeks papan desain
└── docs/
    ├── keputusan.md        keputusan produk; mengalahkan PRD dan desain
    ├── kontrak-api.md      bentuk data dan endpoint frontend ↔ backend
    ├── arsitektur-backend.md rancangan backend Laravel
    ├── menjalankan-lokal.md  menjalankan backend dan frontend di laptop
    ├── aturan-proyek.md    aturan wajib di setiap tugas
    ├── rencana-kerja.md    tahap, tugas, dan progres
    ├── ringkasan-desain.md token, komponen, dan daftar halaman
    ├── cek-komponen.md     hasil perbandingan komponen dengan desain
    ├── prd-tani-muda.md    kebutuhan produk (PRD)
    └── tangkapan/          tangkapan layar aplikasi dan desain
```

Halaman dan komponen hanya mengambil data lewat hook di `frontend/src/api/kueri` (dijaga lint). Rancangan backend ada di [`docs/arsitektur-backend.md`](docs/arsitektur-backend.md).

## Dokumen penting

Baca berurutan sebelum mengerjakan tugas:

1. [`docs/keputusan.md`](docs/keputusan.md): keputusan produk; **mengalahkan PRD dan desain**.
2. [`docs/aturan-proyek.md`](docs/aturan-proyek.md): aturan wajib di setiap tugas.
3. [`docs/rencana-kerja.md`](docs/rencana-kerja.md): daftar tugas dan progres.
4. [`docs/ringkasan-desain.md`](docs/ringkasan-desain.md): token, komponen, dan halaman.
5. [`docs/kontrak-api.md`](docs/kontrak-api.md): bentuk data dan endpoint API.
6. [`docs/arsitektur-backend.md`](docs/arsitektur-backend.md): rancangan backend Laravel.

## Keamanan

- Hanya variabel berawalan `VITE_` yang sampai ke browser, dan semuanya terbuka untuk publik.
- Kunci rahasia (`APP_KEY`, kata sandi basis data, kunci VAPID privat, kunci pembayaran) hanya ada di `backend/.env` (tidak pernah di-commit) dan tidak pernah dikirim ke frontend. Dengan proxy Vite, peramban hanya berbicara dengan `localhost:5173`.
- Hak akses data dijaga di server lewat Policy per peran. Klien API tiruan menegakkan aturan yang sama selama backend belum ada.
- `npm run lint` gagal bila kode frontend atau `frontend/.env.example` menyebut nama kunci rahasia backend atau variabel selain `VITE_*`.

## Data contoh

Angka dosis, harga, hasil panen, dan rentang pH/PPM di repositori ini adalah **data contoh** yang belum divalidasi penyuluh. Di aplikasi, angka itu selalu berlabel "CONTOH, belum divalidasi penyuluh" dan tidak boleh dibaca sebagai rekomendasi agronomis atau keuangan.

## Lisensi pihak ketiga

Font Plus Jakarta Sans (SIL Open Font License 1.1) disalin dari file desain ke `frontend/public/fonts/`.
