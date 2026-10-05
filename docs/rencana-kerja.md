# Rencana Kerja Tani Muda

Daftar tugas berurutan, dikelompokkan per tahap. Dibaca bersama `aturan-proyek.md` (aturan wajib), `ringkasan-desain.md` (token, komponen, halaman), `arsitektur-backend.md` (rancangan Laravel), `kontrak-api.md` (bentuk data dan endpoint, dibuat di Tahap 3), dan PRD di `docs/`.

Urutan tahap (D-20): **1** fondasi → **2** logika inti → **3** kontrak API dan data tiruan → **4** semua halaman dengan data tiruan → **5** backend Laravel → **6** penyambungan, offline, notifikasi, uji menyeluruh. Fokus saat ini tampilan; backend dikerjakan setelah semua halaman selesai.

## Cara membaca

- `[ ]` belum, `[x]` selesai. Tulis satu baris catatan di bawah tugas saat mencentang.
- **[DEMO]** = wajib untuk demo lomba. Tugas tanpa tanda adalah P0 lain atau pelengkap yang boleh menyusul setelah demo siap.
- Setiap tugas berisi: **Tujuan**, **Berkas** (dibuat atau diubah), **PRD**, **Selesai bila**, **Prasyarat**. Ukuran: beberapa jam. Tugas yang ternyata lebih besar dipecah (aturan proyek 11.4).
- "Papan NN" = nomor halaman di [`design/README.md`](../design/README.md) (urutan alur aplikasi). "Papan 03" berarti versi mobile dan desktop; "papan 03 mobile" berarti satu versi.
- Semua tugas tunduk pada daftar periksa di `aturan-proyek.md` bagian 12. Di bawah ini hanya ditulis syarat khusus tugas.
- **`docs/keputusan.md` mengalahkan PRD, desain, dan dokumen ini.** Keputusan 4 dan 5 Oktober 2026 (D-01 sampai D-34) sudah diterapkan di bawah dan ditandai "(D-nn)".
- Tugas halaman **[DEMO]** di Tahap 4 punya satu syarat tambahan (D-07): **tangkapan layar mobile 390px dan desktop 1440px** di `docs/tangkapan/aplikasi/<nomor>-<nama>-mobile.png` dan `-desktop.png` (nama sama dengan papan desainnya; halaman turunan memakai nomor di tabel "Halaman turunan" `design/README.md`), ditunjukkan ke pemilik produk, lalu **berhenti menunggu tanggapan** sebelum tugas berikutnya.

## Jalur demo lomba (definisi [DEMO])

Satu cerita utuh, dari belajar sampai uang cair, dengan resep contoh sawi (bedengan dan hidroponik) dan padi (sawah):

1. Landing → **Masuk** (OTP uji) → **Beranda** kosong.
2. **Hitung**: pilih tanaman → cara tanam → ukuran → kalkulator (subsidi, merek, alat sekali beli) → ringkasan untung → simpan rencana + tanggal tanam.
3. **Jadwal**: beranda berisi tugas hari ini, tandai selesai dengan foto, tunda, tugas terlambat, **cek pH/PPM hidroponik**, banner/notifikasi pagi.
4. **Belajar**: daftar modul, putar modul, tandai ditonton, unduh offline.
5. **Jual**: pesanan di sekitar → detail → ambil sebagian (cek lahan) → kesepakatan; sisi pembeli: buat pesanan → bayar uang muka (mode uji) → dasbor → konfirmasi kiriman → dana cair.
6. **Offline**: jadwal tetap terbuka, tugas selesai offline tersinkron.

Di luar demo (tetap P0, dikerjakan setelahnya): rating, gagal panen/pembatalan, verifikasi pembeli, sengketa, profil lengkap, panel mentor/admin, pesanan sekali panen (opsional dimasukkan demo bila waktu cukup), halaman statis.

## Keputusan awal yang saya ambil (ubah di sini bila tidak setuju)

| # | Keputusan | Alasan |
| --- | --- | --- |
| K1 | Routing memakai **React Router** | Stack belum menyebut router; ini yang paling lazim dengan Vite |
| K2 | Pengembangan lokal **tanpa Docker**: Vite (`npm run dev`), Laravel (`php artisan serve`, `schedule:work`, `queue:work`), MariaDB dari XAMPP; data diulang dari nol dengan `php artisan migrate:fresh --seed` (D-19) | Keputusan pemilik produk |
| K3 | Setiap versi resep adalah **baris baru** di `resep_tanam` (versi naik); `siklus_tanam.resep_id` menunjuk baris versi yang dipakai | Memenuhi P0-04 tanpa menyalin seluruh resep |
| K4 | Diganti D-26: menu **Kebun** membuka satu siklus aktif langsung, daftar siklus bila lebih dari satu, atau keadaan kosong "Mulai siklus tanam pertamamu" | Keputusan pemilik produk |
| K5 | Zona waktu bawaan **Asia/Jakarta**; notifikasi pagi default 06.00 | Pilot di Jawa Barat |
| K6 | Halaman tanpa desain dibuat sebagai **turunan** dari pola yang ada: mobile 390px dengan navigasi bawah, desktop 1440px dengan sidebar kiri dan dua kolom bila membantu; panel mentor/admin hanya desktop berbentuk tabel sederhana (D-07) | Keputusan pemilik produk |
| K7 | Angka resep, harga, pH/PPM di seed = **contoh**, status `draf`, label "CONTOH, belum divalidasi penyuluh" (D-10, D-11). Rumus PRD berlaku, angka desain hanya ilustrasi (D-08) | Hambatan PRD tidak menghentikan pekerjaan |
| K8 | Pengujian visual manual dengan membuka papan desain berdampingan; tanpa alat uji visual otomatis | Sesuai stack |

---

# Tahap 1. Fondasi

Tujuan tahap: proyek jalan, token dan komponen dasar sama dengan desain, halaman `/komponen` bisa dibandingkan dengan papan 00.

### [x] T1.01 Setup proyek **[DEMO]**
- **Tujuan:** Proyek Vite + React + TypeScript (strict) + Tailwind + Vitest + ESLint + Prettier jalan dengan perintah `dev`, `build`, `test`, `lint`, `typecheck`.
- **Berkas:** `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts` (cakupan `src/lib` ≥ 90%), `eslint.config.js`, `.prettierrc`, `.gitignore` (termasuk `.env`, `design/extracted` tetap dilacak), `.env.example`, `README.md` (cara menjalankan), struktur `src/{lib,teks,komponen,halaman,data,tipe}`. `git init` bila belum ada repo.
- **PRD:** Dependensi (PWA, HTTPS).
- **Selesai bila:** `npm run dev` menampilkan halaman kosong; `npm run test` menjalankan satu tes contoh; `npm run build` sukses; `.env.example` hanya berisi nama variabel publik berawalan `VITE_`.
- **Prasyarat:** tidak ada.
- **Catatan (5 Okt 2026):** Vite 8, React 19, TypeScript 5.9 strict, Tailwind 3.4 (dipilih agar token tetap di `tailwind.config.ts` dan tema bawaan bisa diganti total), Vitest 5 dengan dua proyek tes (fungsi murni di Node, komponen di jsdom). jsdom 27 dipakai karena jsdom 30 butuh Node ≥ 24.15. `git init` sudah, belum ada commit.

### [x] T1.02 Token Tailwind dan font **[DEMO]**
- **Tujuan:** Semua token desain ada di konfigurasi Tailwind; font Plus Jakarta Sans dimuat dari berkas lokal.
- **Berkas:** `tailwind.config.ts` (17 warna, `fontFamily.sans`, skala `fontSize` dengan tinggi baris untuk 16/22, 16/24, 18/26, 20/28, 22/28 + ukuran landing, `spacing` 4/8/12/16/20/24/32/40/48, `borderRadius` sm/md/lg/sheet/full, `boxShadow.fokus` dan `boxShadow.pilihan`, `height.kontrol` 52, `minHeight/minWidth.sentuh` 48, `screens` sesuai keputusan), `src/index.css` (`@font-face` dari `public/fonts/*.woff2`, salin 4 subset dari `design/extracted/assets/` sesuai `unicode-range` di `pages/00-sistem-desain-desktop.html`; latar `embun-pagi`, antialias, `tabular-nums` util), `index.html` (`lang="id"`).
- **PRD:** –(desain 00).
- **Selesai bila:** halaman uji menampilkan 17 swatch dengan hex persis seperti `ringkasan-desain.md` 1.1; font tampil tanpa meminta jaringan eksternal; `text-sm` dan `shadow-md` tidak tersedia.
- **Prasyarat:** T1.01.
- **Catatan (5 Okt 2026):** Ditambah token `tirai` (latar dialog), skala 26/30px, ukuran bernama, `tampil-1…5`, titik patah (disetujui di D-16). Font: subset latin dan latin-ext saja. Dicatat di ringkasan-desain 1.8.

### [x] T1.03 Lint pelindung aturan
- **Tujuan:** Aturan 2 dan 6 `aturan-proyek.md` dijaga otomatis. Ditambah **lint teks** untuk aturan bahasa petani (D-09).
- **Berkas:** `eslint.config.js` (aturan), `scripts/cek-aturan.mjs` (skrip yang gagal bila di `src/` ada hex `#xxxxxx`, `rgb(`, kelas warna bawaan Tailwind, `text-sm|text-xs`, `shadow-(sm|md|lg|xl)`, nilai sembarang `[..px]` untuk warna, nama variabel rahasia backend; aturan rahasia diperbarui 5 Okt 2026 mengikuti D-19), `package.json` (script `lint` memanggil keduanya), tes skrip. `scripts/kata-terlarang.json` (escrow, task, pending, submit, DP, HST, dashboard, login), pemeriksaan pada `src/teks/` dan teks JSX.
- **PRD:** –
- **Selesai bila:** berkas contoh yang melanggar membuat `npm run lint` gagal dan pesan menunjuk berkas dan baris; berkas bersih lolos. Teks berisi "Pembayaran DP berhasil" atau "HST 13" membuat `lint` gagal.
- **Prasyarat:** T1.02.
- **Catatan (5 Okt 2026):** ESLint + `scripts/cek-aturan.mjs` (fungsi di `scripts/aturan.mjs`, 17 tes). Juga ESLint melarang impor React dan klien API di `src/lib`.

### [x] T1.04 Teks UI dan kerangka rute
- **Tujuan:** Rute semua halaman terdaftar (halaman kosong), satu tempat teks UI, halaman memuat/galat/404 dalam Bahasa Indonesia.
- **Berkas:** `src/teks/umum.ts`, `src/rute.tsx` (rute usulan di `ringkasan-desain.md` bagian 3), `src/halaman/{Memuat,Galat,TidakDitemukan}.tsx`, `src/app.tsx`, `src/main.tsx`.
- **PRD:** –
- **Selesai bila:** semua rute di tabel halaman bisa dibuka dan menampilkan judul placeholder; rute tak dikenal menampilkan "Halaman tidak ditemukan" dengan tombol "Kembali ke beranda".
- **Prasyarat:** T1.01.
- **Catatan (5 Okt 2026):** Semua rute terdaftar dengan isi sementara di dalam kerangka yang tepat; `/profil/notifikasi`, `/lahan`, `/pembeli/riwayat`, `/pembeli/pembayaran` ditambahkan. Tes rute di `src/rute.test.tsx`.

### [x] T1.05 Fungsi format angka dan tanggal (`src/lib/format.ts`) **[DEMO]**
- **Tujuan:** Satu sumber format: `titikRibuan`, `formatRupiah` (`Rp430.000`, `−Rp80.000`), `terbilang`, `formatDesimal` (koma), `parseAngka` ("1.250,5" → 1250.5), `formatJam` (`06.00`), `formatTanggal` ("Sabtu, 3 Oktober"), `formatTanggalPendek`, `formatKisaran` ("5,5–6,5"), `bulatkanRupiah`.
- **Berkas:** `src/lib/format.ts`, `src/lib/format.test.ts`.
- **PRD:** US-04, P0-08, P0-10 (angka uang).
- **Selesai bila:** tes mencakup 0, ribuan, jutaan, negatif, null/NaN, "seratus", "seribu", "dua belas", "seratus ribu", angka 13 digit, bilangan pecahan ("3,5"), dan semua nama hari/bulan Indonesia; hasil sama dengan fungsi bawaan pustaka desain (`formatRupiah`, `terbilang`) untuk 30 nilai uji.
- **Prasyarat:** T1.01.
- **Catatan (5 Okt 2026):** Ditambah `formatHitungMundur`, `bulatkanRupiah`; paritas dengan pustaka desain untuk 30 nilai. Juga `ketikan-rupiah.ts` (logika kursor InputRupiah) sebagai fungsi murni.

### [x] T1.06 Set ikon **[DEMO]**
- **Tujuan:** Komponen `Ikon` dengan 16 ikon desain, ditambah ikon tipe tugas, ikon metode, ilustrasi komoditas.
- **Berkas:** `src/komponen/ikon.tsx` (16 ikon, `ukuran`, `tebal`, `label`, `currentColor`), `src/komponen/ikon-tipe-tugas.tsx` (kalender, putar ulang, pengukur), `src/komponen/ilustrasi-metode.tsx`, `src/komponen/ilustrasi-komoditas.tsx` (sumber SVG: `design/icons/` dan `design/extracted/ikon-sebaris/`; ganti warna hex jadi `currentColor` atau kelas token), `src/komponen/Ikon.test.tsx`.
- **PRD:** P0-12 (ikon berbeda per tipe).
- **Selesai bila:** tanpa `label` → `aria-hidden`; dengan `label` → `role="img"`; tidak ada hex tersisa (lolos lint); ikon tampil sama dengan papan 00 bagian Ikon.
- **Prasyarat:** T1.02, T1.03.
- **Catatan (5 Okt 2026):** Satu komponen `Ikon` (16 ikon desain + kalender, ulang, pengukur, panah-naik-turun, silang) dan `ilustrasi.tsx` (4 metode, 10 komoditas).

### [x] T1.07 Tombol dan Kartu **[DEMO]**
- **Tujuan:** `Tombol` (utama, sekunder, ikon, penuh, disabled) dan `Kartu` (judul, keterangan, kanan, kaki biasa/uang, tanpaIsi, tingkatJudul).
- **Berkas:** `src/komponen/tombol.tsx`, `src/komponen/kartu.tsx`, tes render ringan.
- **PRD:** –(desain 00).
- **Selesai bila:** tinggi 52, min lebar 48; fokus memakai cincin token; disabled berwarna `garis`; sama dengan papan 00 bagian "Tombol dan isian" dan "Kartu".
- **Prasyarat:** T1.06.
- **Catatan (5 Okt 2026):** Ditambah `kelasTombol()` untuk tautan bergaya tombol.

### [x] T1.08 KolomIsian, InputRupiah, Uang **[DEMO]**
- **Tujuan:** Komponen isian dengan galat/bantuan/akhiran, input rupiah berformat dengan terbilang dan kursor terjaga, tampilan uang.
- **Berkas:** `src/komponen/kolom-isian.tsx`, `src/komponen/input-rupiah.tsx`, `src/komponen/uang.tsx`, tes perilaku (`InputRupiah`: ketik 5000 → "5.000" + "Lima ribu rupiah"; hapus di tengah; tempel "1.250.000"; nol depan; 13 digit maksimum).
- **PRD:** P0-08 (harga), US-04.
- **Selesai bila:** semua tes lulus; `aria-invalid` dan `aria-describedby` terpasang; angka negatif pada `Uang` merah dengan `−`; sama dengan papan 00.
- **Prasyarat:** T1.05, T1.07.
- **Catatan (5 Okt 2026):** Tes perilaku InputRupiah (ketik, tempel, nol depan, 13 digit, terkendali).

### [x] T1.09 ChipStatus, Banner, LabelKecil **[DEMO]**
- **Tujuan:** 7 status chip, 3 jenis banner, label kecil ("Subsidi", "Nonsubsidi", "Promo", "Ada pesanan", "Segera hadir", "Cocok untuk pemula", "Resep tersedia", "Terdaftar").
- **Berkas:** `src/komponen/chip-status.tsx`, `src/komponen/banner.tsx`, `src/komponen/label-kecil.tsx`, tes.
- **PRD:** P0-16, P0-13, P0-29, P0-35 (label "Promo").
- **Selesai bila:** banner `bahaya` memakai `role="alert"`, `offline` bawaan judul "Kamu sedang offline" dan teks tertunda; chip `terlambat` menerima teks bebas.
- **Prasyarat:** T1.06.
- **Catatan (5 Okt 2026):** LabelKecil punya 6 nada termasuk `contoh` untuk label D-10.

### [x] T1.10 BarisTugas **[DEMO]**
- **Tujuan:** Baris tugas dengan centang (terkendali/tidak), chip waktu, ikon tipe, tombol kamera dengan lencana jumlah foto.
- **Berkas:** `src/komponen/baris-tugas.tsx`, tes (klik centang memanggil `onCentang`, `aria-checked`, label "Tandai selesai: …").
- **PRD:** P0-12, P0-14, US-08.
- **Selesai bila:** min tinggi 72; centang 48×48; baris selesai berwarna `teks-pendukung`; ikon tipe tampil di meta ("sekali", "berulang", "pengukuran") sesuai papan 20 mobile.
- **Prasyarat:** T1.06, T1.09.
- **Catatan (5 Okt 2026):** Mengikuti versi halaman (papan 20 mobile), bukan hanya versi pustaka.

### [x] T1.11 Pil pilihan, KartuPilihan, Saklar **[DEMO]**
- **Tujuan:** Pola pilihan yang dipakai di banyak halaman.
- **Berkas:** `src/komponen/pil-pilihan.tsx` (grup tombol `aria-pressed`), `src/komponen/kartu-pilihan.tsx` (`role="radio"`, terpilih/segera hadir), `src/komponen/saklar.tsx` (`role="switch"`, area 64×48), tes.
- **PRD:** P0-30, P0-32, P0-38.
- **Selesai bila:** navigasi keyboard (panah untuk radio, spasi untuk saklar); cincin pilihan inset `daun-tua`; tidak ada hex.
- **Prasyarat:** T1.07.
- **Catatan (5 Okt 2026):** Nama berkas `pilihan.tsx`: PilPilihan (pil/segmen/kotak), GrupRadio + KartuPilihan, Saklar.

### [x] T1.12 Dialog dan LembarBawah
- **Tujuan:** Satu komponen: sheet di HP (`radius` atas 20) dan dialog 480px di desktop, fokus terkurung, Esc menutup, `aria-modal`.
- **Berkas:** `src/komponen/dialog.tsx`, tes (fokus kembali ke pemicu).
- **PRD:** P0-31 (Minta resep), P0-34 (pilih merek).
- **Selesai bila:** sama dengan papan 11; gulir latar terkunci; tombol tutup ≥ 48px.
- **Prasyarat:** T1.07, T1.11.
- **Catatan (5 Okt 2026):** Ditambah ikon tutup "silang" (di luar desain, dicatat di cek-komponen).

