# Aturan Proyek Tani Muda

> **`docs/keputusan.md` mengalahkan PRD, desain, dan dokumen ini jika bertentangan.** Baca dulu sebelum mengerjakan tugas apa pun.

Aturan ini **wajib diikuti di setiap tugas**, oleh manusia maupun asisten AI. Sebelum menandai tugas di `rencana-kerja.md` selesai, cek daftar di bagian 12.

Acuan: `docs/keputusan.md` (keputusan produk, tertinggi), `docs/prd-tani-muda.md` (kebutuhan), `docs/ringkasan-desain.md` (token, komponen, halaman), `docs/kontrak-api.md` (bentuk data dan endpoint, sejak Tahap 3), `docs/arsitektur-backend.md` (rancangan Laravel), `design/` (sumber desain, jangan diubah).

---

## 1. Bahasa

1. **Semua teks yang dilihat pengguna ditulis dalam Bahasa Indonesia**: label, tombol, galat, placeholder, `aria-label`, judul halaman (`<title>`), teks notifikasi, teks email/SMS bila ada. Kode, nama variabel, nama berkas, dan komentar boleh Indonesia atau Inggris, tetapi **istilah domain memakai Indonesia** seperti di PRD dan Model Data (`siklus_tanam`, `resep_tugas`, `uang_muka`) supaya cocok dengan tabel.
2. Aturan bahasa (D-09 di `keputusan.md`, dan `ringkasan-desain.md` bagian 4):
   - Petani disapa **"kamu/-mu"**, pembeli disapa **"Anda"**. Nada tenang, kalimat pendek, tanpa tanda seru.
   - Label tombol diawali kata kerja ("Simpan rencana", "Tandai selesai").
   - Pesan galat menyebut apa yang harus dilakukan ("Isi luas lahan dulu"). Pesan galat PRD yang sudah ditentukan dipakai **persis**: "Harga belum diisi", "Dengan angka ini, kamu berpotensi rugi.", "Permintaanmu tercatat. Kami kabari saat resepnya siap.", "Subsidi hanya untuk petani yang terdaftar di kelompok tani.", "Beli di kios resmi dan periksa nomor pendaftaran pupuk di kemasan.", "Rentang dari Resep Tanam yang dicek penyuluh.".
   - Tidak ada kata Inggris di UI (bukan "Dashboard", "Login", "Submit", "OK"). Halaman pembeli bernama "Dasbor" atau "Pesanan aktif".
   - **Bahasa petani:** "Hari ke-13", bukan "HST 13"; "Uang muka sudah masuk", bukan "Pembayaran DP berhasil". Dilarang di tampilan: escrow, task, pending, submit, DP, HST, dashboard, login. ("HST" boleh di kode, basis data, dan panel mentor.)
   - Kalimat biasa, **bukan huruf kapital semua**; tombol diawali kata kerja ("Simpan rencana", "Ambil pesanan"); rupiah ditulis lengkap `Rp1.250.000`.
   - Dijaga otomatis oleh lint teks (T1.03): daftar kata terlarang di `scripts/kata-terlarang.json`.
   - Arti status dibawa juga oleh **ikon dan kata**, tidak hanya warna.
3. **Semua teks UI lewat satu tempat**: `src/teks/` (objek TypeScript per fitur). Komponen tidak berisi kalimat panjang tertulis langsung kecuali label singkat sekali pakai. Ini memudahkan pengecekan bahasa dan nanti i18n.
4. Format angka dan tanggal **hanya lewat `src/lib/format.ts`** (fungsi murni dan teruji): `Rp430.000` (tanpa spasi, titik ribuan), minus `−` (U+2212), koma desimal ("6,1"), jam `06.00`, tanggal "Sabtu, 3 Oktober", kisaran dengan en dash. Dilarang memanggil `toLocaleString` atau `Intl` langsung di komponen.
5. Jangan mengarang istilah baru. Kalau butuh kata yang belum ada di PRD atau desain, tulis di daftar pertanyaan, jangan menebak.

## 2. Token desain: warna dan ukuran

1. **Semua warna dan ukuran lewat token di `tailwind.config.ts`** (diambil dari `ringkasan-desain.md` bagian 1). Dilarang:
   - menulis hex, `rgb()`, atau `hsl()` di komponen, CSS, atau `style={{}}`;
   - memakai warna bawaan Tailwind (`bg-green-600`, `text-gray-500`, `border-red-500`);
   - memakai nilai sembarang (`w-[53px]`, `p-[13px]`, `text-[17px]`, `rounded-[10px]`) untuk ukuran yang ada tokennya.
