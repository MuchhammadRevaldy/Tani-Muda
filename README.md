# Tani Muda

Tani Muda adalah aplikasi web responsif (PWA) yang menemani petani muda melewati satu siklus tanam: belajar cara menanam, menghitung modal, merawat tanaman dengan pengingat, sampai menjual panen langsung ke pembeli sebelum menanam. Semua fitur bertumpu pada **Resep Tanam**, yaitu panduan per komoditas dan metode tanam yang divalidasi penyuluh.

Aplikasi ini dirancang untuk HP di lahan, di bawah matahari, dengan sinyal lemah. Karena itu teksnya paling kecil 16px, target sentuh paling kecil 48px, dan aplikasi tetap bisa dipakai saat offline.

> **Status:** v1 untuk lomba dan pilot di satu kecamatan. Tahap 1 (fondasi: sistem desain, komponen, kerangka halaman) sudah selesai. Tampilan dikerjakan lebih dulu dengan data tiruan; backend Laravel menyusul setelah semua halaman selesai. Rincian progres ada di [`docs/rencana-kerja.md`](docs/rencana-kerja.md).

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

Kerangka halaman: sidebar untuk petani di desktop dan navigasi bawah di HP.

| Petani, desktop                                                                                                         | Petani, mobile                                                                                                    | Pembeli, desktop                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/tangkapan/aplikasi/00-kerangka-petani-desktop.png" alt="Kerangka halaman petani di desktop" width="360"> | <img src="docs/tangkapan/aplikasi/00-kerangka-petani-mobile.png" alt="Kerangka halaman petani di HP" width="160"> | <img src="docs/tangkapan/aplikasi/00-kerangka-pembeli-desktop.png" alt="Kerangka halaman pembeli di desktop" width="360"> |

Semua tangkapan ada di [`docs/tangkapan/`](docs/tangkapan/). Penamaannya mengikuti indeks papan di [`design/README.md`](design/README.md).

## Stack

| Bagian            | Teknologi                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Antarmuka         | React 19, TypeScript (strict), Vite, vite-plugin-pwa                                                               |
| Tampilan          | Tailwind CSS 3.4 dengan token dari sistem desain (tema bawaan diganti)                                             |
| Data (sekarang)   | Klien API dengan implementasi tiruan berisi data contoh (memori dan localStorage)                                  |
| Backend (Tahap 5) | Laravel 13 (PHP 8.3+), Sanctum (login nomor HP + OTP), Pest, MySQL/MariaDB dari XAMPP, berjalan lokal tanpa Docker |
| Offline           | Dexie (IndexedDB) dan TanStack Query                                                                               |
| Pengujian         | Vitest (fungsi murni di Node, komponen di jsdom), Testing Library                                                  |
| Mutu              | ESLint, Prettier, pemeriksa aturan proyek (`scripts/cek-aturan.mjs`)                                               |

## Menjalankan

Kebutuhan: Node.js 24 dan npm.

```bash
npm install
cp .env.example .env    # isi nilainya; jangan commit .env
npm run dev             # http://localhost:5173
```

| Perintah                                 | Fungsi                                                                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                            | Server pengembangan                                                                                                     |
| `npm test`                               | Semua tes                                                                                                               |
| `npm run test:cakupan`                   | Tes dan cakupan `src/lib` (ambang 90%)                                                                                  |
| `npm run lint`                           | ESLint dan pemeriksa aturan proyek (warna di luar token, teks di bawah 16px, bayangan, kata terlarang, rahasia backend) |
| `npm run typecheck`                      | Cek tipe TypeScript                                                                                                     |
| `npm run build`                          | Cek tipe dan build produksi ke `dist/`                                                                                  |
| `npm run ekstrak-desain`                 | Bongkar file desain ke `design/extracted/` (bahan kerja, tidak masuk git)                                               |
| `npm run tangkap -- <url> <jalur-dasar>` | Tangkapan layar 390px dan 1440px dengan Chrome atau Edge yang terpasang                                                 |
| `npm run data-contoh`                    | Tulis ulang `src/api/tiruan/data/*.json` dari `pembuat-data.ts`                                                         |

