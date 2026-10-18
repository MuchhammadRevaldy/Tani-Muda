# Naskah demo Tani Muda (7 menit)

Pembaca: tim yang memperagakan Tani Muda di depan juri. Nama tombol di bawah sama dengan yang tampil di aplikasi.

Naskah ini diuji otomatis dengan `npm run uji:naskah` (peramban sungguhan, diawali **Atur ulang data demo**). Hasil uji terakhir ada di bagian "Hasil uji" di bawah.

**Demo bisa dilakukan jam berapa pun.** Adegan yang bergantung jam disetel ulang relatif terhadap saat data diatur ulang (D-47): kiriman ke Warung Nasi Bu Imas selalu tercatat dikirim 1 jam sebelumnya, dengan batas periksa 6 jam (D-01). Karena itu, **atur ulang data paling lama 5 jam sebelum langkah 9**.

Layar: laptop 1440 px (tampilan desktop), zoom 100%. Dua jendela atau tab: aplikasi dan phpMyAdmin.

## Dua mode demo dan aturan hari-H

| Mode | Perintah | Alamat | Isi |
| --- | --- | --- | --- |
| **Backend (utama)** | `npm run demo:backend` | `http://localhost:4174` | Aplikasi tersambung ke Laravel + MariaDB di laptop; juri bisa melihat datanya bertambah di phpMyAdmin. |
| Tiruan (cadangan) | `npm run demo` | `http://localhost:5173` | Data contoh di peramban, tanpa basis data. Langkah phpMyAdmin dilewati. |

**Versi lomba:** tag `demo-lomba` (pembekuan final seluruh fitur F-00 s/d F-11; [AG-34]; uji gerbang 27/27 lolos 3 putaran). Jalan mundur berurutan: `demo-logo` (D-63), `demo-animasi` (D-61), `demo-tema-baru` (D-59), `demo-aman` (tema lama): `git switch --detach <tag>`, lalu `npm run demo:backend`.
**Jadwal Lomba:** **Selasa, 20 Oktober 2026** (diundur sesuai D-65).
**Tanggal Pembekuan Final:** **Senin, 19 Oktober 2026 pukul 18.00 WIB**. Setelah titik ini, seluruh kode aplikasi dibekukan dan tim fokus penuh pada simulasi panggung.

### Status Sakelar Fitur (Tahap 7 / PRD Tambahan v1.1)

Setiap fitur dilengkapi sakelar mandiri (`VITE_FITUR_<NAMA>` di frontend dan `FITUR_<NAMA>` di backend) serta driver tiruan, sehingga dapat dimatikan secara instan bila ada gangguan jaringan pihak ketiga tanpa merusak alur aplikasi:

| Fitur | Nama Sakelar | Status Demo | Keterangan / Fallback |
| --- | --- | --- | --- |
| F-00 | `AI` | Aktif | Penyedia AI lokal / Gemini dengan fallback aturan murni |
| F-01 | `SARAN_UNTUNG` | Aktif | Saran optimasi margin & metode tanam |
| F-02 | `TANAMAN_BARU` | Aktif | Rekomendasi varietas dan komoditas potensial |
| F-03 | `LEVEL` | Aktif | Poin keaktifan petani dan lencana reputasi |
| F-04 | `DETEKSI` | Aktif | Analisis kesehatan tanaman berbasis foto |
| F-05 | `CHATBOT` | Aktif | Tanya jawab budidaya dan panduan resep |
| F-06 | `CUACA` | Aktif | Prakiraan cuaca 3 harian BMKG / tiruan |
| F-07 | `STOK` | Aktif | Etalase stok panen siap jual & transaksi COD |
| F-08 | `PETA` | Aktif | Sebaran titik lahan petani aktif (radius 10 km) |
| F-09 | `CHAT` | Aktif | Obrolan langsung via titik peta & nomor HP kontak |
| F-10 | `HARGA_BERITA` | Aktif | Pantauan harga pasar komoditas dari media berita terpercaya |
| F-11 | `SARAN_HARIAN` | Aktif | Rangkuman harian & saran resep setelah tugas selesai |