2. Nama token memakai nama dari desain: `daun-tua`, `embun-pagi`, `tanah`, `tomat`, `teks-pendukung`, `garis-kuat`, dst. (17 warna). Contoh: `bg-daun-tua text-putih`, `border-garis`, `text-teks-pendukung`.
3. Aturan pemakaian warna dari desain **wajib dipatuhi**: hijau daun hanya untuk yang tumbuh atau harus dikerjakan; cokelat `tanah` hanya untuk uang dan panen; `matahari` bukan untuk teks (teks pakai `matahari-teks`); lencana nav memakai `teks`, bukan merah.
4. Ukuran minimum: **teks tidak boleh lebih kecil dari 16px** (tidak ada `text-sm`/`text-xs`), **setiap elemen yang bisa disentuh minimal 48×48px** (`min-h-sentuh min-w-sentuh`), tinggi tombol dan kolom isian `tinggi-kontrol` 52px.
5. **Tidak ada bayangan jatuh.** Satu-satunya `box-shadow` adalah cincin fokus (`ring` token `fokus`) dan cincin pilihan. Dilarang `shadow-md`, `shadow-lg`, dll.
6. Hanya mode terang. Jangan menambah `dark:`.
7. Pengecualian token harus melewati proses: tambahkan token ke `tailwind.config.ts` **dan** ke `ringkasan-desain.md`, lalu pakai. Jangan membuat nilai satu kali pakai.
8. Dijaga otomatis oleh lint (tugas T1.03): kalau ada hex atau warna bawaan Tailwind di `src/`, `npm run lint` gagal.
9. Warna di data (mis. batang pengukuran, SVG ilustrasi) memakai kelas token atau `currentColor`; SVG memakai `stroke="currentColor"`.
10. **Teks yang tidak muat dipotong dengan elipsis** (`truncate`), lalu teks lengkapnya ditampilkan saat disentuh atau diarahkan kursor (D-17). **Jangan memperkecil ukuran huruf** agar teks muat.
11. Ikon baru di luar `design/icons/` hanya boleh bila gayanya sama: kotak 24×24, garis 2, ujung dan sambungan bulat, tanpa isian, `currentColor` (D-17).

## 3. Logika perhitungan: fungsi murni di `src/lib` dengan unit test

1. Semua logika berikut **ditulis sebagai fungsi TypeScript murni di `src/lib/`** (tanpa React, tanpa klien API, tanpa `Date.now()` atau `new Date()` di dalamnya, tanpa efek samping):
   - kalkulator (kebutuhan input, pembulatan kemasan, total modal, biaya alat per siklus, pendapatan, untung, titik impas, subsidi);
   - jadwal (membuat tugas dari resep, tanggal tugas sekali/berulang/pengukuran, tunda, ubah tanggal tanam, status terlambat, penyaringan tipe);
   - konversi satuan (m², ru/bata, hektare, dan satuan wilayah);
   - pengukuran (status normal/terlalu tinggi/terlalu rendah, saran, tugas ukur ulang);
   - pesanan (nilai pesanan, uang muka, biaya layanan, luas per panen, luas rutin dan tanam bertahap, ambil sebagian, pembayaran per kiriman, pembagian 80/20);
   - format (rupiah, terbilang, tanggal, jam, desimal).
