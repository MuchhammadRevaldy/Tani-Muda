# Proyek Video Teaser Tani Muda (Remotion)

Direktori ini berisi kode sumber proyek video teaser berdurasi **02:50 (170 detik / 5.100 frame pada 30 fps)**, dirancang dengan [Remotion](https://www.remotion.dev/) dan direkam langsung dari aplikasi asli Tani Muda menggunakan Playwright.

Durasi video **secara mutlak di bawah 3 menit (180 detik)** sesuai batasan teknis perlombaan.

---

## 1. Alur Pembuatan Video

1. **Rekam Interaksi Aplikasi Asli:**
   ```bash
   node scripts/uji-naskah.mjs --rekam
   ```
   Perintah ini akan menjalankan peramban Chromium/Edge sungguhan, menyimulasikan interaksi nyata di desktop (1920×1080) dan HP (390×844) lengkap dengan penunjuk kursor hijau dan efek riak klik yang natural. Berkas rekaman `.webm` disimpan di `video/rekaman/` dan disinkronkan ke `video/public/rekaman/`.

2. **Pratinjau Video (Remotion Studio):**
   ```bash
   cd video
   npm start
   ```
   Membuka Remotion Studio interaktif di peramban untuk memeriksa transisi, tata letak, dan animasi adegan demi adegan.

3. **Pemeriksaan Durasi Otomatis:**
   ```bash
   npm run cek-durasi
   ```
   Memvalidasi bahwa durasi komposisi `TeaserTaniMuda` tidak melampaui 180 detik (maksimal 5.400 frame).

4. **Render Video Final:**
   ```bash
   npm run render
   ```
   Merender video berkualitas tinggi ke `video/keluaran/teaser-tani-muda.mp4` dengan pengaturan stabil: konkurensi 1, codec H.264, format piksel `yuv420p`, dan bitrate terkontrol.

---

## 2. Struktur 9 Adegan Storyboard (170 Detik)

| No | Rentang Waktu | Durasi | Nama Adegan | Fokus & Aset Visual |
|---|---|---|---|---|
| 1 | 0:00 – 0:12 | 12 dtk (360 frame) | `Pembuka` | Logo bertunas, tipografi Outfit, tagline *"Tanam dengan pembeli yang pasti"*. |
| 2 | 0:12 – 0:30 | 18 dtk (540 frame) | `Masalah` | Penghitung animasi 21,93% (BPS), 4 kartu ketidakpastian petani, bonus demografi & Generasi Emas 2045. |
| 3 | 0:30 – 0:42 | 12 dtk (360 frame) | `Solusi` | Alur melingkar 4 pilar: Belajar → Hitung → Rawat → Jual. |
| 4 | 0:42 – 1:05 | 23 dtk (690 frame) | `Hitung` | Bingkai laptop memutar `04-hitung.webm` (simulasi modal sawi, rincian biaya, BEP). |
| 5 | 1:05 – 1:25 | 20 dtk (600 frame) | `Rawat` | Layar memutar `05-rawat.webm` (penggaris umur tanaman, ceklis tugas, rekomendasi pH & PPM). |
| 6 | 1:25 – 1:55 | 30 dtk (900 frame) | `Jual` | Layar memutar `06-jual.webm` (pembeli bayar DP, petani terima pesanan, konfirmasi panen & rating bintang 5, animasi koin dana aman). |
| 7 | 1:55 – 2:25 | 30 dtk (900 frame) | `FiturPintar` | Smartphone memutar fitur pintar: deteksi penyakit AI dengan label dugaan (`07-deteksi.webm`), chatbot pertanian (`07-chatbot.webm`), cuaca BMKG (`07-cuaca.webm`), peta petani dengan privasi 2 desimal (`07-peta.webm`), stok panen (`07-stok.webm`), serta chat (`07-chat.webm`). |
| 8 | 2:25 – 2:40 | 15 dtk (450 frame) | `PetaniBertahan` | Bingkai HP memutar `08-level.webm` (poin level Petani Teladan, lencana 3D kebun, dan mode offline tanpa internet). |
| 9 | 2:40 – 2:55 | 15 dtk (450 frame) | `Penutup` | Logo, identitas peserta: **Sandy — Kab. Klaten, Jawa Tengah**, ajakan aksi kedaulatan pangan. |

---

## 3. Log Musik Latar & Audio (Bebas Royalti)

Audio video menggunakan teknik **audio ducking dinamis**: volume musik latar secara otomatis mengecil (turun ke level 0,15) saat narasi pengisi suara sedang berbicara, dan kembali mengalun lembut (level 0,45) saat jeda atau transisi adegan.

| Berkas | Jenis | Sumber / Lisensi | Keterangan |
|---|---|---|---|
| `video/audio/narasi.mp3` | Suara Narator | Sintesis Suara Natural Bahasa Indonesia (Script: `video/naskah-narasi.md`) | Sinkron 1:1 dengan jeda adegan pada komposisi Remotion. |
| `video/audio/musik.mp3` | Musik Latar | Suara Komposisi Akustik Sintesis Bebas Royalti (44.1 kHz Stereo) | Akor hangat, tempo sedang, nuansa optimis dan ramah pedesaan. Bebas royalti komersial & non-komersial. |

---

## 4. Bebas Aset AI Generatif

Proyek video teaser ini mematuhi aturan ketat perlombaan:
- Seluruh rekaman peramban diambil dari UI web aplikasi asli Tani Muda yang berjalan nyata.
- Seluruh ikon dan ilustrasi menggunakan berkas SVG dan aset asli yang telah ada di repositori (`frontend/public/`).
- Tipografi menggunakan font Outfit lokal.
- Tanpa gambar atau video hasil generate AI generatif (Midjourney, DALL-E, Sora, dsb.).