Bila ingin mematikan salah satu fitur saat latihan: setel `$env:VITE_FITUR_<NAMA>='mati'`.

## Segmen Tambahan: Demo "Fitur Pintar" (~1,5 Menit)

Disajikan setelah langkah 10 (atau terpisah bila juri meminta pendalaman teknologi cerdas):

1. **Peta Petani & Stok Siap Jual (F-07 & F-08) [30 detik]**
   - **Langkah:** Masuk sebagai Ratna (pembeli) → buka `/pembeli/peta` → tunjukkan sebaran 6 titik petani Klaten (Delanggu) dengan koordinat presisi. Buka tab **Stok** (`/pembeli/stok`) → tunjukkan kartu panen sawi segar Arif dan bayam Dewi dengan tombol **Chat** dan **Beli Panen Ini**.
   - **Kalimat untuk juri:** *"Tani Muda tidak hanya melayani kontrak tanam di muka, tapi juga memetakan stok panen segar di sekitar pembeli. Ibu Ratna bisa melihat langsung kebun terdekat dalam radius 10 km, lengkap dengan harga per kg dan opsi transaksi langsung COD."*

2. **Chat Langsung via Nomor Kontak (F-09) [30 detik]**
   - **Langkah:** Tekan **Chat dengan nomor HP** (`#tombol-chat-nomor-hp`) → masukkan nomor Arif (`+6281200000001`) → tekan **Buka Chat**. Ketik *"Halo Pak Arif, stok sawi siap kirim?"* → kirim. Beralih ke akun Arif → buka `/chat` → balas pesan tersebut.
   - **Kalimat untuk juri:** *"Komunikasi adalah kunci rantai pasok pangan. Pembeli dan petani dapat saling berkoordinasi secara instan melalui nomor HP atau langsung dari titik peta, dengan batas laju aman dan privasi terjaga."*

3. **Kotak Saran Tugas Beres & Pantauan Harga Pasar Berita (F-10 & F-11) [30 detik]**
   - **Langkah:** Masuk sebagai Arif → buka `/beranda` → tunjukkan **Kotak Saran Harian** di bawah daftar tugas (*Tugas Hari Ini Beres! +10 poin*) beserta saran resep untuk tahap tanam sekarang. Kemudian tunjukkan **Widget Harga Berita Hari Ini** di kolom samping (*Rp35.000 / kg - Komoditas Sawi*).
   - **Kalimat untuk juri:** *"Setelah petani menyelesaikan seluruh tugas hari ini, sistem aturan murni kami memberikan apresiasi poin gamifikasi dan saran resep berikutnya. Di samping itu, petani disajikan kabar harga pasar terkini dari berita nasional sebagai pembanding objektif, tanpa manipulasi dan tanpa tebakan AI."*

**Bila animasi membuat demo tersendat:** matikan sakelarnya lalu jalankan ulang, tanpa mengubah kode: `$env:VITE_ANIMASI='mati'; npm run demo:backend` (sakelar tetapnya di `frontend/scripts/pengaturan-demo.mjs`, D-62).

**Aturan hari-H:** mode demo diputuskan **setelah latihan pagi** dan **tidak berpindah di tengah demo**. Bila latihan pagi dengan backend lancar, pakai backend. Bila ada yang macet dan tidak selesai dalam 10 menit, pakai tiruan, dan basis data ditunjukkan terpisah setelah demo bila juri meminta.

## Alur

