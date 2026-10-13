# PRD tambahan Tani Muda v1.1: 12 fitur sebelum lomba

14 Oktober 2026 · ditetapkan pemilik produk · disahkan lewat `keputusan.md` D-64

Dokumen ini **menambah** PRD v1 (`docs/prd-tani-muda.md`), tidak menggantinya. PRD v1 tidak diubah (aturan proyek 7.8). Bila dokumen ini bertentangan dengan PRD v1, dokumen ini yang berlaku untuk fitur yang dibahasnya. `keputusan.md` tetap mengalahkan keduanya.

Pemilik produk memutuskan semua fitur di bawah dikerjakan **sebelum lomba 18 Oktober 2026**. Karena waktunya sempit, setiap fitur wajib bisa dimatikan tanpa mengubah kode, sehingga fitur yang belum stabil tidak merusak demo.

---

## 0. Aturan kerja khusus dokumen ini

| Aturan | Isi |
| --- | --- |
| Sakelar per fitur | Setiap fitur punya sakelar `VITE_FITUR_<NAMA>` (frontend, publik) dan `FITUR_<NAMA>` (backend, `config/fitur.php`). Fitur mati = menu dan tombolnya tidak tampil, endpoint menjawab `501 BELUM_TERSEDIA`. Semua sakelar terkumpul di `scripts/pengaturan-demo.mjs` dan `backend/.env.example`. |
| Tag harian | Setiap akhir hari, bila gerbang lolos, buat tag `demo-rabu`, `demo-kamis`, `demo-jumat`, `demo-sabtu`. Tag hari sebelumnya adalah jalan mundur. |
| Gerbang harian | lint, typecheck, test (cakupan `src/lib` ≥ 90%), build, build:demo, Pest, Pint, Larastan hijau; `uji:naskah --ulang 3` dengan `demo:backend` lolos **dengan semua sakelar menyala dan dengan semua sakelar mati**. |
| Pembekuan | **Sabtu 17 Oktober pukul 12.00.** Setelah itu hanya perbaikan yang menghentikan demo. |
| Rahasia | `OPENAI_API_KEY`, kunci API pencarian berita, dan kunci lain **hanya** di `backend/.env`. Tidak pernah di `VITE_*`, respons API, log, atau commit. |
| Tanpa internet | Setiap fitur yang memanggil layanan luar punya driver `tiruan` dan jawaban rapi saat gagal. Jawaban tiruan selalu berlabel "Contoh jawaban, mode tanpa internet". |
| Data contoh | Angka resep, rentang suhu, dan resep tanaman baru berlabel "CONTOH, belum divalidasi penyuluh" (D-12). |
| Demo | Naskah 7 menit tidak diisi semua fitur. Tambah satu segmen "Fitur pintar" sekitar 1,5 menit berisi 2–3 fitur terkuat; fitur lain disebut di slide. |

## 1. Ringkasan 12 fitur

| No | Fitur | Pilar | Sakelar | Gelombang |
| --- | --- | --- | --- | --- |
| F-00 | Fondasi AI (`PenyediaAI`) | semua | `AI` | Rabu |
| F-01 | Saran memperbanyak untung, item opsional, cek pH dengan kertas | Hitung | `SARAN_UNTUNG` | Rabu |
| F-02 | Tanaman baru: cabai rawit, tomat, selada | Hitung | `TANAMAN_BARU` | Rabu |
| F-03 | Level dan lencana pengguna | semua | `LEVEL` | Rabu |
| F-04 | Deteksi penyakit dari foto | Hitung | `DETEKSI` | Kamis |
| F-05 | Chatbot "Tanya Tani Muda" dengan basis pengetahuan | Belajar | `CHATBOT` | Kamis |
| F-06 | Cuaca dan kecocokan suhu tanaman | Hitung | `CUACA` | Kamis |
| F-07 | Marketplace stok siap jual + COD | Jual | `STOK` | Jumat |
| F-08 | Peta petani di sekitar pembeli | Jual | `PETA` | Jumat |
| F-09 | Chat petani dan pembeli | Jual | `CHAT` | Jumat |
| F-10 | Harga panen dari pemantauan berita | Jual | `HARGA_BERITA` | Sabtu pagi |
| F-11 | Saran setelah semua tugas hari ini selesai | Hitung | `SARAN_HARIAN` | Sabtu pagi |

