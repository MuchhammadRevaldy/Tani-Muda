# Rencana Kerja Tani Muda

Daftar tugas berurutan, dikelompokkan per tahap. Dibaca bersama `aturan-proyek.md` (aturan wajib), `ringkasan-desain.md` (token, komponen, halaman), dan PRD di `docs/`.

## Cara membaca

- `[ ]` belum, `[x]` selesai. Tulis satu baris catatan di bawah tugas saat mencentang.
- **[DEMO]** = wajib untuk demo lomba. Tugas tanpa tanda adalah P0 lain atau pelengkap yang boleh menyusul setelah demo siap.
- Setiap tugas berisi: **Tujuan**, **Berkas** (dibuat atau diubah), **PRD**, **Selesai bila**, **Prasyarat**. Ukuran: beberapa jam. Tugas yang ternyata lebih besar dipecah (aturan proyek 11.4).
- "Papan NN" = nomor halaman di [`design/README.md`](../design/README.md) (urutan alur aplikasi). "Papan 03" berarti versi mobile dan desktop; "papan 03 mobile" berarti satu versi.
- Semua tugas tunduk pada daftar periksa di `aturan-proyek.md` bagian 12. Di bawah ini hanya ditulis syarat khusus tugas.
- **`docs/keputusan.md` mengalahkan PRD, desain, dan dokumen ini.** Keputusan 4 dan 5 Oktober 2026 (D-01 sampai D-18) sudah diterapkan di bawah dan ditandai "(D-nn)".
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
| K2 | Pengembangan lokal memakai **Supabase CLI** (Docker) untuk migrasi, seed, Edge Function | Migrasi SQL harus bisa diuji ulang dari nol |
| K3 | Setiap versi resep adalah **baris baru** di `resep_tanam` (versi naik); `siklus_tanam.resep_id` menunjuk baris versi yang dipakai | Memenuhi P0-04 tanpa menyalin seluruh resep |
| K4 | Hanya satu siklus aktif yang ditampilkan di v1 (menu **Kebun** langsung membuka siklus aktif). Data model tetap mengizinkan banyak siklus (P2-06) | Desain tidak punya daftar kebun |
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
- **Selesai bila:** `npm run dev` menampilkan halaman kosong; `npm run test` menjalankan satu tes contoh; `npm run build` sukses; `.env.example` hanya berisi nama variabel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`).
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
- **Berkas:** `eslint.config.js` (aturan), `scripts/cek-aturan.mjs` (skrip yang gagal bila di `src/` ada hex `#xxxxxx`, `rgb(`, kelas warna bawaan Tailwind, `text-sm|text-xs`, `shadow-(sm|md|lg|xl)`, nilai sembarang `[..px]` untuk warna, `service_role`, `SERVICE_ROLE`, `VITE_SUPABASE_SERVICE`), `package.json` (script `lint` memanggil keduanya), tes skrip. `scripts/kata-terlarang.json` (escrow, task, pending, submit, DP, HST, dashboard, login), pemeriksaan pada `src/teks/` dan teks JSX.
- **PRD:** –
- **Selesai bila:** berkas contoh yang melanggar membuat `npm run lint` gagal dan pesan menunjuk berkas dan baris; berkas bersih lolos. Teks berisi "Pembayaran DP berhasil" atau "HST 13" membuat `lint` gagal.
- **Prasyarat:** T1.02.
- **Catatan (5 Okt 2026):** ESLint + `scripts/cek-aturan.mjs` (fungsi di `scripts/aturan.mjs`, 17 tes). Juga ESLint melarang impor React/Supabase di `src/lib`.

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

Semua fungsi murni, tanpa React/Supabase/`Date.now()`. Setiap tugas dianggap selesai hanya bila tes lulus dan cakupan berkas ≥ 90%. Contoh angka di tes adalah **contoh** (aturan 5).

### [ ] T2.01 Tipe domain dan fixture contoh resep **[DEMO]**
- **Tujuan:** Tipe TypeScript untuk Resep, input, tugas, rencana, siklus, pesanan, dst. (nama sesuai Model Data PRD), dan fixture resep contoh sawi bedengan, sawi hidroponik NFT, padi sawah, bayam, kangkung dari data desain (papan 13 mobile, 16 mobile, 18 mobile, 19 mobile, 20 mobile, 21 mobile dan 23 mobile).
- **Berkas:** `src/tipe/*.ts`, `src/lib/fixtures/contoh-resep-*.ts`, `src/lib/fixtures/contoh-resep.test.ts` (fixture konsisten: hasil per m², HST tugas ≤ umur panen).
- **PRD:** P0-03, Model Data.
- **Selesai bila:** `typecheck` hijau; fixture memuat angka contoh dengan tanda `CONTOH` di nama dan komentar; `bacaTampilkanResepContoh(nilaiEnv)` di `src/lib/pengaturan.ts` hanya mengembalikan `true` untuk nilai persis `"true"` (kosong, tidak ada, atau nilai lain → `false`; D-12), dengan tes.
- **Prasyarat:** T1.01.

### [ ] T2.02 Konversi satuan luas `konversi-satuan.ts` **[DEMO]**
- **Tujuan:** `keM2(nilai, satuan, konversi)`, `dariM2(m2, satuan, konversi)`, `teksBantuanLuas(...)` ("7 ru ≈ 100 m²", "0,1 hektare = 1.000 m²"); `konversi` (ru/bata ke m²) dikirim sebagai argumen.
- **Berkas:** `src/lib/konversi-satuan.ts` + `.test.ts`.
- **PRD:** P0-33, US-25; rumus konversi; `konversi_satuan`.
- **Selesai bila:** tes: 1 ha = 10.000 m², 7 ru ≈ 98 m² (dengan 14), 100 m² ≈ 7 ru, nilai 0 atau kosong → galat `UKURAN_KOSONG`, nilai negatif ditolak, konversi bukan 14 (mis. 12 m² per ru) menghasilkan hasil berbeda, pembulatan tampilan konsisten dengan teks desain (papan 13 mobile).
- **Prasyarat:** T1.05, T2.01.

### [ ] T2.03 Kebutuhan input `kebutuhan.ts` **[DEMO]**
- **Tujuan:** `hitungKebutuhan(input, ukuran)` = dosis × ukuran sesuai dasar dosis (per m², per tanaman, per liter larutan), `bulatkanKeKemasan(jumlah, ukuranKemasan)` selalu ke atas; kebutuhan nutrisi hidroponik = dosis pekatan per liter × volume tandon × jumlah pengisian ulang; validasi ukuran > 0 dengan pesan sesuai metode ("Isi luas lahan dulu", "Isi jumlah lubang tanam dulu", "Isi jumlah polybag dulu").
- **Berkas:** `src/lib/kebutuhan.ts` + `.test.ts`.
- **PRD:** P0-07, US-03, rumus "Kebutuhan input" dan "Kebutuhan nutrisi hidroponik".
- **Selesai bila:** tes contoh PRD (5 g/m² × 100 m² = 500 g → kemasan 1 kg → 1 kg); kelipatan kemasan (1,01 kg dengan kemasan 1 kg → 2 kg); ukuran 0/kosong → kode galat per metode; per tanaman dan per liter; dosis 0; kemasan tidak valid.
- **Prasyarat:** T2.01.

### [ ] T2.04 Harga item: subsidi dan merek `harga-item.ts` **[DEMO]**
- **Tujuan:** Penentuan harga satuan efektif sebuah item: urutan prioritas (subsidi aktif → harga isi sendiri → merek terpilih → rata-rata sekitar → harga contoh resep); kelayakan subsidi per input, komoditas, tanggal (`kelayakan_subsidi`); jawaban petani "dapat jatah subsidi"; harga per satuan dari harga kemasan; urutan daftar merek menurut laporan terbaru; merek lain → laporan harga baru; sumber harga sebagai kode (untuk teks "Rata-rata di sekitarmu Rp…/kg").
- **Berkas:** `src/lib/harga-item.ts` + `.test.ts`.
- **PRD:** P0-08, P0-09, P0-34, P0-35 (promo tidak mengubah urutan), US-05, US-26.
- **Selesai bila:** tes: tidak dapat jatah subsidi → semua nonsubsidi; kelayakan di luar rentang tanggal → nonsubsidi; urutan merek tidak dipengaruhi promo (tes eksplisit); harga per satuan = harga kemasan ÷ isi; item "merek lain" dengan isi 0 → galat; harga negatif ditolak (kode `HARGA_NEGATIF`); item tanpa harga ditandai `BELUM_ADA_HARGA`.
- **Prasyarat:** T2.01.

### [ ] T2.05 Total modal `modal.ts` **[DEMO]**
- **Tujuan:** `hitungModal(item[], opsi)`: subtotal item, subtotal per grup, total bahan, biaya alat per siklus (harga alat ÷ jumlah siklus pembagian atau seluruhnya bila tidak dibagi), total modal, daftar item belum berharga + peringatan "total belum lengkap".
- **Berkas:** `src/lib/modal.ts` + `.test.ts`.
- **PRD:** P0-08, P0-36, US-04, US-27; rumus "Total modal" dan "Biaya alat per siklus".
- **Selesai bila:** tes dengan fixture sawi bedengan (total modal contoh Rp430.000) dan hidroponik (alat Rp1.500.000 ÷ 10); pembagian 1 siklus; item dihapus; item tambahan (tenaga kerja, sewa); item tanpa harga tidak merusak total dan memunculkan peringatan; pembulatan rupiah.
- **Prasyarat:** T2.03, T2.04.

