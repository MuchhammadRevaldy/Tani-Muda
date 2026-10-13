# Serah terima sesi diskusi Tani Muda (14 Oktober 2026)

Untuk sesi Claude baru yang melanjutkan peran **teman diskusi dan senior engineer** bagi pemilik produk. Tempel dokumen ini di awal sesi baru. Rangkuman teknis repo dari agen Antigravity (AG-26) tetap berlaku, dengan koreksi di bagian 4.

## 1. Alur kerja (jangan diubah)

1. **Pemilik produk** (Revaldy, menulis dalam Bahasa Indonesia santai) menempel laporan agen Antigravity.
2. **Claude (sesi ini)** memeriksa klaim laporan langsung ke repo (`git log`, tag, berkas), memberi penilaian kritis, lalu menyusun **teks siap tempel** untuk Antigravity.
3. Setiap teks siap tempel diberi tag **`[AG-nn] Judul`** di baris pertama. Nomor berikutnya = nomor tertinggi yang pernah dipakai + 1, **termasuk tag yang dibuat agen sendiri**. Daftar ada di memori `tag-prompt-antigravity.md`.
4. **Claude tidak mengubah repo.** Kode dan dokumen dikerjakan Antigravity. Claude boleh membaca repo, dan membuat aset (SVG, gambar acuan, dokumen spesifikasi) di folder acuan, bukan di repo.
5. **Antigravity** commit lokal dengan tag `[AG-nn]`, tanpa baris Co-Authored-By. **Push hanya oleh pemilik produk.** Riwayat yang sudah di-push tidak boleh diubah.
6. Setiap pekerjaan berisiko dikerjakan dengan **gerbang**: lint, typecheck, test, build, build:demo, Pest, Pint, Larastan hijau, ditambah `uji:naskah` dengan `demo:backend`. Bila lolos, buat **tag demo baru**; tag sebelumnya menjadi jalan mundur.
7. **Hemat kuota Claude:** kuota mingguan tersisa sekitar 29% sampai Senin 19 Oktober pagi. Periksa hanya laporan yang butuh keputusan; gabungkan pertanyaan.

## 2. Proyek dan tanggal

- **Tani Muda**, PWA untuk petani muda (belajar, hitung modal, rawat dengan pengingat, jual lewat "Pesan sebelum tanam"). Repo `C:\Users\Sandy\Tani Muda` (`frontend/` React, `backend/` Laravel 13 + MariaDB XAMPP, `shared/`).
- **Lomba ISCOMFEST: Minggu, 18 Oktober 2026.** Demo lokal dari laptop dengan `npm run demo:backend` (port 4174). Juri ingin melihat basis data, jadi naskah memuat bukti di phpMyAdmin.
- Dokumen acuan di `docs/`: `keputusan.md` (sampai D-63), `aturan-proyek.md`, `rencana-kerja.md`, `kontrak-api.md`, `arsitektur-backend.md`, `naskah-demo.md`. `docs/prd-tani-muda.md` **tidak boleh diubah**; tambahan lewat PRD tambahan dan `keputusan.md`.

## 3. Keadaan repo (diperiksa 14 Oktober dini hari)

| Tag | Isi |
| --- | --- |
| `demo-logo` (`c115ce6`) | **Versi lomba sekarang** (logo baru) |
| `demo-animasi` (`5221947`) | Tema baru + animasi + profil pembeli |
| `demo-tema-baru` (`6f9420c`) | Tema baru tanpa animasi |
| `demo-aman` (`c769086`) | Tema lama |

- Repo sudah di **GitHub privat** `MuchhammadRevaldy/Tani-Muda` (`origin`), `master` sinkron dengan `origin/master`. Tag baru perlu di-push pemilik: `git push origin master --tags`.
- Mundur ke versi lama: `git switch --detach <tag>`, lalu `npm run demo:backend`.
- Sakelar animasi: `$env:VITE_ANIMASI='mati'; npm run demo:backend`.

## 4. Koreksi atas rangkuman Antigravity (AG-26)

