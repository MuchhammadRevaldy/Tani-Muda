# PRD Tani Muda (terkini)

18 Oktober 2026 · @Informatika UMBY · status: acuan utama menjelang lomba 20 Oktober 2026

Dokumen ini menyatukan semua yang berlaku saat ini dalam satu tempat:

- PRD v1 `docs/prd-tani-muda.md` (3 Oktober 2026);
- PRD tambahan v1.1 `docs/prd-fitur-tambahan.md` (14 Oktober 2026, 12 fitur F-00 sampai F-11);
- keputusan D-01 sampai D-67 di `docs/keputusan.md`, yang mengubah sebagian isi kedua PRD itu.

Kedua PRD lama tidak diubah (aturan proyek 7.8) dan disimpan sebagai arsip. Bila isinya berbeda dengan dokumen ini, **dokumen ini yang berlaku**. Keputusan baru tetap dicatat di `keputusan.md` dengan nomor berikutnya, lalu dokumen ini diperbarui.

Kolom **Status** di setiap tabel fitur menggambarkan kode per 18 Oktober 2026:

| Status | Arti |
| --- | --- |
| Jalan | Ada di tampilan dan backend, dipakai di naskah demo |
| Tiruan | Jalan, tetapi memakai penyedia tiruan (OTP, pembayaran, AI, berita) sampai penyedia sungguhan dipasang |
| Sebagian | Tampilan ada, tetapi backend menjawab `501 BELUM_TERSEDIA` atau bagian penting belum dibuat |
| Belum | Belum dibuat |

---

## 1. Ringkasan

Tani Muda menemani petani muda dalam satu siklus: **belajar** cara menanam, **menghitung** modal dan untung, **merawat** tanaman tepat waktu, lalu **menjual** panen ke pembeli yang sudah memesan sebelum tanam. Semua angka bertumpu pada **Resep Tanam**, yaitu panduan per komoditas dan metode tanam yang (nantinya) divalidasi penyuluh.

| Pilar | Isi utama | Hasil bagi petani muda |
| --- | --- | --- |
| Belajar | Modul video per tahap tanam, chatbot "Tanya Tani Muda" | Tahu cara menanam yang benar |
| Hitung | Kalkulator modal, titik impas, saran memperbanyak untung, harga dari berita | Modal terukur sebelum menanam |
| Rawat | Jadwal otomatis dari tanggal tanam, pengukuran pH/PPM, cuaca, deteksi penyakit dari foto | Perawatan tepat waktu |
| Jual | Pesan sebelum tanam dengan uang muka yang ditahan, stok siap jual, peta petani, chat | Pembeli dan harga pasti |

Pendukung: level dan lencana supaya petani betah, serta tema slogan **"Tanam dengan pembeli yang pasti"**.

**Platform:** aplikasi web responsif (PWA), React di `frontend/` dan Laravel 13 + MariaDB di `backend/`. **Lomba:** ISCOMFEST, tema "Aplikasi Kepemudaan Menyongsong Bonus Demografi dan Menuju Generasi Emas 2045", Selasa 20 Oktober 2026, demo dari laptop. **Daerah peserta dan data demo:** Kabupaten Klaten, Jawa Tengah (D-67).

## 2. Masalah

Anak muda enggan bertani karena empat ketidakpastian sekaligus:

- **Tidak tahu caranya.** Penyuluhan jarang menjangkau anak muda yang belajar lewat HP.
- **Tidak tahu modalnya.** Pemula tidak tahu kebutuhan benih dan pupuk untuk luas lahannya, dan berapa totalnya.
- **Lupa jadwal perawatan.** Pemupukan susulan dan cek hama dihitung dari hari tanam; terlambat menurunkan hasil.
- **Tidak tahu siapa pembelinya.** Penjualan bergantung pada perantara. Survei BPS mencatat harga cabai merah naik 61,31% dari petani sampai konsumen (data 2019, [Antara](https://www.antaranews.com/berita/1896032/bps-pola-distribusi-perdagangan-komoditas-sama-seperti-tahun-lalu)).

Dampaknya pada regenerasi: petani berusia 19–39 tahun hanya **21,93%** dari seluruh petani (Sensus Pertanian 2023, [BPS](https://sensus.bps.go.id/berita_resmi/detail/st2023/22049/hasil-pencacahan-lengkap-sensus-pertanian-2023-tahap-i)). Angka ini adalah porsi petani muda dari seluruh petani, bukan porsi pemuda yang bekerja di pertanian.

## 3. Tujuan dan metrik

Versi pertama berhasil bila petani muda bisa merencanakan, merawat, dan menjual satu siklus tanam dengan untung yang jelas.

| Pilar | Metrik | Target | Kapan diukur |
| --- | --- | --- | --- |
| Hitung | Waktu dari memilih komoditas sampai rencana modal tersimpan (median) | < 5 menit | 2–4 minggu pilot |
| Hitung | Petani baru yang menyimpan rencana modal | 80% | 2–4 minggu pilot |
| Rawat | Tugas selesai paling lambat sehari dari jadwal | 80% | 2–4 minggu pilot |
| Rawat | Tugas pengukuran diisi paling lambat sehari | 70% | 2–4 minggu pilot |
| Rawat | Hasil ukur di luar rentang yang kembali normal saat ukur ulang | 70% | 2–4 minggu pilot |
| Belajar | Petani yang menyelesaikan modul persiapan lahan sebelum tanam | 70% | 2–4 minggu pilot |
| Jual | Pesanan yang seluruh jumlahnya diambil petani dalam 7 hari | 70% | 2–4 minggu pilot |
| Jual | Siklus pilot yang sudah berpembeli sebelum tanam | 70% | 2–4 minggu pilot |
| Hitung | Siklus dengan selisih rencana dan realisasi modal ≤ 20% | 70% | akhir siklus |
| Hitung | Siklus yang berakhir dengan panen tercatat | 75% | akhir siklus |
| Jual | Volume kiriman diterima tanpa penolakan | 90% | akhir siklus |
| Jual | Harga kesepakatan dibanding harga tengkulak setempat | ≥ 15% lebih tinggi | akhir siklus |
| Jual | Pembeli yang memasang pesanan kedua | 60% | 3 bulan |
| Semua | Petani yang memulai siklus berikutnya | 60% | 3 bulan |
| Semua | Kepuasan (skala 1–5, petani dan pembeli terpisah) | 4,0 | akhir siklus |

Semua metrik diambil dari catatan aktivitas di basis data. Permintaan resep per komoditas dipantau tanpa target sebagai dasar prioritas resep berikutnya.

## 4. Pengguna dan peran

| Peran | Contoh | Kebutuhan utama |
| --- | --- | --- |
| Petani muda | Arif, 22 tahun, baru pertama menanam sayur | Tahu cara, modal, jadwal, dan pembeli |
| Pembeli | Bu Ratna, katering; koperasi atau penggilingan untuk gabah | Pasokan terencana dengan kualitas jelas |
| Mentor/penyuluh | Penyuluh kecamatan | Menyusun dan memvalidasi Resep Tanam, memantau petani binaan |
| Admin | Tim Tani Muda | Verifikasi pembeli, sengketa, catatan dan status petani |

Sapaan di aplikasi: **"kamu"** untuk petani, **"Anda"** untuk pembeli (D-09).

## 5. Kebutuhan dan status

Nomor P0-xx berasal dari PRD v1, F-xx dari PRD tambahan; isinya di bawah sudah memuat perubahan dari keputusan yang disebut di kolom terakhir.

### 5.1 Akun dan peran

| ID | Kebutuhan | Status | Dasar |
| --- | --- | --- | --- |
| P0-01 | Masuk hanya dengan nomor HP dan OTP, lalu pilih peran petani, pembeli, atau mentor. Tanpa kata sandi dan nama pengguna. Petani wajib mengisi desa. Centang persetujuan kebijakan privasi (draf) saat mendaftar. | Tiruan (OTP lewat driver log) | D-04, D-30 |
| P0-02 | Pembeli mengisi data usaha lalu diverifikasi admin; sebelum terverifikasi belum bisa memasang pesanan. | Jalan | D-22 |
| — | Ganti nomor HP lewat OTP ke nomor baru; sesi lain berakhir. | Jalan | D-44, D-45 |
| — | Profil petani dan pembeli, ubah profil, foto profil, keluar. | Jalan | D-44, D-62 |
| — | Pemilihan wilayah bertingkat Kabupaten → Kecamatan → Desa, hanya Jawa Tengah; kode wilayah resmi Kemendagri. | Jalan | D-27, D-54, D-67 |

### 5.2 Resep Tanam

| ID | Kebutuhan | Status | Dasar |
| --- | --- | --- | --- |
| P0-03 | Resep per kombinasi komoditas dan metode (bedengan, sawah, polybag, hidroponik): bahan dan dosis, tugas per hari ke-n, perkiraan hasil, standar kualitas, persen panen jelek. | Jalan | D-38 |
| — | Resep contoh berstatus `draf` boleh tampil di demo dengan label **"CONTOH, belum divalidasi penyuluh"** di setiap tempat angka resep muncul. Basis data produksi tidak diisi resep contoh. | Jalan | D-10, D-11, D-12 |
| P0-04 | Penyuluh atau admin membuat dan mengubah resep; setiap simpan membuat versi baru berstatus draf; siklus berjalan tetap memakai versinya. | Sebagian (editor ada di tampilan, endpoint mentor 501) | D-46 |
| P0-30 | Pilih jenis lahan lalu komoditas per kategori; komoditas tanpa resep berlabel "Segera hadir". | Jalan | |
| P0-31 | "Minta resep ini" untuk komoditas yang belum ada resepnya. | Sebagian (petani bisa meminta; daftar untuk mentor 501) | |
| P0-32 | Pilih metode yang punya resep untuk komoditas itu, dengan modal awal, kebutuhan lahan, dan frekuensi rawat. Hidroponik v1 hanya sawi. | Jalan | D-05 |
| P0-33 | Ukuran sesuai metode dan satuan lokal (m², ru/bata, hektare, jumlah polybag, lubang tanam, volume tandon). | Jalan | |
| F-02 | Tanaman tambahan: cabai rawit dan tomat (bedengan, polybag), selada baru (bedengan, hidroponik); semua resep contoh berlabel. Monstera dan tanaman hias di luar cakupan. | Jalan (bersakelar) | D-64 |

Resep yang tersedia di demo: sawi, bayam, kangkung (bedengan), sawi (hidroponik), padi (sawah), ditambah cabai rawit, tomat, selada dari F-02. **Semua angka resep masih contoh** sampai divalidasi penyuluh.

### 5.3 Belajar

| ID | Kebutuhan | Status | Dasar |
| --- | --- | --- | --- |
| P0-05 | Modul per tahap tanam: video ≤ 3 menit (MP4 360p, ≤ 15 MB) dan ringkasan teks; modul yang selesai ditandai. Demo cukup 2–3 video contoh. | Jalan (video masih klip contoh) | D-29, D-43, D-44 |
| P0-05 | Unduh video untuk ditonton tanpa sinyal (batas 200 MB). | Sebagian (tersimpan di peramban, pemutaran tanpa sinyal butuh service worker yang belum ada) | D-43 |
| P0-06 | Beranda menampilkan tugas hari ini dan tautan modul tahap yang sedang berjalan. | Jalan | D-43 |
| F-05 | Chatbot "Tanya Tani Muda": jawaban singkat hanya dari resep, modul, dan paper berlisensi terbuka, dengan sumber; tanpa dosis atau merek pestisida; tombol ke penyuluh bila tidak ada di sumber. | Tiruan (bawaan `AI_DRIVER=tiruan`; driver OpenAI tersedia) | D-64 |

### 5.4 Hitung (kalkulator modal)

| ID | Kebutuhan | Status | Dasar |
| --- | --- | --- | --- |
| P0-07 | Kebutuhan bahan otomatis dari dosis × ukuran, dibulatkan ke kemasan. | Jalan | |
| P0-08 | Harga dan item bisa diubah, ditambah, dihapus; harga negatif ditolak; item tanpa harga ditandai. | Jalan | |
| — | Urutan harga bahan: rata-rata laporan di kecamatan (dibulatkan ke ratusan) lalu harga contoh resep; sumber harga selalu tampil. | Jalan (laporan harga baru dari petani: 501) | D-38 |
| P0-09 | Penanda pupuk bersubsidi; bawaan nonsubsidi kecuali petani menyatakan terdaftar di kelompok tani. | Jalan | D-38 |
| P0-10 | Ringkasan: total modal, modal per m², titik impas, pendapatan, untung, dan untung saat panen jelek. Untung negatif tampil "Dengan angka ini, kamu berpotensi rugi." | Jalan | D-38 |
| — | Harga jual: harga kesepakatan → harga pesanan terdekat → harga contoh; sumbernya tampil dan bisa diubah. | Jalan | D-38 |
| P0-11 | Simpan rencana sebagai dasar siklus; rencana "Nanti saja" tampil di menu Kebun. | Jalan | D-38 |
| P0-34 | Rekomendasi berdasarkan jenis dan kandungan; merek dipilih petani dari laporan setempat, tidak pernah direkomendasikan. | Jalan | D-38 |
| P0-35 | Promo tampil terpisah berlabel "Promo", tidak mengubah urutan merek. | Jalan | |
| P0-36 | Alat sekali beli dibagi ke beberapa siklus. | Jalan | |
| F-01 | Saran memperbanyak untung (maksimal 3, dihitung dari angka rencana sendiri, tanpa AI); item opsional (mis. pestisida nabati, POC) yang bisa dimatikan; cara cek pH dengan kertas pH universal. | Jalan (bersakelar) | D-64 |
| F-10 | Kotak "Harga di berita hari ini" di kalkulator dan formulir pesanan: angka, lokasi, tanggal, media, tautan, berlabel "Harga pasar dari berita, bukan harga di tingkat petani". Tidak pernah mengisi harga otomatis. | Tiruan (`BERITA_DRIVER` tiruan, `gnews`, atau `google`) | D-64 |

### 5.5 Rawat (jadwal, pengukuran, kesehatan tanaman)

| ID | Kebutuhan | Status | Dasar |
| --- | --- | --- | --- |
| P0-12 | Jadwal otomatis dari tanggal tanam dengan tiga tipe tugas: sekali, berulang, pengukuran; ikon berbeda; bisa disaring. | Jalan | |
| P0-13 | Notifikasi pagi pukul 06.00 berisi tugas hari itu; banner bila izin ditolak. | Sebagian (pusat notifikasi dalam aplikasi ada; web push 501) | D-57, D-60 |
| P0-14 | Tandai selesai dengan foto opsional yang masuk jurnal. | Jalan | D-61 |
| P0-15 | Tunda tugas 1–3 hari; tugas sejenis ikut bergeser. | Jalan | |
| P0-16 | Status "Terlambat x hari" dengan saran dari resep. | Jalan | |
| P0-17 | Ubah tanggal tanam menghitung ulang tugas yang belum selesai. | Jalan | |
| P0-37 | Tugas pengukuran pH/PPM dengan rentang normal resep, status Normal/Terlalu tinggi/Terlalu rendah, grafik 7 pengukuran, dan tugas "Ukur ulang" bila di luar rentang. Nilai kosong = null, nol sah. | Jalan | D-34 |
| P0-38 | Pengaturan pengingat per siklus (jam pagi 05.00–07.00, pengingat sore, per tipe tugas). | Jalan (pengaturan tersimpan; pengiriman notifikasi belum) | D-44 |
| — | Beranda: salam sesuai jam setempat, pilihan siklus paling mendesak, penggaris umur tanam. | Jalan | D-37 |
| P0-18 | Catat pengeluaran nyata dengan foto nota; akhir siklus menampilkan untung sebenarnya. | Jalan | |
| F-06 | Kartu cuaca di Beranda (Open-Meteo, titik tengah desa, tanpa GPS) dengan status kecocokan suhu per siklus dan saran dari resep. | Jalan (bersakelar) | D-64 |
| F-04 | Deteksi penyakit dari foto: hasil berupa **dugaan** dengan tingkat keyakinan, langkah aman tanpa dosis atau merek, tombol "Tanya penyuluh", tersimpan di jurnal. | Tiruan (bawaan driver tiruan) | D-64 |
| F-11 | Kartu "Tugas hari ini beres": jumlah tugas dan foto, poin, tugas besok, 1–2 saran tahap tanam; tanpa AI. | Jalan (bersakelar) | D-64 |

### 5.6 Jual: pesan sebelum tanam

| ID | Kebutuhan | Status | Dasar |
| --- | --- | --- | --- |
| P0-19 | Pembeli terverifikasi memasang pesanan **rutin** (seminggu atau dua minggu sekali, maksimal 3 bulan, batas jam antar opsional) atau **sekali panen** (gabah, jagung). Biaya layanan tampil sebelum dipasang. | Jalan | D-40, D-41, D-42 |
| P0-20 | Pesanan tampil ke petani terdekat, diurutkan dari jarak titik tengah desa. | Jalan | D-06 |
| P0-21 | Petani mengambil sebagian pesanan; aplikasi memeriksa kapasitas lahan dan menolak bila tidak cukup. Satu petani satu alokasi per pesanan; jumlah bisa diubah sebelum setuju. | Jalan | D-15, D-34, D-39, D-40 |
| — | Hanya kiriman yang terkejar umur panen yang ditanggung petani; pesanan rutin dipecah menjadi petak tanam bertahap, satu petak per kiriman. | Jalan | D-39, D-40 |
| P0-22 | Kesepakatan digital (jumlah, jadwal, harga, kualitas, aturan gagal panen) disetujui sebelum uang muka. Alamat antar baru dibuka setelah petani mengambil pesanan. | Jalan | D-39 |
| P0-23 | Uang muka 20% dibayar pembeli dan **ditahan**; petani melihat "Uang muka sudah masuk" sebelum menanam. | Tiruan (`PenyediaPembayaran` tiruan, ada simulasi gagal/menunggu) | D-02, D-10, D-41 |
| P0-24 | Pembeli memantau foto jurnal dan perkiraan panen; penggaris pembeli hanya menampilkan pin Panen. | Jalan | D-42 |
| P0-25 | Petani mengirim dengan foto hasil panen (wajib) dan foto timbangan (opsional). Pembeli mengonfirmasi atau menolak sebagian dengan satu dari empat alasan; "lainnya" wajib keterangan. | Jalan | D-14, D-40 |
| — | Tanpa tanggapan pembeli: kiriman dianggap diterima setelah **6 jam (rutin)** atau **24 jam (sekali panen)**. | Sebagian (logika ada; penjadwal 15 menit belum dipasang) | D-01, D-23 |
| P0-26 | Dana kiriman cair ke petani sebesar harga kesepakatan; pembeli membayar 80% nilai kiriman dan 20% diambil dari saldo uang muka. | Tiruan | D-02, D-34 |
| P0-27 | Gagal panen: petani wajib mengabari paling lambat 3 hari sebelum jadwal kirim; bagiannya ditawarkan ke petani lain, bila tidak ada, uang muka bagian itu kembali ke pembeli. Tanpa denda. Pembatalan pembeli setelah tanam: uang muka menjadi kompensasi petani. | Jalan | D-03 |
| P0-28 | Rating dua arah setelah setiap kiriman. | Jalan | |
| — | Sengketa penolakan diputuskan admin. | Sebagian (data sengketa tercatat; panel admin 501) | D-46 |
| — | Catatan admin dan nonaktif sementara untuk petani yang tidak memberi kabar; petani nonaktif tidak bisa mengambil pesanan baru. | Sebagian (catatan tampil ke petani; endpoint admin 501) | D-03, D-13 |

### 5.7 Jual: stok siap jual, peta, chat

| ID | Kebutuhan | Status | Dasar |
| --- | --- | --- | --- |
| F-07 | Petani menjual panen yang sudah ada lewat **Stok saya**; pembeli membeli dari **Stok siap jual** terurut terdekat, bayar **COD** atau di aplikasi. Alur: menunggu → diterima → dikirim → selesai, atau batal; petani boleh menolak COD. | Jalan (bersakelar; bayar di aplikasi tiruan) | D-64 |
| F-08 | **Petani di sekitar** untuk pembeli terverifikasi: peta Leaflet + OpenStreetMap dengan radius 10 atau 15 km. Petani menyalakan sendiri "Tampilkan saya di peta pembeli" (bawaan mati); lokasi GPS hanya dengan izin dan **disimpan dibulatkan sekitar 1 km**; titik persis tidak pernah disimpan atau dikirim; nomor HP tidak ditampilkan. | Jalan (bersakelar) | D-64, UU PDP No. 27/2022 |
| F-09 | Chat petani–pembeli yang terhubung lewat pesanan, kiriman, pesanan stok, atau peta; polling 5 detik; hanya peserta yang bisa membaca. Tambahan di kode: memulai percakapan dengan memasukkan nomor HP yang terdaftar, lewat permintaan kontak yang harus diterima lawan bicara. | Jalan (bersakelar) | D-64 |

### 5.8 Level dan lencana (F-03)

| Level | Poin minimal |
| --- | --- |
| Benih | 0 |
| Tunas | 100 |
| Daun | 300 |
| Berbunga | 700 |
| Panen Raya | 1.500 |

Poin dihitung server dari peristiwa nyata: tugas tepat waktu +10, terlambat lalu selesai +3, foto bukti +2, pengukuran +5, modul selesai +5, siklus selesai +100, kiriman diterima tanpa penolakan +50, rating 5 +20. Sepuluh lencana pencapaian (Tanam pertama, Tepat waktu 7 hari, Kebun terdokumentasi, Pengukur teliti, Pelajar rajin, Panen pertama, Dipercaya pembeli, Bintang lima, Pesanan pertama, Pembeli setia). Pembeli hanya mendapat lencana, tanpa level. Ambang dan poin ada di konfigurasi. **Status: Jalan (bersakelar).**

### 5.9 Panel admin dan mentor

| Kebutuhan | Status |
| --- | --- |
| Verifikasi pembeli (setujui, tolak dengan alasan) | Jalan |
| Daftar petani dengan cari dan paginasi, catatan, nonaktif sementara | Sebagian (tampilan ada, endpoint 501) |
| Sengketa | Sebagian (tampilan ada, endpoint 501) |
| Editor resep, validasi, permintaan resep terbanyak | Sebagian (tampilan ada, endpoint 501) |

Panel cukup versi desktop dengan tabel sederhana (D-07, D-46, D-47).

### 5.10 Akses tanpa sinyal

| ID | Kebutuhan | Status |
| --- | --- | --- |
| P0-29 | Jadwal, checklist, rencana modal, dan video yang diunduh bisa dibuka tanpa sinyal; tugas yang ditandai selesai saat offline tersinkron saat sinyal kembali. | **Belum** (belum ada service worker; jangan diklaim di demo atau video) |

## 6. Aturan bisnis dan angka

Semua persen dan batas di bawah adalah **konfigurasi**, bukan konstanta di kode (D-28). Semua angka di layar dihitung fungsi di `frontend/src/lib` dan diport ke PHP dengan kasus uji bersama di `shared/kasus-uji/` (D-08).

| Aturan | Nilai |
| --- | --- |
| Uang muka | 20% dari nilai pesanan, ditahan sampai kiriman diterima |
| Biaya layanan | 5% dari nilai pesanan, dibayar pembeli, tidak memotong bagian petani |
| Pembayaran per kiriman | Pembeli 80% nilai kiriman + 20% dari saldo uang muka |
| Batas periksa kiriman | Rutin 6 jam, sekali panen 24 jam |
| Kabar gagal panen | Paling lambat 3 hari sebelum jadwal kirim |
| Durasi pesanan rutin | Maksimal 3 bulan |
| Frekuensi rutin | Seminggu sekali atau dua minggu sekali |
| Kapasitas lahan | Luas lahan − luas siklus aktif dan siklus rencana yang terhubung pesanan; hidroponik dihitung dari jumlah lubang |
| Persen panen jelek (contoh) | 70% |
| Batas AI | 30 panggilan per pengguna per hari, waktu tunggu 30 detik |
| Radius peta | 10 km (bisa 15 km) |
| Video modul | MP4 360p, 15 MB per video, 200 MB total unduhan |

**Rumus**

- Kebutuhan bahan = dosis × ukuran sesuai dasar dosis (m², tanaman, liter larutan), dibulatkan ke atas ke kemasan.
- 1 hektare = 10.000 m²; ru/bata per wilayah (umumnya sekitar 14 m² per ru), disimpan sebagai data.
- Nutrisi hidroponik = dosis pekatan per liter × volume tandon × jumlah pengisian ulang.
- Biaya alat per siklus = harga alat ÷ jumlah siklus pembagian.
- Total modal = Σ (jumlah × harga) + biaya alat per siklus.
- Pendapatan = perkiraan panen × harga jual per kg; untung = pendapatan − total modal.
- Titik impas (kg) = total modal ÷ harga jual per kg.
- Tugas sekali = tanggal tanam + hari ke-n; tugas berulang = tanggal tanam + hari mulai + k × interval.
- Luas per panen = jumlah per kiriman ÷ hasil per m²; luas pesanan rutin = luas per panen × puncak petak yang tumbuh bersamaan.
- Nilai pesanan = jumlah total × harga per kg; uang muka = 20%; biaya layanan = 5%.
- Harga laporan dibulatkan ke ratusan rupiah terdekat (di bawah Rp100 ke puluhan, minimal Rp10).

## 7. Privasi, keamanan, dan kejujuran tampilan

- Ke pembeli hanya tampil **nama desa dan jarak**, dihitung dari titik tengah desa, bukan titik lahan (D-06). Peta petani memakai lokasi dibulatkan sekitar 1 km dengan persetujuan petani (F-08).
- Data milik pengguna lain dijawab **404**; peran atau status yang tidak boleh dijawab **403** (D-22). Policy dan tes akses silang wajib untuk tabel data pribadi dan transaksi.
- Kunci rahasia (`OPENAI_API_KEY`, kunci berita, dan lain-lain) hanya di `backend/.env`; tidak pernah di `VITE_*`, respons, log, atau commit (D-19, D-64).
- Fitur AI meminta persetujuan sekali bahwa foto dan pertanyaan dikirim ke penyedia pihak ketiga (`pengguna.setuju_ai_pada`). Untuk pilot dengan pengguna sungguhan wajib penyedia resmi dengan dasar pemrosesan sesuai UU PDP.
- Jawaban dari driver tiruan selalu berlabel "Contoh jawaban, mode tanpa internet". Resep contoh selalu berlabel. Deteksi penyakit selalu "dugaan".
- Sesi web memakai cookie Sanctum (HttpOnly, CSRF); tanpa token di `localStorage` (D-21).
- Baris uang dan transaksi tidak pernah dihapus (kunci asing `RESTRICT`); operasi uang memakai kunci idempoten (D-53, D-54).
- Kebijakan privasi dan aturan pakai masih **draf** dan berlabel draf sampai ditinjau ahli hukum (D-30, D-44).

## 8. Bahasa dan tampilan

- Semua teks Bahasa Indonesia; "kamu" untuk petani, "Anda" untuk pembeli; tombol diawali kata kerja; kalimat biasa, bukan huruf kapital semua; tanpa tanda seru.
- Bahasa petani: "Hari ke-13" (bukan HST), "Uang muka sudah masuk" (bukan DP). Hindari escrow, task, pending, submit, dashboard, login di tampilan. "HST" hanya boleh di panel mentor.
- Rupiah lengkap: `Rp1.250.000`.
- Teks yang terlalu panjang dipotong elipsis, ukuran huruf tidak diperkecil (D-17).
- Tata letak: HP 390 px dengan navigasi bawah; 768–1023 px navigasi bawah dengan dua kolom; ≥ 1024 px sidebar kiri (D-16). Panel admin dan mentor cukup desktop.
- Tema baru, logo baru, ikon garis sendiri (tanpa emoji sebagai ikon), animasi yang bisa dimatikan, dropdown dan kalender headless (D-59, D-61 sampai D-63, D-65, D-66).

## 9. Teknologi

| Bagian | Pilihan |
| --- | --- |
| Frontend | React + TypeScript strict + Vite, Tailwind CSS, TanStack Query, Vitest; Headless UI dan react-day-picker untuk pilihan dan kalender |
| Backend | Laravel 13 (target PHP 8.3, laptop memakai 8.5), Sanctum, Pest, Larastan level 5 |
| Basis data | MariaDB 10.4 dari XAMPP di laptop; VPS memakai MariaDB LTS 10.11 atau 11.4 |
| Penyedia | `PenyediaOtp` (driver log), `PenyediaPembayaran` (tiruan), `PenyediaAI` (tiruan atau OpenAI), berita (tiruan, GNews, atau Google), cuaca Open-Meteo, peta OpenStreetMap |
| Sakelar fitur | `VITE_FITUR_<NAMA>` dan `FITUR_<NAMA>` untuk F-00 sampai F-11; fitur mati = menu hilang dan endpoint `501 BELUM_TERSEDIA` |
| Mode data | `VITE_SUMBER_DATA=tiruan` (data contoh di peramban) atau `http` (backend); `npm run demo:backend` untuk demo lomba |
| Deploy | Demo dari laptop; siap ke VPS: semua konfigurasi lewat `.env`, tanpa jalur khusus Windows |

Rincian: `docs/arsitektur-backend.md`, `docs/kontrak-api.md`, `docs/menjalankan-lokal.md`.

## 10. Model data (ringkas)

Rincian kolom ada di `docs/kontrak-api.md` bagian 2. ID memakai string `VARCHAR(64)` ascii (ULID huruf kecil untuk baris baru), uang `BIGINT UNSIGNED`, waktu UTC.

| Kelompok | Tabel |
| --- | --- |
| Pengguna dan wilayah | `pengguna`, `profil_pembeli`, `catatan_petani`, `wilayah`, `wilayah_kabupaten`, `wilayah_kecamatan`, `kelompok_tani`, `anggota_kelompok_tani`, `kode_otp`, `berkas` |
| Resep dan belajar | `komoditas`, `metode_tanam`, `resep_tanam`, `resep_input`, `resep_tugas`, `modul`, `progres_modul`, `permintaan_resep`, `sistem_hidroponik` |
| Bahan dan harga | `input_pertanian`, `kelayakan_subsidi`, `merek_input`, `laporan_harga`, `promo`, `konversi_satuan`, `konfigurasi` |
| Kebun | `lahan`, `siklus_tanam`, `rencana_item`, `tugas`, `hasil_pengukuran`, `pengeluaran`, `jurnal`, `pengaturan_pengingat`, `langganan_notifikasi` |
| Pesan sebelum tanam | `pesanan`, `alokasi_pesanan`, `pembayaran`, `pengiriman`, `rating`, `sengketa`, `kunci_idempoten` |
| Fitur tambahan | `log_ai`, `lencana_pengguna`, `deteksi_tanaman`, `pengetahuan_sumber`, `pengetahuan_potongan`, `obrolan_bot`, `stok`, `pesanan_stok`, `percakapan`, `pesan`, `permintaan_kontak`, `harga_berita` |
| Notifikasi | `log_notifikasi` (pusat notifikasi dalam aplikasi) |

## 11. Di luar cakupan v1

| Tidak dikerjakan | Alasan |
| --- | --- |
| Pengiriman oleh platform | Petani mengantar atau pembeli mengambil |
| Jual-beli benih dan pupuk di aplikasi | Urusan stok dan logistik |
| Lelang atau harga harian | Harga tetap yang disepakati di awal |
| Pinjaman dari platform | Butuh izin lembaga keuangan |
| Dosis dari uji tanah, sensor pH/PPM otomatis | Butuh laboratorium atau perangkat keras |
| Penyesuaian jadwal otomatis dari cuaca | Butuh aturan yang divalidasi; v1 hanya menampilkan cuaca dan saran |
| Rekomendasi merek pupuk | Aplikasi hanya merekomendasikan jenis dan kandungan |
| Notifikasi WhatsApp atau SMS | Butuh biaya penyedia |
| Aeroponik, tabulampot, monstera dan tanaman hias | Tidak cocok dengan model siklus dan pesanan |
| Dosis atau merek pestisida dari AI | Risiko keselamatan; diarahkan ke penyuluh |

## 12. Sesudah lomba

**Wajib sebelum pilot**

1. Service worker dan akses tanpa sinyal (P0-29), termasuk pemutaran video yang diunduh.
2. Web push notifikasi pagi dan penjadwal (konfirmasi otomatis tiap 15 menit, pengingat).
3. Endpoint panel admin (petani, catatan, sengketa) dan mentor (resep, validasi, permintaan resep).
4. Laporan harga dari petani (`POST /laporan-harga`).
5. Model sisa pesanan rutin per kiriman (D-55, disetujui di D-57): kapasitas per kiriman, baris pengiriman sejak diambil, pengembalian uang muka ditunda sampai kiriman tidak terkejar.
6. Resep dan rentang pH/PPM divalidasi penyuluh; ganti semua angka contoh.
7. Payment gateway berizin yang bisa menahan dan mencairkan dana; penyedia SMS OTP.
8. Video modul asli MP4 360p.
9. Kebijakan privasi dan aturan pakai ditinjau ahli hukum.

**P1 (tambahan)**: tanya mentor, saran harga setempat, skenario "bagaimana jika", ekspor ringkasan usaha ke PDF, pengingat sore, harga acuan resmi di formulir pesanan, kelompok tani digital, langganan pembeli bisnis, dasbor penyuluh, resep polybag dan komoditas tambahan, perbandingan metode, ubah tawaran pesanan sebelum ada alokasi, frekuensi dua kali seminggu, halaman admin untuk konfigurasi.

**P2 (masa depan)**: saran geser jadwal dari cuaca, notifikasi WhatsApp, rekomendasi dosis dari uji tanah, kurir pihak ketiga, rotasi tanam beberapa komoditas, cek nomor pendaftaran pupuk otomatis, sensor pH/PPM, metode aeroponik, aplikasi React Native dengan token Sanctum.

## 13. Pertanyaan terbuka

| Pertanyaan | Bawaan sementara | Menghambat pilot? |
| --- | --- | --- |
| Komoditas, metode, dan penyuluh validator untuk pilot di Klaten | Resep contoh berlabel | Ya |
| Dosis, jadwal pupuk, hasil, rentang pH/PPM yang tepat | Angka contoh | Ya |
| Payment gateway yang mendukung dana ditahan | Pembayaran tiruan | Ya |
| Besar uang muka dan biaya layanan yang diterima pembeli | 20% dan 5% | Tidak |
| Standar kualitas per komoditas dan cara menilainya dari foto | Teks standar di resep | Tidak |
| Siapa menanggung ongkos kirim, radius pesanan yang wajar | Petani antar, radius dari konfigurasi | Tidak |
| Nilai ru/bata di Klaten | Sekitar 14 m² per ru | Tidak |
| Merek dan harga pupuk di toko tani sekitar | Data contoh | Tidak |
| Risiko COD bila pembeli tidak membayar | Petani boleh menolak COD | Tidak |
| Persetujuan data foto, lokasi, dan transaksi | Draf berlabel | Ya, sebelum rilis umum |

## 14. Jadwal lomba

| Waktu | Kegiatan |
| --- | --- |
| Senin 19 Oktober 2026 pukul 18.00 WIB | Pembekuan kode final; setelah itu hanya perbaikan yang menghentikan demo (D-65) |
| Selasa 20 Oktober 2026 | Lomba, demo lokal mengikuti `docs/naskah-demo.md` dengan backend dan phpMyAdmin |

Bahan pendukung: video teaser `video/keluaran/teaser-tani-muda.mp4` (2:50,7) dengan naskah narasi di `video/naskah-narasi.md`.

## 15. Rujukan

| Dokumen | Isi |
| --- | --- |
| `docs/keputusan.md` | Riwayat keputusan D-01 sampai D-67 beserta alasannya |
| `docs/aturan-proyek.md` | Aturan kerja dan kode |
| `docs/kontrak-api.md` | Bentuk data dan endpoint |
| `docs/arsitektur-backend.md` | Rancangan backend dan deploy |
| `docs/rencana-kerja.md` | Tahap 1 sampai 7 dan tugasnya |
| `docs/naskah-demo.md` | Naskah demo untuk juri |
| `docs/prd-tani-muda.md`, `docs/prd-fitur-tambahan.md` | Arsip PRD v1 dan PRD tambahan v1.1 |