Sumber data dipilih dengan `VITE_SUMBER_DATA` di `.env`: `tiruan` (bawaan, data contoh di browser) atau `http` (backend Laravel, tersedia mulai Tahap 6). Data tiruan yang diubah selama demo tersimpan di `localStorage` browser.

Untuk demo dengan data contoh, isi `.env` dengan `VITE_TAMPILKAN_RESEP_CONTOH=true`. Tanpa itu semua resep contoh disembunyikan (D-12), sehingga komoditas tampil "Segera hadir" dan tidak ada pesanan di sekitar. Di mode pengembangan (`npm run dev`), halaman `/akun-demo` memilih pengguna uji tanpa kode SMS, dan halaman Masuk menampilkan kode uji OTP. Keduanya tidak ikut `npm run build` (dicek otomatis).

## Struktur folder

```
tani-muda/
├── design/                 sumber desain (tidak diubah)
│   ├── desain-tani-muda.html   file desain asli: sistem desain + semua halaman
│   ├── icons/                  16 ikon resmi
│   └── README.md               indeks papan desain
├── docs/
│   ├── keputusan.md        keputusan produk; mengalahkan PRD dan desain
│   ├── kontrak-api.md      bentuk data dan endpoint frontend ↔ backend
│   ├── arsitektur-backend.md rancangan backend Laravel
│   ├── aturan-proyek.md    aturan wajib di setiap tugas
│   ├── rencana-kerja.md    tahap, tugas, dan progres
│   ├── ringkasan-desain.md token, komponen, dan daftar halaman
│   ├── cek-komponen.md     hasil perbandingan komponen dengan desain
│   ├── prd-tani-muda.md    kebutuhan produk (PRD)
│   └── tangkapan/          tangkapan layar aplikasi dan desain
├── public/fonts/           Plus Jakarta Sans (lokal)
├── scripts/                pemeriksa aturan, ekstraksi desain, tangkapan layar
└── src/
    ├── lib/                fungsi murni dan tesnya (format, hitungan modal, jadwal, ...)
    ├── tipe/               tipe domain (camelCase)
    ├── api/                kontrak (tipe snake_case), klien API, hook kueri, klien tiruan + data contoh
    ├── penyedia/           antarmuka OTP dan pembayaran beserta implementasi tiruannya
    ├── teks/               semua teks antarmuka (Bahasa Indonesia)
    ├── komponen/           komponen bersama (tombol, kartu, penggaris umur tanam, ...)
    ├── halaman/            halaman
    ├── uji/                persiapan tes
    ├── rute.tsx            daftar rute
    └── main.tsx            titik masuk
```

Halaman dan komponen hanya mengambil data lewat hook di `src/api/kueri` (dijaga lint). Di Tahap 5 repositori dipecah menjadi `frontend/` (proyek React ini), `backend/` (Laravel), dan `shared/kasus-uji/` (kasus uji perhitungan yang dipakai Vitest dan Pest). Rancangannya di [`docs/arsitektur-backend.md`](docs/arsitektur-backend.md).

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
- Kunci rahasia (`APP_KEY`, kata sandi basis data, kunci VAPID privat, kunci pembayaran) hanya ada di file `.env` backend dan tidak pernah dikirim ke frontend.
- Hak akses data dijaga di server lewat Policy per peran. Klien API tiruan menegakkan aturan yang sama selama backend belum ada.
- `npm run lint` gagal bila kode frontend atau `.env.example` menyebut nama kunci rahasia backend atau variabel selain `VITE_*`.

## Data contoh

Angka dosis, harga, hasil panen, dan rentang pH/PPM di repositori ini adalah **data contoh** yang belum divalidasi penyuluh. Di aplikasi, angka itu selalu berlabel "CONTOH, belum divalidasi penyuluh" dan tidak boleh dibaca sebagai rekomendasi agronomis atau keuangan.

## Lisensi pihak ketiga

Font Plus Jakarta Sans (SIL Open Font License 1.1) disalin dari file desain ke `public/fonts/`.