2. Waktu dan konfigurasi **dikirim sebagai argumen**: `hariIni: Date`, `konversi: Record<string, number>`, `persenUangMuka`, dst. Tidak ada angka bisnis (14 m² per ru, 20%, 5%) tertulis tetap di dalam fungsi; semuanya dari data atau konfigurasi (PRD menyatakan nilainya bisa berubah).
3. **Setiap fungsi di `src/lib` wajib punya unit test Vitest** di berkas `*.test.ts` bersebelahan. Syarat minimum per fungsi: satu kasus normal, nilai batas (nol, kosong, negatif, tepat di batas rentang), dan satu kasus dari rumus/contoh di PRD (contoh 5 g/m² × 100 m² = 500 g → kemasan 1 kg → "1 kg").
4. Tugas yang menyentuh `src/lib` **tidak selesai** sebelum `npm run test` hijau dan cakupan baris di `src/lib` minimal 90% (disetel di konfigurasi Vitest).
5. **Semua angka yang tampil** (kapasitas, modal, titik impas, uang muka, nilai pembayaran, jumlah kiriman, sisa saldo) berasal dari fungsi di `src/lib` (D-08). Angka dalam teks desain adalah ilustrasi dan **tidak boleh disalin** ke kode.
5a. Komponen React hanya **memanggil** fungsi di `src/lib`, tidak menghitung sendiri. Backend Laravel memakai port PHP dari rumus yang sama (`backend/app/Domain/Hitung/`), dan kesamaannya dibuktikan oleh kasus uji bersama di `shared/kasus-uji/` yang dijalankan Vitest dan Pest. Server selalu menghitung ulang angka uang dan tidak menerimanya dari klien.
6. Aturan pembulatan: uang dibulatkan ke rupiah penuh di satu tempat (`bulatkanRupiah`); kebutuhan input dibulatkan **ke atas** ke kelipatan ukuran kemasan; tampilan dibulatkan di `format.ts`, bukan di logika.
7. Status "terlambat" **tidak disimpan** di database (PRD): dihitung dari tanggal tugas dan hari ini lewat fungsi murni.
8. Pesan galat validasi (ukuran nol, harga negatif) dikembalikan fungsi sebagai kode galat yang jelas (`'UKURAN_KOSONG'`), lalu diterjemahkan ke teks Indonesia di `src/teks/`.

## 4. Responsif: web mobile 390px dan desktop 1440px

1. **Setiap halaman dibuat untuk dua ukuran**: web mobile 390px dan desktop 1440px. Halaman baru dinyatakan selesai hanya jika keduanya sudah dicek (lebar 390 dan 1440, juga 1280 dan 768 supaya tidak patah).
2. Pendekatan: mobile dulu. Pola mengikuti desain:
   - HP: satu kolom, padding 16px, **navigasi bawah 4 menu** (Beranda, Kebun, Pesanan, Belajar) untuk petani.
   - Desktop petani: **sidebar 256px** + konten `max-width: 1200px`. Desktop pembeli: **header atas** + konten `max-width: 1152px`.
   - Titik patah (D-16): di bawah 768px navigasi bawah dan satu kolom; 768–1023px tetap navigasi bawah, konten boleh dua kolom (`md:`); mulai 1024px sidebar (`lg:`). Jangan membuat titik patah baru per halaman.
3. Papan desain yang hanya punya satu ukuran (lihat `ringkasan-desain.md` bagian 3) **diturunkan** dari pola desain yang ada, tanpa memperkenalkan komponen atau warna baru.
4. Tidak ada gulir horizontal pada 390px. Target sentuh dan teks tetap sesuai bagian 2 di semua ukuran.
5. Cek kebenaran visual dengan membandingkan berdampingan dengan papan desain: jalankan `npm run ekstrak-desain`, lalu buka `design/extracted/tampil/<nomor>-<nama>-<versi>.html` di browser atau tangkap dengan `npm run tangkap` (nama papan di `design/README.md`; untuk komponen, pakai halaman `/komponen`). Catat nomor papan yang dibandingkan di deskripsi tugas.
6. Tidak ada gambar tanpa `alt` dan tidak ada tombol ikon tanpa label. Kontras mengikuti token (sudah lolos); jangan menurunkannya dengan opasitas.

## 5. Data contoh, bukan rekomendasi

1. **Semua angka dosis, harga, hasil panen, rentang pH dan PPM, jadwal HST, dan pembagian biaya dalam repo adalah data contoh dari resep**, bukan rekomendasi agronomis atau keuangan. Resep yang dipakai hanya dari data contoh (data tiruan Tahap 3, lalu `shared/data-contoh/` untuk seeder Laravel) dan berlabel `contoh`.
2. Konsekuensi di kode:
   - Dilarang menulis angka dosis, harga, hasil per m², atau rentang pH/PPM langsung di komponen atau di `src/lib`. Angka itu **hanya** ada di data (data contoh JSON, fixture test) dan dibaca lewat klien API.
   - Fixture test boleh memakai angka contoh, ditandai di nama berkas atau komentar: `fixtures/contoh-resep-sawi.ts`.