### [ ] T2.06 Ringkasan hasil `ringkasan.ts` **[DEMO]**
- **Tujuan:** `hitungRingkasan({totalModal, perkiraanPanen, hargaJual, ukuranM2})`: modal per m², titik impas (kg, dibulatkan ke atas), pendapatan, untung, skenario "kalau panen jelek", pesan rugi; harga jual dari harga kesepakatan bila siklus terhubung pesanan.
- **Berkas:** `src/lib/ringkasan.ts` + `.test.ts`.
- **PRD:** P0-10, US-06, P1-03 (struktur skenario); rumus pendapatan/untung/titik impas.
- **Selesai bila:** tes: contoh sawi (panen 150 kg × Rp5.000 − Rp430.000 = Rp320.000; titik impas 86 kg); untung negatif → `rugi: true` + pesan "Dengan angka ini, kamu berpotensi rugi."; harga jual 0 → titik impas tak terhingga ditangani (kode `HARGA_JUAL_KOSONG`); harga kesepakatan menimpa harga jual.
- **Prasyarat:** T2.05.

### [ ] T2.07 Perkiraan panen dan ukuran hidroponik `ukuran-metode.ts` **[DEMO]**
- **Tujuan:** Perkiraan panen per metode (luas × hasil/m²; lubang × hasil/lubang; polybag), saran volume tandon per sistem, kebutuhan tempat (m²) dengan dan tanpa vertikultur, jumlah per ukuran lahan, pembulatan tampilan.
- **Berkas:** `src/lib/ukuran-metode.ts` + `.test.ts`.
- **PRD:** P0-33, P0-32, US-24, US-25, US-27.
- **Selesai bila:** tes: sawah 1.000 m² × 0,55 = 550 kg gabah; NFT 200 lubang × 0,15 = 30 kg; tandon NFT 200 lubang = 100 liter; vertikultur mengurangi tempat; semua parameter dari argumen (`hasilPerSatuan`, `faktorTandon`) bukan konstanta.
- **Prasyarat:** T2.02, T2.03.

### [ ] T2.08 Jadwal otomatis `jadwal-buat.ts` **[DEMO]**
- **Tujuan:** `buatJadwal(resepTugas[], tanggalTanam)` menghasilkan tugas bertipe **sekali** (tanggal + HST), **berulang** (tanggal tanam + HST mulai + k × interval sampai HST selesai), **pengukuran** (berulang + isian angka). Tugas berulang digabung menjadi satu pengingat dengan keterangan frekuensi ("setiap 3 hari") untuk tampilan. Tanggal sebagai string `YYYY-MM-DD` tanpa jam supaya bebas zona waktu.
- **Berkas:** `src/lib/jadwal-buat.ts` + `.test.ts`.
- **PRD:** P0-12, US-07; rumus tanggal tugas.
- **Selesai bila:** tes: sekali HST 14 dari tanam 20 Sep → 4 Okt; berulang 1–28 tiap 3 hari menghasilkan 10 kemunculan; interval 1; HST selesai < HST mulai ditolak; tipe `ukur` membawa besaran, batas bawah, batas atas; tanggal tanam di masa lalu (siklus pilot) tetap dihitung; lompat bulan dan tahun kabisat.
- **Prasyarat:** T2.01.

### [ ] T2.09 Ubah jadwal `jadwal-ubah.ts` **[DEMO]**
- **Tujuan:** `tundaTugas(jadwal, tugasId, hari 1–3, perkiraanPanen)` (menggeser tugas itu dan tugas **sejenis berikutnya**, hanya yang `bolehDigeser`, mengembalikan `perluKonfirmasi` bila melewati perkiraan panen); `ubahTanggalTanam(jadwal, tanggalBaru)` (hanya yang belum selesai dihitung ulang); `statusTugas(tugas, hariIni)` ("hari-ini", "besok", "terlambat n hari", "selesai"); `kelompokkanPerHari`; `saringTipe`; ringkas tugas berulang.
- **Berkas:** `src/lib/jadwal-ubah.ts` + `.test.ts`.
- **PRD:** P0-15, P0-16, P0-17, P0-12 (saring tipe), US-08; "Status terlambat tidak disimpan".
- **Selesai bila:** tes: tunda 1/2/3 hari; tunda 4 ditolak; tunda tugas yang tidak boleh digeser; tugas selesai tidak berubah saat ganti tanggal tanam; terlambat 2 hari pada contoh papan 20 mobile (1 Okt dibanding 3 Okt); penundaan melewati panen → `perluKonfirmasi`; filter tipe "ukur" pada siklus bedengan → daftar kosong dan kode `TIDAK_ADA_TIPE`.
- **Prasyarat:** T2.08.

### [ ] T2.10 Pengukuran `pengukuran.ts` **[DEMO]**
- **Tujuan:** `nilaiPengukuran(nilai, batasBawah, batasAtas)` → `normal | terlalu-rendah | terlalu-tinggi | kosong`; saran tindakan dari resep; `perluUkurUlang` (tugas "Ukur ulang" pada hari berikutnya bila di luar rentang); posisi pada batang rentang (`skala`) dan titik grafik 7 pengukuran terakhir.
- **Berkas:** `src/lib/pengukuran.ts` + `.test.ts`.
- **PRD:** P0-37, US-28; rumus status pengukuran.
- **Selesai bila:** tes: batas bawah dan atas dihitung **normal** (pH 5,5 dan 6,5), 6,6 terlalu tinggi, 5,4 terlalu rendah; nilai 0 dan kosong → `kosong`; koma desimal ("6,2") diterima lewat `parseAngka`; hasil di luar rentang menghasilkan tugas ukur ulang pada tanggal + 1; hasil normal tidak menambah tugas; grafik dengan < 7 data.
- **Prasyarat:** T1.05, T2.01.

### [ ] T2.11 Pengingat harian `pengingat.ts` **[DEMO]**
- **Tujuan:** `tugasUntukNotifikasi(tugas[], pengaturan, hariIni)`: tugas hari ini (plus terlambat) menurut tipe yang diaktifkan, teks judul "n tugas hari ini" dan isi ("Siangi rumput (terlambat), Siram pagi dan sore"), jam pagi; kondisi pengingat sore (hanya bila ada tugas belum selesai); banner pengganti bila izin ditolak.
- **Berkas:** `src/lib/pengingat.ts` + `.test.ts`.
- **PRD:** P0-13, P0-38, P1-05, P2-02 (logika dipisah dari saluran).
- **Selesai bila:** tes: mematikan tipe tidak menghapus tugas dari daftar jadwal tetapi menghilangkannya dari notifikasi; semua tipe mati → `tanpaPengingatPagi`; tidak ada tugas hari ini → tidak mengirim; sore hanya bila ada belum selesai.
- **Prasyarat:** T2.09.

### [ ] T2.12 Nilai pesanan dan pembayaran `pesanan-nilai.ts` **[DEMO]**
- **Tujuan:** `hitungNilaiPesanan(jumlahTotal, hargaPerKg, konfigurasi)`: nilai pesanan, uang muka (20% dari konfigurasi), biaya layanan (5%, dibayar pembeli), dibayar sekarang; jumlah total dari kiriman × frekuensi untuk rutin; `hitungPembayaranKiriman(nilaiKiriman, saldoUangMuka, konfigurasi)` (D-02): pembeli membayar **80%** nilai kiriman, **20% diambil dari saldo uang muka**; sisa saldo setelah tiap kiriman; kiriman ditolak sebagian menghitung dari bagian diterima.
- **Berkas:** `src/lib/pesanan-nilai.ts` + `.test.ts`.
- **PRD:** P0-19, P0-23, P0-26, US-15; **D-02** (mengganti rumus pembayaran per kiriman PRD).
- **Selesai bila:** tes: 10 kg × 12 kiriman × Rp5.000 = Rp600.000, uang muka Rp120.000, layanan Rp30.000, dibayar sekarang Rp150.000; tiap kiriman Rp50.000 → bayar Rp40.000 + Rp10.000 dari saldo, saldo habis tepat setelah kiriman ke-12; persen 0; jumlah 0 → galat; biaya layanan tidak memotong bagian petani; sekali panen = satu kiriman 80% + 20% saldo; saldo tidak pernah negatif.
- **Prasyarat:** T1.05.

### [ ] T2.13 Lahan untuk pesanan `pesanan-lahan.ts` **[DEMO]**
- **Tujuan:** `luasPerPanen`, `luasPesananRutin` (luas per panen × petak yang tumbuh bersamaan), `saranTanamBertahap` (mingguan + umur panen 4 minggu → 4 petak berjarak 1 minggu, tanggal tanam dan panen), `cekAmbilSebagian(jumlah, hasilPerM2, lahanKosong)` → cukup atau tidak + jumlah maksimal disarankan, `batasAlokasi` (total alokasi semua petani ≤ pesanan).
- **Berkas:** `src/lib/pesanan-lahan.ts` + `.test.ts`.
- **PRD:** P0-21, US-12; rumus luas per panen dan luas rutin.
- **Selesai bila:** tes: lahan kosong 20 m², hasil per m² dari fixture → luas per panen dan petak bertahap dihitung dari rumus (bukan "6 kg" dari desain; **D-08**); jumlah yang melebihi kapasitas → jumlah maksimal disarankan dari rumus; alokasi melebihi pesanan ditolak (kode `MELEBIHI_PESANAN`); hasil per m² 0 ditolak; pesanan sekali panen tidak memakai petak bertahap; kapasitas lahan datang sebagai argumen dari T2.15a.
- **Prasyarat:** T2.07.