Di luar cakupan: **monstera** dan tanaman hias lain (tidak dipanen per kg dan tidak cocok dengan model siklus dan pesanan).

---

## F-00. Fondasi AI

**Tujuan.** Satu pintu untuk semua panggilan model AI, supaya penyedia bisa diganti, biaya terkendali, dan demo tetap jalan tanpa internet.

**Teknis**
- Antarmuka `App\Domain\AI\PenyediaAI` dengan metode: `teks(array $pesan, array $opsi): JawabanAI`, `gambar(string $jalurBerkas, array $pesan, array $opsi): JawabanAI`, `embedding(array $teks): array`, `jsonTerstruktur(array $pesan, array $skema): array`.
- Driver `openai` (`AI_DRIVER=openai`, `OPENAI_API_KEY`, `AI_MODEL_TEKS`, `AI_MODEL_GAMBAR`, `AI_MODEL_EMBEDDING`) dan driver `tiruan` (jawaban tetap dari berkas JSON di `shared/data-contoh/ai/`, berlabel).
- Batas: waktu tunggu 30 detik, pemakaian per pengguna per hari (`AI_BATAS_HARIAN`, bawaan 30 panggilan), tabel `log_ai` (pengguna, fitur, token, perkiraan biaya, waktu, galat) tanpa menyimpan isi foto.
- Galat penyedia → `503 AI_TIDAK_TERSEDIA` dengan pesan "Fitur pintar sedang tidak bisa dipakai. Coba lagi nanti."
- Persetujuan privasi diperbarui: foto dan pertanyaan bisa dikirim ke penyedia AI pihak ketiga. Kolom `pengguna.setuju_ai_pada`; fitur AI meminta centang persetujuan sekali.

**Selesai bila.** Tes Pest untuk kedua driver, batas harian, galat penyedia, dan kunci tidak pernah muncul di respons atau log.

---

## F-01. Saran memperbanyak untung, item opsional, cek pH dengan kertas

**Masalah.** Di lahan kecil (mis. 20 m²) biaya tetap (tenaga, air, alat) tidak ikut mengecil, sehingga rencana sering berpotensi rugi atau untungnya tipis.

**Kebutuhan**
- **F-01a Saran memperbanyak untung.** Saat rencana berpotensi rugi atau untung di bawah ambang (konfigurasi `ambang_untung_tipis`), ringkasan kalkulator menampilkan paling banyak 3 saran **yang dihitung dari angka rencana itu sendiri**, diurutkan dari dampak rupiah terbesar:
  1. kerjakan sendiri biaya tetap terbesar yang bisa dikerjakan sendiri (tenaga) → "untung naik Rp…";
  2. jual lewat pesanan terdekat yang harganya lebih tinggi → "untung naik Rp…";
  3. lepas item opsional yang masih dihitung → "modal turun Rp…";
  4. tanam tanaman umur pendek berulang dalam 3 bulan (dari komoditas berresep) → "n kali panen, perkiraan untung Rp…";
  5. tanam bertingkat (vertikultur) bila metode mendukung dan faktornya ada di data.
  Saran yang tidak berlaku tidak tampil. Tanpa AI.
- **F-01b Item opsional.** Kolom `resep_input.opsional` (boolean) dan `resep_input.keterangan_opsional`. Data contoh: pestisida nabati dan POC opsional. Di kalkulator berlabel "Opsional", ikut dihitung secara bawaan, bisa dimatikan dengan saklar.
- **F-01c Cek pH dengan kertas pH universal** di `cara_mengerjakan` tugas ukur pH: celupkan 1–2 detik, tunggu sesuai kemasan, cocokkan warna dengan bagan, isi angkanya. Catatan: "Kertas lakmus hanya membedakan asam dan basa, tidak cukup untuk rentang 5,5–6,5. Pakai kertas pH universal atau pH meter."

**Teknis.** Fungsi murni `saranUntung(rencana, ringkasan, konteks)` di `src/lib/saran-untung.ts` dengan tes; port PHP tidak perlu (tampilan saja). Kontrak, migrasi, data contoh, dan editor mentor untuk kolom opsional.

**Selesai bila.** Langkah 4 naskah (sawi 20 m²) menampilkan saran yang masuk akal; naskah diperbarui supaya presenter menunjuknya.

---

## F-02. Tanaman baru: cabai rawit, tomat, selada