### [x] T1.13 Tata letak penggaris umur tanam (`src/lib/tata-letak-penggaris.ts`) **[DEMO]**
- **Tujuan:** Memindahkan logika tata letak pin penggaris (dari `design/extracted/assets/pustaka-komponen-tani-muda.js`, fungsi `PenggarisUmurTanam`) menjadi fungsi murni: input (lebar, hariIni, hariPanen, jadwal, varian, fungsi ukur teks) → daftar elemen (posisi pin, tingkat, label, tik, ujung, penanda).
- **Berkas:** `src/lib/tata-letak-penggaris.ts`, `src/lib/tata-letak-penggaris.test.ts`.
- **PRD:** P0-12 (visual jadwal), US-07, US-16.
- **Selesai bila:** tes untuk: jadwal kosong, satu pin, pin bertabrakan di varian lebar (naik tingkat), pin di hari ke-0 dan hari panen (tidak keluar lebar), `hariIni` > `hariPanen`, label "hari ini" menghindari tik; hasil identik dengan komponen desain pada contoh jadwal sawi (7, 14, 20, 28).
- **Prasyarat:** T1.01.
- **Catatan (5 Okt 2026):** Tes paritas membandingkan posisi pin dengan salinan algoritma desain pada 4 jadwal.

### [x] T1.14 PenggarisUmurTanam **[DEMO]**
- **Tujuan:** Komponen penggaris varian `hp` dan `lebar`, status pin selesai/besok/belum/terlambat/panen, daftar di bawah (HP).
- **Berkas:** `src/komponen/penggaris-umur-tanam.tsx` (memakai T1.13, `ResizeObserver`, pengukur teks lewat canvas atau `getBoundingClientRect`), tes (aria-label ringkasan).
- **PRD:** P0-12, US-07, US-16, P0-24.
- **Selesai bila:** sama dengan papan 00 bagian Penggaris (HP lebar 360, lebar 800) dan papan 01 (landing); `aria-label` = "Umur tanam hari ke-13 dari 28. Pupuk 1, …".
- **Prasyarat:** T1.06, T1.13.
- **Catatan (5 Okt 2026):** Komponen `Pin` diekspor untuk legenda dan daftar.

### [x] T1.15 Kerangka halaman (nav, sidebar, header) **[DEMO]**
- **Tujuan:** Kerangka responsif: HP = header + `NavigasiBawah`; desktop petani = `Sidebar` 256 + konten `max-w 1200`; pembeli = `HeaderPembeli` + `max-w 1152`.
- **Berkas:** `src/komponen/navigasi-bawah.tsx` (4 menu, lencana), `sidebar.tsx` (tautan, lencana, kartu akun), `menu-akun.tsx` (Profil, Pengaturan notifikasi, Keluar), `header-halaman.tsx` (tombol kembali 48×48), `header-pembeli.tsx`, `src/komponen/kerangka-petani.tsx`, `kerangka-pembeli.tsx`, `src/teks/navigasi.ts`, tes (`aria-current`, lencana "99+").
- **PRD:** US-10, US-11 (lencana pesanan).
- **Selesai bila:** pada 390px muncul nav bawah dan tidak ada sidebar; pada 1440px sebaliknya; sama dengan papan 03 desktop (sidebar) dan 36 (header pembeli). Titik beralih sesuai D-16 (sidebar mulai 1024px).
- **Prasyarat:** T1.04, T1.06, T1.07, T1.09.
- **Catatan (5 Okt 2026):** Nama berkas `navigasi.tsx` dan `kerangka.tsx`; ditambah `KerangkaPanel` (mentor/admin, desktop saja). Tangkapan: `docs/tangkapan/aplikasi/00-kerangka-petani-{mobile,desktop}.png` dan `00-kerangka-pembeli-{mobile,desktop}.png`.

### [x] T1.16 Komponen pelengkap
- **Tujuan:** `KotakOtp` (6 digit, tempel, hitung mundur), `Stepper` ("Langkah n dari 3"), `Avatar`, `DaftarLangkah` (bernomor), `DaftarSyarat` (centang), `FaqLipat`.
- **Berkas:** `src/komponen/{KotakOtp,Stepper,Avatar,DaftarLangkah,DaftarSyarat,FaqLipat}.tsx`, tes `KotakOtp` (tempel "123456", hapus mundur, otomatis pindah).
- **PRD:** P0-01 (OTP).
- **Selesai bila:** sama dengan papan 02 mobile, 10 mobile, 22 dan 32; semua target ≥ 48px.
- **Prasyarat:** T1.08, T1.11.
- **Catatan (5 Okt 2026):** Nama berkas `pelengkap.tsx` dan `avatar.tsx`; logika OTP di `src/lib/kotak-otp.ts`.

### [x] T1.17 Halaman `/komponen` untuk dicek terhadap desain **[DEMO]**
- **Tujuan:** Satu halaman yang menampilkan **semua komponen dengan semua varian dan keadaan**, ditata mengikuti papan 00, supaya bisa dibandingkan berdampingan dengan desain di 390 dan 1440.
- **Berkas:** `src/halaman/komponen.tsx` (bagian: Warna, Huruf, Tombol dan isian, Kartu, Chip status, Banner, Penggaris, Ikon, Navigasi bawah, Sidebar, Pola pilihan, Dialog, Pelengkap), `src/halaman/komponen/*.tsx`, `docs/cek-komponen.md` (daftar periksa per komponen: sama / beda + catatan).
- **PRD:** –(desain 00).
- **Selesai bila:** buka `/komponen` dan `design/extracted/pages/00-sistem-desain-desktop.html` berdampingan: tiap komponen dicentang di `cek-komponen.md` (warna, ukuran, jarak, teks sama); tidak ada hex dan warna bawaan; keyboard fokus terlihat di semua; bisa dibuka di 390px tanpa gulir horizontal.
- **Prasyarat:** T1.07 sampai T1.16.
- **Catatan (5 Okt 2026):** Tangkapan aplikasi di `docs/tangkapan/aplikasi/00-sistem-desain-{mobile,desktop}.png`, papan 00 asli di `docs/tangkapan/desain/00-sistem-desain-desktop.png`; hasil cek di `docs/cek-komponen.md`. Lint, typecheck, 118 tes, dan build hijau; cakupan `src/lib` 98%.

---

# Tahap 2. Logika inti (`src/lib`) dan test

Semua fungsi murni, tanpa React, klien API, atau `Date.now()`. Kasus tes rumus uang, kapasitas, dan jarak ditulis sebagai tabel data (`it.each`) supaya di T5.02 mudah dipindah ke `shared/kasus-uji/` dan dipakai juga oleh Pest. Setiap tugas dianggap selesai hanya bila tes lulus dan cakupan berkas ≥ 90%. Contoh angka di tes adalah **contoh** (aturan 5).

### [x] T2.01 Tipe domain dan fixture contoh resep **[DEMO]**
- **Tujuan:** Tipe TypeScript untuk Resep, input, tugas, rencana, siklus, pesanan, dst. (nama sesuai Model Data PRD), dan fixture resep contoh sawi bedengan, sawi hidroponik NFT, padi sawah, bayam, kangkung dari data desain (papan 13 mobile, 16 mobile, 18 mobile, 19 mobile, 20 mobile, 21 mobile dan 23 mobile).
- **Berkas:** `src/tipe/*.ts`, `src/lib/fixtures/contoh-resep-*.ts`, `src/lib/fixtures/contoh-resep.test.ts` (fixture konsisten: hasil per m², HST tugas ≤ umur panen).
- **PRD:** P0-03, Model Data.
- **Selesai bila:** `typecheck` hijau; fixture memuat angka contoh dengan tanda `CONTOH` di nama dan komentar; `bacaTampilkanResepContoh(nilaiEnv)` di `src/lib/pengaturan.ts` hanya mengembalikan `true` untuk nilai persis `"true"` (kosong, tidak ada, atau nilai lain → `false`; D-12), dengan tes.
- **Prasyarat:** T1.01.
- **Catatan (5 Okt 2026):** Tipe di `src/tipe/` (resep, kebun, pesanan, belajar; camelCase, dipetakan ke snake_case di T3.03). Fixture 5 resep CONTOH + `contoh-referensi.ts` (komoditas, metode, konversi, faktor sistem hidroponik, konfigurasi bisnis). Ditambah `src/lib/hasil.ts` (tipe `Hasil<T>` dan daftar `KodeGalat`), `src/lib/tanggal.ts`, dan `src/teks/galat.ts` (teks setiap kode galat).

### [x] T2.02 Konversi satuan luas `konversi-satuan.ts` **[DEMO]**
- **Tujuan:** `keM2(nilai, satuan, konversi)`, `dariM2(m2, satuan, konversi)`, `teksBantuanLuas(...)` ("7 ru ≈ 100 m²", "0,1 hektare = 1.000 m²"); `konversi` (ru/bata ke m²) dikirim sebagai argumen.
- **Berkas:** `src/lib/konversi-satuan.ts` + `.test.ts`.
- **PRD:** P0-33, US-25; rumus konversi; `konversi_satuan`.
- **Selesai bila:** tes: 1 ha = 10.000 m², 7 ru ≈ 98 m² (dengan 14), 100 m² ≈ 7 ru, nilai 0 atau kosong → galat `UKURAN_KOSONG`, nilai negatif ditolak, konversi bukan 14 (mis. 12 m² per ru) menghasilkan hasil berbeda, pembulatan tampilan konsisten dengan teks desain (papan 13 mobile).
- **Prasyarat:** T1.05, T2.01.
- **Catatan (5 Okt 2026):** Teks bantuan mengikuti papan 13: ru dibulatkan ke bilangan bulat, di bawah 1 ru memakai satu desimal ("10 m² ≈ 0,7 ru"). Satuan lokal tanpa nilai konversi → `SATUAN_TIDAK_DIKENAL`.

### [x] T2.03 Kebutuhan input `kebutuhan.ts` **[DEMO]**
- **Tujuan:** `hitungKebutuhan(input, ukuran)` = dosis × ukuran sesuai dasar dosis (per m², per tanaman, per liter larutan), `bulatkanKeKemasan(jumlah, ukuranKemasan)` selalu ke atas; kebutuhan nutrisi hidroponik = dosis pekatan per liter × volume tandon × jumlah pengisian ulang; validasi ukuran > 0 dengan pesan sesuai metode ("Isi luas lahan dulu", "Isi jumlah lubang tanam dulu", "Isi jumlah polybag dulu").
- **Berkas:** `src/lib/kebutuhan.ts` + `.test.ts`.
- **PRD:** P0-07, US-03, rumus "Kebutuhan input" dan "Kebutuhan nutrisi hidroponik".
- **Selesai bila:** tes contoh PRD (5 g/m² × 100 m² = 500 g → kemasan 1 kg → 1 kg); kelipatan kemasan (1,01 kg dengan kemasan 1 kg → 2 kg); ukuran 0/kosong → kode galat per metode; per tanaman dan per liter; dosis 0; kemasan tidak valid.
- **Prasyarat:** T2.01.
- **Catatan (5 Okt 2026):** Model dosis: `satuanDosis` → `satuanBeli` (konversi g/kg dan ml/liter otomatis, atau `isiSatuanBeli` mis. 25 g per bungkus), lalu dibulatkan ke kemasan. Nutrisi = dosis per liter × volume tandon × `jumlahPengisianLarutan` resep. Jumlah untuk 100 m² sama dengan papan 16.

### [x] T2.04 Harga item: subsidi dan merek `harga-item.ts` **[DEMO]**
- **Tujuan:** Penentuan harga satuan efektif sebuah item: urutan prioritas (subsidi aktif → harga isi sendiri → merek terpilih → rata-rata sekitar → harga contoh resep); kelayakan subsidi per input, komoditas, tanggal (`kelayakan_subsidi`); jawaban petani "dapat jatah subsidi"; harga per satuan dari harga kemasan; urutan daftar merek menurut laporan terbaru; merek lain → laporan harga baru; sumber harga sebagai kode (untuk teks "Rata-rata di sekitarmu Rp…/kg").
- **Berkas:** `src/lib/harga-item.ts` + `.test.ts`.
- **PRD:** P0-08, P0-09, P0-34, P0-35 (promo tidak mengubah urutan), US-05, US-26.
- **Selesai bila:** tes: tidak dapat jatah subsidi → semua nonsubsidi; kelayakan di luar rentang tanggal → nonsubsidi; urutan merek tidak dipengaruhi promo (tes eksplisit); harga per satuan = harga kemasan ÷ isi; item "merek lain" dengan isi 0 → galat; harga negatif ditolak (kode `HARGA_NEGATIF`); item tanpa harga ditandai `BELUM_ADA_HARGA`.
- **Prasyarat:** T2.01.
- **Catatan (5 Okt 2026):** Rata-rata sekitar dihitung dari laporan sekecamatan; rentang hari dan minimal laporan dikirim sebagai argumen. Ditambah `validasiMerekLain`. Promo tidak menjadi masukan fungsi mana pun.

### [x] T2.05 Total modal `modal.ts` **[DEMO]**
- **Tujuan:** `hitungModal(item[], opsi)`: subtotal item, subtotal per grup, total bahan, biaya alat per siklus (harga alat ÷ jumlah siklus pembagian atau seluruhnya bila tidak dibagi), total modal, daftar item belum berharga + peringatan "total belum lengkap".
- **Berkas:** `src/lib/modal.ts` + `.test.ts`.
- **PRD:** P0-08, P0-36, US-04, US-27; rumus "Total modal" dan "Biaya alat per siklus".
- **Selesai bila:** tes dengan fixture sawi bedengan (total modal contoh Rp430.000) dan hidroponik (alat Rp1.500.000 ÷ 10); pembagian 1 siklus; item dihapus; item tambahan (tenaga kerja, sewa); item tanpa harga tidak merusak total dan memunculkan peringatan; pembulatan rupiah.
- **Prasyarat:** T2.03, T2.04.
- **Catatan (5 Okt 2026):** Sawi bedengan Rp430.000; hidroponik bahan Rp247.500 + alat Rp150.000/siklus = Rp397.500; padi nonsubsidi Rp1.715.000.

### [x] T2.06 Ringkasan hasil `ringkasan.ts` **[DEMO]**
- **Tujuan:** `hitungRingkasan({totalModal, perkiraanPanen, hargaJual, ukuranM2})`: modal per m², titik impas (kg, dibulatkan ke atas), pendapatan, untung, skenario "kalau panen jelek", pesan rugi; harga jual dari harga kesepakatan bila siklus terhubung pesanan.
- **Berkas:** `src/lib/ringkasan.ts` + `.test.ts`.
- **PRD:** P0-10, US-06, P1-03 (struktur skenario); rumus pendapatan/untung/titik impas.
- **Selesai bila:** tes: contoh sawi (panen 150 kg × Rp5.000 − Rp430.000 = Rp320.000; titik impas 86 kg); untung negatif → `rugi: true` + pesan "Dengan angka ini, kamu berpotensi rugi."; harga jual 0 → titik impas tak terhingga ditangani (kode `HARGA_JUAL_KOSONG`); harga kesepakatan menimpa harga jual.
- **Prasyarat:** T2.05.
- **Catatan (5 Okt 2026):** Ditambah `sumberHargaJual` (isian/kesepakatan) dan validasi modal negatif. Teks rugi ada di `src/teks`.

### [x] T2.07 Perkiraan panen dan ukuran hidroponik `ukuran-metode.ts` **[DEMO]**
- **Tujuan:** Perkiraan panen per metode (luas × hasil/m²; lubang × hasil/lubang; polybag), saran volume tandon per sistem, kebutuhan tempat (m²) dengan dan tanpa vertikultur, jumlah per ukuran lahan, pembulatan tampilan.
- **Berkas:** `src/lib/ukuran-metode.ts` + `.test.ts`.
- **PRD:** P0-33, P0-32, US-24, US-25, US-27.
- **Selesai bila:** tes: sawah 1.000 m² × 0,55 = 550 kg gabah; NFT 200 lubang × 0,15 = 30 kg; tandon NFT 200 lubang = 100 liter; vertikultur mengurangi tempat; semua parameter dari argumen (`hasilPerSatuan`, `faktorTandon`) bukan konstanta.
- **Prasyarat:** T2.02, T2.03.
- **Catatan (5 Okt 2026):** Faktor sistem (sumbu/NFT/rakit) dari papan 14 disimpan sebagai fixture, bukan konstanta. Perkiraan panen dibulatkan 0,01 kg.

### [x] T2.08 Jadwal otomatis `jadwal-buat.ts` **[DEMO]**
- **Tujuan:** `buatJadwal(resepTugas[], tanggalTanam)` menghasilkan tugas bertipe **sekali** (tanggal + HST), **berulang** (tanggal tanam + HST mulai + k × interval sampai HST selesai), **pengukuran** (berulang + isian angka). Tugas berulang digabung menjadi satu pengingat dengan keterangan frekuensi ("setiap 3 hari") untuk tampilan. Tanggal sebagai string `YYYY-MM-DD` tanpa jam supaya bebas zona waktu.
- **Berkas:** `src/lib/jadwal-buat.ts` + `.test.ts`.
- **PRD:** P0-12, US-07; rumus tanggal tugas.
- **Selesai bila:** tes: sekali HST 14 dari tanam 20 Sep → 4 Okt; berulang 1–28 tiap 3 hari menghasilkan 10 kemunculan; interval 1; HST selesai < HST mulai ditolak; tipe `ukur` membawa besaran, batas bawah, batas atas; tanggal tanam di masa lalu (siklus pilot) tetap dihitung; lompat bulan dan tahun kabisat.
- **Prasyarat:** T2.01.
- **Catatan (5 Okt 2026):** ID tugas stabil `pola@hst` (mis. `pupuk-1@7`); hasil langsung bertipe `Tugas` berstatus `belum`.

### [x] T2.09 Ubah jadwal `jadwal-ubah.ts` **[DEMO]**
- **Tujuan:** `tundaTugas(jadwal, tugasId, hari 1–3, perkiraanPanen)` (menggeser tugas itu dan tugas **sejenis berikutnya**, hanya yang `bolehDigeser`, mengembalikan `perluKonfirmasi` bila melewati perkiraan panen); `ubahTanggalTanam(jadwal, tanggalBaru)` (hanya yang belum selesai dihitung ulang); `statusTugas(tugas, hariIni)` ("hari-ini", "besok", "terlambat n hari", "selesai"); `kelompokkanPerHari`; `saringTipe`; ringkas tugas berulang.
- **Berkas:** `src/lib/jadwal-ubah.ts` + `.test.ts`.
- **PRD:** P0-15, P0-16, P0-17, P0-12 (saring tipe), US-08; "Status terlambat tidak disimpan".
- **Selesai bila:** tes: tunda 1/2/3 hari; tunda 4 ditolak; tunda tugas yang tidak boleh digeser; tugas selesai tidak berubah saat ganti tanggal tanam; terlambat 2 hari pada contoh papan 20 mobile (1 Okt dibanding 3 Okt); penundaan melewati panen → `perluKonfirmasi`; filter tipe "ukur" pada siklus bedengan → daftar kosong dan kode `TIDAK_ADA_TIPE`.
- **Prasyarat:** T2.08.
- **Catatan (5 Okt 2026):** Tunda menggeser tugas sepola yang belum selesai pada tanggal yang sama atau sesudahnya. `ringkasBerulang` mewakili pola berulang dengan kemunculan belum selesai paling awal.