3. Konsekuensi di UI: setiap halaman yang menampilkan hasil hitungan menampilkan catatan yang sama dengan desain: **"Semua harga di halaman ini adalah contoh. Ubah sesuai harga di kios dan upah di desamu."**, dan hasil pengukuran memuat "Rentang dari Resep Tanam yang dicek penyuluh." Aplikasi tidak pernah menyebut merek tertentu sebagai rekomendasi (P0-34) dan promo selalu terpisah (P0-35).
4. Resep seed berstatus **`draf`**, kolom `contoh = true`, dan berlabel **"CONTOH, belum divalidasi penyuluh"** di data seed dan di tampilan (D-10, D-11). Resep tampil ke petani hanya bila `divalidasi`, atau `contoh` bila `VITE_TAMPILKAN_RESEP_CONTOH=true` (nilai bawaan mati; D-12). Label itu wajib terlihat **di setiap tempat angka resep muncul**: kalkulator, jadwal dan detail tugas, serta rentang pengukuran. Jangan mengklaim validasi yang belum terjadi.
5. Satuan dan nilai konfigurasi bisnis (14 m²/ru, uang muka 20%, biaya layanan 5%, radius 10 km, batas periksa kiriman 6 jam rutin dan 24 jam sekali panen, batas kabar gagal panen 3 hari) disimpan sebagai data/konfigurasi, bukan konstanta tersebar.

## 6. Rahasia dan keamanan

1. **Kunci rahasia hanya ada di file `.env` backend dan tidak pernah dikirim ke frontend** (D-19). Contohnya `APP_KEY`, `DB_PASSWORD`, `VAPID_PRIVATE_KEY`, serta kunci penyedia SMS dan pembayaran. File `.env` ada di `.gitignore`; yang masuk repo hanya `.env.example` dengan nama variabel dan nilai kosong.
2. **Frontend hanya punya variabel publik berawalan `VITE_`**, karena semua variabel `VITE_` ikut ke bundel dan terbuka di browser. Contohnya alamat API, kunci publik VAPID (`VITE_VAPID_PUBLIC_KEY`), sumber data, dan `VITE_TAMPILKAN_RESEP_CONTOH`. Respons API juga tidak boleh memuat rahasia, hash kode OTP, atau jalur berkas di disk.
3. **Hak akses dijaga di server**, lewat Policy per peran dan validasi permintaan Laravel, bukan oleh frontend. Data milik pengguna lain dijawab 404, sedangkan peran atau status akun yang tidak mengizinkan dijawab 403 (D-22). Aplikasi web memakai cookie sesi Sanctum; aplikasi React Native kelak memakai token Sanctum (D-21). Selama Tahap 3–4, klien API tiruan menegakkan aturan yang sama. Setiap endpoint yang menyentuh data milik pengguna **wajib** punya Policy dan tes akses silang Pest (`arsitektur-backend.md` bagian 6).
4. Kunci publik VAPID boleh disalin ke frontend; kunci privatnya hanya di `backend/.env`.
4a. **Semua konfigurasi lingkungan lewat `.env`** (D-24): alamat, basis data, domain sesi dan Sanctum, asal CORS, driver OTP, pembayaran, dan antrean. Tidak ada nilai lingkungan yang ditulis di kode, sehingga aplikasi bisa di-deploy ke VPS kapan saja (`arsitektur-backend.md` bagian 17).
5. Dilarang menulis kunci, token, nomor HP asli, atau data pribadi di kode, seed, fixture, log, atau tangkapan layar. Seed memakai nomor dan nama fiktif.
6. Dana pengguna tidak pernah masuk rekening tim; status ditahan/cair hanya dicatat dari respons payment gateway (PRD). Mode uji coba memakai sandbox gateway.
7. Foto pengguna disimpan di disk privat backend dan hanya dibuka lewat URL bertanda tangan yang berlaku singkat. Foto dikecilkan sebelum diunggah (desain menjanjikan "Foto dikecilkan otomatis supaya hemat kuota").
8. Pengecekan otomatis: `npm run lint` gagal bila kode frontend (`src/`) menyebut nama variabel rahasia backend (`APP_KEY`, `DB_PASSWORD`, `…_SECRET`, `…_PRIVATE_KEY`, dan sejenisnya) atau membaca `import.meta.env` selain `VITE_*` dan variabel bawaan Vite. Lint juga gagal bila `.env.example` frontend berisi variabel selain `VITE_*` atau nama yang tampak rahasia.

## 6a. Antarmuka penyedia (D-10)