**Kebutuhan**
- Resep contoh **cabai rawit** dan **tomat** (bedengan dan polybag) untuk komoditas yang sudah ada, termasuk tugas khas: pemasangan ajir, perempelan atau pemangkasan, panen bertahap.
- Komoditas baru **selada**: sayuran daun, jenis lahan kebun, pekarangan, hidroponik; resep contoh bedengan dan hidroponik.
- Semua resep `status: draf`, `contoh: true`, `asal_angka_contoh: 'dikarang'` (D-34), label contoh di setiap tempat angka resep muncul.
- Modul belajar placeholder per resep. Ilustrasi 3D selada (disediakan pemilik produk lewat Claude, gaya sama dengan 11 ilustrasi lain).

**Selesai bila.** Ketiga tanaman muncul "Resep tersedia" di Hitung langkah 1 saat resep contoh tampil, kalkulator dan jadwal berjalan, tes konsistensi data contoh lulus.

---

## F-03. Level dan lencana pengguna

**Tujuan.** Membuat petani muda betah dan bangga dengan kemajuannya, dan memberi pembeli tanda kepercayaan pada petani.

**Level petani** (dari poin):

| Level | Poin minimal |
| --- | --- |
| Benih | 0 |
| Tunas | 100 |
| Daun | 300 |
| Berbunga | 700 |
| Panen Raya | 1.500 |

Ambang di tabel `konfigurasi`, bukan di kode.

**Sumber poin petani** (dihitung server dari data yang ada):

| Peristiwa | Poin |
| --- | --- |
| Tugas selesai paling lambat di tanggalnya | +10 |
| Tugas terlambat lalu diselesaikan | +3 |
| Foto bukti tugas | +2 (paling banyak 1 per tugas) |
| Pengukuran pH/PPM diisi | +5 |
| Modul belajar selesai ditonton | +5 |
| Siklus selesai dengan pendapatan nyata tercatat | +100 |
| Kiriman diterima tanpa penolakan | +50 |
| Rating 5 dari pembeli | +20 |

**Lencana** (pencapaian, sekali raih):

| Lencana | Syarat | Peran |
| --- | --- | --- |
| Tanam pertama | Siklus pertama aktif | petani |
| Tepat waktu 7 hari | 7 hari berturut-turut semua tugas selesai tepat waktu | petani |
| Kebun terdokumentasi | 20 foto bukti | petani |
| Pengukur teliti | 10 pengukuran pH/PPM | petani |
| Pelajar rajin | Semua modul satu cara tanam selesai | petani |
| Panen pertama | Siklus pertama selesai | petani |
| Dipercaya pembeli | 5 kiriman diterima tanpa penolakan | petani |
| Bintang lima | Rata-rata rating ≥ 4,8 dari ≥ 5 ulasan | petani, pembeli |
| Pesanan pertama | Pesanan pertama dibayar | pembeli |
| Pembeli setia | 3 pesanan selesai | pembeli |

**Teknis**
- Fungsi murni `hitungPoin(peristiwa)`, `levelDariPoin(poin, ambang)`, `cekLencana(statistik)` di `src/lib/level.ts` dengan tes, dan port PHP `Domain/Hitung/Level.php` dengan kasus di `shared/kasus-uji/level.json`.
- Tabel `lencana_pengguna` (pengguna, kode, diraih_pada) supaya tanggal raih tercatat dan lencana baru bisa diberi tanda "Baru".
- Endpoint `GET /akun/level` → `{ poin, level, level_berikutnya, poin_ke_berikutnya, lencana: [{ kode, nama, diraih_pada, baru }], lencana_terkunci: [{ kode, nama, syarat, kemajuan }] }`. Poin dihitung ulang saat dibaca (data kecil) atau di-cache 5 menit.
- Tampilan: Profil petani dan pembeli (lencana level, bilah kemajuan ke level berikutnya, kisi lencana: diraih berwarna, terkunci abu dengan syarat dan kemajuan), kartu akun sidebar (nama level kecil), kartu petani di dasbor pembeli dan pesanan di sekitar (level petani sebagai tanda kepercayaan). Toast "Lencana baru: …" saat diraih.
- Visual lencana: ikon 3D bergaya ilustrasi tanaman (disediakan lewat Claude), SVG di `frontend/public/lencana/`.
- Anti-curang: poin hanya dari peristiwa nyata yang tercatat server; tugas masa depan tidak bisa diselesaikan; foto harus berkas sungguhan.

