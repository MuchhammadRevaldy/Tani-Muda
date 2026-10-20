# Ringkasan Desain Tani Muda

Dokumen ini merangkum isi `design/desain-tani-muda.html` (63 papan + 1 papan sistem desain) sebagai acuan membangun aplikasi. **`docs/keputusan.md` mengalahkan desain dan PRD** jika bertentangan; selain itu desain adalah acuan tampilan. Bagian yang sudah diputuskan ditandai "(D-nn)".

## 0. Cara bahan ini dibaca

- File HTML desain adalah bundle bertingkat: bundle luar berisi 64 papan, tiap papan adalah bundle lagi (HTML + font + React + pustaka komponen `TaniMuda`).
- File desain dibongkar dengan `npm run ekstrak-desain` (`frontend/scripts/ekstrak-desain.mjs`), lalu HTML, CSS, data contoh, dan kode komponen aslinya dibaca langsung. Pengecekan visual dilakukan di halaman `/komponen` dan di tiap tugas halaman dengan tangkapan layar berdampingan.
- **Nomor papan.** "Papan NN" di semua dokumen memakai nomor di [`design/README.md`](../design/README.md): nomor mengikuti urutan alur aplikasi, dan versi mobile serta desktop dari halaman yang sama berbagi nomor. "Papan 03" berarti kedua versi; "papan 03 mobile" berarti satu versi saja. Peta nomor ada di `frontend/scripts/papan-desain.mjs`.
- Hasil ekstraksi ada di `design/extracted/` (bahan kerja, tidak masuk git, bisa dibuat ulang kapan saja):
  - `pages/<nomor>-<nama>-<versi>.html`: templat tiap papan untuk dibaca. `<nama-yang-sama>.assets.json` memetakan id aset ke file di `assets/`.
  - `tampil/<nomor>-<nama>-<versi>.html`: papan mandiri yang bisa dibuka di browser atau ditangkap layar.
  - `assets/`: 4 font woff2 (Plus Jakarta Sans variabel, subset latin, latin-ext, vietnamese, cyrillic-ext) dan skrip. `pustaka-komponen-tani-muda.js` adalah **kode sumber 11 komponen** dan menjadi bahan paling penting.
  - `ikon-sebaris/`: 17 SVG yang tertanam di halaman tetapi **tidak ada** di `design/icons/`, yaitu 3 ikon tipe tugas, 4 ikon metode tanam, dan 10 ilustrasi komoditas.
- Aplikasi dan tes **tidak membaca** `design/extracted/`. Token sudah ada di `tailwind.config.ts`, ikon dan ilustrasi sudah disalin ke `frontend/src/komponen/`, dan fungsi pembanding desain disalin ke dalam tes.
- Papan 00 (`pages/00-sistem-desain-desktop.html`) adalah sistem desain resmi. Semua token di bawah diambil dari sana dan dicocokkan dengan pemakaian nyata di 63 papan lain. Hanya 17 warna hex yang muncul di seluruh desain, dan semuanya ada di daftar token.

---

## 1. Token

> **Sebagian digantikan D-59 (13 Oktober 2026, tema baru):** nilai warna, huruf (Outfit), radius kartu dan tombol, bayangan, dan tinggi kontrol yang berlaku ada di `frontend/tailwind.config.ts` dan `keputusan.md` D-59. Tabel di bawah mencatat desain awal.

### 1.1 Warna (17 token)

Prinsip dari desain: hijau daun hanya untuk yang tumbuh atau harus dikerjakan; cokelat tanah hanya untuk uang dan panen; arti status **selalu** dibawa juga oleh ikon dan kata, bukan warna saja; hanya mode terang.

| Nama token | Hex | Pemakaian |
| --- | --- | --- |
| `daun-tua` | `#1E6B45` | Tombol utama, progres, navigasi aktif, cincin fokus, bagian penggaris yang sudah dilalui |
| `daun-tekan` | `#16573A` | Tombol utama saat ditekan atau di-hover, tautan hover |
| `daun-lembut` | `#E3F0E5` | Chip selesai, menu aktif, kartu pilihan terpilih, kartu tawaran |
| `embun-pagi` | `#F3F7EF` | Latar aplikasi |
| `putih` | `#FFFFFF` | Kartu, formulir, nav |
| `tanah` | `#6B4A2E` | Angka uang, modal, untung, penanda panen |
| `tanah-lembut` | `#F4ECE3` | Kaki kartu uang, awalan "Rp", chip uang muka ditahan |
| `matahari` | `#D99A1E` | Garis dan isian tugas besok. Bukan untuk teks |
| `matahari-teks` | `#8A5A00` | Teks dan ikon tugas besok, banner peringatan |
| `matahari-lembut` | `#FFF4DA` | Latar tugas besok dan banner peringatan |
| `tomat` | `#C8402E` | Terlambat, rugi, kiriman ditolak, galat, tombol Keluar |
| `tomat-teks` | `#A93624` | Teks di atas `tomat-lembut` |
| `tomat-lembut` | `#FCEBE7` | Latar terlambat dan bahaya |
| `teks` | `#1F2420` | Teks utama (15,8:1 di atas putih), lencana nav, banner offline, penanda hari ini |
| `teks-pendukung` | `#5B665D` | Keterangan (5,5:1 di atas `embun-pagi`) |
| `garis` | `#DDE6D8` | Pemisah, tepi kartu, jalur penggaris |
| `garis-kuat` | `#738076` | Batas kolom isian, pin "belum", status "kosong" pada batang pengukuran |

Catatan pemakaian warna di data (bukan token, dipakai di batang pengukuran): normal = `daun-tua`, terlalu tinggi = `matahari`, terlalu rendah = `tomat`, kosong = `garis-kuat`.

### 1.2 Huruf