### [x] T2.10 Pengukuran `pengukuran.ts` **[DEMO]**
- **Tujuan:** `nilaiPengukuran(nilai, batasBawah, batasAtas)` → `normal | terlalu-rendah | terlalu-tinggi | kosong`; saran tindakan dari resep; `perluUkurUlang` (tugas "Ukur ulang" pada hari berikutnya bila di luar rentang); posisi pada batang rentang (`skala`) dan titik grafik 7 pengukuran terakhir.
- **Berkas:** `src/lib/pengukuran.ts` + `.test.ts`.
- **PRD:** P0-37, US-28; rumus status pengukuran.
- **Selesai bila:** tes: batas bawah dan atas dihitung **normal** (pH 5,5 dan 6,5), 6,6 terlalu tinggi, 5,4 terlalu rendah; nilai 0 dan kosong → `kosong`; koma desimal ("6,2") diterima lewat `parseAngka`; hasil di luar rentang menghasilkan tugas ukur ulang pada tanggal + 1; hasil normal tidak menambah tugas; grafik dengan < 7 data.
- **Prasyarat:** T1.05, T2.01.
- **Catatan (5 Okt 2026):** Grafik memakai pita normal ± setengah lebar rentang. Perbaikan D-34: "belum diisi" = null; nilai 0 sah (PPM 0 → terlalu rendah dengan saran); nilai divalidasi terhadap skala besaran (`skalaMin`/`skalaMaks`: pH 0–14, PPM ≥ 0) dengan galat `NILAI_DI_LUAR_SKALA`.

### [x] T2.11 Pengingat harian `pengingat.ts` **[DEMO]**
- **Tujuan:** `tugasUntukNotifikasi(tugas[], pengaturan, hariIni)`: tugas hari ini (plus terlambat) menurut tipe yang diaktifkan, teks judul "n tugas hari ini" dan isi ("Siangi rumput (terlambat), Siram pagi dan sore"), jam pagi; kondisi pengingat sore (hanya bila ada tugas belum selesai); banner pengganti bila izin ditolak.
- **Berkas:** `src/lib/pengingat.ts` + `.test.ts`.
- **PRD:** P0-13, P0-38, P1-05, P2-02 (logika dipisah dari saluran).
- **Selesai bila:** tes: mematikan tipe tidak menghapus tugas dari daftar jadwal tetapi menghilangkannya dari notifikasi; semua tipe mati → `tanpaPengingatPagi`; tidak ada tugas hari ini → tidak mengirim; sore hanya bila ada belum selesai.
- **Prasyarat:** T2.09.
- **Catatan (5 Okt 2026):** Tugas berulang yang tertunggak beberapa kali disebut sekali. Teks "n tugas hari ini" ada di `src/teks/jadwal.ts`.

### [x] T2.12 Nilai pesanan dan pembayaran `pesanan-nilai.ts` **[DEMO]**
- **Tujuan:** `hitungNilaiPesanan(jumlahTotal, hargaPerKg, konfigurasi)`: nilai pesanan, uang muka (20% dari konfigurasi), biaya layanan (5%, dibayar pembeli), dibayar sekarang; jumlah total dari kiriman × frekuensi untuk rutin; `hitungPembayaranKiriman(nilaiKiriman, saldoUangMuka, konfigurasi)` (D-02): pembeli membayar **80%** nilai kiriman, **20% diambil dari saldo uang muka**; sisa saldo setelah tiap kiriman; kiriman ditolak sebagian menghitung dari bagian diterima.
- **Berkas:** `src/lib/pesanan-nilai.ts` + `.test.ts`.
- **PRD:** P0-19, P0-23, P0-26, US-15; **D-02** (mengganti rumus pembayaran per kiriman PRD).
- **Selesai bila:** tes: 10 kg × 12 kiriman × Rp5.000 = Rp600.000, uang muka Rp120.000, layanan Rp30.000, dibayar sekarang Rp150.000; tiap kiriman Rp50.000 → bayar Rp40.000 + Rp10.000 dari saldo, saldo habis tepat setelah kiriman ke-12; persen 0; jumlah 0 → galat; biaya layanan tidak memotong bagian petani; sekali panen = satu kiriman 80% + 20% saldo; saldo tidak pernah negatif.
- **Prasyarat:** T1.05.
- **Catatan (5 Okt 2026):** Bagian dari uang muka = persen uang muka × nilai yang diterima; kiriman terakhir yang diterima penuh memakai seluruh sisa saldo supaya selisih pembulatan tidak tertinggal. Ditambah `jumlahKirimanRutin(frekuensi, durasi, maksDurasi)`.

### [x] T2.13 Lahan untuk pesanan `pesanan-lahan.ts` **[DEMO]**
- **Tujuan:** `luasPerPanen`, `luasPesananRutin` (luas per panen × petak yang tumbuh bersamaan), `saranTanamBertahap` (mingguan + umur panen 4 minggu → 4 petak berjarak 1 minggu, tanggal tanam dan panen), `cekAmbilSebagian(jumlah, hasilPerM2, lahanKosong)` → cukup atau tidak + jumlah maksimal disarankan, `batasAlokasi` (total alokasi semua petani ≤ pesanan).
- **Berkas:** `src/lib/pesanan-lahan.ts` + `.test.ts`.
- **PRD:** P0-21, US-12; rumus luas per panen dan luas rutin.
- **Selesai bila:** tes: lahan kosong 20 m², hasil per m² dari fixture → luas per panen dan petak bertahap dihitung dari rumus (bukan "6 kg" dari desain; **D-08**); jumlah yang melebihi kapasitas → jumlah maksimal disarankan dari rumus; alokasi melebihi pesanan ditolak (kode `MELEBIHI_PESANAN`); hasil per m² 0 ditolak; pesanan sekali panen tidak memakai petak bertahap; kapasitas lahan datang sebagai argumen dari T2.15a.
- **Prasyarat:** T2.07.
- **Catatan (5 Okt 2026):** Satuan kapasitas mengikuti lahan: m² atau lubang (D-15). Jumlah maksimal dibulatkan ke bawah ke 0,1 kg.

### [x] T2.14 Kiriman dan konfirmasi `kiriman.ts` **[DEMO]**
- **Tujuan:** `konfirmasiKiriman(kiriman, keputusan)`: terima semua, tolak sebagian (berat, alasan `layu_atau_busuk | jumlah_kurang | tidak_sesuai_standar | lainnya`), dana cair untuk petani, bagian dibayar pembeli (80%) dan dari uang muka (20%) lewat T2.12; `statusOtomatis(kiriman, sekarang, konfigurasiJam)` (**D-01**: 6 jam untuk rutin, 24 jam untuk sekali panen; lewat batas = dianggap diterima); `aturanGagalPanen(jadwalKirim, waktuKabar, batasHari)` (**D-03**: kabar ≥ 3 hari sebelum jadwal → bagian ditawarkan ulang; tanpa pengganti → sisa uang muka bagian itu dikembalikan; tidak memberi kabar → `catatanProfil: true`); pembatalan pembeli setelah petani menanam (uang muka jadi kompensasi).
- **Berkas:** `src/lib/kiriman.ts` + `.test.ts`.
- **PRD:** P0-25, P0-26, P0-27, US-14, US-17; **D-01, D-03**.
- **Selesai bila:** tes: bayam Rp6.000/kg, 5 kg, tolak 1 kg → dana cair Rp24.000; batas 6 jam (rutin) dan 24 jam (sekali panen) dari argumen, diuji tepat di batas, sebelum, dan sesudah; kabar tepat 3 hari sebelum jadwal diterima, kurang dari itu → catatan profil; tanpa pengganti → `dikembalikan` sebesar sisa uang muka bagian itu saja; **tidak ada denda**; tolak lebih berat dari kiriman → galat; alasan di luar daftar → galat.
- **Prasyarat:** T2.12.
- **Catatan (5 Okt 2026):** Waktu batas periksa memakai milidetik epoch sebagai argumen; tepat di batas sudah dianggap diterima.

### [x] T2.15 Jarak dan urutan pesanan `jarak.ts`
- **Tujuan:** `jarakKm(a, b)` (haversine), `urutkanTerdekat`, `dalamRadius(titik, pusat, radiusKm)`, teks jarak ("4 km", "9,5 km").
- **Berkas:** `src/lib/jarak.ts` + `.test.ts`.
- **PRD:** P0-20, US-11.
- **Selesai bila:** tes jarak titik yang sama = 0, Bandung–Jakarta ≈ 120 km, di tepi radius 10 km, urutan stabil untuk jarak sama.
- **Prasyarat:** T1.05.
- **Catatan (5 Okt 2026):** Bandung–Jakarta terukur 116,4 km (rencana menyebut ≈ 120). Fungsi `angkaJarak` memberi angka saja; satuan "km" ditulis di `src/teks`.

### [x] T2.15a Kapasitas lahan `kapasitas-lahan.ts` **[DEMO]**
- **Tujuan:** `kapasitasLahan(lahan, siklusAktif[])`. Untuk lahan tanah: luas lahan dikurangi luas siklus aktif di lahan itu (m²). Untuk lahan hidroponik: `kapasitas_lubang` dikurangi jumlah lubang siklus aktif, **bukan luas** (D-15). Satu lahan boleh punya beberapa siklus aktif. Juga `luasDipakai`/`lubangDipakai` dan `muatSiklusBaru(lahan, siklusAktif[], ukuranBaru)`.
- **Berkas:** `src/lib/kapasitas-lahan.ts` + `.test.ts`.
- **PRD:** P0-21, US-12; **D-06**, **D-15** (rumus kapasitas), **D-08**.
- **Selesai bila:** tes: lahan 120 m² dengan siklus aktif 100 m² → 20 m²; tanpa siklus → seluruh luas; siklus selesai tidak dihitung; luas dipakai melebihi luas lahan → 0 (tidak negatif); hidroponik 200 lubang dengan dua siklus aktif 100 + 50 lubang → 50 lubang (luas lahan hidroponik diabaikan); tiga siklus aktif di satu lahan tanah dijumlahkan; `muatSiklusBaru` menolak siklus yang melebihi sisa; satuan asli tidak memengaruhi hitungan.
- **Prasyarat:** T2.01.
- **Catatan (5 Okt 2026):** Perbaikan D-34: yang memakai lahan adalah siklus `aktif` dan siklus `rencana` yang terhubung ke alokasi pesanan (`alokasiPesananId`); rencana tanpa pesanan tidak dihitung. Diuji, termasuk kasus dua pesanan untuk lahan yang sama sebelum menanam.

### [x] T2.16 Progres belajar `belajar.ts` dan gerbang cakupan
- **Tujuan:** `ringkasProgres(modul[], selesai[])` ("3 dari 6 modul selesai", persen, modul lanjutan); pemeriksaan cakupan seluruh `src/lib`.
- **Berkas:** `src/lib/belajar.ts` + `.test.ts`, perbarui `vitest.config.ts` (ambang cakupan gagal bila < 90%).
- **PRD:** P0-05, US-01, US-02.
- **Selesai bila:** `npm run test -- --coverage` lulus dengan ≥ 90% di semua berkas `src/lib`; semua fungsi murni (tidak ada impor React atau `src/api` di `src/lib`, dicek ESLint).
- **Prasyarat:** T2.02–T2.15, T2.15a.
- **Catatan (5 Okt 2026):** Cakupan setiap berkas `src/lib` minimal 95,8% baris dan 93,9% cabang (total 99,2% baris). ESLint melarang impor React, `api`, `data`, `komponen`, dan `penyedia` di `src/lib`. Tes teks di `src/teks/*.test.ts` ikut dijalankan. Lint, typecheck, 491 tes, dan build hijau.

---

# Tahap 3. Kontrak API dan data tiruan

Tujuan tahap: bentuk data dan endpoint ditetapkan sekali di `docs/kontrak-api.md`, frontend punya **klien API** dengan antarmuka yang jelas, dan klien itu punya **implementasi tiruan** berisi data contoh. Halaman di Tahap 4 hanya memakai klien API, sehingga di Tahap 6 cukup implementasinya yang diganti ke HTTP (D-20).

Aturan tahap:

- **Halaman dan komponen tidak pernah mengimpor data tiruan atau implementasi tiruan.** Mereka hanya memakai antarmuka klien API lewat hook di `src/api/kueri/`. Aturan ini dijaga ESLint (T3.12).
- Klien tiruan **menegakkan aturan yang sama dengan server nanti**: kepemilikan data, peran, status akun, verifikasi pembeli, batas alokasi, kapasitas lahan, privasi titik lahan, dan penyaringan resep contoh. Klien tiruan juga mengembalikan galat dengan format kontrak.
- Angka uang di klien tiruan dihitung dengan fungsi `src/lib` (D-08), seperti yang nanti dilakukan server dengan rumus yang sama.
- Data contoh ditulis sebagai **JSON** supaya di Tahap 5 bisa dipindah ke `shared/data-contoh/` dan dipakai seeder Laravel tanpa ditulis ulang.

### [x] T3.01 Kontrak API: konvensi dan bentuk data **[DEMO]**
- **Tujuan:** `docs/kontrak-api.md` bagian 1 dan 2.
  - **Konvensi:**
    - awalan `/api/v1` dan nama kolom `snake_case` sesuai Model Data PRD dan `keputusan.md`;
    - format sukses `{ data }`;
    - **format galat** `{ galat: { kode, pesan, rincian } }` dengan daftar kode galat stabil (`UKURAN_KOSONG`, `MELEBIHI_PESANAN`, `LAHAN_TIDAK_CUKUP`, `AKUN_NONAKTIF`, `BELUM_TERVERIFIKASI`, `KETERANGAN_WAJIB`, `OTP_KEDALUWARSA`, `OTP_TERKUNCI`, …) dan kode status HTTP masing-masing;
    - **paginasi** `{ data: [], meta: { halaman, per_halaman, total, halaman_terakhir } }` dengan parameter `halaman` dan `per_halaman`;
    - uang dalam rupiah bulat, berat dalam kg desimal, tanggal `YYYY-MM-DD`, waktu ISO 8601 UTC berakhiran `Z` (D-31);
    - autentikasi dengan cookie sesi Sanctum.
  - **Bentuk data** setiap entitas Model Data PRD ditambah `keputusan.md`:
    - `pengguna` (`foto_profil`, `status_akun`), `profil_pembeli`, `catatan_petani`, `wilayah`, `lahan`, `kelompok_tani`;
    - referensi dan resep (`status`, `contoh`);
    - `siklus_tanam` (`lahan_id`, `luas_m2`, `jumlah_lubang`), `rencana_item`, `tugas`, `hasil_pengukuran`, `pengeluaran`, `pengaturan_pengingat`, `modul`, `progres_modul`, `permintaan_resep`;
    - `pesanan`, `alokasi_pesanan`, `pembayaran`, `pengiriman` (`alasan_penolakan`, `keterangan_penolakan`, `jumlah_ditolak`, `foto_penolakan`), `rating`, `sengketa`, `konfigurasi`.

    Tiap entitas memuat tipe tiap kolom, kolom wajib, dan **bentuk per penonton**. Contohnya, kebun untuk pembeli hanya berisi nama desa dan jarak (D-06).
- **Berkas:** `docs/kontrak-api.md`.
- **PRD:** Model Data; D-02, D-06, D-12–D-15.
- **Selesai bila:**
  - setiap tabel di aturan proyek 8.1 punya bentuk data;
  - setiap kode galat punya status HTTP dan pesan Bahasa Indonesia sesuai D-09;
  - contoh JSON sukses, galat validasi, galat bentrok, dan daftar berhalaman tersedia;
  - tidak ada kolom kata sandi atau nama pengguna (D-04).
- **Prasyarat:** T2.01.
- **Catatan (5 Okt 2026):** Kolom tambahan di luar Model Data PRD ditandai † dan dirangkum di D-35. Waktu memakai UTC (`Z`) sesuai D-31, bukan `+07:00`. `kelompok_tani` hanya tabel (belum ada endpoint sampai P1).

### [x] T3.02 Kontrak API: endpoint per fitur **[DEMO]**
- **Tujuan:** `docs/kontrak-api.md` bagian 3. Daftar endpoint dikelompokkan per fitur:
  - masuk (OTP kirim/verifikasi, keluar, akun);
  - pilih peran dan desa;
  - profil dan foto;
  - wilayah;
  - lahan;
  - referensi (komoditas, metode, konversi, input, merek, laporan harga, subsidi, promo);
  - resep dan permintaan resep;
  - siklus (buat dari rencana, ubah tanggal tanam, akhir siklus);
  - tugas (selesai, tunda, foto), pengukuran, pengeluaran, jurnal, pengaturan pengingat;
  - belajar (modul, progres);
  - pesanan di sekitar, detail, ambil pesanan, kesepakatan;
  - kiriman (foto kualitas, tandai dikirim, konfirmasi, tolak sebagian);
  - pembayaran (bayar uang muka, riwayat);
  - rating, gagal panen, pembatalan;
  - pembeli (daftar, status verifikasi, buat pesanan rutin dan sekali panen, dasbor);
  - admin (verifikasi, sengketa, catatan petani, nonaktifkan);
  - mentor (resep, versi, validasi);
  - langganan notifikasi; berkas (unggah, URL bertanda tangan).

  Untuk tiap endpoint dicatat:
  - metode, jalur, dan peran yang boleh;
  - masukan, respons, dan galat yang mungkin;
  - apakah berhalaman;
  - apakah butuh `kunci_idempoten` (untuk operasi uang dan antrean offline).
- **Berkas:** `docs/kontrak-api.md`.
- **PRD:** P0-01–P0-38 (sesuai fitur).
- **Selesai bila:**
  - setiap halaman Tahap 4 bisa dipetakan ke endpoint yang dipakainya (tabel halaman → endpoint di akhir dokumen);
  - setiap operasi uang menyebut bahwa nominal dihitung server dan tidak diterima dari klien;
  - setiap endpoint menyebut aturan aksesnya.
- **Prasyarat:** T3.01.
- **Catatan (5 Okt 2026):** 80 endpoint dalam 11 kelompok; tiap baris menyebut metode klien yang menjalankannya. Tabel halaman → endpoint ada di bagian 4 `kontrak-api.md`.