### [ ] T2.14 Kiriman dan konfirmasi `kiriman.ts` **[DEMO]**
- **Tujuan:** `konfirmasiKiriman(kiriman, keputusan)`: terima semua, tolak sebagian (berat, alasan `layu_atau_busuk | jumlah_kurang | tidak_sesuai_standar | lainnya`), dana cair untuk petani, bagian dibayar pembeli (80%) dan dari uang muka (20%) lewat T2.12; `statusOtomatis(kiriman, sekarang, konfigurasiJam)` (**D-01**: 6 jam untuk rutin, 24 jam untuk sekali panen; lewat batas = dianggap diterima); `aturanGagalPanen(jadwalKirim, waktuKabar, batasHari)` (**D-03**: kabar ≥ 3 hari sebelum jadwal → bagian ditawarkan ulang; tanpa pengganti → sisa uang muka bagian itu dikembalikan; tidak memberi kabar → `catatanProfil: true`); pembatalan pembeli setelah petani menanam (uang muka jadi kompensasi).
- **Berkas:** `src/lib/kiriman.ts` + `.test.ts`.
- **PRD:** P0-25, P0-26, P0-27, US-14, US-17; **D-01, D-03**.
- **Selesai bila:** tes: bayam Rp6.000/kg, 5 kg, tolak 1 kg → dana cair Rp24.000; batas 6 jam (rutin) dan 24 jam (sekali panen) dari argumen, diuji tepat di batas, sebelum, dan sesudah; kabar tepat 3 hari sebelum jadwal diterima, kurang dari itu → catatan profil; tanpa pengganti → `dikembalikan` sebesar sisa uang muka bagian itu saja; **tidak ada denda**; tolak lebih berat dari kiriman → galat; alasan di luar daftar → galat.
- **Prasyarat:** T2.12.

### [ ] T2.15 Jarak dan urutan pesanan `jarak.ts`
- **Tujuan:** `jarakKm(a, b)` (haversine), `urutkanTerdekat`, `dalamRadius(titik, pusat, radiusKm)`, teks jarak ("4 km", "9,5 km").
- **Berkas:** `src/lib/jarak.ts` + `.test.ts`.
- **PRD:** P0-20, US-11.
- **Selesai bila:** tes jarak titik yang sama = 0, Bandung–Jakarta ≈ 120 km, di tepi radius 10 km, urutan stabil untuk jarak sama.
- **Prasyarat:** T1.05.

### [ ] T2.15a Kapasitas lahan `kapasitas-lahan.ts` **[DEMO]**
- **Tujuan:** `kapasitasLahan(lahan, siklusAktif[])`. Untuk lahan tanah: luas lahan dikurangi luas siklus aktif di lahan itu (m²). Untuk lahan hidroponik: `kapasitas_lubang` dikurangi jumlah lubang siklus aktif, **bukan luas** (D-15). Satu lahan boleh punya beberapa siklus aktif. Juga `luasDipakai`/`lubangDipakai` dan `muatSiklusBaru(lahan, siklusAktif[], ukuranBaru)`.
- **Berkas:** `src/lib/kapasitas-lahan.ts` + `.test.ts`.
- **PRD:** P0-21, US-12; **D-06**, **D-15** (rumus kapasitas), **D-08**.
- **Selesai bila:** tes: lahan 120 m² dengan siklus aktif 100 m² → 20 m²; tanpa siklus → seluruh luas; siklus selesai tidak dihitung; luas dipakai melebihi luas lahan → 0 (tidak negatif); hidroponik 200 lubang dengan dua siklus aktif 100 + 50 lubang → 50 lubang (luas lahan hidroponik diabaikan); tiga siklus aktif di satu lahan tanah dijumlahkan; `muatSiklusBaru` menolak siklus yang melebihi sisa; satuan asli tidak memengaruhi hitungan.
- **Prasyarat:** T2.01.

### [ ] T2.16 Progres belajar `belajar.ts` dan gerbang cakupan
- **Tujuan:** `ringkasProgres(modul[], selesai[])` ("3 dari 6 modul selesai", persen, modul lanjutan); pemeriksaan cakupan seluruh `src/lib`.
- **Berkas:** `src/lib/belajar.ts` + `.test.ts`, perbarui `vitest.config.ts` (ambang cakupan gagal bila < 90%).
- **PRD:** P0-05, US-01, US-02.
- **Selesai bila:** `npm run test -- --coverage` lulus dengan ≥ 90% di semua berkas `src/lib`; semua fungsi murni (tidak ada impor React atau Supabase di `src/lib`, dicek skrip).
- **Prasyarat:** T2.02–T2.15, T2.15a.

---

# Tahap 3. Database (Supabase)

Migrasi SQL dari Model Data PRD, RLS, fungsi, lalu data contoh resep. Nama tabel/kolom persis PRD (aturan 8).

### [ ] T3.01 Inisialisasi Supabase lokal dan klien **[DEMO]**
- **Tujuan:** `supabase init`, aktifkan ekstensi PostGIS, skrip pembuatan tipe TypeScript, klien Supabase di frontend dengan hanya anon key.
- **Berkas:** `supabase/config.toml`, `supabase/migrations/0001_ekstensi.sql` (`postgis`, `pgcrypto`), `package.json` (script `db:reset`, `db:tipe`), `src/data/supabase.ts`, `.env.example`.
- **PRD:** Dependensi Supabase; P0-20 (PostGIS).
- **Selesai bila:** `supabase start` dan `npm run db:reset` jalan dari nol; `src/data/supabase.ts` hanya membaca `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`; lint menolak service role.
- **Prasyarat:** T1.03.

### [ ] T3.02 Migrasi: pengguna dan profil pembeli **[DEMO]**
- **Tujuan:** Tabel `pengguna` (nomor HP, nama, peran petani/pembeli/mentor/admin, desa → `wilayah`, **`foto_profil`**, `status_akun` aktif/dinonaktifkan_sementara), `profil_pembeli`, tabel **`catatan_petani`** (petani, jenis catatan mis. `tidak_memberi_kabar`, pengiriman terkait, waktu; D-03), pemicu pembuatan `pengguna` dari `auth.users`, RLS (pengguna membaca/mengubah dirinya; admin menyetujui pembeli, menulis catatan, menonaktifkan petani). Status akun mengikuti D-13. **Tanpa kata sandi dan nama pengguna (D-04).**
- **Berkas:** `supabase/migrations/0002_pengguna.sql`.
- **PRD:** P0-01, P0-02, US-21; **D-03, D-04, D-06**.
- **Selesai bila:** pengguna A tidak bisa membaca `profil_pembeli` pengguna B (kecuali data publik yang diizinkan); peran admin tidak bisa diisi sendiri oleh pengguna; `pembeli belum terverifikasi` tidak bisa menyisipkan `pesanan` (diuji di T3.13).
- **Prasyarat:** T3.01.

### [ ] T3.03 Migrasi: komoditas, metode, resep **[DEMO]**
- **Tujuan:** `komoditas`, `metode_tanam`, `konversi_satuan`, `resep_tanam` (versi, validator, tanggal validasi, hasil per satuan ukuran, standar kualitas), `resep_input`, `resep_tugas` (tipe, HST mulai/selesai, interval, besaran ukur, batas, saran, boleh digeser, saran terlambat). RLS: petani tidak membaca resep `draf` yang bukan contoh; mentor/admin menulis. Kolom `status` (`draf` | `divalidasi`) dan `contoh` (boolean); RLS: petani membaca resep `divalidasi` dan resep `contoh`; penyaringan resep `contoh` dilakukan di frontend menurut `VITE_TAMPILKAN_RESEP_CONTOH` (D-12), dan seed produksi tidak memuat resep contoh.
- **Berkas:** `supabase/migrations/0003_resep.sql`.
- **PRD:** P0-03, P0-04, P0-30, P0-32, P0-33, P2-04, P2-09.
- **Selesai bila:** resep `draf` tanpa `contoh` tidak terlihat oleh petani (diuji); resep `contoh` terlihat hanya bila konfigurasi aktif (diuji); satu komoditas bisa punya satu resep per metode; metode berupa data.
- **Prasyarat:** T3.02.

### [ ] T3.04 Migrasi: input, merek, harga, promo **[DEMO]**
- **Tujuan:** `input_pertanian` (kategori enum sesuai PRD), `kelayakan_subsidi`, `merek_input` (nomor pendaftaran), `laporan_harga`, `promo`; RLS (baca terbuka untuk pengguna masuk, tulis laporan oleh pengguna sendiri, promo dikelola admin); tampilan `harga_rata_sekitar` per kecamatan.
- **Berkas:** `supabase/migrations/0004_input_merek.sql`.
- **PRD:** P0-09, P0-34, P0-35, P1-02, P2-07.
- **Selesai bila:** laporan harga memuat kecamatan dan tanggal; tabel `promo` tidak dipakai oleh tampilan urutan merek (diuji dengan kueri); harga negatif ditolak oleh batasan `CHECK`.
- **Prasyarat:** T3.03.