1. **Pembayaran:** semua halaman (lewat klien API) dan backend memakai antarmuka `PenyediaPembayaran` (`tahan`, `cairkan`, `kembalikan`, `status`). Demo memakai implementasi **tiruan** (simulasi). Penyedia sungguhan dipasang nanti dengan mengganti implementasi, tanpa mengubah halaman.
2. **OTP:** semua halaman memakai antarmuka `PenyediaOtp` (`kirimKode`, `verifikasi`). Tahap 3–4 memakai implementasi tiruan di frontend; backend memakai antarmuka `PengirimOtp` dengan driver log untuk pengembangan (hanya `APP_ENV=local`). Penyedia SMS dipasang nanti.
3. Implementasi tiruan harus **jelas ditandai** (nama berkas dan label di UI uji) dan dimatikan di produksi lewat konfigurasi, bukan dihapus diam-diam.

## 7. Aturan kode

1. Stack tetap: frontend React + TypeScript (mode `strict`) + Vite + `vite-plugin-pwa`, Tailwind CSS, Dexie + TanStack Query untuk offline, Vitest; backend **Laravel 13** (PHP ≥ 8.3, dipasang terpisah dari XAMPP; D-25) + Sanctum + Pest dengan **MySQL/MariaDB dari XAMPP**, berjalan lokal tanpa Docker dan siap deploy ke VPS (D-19, D-24). Menambah pustaka besar harus lewat keputusan tertulis di `rencana-kerja.md`.
2. Struktur:
   - **Nama file dan folder: kebab-case Bahasa Indonesia yang deskriptif** (D-18), mis. `src/komponen/penggaris-umur-tanam.tsx`, `src/lib/tata-letak-penggaris.ts`. Nama komponen di dalam kode tetap PascalCase. Tanpa spasi, tanda kurung, atau akhiran "(2)". Pengecualian hanya untuk nama baku perkakas (`README.md`, `package.json`, `*.config.ts`, `main.tsx`, `index.css`, `index.html`).
   - `src/lib/` fungsi murni + test; `src/teks/` teks UI; `src/komponen/` komponen berbagi (nama Indonesia mengikuti desain: `Tombol`, `Kartu`, `KolomIsian`, `InputRupiah`, `Uang`, `ChipStatus`, `BarisTugas`, `PenggarisUmurTanam`, `Banner`, `NavigasiBawah`, `Ikon`, `Sidebar`, …); `src/halaman/` satu folder per halaman; `src/api/` antarmuka klien API, hook TanStack Query, implementasi tiruan (Tahap 3) dan HTTP (Tahap 6); `src/data/offline/` skema Dexie dan antrean (Tahap 6); `src/penyedia/` antarmuka dan implementasi `PenyediaPembayaran` dan `PenyediaOtp`; `src/tipe/` tipe domain.
   - Mulai Tahap 5, repositori berisi `frontend/` (proyek React), `backend/` (Laravel: migrasi, seeder, Policy, `app/Domain/Hitung/`), dan `shared/` (`kasus-uji/`, `data-contoh/`). Rinciannya di `arsitektur-backend.md` bagian 3.
2a. **Tidak ada path khusus Windows di kode** (D-24): tidak ada huruf drive (`C:`), tidak ada garis miring terbalik sebagai pemisah folder. Jalur dibangun dengan `path.join` / `new URL(…, import.meta.url)` di Node dan `base_path()` / `storage_path()` di Laravel. `npm run lint` menolak huruf drive di string `src/`. Satu-satunya pengecualian adalah daftar lokasi browser di `scripts/tangkap-layar.mjs`, yang mencoba beberapa OS dan bisa diganti lewat `CHROME_PATH`.
3. Tidak ada `any` tanpa komentar alasan. Tipe data API ditulis dari `kontrak-api.md` (`src/api/tipe/`), dan nama kolom sama persis dengan kontrak.
4. **Pemisahan:** halaman dan komponen **hanya mengambil data lewat klien API** (hook di `src/api/kueri/`), tidak pernah memanggil `fetch` langsung dan **tidak pernah mengimpor data tiruan** (D-20, dijaga ESLint). Penulisan yang harus jalan offline lewat antrean Dexie (Tahap 6).
5. Komponen mengikuti API komponen desain (nama props berbahasa Indonesia seperti di `ringkasan-desain.md` bagian 2.1) supaya perbandingan dengan desain mudah. Aksesibilitas bawaan desain (`role`, `aria-*`, `aria-current`, fokus terlihat) **tidak boleh hilang**.
6. Dependensi: gunakan versi tetap di `package.json` (tanpa `^` untuk pustaka inti) dan commit `package-lock.json`.
7. Satu perubahan = satu tugas = satu commit/PR kecil dengan pesan Bahasa Indonesia atau Inggris yang menyebut ID tugas (mis. `T2.04: jadwal otomatis`).
8. Jangan memodifikasi isi `design/desain-tani-muda.html`, `design/icons/`, dan `docs/prd-tani-muda.md`. Perubahan keputusan produk dicatat di `docs/keputusan.md`. `design/extracted/` adalah bahan kerja yang tidak masuk git; aplikasi dan tes tidak boleh membacanya.