---

## F-04. Deteksi penyakit dari foto

**Kebutuhan**
- Petani mengambil foto tanaman dari detail tugas, jurnal, atau menu Kebun → "Cek kesehatan tanaman".
- Hasil berupa **dugaan**: daftar kemungkinan penyakit atau hama dengan tingkat keyakinan (rendah/sedang/tinggi), gejala yang terlihat di foto, langkah aman, dan apakah perlu penyuluh.
- **Dilarang** menyebut dosis atau merek pestisida; langkah tindakan hanya yang aman (isolasi tanaman, buang daun sakit, perbaiki penyiraman, foto ulang besok) atau diambil dari Resep Tanam.
- Tombol "Tanya penyuluh" selalu ada (WhatsApp admin dari konfigurasi sampai fitur penyuluh tersedia).
- Hasil tersimpan di jurnal tanam dengan label "Dugaan dari foto".

**Teknis**
- `POST /deteksi` `{ berkas_id, siklus_id?, tugas_id? }` → `PenyediaAI::gambar` dengan prompt sistem berpagar dan potongan pengetahuan dari F-05 (bila ada) → `jsonTerstruktur` dengan skema `{ dugaan: [{ nama, keyakinan, alasan }], gejala_terlihat: [], langkah_aman: [], perlu_penyuluh: bool, catatan }`.
- Pemeriksa server menolak jawaban yang memuat pola dosis (angka + ml/gram/liter per …) atau nama merek dari tabel `merek_input`; bila tertolak, langkah tindakan diganti teks umum dan `perlu_penyuluh = true`.
- Tabel `deteksi_tanaman` (pengguna, siklus, berkas, hasil JSON, model, waktu).
- Butuh persetujuan AI (F-00).

---

## F-05. Chatbot "Tanya Tani Muda"

**Kebutuhan**
- Tombol mengambang "Tanya Tani Muda" di halaman petani. Petani bertanya dengan bahasa sehari-hari; jawaban singkat, sapaan "kamu", dengan sumber yang dikutip.
- Jawaban **hanya** dari basis pengetahuan: Resep Tanam yang terlihat, modul belajar, dan paper yang disediakan pemilik produk. Bila tidak ada di sumber: "Belum ada di panduan Tani Muda. Tanyakan ke penyuluh lewat tombol di bawah."
- Pagar sama dengan F-04 (tanpa dosis dan merek pestisida).

**Teknis**
- Tabel `pengetahuan_sumber` (judul, jenis: resep/modul/paper, lisensi, url) dan `pengetahuan_potongan` (sumber, isi, embedding sebagai JSON, urutan).
- Perintah `php artisan pengetahuan:muat` memecah teks (sekitar 800 karakter, tumpang tindih 100), membuat embedding lewat `PenyediaAI::embedding`, dan menyimpan. PDF paper di `backend/storage/app/pengetahuan/` (tidak di-commit bila lisensinya tidak mengizinkan).
- Pencarian: cosine similarity dihitung di PHP terhadap semua potongan (korpus kecil), ambil 5 teratas.
- `POST /chatbot` `{ pesan, percakapan_id? }` → `{ jawaban, sumber: [{ judul, potongan }], percakapan_id }`; tabel `obrolan_bot` (pengguna, peran, isi, waktu). Batas harian dari F-00.
- **Lisensi paper:** hanya paper akses terbuka atau yang lisensinya mengizinkan.

---

## F-06. Cuaca dan kecocokan suhu tanaman

**Kebutuhan**
- Kartu cuaca hari ini di Beranda petani: suhu sekarang, suhu tertinggi dan terendah hari ini, dan status kecocokan untuk setiap siklus aktif.
- Status: **Cocok**, **Agak panas**, **Terlalu panas**, **Agak dingin**, **Terlalu dingin**, dengan ikon dan kata (bukan warna saja).
- Bila tidak cocok: saran dari resep (mis. pasang naungan paranet, siram sore, mulsa jerami, tunda pindah tanam).
- Di Hitung langkah 1: tanda "Cocok untuk suhu di desamu" atau "Kurang cocok" per komoditas.