### [x] T3.03 Tipe TypeScript dari kontrak **[DEMO]**
- **Tujuan:**
  - Tipe untuk setiap bentuk data, masukan, dan respons di kontrak, termasuk `Respons<T>`, `Halaman<T>`, `GalatApi` (kode galat sebagai union string), dan bentuk per penonton.
  - Tipe domain di `src/tipe/` (T2.01) dipakai ulang bila sama, atau dipetakan lewat fungsi murni.
- **Berkas:** `src/api/tipe/*.ts`, `src/lib/peta-api.ts` + `.test.ts` (pemetaan JSON ↔ tipe domain, mis. tanggal ISO dan angka desimal).
- **PRD:** Model Data.
- **Selesai bila:**
  - `typecheck` hijau;
  - setiap endpoint T3.02 punya tipe masukan dan respons;
  - nama kolom sama persis dengan kontrak (tanpa pengubahan camelCase diam-diam);
  - pemetaan teruji.
- **Prasyarat:** T3.02.
- **Catatan (5 Okt 2026):** Pemetaan ditaruh di `src/api/peta.ts` + tes, bukan `src/lib/peta-api.ts`, karena `src/lib` dilarang mengimpor lapisan API (T1.03). Tipe dibagi `umum`, `akun`, `referensi`, `resep`, `kebun`, `belajar`, `pesanan`, `lain`.

### [x] T3.04 Antarmuka klien API, galat, dan kueri **[DEMO]**
- **Tujuan:**
  - Antarmuka `KlienApi` dikelompokkan per fitur (`klien.akun`, `klien.lahan`, `klien.kebun`, `klien.pesanan`, …), satu metode per endpoint, mengembalikan `Promise` dari tipe T3.03 atau melempar `GalatApi`.
  - Penyedia React `PenyediaKlienApi` dan hook `useKlienApi`.
  - Hook TanStack Query di `src/api/kueri/` dengan kunci kueri seragam dan pembatalan cache setelah mutasi.
  - Pilihan implementasi lewat `VITE_SUMBER_DATA` (`tiruan` bawaan; `http` baru tersedia di Tahap 6 dan sementara melempar galat yang jelas).
  - Penerjemahan `GalatApi` ke teks tampilan lewat `src/teks/`.
- **Berkas:** `src/api/klien.ts` (antarmuka), `src/api/galat.ts`, `src/api/penyedia-klien.tsx`, `src/api/kueri/*.ts`, `src/lib/kunci-kueri.ts` + tes, `.env.example` (`VITE_SUMBER_DATA`).
- **PRD:** –; D-20.
- **Selesai bila:**
  - satu hook contoh (`useKomoditas`) bekerja di tes komponen dengan klien palsu yang disuntikkan;
  - `GalatApi` membawa `kode`, `pesan`, dan `rincian`;
  - tidak ada `fetch` atau data tiruan di luar `src/api/`.
- **Prasyarat:** T3.03.
- **Catatan (5 Okt 2026):** Semua hook ada di satu berkas `src/api/kueri/index.ts` (pembantu di `kueri/bantu.ts`). Galat diulang otomatis hanya untuk 5xx dan jaringan, tidak untuk 4xx. Klien tiruan dimuat dinamis (potongan terpisah ±192 kB) supaya mode `http` kelak tidak membawanya. `src/main.tsx` sudah dibungkus `PenyediaKlienApi`. Ditambah `src/lib/zona-waktu.ts` + tes (D-31).

### [x] T3.05 Penyimpanan tiruan **[DEMO]**
- **Tujuan:** Penyimpanan untuk klien tiruan:
  - data di memori yang disimpan ke `localStorage` (bisa dimatikan untuk tes);
  - versi skema dan reset ke data contoh;
  - latensi buatan (bawaan 200–400 ms) dan galat buatan yang bisa dinyalakan, supaya keadaan memuat dan gagal di halaman ikut teruji;
  - pembuat ID dan jam yang bisa disuntikkan.
- **Berkas:** `src/api/tiruan/penyimpanan.ts` + `.test.ts`, `src/api/tiruan/jam.ts`.
- **PRD:** –
- **Selesai bila:**
  - data bertahan setelah muat ulang;
  - "Atur ulang data demo" mengembalikan data contoh;
  - `localStorage` yang kosong atau rusak tidak membuat aplikasi gagal (kembali ke data contoh);
  - tes memakai penyimpanan memori saja.
- **Prasyarat:** T3.04.
- **Catatan (5 Okt 2026):** Jam disuntikkan lewat opsi `jam` di `buatKlienTiruan` (tanpa berkas `jam.ts` terpisah). Latensi 200–400 ms hanya di mode pengembangan, 0 di tes dan produksi. Galat buatan lewat `galatBuatan.gagalkanBerikutnya(kode)`. Atur ulang lewat `kontrol.aturUlang()` (dipakai pemilih akun demo T4.01). Penyimpanan dan latensi ada di `penyimpanan.ts`, `latensi.ts`, `basis-data.ts`, `konteks.ts`.

### [x] T3.06 Data contoh: referensi, wilayah, konfigurasi **[DEMO]**
- **Tujuan:**
  - Data contoh dari desain: 10 komoditas (4 berresep), 4 metode, konversi ru 14 m² untuk wilayah demo, input pertanian dan merek (nomor pendaftaran), laporan harga, kelayakan subsidi (urea, NPK), promo toko tani.
  - **Wilayah**: desa demo di Lembang dan sekitarnya, dengan titik tengah desa.
  - **Konfigurasi bisnis**: uang muka 20, layanan 5, batas periksa 6 jam rutin dan 24 jam sekali panen, batas kabar 3 hari, radius 10 km, kontak admin (D-13).
- **Berkas:** `src/api/tiruan/data/referensi.json`, `wilayah.json`, `konfigurasi.json`, tes konsistensi `src/api/tiruan/data/data.test.ts`.
- **PRD:** P0-30, P0-34, P0-35; data seperti `ringkasan-desain.md` bagian 5.
- **Selesai bila:**
  - setiap data cocok dengan tipe T3.03 (diuji);
  - setiap baris contoh ditandai `contoh`;
  - tidak ada nama atau nomor HP asli;
  - angka bisnis hanya ada di `konfigurasi.json`.
- **Prasyarat:** T3.03.
- **Catatan (5 Okt 2026):** Wilayah pilot Kecamatan Lembang, Kab. Bandung Barat (D-27; nama pilot dari pemilik produk masih templat). Kode Kecamatan Lembang 32.17.01, Desa Lembang 32.17.01.2003, dan Sukajaya 32.17.01.2013 sudah dicek; kode lain ditandai `kode_terverifikasi: false` dan wajib dicek sebelum seeder Tahap 5. Tanda "contoh" ada di catatan `indeks.json` (berlaku untuk seluruh berkas) dan di setiap resep (`contoh: true`), bukan di setiap baris. JSON dibuat dari `pembuat-data.ts` dengan `npm run data-contoh`; tes gagal bila JSON diubah manual.

### [x] T3.07 Data contoh: resep draf dan modul belajar **[DEMO]**
- **Tujuan:**
  - Resep **sawi bedengan** (input dengan dosis, dasar dosis, kemasan; tugas pupuk 1 HST 7, pupuk 2 HST 14, cek hama HST 20, siangi rumput HST 11, siram setiap hari, cek daun berlubang setiap 3 hari, panen HST 28; hasil 1,5 kg/m²; standar kualitas).
  - Resep **sawi hidroponik NFT** (alat sekali beli, nutrisi per liter, tugas ukur pH/PPM tiap 2 hari dengan rentang pH 5,5–6,5 dan PPM 1.050–1.400 serta saran, ganti larutan HST 21, pindah tanam HST 10).
  - Resep **bayam dan kangkung** bedengan.
  - Resep **padi sawah** (pupuk 1 HST 14, pupuk 2 HST 35, cek hama HST 55, panen HST 110, subsidi urea dan NPK).
  - Semua resep **`status: draf`, `contoh: true`**, berlabel "CONTOH, belum divalidasi penyuluh" (D-10–D-12).
  - Hidroponik hanya untuk sawi (D-05).
  - 6 modul belajar per resep (bedengan, hidroponik sawi, sawah) dengan judul dan menit seperti papan 08 dan 09, serta video placeholder.
- **Berkas:** `src/api/tiruan/data/resep.json`, `src/api/tiruan/data/modul.json` (diturunkan dari fixture T2.01, bukan disalin ulang dengan angka berbeda).
- **PRD:** P0-03, P0-05, P0-12, P0-36, P0-37.
- **Selesai bila:**
  - kalkulator `modal.ts` dengan data resep ini menghasilkan total yang sama dengan fixture T2.01 (tes konsistensi);
  - bayam dan kangkung tidak punya resep hidroponik;
  - setiap resep punya label contoh.
- **Prasyarat:** T3.06, T2.01.
- **Catatan (5 Okt 2026):** 5 resep × 6 modul = 30 modul. 3 modul punya contoh video (MP4 360p, ≤ 15 MB), sisanya placeholder (D-29). Resep bayam dan kangkung bertanda `asal_angka_contoh: 'dikarang'` (D-34).

### [x] T3.08 Data contoh: pengguna uji, lahan, siklus, pesanan **[DEMO]**
- **Tujuan:** **Pengguna uji untuk setiap peran**, semuanya fiktif:
  - petani aktif "Arif" dengan dua lahan (bedengan 120 m² dan hidroponik 200 lubang);
  - petani kedua di desa lain;
  - petani **dinonaktifkan sementara** dengan satu catatan petani (D-13);
  - pembeli terverifikasi "Katering Bu Ratna";
  - pembeli **menunggu verifikasi**;
  - mentor;
  - admin.

  Ditambah **siklus**:
  - sawi bedengan aktif di hari ke-13, dengan tugas selesai, tugas terlambat, dan tugas besok;
  - sawi hidroponik aktif, dengan riwayat pengukuran normal dan di luar rentang;
  - satu siklus selesai.

  Lalu **pesanan rutin dan sekali panen** (hanya komoditas berresep, dari pembeli seperti di desain), dengan:
  - alokasi sebagian;
  - kiriman di setiap tahap (uang muka ditahan, menunggu konfirmasi, dana cair, ditolak sebagian dengan sengketa);
  - pembayaran;
  - rating.
- **Berkas:** `src/api/tiruan/data/pengguna.json`, `lahan.json`, `siklus.json`, `pesanan.json`, perluasan `data.test.ts`.
- **PRD:** P0-01, P0-02, P0-19, P0-20, P0-21, P0-25; D-03, D-06, D-13, D-15.
- **Selesai bila:**
  - setiap peran dan keadaan di atas ada (diuji);
  - total alokasi tidak melebihi pesanan;
  - kapasitas lahan cukup untuk siklus aktif (dicek dengan `kapasitas-lahan.ts`);
  - jarak pesanan untuk petani demo sesuai urutan papan 29 mobile (dihitung `jarak.ts` dari titik tengah desa);
  - nilai uang konsisten dengan `pesanan-nilai.ts` dan `kiriman.ts`.
- **Prasyarat:** T3.07, T2.12, T2.14, T2.15, T2.15a.
- **Catatan (5 Okt 2026):** Lahan bedengan Arif 140 m² (10 ru), bukan 120 m², supaya cukup untuk siklus sawi, bayam, dan rencana berpesanan sekaligus (sisa 20 m²). Tanggal ditulis relatif terhadap hari ini (D-35). Berkas JSON dibagi `indeks`, `konfigurasi`, `wilayah`, `referensi`, `resep`, `modul`, `pengguna`, `kebun`, `pesanan`; lahan dan siklus ada di `kebun.json`.

### [x] T3.09 Klien tiruan: akun, referensi, lahan, kebun, belajar **[DEMO]**
- **Tujuan:** Implementasi tiruan untuk endpoint masuk dan akun (memakai `PenyediaOtp` tiruan T3.11), pilih peran dan desa, profil, wilayah, referensi, resep (resep `contoh` disaring keluar bila `VITE_TAMPILKAN_RESEP_CONTOH` mati; D-12), permintaan resep, lahan, siklus (buat dari rencana dengan `jadwal-buat`, ubah tanggal tanam), tugas (selesai, tunda), pengukuran (tugas ukur ulang), pengeluaran, jurnal (foto disimpan sebagai data URL yang dikecilkan), pengaturan pengingat, modul, dan progres.

  Aturan yang ditegakkan seperti server:
  - pengguna hanya membaca dan mengubah datanya sendiri; data orang lain → `404`;
  - peran salah → `403`;
  - validasi dengan kode galat kontrak;
  - kapasitas lahan saat membuat siklus (`kapasitas-lahan.ts`, D-15).
- **Berkas:** `src/api/tiruan/klien-tiruan.ts`, `src/api/tiruan/fitur/{akun,referensi,lahan,kebun,belajar}.ts` + tes.
- **PRD:** P0-01, P0-03–P0-18, P0-30–P0-33, P0-37, P0-38; D-12, D-15.
- **Selesai bila:**
  - tes per fitur untuk setiap endpoint di kelompok ini;
  - petani A tidak bisa membaca lahan dan siklus petani B;
  - resep draf bukan contoh tidak pernah keluar;
  - paginasi dan format galat sesuai kontrak.
- **Prasyarat:** T3.05, T3.08, T3.11, T2.08, T2.09, T2.10.
- **Catatan (5 Okt 2026):** Berkas fitur dikelompokkan `fitur/akun.ts`, `referensi.ts` (termasuk wilayah, resep, belajar), dan `kebun.ts` (termasuk lahan). Tes per endpoint ada di rangkaian kontrak (T3.12), bukan berkas tes per fitur. OTP tiruan dipakai di dalam `klien.akun`, sehingga halaman Masuk hanya memanggil klien API.

### [x] T3.10 Klien tiruan: pesanan, kiriman, pembayaran, admin, mentor **[DEMO]**
- **Tujuan:** Implementasi tiruan untuk:
  - pesanan di sekitar: radius dari titik tengah desa dengan `jarak.ts`; hanya nama desa dan jarak yang dikirim (D-06);
  - detail pesanan dan **ambil pesanan**: tolak bila akun nonaktif (D-13), alokasi melebihi pesanan (`409 MELEBIHI_PESANAN`), atau lahan tidak cukup (`409 LAHAN_TIDAK_CUKUP`); membuat alokasi dan siklus dengan harga kesepakatan;
  - kesepakatan;
  - kiriman: foto kualitas wajib sebelum dikirim;
  - konfirmasi dan tolak sebagian: "Lainnya" wajib keterangan (D-14); membuat sengketa;
  - konfirmasi otomatis setelah batas periksa 6/24 jam, dihitung dari jam tiruan saat data dibaca (D-01);
  - pembayaran lewat `PenyediaPembayaran` tiruan; nominal dari `pesanan-nilai.ts` dan `kiriman.ts`, tidak dari masukan klien (D-02);
  - rating, gagal panen, dan pembatalan (D-03);
  - pembeli: daftar, status verifikasi, buat pesanan (ditolak bila belum terverifikasi), dasbor;
  - admin: verifikasi, sengketa, catatan petani, nonaktifkan;
  - mentor: resep, versi, validasi.
- **Berkas:** `src/api/tiruan/fitur/{pesanan,kiriman,pembayaran,pembeli,admin,mentor}.ts` + tes.
- **PRD:** P0-02, P0-19–P0-28, P0-04, P0-31; D-01–D-03, D-06, D-13, D-14.
- **Selesai bila:**
  - tes untuk setiap aturan di atas;
  - pembeli tidak pernah menerima koordinat lahan (diuji pada semua respons pembeli);
  - mengulang permintaan bayar dengan `kunci_idempoten` yang sama tidak membayar dua kali.
- **Prasyarat:** T3.09, T2.12, T2.13, T2.14.
- **Catatan (5 Okt 2026):** Berkas dikelompokkan `fitur/pesanan.ts` (pesanan, kiriman, pembeli) dan `fitur/admin.ts` (admin, mentor). Keadaan dana di pembayaran tiruan diturunkan dari baris `pembayaran`, sehingga tetap benar setelah muat ulang.

### [x] T3.11 PenyediaOtp dan PenyediaPembayaran tiruan **[DEMO]**
- **Tujuan:**
  - Antarmuka **`PenyediaOtp`** (`kirimKode`, `verifikasi`) dan **`PenyediaPembayaran`** (`tahan`, `cairkan`, `kembalikan`, `status`).
  - **OTP tiruan** meniru aturan backend nanti: kode 6 digit hanya disimpan sebagai hash, kedaluwarsa 5 menit, paling banyak 5 percobaan, kirim ulang setelah 60 detik. Kode ditampilkan di panel "Kode uji" yang hanya muncul di mode pengembangan.
  - **Pembayaran tiruan** mensimulasikan menahan, mencairkan, dan mengembalikan dana dengan referensi `TIRUAN-…` dan label "Mode uji coba" (D-10).
- **Berkas:** `src/penyedia/otp/penyedia-otp.ts`, `src/penyedia/otp/otp-tiruan.ts`, `src/penyedia/pembayaran/penyedia-pembayaran.ts`, `src/penyedia/pembayaran/pembayaran-tiruan.ts`, tes keduanya, `src/lib/nomor-hp.ts` + `.test.ts` (normalisasi 0812… / +62812…).
- **PRD:** P0-01, P0-23, P0-26, P0-27; D-10.
- **Selesai bila:**
  - tes OTP: kedaluwarsa tepat di menit ke-5 (jam disuntikkan), percobaan ke-6 ditolak, kode tidak pernah ada di respons;
  - tes pembayaran: tahan lalu cairkan, kembalikan, cairkan melebihi saldo ditolak;
  - panel kode uji tidak ikut di `build` produksi.
- **Prasyarat:** T3.05.
- **Catatan (5 Okt 2026):** Kode uji dibaca lewat `kontrol.kodeUji(nomor)`. Kontrol pengembangan bernilai `null` di build produksi, sehingga panelnya (dibuat di T4.01) tidak bisa tampil. Ditambah batas 5 kali kirim per jam.

### [x] T3.12 Tes kontrak dan pagar impor **[DEMO]**
- **Tujuan:**
  - **Satu rangkaian tes kontrak** yang dijalankan terhadap implementasi `KlienApi` mana pun: bentuk respons, kode galat, paginasi, dan aturan akses utama. Di Tahap 3 dijalankan terhadap klien tiruan; di Tahap 6 rangkaian yang sama dijalankan terhadap klien HTTP.
  - **Aturan ESLint**: `src/halaman/` dan `src/komponen/` dilarang mengimpor `src/api/tiruan/**` dan `src/penyedia/**/…-tiruan`.
- **Berkas:** `src/api/kontrak.test-suite.ts`, `src/api/tiruan/kontrak.test.ts`, `eslint.config.js`.
- **PRD:** –; D-20.
- **Selesai bila:**
  - tes kontrak hijau untuk klien tiruan;
  - impor data tiruan dari halaman membuat `npm run lint` gagal (diuji dengan berkas contoh di tes aturan);
  - setiap endpoint di `kontrak-api.md` punya minimal satu kasus.