- Keluarga: **Plus Jakarta Sans**, bobot 400, 500, 600 (hanya tiga). Cadangan: `system-ui, "Segoe UI", sans-serif`. Font ada sebagai woff2 variabel di `design/extracted/assets/`, dimuat `font-display: swap`.
- Angka uang dan hari memakai `font-variant-numeric: tabular-nums`.
- Antialias: `-webkit-font-smoothing: antialiased`.
- **Teks paling kecil 16px.** Tidak ada teks 14px atau 12px di mana pun.

Skala yang ditetapkan sistem desain (papan 00):

| Peran | Ukuran/tinggi baris | Bobot | Contoh |
| --- | --- | --- | --- |
| Judul halaman | 22/28 | 600 | "Sawi · Petak 1" |
| Judul bagian / judul kartu | 18/26 | 600 | "Tugas hari ini" |
| Angka uang | 20/28 | 600, warna `tanah` | Rp1.250.000 |
| Isi | 16/24 | 400 | |
| Label | 16/24 | 500 | "Luas lahan" |
| Keterangan | 16/22 | 400, `teks-pendukung` | "Hari ke-13 · panen 15 hari lagi" |

Ukuran lain yang **dipakai di halaman tetapi tidak ada di tabel sistem desain** (perlu diputuskan jadi token atau tidak, lihat Pertanyaan):

| Ukuran/tinggi baris | Dipakai di |
| --- | --- |
| 24/32 · 600 | Judul halaman Masuk (HP) |
| 26/34 · 600 | Judul bagian landing HP |
| 34/42 · 600 | Judul utama landing HP |
| 36/44 · 600 | Judul bagian landing desktop |
| 52/60 · 600 | Judul utama landing desktop |
| 20/28 · 600 | Nama aplikasi di sidebar/header; angka uang |
| 18/26 · 600 | Nama aplikasi di header pembeli dan Masuk HP |
| 28/36, 48/56, 96/96 | Hanya di papan dokumentasi sistem desain, bukan di aplikasi |
| 72/76 · 700 | Angka sorotan halaman depan, token `angka-besar` (21,93% di bagian Masalah, desktop) [AG-54] |

Medali langkah Siklus Tani Muda di halaman depan: gradasi token `medali-daun`, `medali-matahari`, `medali-limau`, `medali-oranye` (radial dari warna token) [AG-55].

### 1.3 Jarak

Skala `space` (px): `1=4`, `2=8`, `3=12`, `4=16`, `5=20`, `6=24`, `8=32`. Perhatikan **tidak ada `space-7`**. Nilai lain yang muncul di tata letak halaman (padding halaman, gap bagian) dan sebaiknya dimasukkan ke skala: 40 (padding samping desktop), 48, 64, 72 (hanya papan dokumentasi). Padding halaman HP: 16px kiri-kanan. Padding konten desktop: `24px 40px 48px`.

### 1.4 Radius

| Token | Nilai | Dipakai |
| --- | --- | --- |
| `sm` | 8px | Tombol kamera, aksi banner, item menu akun |
| `md` | 12px | Tombol, kolom isian, banner, item nav, item sidebar |
| `lg` | 16px | Kartu, dialog desktop |
| `full` | 9999px | Chip, pin, lencana, pil filter, penggaris |

Nilai di luar token yang muncul di halaman: 10px (swatch, ikon tipe), 14px (tab bagian siklus), 20px atas (bottom sheet HP: `20px 20px 0 0`), 24px (1 kali). Perlu dipetakan saat membangun (sheet = token baru `sheet`).

### 1.5 Bayangan

**Desain tidak memakai bayangan jatuh sama sekali.** Kartu: putih, garis 1px, sudut 16px, "tanpa bayangan". Satu-satunya `box-shadow`:

- `cincin-fokus`: `0 0 0 2px #FFFFFF, 0 0 0 4px #1E6B45` (semua kontrol saat `:focus-visible`, di atas `outline: 2px solid transparent`).
- Cincin pilihan: `inset 0 0 0 2px #1E6B45` (kartu pilihan terpilih; 8 kali muncul) dan `0 0 0 1px #DDE6D8` (2 kali).
- Banner offline di dalam latar gelap memakai `outline: 2px solid #fff` sebagai ganti cincin.

### 1.6 Tinggi kontrol dan target sentuh

| Token | Nilai | Catatan |
| --- | --- | --- |
| `tinggi-kontrol` | 52px | Tombol dan kolom isian |
| `target-sentuh` | 48px | **Semua** yang disentuh minimal 48×48 (tombol kecil, centang, kamera, tautan kembali, item sidebar) |
| Chip | min-tinggi 34px | Chip tampilan saja, bukan target sentuh; pil filter yang bisa diketuk tetap 48px |
| Baris tugas | min-tinggi 72px | |
| Item nav bawah | min-tinggi 64px | Ikon dibungkus pil 56×32 |
| Lingkaran centang tugas | 30px di dalam target 48px | |
| Lencana nav | 24px, `teks` bukan merah ("pesanan baru bukan masalah") | |

### 1.7 Lebar dan tata letak

| Konteks | Aturan |
| --- | --- |
| Web mobile | 390px, padding 16px, nav bawah 4 menu |
| Desktop petani | Sidebar kiri `flex: 1 1 256px` (putih, garis kanan) + konten `max-width: 1200px`, padding `24px 40px 48px` |
| Desktop pembeli | Header atas putih tinggi min 64px, isi `max-width: 1152px`, padding 24px; menu: Pesanan aktif, Riwayat, Pembayaran |
| Landing desktop | konten `max-width: 1200px`; teks `max-width: 640px` |
| Masuk desktop | kartu `max-width: 480px` |
| Dialog desktop | 480px, padding 24px, radius 16px |
| Bottom sheet HP | menempel bawah, padding `8px 16px 24px`, radius atas 20px, `role="dialog" aria-modal` |
| Titik patah | **Tidak didefinisikan.** Desain memakai flex-wrap (`flex: 1 1 256px` dan `flex: 999 1 640px`). Lihat Pertanyaan |

### 1.8 Token seperti yang dipasang di `tailwind.config.ts` (Tahap 1)