**Teknis**
- Backend memanggil **Open-Meteo** (tanpa kunci) dengan titik tengah desa petani (`wilayah`); cache 1 jam per desa (tabel `cuaca_desa` atau cache Laravel). Tidak memakai GPS petani.
- Kolom resep: `suhu_ideal_min`, `suhu_ideal_maks`, `suhu_batas_min`, `suhu_batas_maks`, `saran_suhu_tinggi`, `saran_suhu_rendah` (data contoh berlabel).
- Fungsi murni `kecocokanSuhu(suhu, rentang)` di `src/lib/suhu.ts` + port PHP + kasus uji bersama.
- `GET /cuaca` → `{ desa, suhu_sekarang, suhu_maks, suhu_min, diperbarui_pada, sumber: 'Open-Meteo', siklus: [{ siklus_id, status, saran }] }`. Gagal → `503 CUACA_TIDAK_TERSEDIA`, kartu menulis "Data cuaca belum bisa dimuat".

---

## F-07. Marketplace stok siap jual + COD

**Kebutuhan**
- Model kedua di samping **Pesan sebelum tanam**: petani menjual hasil panen yang sudah ada.
- Petani: menu **Stok saya** (tambah stok: komoditas, jumlah kg, harga per kg, tanggal panen, foto; ubah; tandai habis).
- Pembeli: menu **Stok siap jual** (daftar terurut terdekat dengan saring komoditas dan jarak, detail, beli).
- Metode bayar: **COD** (bayar di tempat) atau **bayar di aplikasi** (pembayaran tiruan seperti uang muka).
- Alur: menunggu → diterima petani → dikirim → selesai, atau dibatalkan. Petani boleh menolak pesanan COD. Rating pembeli tampil sebelum petani menerima. Rating dua arah setelah selesai.
- Label dan menu berbeda jelas dari Pesan sebelum tanam.

**Teknis**
- Tabel `stok` (petani, komoditas, lahan?, jumlah_kg, sisa_kg, harga_per_kg, tanggal_panen, foto, status: tersedia/habis/ditarik) dan `pesanan_stok` (pembeli, stok, jumlah_kg, harga_per_kg saat beli, metode_bayar: cod/bayar_di_aplikasi, alamat_antar, status, waktu tiap status).
- Pengurangan `sisa_kg` dalam transaksi dengan penguncian baris (pola `AmbilPesanan`).
- COD tidak membuat baris `pembayaran`; bayar di aplikasi lewat `PenyediaPembayaran` dengan kunci idempoten.
- Endpoint: `GET/POST /stok`, `PATCH /stok/{id}`, `GET /stok/sekitar?komoditas=&radius_km=`, `POST /stok/{id}/beli`, `POST /pesanan-stok/{id}/terima|tolak|dikirim|selesai|batalkan`, `GET /pesanan-stok/saya`. Policy dan tes akses silang.
- Jarak dari titik tengah desa petani (bukan lokasi peta F-08).

---

## F-08. Peta petani di sekitar pembeli

**Kebutuhan**
- Halaman **Petani di sekitar** untuk pembeli: peta dengan lingkaran radius **10 atau 15 km** dari lokasi pembeli, dan titik petani di dalamnya. Klik titik → nama petani, level (F-03), stok tersedia (F-07), tombol chat (F-09).
- Petani menyalakan sendiri **"Tampilkan saya di peta pembeli"** di Profil (bawaan mati), dan bisa mematikannya kapan saja.
- Lokasi terkini petani diambil dari GPS perangkat **setelah petani mengizinkan**, diperbarui saat aplikasi dibuka, dan **disimpan dibulatkan sekitar 1 km** (2 desimal lintang dan bujur). Titik persis tidak pernah disimpan atau dikirim.
- Titik hanya tampil bila petani punya stok tersedia atau menerima pesanan, dan hanya ke **pembeli terverifikasi**. Nomor HP tidak ditampilkan; kontak lewat chat.
- Dasar: UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (lokasi adalah data pribadi) dan keamanan petani. Keputusan ini menyesuaikan D-06 untuk fitur peta.

**Teknis**
- Peta **Leaflet** dengan ubin **OpenStreetMap** (atribusi wajib). Tanpa internet → daftar biasa.
- Kolom `pengguna.tampil_di_peta` (boolean), `pengguna.lokasi_kira_lintang`, `lokasi_kira_bujur` (DECIMAL(6,2)), `lokasi_diperbarui_pada`; endpoint `PUT /akun/lokasi` (pembulatan dilakukan di server juga).
- `GET /peta/petani?lintang=&bujur=&radius_km=10|15` → petani dalam radius (Haversine yang sudah ada, prasaring kotak batas). Lokasi pembeli dari GPS pembeli (dengan izin) atau desa usahanya.
- Fungsi murni `bulatkanLokasi`, `dalamRadius` dengan tes.