- **Prasyarat:** T3.09, T3.10.
- **Catatan (5 Okt 2026):** Pagar juga melarang `src/api/sumber` dan `fetch` langsung di halaman dan komponen. Tes aturan ada di `scripts/eslint-pagar.test.mjs`. Satu tes memastikan setiap metode `KlienApi` dipanggil oleh rangkaian kontrak. Lint, typecheck, 648 tes, dan build hijau.

---

# Tahap 4. Halaman per pilar

Setiap tugas halaman: dibuat di **390px dan 1440px**, dibandingkan dengan papan yang disebut, teks di `src/teks/`, hanya komponen Tahap 1, logika dari `src/lib`. **Data hanya lewat klien API** (hook di `src/api/kueri/`) yang di tahap ini memakai implementasi tiruan Tahap 3; halaman tidak pernah mengimpor data tiruan (D-20). Setiap halaman menangani keadaan memuat, kosong, dan gagal. "Turunan" = desain belum ada, dibuat dari pola yang ada (K6).

## 4A. Sesi dan penjaga rute

### [ ] T4.01 Sesi pengembangan dan penjaga rute **[DEMO]**
- **Tujuan:** Penyedia sesi (`useSesi`) dan penjaga rute berdasarkan peran, sehingga halaman bisa dikerjakan sebelum halaman Masuk selesai. Di mode pengembangan tersedia pemilih pengguna uji dari data tiruan (satu per peran dan keadaan, T3.10); di produksi pemilih ini tidak ikut.
- **Berkas:** `src/api/sesi.tsx` (sesi dari `klien.akun`), `src/komponen/penjaga-rute.tsx`, `src/halaman/pilih-akun-demo.tsx` (hanya mode pengembangan), tes `PenjagaRute`.
- **PRD:** P0-01.
- **Selesai bila:** rute petani menolak pembeli dan sebaliknya; rute tanpa sesi mengarah ke `/masuk`; produksi tidak memuat pemilih akun demo (dicek di `build`).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/43-pilih-akun-demo-mobile.png` (390px) dan `43-pilih-akun-demo-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T3.09, T1.15.

## 4B. Pilar Hitung

### [ ] T4.02 Langkah 1: Mau tanam apa? **[DEMO]**
- **Tujuan:** Pilih jenis lahan (Semua/Sawah/Kebun/Pekarangan), cari, daftar per kategori dengan umur panen, jumlah pesanan di sekitar, label "Ada pesanan"/"Segera hadir"; ringkasan pilihan + tombol "Lanjut pilih metode".
- **Berkas:** `src/halaman/hitung/pilih-tanaman.tsx`, `src/teks/hitung.ts`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-30, US-22, US-23; **D-05** (bayam dan kangkung hidroponik "Segera hadir").
- **Selesai bila:** papan 10 (desktop dengan menu profil terbuka) cocok; filter lahan hanya menampilkan yang cocok; komoditas tanpa resep tetap bisa diketuk; hasil pencarian kosong menampilkan "Tanaman ini belum ada di daftar" dengan "Minta tanaman baru".
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/10-hitung-pilih-tanaman-mobile.png` (390px) dan `10-hitung-pilih-tanaman-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T3.09, T4.01, T1.11, T1.15.

### [ ] T4.03 Segera hadir dan Minta resep **[DEMO]**
- **Tujuan:** Sheet (HP) / dialog (desktop) untuk komoditas tanpa resep; "Minta resep ini" menulis `permintaan_resep`; pesan "Permintaanmu tercatat. Kami kabari saat resepnya siap."; mencegah permintaan ganda.
- **Berkas:** `src/halaman/hitung/segera-hadir.tsx`, `src/api/kueri/permintaan-resep.ts`.
- **PRD:** P0-31, US-23.
- **Selesai bila:** papan 11 dan 12 (dua keadaan) cocok; permintaan tercatat per komoditas dan desa; ketuk ulang menampilkan keadaan "sudah diminta".
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/11-hitung-segera-hadir-mobile.png` (390px) dan `11-hitung-segera-hadir-desktop.png` (1440px) (juga `12-hitung-segera-hadir-sudah-diminta`), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.02, T1.12.

### [ ] T4.04 Langkah 2: Pilih cara tanam dan ukuran **[DEMO]**
- **Tujuan:** Kartu metode (modal awal, lahan, perawatan, "Cocok untuk pemula", "Resep tersedia"/"Segera hadir"); ukuran sesuai metode: luas dengan satuan m²/ru-bata/hektare, jumlah polybag, sistem hidroponik + lubang + tandon, vertikultur; teks bantuan konversi; perkiraan panen langsung; padi hanya Sawah; "Minta resep ini" untuk metode tanpa resep.
- **Berkas:** `src/halaman/hitung/pilih-metode.tsx`, `src/halaman/hitung/form-ukuran.tsx`.
- **PRD:** P0-32, P0-33, US-24, US-25; fungsi `konversi-satuan`, `ukuran-metode`, `kebutuhan` (validasi ukuran).
- **Selesai bila:** papan 13, 14 dan 15 cocok; "7 ru ≈ 100 m²" muncul dari `teksBantuanLuas`; ukuran kosong menampilkan "Isi luas lahan dulu" / "Isi jumlah lubang tanam dulu"; tombol lanjut nonaktif sampai valid; perkiraan panen berubah saat ukuran berubah. Hidroponik hanya aktif untuk sawi; bayam dan kangkung menampilkan hidroponik "Segera hadir" dengan "Minta resep ini" (D-05).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/13-hitung-cara-tanam-sawi-bedengan-mobile.png` (390px) dan `13-hitung-cara-tanam-sawi-bedengan-desktop.png` (1440px) (juga nomor 14 dan 15), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.03, T2.02, T2.03, T2.07.

### [ ] T4.05 Langkah 3: Kalkulator, daftar item dan grup **[DEMO]**
- **Tujuan:** Daftar item per grup dengan subtotal; ubah jumlah dan harga (`InputRupiah`), tambah item (tenaga kerja, sewa lahan), hapus item, harga negatif ditolak, "Harga belum diisi" + peringatan total belum lengkap.
- **Berkas:** `src/halaman/hitung/kalkulator.tsx`, `src/halaman/hitung/baris-item.tsx`, `src/halaman/hitung/use-rencana.ts` (keadaan rencana di memori, memakai `src/lib/modal`, `kebutuhan`).
- **PRD:** P0-07, P0-08, US-03, US-04.
- **Selesai bila:** papan 16 (sawi bedengan 100 m²) dan 19 (padi) cocok; ubah jumlah memperbarui subtotal dan total sama dengan hasil `modal.ts`; item tanpa harga ditandai dan ringkasan memberi peringatan; catatan "Semua harga di halaman ini adalah contoh…" tampil; label "CONTOH, belum divalidasi penyuluh" terlihat di setiap bagian yang memuat angka resep, termasuk lembar dan panel (D-12).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/16-hitung-modal-sawi-bedengan-mobile.png` (390px) dan `16-hitung-modal-sawi-bedengan-desktop.png` (1440px) (juga nomor 19), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.04, T2.05, T1.08.

### [ ] T4.06 Subsidi, pilih merek, merek lain, promo **[DEMO]**
- **Tujuan:** Pilihan Subsidi/Nonsubsidi per item yang memenuhi syarat dengan catatan "Subsidi hanya untuk petani yang terdaftar di kelompok tani."; lembar "Pilih merek" (harga per kemasan, per satuan, jumlah pelapor, hari lalu), "Merek lain, isi sendiri" yang membuat laporan harga baru; tips pembelian di kios resmi; bagian "Promo dari toko tani" terpisah dengan label "Promo".
- **Berkas:** `src/halaman/hitung/lembar-merek.tsx`, `src/halaman/hitung/bagian-promo.tsx`, `src/halaman/hitung/pilihan-subsidi.tsx`, `src/api/kueri/laporan-harga.ts`.
- **PRD:** P0-09, P0-34, P0-35, US-05, US-26.
- **Selesai bila:** papan 17 cocok; urutan merek berasal dari `harga-item.ts` (laporan terbaru), tidak pernah berubah karena promo; merek lain menulis ke `laporan_harga`; tidak ada merek yang diberi label "rekomendasi".
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/17-hitung-modal-pilih-merek-npk-mobile.png` (390px) dan `17-hitung-modal-pilih-merek-npk-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.05, T2.04, T1.12.

### [ ] T4.07 Alat sekali beli dan ringkasan hasil **[DEMO]**
- **Tujuan:** Bagian "Alat sekali beli" dengan saklar "Bagi biaya alat ke 10 siklus" dan teks pembagian; ringkasan: total modal (atau "Modal siklus ini"), modal per m², perkiraan untung, titik impas, "kalau panen jelek" dengan alasan, pesan rugi merah "Dengan angka ini, kamu berpotensi rugi."; harga jual otomatis memakai harga kesepakatan bila terhubung pesanan; kartu "Jadwal yang akan dibuat" dengan penggaris.
- **Berkas:** `src/halaman/hitung/bagian-alat.tsx`, `src/halaman/hitung/ringkasan-hasil.tsx`.
- **PRD:** P0-10, P0-36, US-06, US-27.
- **Selesai bila:** papan 18 (hidroponik NFT 200 lubang) cocok: modal per siklus dan total alat tampil terpisah; angka sama dengan `ringkasan.ts`; untung negatif tampil merah dengan ikon dan kata; tombol utama tunggal "Simpan rencana".
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/18-hitung-modal-sawi-hidroponik-mobile.png` (390px) dan `18-hitung-modal-sawi-hidroponik-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.05, T2.06, T1.14.

### [ ] T4.08 Simpan rencana dan pilih tanggal tanam (turunan) **[DEMO]**
- **Tujuan:** "Simpan rencana" membuat `siklus_tanam` + `rencana_item`; langkah pilih tanggal tanam (turunan; boleh tanggal lampau untuk siklus pilot); pembuatan `tugas` dari resep memakai `jadwal-buat`; rencana masih bisa diubah sebelum tanggal tanam; kembali ke Beranda.
- **Berkas:** `src/halaman/hitung/pilih-tanggal-tanam.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04) (mutasi), `src/lib/rencana-ke-baris.ts` + tes (pemetaan rencana → baris `rencana_item`).
- **PRD:** P0-11, P0-12, P0-04 (siklus menyimpan versi resep), US-07.
- **Selesai bila:** setelah simpan, `siklus_tanam.resep_id` = versi resep terpakai; jumlah `tugas` sama dengan `buatJadwal`; mengubah resep di database tidak mengubah siklus lama (diuji); waktu dari rencana sampai simpan terukur (tujuan < 5 menit, P0 tujuan pengguna 1) di catatan demo.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/41-pilih-tanggal-tanam-mobile.png` (390px) dan `41-pilih-tanggal-tanam-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.07, T2.08, T3.09.

## 4C. Pilar Jadwal dan pengingat

### [ ] T4.09 Beranda petani **[DEMO]**
- **Tujuan:** Salam + kota, kartu siklus dengan penggaris, banner "Besok: …", daftar tugas hari ini (`BarisTugas`) termasuk terlambat dan "Isi angka" untuk tugas ukur, kartu "Tawaran pesanan"; keadaan kosong "Mulai siklus tanam pertamamu"; offline dan pengingat diblokir.
- **Berkas:** `src/halaman/beranda.tsx`, `src/halaman/beranda/*.tsx`, `src/teks/beranda.ts`.
- **PRD:** P0-06, P0-13 (banner bila izin ditolak), P0-16, P0-29, US-02, US-11.
- **Selesai bila:** papan 03, 04 (hidroponik), 05, 06, dan 07 cocok; centang tugas menandai selesai (T4.11); tugas terlambat memakai chip "Terlambat n hari"; tautan ke modul tahap yang sedang berjalan.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/03-beranda-petani-mobile.png` (390px) dan `03-beranda-petani-desktop.png` (1440px) (juga nomor 04 sampai 07), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.08, T1.10, T1.14, T2.09.

### [ ] T4.10 Jadwal siklus **[DEMO]**
- **Tujuan:** Halaman jadwal: header siklus + tab Jadwal/Modal/Jurnal, filter tipe (Semua/Sekali/Berulang/Pengukuran), daftar dikelompokkan per hari (Terlambat, Hari ini, Besok, tanggal, Sudah selesai), tugas berulang sebagai satu baris dengan frekuensi, keadaan kosong per filter; panel samping desktop ("Tiga jenis tugas", "Pengingat").
- **Berkas:** `src/halaman/kebun/jadwal.tsx`, `src/halaman/kebun/kerangka-siklus.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-12, US-07.
- **Selesai bila:** papan 20 dan 21 cocok; ikon tipe berbeda di semua daftar; filter "Pengukuran" di siklus bedengan menampilkan pesan papan 20 mobile; pengelompokan = `kelompokkanPerHari`; label "CONTOH, belum divalidasi penyuluh" terlihat di jadwal dan detail tugas bila resepnya contoh (D-12).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/20-jadwal-sawi-bedengan-mobile.png` (390px) dan `20-jadwal-sawi-bedengan-desktop.png` (1440px) (juga nomor 21), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.08, T2.09, T1.10.

### [ ] T4.11 Detail tugas, tandai selesai, foto, tunda **[DEMO]**
- **Tujuan:** Detail tugas (chip waktu, banner saran terlambat dari resep, cara mengerjakan, foto bukti, tunda 1–3 hari dengan tanggal baru), "Tandai selesai"; foto opsional diunggah lewat klien API dan masuk jurnal; konfirmasi bila tunda melewati panen (turunan); tugas berulang dan sekali (turunan tampilan non-terlambat).
- **Berkas:** `src/halaman/kebun/detail-tugas.tsx`, `src/komponen/ambil-foto.tsx` (kamera/galeri, kecilkan sisi klien), `src/lib/kecilkan-foto.ts` + tes (hitung ukuran target), `src/api/kueri/tugas-mutasi.ts`.
- **PRD:** P0-14, P0-15, P0-16, US-08.
- **Selesai bila:** papan 22 cocok; tunda menggeser tugas sejenis lewat `tundaTugas`; foto masuk jurnal dengan tanggal dan nama tugas; tugas terlambat tetap bisa ditandai selesai.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/22-detail-tugas-mobile.png` (390px) dan `22-detail-tugas-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.10, T3.09, T1.12.

### [ ] T4.12 Tugas pengukuran pH dan PPM **[DEMO]**
- **Tujuan:** Isian angka, batang rentang normal dengan posisi, status dengan ikon dan kata, saran dari resep, grafik mini 7 pengukuran dengan pita normal, simpan ke `hasil_pengukuran`, tugas "Ukur ulang" hari berikutnya bila di luar rentang, keterangan "Rentang dari Resep Tanam yang dicek penyuluh."
- **Berkas:** `src/halaman/kebun/ukur-ph-ppm.tsx`, `src/komponen/batang-rentang.tsx`, `src/komponen/grafik-mini.tsx`, tes kedua komponen.
- **PRD:** P0-37, US-28.
- **Selesai bila:** papan 23, 24 dan 25 (normal, pH terlalu tinggi, PPM terlalu rendah) cocok; keadaan dihitung `pengukuran.ts`; hasil di luar rentang membuat tugas `Ukur ulang` pada tanggal + 1; riwayat tujuh pengukuran terakhir; label "CONTOH, belum divalidasi penyuluh" terlihat di samping rentang pH/PPM (D-12).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/23-cek-ph-ppm-normal-mobile.png` (390px) dan `23-cek-ph-ppm-normal-desktop.png` (1440px) (juga nomor 24 dan 25), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.11, T2.10.

### [ ] T4.13 Ubah tanggal tanam (turunan)
- **Tujuan:** Dari jadwal/Detail siklus: ubah tanggal tanam dengan penjelasan "Tugas yang sudah selesai tidak berubah"; tampilan perubahan sebelum konfirmasi.
- **Berkas:** `src/halaman/kebun/ubah-tanggal-tanam.tsx`.
- **PRD:** P0-17.
- **Selesai bila:** tugas belum selesai dihitung ulang, tugas selesai tidak berubah (cocok dengan `ubahTanggalTanam`); tampil di 390 dan 1440.
- **Prasyarat:** T4.10, T2.09.