## 8. Basis data

1. Nama tabel dan kolom **persis seperti Model Data di PRD** (`pengguna`, `profil_pembeli`, `komoditas`, `metode_tanam`, `resep_tanam`, `resep_input`, `resep_tugas`, `modul`, `progres_modul`, `permintaan_resep`, `input_pertanian`, `kelayakan_subsidi`, `merek_input`, `laporan_harga`, `promo`, `konversi_satuan`, `siklus_tanam`, `rencana_item`, `tugas`, `hasil_pengukuran`, `pengeluaran`, `pengaturan_pengingat`, `langganan_notifikasi`, `pesanan`, `alokasi_pesanan`, `pembayaran`, `pengiriman`, `rating`). Tabel tambahan sudah ditetapkan di `keputusan.md` D-06 (`lahan`, `wilayah`, `sengketa`, `kelompok_tani`, `anggota_kelompok_tani`, `catatan_petani`) dan kolom `pengguna.foto_profil|status_akun` (D-13), `pengiriman.alasan_penolakan|keterangan_penolakan|jumlah_ditolak|foto_penolakan` (D-14), `siklus_tanam.lahan_id|luas_m2|jumlah_lubang` (D-15). Tidak ada tabel atau kolom kata sandi dan nama pengguna. Tambahan lain harus dicatat di `keputusan.md`.
2. Metode, komoditas, dan satuan lokal **disimpan sebagai data, bukan nilai tetap di kode** (P2-09, P2-07, P2-08): metode tanam di tabel, `hasil_pengukuran.sumber` ('manual' | 'sensor'), `merek_input.nomor_pendaftaran`.
3. `siklus_tanam` menyimpan **versi resep saat dibuat** (P0-04). Dosis resep tersimpan sebagai nilai dasar (P2-04). Koordinat disimpan sebagai kolom lintang dan bujur desimal (tanpa tipe spasial). **Jarak dihitung dengan rumus Haversine dari titik tengah desa (`wilayah`)**, dan ke pembeli hanya tampil nama desa dan jarak, tidak pernah titik lahan (D-06, P0-20).
4. Migrasi Laravel: satu berkas per perubahan; tidak mengubah migrasi yang sudah digabung (buat migrasi baru). Basis data dibuat ulang dari nol dengan `php artisan migrate:fresh --seed`. Batasan penting juga ditulis sebagai `CHECK` di tabel (mis. "Lainnya" wajib keterangan, D-14).
5. Aturan akses minimal (Policy di backend, dan sama persis di klien tiruan): petani hanya membaca dan menulis siklusnya sendiri; data milik pengguna lain dijawab 404; resep `draf` yang bukan contoh tidak pernah tampil ke petani (penyaringan resep contoh di frontend, D-12); ambil pesanan menolak akun `dinonaktifkan_sementara` (D-13); pembeli belum terverifikasi tidak dapat memasang pesanan (dijaga server, bukan hanya UI); alokasi memakai transaksi dengan penguncian baris; tabel `pembayaran` hanya ditulis layanan pembayaran di server.

## 9. Offline dan PWA

1. Jadwal, checklist, rencana modal, dan video yang sudah diunduh **harus bisa dibuka tanpa sinyal** (P0-29). Perubahan offline (menandai tugas selesai) masuk antrean Dexie dan tersinkron otomatis saat sinyal kembali.
2. Banner offline memakai komponen `Banner jenis="offline"` dengan teks dari desain.
3. Notifikasi web push **dipisah dari salurannya** (P2-02): logika "tugas apa yang dikirim" ada di fungsi murni (`src/lib/pengingat.ts` dan port PHP-nya); pengirimnya scheduler Laravel setiap 15 menit dengan zona waktu Asia/Jakarta, bersamaan dengan konfirmasi otomatis kiriman (D-23). Notifikasi pagi pukul 06.00 waktu pengguna; bila izin ditolak, tugas hari ini tampil sebagai banner (P0-13).
4. iPhone: web push butuh aplikasi ditambahkan ke layar utama; dokumentasikan di README dan tampilkan petunjuk.