Tema bawaan Tailwind **diganti**, bukan diperluas: warna bawaan, `text-sm`, dan `shadow-md` tidak ada.

| Kelompok | Kelas | Catatan |
| --- | --- | --- |
| Warna | `daun-tua` … `garis-kuat` (17) + `tirai` | `tirai` = warna teks 56% untuk latar dialog/sheet (papan 11) |
| Teks | `text-keterangan` 16/22, `text-isi` 16/24, `text-nav` 16/20, `text-judul-bagian` 18/26, `text-uang` 20/28, `text-judul-halaman` 22/28, `text-tampil-1…5` (24/32, 26/34, 34/42, 36/44, 52/60), `text-judul-masuk` 32/40 (judul Masuk desktop, papan 02), `text-dok-1…3` (hanya `/komponen`) | Ukuran landing dijadikan token `tampil` (D-16) |
| Jarak dan ukuran | skala 4px: `1`=4 … `24`=96, ditambah `0.5`=2, `1.5`=6, `2.5`=10, `3.5`=14, `4.5`=18, `6.5`=26, `7`=28, `7.5`=30 | Nilai kecil yang muncul di desain (label 26/30px, pin 28px) |
| Ukuran bernama | `sentuh` 48, `kontrol` 52, `chip` 34, `lingkaran` 30, `pin` 28, `pin-lebar` 32, `nav-ikon` 56, `nav-item` 64, `baris-tugas` 72, `sidebar` 256, `tab-siklus` 360, `panel` 360 (panel samping alur Hitung), `dialog` 480 | |
| Radius | `xs` 2, `sm` 8, `ikon` 10, `md` 12, `tab` 14, `lg` 16, `sheet` 20, `full` | |
| Garis | `border` 1, `border-1.5`, `border-2`, `border-2.5`, `border-3` | |
| Bayangan | `shadow-fokus`, `shadow-pilihan`, `shadow-garis` | Tidak ada bayangan jatuh |
| Rasio | `aspect-foto` 4:3 | Foto bukti, jurnal, foto kiriman (papan 22, 28) |
| Kolom grid | `grid-cols-baris-petak` 160px + sisa | Baris saran tanam bertahap (papan 31) |
| Lebar maksimum | `hp` 390, `dialog` 480, `teks` 640, `dok` 900, `pembeli` 1152, `konten` 1200, `desktop` 1440 | |
| Titik patah | `md` 768 (dua kolom, tetap navigasi bawah), `lg` 1024 (sidebar), `xl` 1280, `desktop` 1440 | D-16 |

Ikon tambahan di luar desain: `silang` (tombol tutup dialog, gaya garis sama) dan `panah-naik-turun` (tombol akun sidebar, ada di papan desktop tetapi bukan di `design/icons/`).

Kontras dan aksesibilitas yang sudah dirancang: `role="checkbox"` + `aria-checked` pada centang tugas, `role="img"` + `aria-label` ringkasan pada penggaris dan grafik, `role="alert"/"status"` pada banner, `aria-current="page"` pada nav, `.tm-sr` untuk teks pembaca layar, label tombol ikon ("Tandai selesai: …", "Tambah foto bukti").

---

## 2. Komponen

### 2.1 Pustaka `TaniMuda` (11 komponen, kode sumber di `design/extracted/assets/pustaka-komponen-tani-muda.js`)

| Komponen | Props | Varian dan keadaan |
| --- | --- | --- |
| **Ikon** | `nama`, `ukuran` (24), `tebal` (2), `label` | 16 ikon garis 24px, ujung bulat, `currentColor`. Tanpa `label` = `aria-hidden`; dengan `label` = `role="img"` |
| **Tombol** | `varian` (`utama` \| `sekunder`), `ikon`, `penuh`, `type`, `disabled` | Utama: isi `daun-tua`, teks putih. Sekunder: putih, garis 2px `daun-tua`, teks `daun-tua`. Tinggi 52, min lebar 48, label 16/24 · 600, label diawali kata kerja. Disabled: isi `garis`, teks `teks-pendukung`. Aktif: geser 1px. **Paling banyak satu tombol utama per layar** |
| **Kartu** | `judul`, `keterangan`, `kanan`, `kaki`, `nadaKaki` (`uang`), `tanpaIsi`, `tingkatJudul` (h2/h3) | Putih, garis 1px, radius 16. Kepala (judul 18/26 + keterangan), isi, kaki. Kaki `uang` = latar `tanah-lembut`. `tanpaIsi` = isi rapat (padding vertikal 8) untuk daftar baris |
| **KolomIsian** | `label`, `bantuan`, `galat`, `akhiran`, `inputMode`, atribut input lain | Bingkai 1.5px `garis-kuat`, radius 12. Fokus: batas `daun-tua` + cincin. Galat: batas 2px `tomat` + ikon peringatan + pesan (`tomat`, 500). Akhiran = satuan ("m²", "kg", "liter"). Bantuan = teks pendukung |
| **InputRupiah** | `label`, `nilai`/`nilaiAwal`, `onUbah`, `bantuan`, `galat`, `akhiran`, `tanpaTerbilang` | Awalan "Rp" di kotak `tanah-lembut`, angka 20/28 · 600 `tanah`. Titik ribuan otomatis, kursor dijaga, buang nol depan, maksimal 13 digit. **Mengeja angka** ("Lima ribu rupiah") sebagai bantuan, kecuali `tanpaTerbilang` |
| **Uang** | `nilai`, `label`, `keterangan`, `besar` | Format `Rp430.000` (tanpa spasi), negatif memakai tanda minus `−` (U+2212) dan warna `tomat`. Dengan label: tumpukan label + angka + keterangan |
| **ChipStatus** | `status`, `children` (menimpa teks) | 7 status: `selesai` (centang, `daun-lembut`), `hari-ini` (titik, putih + garis 2px `daun-tua`), `besok` (jam, `matahari-lembut`), `terlambat` (peringatan, `tomat-lembut`; teks bebas, mis. "Terlambat 2 hari"), `uang-muka-ditahan` (kunci, `tanah-lembut`), `menunggu-konfirmasi` (jam pasir, putih + `garis-kuat`), `dana-cair` (uang, isi `daun-tua`). Tinggi min 34, pil |
| **BarisTugas** | `judul`, `keterangan`, `waktu` (status chip), `selesai`/`selesaiAwal`, `onCentang`, `jumlahFoto`, `onKamera`, `tanpaKamera` | Tinggi min 72. Kiri: lingkaran centang (target 48). Tengah: judul 600 (500 + `teks-pendukung` kalau selesai), meta + chip. Kanan: tombol kamera 48 dengan lencana jumlah foto |
| **PenggarisUmurTanam** | `varian` (`hp` \| `lebar`), `hariIni`, `hariPanen`, `jadwal` [{hari, label, status}], `tampilkanDaftar` | Elemen khas. Jalur hari ke-0 sampai panen, bagian terlalui `daun-tua`, penanda gelap + pil "Hari ke-n" untuk hari ini, tik tiap 7 hari, pin per jadwal dengan 5 status (`selesai`, `besok`, `belum`, `terlambat`, `panen`). **HP**: pin tanpa label (28px), daftar di bawah. **Lebar** (untuk pembeli dan landing): pin 32px dengan label nama, hari, status; label ditata bertingkat agar tidak bertabrakan. Mengukur teks pakai canvas, responsif lewat ResizeObserver. Perlu ditulis ulang dengan logika tata letak yang diuji (lihat tugas T1.13) |
| **Banner** | `jenis` (`peringatan` \| `bahaya` \| `offline`), `judul`, `children`, `aksi`, `onAksi`, `tertunda` | `peringatan`: lonceng, `matahari-lembut`. `bahaya`: ikon peringatan, `tomat-lembut`, `role="alert"`. `offline`: latar `teks`, teks putih, radius 8, judul bawaan "Kamu sedang offline" |
| **NavigasiBawah** | `aktif`/`aktifAwal`, `onPilih`, `lencana` {pesanan: n} | 4 menu tetap: Beranda, Kebun, Pesanan, Belajar. Label selalu tampil. Aktif: teks `daun-tua` 600, pil ikon `daun-lembut`. Lencana (`99+`) |