### [ ] T4.14 Pengingat per siklus
- **Tujuan:** Pilih siklus, jam pengingat pagi (05.00–07.00), saklar pengingat sore, saklar per tipe tugas, contoh tampilan notifikasi, "Lewati siram saat hujan — Segera hadir", simpan ke `pengaturan_pengingat`.
- **Berkas:** `src/halaman/kebun/pengingat.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-38, US-29, P1-05 (sore).
- **Selesai bila:** papan 26 cocok; mematikan tipe tidak menghapus tugas dari jadwal dan beranda; contoh notifikasi sama dengan hasil `pengingat.ts`.
- **Prasyarat:** T4.10, T2.11.

### [ ] T4.15 Detail siklus: Modal dan catat pengeluaran
- **Tujuan:** Rencana dan realisasi (sudah keluar % dari rencana, perkiraan modal akhir, perkiraan untung), per item (hemat/lebih/belum dibeli); form "Catat pengeluaran" (item rencana, nominal, tanggal, foto nota; turunan).
- **Berkas:** `src/halaman/kebun/modal.tsx`, `src/halaman/kebun/catat-pengeluaran.tsx`, `src/lib/realisasi.ts` + `.test.ts` (selisih per item, persen, modal akhir).
- **PRD:** P0-18, US-09.
- **Selesai bila:** papan 27 cocok (desktop diturunkan); selisih dihitung `realisasi.ts` (teruji: sesuai rencana, hemat, lebih, belum dibeli, tanpa rencana); catat pengeluaran memperbarui angka tanpa muat ulang.
- **Prasyarat:** T4.10, T2.06.

### [ ] T4.16 Detail siklus: Jurnal
- **Tujuan:** Foto dan catatan dikelompokkan per minggu ("Minggu ke-2 · Hari ke-7 sampai 13"), foto otomatis dari tugas selesai, tambah foto bukti, catatan hari.
- **Berkas:** `src/halaman/kebun/jurnal.tsx`, `src/lib/jurnal.ts` + `.test.ts` (pengelompokan minggu).
- **PRD:** P0-14, P0-24, US-16.
- **Selesai bila:** papan 28 cocok (desktop diturunkan); pengelompokan minggu teruji (hari ke-0 di minggu 1, hari ke-7 di minggu 2); foto ditampilkan dari URL yang diberikan klien API (di backend berupa URL bertanda tangan, T5.12).
- **Prasyarat:** T4.11.

### [ ] T4.17 Akhir siklus: untung sebenarnya (turunan)
- **Tujuan:** Setelah panen, input pendapatan nyata, ringkasan untung sebenarnya = pendapatan nyata − pengeluaran nyata, dibandingkan dengan rencana.
- **Berkas:** `src/halaman/kebun/akhir-siklus.tsx`, tambahan `src/lib/realisasi.ts`.
- **PRD:** P0-18, tujuan pengguna 3.
- **Selesai bila:** untung sebenarnya dihitung dari data nyata dan selisih terhadap rencana ditampilkan (teruji); status siklus menjadi selesai.
- **Prasyarat:** T4.15.

## 4D. Pilar Jual (petani)

### [ ] T4.18 Pesanan di sekitar **[DEMO]**
- **Tujuan:** Daftar pesanan dalam radius (konfigurasi, default 10 km) terurut terdekat, filter Semua/Rutin/Sekali panen dengan penanda jenis, keterangan jumlah, "Boleh ambil sebagian", hanya pesanan berresep, keadaan kosong + "Cari sampai 25 km"; tab Di sekitar / Kiriman saya.
- **Berkas:** `src/halaman/pesanan/sekitar.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-19 (penanda dan filter), P0-20, US-11.
- **Selesai bila:** papan 29 dan 30 cocok; daftar dari endpoint pesanan di sekitar (jarak dari titik tengah desa); urutan sama dengan `jarak.ts`; radius dan batas bukan angka tetap; petani `dinonaktifkan_sementara` tetap melihat daftar (D-13).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/29-pesanan-di-sekitar-mobile.png` (390px) dan `29-pesanan-di-sekitar-desktop.png` (1440px) (juga nomor 30), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T3.10, T2.15, T1.15.

### [ ] T4.19 Detail pesanan dan ambil sebagian **[DEMO]**
- **Tujuan:** Rincian pesanan, "Mau ambil berapa?" (pilihan jumlah), cek lahan (cukup/tidak, jumlah maksimal disarankan), saran tanam bertahap, "Uang yang kamu terima"; tombol "Ambil" nonaktif bila lahan tidak cukup; status uang muka "Uang muka diterima" sebelum diminta menanam. **Kapasitas lahan dari tabel `lahan` lewat `kapasitas-lahan.ts` (D-06, D-08).** Petani memilih lahan; bila belum punya lahan diarahkan ke "Lahan saya" (T4.36a).
- **Berkas:** `src/halaman/pesanan/detail-pesanan.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-21, P0-23 (status uang muka), US-12, US-13.
- **Selesai bila:** papan 31 cocok (desktop diturunkan); semua angka dari `pesanan-lahan.ts` dan `pesanan-nilai.ts`; total alokasi tidak melebihi pesanan (galat `409 MELEBIHI_PESANAN` diterjemahkan ke pesan yang jelas); mengambil memanggil endpoint ambil pesanan dan membuat siklus dengan harga kesepakatan; untuk petani `dinonaktifkan_sementara` tombol "Ambil pesanan" diganti penjelasan singkat dan cara menghubungi admin dari konfigurasi (D-13).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/31-detail-pesanan-mobile.png` (390px) dan `31-detail-pesanan-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.18, T2.12, T2.13, T2.15a, T3.10, T4.36a.

### [ ] T4.20 Kesepakatan digital **[DEMO]**
- **Tujuan:** Ringkasan (pembeli, jumlah, jadwal, titik antar, harga), standar kualitas, aturan gagal panen, uang dan pembayaran, pernyataan, tombol "Setuju" / "Tanya pembeli dulu"; menyimpan waktu setuju di `alokasi_pesanan`.
- **Berkas:** `src/halaman/pesanan/kesepakatan.tsx`.
- **PRD:** P0-22.
- **Selesai bila:** papan 32 cocok (desktop diturunkan); aturan gagal panen memakai D-03: "Kabari paling lambat 3 hari sebelum jadwal kirim. Bagian yang tidak terpenuhi ditawarkan ke petani lain; kalau tidak ada pengganti, sisa uang muka bagian itu dikembalikan ke pembeli."; **tanpa denda**; angka hari dari konfigurasi; setelah setuju jadwal masuk ke kebun.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/32-kesepakatan-mobile.png` (390px) dan `32-kesepakatan-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.19.