| Di AG-26 | Yang benar |
| --- | --- |
| Lomba "Sabtu 18 Oktober" | **Minggu** 18 Oktober 2026 |
| "Belum pernah di-push; jangan push sampai pemilik memberi alamat" | Repo **sudah** di GitHub privat. Agen tetap tidak push; pemilik yang push. |
| "Kode dibekukan Kamis 15 Oktober malam" | Berlaku **sampai AG-28 dikirim**. Begitu AG-28 dijalankan, pembekuan pindah ke **Sabtu 17 Oktober pukul 12.00** (D-64). |
| "AG-25 belum dikerjakan" | AG-25 **tidak dikirim** dan digantikan AG-28 (isinya menjadi F-01). |
| Tag AG-26 dan AG-27 rancangan Claude | Nomor AG-26 sudah dipakai agen untuk serah terima, jadi rencana 12 fitur menjadi **AG-28**. AG-27 digabung ke AG-28. |

## 5. Keputusan terbaru pemilik produk

Pemilik produk memutuskan **12 fitur tambahan dikerjakan sebelum lomba** (sudah diberi tahu risikonya dan memilih tetap jalan). Spesifikasi lengkap ada di `prd-fitur-tambahan.md` (folder acuan, bagian 7):

| No | Fitur | Hari |
| --- | --- | --- |
| F-00 | Fondasi AI (`PenyediaAI`, driver openai + tiruan) | Rabu |
| F-01 | Saran memperbanyak untung di lahan kecil, item opsional, cek pH dengan kertas pH universal | Rabu |
| F-02 | Tanaman baru: cabai rawit, tomat, selada | Rabu |
| F-03 | Level (Benih → Panen Raya) dan 10 lencana | Rabu |
| F-04 | Deteksi penyakit dari foto (API AI, berpagar) | Kamis |
| F-05 | Chatbot RAG dari resep, modul, paper akses terbuka | Kamis |
| F-06 | Cuaca (Open-Meteo) dan kecocokan suhu | Kamis |
| F-07 | Marketplace stok siap jual + COD | Jumat |
| F-08 | Peta petani untuk pembeli, radius 10–15 km | Jumat |
| F-09 | Chat petani dan pembeli | Jumat |
| F-10 | Harga panen dari AI yang memantau berita | Sabtu pagi |
| F-11 | Saran setelah semua tugas hari ini selesai | Sabtu pagi |

Pagar yang sudah disepakati dan **tidak boleh hilang**:
- Setiap fitur bersakelar; tag harian (`demo-rabu` … `demo-lomba`); beku **Sabtu 12.00**.
- Fitur baru **hanya di backend** (pengecualian D-20); di mode tiruan sakelar mati.
- Kunci API hanya di `backend/.env`; pemilik mengisinya sendiri, tidak lewat chat.
- Harga dari berita: API pencarian resmi, wajib sumber + tanggal + tautan, label "harga pasar", **tidak mengisi harga otomatis**.
- Deteksi penyakit dan chatbot: hasil berupa dugaan, tanpa dosis atau merek pestisida, tombol ke penyuluh.
- **Peta petani:** pemilik produk sempat meminta privasi diabaikan. Claude menolak bagian itu (UU PDP No. 27/2022, keamanan petani) dan hanya menulis versi **atas persetujuan petani, lokasi dibulatkan sekitar 1 km, hanya ke pembeli terverifikasi**. Pertahankan sikap ini.
- Monstera di luar cakupan (disetujui pemilik).
- Naskah 7 menit tidak diisi semua fitur; satu segmen "Fitur pintar" sekitar 1,5 menit.

## 6. Berkas di folder acuan