Fungsi bantu di pustaka desain yang **harus dipindahkan jadi fungsi murni di `frontend/src/lib` dan diuji**: `titikRibuan`, `formatRupiah`, `terbilang` (dan `eja`). Format angka lain yang dipakai di halaman: `desimal` (koma sebagai pemisah desimal), `angka` (parser "1.250,5" → 1250.5), `rp`.

### 2.2 Pola yang ada di desain tetapi bukan komponen pustaka (harus dibuat sendiri)

Tanpa komponen ini halaman tidak bisa dibangun; semuanya ditulis inline di tiap halaman desain, sehingga perlu diseragamkan.

| Pola | Dipakai di | Rincian |
| --- | --- | --- |
| **Sidebar** (desktop petani) | Semua halaman desktop petani | Lebar 256, logo, 4 tautan (Beranda, Kebun, Pesanan + lencana, Belajar), kartu akun di bawah (avatar 40, nama, "Petani · Lembang") membuka **menu akun** (Profil, Pengaturan notifikasi, garis, Keluar `tomat`) |
| **Header pembeli** | 61–63 | Logo + "untuk pembeli", 3 tautan, nama usaha di kanan |
| **Header halaman HP** | Hampir semua HP | Tombol kembali 48×48 (`panah-kiri`) + judul; varian dengan nama halaman asal ("Beranda", "Jadwal") |
| **Pil pilihan (segmented / chip filter)** | Lahan, satuan luas (m²/ru-bata/hektare), jam pengingat, siklus, tipe tugas, Rutin/Sekali panen, tanaman dan cara tanam di Belajar | Tombol `aria-pressed`. Pil aktif `daun-lembut` + teks `daun-tua`, pasif putih + garis; ikon tipe tugas ikut pada chip filter tugas |
| **Tab bagian siklus** | 29–32, 51, 52 | Jadwal / Modal / Jurnal, berupa tautan ke halaman terpisah (`<nav aria-label="Bagian siklus">`, `aria-current="page"`), bukan `role=tab`. Desktop: kotak 360px, `radius 14`, 3 sel, aktif `daun-lembut`. HP: baris 3 sel penuh |
| **Kartu pilihan** | Komoditas (48px ilustrasi + nama + "Panen sekitar n hari" + label "Ada pesanan"/"Segera hadir"), metode (ikon + keterangan + meter modal 3 kotak + baris Lahan/Perawatan + label "Cocok untuk pemula"/"Resep tersedia"/"Segera hadir"), merek NPK, jumlah ambil | `role="radio"`/`aria-checked`; terpilih: `daun-lembut` + cincin inset 2px `daun-tua`; "Segera hadir": latar `embun-pagi` + garis `garis-kuat` |
| **Label kecil (lencana teks)** | "Subsidi", "Nonsubsidi", "Promo", "Ada pesanan", "Segera hadir", "Cocok untuk pemula", "Resep tersedia", "Terdaftar" | Berdasarkan chip; "Promo" harus selalu terlihat sebagai iklan |
| **Bottom sheet / dialog** | "Segera hadir" (HP: sheet, desktop: dialog 480), "Pilih merek" (sheet) | Fokus terkurung, tombol Esc, `aria-modal`, pegangan sheet |
| **Baris ubah item** | Kalkulator (35–38 HP) | Baris ringkas "Nama · jumlah satuan" + subtotal + sumber harga + chip subsidi; tombol "Ubah jumlah" membuka panel (KolomIsian Nama/Jumlah + InputRupiah Harga + pilihan Subsidi/Nonsubsidi); "Pilih merek"/"Ganti merek"; grup dengan subtotal; item baru ("Tambah item") |
| **Saklar (toggle)** | Pengingat per siklus, "Bagi biaya alat ke 10 siklus", "Disusun bertingkat (vertikultur)" | Tombol area 64×48, `role="switch"` + `aria-checked` + `aria-label` |
| **Batang rentang normal** | Cek pH/PPM | Skala min–maks, pita normal berwarna, penanda posisi nilai (warna sesuai status), label min/maks/rentang normal, ikon + kata status |
| **Grafik mini 7 pengukuran** | Cek pH/PPM | SVG 300×120, garis + titik, pita rentang normal, titik terakhir berwarna status |
| **Kotak OTP 6 digit** | Masuk | 6 input `maxlength=1`, hitung mundur "Kirim ulang kode dalam 0:42" |
| **Stepper langkah** | Alur Hitung | "Langkah n dari 3", tombol kembali, "Batal"/"Ganti" |
| **Baris modul belajar** | 41–44 | Nomor, judul, "n menit", keadaan: selesai, sedang ("sisa 1 menit"), tersimpan offline, belum; tombol unduh; bilah kemajuan "n dari 6 modul selesai"; tombol "Lanjutkan: …" |
| **Kartu tawaran pesanan** | Beranda, Pesanan di sekitar | Nama pembeli, jenis (rutin/sekali panen), barang, harga per kg, "Boleh ambil sebagian", jarak |
| **Foto bukti / galeri jurnal** | Detail tugas, jurnal, kiriman, konfirmasi | Thumbnail dengan keterangan "Sebelum · 06.15", tombol tambah foto |
| **Daftar langkah bernomor** | Detail tugas, gagal panen | Lingkaran nomor + teks |
| **Daftar syarat bercentang** | Kesepakatan, standar kualitas, kiriman | Ikon `centang` 20/2.5 + teks |
| **Avatar** | Sidebar, profil, kebun di dasbor pembeli | Lingkaran 40/…; inisial atau ilustrasi |
| **FAQ lipat** | Landing | 3 pertanyaan |
| **Ilustrasi hero** | Landing, Masuk | SVG matahari + garis tanah (tertanam, perlu disalin) |
| **Tautan "kembali"** | Desktop | 48px tinggi, `daun-tua`, ikon `panah-kiri` + nama halaman asal |