| Menit | Langkah | Akun | Halaman dan yang ditekan | Poin untuk juri |
| --- | --- | --- | --- | --- |
| 0:00–0:35 | 1. Halaman depan | belum masuk | Buka `/`. Tunjuk ringkasan "Contoh perhitungan" sawi 100 m² di samping ilustrasi sawi (modal Rp430.000, titik impas 86 kg, untung Rp320.000), lalu gulir ke tiga pilar dan lima langkah "Pembeli pasti dulu, baru menanam". | Semua angka di halaman depan dihitung dari resep yang sama dengan kalkulator, bukan ditulis tangan. |
| 0:35–1:15 | 2. Daftar petani baru | Rina (baru) | Tekan **Mulai sebagai petani**. Isi *Nomor HP* **`0857 0000 1001`**, tekan **Kirim kode**. Ketik 6 angka dari panel **Kode uji**, tekan **Masuk**. Centang **Saya setuju dengan kebijakan privasi Tani Muda**, tekan **Masuk** lagi. Di Lengkapi akun pilih **Petani**, *Nama lengkap* **`Rina Agustina`**, *Desa lokasi lahan* pilih **Kabupaten Klaten** → **Kecamatan Delanggu** → **Sabrang**, tekan **Simpan dan lanjut**. Mode backend: pindah ke tab phpMyAdmin tabel `pengguna`, tekan F5, tunjuk baris Rina paling atas. Lalu buka `/akun-demo` dan tekan **Masuk sebagai Arif**. | "Di demo, kode tampil di layar; di produksi, kode dikirim lewat SMS." Masuk hanya dengan nomor HP, tanpa kata sandi; akun baru langsung tersimpan di basis data. |
| 1:15–1:40 | 3. Beranda | Arif | Tunjuk penggaris umur tanam (hari ke-13, pin Pupuk 2 "besok"), banner "Besok", dan "Tugas hari ini". | Petani langsung tahu hari ke berapa dan apa yang harus dikerjakan hari ini. |
| 1:40–2:45 | 4. Rencana dan modal | Arif | **Buat siklus baru** → kartu **Sawi hijau** → **Lanjut pilih metode** → **Bedengan** (sudah terpilih), isi *Luas lahan* `20` m² → **Lanjut hitung modal**. Tunjuk total modal, titik impas, dan "Kalau panen jelek". Tekan **Simpan rencana** → pilih **Kebun belakang rumah** → **Hari ini** → **Simpan dan buat jadwal**. | Sebelum menanam, petani tahu modal dan berapa kg harus terjual supaya tidak rugi; jadwal tugas dibuat otomatis dari resep. |
| 2:45–3:25 | 5. Jadwal dan pengukuran | Arif | Di Beranda pilih pil **Sawi hijau · Rak hidroponik teras**, tekan **Lihat jadwal, modal, dan jurnal**. Pada tugas "Cek pH dan PPM" tekan **Isi angka**, isi *pH larutan* `6,2` dan *PPM (kepekatan nutrisi)* `600`. Tunjuk saran "PPM terlalu rendah", tekan **Simpan hasil**. | Angka ukur langsung diterjemahkan menjadi saran, dan tugas "Ukur ulang" besok dibuat sendiri. |
| 3:25–4:15 | 6. Mengambil pesanan | Arif | Menu **Pesanan** (berlencana). Pilih pesanan **Kafe Daun Pagi** (bayam), tekan **Lihat pesanan**. Tunjuk "Lahanmu cukup" dan saran jumlah, tekan **Ambil … kg …**. Di Kesepakatan centang pernyataan, tekan **Setuju**. | Petani hanya mengambil sebanyak kemampuan lahannya; uang muka pembeli sudah ditahan sebelum ia menanam. |
| 4:15–4:35 | 7. Pindah ke pembeli | Bu Imas (Warung Nasi Bu Imas) | Buka `/akun-demo`, tekan **Masuk sebagai Imas**. Tunjuk banner kiriman tiba dan penggaris kebun pemenuh (hanya pin Panen). | Pembeli memantau umur tanam di kebun petani tanpa melihat alamat atau titik lahannya. |
| 4:35–5:30 | 8. Membuat pesanan dan membayar uang muka | Imas | Tekan **Buat pesanan** → **Sawi hijau**, isi *Jumlah per kiriman* `10` dan *Harga per kg* `5000` → **Lanjut bayar Rp…**. Di halaman bayar pilih **Berhasil**, tekan **Bayar Rp…**. Mode backend: tab phpMyAdmin tabel `pembayaran`, F5, tunjuk dua baris teratas: `uang_muka` Rp120.000 **ditahan** dan `biaya_layanan` Rp30.000 **cair**. | Uang muka 20% ditahan Tani Muda, belum ke petani; di uji coba pembayaran disimulasikan (referensi `TIRUAN-…`), tanpa uang sungguhan. |
| 5:30–6:25 | 9. Konfirmasi kiriman | Imas | Kembali ke dasbor, pada banner kiriman tiba tekan **Periksa kiriman**. Tunjuk dua foto dari petani, pilih **Terima semua**, tekan **Konfirmasi terima … kg**, pilih **5 bintang**, tekan **Kirim nilai**. Mode backend: tab phpMyAdmin `pembayaran`, F5, tunjuk dua baris `pencairan` **cair** (Rp24.000 dari pembeli dan Rp6.000 dari uang muka). | Dana cair ke petani setelah pembeli memeriksa; bagian yang tidak sesuai boleh ditolak dengan foto. |
| 6:25–7:00 | 10. Penutup | Imas | Tunjuk "Pesanan aktif" dan menu **Pembayaran**. | Dari belajar, menghitung, merawat, sampai menjual: satu aplikasi untuk petani muda. |