## 10. Pengujian dan kualitas

1. Perintah wajib hijau sebelum tugas ditandai selesai: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, dan mulai Tahap 5 juga `php artisan test` untuk tugas backend.
2. Unit test: semua `src/lib` (bagian 3). Test komponen untuk perilaku yang bukan sekadar tampilan: `InputRupiah` (titik ribuan, kursor, terbilang), `BarisTugas` (centang), `PenggarisUmurTanam` (tata letak pin), filter tugas, kalkulator (mengubah jumlah memperbarui total).
3. Tes akses: tes kontrak klien API (T3.12) dijalankan terhadap klien tiruan dan, sejak Tahap 6, klien HTTP. Di backend, tes Pest akses silang membuktikan pengguna tidak bisa mengakses data milik pengguna lain (petani A ≠ petani B, pembeli tanpa titik lahan, resep draf tidak terbaca petani). Kasus uji perhitungan di `shared/kasus-uji/` harus lulus di Vitest dan Pest.
4. Tiap halaman punya daftar periksa di deskripsi tugas (bagian 12). Tidak ada tugas halaman yang selesai tanpa membandingkan dengan papan desain terkait.
5. Jangan menonaktifkan test atau lint untuk meloloskan tugas; perbaiki penyebabnya.

## 11. Cara bekerja dengan rencana kerja

1. Kerjakan tugas **berurutan sesuai prasyarat** di `rencana-kerja.md`. Jangan melompat ke halaman sebelum komponen dan `src/lib` yang dibutuhkan selesai.
2. Tugas bertanda **[DEMO]** diprioritaskan untuk demo lomba.
3. Untuk tugas halaman bertanda **[DEMO]**: ambil tangkapan layar mobile (390px) dan desktop (1440px) ke `docs/tangkapan/aplikasi/<nomor>-<nama>-mobile.png` dan `-desktop.png` (nama di `design/README.md`; D-18) dengan `npm run tangkap`, **tunjukkan ke pemilik produk, dan berhenti sampai ada tanggapan** sebelum tugas berikutnya (D-07).
3a. Setelah selesai, centang `[x]` di `rencana-kerja.md` dan tulis satu baris catatan (tanggal, hal yang berbeda dari rencana).
4. Jika tugas ternyata tidak muat dalam beberapa jam, **pecah** dan tambahkan ke rencana, jangan menyelesaikan setengah.
5. Jika menemukan hal ambigu, catat di bagian Pertanyaan dan pilih bawaan yang paling aman (mengikuti desain jika desain dan PRD berbeda), bukan menebak diam-diam.

## 12. Daftar periksa selesai (salin ke deskripsi tiap tugas)

- [ ] Semua teks UI Bahasa Indonesia, sesuai aturan bahasa desain.
- [ ] Tidak ada hex, warna bawaan Tailwind, atau ukuran sembarang di komponen.
- [ ] Teks ≥ 16px, target sentuh ≥ 48px, tanpa bayangan jatuh.
- [ ] Logika hitung ada di `src/lib` sebagai fungsi murni, ada unit test, cakupan ≥ 90%.
- [ ] Halaman dicek di 390px dan 1440px dan dibandingkan dengan papan desain (sebutkan NN).
- [ ] Angka dosis, harga, hasil panen berasal dari data resep contoh dan diberi catatan contoh di UI.
- [ ] Tidak ada angka bisnis tertulis di komponen atau teks; semua dari `src/lib` atau konfigurasi.
- [ ] Tidak ada kata terlarang bahasa petani di tampilan.
- [ ] Tugas halaman [DEMO]: tangkapan layar mobile dan desktop sudah ditunjukkan.
- [ ] Tidak ada kunci rahasia di frontend (rahasia hanya di `.env` backend), `.env` tidak ikut commit.
- [ ] Halaman hanya mengambil data lewat klien API, tidak mengimpor data tiruan.
- [ ] `lint`, `typecheck`, `test`, `build` hijau.
- [ ] Centang di `rencana-kerja.md` dan catatan singkat sudah ditulis.