### 2.3 Ikon

- **16 ikon di `design/icons/`**: beranda, kebun, pesanan, belajar, centang, jam, kamera, peringatan, kunci, jam-pasir, uang, offline, panen, lonceng, panah-kanan, panah-kiri. Lima file duplikat berakhiran ` (1)` (isinya identik) sudah dihapus. Ukuran 24, garis 2, ujung bulat, `currentColor` (file memakai `#1f2420`, ganti ke `currentColor`).
- **Belum ada di folder icons, tetapi dipakai desain** (sudah diekstrak ke `design/extracted/ikon-sebaris/`):
  - Tipe tugas (wajib, P0-12): kalender (sekali), putar ulang (berulang), pengukur (pengukuran). Warna `daun-tua`, 20px.
  - Metode tanam: bedengan, polybag, hidroponik, sawah.
  - Ilustrasi komoditas 48px (kotak radius 12): daun (sawi), bayam, kangkung, cabai, tomat, mentimun, terong, padi, jagung, kedelai.
  - Ilustrasi hero landing dan Masuk, avatar.

---

## 3. Daftar halaman di desain

Nomor papan mengikuti urutan alur aplikasi (lihat [`design/README.md`](../design/README.md) untuk nama file tiap versi). "M" = mobile 390px, "D" = desktop 1440px.