---

## F-09. Chat petani dan pembeli

**Kebutuhan**
- Pesan teks antara petani dan pembeli yang terhubung lewat pesanan (alokasi), kiriman, atau pesanan stok, dan dari titik peta (F-08) sebelum transaksi.
- Lencana belum dibaca di menu. "Tanya pembeli dulu" di kesepakatan diganti chat.
- Hanya peserta percakapan yang bisa membaca. Admin bisa membaca percakapan yang dilaporkan (sengketa).

**Teknis**
- Tabel `percakapan` (jenis: alokasi/pesanan_stok/peta, rujukan_id, petani, pembeli, dibuat_pada) dan `pesan` (percakapan, pengirim, isi maks 1.000 karakter, dibaca_pada).
- Endpoint: `GET /percakapan`, `POST /percakapan` (buka atau ambil yang ada), `GET /percakapan/{id}/pesan?setelah=`, `POST /percakapan/{id}/pesan` (idempoten), `POST /percakapan/{id}/dibaca`.
- Polling setiap 5 detik saat halaman chat terbuka, 60 detik untuk lencana. Tanpa server real-time.
- Policy dan tes akses silang; batas laju kirim pesan.

---

## F-10. Harga panen dari pemantauan berita

**Kebutuhan**
- Di kalkulator (harga jual) dan formulir pesanan pembeli (harga per kg): kotak "Harga di berita hari ini" berisi angka, satuan, lokasi, tanggal berita, nama media, dan tautan.
- Label wajib: "Harga pasar dari berita, bukan harga di tingkat petani."
- **Tidak mengisi harga otomatis.** Bila tidak ada berita yang jelas: "Belum ada kabar harga hari ini." AI tidak boleh menebak.

**Teknis**
- Pencarian lewat **API resmi** (Google Custom Search JSON API atau API berita seperti GNews; `BERITA_DRIVER`, `BERITA_API_KEY` di `backend/.env`), bukan menyalin halaman hasil Google. Kueri: "harga {komoditas} {kabupaten} hari ini", disaring 3 hari terakhir.
- Ambil 3–5 artikel teratas; `PenyediaAI::jsonTerstruktur` mengekstrak `{ harga, satuan, jenis_harga: pasar/eceran/petani/tidak_jelas, lokasi, tanggal_berita, judul, url }`. Buang yang `tidak_jelas`, tanpa angka, atau lebih tua dari 3 hari.
- Tabel `harga_berita` (komoditas, kabupaten, data di atas, diambil_pada). Perintah `harga:pantau` sekali sehari (scheduler) dan bisa dipicu manual; cache per komoditas dan kabupaten.
- `GET /harga-berita?komoditas_id=` → daftar terbaru untuk kabupaten pengguna.

---

## F-11. Saran setelah semua tugas hari ini selesai

**Kebutuhan**
- Saat semua tugas hari ini tercentang: kartu "Tugas hari ini beres" berisi jumlah tugas selesai, jumlah foto bukti, poin yang didapat (F-03), tugas besok, dan 1–2 saran dari resep untuk tahap tanam sekarang.
- Bila ada foto hari ini: tombol "Cek kesehatan tanaman dari foto ini" (F-04).

**Teknis.** Fungsi murni `ringkasanHarian(tugas, foto, resep, hariIni)` di `src/lib` dengan tes; berbasis aturan, tanpa AI.

---

## 2. Jadwal

| Hari | Fitur | Tag bila lolos |
| --- | --- | --- |
| Rabu 14 Okt | F-00, F-01, F-02, F-03 | `demo-rabu` |
| Kamis 15 Okt | F-04, F-05, F-06 | `demo-kamis` |
| Jumat 16 Okt | F-07, F-08, F-09 | `demo-jumat` |
| Sabtu 17 Okt pagi | F-10, F-11, lalu **beku pukul 12.00** | `demo-lomba` |
| Sabtu sore | Latihan demo, tanpa kode | |