### [ ] T4.21 Kiriman saya dan foto kualitas **[DEMO]**
- **Tujuan:** Kiriman hari ini dengan tahap uang (Uang muka ditahan → Menunggu konfirmasi → Dana cair), unggah foto kualitas sebelum kirim, daftar berikutnya dan sebelumnya (termasuk sebagian ditolak).
- **Berkas:** `src/halaman/pesanan/kiriman-saya.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-25, US-14.
- **Selesai bila:** papan 33 cocok (desktop diturunkan); tidak bisa menandai "dikirim" tanpa foto kualitas; chip uang memakai `ChipStatus`.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/33-kiriman-saya-mobile.png` (390px) dan `33-kiriman-saya-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.19, T4.11 (komponen foto).

## 4E. Pilar Jual (pembeli)

### [ ] T4.22 Dasbor pesanan aktif pembeli **[DEMO]**
- **Tujuan:** Header pembeli, banner kiriman tiba, daftar pesanan dengan kebun pemenuh (penggaris `lebar`), kiriman berikutnya, ringkasan uang (ditahan, sudah cair), "5 kg … belum ada petani" dengan "Ubah tawaran".
- **Berkas:** `src/halaman/pembeli/dasbor.tsx`, `src/api/kueri/pesanan-pembeli.ts`.
- **PRD:** P0-24, US-16, US-18 (tombol pesan lagi tersedia setelah kiriman, ditambahkan di T4.26).
- **Selesai bila:** papan 36 cocok; pembeli hanya melihat **nama desa dan jarak** kebun, tidak pernah titik lahan (D-06); HP 390px diturunkan (D-07); pembeli tidak bisa melihat pesanan pembeli lain (ditolak klien API); penggaris menampilkan progres tiap kebun.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/36-dasbor-pesanan-pembeli-mobile.png` (390px) dan `36-dasbor-pesanan-pembeli-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.01, T1.14, T1.15, T3.10.

### [ ] T4.23 Buat pesanan rutin **[DEMO]**
- **Tujuan:** Form komoditas (hanya yang punya resep), jumlah, hari kirim, frekuensi, durasi (maks 3 bulan), harga per kg dengan petunjuk harga sekitar, standar kualitas + tambah syarat, titik antar (alamat + patokan + titik peta), ringkasan biaya (nilai pesanan, uang muka, biaya layanan, dibayar sekarang, per kiriman).
- **Berkas:** `src/halaman/pembeli/buat-pesanan.tsx`, `src/api/kueri/pesanan-mutasi.ts`.
- **PRD:** P0-19, P0-02 (hanya pembeli terverifikasi), US-15.
- **Selesai bila:** papan 37 cocok; komoditas tanpa resep tidak bisa dipilih (beda dengan papan yang menampilkan Selada/Pakcoy; PRD berlaku, lihat `ringkasan-desain.md` 3.3 #6); biaya dari `pesanan-nilai.ts`; pembeli belum terverifikasi: tombol nonaktif + penjelasan (T4.28).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/37-buat-pesanan-pembeli-mobile.png` (390px) dan `37-buat-pesanan-pembeli-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.22, T2.12.

### [ ] T4.24 Pesanan sekali panen (turunan)
- **Tujuan:** Variasi form untuk jenis sekali panen: komoditas, jumlah total, perkiraan bulan panen, harga per kg, standar kualitas, titik ambil; satu kiriman.
- **Berkas:** `src/halaman/pembeli/buat-pesanan-sekali.tsx` (atau mode di T4.23).
- **PRD:** P0-19, US-30.
- **Selesai bila:** nilai pesanan dan uang muka sama dengan `pesanan-nilai.ts` untuk satu kiriman; muncul di Pesanan di sekitar dengan penanda "sekali panen".
- **Prasyarat:** T4.23.

### [ ] T4.25 Konfirmasi kiriman pembeli **[DEMO]**
- **Tujuan:** Foto dari petani, hasil pemeriksaan (terima semua / tolak sebagian dengan berat, alasan, catatan, foto bukti), rincian pembayaran kiriman, batas waktu periksa, tombol "Konfirmasi terima n kg".
- **Berkas:** `src/halaman/pembeli/konfirmasi-kiriman.tsx`.
- **PRD:** P0-25, P0-26, US-17.
- **Selesai bila:** papan 38 cocok; HP diturunkan; angka dari `kiriman.ts`; alasan penolakan memakai empat pilihan D-06 + foto penolakan; "Lainnya" wajib diisi keterangan, tanpa keterangan muncul galat "Tulis alasannya dulu" (D-14); batas periksa sesuai jenis pesanan (D-01); penolakan sebagian membuat baris `sengketa`; setelah konfirmasi status berubah dan pembayaran tercatat (T4.41).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/38-konfirmasi-kiriman-pembeli-mobile.png` (390px) dan `38-konfirmasi-kiriman-pembeli-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.22, T2.14.

### [ ] T4.26 Rating dua arah (turunan)
- **Tujuan:** Setelah kiriman, petani dan pembeli saling memberi nilai 1–5 dan komentar; rata-rata tampil di profil.
- **Berkas:** `src/halaman/pesanan/beri-rating.tsx`, `src/lib/rating.ts` + `.test.ts` (rata-rata, jumlah ulasan).
- **PRD:** P0-28, US-18.
- **Selesai bila:** hanya pihak terkait kiriman yang bisa menilai, sekali per kiriman; rata-rata dan jumlah ulasan ("4,8 dari 9 ulasan pembeli") benar; pembeli bisa "Pesan lagi".
- **Prasyarat:** T4.25 (rata-rata tampil di profil lewat T4.35).

### [ ] T4.27 Gagal panen dan pembatalan (turunan)
- **Tujuan:** Petani menyatakan tidak sanggup **paling lambat 3 hari sebelum jadwal kirim** (D-03); bagian itu ditawarkan ke petani lain; tanpa pengganti, sisa uang muka bagian itu dikembalikan ke pembeli (lewat `PenyediaPembayaran`); petani yang tidak memberi kabar mendapat catatan di profil. Pembatalan pembeli setelah petani menanam: uang muka menjadi kompensasi.
- **Berkas:** `src/halaman/pesanan/lapor-gagal.tsx`, tambahan `src/lib/kiriman.ts`; aturan server di T3.10 (tiruan) dan T5.16/T5.17 (backend).
- **PRD:** P0-27.
- **Selesai bila:** aturan dari `kiriman.ts` (T2.14), **tanpa denda**; lewat batas 3 hari, kabar tetap bisa dikirim tetapi menghasilkan catatan profil; status pembayaran `dikembalikan` pada kasus tanpa pengganti.
- **Prasyarat:** T4.21, T2.14.

### [ ] T4.28 Daftar pembeli dan verifikasi (turunan)
- **Tujuan:** Setelah memilih peran pembeli: nama usaha, jenis usaha, alamat, foto tempat usaha, status verifikasi tampil jelas; pembeli belum terverifikasi bisa melihat aplikasi tetapi tidak bisa memasang pesanan.
- **Berkas:** `src/halaman/pembeli/daftar-pembeli.tsx`, `src/halaman/pembeli/status-verifikasi.tsx`.
- **PRD:** P0-02, US-21.
- **Selesai bila:** status "Menunggu verifikasi / Terverifikasi / Ditolak" dengan ikon dan kata; klien API menolak pesanan dari yang belum terverifikasi (`403 BELUM_TERVERIFIKASI`).
- **Prasyarat:** T4.22, T3.09.

### [ ] T4.29 Panel admin minimal: verifikasi dan sengketa (turunan)
- **Tujuan:** Admin menyetujui/menolak pembeli, melihat antrean sengketa (foto, alasan, keputusan), melihat **catatan petani**, dan **menonaktifkan sementara / mengaktifkan kembali** petani (D-03). **Desktop saja, tabel sederhana (D-07).**
- **Berkas:** `src/halaman/admin/verifikasi-pembeli.tsx`, `src/halaman/admin/sengketa.tsx`.
- **PRD:** P0-02, P0-25, US-21.
- **Selesai bila:** hanya peran admin yang bisa membuka (penjaga rute dan klien API); keputusan sengketa menentukan pencairan sisa bagian.
- **Prasyarat:** T4.25, T4.28.

## 4F. Pilar Belajar

### [ ] T4.30 Daftar modul belajar **[DEMO]**
- **Tujuan:** Pilih tanaman dan cara tanam, kemajuan "n dari 6 modul selesai", "Lanjutkan: …", baris modul (selesai, sedang, tersimpan offline, belum), tombol unduh.
- **Berkas:** `src/halaman/belajar.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-05, US-01, US-02.
- **Selesai bila:** papan 08 dan 09 cocok; progres dari `belajar.ts`; modul yang sudah ditonton diberi tanda; tautan dari tugas hari ini membuka modul tahap berjalan (P0-06). Hidroponik hanya muncul untuk sawi (D-05).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/08-belajar-hidroponik-mobile.png` (390px) dan `08-belajar-hidroponik-desktop.png` (1440px) (juga nomor 09), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T3.09, T2.16, T1.15.

### [ ] T4.31 Pemutar modul (turunan) **[DEMO]**
- **Tujuan:** Halaman modul: video (≤ 3 menit), ringkasan teks, tandai selesai, "Modul berikutnya", pilih kualitas rendah.
- **Berkas:** `src/halaman/belajar/modul.tsx`, `src/komponen/pemutar-video.tsx`.
- **PRD:** P0-05.
- **Selesai bila:** video bisa diputar di 390 dan 1440, kontrol ≥ 48px, tombol teks Indonesia; menonton sampai selesai menandai `progres_modul`.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/42-pemutar-modul-mobile.png` (390px) dan `42-pemutar-modul-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.30.

## 4G. Landing, Masuk, Profil

### [ ] T4.32 Landing page **[DEMO]**
- **Tujuan:** Hero + contoh siklus (penggaris), tiga pilar, "Cara kerja Pesan Sebelum Tanam" lima langkah, bagian pembeli, FAQ, penutup.
- **Berkas:** `src/halaman/landing.tsx`, `src/halaman/landing/*.tsx`, `src/teks/landing.ts`.
- **PRD:** –(desain 01–02); mengacu P0-22–P0-26.
- **Selesai bila:** papan 01 (mobile setinggi 5.240px dan desktop) cocok; tombol "Mulai sebagai petani" dan "Saya pembeli" menuju `/masuk` dengan peran terisi; tidak ada klaim yang tidak didukung (mis. "Dana cair paling lama 6 jam" dibuat dari konfigurasi: 6 jam rutin, 24 jam sekali panen, D-01; angka modal dan titik impas di landing dihitung dari fungsi `src/lib` dengan resep contoh, D-08).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/01-halaman-depan-mobile.png` (390px) dan `01-halaman-depan-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T1.14, T1.16.

### [ ] T4.33 Masuk dengan nomor HP dan OTP **[DEMO]**
- **Tujuan:** Nomor HP → kirim OTP → 6 digit → sesi; hitung mundur kirim ulang; galat jelas untuk kode salah, kedaluwarsa (5 menit), dan terkunci (5 percobaan); **tanpa kata sandi (D-04)**; centang persetujuan kebijakan privasi berteks draf untuk pengguna baru (D-30); semua lewat klien API (`useKirimOtp`, `useVerifikasiOtp`), yang di mode tiruan memakai `PenyediaOtp` tiruan T3.11 (D-10); menggantikan pemilih akun demo (T4.01) di luar mode pengembangan.
- **Berkas:** `src/halaman/masuk.tsx`, `src/teks/masuk.ts` (memakai `src/lib/nomor-hp.ts` dan hook dari `src/api/kueri`).
- **PRD:** P0-01.
- **Selesai bila:** papan 02 cocok; halaman hanya memakai klien API, tidak pernah `PenyediaOtp` langsung (dijaga lint T3.12); nomor tidak valid ditolak dengan pesan; pengguna baru tanpa centang privasi tidak bisa lanjut; sesi bertahan setelah muat ulang; mengganti penyedia SMS tidak mengubah halaman.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/02-masuk-mobile.png` (390px) dan `02-masuk-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.01, T1.16, T3.11.

### [ ] T4.34 Pilih peran dan desa (turunan) **[DEMO]**
- **Tujuan:** Setelah OTP pertama: pilih peran (petani/pembeli/mentor), petani wajib mengisi desa lokasi lahan (dengan pencarian desa dan koordinat setingkat desa); pembeli lanjut ke T4.28.
- **Berkas:** `src/halaman/pilih-peran.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04) (data wilayah tiruan T3.06).
- **PRD:** P0-01.
- **Selesai bila:** petani tanpa desa tidak bisa lanjut ("Isi desa lahanmu dulu"); peran admin tidak bisa dipilih sendiri; desa tersimpan dan dipakai untuk radius pesanan.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/39-pilih-peran-dan-desa-mobile.png` (390px) dan `39-pilih-peran-dan-desa-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.33, T3.09.

### [ ] T4.35 Profil petani
- **Tujuan:** Profil dengan statistik (rating, siklus selesai, kg terjual), kartu Akun (nama, nomor HP), Kebun (desa, ringkasan dari tabel `lahan`, komoditas), Pengingat, Bantuan, tombol Keluar. **Tanpa kata sandi, nama pengguna, dan kartu kelompok tani (D-04, D-06).**
- **Berkas:** `src/halaman/profil.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-01, P0-09, P0-28 (rating di profil).
- **Selesai bila:** papan 34 cocok tanpa bagian yang dihapus; statistik dari data nyata; catatan petani (D-03) tampil ke petani sendiri.
- **Prasyarat:** T4.34, T4.26.

### [ ] T4.36 Ubah profil
- **Tujuan:** Foto profil (dikecilkan otomatis), nama, desa, ganti nomor HP dengan OTP ke nomor baru. **Tanpa kata sandi dan nama pengguna (D-04).**
- **Berkas:** `src/halaman/ubah-profil.tsx`.
- **PRD:** P0-01; selebihnya turunan desain 49–50.
- **Selesai bila:** papan 35 cocok tanpa kartu Kata sandi dan isian Nama pengguna; perubahan desa memperbarui jarak pesanan.
- **Prasyarat:** T4.35, T4.11 (AmbilFoto).

### [ ] T4.36a Lahan saya (turunan) **[DEMO]**
- **Tujuan:** Petani mengelola lahan: nama, jenis lahan, luas dengan satuan lokal (nilai asli disimpan), desa, titik koordinat, kapasitas lubang hidroponik; tampil luas yang sedang dipakai dan kapasitas tersisa.
- **Berkas:** `src/halaman/lahan-saya.tsx`, `src/halaman/lahan/form-lahan.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-21, P0-33; **D-06**.
- **Selesai bila:** luas disimpan sebagai `luas_m2` + `satuan_asli` + `nilai_asli` lewat `konversi-satuan.ts`; kapasitas tersisa dari `kapasitas-lahan.ts`; titik lahan tidak pernah tampil ke pembeli; 390px (navigasi bawah) dan 1440px (sidebar kiri, dua kolom: daftar dan form).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/40-lahan-saya-mobile.png` (390px) dan `40-lahan-saya-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.34, T3.09, T2.15a, T2.02.

### [ ] T4.37 Halaman statis: aturan pakai, privasi, tentang, kontak, bantuan (turunan)
- **Tujuan:** Halaman teks yang ditautkan dari desain; isi singkat sebagai draf yang menunggu peninjauan hukum.
- **Berkas:** `src/halaman/statis/*.tsx`, `src/teks/statis.ts`.
- **PRD:** Pertanyaan Terbuka 13 (persetujuan data).
- **Selesai bila:** semua tautan dari landing, Masuk, Profil, dan footer terbuka; diberi catatan "Draf, belum ditinjau ahli hukum".
- **Prasyarat:** T4.32.

## 4H. Peran mentor (di luar demo)

### [ ] T4.38 Mentor: daftar resep dan permintaan resep
- **Tujuan:** Daftar resep per komoditas dan metode dengan status validasi, daftar permintaan resep terbanyak per komoditas dan wilayah.
- **Berkas:** `src/halaman/mentor/daftar-resep.tsx`, `src/halaman/mentor/permintaan-resep.tsx`.
- **PRD:** P0-04, US-19, US-31.
- **Selesai bila:** hanya peran mentor/admin; permintaan diurutkan menurut jumlah. **Desktop saja, tabel sederhana (D-07).**
- **Prasyarat:** T4.34, T3.10.

### [ ] T4.39 Mentor: editor resep dan versi
- **Tujuan:** Membuat/mengubah resep (input, dosis, dasar dosis, kemasan, tugas, rentang ukur, saran), versi baru saat ubah, tandai divalidasi (validator + tanggal).
- **Berkas:** `src/halaman/mentor/editor-resep.tsx`, `src/lib/validasi-resep.ts` + `.test.ts` (HST valid, interval > 0, batas bawah ≤ batas atas).
- **PRD:** P0-03, P0-04, US-19.
- **Selesai bila:** siklus berjalan tetap memakai versi lama (diuji); resep belum divalidasi tidak terlihat petani; validasi menolak data tidak masuk akal. **Desktop saja, tabel sederhana (D-07).**
- **Prasyarat:** T4.38, T3.10.

### [ ] T4.41 Bayar uang muka, pembayaran, dan riwayat pembeli (turunan) **[DEMO]**
- **Tujuan:** Dari "Lanjut bayar Rp…" ke lembar bayar mode uji coba, halaman hasil (berhasil/gagal/menunggu), status "Uang muka sudah masuk" di sisi petani sebelum mulai menanam, konfirmasi kiriman memicu pencairan; halaman Pembayaran dan Riwayat pembeli. Semua lewat klien API dan `PenyediaPembayaran` tiruan (T3.11) dengan label "Mode uji coba"; teks memakai bahasa petani (D-09).
- **Berkas:** `src/halaman/pembeli/bayar.tsx`, `src/halaman/pembeli/pembayaran.tsx`, `src/halaman/pembeli/riwayat.tsx`, hook dari `src/api/kueri` (sudah ada sejak T3.04).
- **PRD:** P0-23, P0-26, US-13, US-14; D-02, D-10.
- **Selesai bila:** alur penuh dengan data tiruan: pesan → bayar → petani melihat "Uang muka sudah masuk" → kirim → konfirmasi → status "Dana cair"; gagal bayar tidak membuat pesanan aktif; nominal dari klien API (dihitung `pesanan-nilai.ts`), bukan dari halaman; klik ganda tidak membayar dua kali.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/44-bayar-uang-muka-mobile.png` (390px) dan `44-bayar-uang-muka-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.23, T4.25, T3.11.

## 4I. Pemeriksaan akhir tahap

### [ ] T4.40 Uji responsif dan perbandingan desain menyeluruh **[DEMO]**
- **Tujuan:** Satu putaran memeriksa semua halaman di 390, 768, 1280, 1440 terhadap papan; perbaiki selisih.
- **Berkas:** `docs/cek-halaman.md` (tabel: papan NN, status, catatan), perbaikan di berkas terkait.
- **PRD:** –
- **Selesai bila:** setiap file papan di `design/README.md` (64 file, 39 halaman) punya baris dengan status "sama" atau alasan perbedaan; tidak ada gulir horizontal; tidak ada teks di bawah 16px; lint aturan hijau.
- **Tangkapan (D-07):** semua file di `docs/tangkapan/aplikasi/` diambil ulang (390px dan 1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.02–T4.37 dan T4.41 (yang bertanda DEMO minimal).

---

# Tahap 5. Backend Laravel

Tujuan tahap: API Laravel yang memenuhi `docs/kontrak-api.md`, dengan basis data MariaDB (XAMPP), login OTP dengan Sanctum, Policy per peran, perhitungan uang di server yang terbukti sama dengan `src/lib`, scheduler, web push, dan pembayaran tiruan. Semuanya berjalan lokal tanpa Docker (D-19). Rancangan rinci ada di `docs/arsitektur-backend.md`.

Aturan tahap:

- Mulai T5.01, semua jalur `src/…` di dokumen ini berada di `frontend/src/…`.
- Setiap tugas backend selesai bila tes Pest-nya hijau dan respons sesuai kontrak.
- Rahasia hanya di `backend/.env`.
- Semua konfigurasi lewat `.env` dan tidak ada path khusus Windows di kode, supaya bisa di-deploy ke VPS kapan saja (D-24, `arsitektur-backend.md` bagian 17).

### [ ] T5.00 Prasyarat: PHP 8.3+ terpisah dan MariaDB XAMPP **[DEMO]**
- **Tujuan:** Pasang PHP 8.3 atau lebih baru terpisah dari XAMPP, pastikan Composer memakainya, lalu siapkan basis data `tani_muda` dan `tani_muda_uji` di MariaDB XAMPP (D-25).
- **Berkas:** tidak ada berkas proyek; hasil pemeriksaan ditulis sebagai catatan tugas ini.
- **PRD:** –; D-19, D-25.
- **Selesai bila:** semua pemeriksaan di `arsitektur-backend.md` bagian 2a lolos (`where php`, `php -v`, `php -m`, `composer -V`, `composer diagnose`, koneksi PDO ke MariaDB, versi MariaDB), dan keluarannya disalin ke catatan.
- **Prasyarat:** T4.40.

### [ ] T5.01 Struktur repositori: frontend, backend, shared **[DEMO]**
- **Tujuan:**
  - Pindahkan proyek React ke `frontend/`, lalu buat `backend/` dan `shared/` (`shared/kasus-uji/`, `shared/data-contoh/`).
  - Pindahkan data contoh JSON Tahap 3 ke `shared/data-contoh/`; klien tiruan membacanya dari sana.
  - Perbarui README, skrip, jalur di dokumen, `.gitignore` (`backend/.env`, `backend/vendor/`, `backend/storage/*`), dan pemeriksa lint.
- **Berkas:** `frontend/**` (dipindah dengan `git mv`), `shared/`, `README.md`, `.gitignore`, `docs/*.md` (jalur).
- **PRD:** –; D-19.
- **Selesai bila:**
  - di `frontend/`, `npm run lint`, `typecheck`, `test`, dan `build` hijau seperti sebelum dipindah;
  - riwayat git berkas tetap terlacak sebagai pindahan;
  - tidak ada jalur lama yang tertinggal di dokumen.
- **Prasyarat:** T5.00.

### [ ] T5.02 Kasus uji perhitungan bersama **[DEMO]**
- **Tujuan:** Kasus uji perhitungan Tahap 2 dipindahkan ke `shared/kasus-uji/*.json`, satu berkas per modul rumus:
  - `pesanan-nilai`, `kiriman`, `modal`, `ringkasan`, `kebutuhan`, `kapasitas-lahan`, `pesanan-lahan`, `jarak`, `pengingat`, `format-rupiah`;
  - format `{ nama, fungsi, masukan, keluaran }` atau `{ …, galat }`;
  - Vitest membaca berkas yang sama;
  - aturan pembulatan rupiah ditulis eksplisit sebagai kasus, termasuk nilai negatif dan setengah.
- **Berkas:** `shared/kasus-uji/*.json`, `shared/kasus-uji/README.md` (format), `frontend/src/lib/*.test.ts` (membaca JSON).
- **PRD:** D-08.
- **Selesai bila:**
  - tes Vitest tetap hijau dengan cakupan `src/lib` ≥ 90%;
  - setiap fungsi uang dan kapasitas punya kasus di JSON;
  - satu berkas JSON yang sengaja diubah membuat tes gagal (dicek sekali).
- **Prasyarat:** T5.01.

### [ ] T5.03 Proyek Laravel, format respons, dan panduan lokal **[DEMO]**
- **Tujuan:**
  - Pasang Laravel 13 di `backend/`; prasyaratnya PHP ≥ 8.3, karena PHP 8.1 di PATH sekarang terlalu lama (D-19).
  - Koneksi MariaDB XAMPP (`tani_muda`, `tani_muda_uji`), Pest, Sanctum mode SPA, dan CORS untuk `http://localhost:5173` dengan kredensial.
  - **Format respons dan galat sesuai kontrak** lewat satu handler galat, beserta paginasi sesuai kontrak.
  - Pesan validasi Bahasa Indonesia (`lang/id`), zona waktu tampilan Asia/Jakarta, dan `backend/.env.example` tanpa nilai rahasia.
  - Panduan menjalankan lokal tanpa Docker.
- **Berkas:** `backend/**`, `backend/.env.example`, `docs/menjalankan-lokal.md`.
- **PRD:** –; D-19.
- **Selesai bila:**
  - mengikuti `docs/menjalankan-lokal.md` dari nol di Windows dengan XAMPP berhasil;
  - semua nilai lingkungan (alamat, basis data, domain sesi, asal CORS, driver) dibaca dari `.env` lewat `config/`, dan tidak ada path khusus Windows (huruf drive atau garis miring terbalik) di `backend/app`, `backend/config`, dan `backend/routes` (D-24);
  - `GET /api/v1/kesehatan` menjawab dengan format kontrak;
  - galat 404, 422, dan 500 berbentuk `{ galat: { kode, pesan, rincian } }` (tes Pest);
  - `php artisan test` jalan dengan basis data uji;
  - `.env` tidak ikut commit.
- **Prasyarat:** T5.01, T5.00.

### [ ] T5.04 Migrasi: pengguna, wilayah, lahan, kelompok tani **[DEMO]**
- **Tujuan:** Tabel:
  - `pengguna` (nomor HP, nama, peran, `wilayah_id`, `foto_profil`, `status_akun`), `profil_pembeli` (status verifikasi), `catatan_petani`;
  - `wilayah` (desa, kecamatan, kabupaten, lintang/bujur titik tengah dengan indeks);
  - `lahan` (`luas_m2`, `satuan_asli`, `nilai_asli`, titik koordinat, `kapasitas_lubang`), `kelompok_tani`, `anggota_kelompok_tani`;
  - `kode_otp`, `konfigurasi`.

  **Tanpa kata sandi dan nama pengguna (D-04).**
- **Berkas:** `backend/database/migrations/*`, `backend/app/Models/*`, `backend/app/Enums/*`.
- **PRD:** P0-01, P0-02, P0-20, P0-21; D-03, D-04, D-06, D-13, D-15.
- **Selesai bila:**
  - `migrate:fresh` jalan dari nol;
  - nama kolom sama dengan kontrak;
  - enum sesuai kontrak;
  - model punya relasi yang dipakai endpoint.
- **Prasyarat:** T5.03, T3.01.

### [ ] T5.05 Migrasi: referensi, resep, belajar **[DEMO]**
- **Tujuan:** Tabel:
  - referensi: `komoditas`, `metode_tanam`, `konversi_satuan`, `input_pertanian`, `kelayakan_subsidi`, `merek_input`, `laporan_harga`, `promo`;
  - resep: `resep_tanam` (versi sebagai baris baru, K3; `status`, `contoh`, validator), `resep_input`, `resep_tugas`;
  - belajar: `modul`, `progres_modul`, `permintaan_resep` (kunci unik per pengguna, komoditas, metode).

  Batasan `CHECK` untuk harga dan jumlah tidak negatif.
- **Berkas:** `backend/database/migrations/*`, model terkait.
- **PRD:** P0-03–P0-05, P0-09, P0-30–P0-35, P2-04, P2-07, P2-09; D-11, D-12.
- **Selesai bila:**
  - harga negatif ditolak oleh basis data (tes);
  - satu komoditas bisa punya satu resep per metode per versi;
  - metode berupa data.
- **Prasyarat:** T5.04.

### [ ] T5.06 Migrasi: siklus, tugas, pengukuran, pengeluaran **[DEMO]**
- **Tujuan:** Tabel:
  - `siklus_tanam` (`resep_id` versi, `lahan_id`, `luas_m2`, `jumlah_lubang`, tanggal tanam, harga jual, status);
  - `rencana_item`, `tugas` (foto bukti), `hasil_pengukuran` (sumber manual/sensor), `pengeluaran` (foto nota);
  - `pengaturan_pengingat`, `langganan_notifikasi`, `log_notifikasi`.

  Status terlambat tidak disimpan.
- **Berkas:** `backend/database/migrations/*`, model terkait.
- **PRD:** P0-11–P0-18, P0-37, P0-38, P2-06, P2-08; D-15.
- **Selesai bila:**
  - satu lahan bisa punya beberapa siklus aktif;
  - siklus menyimpan versi resep;
  - tidak ada kolom status terlambat.
- **Prasyarat:** T5.05.

### [ ] T5.07 Migrasi: pesanan, alokasi, pembayaran, kiriman, rating, sengketa **[DEMO]**
- **Tujuan:** Tabel:
  - `pesanan` (jenis rutin/sekali panen, `wilayah_id` titik antar, alamat, status), `alokasi_pesanan` (waktu setuju kesepakatan);
  - `pembayaran` (jenis, status `ditahan`/`cair`/`dikembalikan`, nominal, referensi, `kunci_idempoten` unik);
  - `pengiriman` (`alasan_penolakan`, `keterangan_penolakan`, `jumlah_ditolak`, `foto_penolakan`), `rating`, `sengketa`.

  Batasan `CHECK`:
  - "Lainnya" wajib keterangan (D-14);
  - jumlah ditolak tidak lebih dari jumlah dikirim.
- **Berkas:** `backend/database/migrations/*`, model terkait.
- **PRD:** P0-19–P0-28, P2-05; D-01–D-03, D-06, D-14.
- **Selesai bila:**
  - batasan `CHECK` terbukti oleh tes;
  - `kunci_idempoten` ganda ditolak;
  - nama kolom sama dengan kontrak.
- **Prasyarat:** T5.06.

### [ ] T5.08 Seeder dari data contoh bersama **[DEMO]**
- **Tujuan:**
  - Seeder membaca `shared/data-contoh/*.json`, sehingga datanya sama persis dengan klien tiruan: referensi, wilayah, konfigurasi, resep draf contoh, modul, pengguna uji per peran, lahan, siklus, pesanan rutin dan sekali panen.
  - Seeder **produksi** terpisah dan tidak memuat resep contoh maupun pengguna uji (D-12).
- **Berkas:** `backend/database/seeders/*`.
- **PRD:** P0-03, P0-19, P0-20; D-10–D-12.
- **Selesai bila:**
  - `migrate:fresh --seed` jalan dari nol;
  - jumlah baris per tabel sama dengan isi JSON (tes);
  - seeder produksi tanpa resep `contoh` (tes).
- **Prasyarat:** T5.07, T5.01.

### [ ] T5.09 Masuk dengan nomor HP dan OTP (Sanctum) **[DEMO]**
- **Tujuan:** Endpoint OTP kirim/verifikasi, keluar, dan akun, sesuai `arsitektur-backend.md` bagian 5:
  - kode 6 digit **disimpan sebagai hash**;
  - **kedaluwarsa 5 menit**;
  - **maksimal 5 percobaan**, lalu kode terkunci;
  - batas kirim ulang 60 detik dan 5 per jam per nomor, ditambah batas per IP;
  - antarmuka `PengirimOtp` dengan **driver log** untuk pengembangan, yang hanya aktif saat `APP_ENV=local`;
  - sesi Sanctum SPA dengan cookie (D-21); mode token disiapkan di middleware untuk aplikasi React Native kelak, tanpa endpoint baru;
  - pengguna baru dibuat setelah verifikasi pertama;
  - peran admin tidak bisa dipilih sendiri.
- **Berkas:** `backend/app/Domain/Otp/*`, `backend/app/Http/Controllers/Api/V1/AuthController.php`, request, tes Pest.
- **PRD:** P0-01; D-04, D-10.
- **Selesai bila:** tes Pest membuktikan:
  - kode tidak pernah ada di respons;
  - hash yang tersimpan berbeda dari kode;
  - kode ditolak tepat setelah 5 menit (waktu dibekukan);
  - percobaan ke-6 ditolak dengan `OTP_TERKUNCI`;
  - kirim ulang terlalu cepat mendapat 429;
  - driver log menolak menyala di luar `local`;
  - nomor dinormalisasi sama dengan `src/lib/nomor-hp.ts` (kasus uji bersama).
- **Prasyarat:** T5.04.

### [ ] T5.10 Policy per peran dan tes akses silang **[DEMO]**
- **Tujuan:**
  - Middleware peran dan middleware akun aktif.
  - Gate `ambil-pesanan` (D-13) dan `pasang-pesanan` (P0-02).
  - Policy untuk lahan, siklus (berikut turunannya), pesanan, alokasi, pengiriman, pembayaran (baca saja), rating, sengketa, resep, permintaan resep, dan pengguna.
  - API Resource per penonton; kebun untuk pembeli tanpa titik lahan (D-06).
- **Berkas:** `backend/app/Policies/*`, `backend/app/Http/Middleware/*`, `backend/app/Http/Resources/*`, `backend/tests/Feature/AksesSilangTest.php`.
- **PRD:** P0-02, P0-03, P0-20, P0-21; D-06, D-13.
- **Selesai bila:** tes Pest untuk **setiap endpoint data milik pengguna**:
  - pemilik mendapat 200;
  - **pengguna lain dengan peran sama mendapat 404** (D-22);
  - peran salah mendapat 403;
  - tanpa sesi mendapat 401;
  - pembeli tidak pernah menerima koordinat lahan;
  - klien tidak bisa menulis `pembayaran`;
  - daftar endpoint di tes dibandingkan dengan `route:list`, sehingga endpoint tanpa tes akses membuat tes gagal.
- **Prasyarat:** T5.09, T5.07.

### [ ] T5.11 Endpoint akun, wilayah, referensi, resep, belajar **[DEMO]**
- **Tujuan:** Endpoint sesuai kontrak untuk pilih peran dan desa, profil, wilayah, referensi, resep (resep draf bukan contoh tidak pernah ke petani), permintaan resep, modul, dan progres.
- **Berkas:** controller, request, resource, dan tes Pest per endpoint.
- **PRD:** P0-01, P0-03–P0-05, P0-09, P0-30–P0-35; D-05, D-12.
- **Selesai bila:**
  - tes Pest per endpoint (bentuk respons, galat, paginasi);
  - tes kontrak frontend (T3.12) yang dijalankan terhadap backend lokal lulus untuk kelompok ini.
- **Prasyarat:** T5.10, T5.08.

### [ ] T5.12 Endpoint lahan, kebun, jurnal, dan berkas privat **[DEMO]**
- **Tujuan:**
  - Endpoint lahan (kapasitas tersisa dari `Domain/Hitung/KapasitasLahan`, D-15).
  - Siklus: buat dari rencana, dengan tugas dibuat di server memakai port `jadwal-buat`; ubah tanggal tanam; akhir siklus.
  - Tugas (selesai, tunda), pengukuran (ukur ulang), pengeluaran, jurnal, pengaturan pengingat.
  - **Berkas privat**: unggah foto ke disk privat, unduh hanya lewat **URL bertanda tangan** 10 menit, dengan Policy diperiksa saat URL dibuat.
- **Berkas:** controller, `backend/app/Services/*`, `backend/app/Domain/Hitung/{KapasitasLahan,Jadwal}.php`, tes Pest.
- **PRD:** P0-11–P0-18, P0-37, P0-38; D-15.
- **Selesai bila:**
  - siklus yang melebihi kapasitas ditolak `409 LAHAN_TIDAK_CUKUP`;
  - jumlah tugas yang dibuat sama dengan `buatJadwal` (kasus uji bersama);
  - URL bertanda tangan kedaluwarsa dan URL yang diubah ditolak (tes);
  - tidak ada berkas pengguna di folder publik.
- **Prasyarat:** T5.11, T5.14.

### [ ] T5.13 Radius pesanan dan alokasi dengan penguncian **[DEMO]**
- **Tujuan:**
  - **Pesanan di sekitar** dengan rumus **Haversine dari koordinat tabel `wilayah`** (titik tengah desa petani ke desa titik antar), memakai prasaring kotak batas. Respons hanya memuat nama desa dan jarak.
  - **Ambil pesanan** dalam **transaksi dengan penguncian baris** (`lockForUpdate` pada pesanan lalu lahan): cek akun aktif, total alokasi, dan kapasitas lahan; buat alokasi, siklus dengan harga kesepakatan, dan rencana item.
  - Kesepakatan.
- **Berkas:** `backend/app/Services/AmbilPesanan.php`, `backend/app/Domain/Hitung/Jarak.php`, controller, tes Pest.
- **PRD:** P0-19–P0-22; D-06, D-13, D-15.
- **Selesai bila:**
  - jarak SQL dan PHP sama dengan `shared/kasus-uji/jarak.json` (toleransi 0,01 km);
  - urutan stabil;
  - **tes serentak** (dua proses bersamaan memperebutkan sisa pesanan yang sama) tidak pernah melampaui total pesanan;
  - gagal di tengah tidak meninggalkan baris setengah jadi.
- **Prasyarat:** T5.11, T5.14.

### [ ] T5.14 Perhitungan uang dan kapasitas di server **[DEMO]**
- **Tujuan:**
  - Port rumus `src/lib` ke `backend/app/Domain/Hitung/`: `PesananNilai` (D-02), `Kiriman` (D-01, D-03), `Modal`, `Ringkasan`, `KapasitasLahan` (D-15), `PesananLahan`, `Jarak`, `Pengingat`, `Format`. Semuanya fungsi murni tanpa Eloquent dan waktu sistem.
  - **Server tidak menerima angka uang dari klien.**
- **Berkas:** `backend/app/Domain/Hitung/*`, `backend/tests/Unit/KasusUjiBersamaTest.php`.
- **PRD:** P0-08, P0-10, P0-19, P0-21, P0-23, P0-26; D-01–D-03, D-08, D-15.
- **Selesai bila:**
  - **semua kasus di `shared/kasus-uji/` lulus di Pest dan Vitest**;
  - endpoint yang menerima nilai uang dari klien tidak ada (dicek tes kontrak);
  - pembulatan rupiah identik di kedua sisi.
- **Prasyarat:** T5.02, T5.03.

### [ ] T5.15 Pembayaran tiruan di server **[DEMO]**
- **Tujuan:**
  - Antarmuka `Domain/Pembayaran/PenyediaPembayaran` (`tahan`, `cairkan`, `kembalikan`, `status`) dan implementasi `PembayaranTiruan` (referensi `TIRUAN-…`), dipilih lewat `PEMBAYARAN_DRIVER`.
  - Endpoint bayar uang muka dan biaya layanan, dengan nominal dari `PesananNilai`.
  - Pencairan per kiriman (80% dari pembeli + 20% dari saldo uang muka), pengembalian (gagal panen tanpa pengganti, D-03), dan `kunci_idempoten`.
- **Berkas:** `backend/app/Domain/Pembayaran/*`, `backend/app/Services/*`, controller, tes Pest.
- **PRD:** P0-23, P0-26, P0-27; D-02, D-03, D-10.
- **Selesai bila:**
  - semua operasi uang lewat antarmuka;
  - `pembayaran` hanya ditulis layanan server;
  - permintaan ganda dengan kunci sama tidak membayar dua kali;
  - saldo uang muka tidak pernah negatif;
  - tes: tahan lalu cairkan, kembalikan, cairkan melebihi saldo ditolak.
- **Prasyarat:** T5.14, T5.07.

### [ ] T5.16 Endpoint kiriman, konfirmasi, sengketa, rating, admin, mentor **[DEMO]**
- **Tujuan:** Endpoint sesuai kontrak untuk:
  - kiriman (foto kualitas wajib sebelum dikirim);
  - konfirmasi dan tolak sebagian: alasan dari empat pilihan, "Lainnya" wajib keterangan (D-14); membuat sengketa;
  - gagal panen dan pembatalan (D-03), rating;
  - pembeli: daftar, verifikasi, buat pesanan rutin dan sekali panen, dasbor;
  - admin: verifikasi, sengketa, catatan petani, nonaktifkan dan aktifkan (D-13);
  - mentor: resep, versi, validasi.
- **Berkas:** controller, service, resource, tes Pest.
- **PRD:** P0-02, P0-04, P0-19, P0-24–P0-28, P0-31; D-03, D-13, D-14.
- **Selesai bila:**
  - tes Pest per endpoint;
  - keputusan sengketa menentukan pencairan sisa bagian;
  - pembeli belum terverifikasi tidak bisa memasang pesanan;
  - siklus berjalan tetap memakai versi resep lama setelah mentor mengubah resep.
- **Prasyarat:** T5.15, T5.13.

### [ ] T5.17 Scheduler dan antrean **[DEMO]**
- **Tujuan:** Jadwal di `routes/console.php` dengan **zona waktu Asia/Jakarta**:
  - **pengingat setiap 15 menit**: pengguna yang jam pengingatnya jatuh di jendela itu, berisi tugas hari ini dan yang terlambat menurut tipe yang diaktifkan; pengingat sore hanya bila ada tugas belum selesai;
  - **konfirmasi otomatis kiriman setiap 15 menit**, bersamaan dengan pengingat (D-23): lewat batas periksa **6 jam rutin, 24 jam sekali panen**, dari konfigurasi (D-01), lalu dicairkan;
  - uang muka kembali bila 7 hari tanpa petani;
  - pengingat bayar sehari sebelum jadwal kirim;
  - pencatatan "tidak memberi kabar" (D-03).

  Antrean memakai driver `database`. Pengiriman dicatat di `log_notifikasi` supaya tidak ganda.
- **Berkas:** `backend/routes/console.php`, `backend/app/Console/Commands/*`, tes Pest.
- **PRD:** P0-13, P0-23, P0-25, P0-27, P0-38; D-01, D-03, D-23.
- **Selesai bila:** tes dengan waktu dimajukan (`travelTo`) membuktikan:
  - jendela 15 menit tepat dan tidak ganda;
  - batas 6 jam dan 24 jam diuji tepat di batas, sebelum, dan sesudah; pencairan terjadi pada putaran 15 menit pertama setelah batas;
  - aturan 7 hari;
  - `php artisan schedule:list` menampilkan semua jadwal dengan zona Asia/Jakarta.
- **Prasyarat:** T5.16, T5.18.

### [ ] T5.18 Web push dengan kunci VAPID **[DEMO]**
- **Tujuan:**
  - Paket web push untuk notifikasi Laravel, dengan tabel langganan diarahkan ke `langganan_notifikasi`.
  - Kunci VAPID dibuat sekali dan disimpan di `backend/.env`; kunci publik disalin ke frontend sebagai `VITE_VAPID_PUBLIC_KEY`.
  - Endpoint simpan dan hapus langganan, notifikasi pengingat dan peristiwa (resep tersedia, uang muka diterima, kiriman tiba) lewat antrean, serta penghapusan langganan kedaluwarsa (410).
- **Berkas:** `backend/config/webpush.php`, `backend/app/Notifications/*`, controller, tes Pest.
- **PRD:** P0-13, P0-23, P0-31, P2-02.
- **Selesai bila:**
  - notifikasi uji terkirim ke langganan yang tersimpan (pemicu manual `php artisan pengingat:kirim --uji`);
  - kunci privat tidak pernah ada di respons atau di frontend;
  - menandai resep `divalidasi` mengirim notifikasi tepat sekali per peminta.
- **Prasyarat:** T5.12.

### [ ] T5.19 Kecocokan kontrak backend
- **Tujuan:** Pemeriksaan akhir tahap: setiap endpoint di `kontrak-api.md` ada, berperilaku sesuai kontrak, dan punya tes; dokumen diperbarui bila ada perubahan yang disetujui.
- **Berkas:** `backend/tests/Feature/KontrakTest.php`, `docs/kontrak-api.md`.
- **PRD:** –
- **Selesai bila:**
  - `php artisan test` hijau;
  - tes kontrak frontend (T3.12) lulus terhadap backend lokal untuk semua kelompok endpoint;
  - tidak ada endpoint di `route:list` yang tidak tercatat di kontrak.
- **Prasyarat:** T5.11–T5.18.

---

# Tahap 6. Penyambungan, offline, notifikasi, uji menyeluruh

Tujuan tahap: frontend memakai backend Laravel lewat klien API HTTP tanpa mengubah halaman, lalu mode offline, notifikasi, dan uji jalur demo dari awal sampai akhir.

### [ ] T6.01 Klien API HTTP **[DEMO]**
- **Tujuan:**
  - Implementasi `KlienApi` dengan `fetch` ke `VITE_API_URL`: cookie Sanctum dan CSRF (`/sanctum/csrf-cookie`), pemetaan galat dan paginasi sesuai kontrak, batas waktu, dan header `kunci_idempoten`.
  - `PenyediaOtp` dan `PenyediaPembayaran` versi HTTP.
  - Diaktifkan dengan `VITE_SUMBER_DATA=http`.
- **Berkas:** `frontend/src/api/http/*`, `frontend/src/penyedia/**/…-http.ts`, `frontend/.env.example` (`VITE_API_URL`).
- **PRD:** –; D-20.
- **Selesai bila:**
  - **rangkaian tes kontrak T3.12 lulus terhadap klien HTTP** dengan backend lokal;
  - tidak ada berkas di `src/halaman/` yang berubah untuk penyambungan (dicek dengan `git diff --stat`).
- **Prasyarat:** T5.19.

### [ ] T6.02 Penyambungan per fitur dan perbaikan selisih **[DEMO]**
- **Tujuan:** Menjalankan setiap halaman Tahap 4 dengan `VITE_SUMBER_DATA=http`, memperbaiki selisih perilaku antara klien tiruan dan backend (di klien tiruan, backend, atau kontrak), dan mencatat perubahan kontrak yang disetujui.
- **Berkas:** perbaikan di `frontend/src/api/**`, `backend/**`, `docs/kontrak-api.md`.
- **PRD:** seluruh P0.
- **Selesai bila:**
  - semua tugas [DEMO] Tahap 4 berjalan dengan backend;
  - tangkapan layar halaman [DEMO] tetap sama dengan versi data tiruan;
  - klien tiruan tetap bisa dipakai untuk demo tanpa backend.
- **Prasyarat:** T6.01.

### [ ] T6.03 PWA: manifest, service worker, instal **[DEMO]**
- **Tujuan:** `vite-plugin-pwa` dengan manifest (nama, ikon, warna dari token), precache cangkang aplikasi, halaman offline cadangan, dan petunjuk tambah ke layar utama (untuk iPhone).
- **Berkas:** `frontend/vite.config.ts`, `frontend/public/ikon/*`, `frontend/src/pwa/daftar-sw.ts`, `frontend/src/komponen/petunjuk-instal.tsx`.
- **PRD:** P0-29, P0-13 (syarat), Dependensi PWA.
- **Selesai bila:**
  - Lighthouse PWA terpasang;
  - aplikasi terbuka saat offline setelah kunjungan pertama;
  - ikon dan `theme_color` memakai nilai token.
- **Prasyarat:** T6.02.

### [ ] T6.04 Skema Dexie dan cache data offline **[DEMO]**
- **Tujuan:** Dexie menyimpan siklus, rencana, tugas, modul, hasil pengukuran, dan pengaturan. TanStack Query dipersist, dan bacaan tanpa sinyal diambil dari Dexie.
- **Berkas:** `frontend/src/data/offline/db.ts`, `frontend/src/data/offline/persist.ts`, `frontend/src/lib/versi-skema.ts` + tes.
- **PRD:** P0-29, US-10.
- **Selesai bila:**
  - jadwal, checklist, dan rencana modal terbuka dengan jaringan dimatikan;
  - data lama tidak rusak saat skema naik versi.
- **Prasyarat:** T6.03.

### [ ] T6.05 Antrean tulis offline dan sinkron **[DEMO]**
- **Tujuan:**
  - Tindakan saat offline (tandai selesai, tunda, hasil pengukuran, pengeluaran, foto) masuk antrean Dexie dan terkirim otomatis saat online, dengan `kunci_idempoten` supaya tidak tercatat ganda di server.
  - Penyelesaian konflik sederhana.
  - Banner offline dengan jumlah tertunda.
- **Berkas:** `frontend/src/data/offline/antrean.ts`, `frontend/src/lib/antrean.ts` + `.test.ts`, `frontend/src/komponen/banner-offline.tsx`.
- **PRD:** P0-29.
- **Selesai bila:**
  - skenario offline → centang 2 tugas + ukur pH → online tersinkron **tepat sekali** di basis data;
  - banner sesuai desain;
  - antrean teruji sebagai fungsi murni.
- **Prasyarat:** T6.04.

### [ ] T6.06 Video modul offline
- **Tujuan:** Unduh video resolusi rendah, simpan (Cache Storage atau IndexedDB), putar tanpa sinyal, beri tanda "tersimpan offline", dan bisa hapus unduhan.
- **Berkas:** `frontend/src/data/offline/video.ts`, pembaruan `pemutar-video.tsx`, `frontend/src/halaman/belajar.tsx`.
- **PRD:** P0-05, P0-29, US-01.
- **Selesai bila:**
  - video yang diunduh terputar dengan jaringan mati;
  - status unduh tampil di daftar modul (papan 08 mobile);
  - penggunaan ruang ditampilkan.
- **Prasyarat:** T6.04.

### [ ] T6.07 Notifikasi: izin, langganan, pengingat **[DEMO]**
- **Tujuan:**
  - Alur izin yang ramah (bukan langsung meminta).
  - `PushManager.subscribe` dengan `VITE_VAPID_PUBLIC_KEY`, disimpan lewat endpoint langganan (T5.18).
  - Banner "Pengingat di HP-mu mati" bila izin ditolak (papan 07), dan service worker menampilkan notifikasi pengingat dan peristiwa.
- **Berkas:** `frontend/src/data/push.ts`, `frontend/src/komponen/izin-notifikasi.tsx`, `frontend/src/sw/push.ts`.
- **PRD:** P0-13, P0-31, P0-38, US-07.
- **Selesai bila:**
  - langganan tercatat di backend;
  - pengingat terjadwal (T5.17) tiba di perangkat demo dengan isi sama seperti contoh papan 26 mobile;
  - tipe yang dimatikan tidak dikirim;
  - izin ditolak menampilkan banner dengan tugas hari ini.
- **Prasyarat:** T6.03, T5.17, T5.18.

### [ ] T6.08 Uji menyeluruh dan skenario demo **[DEMO]**
- **Tujuan:** Menjalankan jalur demo (bagian atas dokumen ini) dari nol dengan backend lokal:
  - reset `php artisan migrate:fresh --seed`;
  - akun uji per peran;
  - cadangan bila backend tidak tersedia (klien tiruan).

  Pemeriksaan otomatis API utama dan pemeriksaan bundel produksi untuk memastikan tidak ada rahasia.
- **Berkas:** `docs/skenario-demo.md`, `scripts/uji-demo.mjs`.
- **PRD:** seluruh siklus P0.
- **Selesai bila:**
  - jalur demo dijalankan dua kali berturut-turut dari reset tanpa galat, di Android dan iPhone (web push iPhone memerlukan tambah ke layar utama);
  - pencarian pada hasil `build` tidak menemukan nama variabel rahasia backend;
  - langkah deploy di `arsitektur-backend.md` bagian 17 diperiksa ulang terhadap konfigurasi akhir, sehingga aplikasi siap di-deploy ke VPS tanpa perubahan kode (D-24);
  - catatan hasil ada di dokumen.
- **Prasyarat:** semua tugas [DEMO].

---

# Pertanyaan dan hal yang ambigu

Pertanyaan P-3 sampai P-11, P-14, dan P-27 versi pertama **sudah dijawab** di `docs/keputusan.md` (D-01 sampai D-10). Hambatan PRD P-1, P-2, P-3, P-4 tidak lagi menghentikan pekerjaan (D-10).

Pertanyaan P-1 sampai P-5 versi kedua **sudah dijawab** pada 5 Oktober 2026: resep contoh (D-12), akun nonaktif sementara (D-13), alasan penolakan (D-14), lahan dan kapasitas (D-15), titik patah (D-16), serta keputusan teknis Tahap 1 (D-17). Arsitektur backend diputuskan di D-19 dan D-20. Pertanyaan backend P-15 sampai P-19 dijawab pada 5 Oktober 2026: tempat deploy (D-24), cara sesi Sanctum (D-21), 404 untuk data orang lain (D-22), konfirmasi otomatis setiap 15 menit (D-23), dan PHP 8.3+ terpisah (D-25). 

## Keputusan teknis dan produk yang masih terbuka

Semua pertanyaan P-6 sampai P-14 dijawab pada 5 Oktober 2026 (D-26 sampai D-33). Belum ada pertanyaan terbuka baru; pertanyaan berikutnya ditambahkan di sini dengan nomor P-20 dan seterusnya.