Folder: `C:\Users\Sandy\AppData\Local\Temp\claude\C--Users-Sandy-Tani-Muda\f4fc21bf-848d-4710-b79d-191be07857b8\scratchpad\tema-baru\acuan-lokal\` (**folder sementara**; pemilik diminta menyalinnya ke flashdisk, dan AG-28 menyalin isinya ke repo).

| Berkas | Isi |
| --- | --- |
| `prd-fitur-tambahan.md` | Spesifikasi 12 fitur, aturan kerja, bagian 3 perubahan basis data |
| `lencana/*.svg` | 15 lencana 3D (5 level segi enam, 10 pencapaian bulat), nama berkas = kode lencana |
| `logo/` | Logo SVG yang sudah terpasang (versi landai) |
| `*.svg` lain | Ilustrasi komoditas 3D, ilustrasi Masuk, contoh foto panen, sawi bergerak, memuat tunas |
| `serah-terima-sesi.md` | Dokumen ini |

Kanvas desain di Claude: "Tema Baru Tani Muda" https://claude.ai/artifact/L2C4Z5J2nbvegfHE69RGXb

## 7. Langkah berikutnya

1. Pemilik: salin folder acuan ke flashdisk; push tag (`git push origin master --tags`).
2. Pemilik: isi `OPENAI_API_KEY` di `backend/.env` sendiri; siapkan kunci API berita (sebelum Sabtu), PDF paper akses terbuka (sebelum Kamis), hotspot cadangan untuk tempat lomba.
3. Kirim **AG-28** (di bawah).
4. Periksa laporan gelombang Rabu: tag `demo-rabu`, fitur mana yang lolos, uji naskah dengan sakelar menyala dan mati.

## 8. Teks AG-28 (siap tempel ke Antigravity)

> **[AG-28] PRD tambahan 12 fitur dan gelombang Rabu**
>
> Koreksi atas rangkuman AG-26: lomba hari **Minggu** 18 Oktober 2026; repo sudah di GitHub privat (`origin`), agen tetap tidak push dan tidak mengubah riwayat; AG-25 tidak dikirim dan isinya menjadi F-01 di bawah.
>
> Pemilik produk memutuskan 12 fitur tambahan dikerjakan sebelum lomba. Spesifikasinya di folder acuan:
> `C:\Users\Sandy\AppData\Local\Temp\claude\C--Users-Sandy-Tani-Muda\f4fc21bf-848d-4710-b79d-191be07857b8\scratchpad\tema-baru\acuan-lokal\`
>
> 1. **Langkah pertama:** salin `prd-fitur-tambahan.md` ke `docs/prd-fitur-tambahan.md`, `serah-terima-sesi.md` ke `docs/serah-terima-sesi.md`, folder `lencana/` ke `docs/tema-baru/acuan/lencana/`, lalu commit. Folder sumber bersifat sementara. **`docs/prd-tani-muda.md` tidak diubah** (aturan 7.8).
> 2. Catat **D-64** di `keputusan.md`: PRD tambahan v1.1 disahkan; pembekuan kode dipindah ke **Sabtu 17 Oktober pukul 12.00**; setiap fitur bersakelar; tag harian; fitur Tahap 7 hanya di backend (pengecualian D-20, sakelar mati di mode tiruan); Policy dan tes akses silang wajib untuk tabel baru berisi data pribadi atau transaksi; peta petani hanya atas persetujuan dengan lokasi dibulatkan sekitar 1 km (menyesuaikan D-06, UU PDP); monstera di luar cakupan. Tambahkan PRD tambahan ke daftar acuan di `aturan-proyek.md` dan README.
> 3. Tambahkan **Tahap 7** di `rencana-kerja.md`: T7.00–T7.11 sesuai F-00–F-11, dengan Tujuan, Berkas, Selesai bila, Prasyarat, dikelompokkan per hari seperti bagian 2 PRD tambahan. Perbarui `naskah-demo.md`: tanggal pembekuan baru dan rencana segmen "Fitur pintar" sekitar 1,5 menit.
> 4. **Basis data** mengikuti bagian 3 PRD tambahan: satu migrasi baru per fitur (migrasi yang sudah di-push tidak diubah), kontrak dulu, aturan hapus eksplisit dan `CHECK` dengan tes, `pembayaran` dan `rating` mendapat `pesanan_stok_id` lewat migrasi `ALTER` dengan `CHECK` tepat satu rujukan, seeder data contoh dan `demo:atur-ulang` mencakup tabel baru, seeder produksi tanpa data contoh.
> 5. Buat sakelar fitur dulu (`VITE_FITUR_*`, `config/fitur.php`, `pengaturan-demo.mjs`, `.env.example`), lalu kerjakan **gelombang Rabu** berurutan: F-00, F-01, F-02, F-03. Lencana F-03 memakai SVG jadi di `lencana/` (salin ke `frontend/public/lencana/`, nama berkas = kode lencana); lencana terkunci memakai CSS `grayscale` dan `opacity`. Ilustrasi selada pakai placeholder dulu.
> 6. Kunci API tidak pernah ditulis di kode, commit, atau laporan. Bila `OPENAI_API_KEY` belum ada di `backend/.env`, pakai driver `tiruan`.
> 7. Gerbang akhir hari: semua pemeriksaan hijau; `uji:naskah --ulang 3` dengan `demo:backend` lolos dengan semua sakelar menyala **dan** semua sakelar mati. Bila lolos, tag `demo-rabu`. Fitur yang belum lolos dimatikan sakelarnya, jangan menahan tag.
> 8. Laporkan per fitur: selesai, sebagian (dengan sisanya), atau belum. Sebutkan tag `[AG-28]` di commit dan laporan. Nomor tag berikutnya dimulai dari AG-29.