| Papan | Halaman | M | D | Rute usulan |
| --- | --- | :-: | :-: | --- |
| 00 | Sistem desain | | ✓ | `/komponen` (halaman cek) |
| 01 | Halaman depan (landing page) | ✓ | ✓ | `/` |
| 02 | Masuk (nomor HP + OTP 6 digit) | ✓ | ✓ | `/masuk` |
| 03 | Beranda petani (siklus sawi bedengan: penggaris, banner besok, tugas hari ini, tawaran pesanan) | ✓ | ✓ | `/beranda` |
| 04 | Beranda petani hidroponik (ada tugas pengukuran "Isi angka") | ✓ | ✓ | `/beranda` |
| 05 | Beranda kosong, belum ada siklus | ✓ | | keadaan `/beranda` |
| 06 | Beranda offline dan tugas terlambat | ✓ | | keadaan `/beranda` |
| 07 | Beranda dengan pengingat diblokir (banner izin notifikasi) | ✓ | | keadaan `/beranda` |
| 08 | Belajar, hidroponik | ✓ | ✓ | `/belajar` |
| 09 | Belajar, bedengan | ✓ | ✓ | `/belajar` |
| 10 | Hitung langkah 1: Mau tanam apa? (jenis lahan, cari, kategori; desktop: menu profil terbuka) | ✓ | ✓ | `/hitung/tanaman` |
| 11 | Segera hadir, belum diminta (sheet/dialog "Minta resep ini") | ✓ | ✓ | modal di `/hitung/tanaman` |
| 12 | Segera hadir, sudah diminta | ✓ | ✓ | modal di `/hitung/tanaman` |
| 13 | Hitung langkah 2: sawi, bedengan (cara tanam + ukuran) | ✓ | ✓ | `/hitung/metode` |
| 14 | Hitung langkah 2: sawi, hidroponik (sistem Sumbu/NFT/Rakit apung, lubang, tandon, vertikultur) | ✓ | ✓ | `/hitung/metode` |
| 15 | Hitung langkah 2: padi, hanya sawah | ✓ | ✓ | `/hitung/metode` |
| 16 | Hitung langkah 3: sawi bedengan 100 m² (kalkulator modal) | ✓ | ✓ | `/hitung/modal` |
| 17 | Hitung langkah 3: pilih merek NPK (sheet/panel) | ✓ | ✓ | panel di `/hitung/modal` |
| 18 | Hitung langkah 3: sawi hidroponik NFT 200 lubang (alat sekali beli dibagi 10 siklus) | ✓ | ✓ | `/hitung/modal` |
| 19 | Hitung langkah 3: padi sawah 1.000 m² (subsidi urea/NPK) | ✓ | ✓ | `/hitung/modal` |
| 20 | Jadwal sawi bedengan (filter tipe, daftar per hari) | ✓ | ✓ | `/kebun/:id/jadwal` |
| 21 | Jadwal sawi hidroponik | ✓ | ✓ | `/kebun/:id/jadwal` |
| 22 | Detail tugas (terlambat, cara mengerjakan, foto, tunda) | ✓ | | `/tugas/:id` |
| 23 | Cek pH dan PPM, normal | ✓ | ✓ | `/tugas/:id/ukur` |
| 24 | Cek pH dan PPM, pH terlalu tinggi | ✓ | ✓ | `/tugas/:id/ukur` |
| 25 | Cek pH dan PPM, PPM terlalu rendah | ✓ | ✓ | `/tugas/:id/ukur` |
| 26 | Pengingat per siklus | ✓ | ✓ | `/kebun/:id/pengingat` |
| 27 | Detail siklus, Modal (rencana vs realisasi) | ✓ | | `/kebun/:id/modal` |
| 28 | Detail siklus, Jurnal | ✓ | | `/kebun/:id/jurnal` |
| 29 | Pesanan di sekitar (filter Semua/Rutin/Sekali panen) | ✓ | ✓ | `/pesanan` |
| 30 | Pesanan kosong | ✓ | | keadaan `/pesanan` |
| 31 | Detail pesanan (ambil sebagian, saran tanam bertahap) | ✓ | | `/pesanan/:id` |
| 32 | Kesepakatan | ✓ | | `/pesanan/:id/kesepakatan` |
| 33 | Kiriman saya (foto kualitas, tahap uang) | ✓ | | `/pesanan/kiriman` |
| 34 | Profil petani | ✓ | ✓ | `/profil` |
| 35 | Ubah profil | ✓ | ✓ | `/profil/ubah` |
| 36 | Dasbor pesanan aktif (pembeli) | | ✓ | `/pembeli` |
| 37 | Buat pesanan (pembeli) | | ✓ | `/pembeli/pesanan/baru` |
| 38 | Konfirmasi kiriman (pembeli) | | ✓ | `/pembeli/kiriman/:id` |

**Catatan cakupan 390px dan 1440px:** 10 halaman hanya punya versi mobile (05–07, 22, 27, 28, 30–33) dan 3 halaman hanya punya versi desktop (36–38, halaman pembeli). Aturan proyek mewajibkan keduanya, jadi versi yang tidak ada **diturunkan dari pola desain yang ada**: mobile ke desktop memakai sidebar dan kolom konten, sedangkan desktop pembeli ke mobile memakai tumpukan satu kolom. Hal ini ditandai di tiap tugas.

### 3.1 Halaman di PRD yang belum ada desainnya

| Kebutuhan PRD | Halaman atau bagian yang belum ada desainnya |
| --- | --- |
| P0-01 | **Pilih peran** (petani/pembeli/mentor) setelah OTP, dan **isian desa lokasi lahan** saat mendaftar petani (desain hanya punya "Desa atau kelurahan" di Ubah profil) |
| P0-02 | **Daftar pembeli**: nama usaha, jenis usaha, alamat, foto tempat usaha; **status verifikasi** dan keadaan pembeli belum terverifikasi (tombol Buat pesanan nonaktif) |
| P0-05 | **Pemutar video modul** + ringkasan teks, unduh dengan resolusi rendah, tanda sudah ditonton (hanya daftar modul yang ada) |
| P0-12, P0-17 | **Pilih tanggal tanam** (setelah Simpan rencana) dan **Ubah tanggal tanam** dengan penjelasan "tugas selesai tidak berubah" |
| P0-11 | **Rencana tersimpan** / mengubah rencana sebelum tanggal tanam / daftar rencana |
| P0-15 | **Konfirmasi tunda** yang melewati perkiraan panen; tampilan "tugas sejenis ikut bergeser" |
| P0-16 | Detail tugas **berulang** dan tugas **sekali tanpa terlambat** (papan 22 hanya satu tugas terlambat) |
| P0-18 | **Form catat pengeluaran** (item, nominal, tanggal, foto nota) dan **ringkasan akhir siklus** (untung sebenarnya dari pendapatan nyata − pengeluaran nyata, serta input pendapatan nyata) |
| P0-37 | Tugas **"Ukur ulang"** otomatis hari berikutnya (pengingat/penanda); entri riwayat pengukuran |
| P0-19 | Form **pesanan sekali panen** (jumlah total, perkiraan bulan panen); papan 37 hanya jenis rutin. Juga pilih **jenis pesanan** dan **tanggal mulai** |
| P0-23 | **Pembayaran uang muka** lewat payment gateway (halaman/lembar bayar, status, gagal bayar), halaman **Pembayaran** dan **Riwayat** di header pembeli |
| P0-24 | **Detail progres kebun** untuk pembeli (foto jurnal, perkiraan panen); hanya ringkasan penggaris di dasbor |
| P0-27 | **Petani lapor tidak sanggup**, **sisa jatah ditawarkan ulang**, **batal oleh pembeli**, tampilan kompensasi/pengembalian |
| P0-25 | Sisi petani untuk **kiriman ditolak sebagian** dan **sengketa** (hanya komponen Banner "Kiriman ditolak sebagian" contoh); antrean sengketa admin |
| P0-28 | **Beri rating** dua arah setelah kiriman (hanya angka 4,8 di profil) |
| US-19, P0-04 | **Penyuluh/mentor**: buat dan ubah Resep Tanam (input, dosis, tugas, rentang ukur, versi, validasi), daftar permintaan resep (US-31), petani binaan terlambat (US-20) |
| US-21, P0-02 | **Admin**: verifikasi pembeli, sengketa kiriman |
| P0-13 | Prompt **meminta izin notifikasi** (desain hanya punya keadaan diblokir) |
| P0-29 | Keadaan **video tersimpan/menunggu unduh**, indikator sinkron selesai |
| P0-31 | Notifikasi "resep sudah tersedia" (isi pesan) |
| Tautan di desain | **Aturan pakai**, **Kebijakan privasi**, **Tentang**, **Kontak**, **Pusat bantuan**, **Pengaturan notifikasi** (menu akun) — ada tautan, tidak ada halaman |
| Umum | Keadaan **memuat**, **galat jaringan**, **404**, keadaan kosong lain (Belajar, Jurnal, Kiriman saya, Riwayat) |