Fitur yang belum lolos gerbang pada harinya **dimatikan sakelarnya** dan dilanjutkan hari berikutnya bila waktu cukup, tanpa menunda fitur hari berikutnya.

## 3. Perubahan basis data

### 3.1 Aturan

1. **Satu migrasi baru per fitur** (`2026_10_14_*`, `2026_10_15_*`, …). Migrasi yang sudah ada dan sudah di-push **tidak diubah**; perubahan kolom lama lewat migrasi `ALTER` baru. `migrate:fresh --seed` dan `migrate:rollback` harus tetap jalan dari nol.
2. Mengikuti pola D-52 dan D-53: ID string `VARCHAR(64)` `ascii_bin` (ULID huruf kecil untuk baris baru), uang `BIGINT UNSIGNED`, berat `DECIMAL(12,2)`, waktu UTC.
3. **Aturan hapus eksplisit di setiap kunci asing.** Tabel uang dan transaksi (`stok`, `pesanan_stok`, `pembayaran`, `rating`, `harga_berita`) dan semua yang menunjuk ke sana: `RESTRICT`. `CASCADE` hanya untuk anak murni (`pesan` ke `percakapan`, `pengetahuan_potongan` ke `pengetahuan_sumber`, `obrolan_bot` ke pengguna, `lencana_pengguna` ke pengguna). Tes `information_schema` D-53 diperbarui dengan daftar CASCADE yang baru.
4. **Batasan `CHECK`** untuk setiap aturan yang bisa dijaga basis data (daftar di 3.2), masing-masing dengan tes Pest yang membuktikan pelanggaran ditolak.
5. **Kontrak dulu.** Setiap tabel dan endpoint baru ditulis di `kontrak-api.md` (bagian 2 dan 3, kolom † untuk tambahan) sebelum migrasi; tes yang membandingkan kontrak dengan migrasi (D-52) diperluas ke tabel baru.
6. **Seeder:** data contoh tiap fitur ditambahkan ke `shared/data-contoh/` (versi data contoh dinaikkan); `demo:atur-ulang` mengosongkan dan mengisi ulang tabel baru; **seeder produksi tidak memuat data contoh** (stok, harga berita, lencana, percakapan contoh).
7. **Fitur baru hanya di backend.** Pengecualian D-20 untuk Tahap 7: klien tiruan **tidak** menerapkan fitur F-00 sampai F-11; di mode tiruan sakelarnya otomatis mati. Tes kontrak untuk endpoint baru hanya dijalankan terhadap backend.
8. **Policy dan tes akses silang wajib sekarang** untuk tabel baru yang berisi data pribadi atau transaksi: `pesanan_stok`, `percakapan`, `pesan`, `deteksi_tanaman`, `obrolan_bot`, lokasi pengguna. Pemilik 200, pengguna lain 404, peran salah 403, tanpa sesi 401.

### 3.2 Tabel dan kolom