### [ ] T3.05 Migrasi: modul belajar dan permintaan resep **[DEMO]**
- **Tujuan:** `modul`, `progres_modul`, `permintaan_resep` + RLS; Storage bucket `video-modul` (baca publik terbatas) dan unggah video oleh mentor.
- **Berkas:** `supabase/migrations/0005_belajar.sql`.
- **PRD:** P0-05, P0-31, US-31.
- **Selesai bila:** satu pengguna hanya punya satu permintaan per komoditas dan metode per desa (kunci unik); `progres_modul` hanya terbaca oleh pemiliknya.
- **Prasyarat:** T3.03.

### [ ] T3.06 Migrasi: siklus tanam, rencana, tugas, pengukuran **[DEMO]**
- **Tujuan:** `siklus_tanam` (resep_id versi, metode, ukuran + satuan asli, sistem hidroponik, susunan vertikultur, tanggal tanam, dapat subsidi, harga jual, perkiraan panen, alokasi pesanan), `rencana_item` (asal resep/tambahan, alat sekali beli, jumlah siklus pembagian), `tugas`, `hasil_pengukuran` (sumber manual/sensor), `pengeluaran`, `pengaturan_pengingat`, `langganan_notifikasi`; Storage bucket `foto-jurnal` privat; RLS pemilik siklus. `siklus_tanam.lahan_id` menunjuk `lahan`, dengan `siklus_tanam.luas_m2` untuk lahan tanah dan `siklus_tanam.jumlah_lubang` untuk hidroponik; satu lahan boleh punya beberapa siklus aktif (D-06, D-15).
- **Berkas:** `supabase/migrations/0006_siklus.sql`.
- **PRD:** P0-11, P0-12, P0-14, P0-18, P0-37, P0-38, P2-06, P2-08.
- **Selesai bila:** petani A tidak bisa membaca siklus petani B (diuji); tidak ada kolom status terlambat; `tugas` menyimpan foto dengan tanggal dan nama tugas (P2-03).
- **Prasyarat:** T3.03.

### [ ] T3.06a Migrasi: wilayah, lahan, kelompok tani **[DEMO]**
- **Tujuan:** Tabel `wilayah` (desa, kecamatan, kabupaten, koordinat titik tengah desa), `lahan` (petani, nama lahan, jenis lahan, `luas_m2`, `satuan_asli`, `nilai_asli`, desa, titik koordinat, `kapasitas_lubang`), `kelompok_tani` dan `anggota_kelompok_tani` (tanpa tampilan sampai P1). RLS: lahan hanya dibaca pemiliknya dan admin; **pembeli tidak pernah bisa membaca titik lahan**; `wilayah` terbaca semua pengguna masuk.
- **Berkas:** `supabase/migrations/0006a_wilayah_lahan.sql`.
- **PRD:** P0-01, P0-20, P0-21; **D-06**.
- **Selesai bila:** petani B tidak membaca lahan petani A; pembeli tidak bisa membaca titik lahan (diuji); tabel kelompok tani ada tanpa tampilan.
- **Prasyarat:** T3.02.

### [ ] T3.07 Migrasi: marketplace **[DEMO]**
- **Tujuan:** `pesanan` (jenis rutin/sekali panen, titik antar `geography(Point)`, status), `alokasi_pesanan`, `pembayaran` (jenis uang muka/kiriman/biaya layanan, status ditahan/cair/dikembalikan, referensi gateway), `pengiriman` (termasuk berat ditolak dan alasan), `rating`; fungsi `pesanan_terdekat(lat, lng, radius_km)` dengan PostGIS; RLS (pembeli terverifikasi memasang pesanan; petani melihat pesanan dalam radius; pihak terkait membaca pembayaran). **D-06**: `pengiriman` memuat `alasan_penolakan` (enum `layu_atau_busuk`, `jumlah_kurang`, `tidak_sesuai_standar`, `lainnya`), `keterangan_penolakan` (wajib bila `lainnya`, dengan CHECK; D-14), `jumlah_ditolak`, `foto_penolakan`; tabel **`sengketa`** (pengiriman, status, keputusan admin, catatan, waktu). `pesanan_terdekat` menghitung jarak dari **titik tengah desa petani** dan hanya mengembalikan nama desa dan jarak. Batas periksa dan persen dari tabel konfigurasi (D-01, D-02).
- **Berkas:** `supabase/migrations/0007_marketplace.sql`.
- **PRD:** P0-19–P0-28, P2-05.
- **Selesai bila:** `pesanan_terdekat` mengurutkan dari yang terdekat (diuji dengan 3 titik); pembeli belum terverifikasi ditolak saat menyisipkan pesanan; data pembayaran tidak bisa diubah langsung oleh klien (hanya Edge Function).
- **Prasyarat:** T3.02, T3.03, T3.06a.

### [ ] T3.08 Fungsi basis data: ambil pesanan dan batas alokasi **[DEMO]**
- **Tujuan:** RPC `ambil_pesanan(pesanan_id, jumlah, siklus_baru)` dalam satu transaksi: periksa total alokasi ≤ pesanan, buat `alokasi_pesanan`, `siklus_tanam` (harga kesepakatan), `rencana_item` dari resep. Batasan atau pemicu mencegah total alokasi melebihi pesanan. Menolak bila `status_akun` petani `dinonaktifkan_sementara` (D-03) dan bila kapasitas lahan tidak cukup.
- **Berkas:** `supabase/migrations/0008_fungsi_pesanan.sql`.
- **PRD:** P0-21, US-12.
- **Selesai bila:** dua pemanggilan bersamaan tidak melampaui total pesanan (uji dua koneksi); gagal → tidak ada baris setengah jadi.
- **Prasyarat:** T3.06, T3.07.

### [ ] T3.09 Seed A: komoditas, metode, satuan, input, merek, subsidi, promo **[DEMO]**
- **Tujuan:** Data contoh dari desain: 10 komoditas (4 berresep), 4 metode, konversi ru 14 m² untuk wilayah demo, input pertanian dan merek, laporan harga, kelayakan subsidi (urea, NPK), promo toko tani. Ditambah seed `wilayah` (desa demo di Lembang dan sekitarnya) dan konfigurasi bisnis (uang muka 20, layanan 5, batas periksa rutin 6 jam, sekali panen 24 jam, batas kabar 3 hari, radius 10 km, kontak admin untuk akun nonaktif D-13). Resep contoh hanya di seed demo, tidak di seed produksi (D-12).
- **Berkas:** `supabase/seed/01_referensi.sql`.
- **PRD:** P0-30, P0-34, P0-35; data seperti `ringkasan-desain.md` bagian 5.
- **Selesai bila:** `db:reset` memuat tanpa galat; setiap baris contoh diberi kolom/komentar `contoh`; tidak ada nama pengguna asli.
- **Prasyarat:** T3.04, T2.01.

### [ ] T3.10 Seed B: resep sawi bedengan **[DEMO]**
- **Tujuan:** Resep sawi bedengan (input dengan dosis, dasar dosis, kemasan; tugas: pupuk 1 HST 7, pupuk 2 HST 14, cek hama HST 20, siangi rumput HST 11, siram setiap hari, cek daun berlubang setiap 3 hari, panen HST 28; hasil 1,5 kg/m²; standar kualitas). Status `draf`, `contoh = true`, label "CONTOH, belum divalidasi penyuluh" (D-10, D-11).
- **Berkas:** `supabase/seed/02_resep_sawi_bedengan.sql`.
- **PRD:** P0-03, P0-12.
- **Selesai bila:** kalkulator T2.05 dengan data seed menghasilkan total yang sama dengan fixture T2.01 (tes konsistensi); validator kosong, label contoh di setiap resep.
- **Prasyarat:** T3.09.

### [ ] T3.11 Seed C: resep sawi hidroponik, bayam, kangkung, padi **[DEMO]**
- **Tujuan:** Resep sawi hidroponik NFT (alat sekali beli, nutrisi per liter, tugas ukur pH/PPM tiap 2 hari dengan rentang dan saran, ganti larutan HST 21, pindah tanam HST 10), bayam dan kangkung bedengan, padi sawah (pupuk 1 HST 14, pupuk 2 HST 35, cek hama HST 55, panen HST 110, subsidi urea dan NPK). Semua `draf`, `contoh = true`. **Resep hidroponik hanya sawi (D-05)**: bayam dan kangkung tidak punya resep hidroponik.
- **Berkas:** `supabase/seed/03_resep_hidroponik_padi.sql`, `supabase/seed/04_resep_bayam_kangkung.sql`.
- **PRD:** P0-03, P0-36, P0-37.
- **Selesai bila:** resep sawi hidroponik memuat rentang pH 5,5–6,5 dan PPM 1.050–1.400 berlabel contoh; bayam dan kangkung hanya bedengan; metode hidroponik bayam/kangkung tampil "Segera hadir".
- **Prasyarat:** T3.10.

### [ ] T3.12 Seed D: modul belajar, pesanan, pengguna demo **[DEMO]**
- **Tujuan:** 6 modul per resep (bedengan, hidroponik sawi, sawah) dengan judul dan menit seperti papan 08 dan 09, video placeholder; pesanan contoh **hanya komoditas berresep** (Katering Bu Ratna, Warung Nasi Bu Imas, Kafe Daun Pagi, Koperasi Sumber Rejeki, Katering Sehat Lestari); pengguna demo fiktif (petani Arif dengan satu atau dua `lahan`, pembeli terverifikasi, mentor, admin) dengan nomor uji Supabase.
- **Berkas:** `supabase/seed/05_belajar.sql`, `supabase/seed/06_pesanan_demo.sql`, `supabase/seed/07_pengguna_demo.sql`.
- **PRD:** P0-05, P0-19, P0-20.
- **Selesai bila:** `pesanan_terdekat` untuk petani demo mengembalikan pesanan dalam 10 km terurut seperti papan 29 mobile; pengguna demo bisa masuk dengan OTP uji (lihat T4.34).
- **Prasyarat:** T3.07, T3.11.