Bila waktu tersisa (cadangan, bukan bagian 7 menit): masuk sebagai **Rahmat** (penyuluh) dan tunjukkan editor resep (hanya mode tiruan; editor mentor belum tersambung ke backend).

### Tab phpMyAdmin (mode backend)

Disiapkan sebelum demo di tab kedua:

1. Buka **`http://127.0.0.1/phpmyadmin`** (pakai `127.0.0.1`, bukan `localhost`: lebih cepat), pilih basis data **`tani_muda`**.
2. Tab A: tabel **`pengguna`** → **Jelajahi** → klik judul kolom `dibuat_pada` dua kali sampai urutannya menurun (terbaru di atas).
3. Tab B: tabel **`pembayaran`** → **Jelajahi** → urutkan `dibuat_pada` menurun.

Saat demo cukup pindah tab dan tekan F5; urutan tetap. Bila tabel terasa terlalu lebar, pakai tab **SQL**:

```sql
SELECT jenis, nominal, status, referensi, dibuat_pada FROM pembayaran ORDER BY dibuat_pada DESC LIMIT 6;
```

## Menjalankan demo dengan backend

Prasyarat sekali saja: PHP 8.3+ di PATH, `backend/.env` ada, `composer install` dan `npm install` sudah dijalankan, basis data sudah diisi (`php artisan migrate:fresh --seed` di `backend/`). Rincian di `docs/menjalankan-lokal.md`.

**Pagi hari-H (latihan pagi):**

1. **Mulai ulang laptop** (membebaskan memori; laptop hanya punya sekitar 2 GB RAM bebas).
2. Buka **XAMPP Control Panel**, tekan **Start** pada **MySQL** dan **Apache** (Apache hanya untuk phpMyAdmin).
3. Terminal pertama, di folder repositori:

   ```powershell
   npm run demo:backend
   ```

   Perintah ini memeriksa PHP, `backend/.env`, dan MariaDB, membangun frontend mode demo (sekitar 30 detik), lalu menyalakan API dan aplikasi. Tunggu sampai tertulis `Demo dengan backend: http://localhost:4174`. Bila kode tidak berubah sejak kemarin, `npm run demo:backend -- --tanpa-build` langsung menyala.
4. Terminal kedua, satu putaran cepat untuk memastikan semuanya jalan (sekitar 30 detik, tanpa jendela):

   ```powershell
   npm run uji:naskah -- --url http://localhost:4174
   ```

   Hasilnya harus `Ringkasan: 1 dari 1 lolos`. Putuskan mode demo di sini (lihat aturan hari-H).
5. **Atur ulang data sesudah latihan**, karena latihan mengubah data (Rina sudah terdaftar, pesanan sudah diambil):

   ```powershell
   cd "C:\Users\Sandy\Tani Muda\backend"
   & "C:\php-8.5.11-nts-Win32-vs17-x64\php.exe" artisan demo:atur-ulang
   ```

   Jalur PHP ditulis lengkap karena `php` di PATH laptop ini masih PHP 8.1 bawaan XAMPP, sedangkan Laravel butuh 8.3 ke atas.

   Atau dari aplikasi: `/akun-demo` → **Atur ulang data demo**. Atur ulang menghapus semua perubahan, termasuk pengguna yang mendaftar setelah data contoh dan batas kirim ulang OTP, jadi nomor `0857 0000 1001` bisa dipakai lagi.
