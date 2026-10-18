# Proyek Video Teaser Tani Muda (Remotion) [AG-43]

Direktori ini berisi kode sumber proyek video teaser motion graphic penuh berdurasi **02:50 (170,0 detik / 5.100 frame pada 30 fps)**, dirancang menggunakan [Remotion](https://www.remotion.dev/) dan memadukan rekaman aplikasi asli Tani Muda dengan grafis gerak presisi, 100% ikon SVG buatan sendiri, dan narasi pengisi suara bertahap.

Durasi video **secara mutlak di bawah 3 menit (180 detik)** sesuai ketentuan perlombaan.

---

## 1. Panduan Visual & Anti-Slop

Proyek ini menerapkan standar estetika ketat:
- **Tanpa Emoji:** 0% emoji dalam bentuk apa pun.
- **Tanpa Pustaka Ikon Bawaan:** Tidak menggunakan Lucide, Heroicons, Material, atau font ikon luar.
- **Tanpa Kaca Gelap / Neon:** Latar belakang krem terang hangat (`#faf8f5`) berbasis token Tani Muda (`daun-tua` #1b4332, `daun-terang` #52b788, `tanah` #6c584c, `emas` #d4a373).
- **Tanpa Badge Kapsul / Chip Pil:** Teks informatif disajikan bersih dan proporsional.
- **Tipografi Kinetik:** Kata dan baris masuk bertahap dengan animasi spring, ukuran besar, maksimal 6 kata per layar.
- **Subtitel Dibakar:** Teks putih dengan tepi kontras gelap (`#1b4332`), tanpa kotak latar.
- **Sumber Data Sensus:** Dicantumkan sebagai teks kecil biasa di pojok kanan bawah tanpa kotak (`Sensus Pertanian 2023, BPS`).
- **Tanpa Aset AI Generatif:** Tidak menggunakan gambar atau video buatan AI (Midjourney, DALL-E, Sora). Seluruh aset berupa kode SVG lokal dan rekaman peramban nyata.

---

## 2. Koleksi 17 Ikon SVG Buatan Sendiri (`video/src/ikon/`)

Seluruh ikon digambar sendiri di atas grid 64×64 px, ketebalan garis 4 px, ujung membulat (`round`), 2 warna token, dan path terpisah agar dapat dianimasikan bertahap (`evolvePath`):

| # | Nama Ikon | ID / Berkas | Peran dalam Narasi |
|---|---|---|---|
| 01 | Benih & Tunas | `IkonBenihTunas` | Titik awal siklus tanam, germinasi dari tanah |
| 02 | Buku Terbuka | `IkonBukuTerbuka` | Pilar 01: Belajar modul dan resep budidaya teruji |
| 03 | Kalkulator | `IkonKalkulator` | Pilar 02: Hitung modal transparan dan titik impas BEP |
| 04 | Gembor Penyiram | `IkonGembor` | Pilar 03: Rawat harian, penyiraman, dan nutrisi |
| 05 | Keranjang Panen | `IkonKeranjang` | Pilar 04: Panen segar dan kepastian jual |
| 06 | Timbangan Hasil | `IkonTimbangan` | Penimbangan adil dan transparansi volume panen |
| 07 | Grafik Harga Jatuh | `IkonGrafikTurun` | Masalah: Harga anjlok saat pasokan panen melimpah |
| 08 | Daun & Hama Ulat | `IkonDaunUlat` | Masalah: Risiko gagal panen akibat salah takaran |
| 09 | Rantai Tengkulak | `IkonRantai` | Masalah: Rantai perantara panjang pemotong laba |
| 10 | Truk Pengiriman | `IkonTruk` | Masalah: Distribusi panen berhenti di persimpangan |
| 11 | Kamera Tanaman | `IkonKameraDaun` | Fitur: Deteksi cepat gejala daun berlabel dugaan |
| 12 | Gelembung Chat | `IkonGelembungChat` | Fitur: Chatbot penyuluh 24 jam dan pesan petani |
| 13 | Cuaca Terpadu | `IkonCuaca` | Fitur: Prakiraan cuaca desa adaptif BMKG 3 hari |
| 14 | Kotak Stok | `IkonKotakStok` | Fitur: Pasar stok panen siap jual sekitar dan COD |
| 15 | Petani Muda | `IkonPetaniMuda` | Data: Hamparan 100 petani generasi penerus 2045 |
| 16 | Koin Emas | `IkonKoin` | Transaksi: Uang muka komitmen dan dana tertahan |
| 17 | Pin Bertunas | `IkonPinBertunas` | Peta: Lokasi kebun dibulatkan demi privasi petani |

Pratinjau seluruh ikon dapat dilihat pada: `video/keluaran/pratinjau-ikon.png`.

---

## 3. Struktur 10 Adegan Storyboard (Total: 170 Detik)

| No | Rentang Waktu | Durasi | Nama Adegan | Gerakan Wajib |
|---|---|---|---|---|
| 01 | 0:00 – 0:12 | 12 dtk (360 frame) | `Pembuka` | Garis tanah tergambar → benih jatuh memantul → tunas tumbuh → merakit logo Tani Muda → huruf masuk bertahap → slogan kinetik. |
| 02 | 0:12 – 0:27 | 15 dtk (450 frame) | `Data Sensus` | Hamparan 100 sosok petani muncul bergelombang, 22 sosok berubah hijau cerah, angka berhitung ke 21,93%, sumber sensus BPS. |
| 03 | 0:27 – 0:45 | 18 dtk (540 frame) | `Masalah` | 4 shot: (a) grafik anjlok saat panen; (b) ulat memakan daun berlubang; (c) koin menyusut di rantai tengkulak; (d) truk terhenti di persimpangan. |
| 04 | 0:45 – 0:58 | 13 dtk (390 frame) | `Solusi` | Lingkaran siklus orbit tergambar, 4 ikon pilar (Belajar, Hitung, Rawat, Jual) masuk berurutan, titik cahaya beredar di lintasan. |
| 05 | 0:58 – 1:20 | 22 dtk (660 frame) | `Hitung Modal & BEP` | Rekaman asli di bingkai HP masuk dari bawah, zoom ke angka modal, angka terangkat menjadi koin Rp 185.000, garis BEP memotong grafik. |
| 06 | 1:20 – 1:39 | 19 dtk (570 frame) | `Rawat Tanaman Presisi` | Rekaman Beranda, penggaris umur tanaman, jarum pengukur busur pH air bergerak ke 6.2, centang tugas harian tergambar. |
| 07 | 1:39 – 2:06 | 27 dtk (810 frame) | `Jual Panen Pasti` | Layar terbagi dua (Pembeli & Petani), koin uang muka terbang melengkung ke kotak dana ditahan bergembok, dana cair setelah konfirmasi panen. |
| 08 | 2:06 – 2:28 | 22 dtk (660 frame) | `Fitur Pintar` | 5 shot cepat: garis pindai daun berlabel dugaan (tanpa kapsul), animasi titik chat, cuaca hujan/matahari, peta privasi kebun, tumpukan stok. |
| 09 | 2:28 – 2:41 | 13 dtk (390 frame) | `Bertahan & Gamifikasi` | Lencana capaian bertingkat (Benih hingga Panen Raya) naik berurutan dengan percikan geometris, didukung keandalan offline-first PWA. |
| 10 | 2:41 – 2:50 | 9 dtk (270 frame) | `Penutup & Identitas` | Logo merakit diri, tema lomba, lokasi **Kabupaten Klaten, Jawa Tengah**, karya peserta **Sandy**. |

---

## 4. Audio & Lisensi

- **Narasi Suara:** Diambil dari berkas per adegan `video/audio/narasi/01.mp3` … `10.mp3` (disinkronkan ke `video/public/audio/narasi/`).
- **Musik Latar:** `video/audio/musik.mp3` (Komposisi Akustik Bebas Royalti, 44.1 kHz Stereo). Otomatis mengecil (ducking) ke volume 0,20 saat narasi berbicara, dan kembali ke 0,38 saat jeda antaradegan.
- **Efek Suara:** Menggunakan nada sintetis harmonis tanpa efek suara bising pihak ketiga.

---

## 5. Perintah Penggunaan

```bash
# 1. Periksa durasi video (< 180 detik)
npm run cek-durasi

# 2. Render lembar pratinjau ikon ke keluaran/pratinjau-ikon.png
npm run still-ikon

# 3. Render 10 bingkai papan gaya still ke keluaran/papan-gaya/01..10.png
npm run papan-gaya

# 4. Render pratinjau resolusi hemat 0.5x (skala 50%)
npm run pratinjau

# 5. Render video final 1080p Full HD (konkurensi 1)
npm run render
```