### [ ] T3.13 Tes RLS dan integritas
- **Tujuan:** Skrip pengujian basis data.
- **Berkas:** `supabase/tests/rls.test.sql` atau `scripts/uji-rls.mjs`.
- **PRD:** P0-02, P0-03, P0-21.
- **Selesai bila:** otomatis membuktikan: petani A ≠ B; resep belum divalidasi tak terlihat; pembeli belum terverifikasi tak bisa memasang pesanan; alokasi tak melebihi pesanan; klien tak bisa menulis `pembayaran`; skrip dijalankan di `npm run db:uji`. Juga: pembeli tidak bisa membaca titik `lahan`; seed produksi tidak memuat resep `contoh`; `alasan_penolakan = lainnya` tanpa keterangan ditolak; petani `dinonaktifkan_sementara` tidak bisa memanggil `ambil_pesanan`.
- **Prasyarat:** T3.08, T3.12.

### [ ] T3.14 Lapisan data frontend (query dan pemetaan)
- **Tujuan:** Hook TanStack Query untuk membaca referensi dan resep, pemetaan baris database → tipe domain `src/tipe` (fungsi murni di `src/lib/peta-data.ts` + tes), kunci query seragam.
- **Berkas:** `src/data/kueri/*.ts`, `src/data/query-provider.tsx`, `src/lib/peta-data.ts` + `.test.ts`, tipe hasil generate `src/data/database.types.ts`.
- **PRD:** –
- **Selesai bila:** hook `useKomoditas`, `useResep(komoditasId, metodeId)`, `useMerek(inputId)` mengembalikan data seed; resep `contoh` disaring keluar bila `VITE_TAMPILKAN_RESEP_CONTOH` mati (D-12, diuji); pemetaan teruji; tidak ada panggilan Supabase di komponen UI.
- **Prasyarat:** T3.12, T2.01.

---

# Tahap 4. Halaman per pilar

Setiap tugas halaman: dibuat di **390px dan 1440px**, dibandingkan dengan papan yang disebut, teks di `src/teks/`, hanya komponen Tahap 1, logika dari `src/lib`. "Turunan" = desain belum ada, dibuat dari pola yang ada (K6).

## 4A. Dasar akses data sementara

### [ ] T4.01 Sesi pengembangan dan penjaga rute **[DEMO]**
- **Tujuan:** Penyedia sesi (`useSesi`) dan penjaga rute berdasarkan peran, sehingga halaman bisa dikerjakan sebelum halaman Masuk selesai. Di mode pengembangan masuk otomatis sebagai pengguna demo dari seed; di produksi mode ini mati.
- **Berkas:** `src/data/sesi.tsx`, `src/data/penjaga-rute.tsx`, `.env.example` (`VITE_AKUN_DEMO_*` hanya untuk pengembangan, tidak pernah diisi di produksi), tes `PenjagaRute`.
- **PRD:** P0-01.
- **Selesai bila:** rute petani menolak pembeli dan sebaliknya; rute tanpa sesi mengarah ke `/masuk`; produksi tidak memuat akun demo (dicek di `build`).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/43-pilih-akun-demo-mobile.png` (390px) dan `43-pilih-akun-demo-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T3.12, T1.15.

## 4B. Pilar Hitung

### [ ] T4.02 Langkah 1: Mau tanam apa? **[DEMO]**
- **Tujuan:** Pilih jenis lahan (Semua/Sawah/Kebun/Pekarangan), cari, daftar per kategori dengan umur panen, jumlah pesanan di sekitar, label "Ada pesanan"/"Segera hadir"; ringkasan pilihan + tombol "Lanjut pilih metode".
- **Berkas:** `src/halaman/hitung/pilih-tanaman.tsx`, `src/teks/hitung.ts`, `src/data/kueri/komoditas.ts`.
- **PRD:** P0-30, US-22, US-23; **D-05** (bayam dan kangkung hidroponik "Segera hadir").
- **Selesai bila:** papan 10 (desktop dengan menu profil terbuka) cocok; filter lahan hanya menampilkan yang cocok; komoditas tanpa resep tetap bisa diketuk; hasil pencarian kosong menampilkan "Tanaman ini belum ada di daftar" dengan "Minta tanaman baru".
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/10-hitung-pilih-tanaman-mobile.png` (390px) dan `10-hitung-pilih-tanaman-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T3.14, T4.01, T1.11, T1.15.

### [ ] T4.03 Segera hadir dan Minta resep **[DEMO]**
- **Tujuan:** Sheet (HP) / dialog (desktop) untuk komoditas tanpa resep; "Minta resep ini" menulis `permintaan_resep`; pesan "Permintaanmu tercatat. Kami kabari saat resepnya siap."; mencegah permintaan ganda.
- **Berkas:** `src/halaman/hitung/segera-hadir.tsx`, `src/data/kueri/permintaanResep.ts`.
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
- **Berkas:** `src/halaman/hitung/kalkulator.tsx`, `src/halaman/hitung/baris-item.tsx`, `src/halaman/hitung/useRencana.ts` (keadaan rencana di memori, memakai `src/lib/modal`, `kebutuhan`).
- **PRD:** P0-07, P0-08, US-03, US-04.
- **Selesai bila:** papan 16 (sawi bedengan 100 m²) dan 19 (padi) cocok; ubah jumlah memperbarui subtotal dan total sama dengan hasil `modal.ts`; item tanpa harga ditandai dan ringkasan memberi peringatan; catatan "Semua harga di halaman ini adalah contoh…" tampil; label "CONTOH, belum divalidasi penyuluh" terlihat di setiap bagian yang memuat angka resep, termasuk lembar dan panel (D-12).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/16-hitung-modal-sawi-bedengan-mobile.png` (390px) dan `16-hitung-modal-sawi-bedengan-desktop.png` (1440px) (juga nomor 19), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.04, T2.05, T1.08.

### [ ] T4.06 Subsidi, pilih merek, merek lain, promo **[DEMO]**
- **Tujuan:** Pilihan Subsidi/Nonsubsidi per item yang memenuhi syarat dengan catatan "Subsidi hanya untuk petani yang terdaftar di kelompok tani."; lembar "Pilih merek" (harga per kemasan, per satuan, jumlah pelapor, hari lalu), "Merek lain, isi sendiri" yang membuat laporan harga baru; tips pembelian di kios resmi; bagian "Promo dari toko tani" terpisah dengan label "Promo".
- **Berkas:** `src/halaman/hitung/lembar-merek.tsx`, `src/halaman/hitung/bagian-promo.tsx`, `src/halaman/hitung/pilihan-subsidi.tsx`, `src/data/kueri/laporanHarga.ts`.
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
- **Berkas:** `src/halaman/hitung/pilih-tanggal-tanam.tsx`, `src/data/kueri/siklus.ts` (mutasi), `src/lib/rencana-ke-baris.ts` + tes (pemetaan rencana → baris `rencana_item`).
- **PRD:** P0-11, P0-12, P0-04 (siklus menyimpan versi resep), US-07.
- **Selesai bila:** setelah simpan, `siklus_tanam.resep_id` = versi resep terpakai; jumlah `tugas` sama dengan `buatJadwal`; mengubah resep di database tidak mengubah siklus lama (diuji); waktu dari rencana sampai simpan terukur (tujuan < 5 menit, P0 tujuan pengguna 1) di catatan demo.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/41-pilih-tanggal-tanam-mobile.png` (390px) dan `41-pilih-tanggal-tanam-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.07, T2.08, T3.06.

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
- **Berkas:** `src/halaman/kebun/jadwal.tsx`, `src/halaman/kebun/kerangka-siklus.tsx`, `src/data/kueri/tugas.ts`.
- **PRD:** P0-12, US-07.
- **Selesai bila:** papan 20 dan 21 cocok; ikon tipe berbeda di semua daftar; filter "Pengukuran" di siklus bedengan menampilkan pesan papan 20 mobile; pengelompokan = `kelompokkanPerHari`; label "CONTOH, belum divalidasi penyuluh" terlihat di jadwal dan detail tugas bila resepnya contoh (D-12).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/20-jadwal-sawi-bedengan-mobile.png` (390px) dan `20-jadwal-sawi-bedengan-desktop.png` (1440px) (juga nomor 21), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.08, T2.09, T1.10.