6. Buka `http://localhost:4174/` di satu jendela Chrome, zoom 100%, dan pastikan angka Rp430.000 tampil. Siapkan tab phpMyAdmin (bagian di atas).
7. Tutup aplikasi yang tidak dipakai (VS Code, Chrome lain, aplikasi chat, penyinkron berkas). Matikan notifikasi Windows (Focus assist) dan suara.

Bila demo baru berlangsung lebih dari 5 jam setelah atur ulang, atur ulang sekali lagi tepat sebelum demo.

**Mode tiruan (cadangan):** `npm run demo`, buka `http://localhost:5173`, lalu `/akun-demo` → **Atur ulang data demo**. Cadangan yang lebih ringan: `npm run build:demo` sehari sebelumnya, lalu `npm run preview:demo` (`http://localhost:4173`).

## Bila ada yang macet

| Gejala | Tindakan |
| --- | --- |
| Halaman berputar lama atau kosong | Tekan F5. Data tersimpan di basis data (mode backend) atau peramban (mode tiruan), jadi muat ulang tidak menghapus langkah sebelumnya. |
| Tampil "Ada yang tidak beres" atau "Sambungan ke server belum tersedia" | Mode backend: lihat terminal `npm run demo:backend`. Bila `[api] berhenti`, tekan Ctrl+C lalu jalankan lagi `npm run demo:backend -- --tanpa-build`. Lalu buka `/akun-demo`, masuk dengan akun langkah itu, dan lanjut dari halaman tujuannya. |
| `npm run demo:backend` berkata basis data belum menyala | XAMPP: **Start** MySQL, lalu ulangi. |
| Langkah 2: "Nomor ini sudah punya akun" atau kode tidak muncul | Data belum diatur ulang sejak latihan. Pakai nomor lain (mis. `0857 0000 1002`), atau atur ulang bila masih sebelum demo. |
| Langkah 6: "Lahan tidak cukup" | Lahan terpakai rencana di langkah 4. Kurangi jumlah dengan tombol − sampai cukup. |
| Langkah 9: banner kiriman tiba tidak ada | Data diatur ulang lebih dari 5 jam yang lalu (batas periksa sudah lewat). Atur ulang, masuk sebagai Imas, lalu ulangi langkah 9. |
| phpMyAdmin tidak terbuka | XAMPP: **Start** Apache. Pakai `http://127.0.0.1/phpmyadmin`. Bila tetap tidak bisa, lewati bukti basis data dan lanjutkan naskah. |
| Port 4174 atau 8000 sudah dipakai | Server sebelumnya belum berhenti. Tutup terminal lamanya, atau di PowerShell: `Get-NetTCPConnection -LocalPort 4174,8000` lalu hentikan prosesnya. |
| Laptop melambat | Tutup tab dan aplikasi lain; jangan menjalankan tes atau tangkapan layar selama demo. |

## Hasil uji

Diuji 12 Oktober 2026 di laptop pengembangan dengan `npm run uji:naskah` terhadap `npm run demo:backend`, setiap putaran diawali atur ulang dan memakai proses Chrome baru (cache kosong). Hasilnya dicatat lagi pada titik putus Kamis 15 Oktober.

**15 putaran berturut-turut, semuanya lolos** (`--ulang 15 --dingin`). Waktu adalah lama mesin menjalankan langkah, bukan lama presenter berbicara:

| Langkah | Terlama (dtk) | Rata-rata (dtk) |
| --- | --- | --- |
| 0. Atur ulang data demo | 2,9 | 1,9 |
| 1. Halaman depan | 1,4 | 1,0 |
| 2. Daftar petani baru, lalu masuk sebagai Arif | 5,5 | 5,1 |
| 3. Beranda | 2,9 | 2,8 |
| 4. Rencana dan modal | 1,9 | 1,8 |
| 5. Jadwal dan pengukuran | 5,5 | 4,9 |
| 6. Mengambil pesanan | 3,1 | 2,7 |
| 7. Pindah ke pembeli | 1,9 | 1,8 |
| 8. Membuat pesanan dan membayar uang muka | 1,5 | 1,0 |
| 9. Konfirmasi kiriman | 1,1 | 1,0 |
| 10. Penutup | 0,2 | 0,1 |