| Fitur | Perubahan | Batasan dan indeks penting |
| --- | --- | --- |
| F-00 | Tabel `log_ai` (pengguna, fitur, model, token_masuk, token_keluar, perkiraan_biaya, berhasil, kode_galat, dibuat_pada). Kolom `pengguna.setuju_ai_pada`. | Indeks (pengguna, dibuat_pada) untuk batas harian. Tidak menyimpan isi foto atau pertanyaan. |
| F-01 | Kolom `resep_input.opsional` (boolean, bawaan false), `resep_input.keterangan_opsional`. Konfigurasi `ambang_untung_tipis`. | `CHECK (opsional = 0 OR keterangan_opsional IS NOT NULL)`. |
| F-02 | Data saja: komoditas `selada`, resep contoh cabai rawit, tomat, selada, modul placeholder. | Tes konsistensi data contoh. |
| F-03 | Tabel `lencana_pengguna` (pengguna, kode, diraih_pada, dilihat_pada). Konfigurasi ambang level dan nilai poin. | Unik (pengguna, kode). |
| F-04 | Tabel `deteksi_tanaman` (pengguna, siklus?, tugas?, berkas, hasil JSON, model, dibuat_pada). | Kunci asing ke `berkas` RESTRICT. |
| F-05 | Tabel `pengetahuan_sumber` (judul, jenis, lisensi, url), `pengetahuan_potongan` (sumber, urutan, isi, embedding JSON), `obrolan_bot` (pengguna, percakapan_bot_id, peran, isi, sumber JSON, dibuat_pada). | `CHECK jenis IN ('resep','modul','paper')`. |
| F-06 | Kolom `resep_tanam.suhu_ideal_min`, `suhu_ideal_maks`, `suhu_batas_min`, `suhu_batas_maks` (DECIMAL(4,1)), `saran_suhu_tinggi`, `saran_suhu_rendah`. Cache cuaca lewat cache Laravel (tanpa tabel). | `CHECK suhu_batas_min ≤ suhu_ideal_min ≤ suhu_ideal_maks ≤ suhu_batas_maks` bila terisi. |
| F-07 | Tabel `stok` (petani, komoditas, lahan?, jumlah_kg, sisa_kg, harga_per_kg, tanggal_panen, foto, status), `pesanan_stok` (pembeli, stok, petani, jumlah_kg, harga_per_kg, nilai, metode_bayar, alamat_antar, status, waktu tiap status, alasan_batal). **`pembayaran`**: `pesanan_id` menjadi boleh kosong, tambah `pesanan_stok_id`. **`rating`**: `pengiriman_id` menjadi boleh kosong, tambah `pesanan_stok_id`. | `0 ≤ sisa_kg ≤ jumlah_kg`; harga > 0; `metode_bayar IN ('cod','bayar_di_aplikasi')`; `pembayaran`: tepat satu dari `pesanan_id` / `pesanan_stok_id` terisi; `rating`: tepat satu dari `pengiriman_id` / `pesanan_stok_id`; unik rating (pemberi, pesanan_stok_id); COD tidak pernah punya baris `pembayaran` (dijaga layanan + tes). Invarian: `sisa_kg = jumlah_kg − Σ jumlah pesanan_stok aktif`, dicek setelah setiap tes kontrak (pola D-53). |
| F-08 | Kolom `pengguna.tampil_di_peta` (boolean, bawaan false), `lokasi_kira_lintang`, `lokasi_kira_bujur` (DECIMAL(6,2)), `lokasi_diperbarui_pada`. | `CHECK` lintang −90..90, bujur −180..180; indeks (lokasi_kira_lintang, lokasi_kira_bujur) untuk prasaring kotak batas. Tidak ada kolom lokasi persis. |
| F-09 | Tabel `percakapan` (jenis, rujukan_id, petani, pembeli, dibuat_pada), `pesan` (percakapan, pengirim, isi, dibaca_pada, dibuat_pada). | `CHECK jenis IN ('alokasi','pesanan_stok','peta')`; `CHECK CHAR_LENGTH(isi) BETWEEN 1 AND 1000`; unik (jenis, rujukan_id, petani, pembeli); indeks (percakapan, dibuat_pada). |
| F-10 | Tabel `harga_berita` (komoditas, kabupaten, harga, satuan, jenis_harga, lokasi, tanggal_berita, judul, media, url, diambil_pada). | `CHECK harga > 0`; `CHECK jenis_harga IN ('pasar','eceran','petani')`; unik (komoditas, kabupaten, url); indeks (komoditas, kabupaten, diambil_pada). |
| F-11 | Tidak ada perubahan. | |

## 4. Yang dibutuhkan dari pemilik produk

| Kebutuhan | Untuk | Bila belum ada |
| --- | --- | --- |
| `OPENAI_API_KEY` di `backend/.env` (diisi sendiri, tidak lewat chat) | F-00, F-04, F-05, F-10 | Driver `tiruan` berlabel |
| Kunci API pencarian berita di `backend/.env` | F-10 | Fitur F-10 dimatikan |
| PDF paper akses terbuka | F-05 | Basis pengetahuan hanya resep dan modul |
| Internet di tempat lomba (Wi-Fi + hotspot cadangan) | F-04, F-05, F-06, F-08, F-10 | Sakelar dimatikan saat demo |
| Ilustrasi selada dan lencana | F-02, F-03 | Dibuat lewat Claude |

## 5. Pertanyaan terbuka

| Pertanyaan | Bawaan sementara |
| --- | --- |
| Siapa menanggung risiko COD bila pembeli tidak membayar? | Petani boleh menolak COD; pembatalan dicatat di profil pembeli |
| Apakah pembeli juga punya level, atau hanya lencana? | Hanya lencana |
| Batas harian AI per pengguna | 30 panggilan |
| Radius bawaan peta | 10 km, bisa diganti 15 km |