### 3.2 Halaman atau fitur di desain yang tidak ada di PRD

| Di desain | Catatan |
| --- | --- |
| **Landing page** (HP + desktop, FAQ, "Cara kerja Pesan Sebelum Tanam") | PRD tidak menyebut landing; dibutuhkan untuk demo lomba |
| **Profil + Ubah profil**: foto, ganti nomor HP, statistik (siklus selesai, kg panen terjual) | **Kata sandi dan nama pengguna dihapus (D-04).** Foto profil = kolom `foto_profil` (D-06). Halaman Ubah profil tetap ada tanpa dua bagian itu |
| **Kartu "Pupuk subsidi · Terdaftar · Kelompok Tani …"** di Profil | Kelompok tani: tabel dibuat sekarang, **tampilan baru di P1 (D-06)**; kartu ini disembunyikan di v1 |
| **Cari sampai 25 km** (perluasan radius pesanan) | PRD menyebut radius sebagai pertanyaan terbuka |
| **Sistem hidroponik Sumbu / NFT / Rakit apung** dengan saran tandon dan tempat | PRD hanya menyebut "sistem" pada `siklus_tanam`; hidroponik **hanya sawi** di v1 (D-05) |
| **Saran tanam bertahap** (4 bedengan, tanam tiap Senin) di Detail pesanan | Sesuai rumus PRD "tanam bertahap"; belum ada rincian tampilannya di PRD |
| **Pengingat sore 16.00 aktif secara bawaan** | PRD: sore adalah P1-05, tapi P0-38 memuat saklar sore |
| **"Lewati siram saat hujan — Segera hadir"** | Sama dengan P2-01 |
| **Beranda pembeli = dasbor** dengan penggaris umur tanam lebar per kebun | Sesuai US-16, PRD tidak merinci |
| **"Dana cair paling lama 6 jam"**, **"Periksa sebelum pukul 12.40"** | Berlaku **6 jam untuk pesanan rutin, 24 jam untuk sekali panen** (D-01); teks dibuat dari konfigurasi |

### 3.3 Beda isi desain dan PRD: sudah diputuskan di `keputusan.md`

| # | Desain | PRD | Keputusan |
| --- | --- | --- | --- |
| 1 | Periksa kiriman 6 jam | 24 jam | **D-01**: 6 jam rutin, 24 jam sekali panen |
| 2 | Per kiriman bayar 80%, 20% dari uang muka | Uang muka pada kiriman terakhir | **D-02**: ikuti desain |
| 3 | Denda Rp25.000, 3 kali gagal boleh akhiri | Tanpa denda | **D-03**: tanpa denda; kabar 3 hari sebelumnya; ditawarkan ulang; catatan profil dan nonaktif sementara oleh admin |
| 4 | Kata sandi opsional, nama pengguna | Hanya OTP | **D-04**: hanya OTP, keduanya dihapus |
| 5 | Hidroponik untuk sawi, bayam, kangkung | Hanya sawi | **D-05**: hanya sawi; lainnya "Segera hadir" |
| 6 | Pesanan jagung dan pilihan Selada/Pakcoy tanpa resep | Komoditas berresep saja | PRD berlaku: hanya yang berresep (tidak ada keputusan lain). Data contoh papan 29 mobile yang berisi jagung diganti pesanan berresep; pesanan jagung tidak dibuat |
| 7 | Papan 37 hanya rutin | Rutin dan sekali panen | Keduanya dibuat; sekali panen sebagai turunan (D-07) |
| 8 | Beberapa halaman hanya HP atau hanya desktop | Wajib 390 dan 1440 | Diturunkan; mentor/admin hanya desktop (D-07) |
| 9 | Profil memakai `aktif="profil"` padahal nav 4 menu | – | Profil dibuka dari avatar di kepala halaman HP (usulan, lihat Pertanyaan) |
| 10 | Pengingat sore 16.00 aktif bawaan | P1-05 | Dibuat di v1 mengikuti desain, maksimal satu tambahan per hari |
| 11 | "1 ru ≈ 14 m²" di teks bantuan | Per wilayah di `konversi_satuan` | Teks dibuat dari data (D-08) |
| 12 | 20% dan 5% tertulis di teks | Usulan, bisa berubah | Konfigurasi (D-02, D-08) |
| 13 | Kapasitas lahan "6 kg" tetap di papan 31 | Rumus luas per panen | **D-08**: rumus yang berlaku; kapasitas lahan tanah = luas lahan − luas siklus aktif, lahan hidroponik = kapasitas lubang − lubang siklus aktif (D-06, D-15) |
| 14 | Lima alasan penolakan | – | **D-06**, **D-14**: empat pilihan `layu_atau_busuk`, `jumlah_kurang`, `tidak_sesuai_standar`, `lainnya` (wajib keterangan); tabel pemetaan di D-14 |
| 15 | Tidak ada keadaan akun nonaktif | – | **D-13**: daftar pesanan tetap terlihat, tombol "Ambil pesanan" diganti penjelasan dan kontak admin |
| 16 | Angka resep tanpa label contoh | Resep harus divalidasi penyuluh | **D-11**, **D-12**: label "CONTOH, belum divalidasi penyuluh" di setiap tempat angka resep muncul |