### [ ] T4.11 Detail tugas, tandai selesai, foto, tunda **[DEMO]**
- **Tujuan:** Detail tugas (chip waktu, banner saran terlambat dari resep, cara mengerjakan, foto bukti, tunda 1–3 hari dengan tanggal baru), "Tandai selesai"; foto opsional ke Storage dan masuk jurnal; konfirmasi bila tunda melewati panen (turunan); tugas berulang dan sekali (turunan tampilan non-terlambat).
- **Berkas:** `src/halaman/kebun/detail-tugas.tsx`, `src/komponen/ambil-foto.tsx` (kamera/galeri, kecilkan sisi klien), `src/lib/kecilkan-foto.ts` + tes (hitung ukuran target), `src/data/kueri/tugasMutasi.ts`.
- **PRD:** P0-14, P0-15, P0-16, US-08.
- **Selesai bila:** papan 22 cocok; tunda menggeser tugas sejenis lewat `tundaTugas`; foto masuk jurnal dengan tanggal dan nama tugas; tugas terlambat tetap bisa ditandai selesai.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/22-detail-tugas-mobile.png` (390px) dan `22-detail-tugas-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.10, T3.06, T1.12.

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
- **Berkas:** `src/halaman/kebun/pengingat.tsx`, `src/data/kueri/pengingat.ts`.
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
- **Selesai bila:** papan 28 cocok (desktop diturunkan); pengelompokan minggu teruji (hari ke-0 di minggu 1, hari ke-7 di minggu 2); foto berasal dari bucket privat dengan tautan bertanda tangan.
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
- **Berkas:** `src/halaman/pesanan/sekitar.tsx`, `src/data/kueri/pesanan.ts`.
- **PRD:** P0-19 (penanda dan filter), P0-20, US-11.
- **Selesai bila:** papan 29 dan 30 cocok; daftar dari `pesanan_terdekat`; urutan sama dengan `jarak.ts`; radius dan batas bukan angka tetap; petani `dinonaktifkan_sementara` tetap melihat daftar (D-13).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/29-pesanan-di-sekitar-mobile.png` (390px) dan `29-pesanan-di-sekitar-desktop.png` (1440px) (juga nomor 30), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T3.14, T2.15, T1.15.

### [ ] T4.19 Detail pesanan dan ambil sebagian **[DEMO]**
- **Tujuan:** Rincian pesanan, "Mau ambil berapa?" (pilihan jumlah), cek lahan (cukup/tidak, jumlah maksimal disarankan), saran tanam bertahap, "Uang yang kamu terima"; tombol "Ambil" nonaktif bila lahan tidak cukup; status uang muka "Uang muka diterima" sebelum diminta menanam. **Kapasitas lahan dari tabel `lahan` lewat `kapasitas-lahan.ts` (D-06, D-08).** Petani memilih lahan; bila belum punya lahan diarahkan ke "Lahan saya" (T4.36a).
- **Berkas:** `src/halaman/pesanan/detail-pesanan.tsx`, `src/data/kueri/alokasi.ts`.
- **PRD:** P0-21, P0-23 (status uang muka), US-12, US-13.
- **Selesai bila:** papan 31 cocok (desktop diturunkan); semua angka dari `pesanan-lahan.ts` dan `pesanan-nilai.ts`; total alokasi tidak melebihi pesanan (galat jelas bila bentrok); mengambil memanggil `ambil_pesanan` dan membuat siklus dengan harga kesepakatan; untuk petani `dinonaktifkan_sementara` tombol "Ambil pesanan" diganti penjelasan singkat dan cara menghubungi admin dari konfigurasi (D-13).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/31-detail-pesanan-mobile.png` (390px) dan `31-detail-pesanan-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.18, T2.12, T2.13, T2.15a, T3.08, T4.36a.

### [ ] T4.20 Kesepakatan digital **[DEMO]**
- **Tujuan:** Ringkasan (pembeli, jumlah, jadwal, titik antar, harga), standar kualitas, aturan gagal panen, uang dan pembayaran, pernyataan, tombol "Setuju" / "Tanya pembeli dulu"; menyimpan waktu setuju di `alokasi_pesanan`.
- **Berkas:** `src/halaman/pesanan/kesepakatan.tsx`.
- **PRD:** P0-22.
- **Selesai bila:** papan 32 cocok (desktop diturunkan); aturan gagal panen memakai D-03: "Kabari paling lambat 3 hari sebelum jadwal kirim. Bagian yang tidak terpenuhi ditawarkan ke petani lain; kalau tidak ada pengganti, sisa uang muka bagian itu dikembalikan ke pembeli."; **tanpa denda**; angka hari dari konfigurasi; setelah setuju jadwal masuk ke kebun.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/32-kesepakatan-mobile.png` (390px) dan `32-kesepakatan-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.19.

### [ ] T4.21 Kiriman saya dan foto kualitas **[DEMO]**
- **Tujuan:** Kiriman hari ini dengan tahap uang (Uang muka ditahan → Menunggu konfirmasi → Dana cair), unggah foto kualitas sebelum kirim, daftar berikutnya dan sebelumnya (termasuk sebagian ditolak).
- **Berkas:** `src/halaman/pesanan/kiriman-saya.tsx`, `src/data/kueri/pengiriman.ts`.
- **PRD:** P0-25, US-14.
- **Selesai bila:** papan 33 cocok (desktop diturunkan); tidak bisa menandai "dikirim" tanpa foto kualitas; chip uang memakai `ChipStatus`.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/33-kiriman-saya-mobile.png` (390px) dan `33-kiriman-saya-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.19, T4.11 (komponen foto).

## 4E. Pilar Jual (pembeli)

### [ ] T4.22 Dasbor pesanan aktif pembeli **[DEMO]**
- **Tujuan:** Header pembeli, banner kiriman tiba, daftar pesanan dengan kebun pemenuh (penggaris `lebar`), kiriman berikutnya, ringkasan uang (ditahan, sudah cair), "5 kg … belum ada petani" dengan "Ubah tawaran".
- **Berkas:** `src/halaman/pembeli/dasbor.tsx`, `src/data/kueri/pesananPembeli.ts`.
- **PRD:** P0-24, US-16, US-18 (tombol pesan lagi tersedia setelah kiriman, ditambahkan di T4.26).
- **Selesai bila:** papan 36 cocok; pembeli hanya melihat **nama desa dan jarak** kebun, tidak pernah titik lahan (D-06); HP 390px diturunkan (D-07); pembeli tidak bisa melihat pesanan pembeli lain (RLS); penggaris menampilkan progres tiap kebun.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/36-dasbor-pesanan-pembeli-mobile.png` (390px) dan `36-dasbor-pesanan-pembeli-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.01, T1.14, T1.15, T3.12.

### [ ] T4.23 Buat pesanan rutin **[DEMO]**
- **Tujuan:** Form komoditas (hanya yang punya resep), jumlah, hari kirim, frekuensi, durasi (maks 3 bulan), harga per kg dengan petunjuk harga sekitar, standar kualitas + tambah syarat, titik antar (alamat + patokan + titik peta), ringkasan biaya (nilai pesanan, uang muka, biaya layanan, dibayar sekarang, per kiriman).
- **Berkas:** `src/halaman/pembeli/buat-pesanan.tsx`, `src/data/kueri/pesananMutasi.ts`.
- **PRD:** P0-19, P0-02 (hanya pembeli terverifikasi), US-15.
- **Selesai bila:** papan 37 cocok; komoditas tanpa resep tidak bisa dipilih (beda dengan papan yang menampilkan Selada/Pakcoy; PRD berlaku, lihat RINGKASAN 3.3 #6); biaya dari `pesanan-nilai.ts`; pembeli belum terverifikasi: tombol nonaktif + penjelasan (T4.28).
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
- **Selesai bila:** papan 38 cocok; HP diturunkan; angka dari `kiriman.ts`; alasan penolakan memakai empat pilihan D-06 + foto penolakan; "Lainnya" wajib diisi keterangan, tanpa keterangan muncul galat "Tulis alasannya dulu" (D-14); batas periksa sesuai jenis pesanan (D-01); penolakan sebagian membuat baris `sengketa`; setelah konfirmasi status berubah (T5.09).
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
- **Berkas:** `src/halaman/pesanan/lapor-gagal.tsx`, tambahan `src/lib/kiriman.ts`, Edge Function di T5.10.
- **PRD:** P0-27.
- **Selesai bila:** aturan dari `kiriman.ts` (T2.14), **tanpa denda**; lewat batas 3 hari, kabar tetap bisa dikirim tetapi menghasilkan catatan profil; status pembayaran `dikembalikan` pada kasus tanpa pengganti.
- **Prasyarat:** T4.21, T2.14.

### [ ] T4.28 Daftar pembeli dan verifikasi (turunan)
- **Tujuan:** Setelah memilih peran pembeli: nama usaha, jenis usaha, alamat, foto tempat usaha, status verifikasi tampil jelas; pembeli belum terverifikasi bisa melihat aplikasi tetapi tidak bisa memasang pesanan.
- **Berkas:** `src/halaman/pembeli/daftar-pembeli.tsx`, `src/halaman/pembeli/status-verifikasi.tsx`.
- **PRD:** P0-02, US-21.
- **Selesai bila:** status "Menunggu verifikasi / Terverifikasi / Ditolak" dengan ikon dan kata; RLS menolak pesanan dari yang belum terverifikasi.
- **Prasyarat:** T4.22, T3.02.

### [ ] T4.29 Panel admin minimal: verifikasi dan sengketa (turunan)
- **Tujuan:** Admin menyetujui/menolak pembeli, melihat antrean sengketa (foto, alasan, keputusan), melihat **catatan petani**, dan **menonaktifkan sementara / mengaktifkan kembali** petani (D-03). **Desktop saja, tabel sederhana (D-07).**
- **Berkas:** `src/halaman/admin/verifikasi-pembeli.tsx`, `src/halaman/admin/sengketa.tsx`.
- **PRD:** P0-02, P0-25, US-21.
- **Selesai bila:** hanya peran admin yang bisa membuka (rute dan RLS); keputusan sengketa menentukan pencairan sisa bagian.
- **Prasyarat:** T4.25, T4.28.

## 4F. Pilar Belajar

### [ ] T4.30 Daftar modul belajar **[DEMO]**
- **Tujuan:** Pilih tanaman dan cara tanam, kemajuan "n dari 6 modul selesai", "Lanjutkan: …", baris modul (selesai, sedang, tersimpan offline, belum), tombol unduh.
- **Berkas:** `src/halaman/belajar.tsx`, `src/data/kueri/modul.ts`.
- **PRD:** P0-05, US-01, US-02.
- **Selesai bila:** papan 08 dan 09 cocok; progres dari `belajar.ts`; modul yang sudah ditonton diberi tanda; tautan dari tugas hari ini membuka modul tahap berjalan (P0-06). Hidroponik hanya muncul untuk sawi (D-05).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/08-belajar-hidroponik-mobile.png` (390px) dan `08-belajar-hidroponik-desktop.png` (1440px) (juga nomor 09), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T3.14, T2.16, T1.15.

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
- **Tujuan:** Nomor HP → kirim OTP → 6 digit → sesi; hitung mundur kirim ulang; galat jelas; **tanpa kata sandi (D-04)**; semua lewat antarmuka `PenyediaOtp` dengan implementasi nomor uji Supabase (D-10); menggantikan sesi sementara (T4.01).
- **Berkas:** `src/halaman/masuk.tsx`, `src/penyedia/otp/PenyediaOtp.ts` (antarmuka), `src/penyedia/otp/otpSupabase.ts`, `src/data/auth.ts`, `src/lib/nomor-hp.ts` + `.test.ts` (normalisasi 0812…/+62812…), `supabase/config.toml` (nomor uji).
- **PRD:** P0-01.
- **Selesai bila:** papan 02 cocok; halaman hanya memakai `PenyediaOtp`; nomor tidak valid ditolak dengan pesan; sesi bertahan setelah muat ulang; mengganti penyedia SMS tidak mengubah halaman.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/02-masuk-mobile.png` (390px) dan `02-masuk-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.01, T1.16, T3.12.