Permintaan API terlama: sekitar 1,7 detik. Penyebabnya, Beranda dan Jadwal mengirim kira-kira 15 permintaan `GET /siklus/{id}/tugas` sekaligus dan server bawaan PHP melayaninya satu per satu. Halaman tetap tampil; presenter cukup menunggu daftar tugas lengkap sebelum menekan tombol.

Skenario lain (`--skenario semua`) lolos di mode backend dan mode tiruan: daftar petani sampai siklus pertama, daftar pembeli sampai "Menunggu verifikasi", dan verifikasi pembeli oleh admin.

Memori saat demo dengan backend (tanpa Chrome): MariaDB sekitar 229 MB, Apache 60 MB, PHP 54 MB, pratinjau Node 128 MB, total sekitar 470 MB.

**3 putaran pertama setelah laptop dinyalakan ulang, semuanya lolos** (12 Oktober 2026: laptop menyala pukul 23.23, uji pukul 23.44, Chrome dingin, `--ulang 3 --dingin`). Langkah terlama 5,1 detik (langkah 2); langkah 5 terlama 4,4 detik; permintaan API terlama 1,6 detik. Tidak ada galat API. Jadi tidak ada perlambatan pada putaran pertama setelah restart dibandingkan 15 putaran di atas.

| Langkah | Putaran 1 | Putaran 2 | Putaran 3 |
| --- | --- | --- | --- |
| 0. Atur ulang data demo | 1,9 | 1,8 | 1,8 |
| 1. Halaman depan | 0,9 | 0,9 | 1,0 |
| 2. Daftar petani baru, lalu masuk sebagai Arif | 5,1 | 4,7 | 4,9 |
| 3. Beranda | 1,9 | 2,4 | 2,4 |
| 4. Rencana dan modal | 1,3 | 2,0 | 1,7 |
| 5. Jadwal dan pengukuran | 3,2 | 4,4 | 4,4 |
| 6. Mengambil pesanan | 2,3 | 2,5 | 2,5 |
| 7. Pindah ke pembeli | 1,8 | 1,9 | 1,9 |
| 8. Membuat pesanan dan membayar uang muka | 0,7 | 1,0 | 0,6 |
| 9. Konfirmasi kiriman | 0,8 | 0,9 | 0,6 |
| 10. Penutup | 0,1 | 0,1 | 0,1 |

**Tema baru (cabang `tema-baru`, D-59, [AG-15], [AG-17], [AG-19]), 13 Oktober 2026: 5 putaran berturut-turut lolos** dengan `npm run demo:backend` (`--ulang 5 --dingin`). Terlama per langkah: atur ulang 2,4; halaman depan 1,0; daftar petani 5,2; Beranda 2,9; rencana 1,9; jadwal 4,3; pesanan 3,0; pindah ke pembeli 2,4; uang muka 1,5; konfirmasi 1,0; penutup 0,1 detik. Tangkapan layar setiap langkah (desktop dan HP dengan keadaan yang sama, `--layar --layar-hp`) dan halaman Masuk, Beranda, Kiriman saya, Notifikasi ada di `docs/tema-baru/tangkapan/`.

**Versi lomba `demo-tema-baru` ([AG-21]), 13 Oktober 2026: 5 putaran berturut-turut lolos** dengan `npm run demo:backend` (`--ulang 5 --dingin`); terlama 4,8 detik (daftar petani) dan 4,5 detik (jadwal).

**Versi `demo-animasi` ([AG-22], [AG-23]), 14 Oktober 2026: 5 putaran dingin berturut-turut lolos dengan animasi menyala**, juga 5/5 dengan `--tanpa-animasi`, dan semua skenario (`--skenario semua`, termasuk `akun-pembeli`) lolos. Waktu terlama per langkah (dtk), dibanding AG-21:

| Langkah | AG-21 | Animasi menyala | Tanpa animasi |
| --- | --- | --- | --- |
| 0. Atur ulang | 1,9 | 2,7 | 1,9 |
| 1. Halaman depan | 0,9 | 1,2 | 0,9 |
| 2. Daftar petani | 4,8 | 7,2 | 6,4 |
| 3. Beranda | 2,4 | 3,5 | 2,9 |
| 4. Rencana dan modal | 1,5 | 3,2 | 3,1 |
| 5. Jadwal dan pengukuran | 4,5 | 7,5 | 5,4 |
| 6. Mengambil pesanan | 2,4 | 5,0 | 4,3 |
| 7. Pindah ke pembeli | 1,8 | 2,6 | 2,3 |
| 8. Uang muka | 0,8 | 2,5 | 2,1 |
| 9. Konfirmasi kiriman | 0,9 | 2,4 | 1,9 |
| 10. Penutup | 0,2 | 0,6 | 0,5 |

Kolom "tanpa animasi" ikut naik dibanding AG-21, jadi sebagian kenaikan datang dari beban mesin saat uji (server pratinjau tambahan menyala). Selisih karena animasi sendiri terutama waktu skrip menunggu animasi masuk halaman dan kartu bertahap selesai sebelum mengklik (paling besar di langkah jadwal, sekitar 2 detik). Bila saat latihan terasa tersendat, matikan sakelar animasi (lihat aturan di atas).

Cara mengulang uji setelah restart:

```powershell
# Terminal 1, biarkan menyala:
cd "C:\Users\Sandy\Tani Muda"
npm run demo:backend
# Terminal 2:
cd "C:\Users\Sandy\Tani Muda"
npm run uji:naskah -- --url http://localhost:4174 --ulang 3 --dingin --catatan uji-restart
```

Catatan uji tersimpan di `frontend\uji-restart`. Sesudahnya atur ulang data seperti langkah 5 di atas.

**Gerbang Final Versi Lomba `demo-lomba` ([AG-34]), 15 Oktober 2026: 27 dari 27 skenario lolos berturut-turut** (`--skenario semua --ulang 3`):
Semua 9 skenario:
1. `naskah` (alur 10 langkah utama)
2. `daftar-petani`
3. `daftar-pembeli`
4. `verifikasi-pembeli`
5. `akun-pembeli` (menu akun, profil, ubah nama, keluar)
6. `stok-cod` (tambah stok panen, transaksi COD pembeli, terima & kirim, terima & selesai)
7. `chat` (obrolan via titik peta)
8. `chat-nomor` (obrolan via nomor kontak HP petani +6281200000001)
9. `navigasi-pembeli-hp` (kapsul 4 tab: Pesanan, Stok, Peta, Chat di layar 390px + dropdown akun pembeli: Profil, Riwayat, Keluar)

Seluruhnya hijau 100% pada 3 putaran berturut-turut. Bukti tangkapan layar desktop (1440px) dan mobile (390px) tersedia di `docs/tangkapan/aplikasi/`.

**Pembaruan Dropdown & Kalender `demo-lomba` ([AG-39], D-66), 18 Oktober 2026: 27 dari 27 skenario lolos berturut-turut** (`--skenario semua --ulang 3`):
- Seluruh elemen `<select>` dan `<input type="date">` bawaan diganti dengan komponen headless yang sudah teruji aksesibilitasnya (`@headlessui/react` Listbox dengan pencarian & lembar bawah HP, serta `react-day-picker` dengan lokal Indonesia dan navigasi keyboard).
- Anggaran ukuran bundel terjaga ketat di bawah 200 kB gzip (`/` 160,8 kB gzip, `/beranda` 177,2 kB gzip; kalender dimuat secara lazy dalam chunk terpisah 22,3 kB gzip).
- Seluruh pengujian komponen unit (`dropdown-kalender.test.tsx`), pengujian kontrak backend (434/434 lolos), dan seluruh 9 skenario uji naskah (27/27) lolos 100% pada 3 putaran berturut-turut.