---

## 4. Aturan bahasa dan format yang terlihat di desain

Desain tidak punya halaman "aturan bahasa" tertulis. Aturan berikut disimpulkan dari seluruh isi 63 papan dan dipakai sebagai aturan proyek (lihat `aturan-proyek.md`); kalau salah, koreksi di sana.

- Semua teks Bahasa Indonesia. Tidak ada istilah Inggris di UI (tidak "Dashboard", "Login", "Submit"); desain memakai "Beranda", "Masuk", "Simpan rencana", "Dasbor" untuk halaman pembeli.
- Petani disapa **"kamu"** dan **"-mu"** ("kebunmu"); pembeli disapa **"Anda"** ("dapur Anda", "uang Anda"). Nada tenang, kalimat pendek, tanpa tanda seru.
- Label tombol diawali kata kerja ("Simpan rencana", "Tandai selesai", "Ambil pesanan", "Minta resep ini").
- (D-09) Kalimat biasa, bukan huruf kapital semua. Bahasa petani: "Hari ke-13" bukan "HST 13", "Uang muka sudah masuk" bukan "Pembayaran DP berhasil". Tidak ada escrow, task, pending, submit, DP, HST, dashboard, login di tampilan. Rupiah lengkap `Rp1.250.000`.
- Pesan galat menjelaskan apa yang harus diisi ("Isi luas lahan dulu").
- Istilah tetap: Resep Tanam, siklus, HST/umur tanam ("hari ke-13 dari 28"), uang muka, dana cair, Pesan Sebelum Tanam, titik impas, modal, bedengan, "Segera hadir".
- Format angka dan tanggal: `Rp430.000` (tanpa spasi), titik ribuan, koma desimal ("6,1", "3,5 kg"), minus `−` (U+2212), "m²", "ru/bata", "hektare"; jam `06.00` (titik); tanggal "Sabtu, 3 Oktober"; kisaran dengan en dash "5,5–6,5"; "·" sebagai pemisah.
- Teks contoh tanggal di desain memakai "Sabtu, 3 Oktober 2026" sebagai hari ini; jangan ditulis tetap di kode.

---

## 5. Data contoh yang bisa dipakai sebagai seed (bukan rekomendasi)

Diambil dari skrip data tiap papan; semuanya contoh dari desain, bukan rekomendasi.

- **Komoditas**: sayuran daun (sawi hijau 28 hari, bayam 25, kangkung 21, pakcoy 40), sayuran buah (cabai rawit 90, tomat 75, mentimun 40, terong 65), tanaman pangan (padi sawah 110, jagung manis 75, kedelai 85). Resep tersedia: sawi, bayam, kangkung, padi.
- **Hasil per m²**: sawi 1,5 kg, bayam 1,2 kg, kangkung 1,5 kg, padi 0,55 kg gabah. Hidroponik 0,15 kg per lubang.
- **Sawi bedengan 100 m² (jual Rp5.000/kg, panen 150 kg)**: benih 1 bungkus Rp25.000; pupuk kandang 200 kg Rp600; dolomit 20 kg Rp1.500; NPK 16-16-16 5 kg (subsidi Rp2.300, nonsubsidi Rp15.000); POC 1 liter Rp40.000; pestisida nabati 1 liter Rp35.000; mulsa 60 m Rp750; tenaga dan air Rp60.000. Jadwal: pupuk 1 hari ke-7, pupuk 2 hari ke-14, cek hama hari ke-20, panen hari ke-28; siram setiap hari; cek daun berlubang setiap 3 hari.
- **Sawi hidroponik NFT 200 lubang (jual Rp15.000/kg, panen 30 kg)**: benih, rockwool, netpot, AB mix, pH down, listrik; alat sekali beli (pipa, pompa, tandon 100 L, rangka) dibagi 10 siklus; pH normal 5,5–6,5, PPM normal 1.050–1.400 (contoh, wajib diganti penyuluh); jadwal pindah tanam hari ke-10, ganti larutan hari ke-21, panen hari ke-35; cek pH dan PPM setiap 2 hari.
- **Padi sawah 1.000 m² (jual Rp6.500/kg gabah, panen 550 kg)**: benih 3 kg; urea 20 kg dan NPK 15-15-15 30 kg (bersubsidi, HET contoh Rp2.250 dan Rp2.300); pupuk organik 200 kg; hama paket; sewa traktor, tenaga tanam, tenaga panen. Pupuk 1 hari ke-14, pupuk 2 hari ke-35, cek hama hari ke-55, panen hari ke-110.
- **Merek dan harga**: tiap item pupuk punya 2–3 merek contoh dengan ukuran kemasan, harga per kemasan, jumlah pelapor, hari lalu; opsi "Merek lain, isi sendiri".
- **Promo**: toko tani contoh dengan jarak dan masa berlaku.
- **Pesanan contoh**: Katering Bu Ratna (sawi 10 kg/minggu, 3 bulan, Rp5.000), Warung Nasi Bu Imas, Kafe Daun Pagi (bayam), Koperasi Desa Sumber Rejeki (gabah 2 ton sekali panen), Katering Sehat Lestari, Peternakan Mitra Unggas (jagung).
- **Modul belajar**: bedengan 6 modul (persiapan lahan, semai, tanam, perawatan, panen, pascapanen), hidroponik 6 modul (merakit instalasi sederhana, semai di rockwool, pindah tanam ke netpot, membuat larutan AB mix, mengukur pH dan PPM, panen dan membersihkan instalasi), sawah 6 modul; masing-masing 3–4 menit.
- **Konversi satuan**: 1 ru = 14 m²; 1 hektare = 10.000 m².
- **Pembulatan tempat**: hidroponik sumbu/NFT/rakit memakai saran tandon dan kebutuhan tempat per lubang yang tertulis di data papan 13 mobile (dipakai sebagai nilai awal rumus T2).