### [ ] T4.34 Pilih peran dan desa (turunan) **[DEMO]**
- **Tujuan:** Setelah OTP pertama: pilih peran (petani/pembeli/mentor), petani wajib mengisi desa lokasi lahan (dengan pencarian desa dan koordinat setingkat desa); pembeli lanjut ke T4.28.
- **Berkas:** `src/halaman/pilih-peran.tsx`, `src/data/kueri/desa.ts`, seed daftar desa demo.
- **PRD:** P0-01.
- **Selesai bila:** petani tanpa desa tidak bisa lanjut ("Isi desa lahanmu dulu"); peran admin tidak bisa dipilih sendiri; lokasi desa tersimpan untuk `pesanan_terdekat`.
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/39-pilih-peran-dan-desa-mobile.png` (390px) dan `39-pilih-peran-dan-desa-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.33, T3.02.

### [ ] T4.35 Profil petani
- **Tujuan:** Profil dengan statistik (rating, siklus selesai, kg terjual), kartu Akun (nama, nomor HP), Kebun (desa, ringkasan dari tabel `lahan`, komoditas), Pengingat, Bantuan, tombol Keluar. **Tanpa kata sandi, nama pengguna, dan kartu kelompok tani (D-04, D-06).**
- **Berkas:** `src/halaman/profil.tsx`, `src/data/kueri/profil.ts`.
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
- **Berkas:** `src/halaman/lahan-saya.tsx`, `src/halaman/lahan/form-lahan.tsx`, `src/data/kueri/lahan.ts`.
- **PRD:** P0-21, P0-33; **D-06**.
- **Selesai bila:** luas disimpan sebagai `luas_m2` + `satuan_asli` + `nilai_asli` lewat `konversi-satuan.ts`; kapasitas tersisa dari `kapasitas-lahan.ts`; titik lahan tidak pernah tampil ke pembeli; 390px (navigasi bawah) dan 1440px (sidebar kiri, dua kolom: daftar dan form).
- **Tangkapan (D-07):** `docs/tangkapan/aplikasi/40-lahan-saya-mobile.png` (390px) dan `40-lahan-saya-desktop.png` (1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.34, T3.06a, T2.15a, T2.02.

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
- **Prasyarat:** T4.34, T3.05.

### [ ] T4.39 Mentor: editor resep dan versi
- **Tujuan:** Membuat/mengubah resep (input, dosis, dasar dosis, kemasan, tugas, rentang ukur, saran), versi baru saat ubah, tandai divalidasi (validator + tanggal).
- **Berkas:** `src/halaman/mentor/editor-resep.tsx`, `src/lib/validasi-resep.ts` + `.test.ts` (HST valid, interval > 0, batas bawah ≤ batas atas).
- **PRD:** P0-03, P0-04, US-19.
- **Selesai bila:** siklus berjalan tetap memakai versi lama (diuji); resep belum divalidasi tidak terlihat petani; validasi menolak data tidak masuk akal. **Desktop saja, tabel sederhana (D-07).**
- **Prasyarat:** T4.38, T3.03.

## 4I. Pemeriksaan akhir tahap

### [ ] T4.40 Uji responsif dan perbandingan desain menyeluruh **[DEMO]**
- **Tujuan:** Satu putaran memeriksa semua halaman di 390, 768, 1280, 1440 terhadap papan; perbaiki selisih.
- **Berkas:** `docs/cek-halaman.md` (tabel: papan NN, status, catatan), perbaikan di berkas terkait.
- **PRD:** –
- **Selesai bila:** setiap file papan di `design/README.md` (64 file, 39 halaman) punya baris dengan status "sama" atau alasan perbedaan; tidak ada gulir horizontal; tidak ada teks di bawah 16px; lint aturan hijau.
- **Tangkapan (D-07):** semua file di `docs/tangkapan/aplikasi/` diambil ulang (390px dan 1440px), ditunjukkan ke pemilik produk; **berhenti menunggu tanggapan** sebelum tugas berikutnya.
- **Prasyarat:** T4.02–T4.37 (yang bertanda DEMO minimal).

---

# Tahap 5. Offline, notifikasi web push, pembayaran uji coba

### [ ] T5.01 PWA: manifest, service worker, instal **[DEMO]**
- **Tujuan:** `vite-plugin-pwa` dengan manifest (nama, ikon, warna dari token), precache cangkang aplikasi, halaman offline cadangan, petunjuk tambah ke layar utama (untuk iPhone).
- **Berkas:** `vite.config.ts`, `public/ikon/*`, `src/pwa/daftarSw.ts`, `src/komponen/petunjuk-instal.tsx`.
- **PRD:** P0-29, P0-13 (syarat), Dependensi PWA.
- **Selesai bila:** Lighthouse PWA terpasang; aplikasi terbuka saat offline setelah kunjungan pertama; ikon dan `theme_color` memakai nilai token (disalin dari konfigurasi, bukan hex baru).
- **Prasyarat:** T4.40.

### [ ] T5.02 Skema Dexie dan cache data offline **[DEMO]**
- **Tujuan:** Dexie menyimpan siklus, rencana, tugas, modul, hasil pengukuran, pengaturan; TanStack Query dipersist; bacaan tanpa sinyal diambil dari Dexie.
- **Berkas:** `src/data/offline/db.ts`, `src/data/offline/persist.ts`, `src/lib/versi-skema.ts` + tes (migrasi skema).
- **PRD:** P0-29, US-10.
- **Selesai bila:** jadwal, checklist, rencana modal terbuka dengan jaringan dimatikan (cek manual di DevTools); data lama tidak rusak saat skema naik versi.
- **Prasyarat:** T5.01.

### [ ] T5.03 Antrean tulis offline dan sinkron **[DEMO]**
- **Tujuan:** Menandai selesai, tunda, hasil pengukuran, pengeluaran, foto yang dilakukan offline masuk antrean Dexie dan terkirim otomatis saat online; penyelesaian konflik sederhana; banner offline dengan jumlah tertunda.
- **Berkas:** `src/data/offline/antrean.ts`, `src/lib/antrean.ts` + `.test.ts` (urutan, konflik terakhir menang per tugas, pengulangan dengan jeda), `src/komponen/banner-offline.tsx`.
- **PRD:** P0-29 ("Tugas yang ditandai selesai saat offline otomatis tersinkron").
- **Selesai bila:** skenario uji: offline → centang 2 tugas + ukur pH → online → tersinkron tepat sekali; banner "n catatan tersimpan di HP" sesuai desain; antrean teruji sebagai fungsi murni.
- **Prasyarat:** T5.02, T4.11, T4.12.

### [ ] T5.04 Video modul offline
- **Tujuan:** Unduh video resolusi rendah, simpan (Cache Storage atau IndexedDB), putar tanpa sinyal, tanda "tersimpan offline", hapus unduhan.
- **Berkas:** `src/data/offline/video.ts`, pembaruan `pemutar-video.tsx`, `src/halaman/belajar.tsx`.
- **PRD:** P0-05, P0-29, US-01.
- **Selesai bila:** video yang diunduh terputar dengan jaringan mati; status unduh tampil di daftar modul (papan 08 mobile); penggunaan ruang ditampilkan.
- **Prasyarat:** T5.02, T4.31.

### [ ] T5.05 Web push: langganan dan izin **[DEMO]**
- **Tujuan:** Kunci VAPID, `PushManager.subscribe`, simpan ke `langganan_notifikasi`, alur izin (permintaan yang ramah, bukan langsung), banner "Pengingat di HP-mu mati" bila ditolak.
- **Berkas:** `src/data/push.ts`, `src/komponen/izin-notifikasi.tsx`, `src/sw/push.ts`, `.env.example` (`VITE_VAPID_PUBLIC_KEY`).
- **PRD:** P0-13, US-07.
- **Selesai bila:** langganan tercatat; izin ditolak → banner papan 07 tampil dengan daftar tugas hari ini; kunci privat tidak ada di frontend.
- **Prasyarat:** T5.01, T3.06, T4.09.

### [ ] T5.06 Notifikasi pagi terjadwal (Edge Function) **[DEMO]**
- **Tujuan:** Fungsi terjadwal tiap hari (jam sesuai `pengaturan_pengingat`, bawaan 06.00 WIB) mengirim satu notifikasi berisi semua tugas hari itu memakai logika `src/lib/pengingat.ts` yang sama; membuat tugas "Ukur ulang" yang sudah jatuh tempo ikut masuk.
- **Berkas:** `supabase/functions/notifikasi-pagi/index.ts`, `supabase/functions/_bersama/` (impor `src/lib` melalui peta impor), `supabase/migrations/0009_jadwal_notifikasi.sql` (pg_cron).
- **PRD:** P0-13, P0-38, P2-02 (saluran dipisah).
- **Selesai bila:** pemicu manual mengirim notifikasi uji ke perangkat demo dengan isi sama seperti contoh papan 26 mobile; tipe yang dimatikan tidak dikirim; kunci VAPID privat dan service role hanya sebagai rahasia fungsi.
- **Prasyarat:** T5.05, T2.11.

### [ ] T5.07 Notifikasi lain: resep tersedia dan peristiwa pesanan
- **Tujuan:** Mengabari petani saat resep yang diminta tersedia, serta peristiwa pesanan (uang muka diterima, kiriman tiba).
- **Berkas:** `supabase/functions/notifikasi-peristiwa/index.ts`, pemicu basis data.
- **PRD:** P0-31, P0-23.
- **Selesai bila:** menandai resep `divalidasi` mengirim notifikasi ke semua yang meminta (tepat sekali per pengguna).
- **Prasyarat:** T5.06.

### [ ] T5.08 Pembayaran mode uji coba: Edge Function **[DEMO]**
- **Tujuan:** Antarmuka **`PenyediaPembayaran`** (`tahan`, `cairkan`, `kembalikan`, `status`) dengan implementasi **tiruan** untuk demo yang mensimulasikan menahan, mencairkan, dan mengembalikan dana (D-10). Edge Function memakai antarmuka itu; penyedia sungguhan dipasang nanti. Nominal dihitung di server memakai `pesanan-nilai.ts`.
- **Berkas:** `src/penyedia/pembayaran/PenyediaPembayaran.ts`, `src/penyedia/pembayaran/pembayaranTiruan.ts`, `supabase/functions/pembayaran-buat/index.ts`, `supabase/functions/pembayaran-cair/index.ts`, `supabase/functions/pembayaran-kembali/index.ts`, `supabase/functions/_bersama/penyedia.ts`.
- **PRD:** P0-23, P0-26, P0-27; "Dana pengguna tidak pernah masuk rekening tim".
- **Selesai bila:** semua operasi uang lewat antarmuka; implementasi tiruan ditandai di nama berkas dan label "Mode uji coba" di UI, dimatikan lewat konfigurasi produksi; status ditahan/cair/dikembalikan tercatat di `pembayaran`; klien tidak bisa menulis `pembayaran`; tes antarmuka (tahan lalu cairkan, kembalikan, cairkan melebihi saldo ditolak).
- **Prasyarat:** T3.07, T2.12, T2.14.

### [ ] T5.09 UI pembayaran uang muka dan pencairan **[DEMO]**
- **Tujuan:** Dari "Lanjut bayar Rp150.000" ke lembar bayar sandbox, halaman hasil (berhasil/gagal/menunggu), status "Uang muka diterima" di sisi petani sebelum mulai menanam, tombol konfirmasi kiriman memicu pencairan; halaman Pembayaran dan Riwayat pembeli (turunan). Teks memakai bahasa petani ("Uang muka sudah masuk", D-09).
- **Berkas:** `src/halaman/pembeli/bayar.tsx`, `src/halaman/pembeli/pembayaran.tsx`, `src/halaman/pembeli/riwayat.tsx`, `src/data/kueri/pembayaran.ts`.
- **PRD:** P0-23, P0-26, US-13, US-14.
- **Selesai bila:** alur penuh di sandbox: pesan → bayar → petani melihat "Uang muka diterima" → kirim → konfirmasi → status "Dana cair"; gagal bayar tidak membuat pesanan aktif.
- **Prasyarat:** T5.08, T4.23, T4.25.

### [ ] T5.10 Tugas terjadwal pesanan
- **Tujuan:** Otomatis: kiriman dianggap diterima setelah batas periksa (6 jam rutin, 24 jam sekali panen, D-01); uang muka kembali bila tidak ada petani dalam 7 hari; pengingat pembayaran paling lambat sehari sebelum jadwal kirim; penawaran ulang bagian gagal panen; pencatatan "tidak memberi kabar" ke `catatan_petani` (D-03).
- **Berkas:** `supabase/functions/pesanan-terjadwal/index.ts`, `supabase/migrations/0010_jadwal_pesanan.sql`.
- **PRD:** P0-23, P0-25, P0-27.
- **Selesai bila:** uji dengan jam yang dimajukan (waktu sebagai argumen) membuktikan setiap aturan; angka batas dari konfigurasi.
- **Prasyarat:** T5.08, T4.27.

### [ ] T5.11 Skenario demo end-to-end dan data reset **[DEMO]**
- **Tujuan:** Skrip dan dokumen menjalankan jalur demo dari nol, termasuk reset data, akun uji, dan cadangan bila koneksi gagal.
- **Berkas:** `docs/SKENARIO-DEMO.md`, `scripts/reset-demo.mjs` (hanya lokal/staging), `scripts/uji-demo.mjs` (cek otomatis API utama).
- **PRD:** seluruh siklus P0.
- **Selesai bila:** jalur demo (bagian atas dokumen ini) dijalankan dua kali berturut-turut dari reset tanpa galat, di Android dan iPhone (web push iPhone memerlukan tambah ke layar utama); catatan hasil di dokumen.
- **Prasyarat:** semua tugas [DEMO].

### [ ] T5.12 Deploy dan konfigurasi produksi
- **Tujuan:** Deploy ke Vercel (HTTPS), proyek Supabase produksi, variabel lingkungan, migrasi dan seed, Edge Function.
- **Berkas:** `vercel.json`, `docs/DEPLOY.md`.
- **PRD:** Dependensi (Vercel, HTTPS, Supabase).
- **Selesai bila:** URL publik membuka seluruh jalur demo; hanya `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY` di frontend; tidak ada service role di bundel (dicek dengan pencarian pada hasil `build`).
- **Prasyarat:** T5.11.

---

# Pertanyaan dan hal yang ambigu

Pertanyaan P-3 sampai P-11, P-14, dan P-27 versi pertama **sudah dijawab** di `docs/keputusan.md` (D-01 sampai D-10). Hambatan PRD P-1, P-2, P-3, P-4 tidak lagi menghentikan pekerjaan (D-10).

Pertanyaan P-1 sampai P-5 versi kedua **sudah dijawab** pada 5 Oktober 2026: resep contoh (D-12), akun nonaktif sementara (D-13), alasan penolakan (D-14), lahan dan kapasitas (D-15), titik patah (D-16), serta keputusan teknis Tahap 1 (D-17). Yang tersisa:

## Keputusan teknis dan produk yang masih terbuka

- **P-6. Profil di HP.** Nav bawah hanya 4 menu. Usul: Profil dan Pengaturan notifikasi dibuka dari avatar di kepala halaman HP. Menu "Kebun" membuka siklus aktif (K4).
- **P-7. Data wilayah.** Sumber daftar desa beserta titik tengahnya untuk pilot (BPS/Kemendagri)? Untuk demo saya mengisi beberapa desa di Lembang secara manual.
- **P-8. Siapa yang mengubah konfigurasi bisnis** (persen, batas jam, radius)? Usul: admin saja, lewat Supabase Studio di v1.
- **P-9. Video modul.** Siapa pembuatnya, di mana disimpan, dan batas ukuran unduhan offline? Demo memakai video placeholder.
- **P-10. Persetujuan data** (foto, lokasi lahan, transaksi) masih menunggu pembimbing/ahli hukum. Bucket foto jurnal privat, tampil ke pembeli hanya untuk pesanan terkait.
- **P-11. Zona waktu.** WIB saja untuk pilot (K5)?
- **P-12. iPhone.** Berapa peserta demo yang memakai iPhone (web push butuh tambah ke layar utama)?
- **P-13. Remote git.** Repositori lokal sudah punya commit awal; ke mana di-push (GitHub)?
- **P-14. Pengecekan visual.** Tangkapan layar diambil dengan browser tanpa tampilan (headless). Papan desain asli juga bisa ditangkap untuk perbandingan berdampingan; mohon dicek bila ada yang berbeda.
