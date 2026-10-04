# Aturan Proyek Tani Muda

> **`docs/KEPUTUSAN.md` mengalahkan PRD, desain, dan dokumen ini jika bertentangan.** Baca dulu sebelum mengerjakan tugas apa pun.

Aturan ini **wajib diikuti di setiap tugas**, oleh manusia maupun asisten AI. Sebelum menandai tugas di `RENCANA-KERJA.md` selesai, cek daftar di bagian 12.

Acuan: `docs/KEPUTUSAN.md` (keputusan produk, tertinggi), `docs/PRD …` (kebutuhan), `docs/RINGKASAN-DESAIN.md` (token, komponen, halaman), `design/` (sumber desain, jangan diubah).

---

## 1. Bahasa

1. **Semua teks yang dilihat pengguna ditulis dalam Bahasa Indonesia**: label, tombol, galat, placeholder, `aria-label`, judul halaman (`<title>`), teks notifikasi, teks email/SMS bila ada. Kode, nama variabel, nama berkas, dan komentar boleh Indonesia atau Inggris, tetapi **istilah domain memakai Indonesia** seperti di PRD dan Model Data (`siklus_tanam`, `resep_tugas`, `uang_muka`) supaya cocok dengan tabel.
2. Aturan bahasa (D-09 di `KEPUTUSAN.md`, dan `RINGKASAN-DESAIN.md` bagian 4):
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

1. **Semua warna dan ukuran lewat token di `tailwind.config.ts`** (diambil dari `RINGKASAN-DESAIN.md` bagian 1). Dilarang:
   - menulis hex, `rgb()`, atau `hsl()` di komponen, CSS, atau `style={{}}`;
   - memakai warna bawaan Tailwind (`bg-green-600`, `text-gray-500`, `border-red-500`);
   - memakai nilai sembarang (`w-[53px]`, `p-[13px]`, `text-[17px]`, `rounded-[10px]`) untuk ukuran yang ada tokennya.
2. Nama token memakai nama dari desain: `daun-tua`, `embun-pagi`, `tanah`, `tomat`, `teks-pendukung`, `garis-kuat`, dst. (17 warna). Contoh: `bg-daun-tua text-putih`, `border-garis`, `text-teks-pendukung`.
3. Aturan pemakaian warna dari desain **wajib dipatuhi**: hijau daun hanya untuk yang tumbuh atau harus dikerjakan; cokelat `tanah` hanya untuk uang dan panen; `matahari` bukan untuk teks (teks pakai `matahari-teks`); lencana nav memakai `teks`, bukan merah.
4. Ukuran minimum: **teks tidak boleh lebih kecil dari 16px** (tidak ada `text-sm`/`text-xs`), **setiap elemen yang bisa disentuh minimal 48×48px** (`min-h-sentuh min-w-sentuh`), tinggi tombol dan kolom isian `tinggi-kontrol` 52px.
5. **Tidak ada bayangan jatuh.** Satu-satunya `box-shadow` adalah cincin fokus (`ring` token `fokus`) dan cincin pilihan. Dilarang `shadow-md`, `shadow-lg`, dll.
6. Hanya mode terang. Jangan menambah `dark:`.
7. Pengecualian token harus melewati proses: tambahkan token ke `tailwind.config.ts` **dan** ke `RINGKASAN-DESAIN.md`, lalu pakai. Jangan membuat nilai satu kali pakai.
8. Dijaga otomatis oleh lint (tugas T1.03): kalau ada hex atau warna bawaan Tailwind di `src/`, `npm run lint` gagal.
9. Warna di data (mis. batang pengukuran, SVG ilustrasi) memakai kelas token atau `currentColor`; SVG memakai `stroke="currentColor"`.

## 3. Logika perhitungan: fungsi murni di `src/lib` dengan unit test

1. Semua logika berikut **ditulis sebagai fungsi TypeScript murni di `src/lib/`** (tanpa React, tanpa Supabase, tanpa `Date.now()` atau `new Date()` di dalamnya, tanpa efek samping):
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
5a. Komponen React dan Edge Function hanya **memanggil** fungsi di `src/lib` (Edge Function memakai berkas yang sama lewat impor bersama), tidak menghitung sendiri. Ada satu sumber kebenaran per rumus.
6. Aturan pembulatan: uang dibulatkan ke rupiah penuh di satu tempat (`bulatkanRupiah`); kebutuhan input dibulatkan **ke atas** ke kelipatan ukuran kemasan; tampilan dibulatkan di `format.ts`, bukan di logika.
7. Status "terlambat" **tidak disimpan** di database (PRD): dihitung dari tanggal tugas dan hari ini lewat fungsi murni.
8. Pesan galat validasi (ukuran nol, harga negatif) dikembalikan fungsi sebagai kode galat yang jelas (`'UKURAN_KOSONG'`), lalu diterjemahkan ke teks Indonesia di `src/teks/`.

## 4. Responsif: web mobile 390px dan desktop 1440px

1. **Setiap halaman dibuat untuk dua ukuran**: web mobile 390px dan desktop 1440px. Halaman baru dinyatakan selesai hanya jika keduanya sudah dicek (lebar 390 dan 1440, juga 1280 dan 768 supaya tidak patah).
2. Pendekatan: mobile dulu. Pola mengikuti desain:
   - HP: satu kolom, padding 16px, **navigasi bawah 4 menu** (Beranda, Kebun, Pesanan, Belajar) untuk petani.
   - Desktop petani: **sidebar 256px** + konten `max-width: 1200px`. Desktop pembeli: **header atas** + konten `max-width: 1152px`.
   - Titik patah dipilih satu kali di `tailwind.config.ts` (keputusan di `RENCANA-KERJA.md` bagian Pertanyaan); jangan membuat titik patah baru per halaman.
3. Papan desain yang hanya punya satu ukuran (lihat `RINGKASAN-DESAIN.md` bagian 3) **diturunkan** dari pola desain yang ada, tanpa memperkenalkan komponen atau warna baru.
4. Tidak ada gulir horizontal pada 390px. Target sentuh dan teks tetap sesuai bagian 2 di semua ukuran.
5. Cek kebenaran visual dengan membandingkan berdampingan dengan papan di `design/extracted/pages/NN.html` (buka file itu di browser; atau halaman `/komponen` untuk komponen). Catat papan yang dibandingkan di deskripsi tugas.
6. Tidak ada gambar tanpa `alt` dan tidak ada tombol ikon tanpa label. Kontras mengikuti token (sudah lolos); jangan menurunkannya dengan opasitas.

## 5. Data contoh, bukan rekomendasi

1. **Semua angka dosis, harga, hasil panen, rentang pH dan PPM, jadwal HST, dan pembagian biaya dalam repo adalah data contoh dari resep**, bukan rekomendasi agronomis atau keuangan. Resep yang dipakai hanya dari seed (`supabase/seed/`) dan berlabel `contoh`.
2. Konsekuensi di kode:
   - Dilarang menulis angka dosis, harga, hasil per m², atau rentang pH/PPM langsung di komponen atau di `src/lib`. Angka itu **hanya** ada di data (seed SQL, fixture test) dan dibaca dari tabel `resep_*`.
   - Fixture test boleh memakai angka contoh, ditandai di nama berkas atau komentar: `fixtures/contoh-resep-sawi.ts`.
3. Konsekuensi di UI: setiap halaman yang menampilkan hasil hitungan menampilkan catatan yang sama dengan desain: **"Semua harga di halaman ini adalah contoh. Ubah sesuai harga di kios dan upah di desamu."**, dan hasil pengukuran memuat "Rentang dari Resep Tanam yang dicek penyuluh." Aplikasi tidak pernah menyebut merek tertentu sebagai rekomendasi (P0-34) dan promo selalu terpisah (P0-35).
4. Resep seed berstatus **`draf`**, kolom `contoh = true`, dan berlabel **"CONTOH, belum divalidasi penyuluh"** di data seed dan di tampilan (D-10, D-11). Resep tampil ke petani hanya bila `divalidasi`, atau `contoh` dengan konfigurasi `tampilkan_resep_contoh` aktif (hanya demo). Jangan mengklaim validasi yang belum terjadi.
5. Satuan dan nilai konfigurasi bisnis (14 m²/ru, uang muka 20%, biaya layanan 5%, radius 10 km, batas periksa kiriman 6 jam rutin dan 24 jam sekali panen, batas kabar gagal panen 3 hari) disimpan sebagai data/konfigurasi, bukan konstanta tersebar.

## 6. Rahasia dan keamanan

1. **Kunci rahasia hanya di `.env`** (lokal) dan variabel lingkungan hosting. `.env` ada di `.gitignore`; yang masuk repo hanya `.env.example` dengan nama variabel dan nilai kosong.
2. **`SUPABASE_SERVICE_ROLE_KEY` dilarang dipakai di frontend** dan dilarang diawali `VITE_` (semua variabel `VITE_` terbuka di browser). Service role key hanya dipakai di **Edge Function** (variabel lingkungan Supabase) dan skrip lokal di luar `src/`.
3. Frontend hanya memakai `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`. Seluruh hak akses dijaga **Row Level Security** di database, bukan oleh frontend. Setiap tabel yang berisi data pengguna **wajib** punya kebijakan RLS di migrasi yang sama dengan pembuatan tabelnya.
4. Kunci payment gateway (server key), kunci VAPID privat untuk web push, dan kunci penyedia SMS hanya di Edge Function. Kunci publik VAPID boleh `VITE_VAPID_PUBLIC_KEY`.
5. Dilarang menulis kunci, token, nomor HP asli, atau data pribadi di kode, seed, fixture, log, atau tangkapan layar. Seed memakai nomor dan nama fiktif.
6. Dana pengguna tidak pernah masuk rekening tim; status ditahan/cair hanya dicatat dari respons payment gateway (PRD). Mode uji coba memakai sandbox gateway.
7. Foto pengguna: simpan di Supabase Storage dengan bucket privat dan tautan bertanda tangan; dikecilkan sebelum diunggah (desain menjanjikan "Foto dikecilkan otomatis supaya hemat kuota").
8. Lampirkan pengecekan: `npm run lint` memeriksa pola `service_role` dan `SUPABASE_SERVICE` di `src/` (tugas T1.03).

## 6a. Antarmuka penyedia (D-10)

1. **Pembayaran:** semua halaman dan Edge Function memakai antarmuka `PenyediaPembayaran` (`tahan`, `cairkan`, `kembalikan`, `status`). Demo memakai implementasi **tiruan** (simulasi). Penyedia sungguhan dipasang nanti dengan mengganti implementasi, tanpa mengubah halaman.
2. **OTP:** semua halaman memakai antarmuka `PenyediaOtp` (`kirimKode`, `verifikasi`). Pengembangan memakai nomor uji Supabase. Penyedia SMS dipasang nanti.
3. Implementasi tiruan harus **jelas ditandai** (nama berkas dan label di UI uji) dan dimatikan di produksi lewat konfigurasi, bukan dihapus diam-diam.

## 7. Aturan kode

1. Stack tetap: React + TypeScript (mode `strict`) + Vite + `vite-plugin-pwa`, Tailwind CSS, Supabase (PostgreSQL + PostGIS, Auth OTP, Storage, Edge Functions), Dexie + TanStack Query untuk offline, Vitest. Menambah pustaka besar harus lewat keputusan tertulis di `RENCANA-KERJA.md`.
2. Struktur:
   - `src/lib/` fungsi murni + test; `src/teks/` teks UI; `src/komponen/` komponen berbagi (nama Indonesia mengikuti desain: `Tombol`, `Kartu`, `KolomIsian`, `InputRupiah`, `Uang`, `ChipStatus`, `BarisTugas`, `PenggarisUmurTanam`, `Banner`, `NavigasiBawah`, `Ikon`, `Sidebar`, …); `src/halaman/` satu folder per halaman; `src/data/` akses Supabase, query TanStack, skema Dexie; `src/penyedia/` antarmuka dan implementasi `PenyediaPembayaran` dan `PenyediaOtp`; `src/tipe/` tipe domain.
   - `supabase/migrations/` migrasi SQL berurutan; `supabase/seed/` data contoh; `supabase/functions/` Edge Function.
3. Tidak ada `any` tanpa komentar alasan. Tipe domain diturunkan dari skema database (tipe hasil generate Supabase) bila memungkinkan.
4. **Pemisahan:** komponen UI tidak memanggil Supabase langsung. Pengambilan data lewat hook di `src/data/` (TanStack Query). Penulisan yang harus jalan offline lewat antrean Dexie (tahap 5).
5. Komponen mengikuti API komponen desain (nama props berbahasa Indonesia seperti di `RINGKASAN-DESAIN.md` bagian 2.1) supaya perbandingan dengan desain mudah. Aksesibilitas bawaan desain (`role`, `aria-*`, `aria-current`, fokus terlihat) **tidak boleh hilang**.
6. Dependensi: gunakan versi tetap di `package.json` (tanpa `^` untuk pustaka inti) dan commit `package-lock.json`.
7. Satu perubahan = satu tugas = satu commit/PR kecil dengan pesan Bahasa Indonesia atau Inggris yang menyebut ID tugas (mis. `T2.04: jadwal otomatis`).
8. Jangan memodifikasi `design/` dan `docs/PRD …`. Perubahan keputusan produk dicatat di `RENCANA-KERJA.md` bagian Keputusan.

## 8. Basis data

1. Nama tabel dan kolom **persis seperti Model Data di PRD** (`pengguna`, `profil_pembeli`, `komoditas`, `metode_tanam`, `resep_tanam`, `resep_input`, `resep_tugas`, `modul`, `progres_modul`, `permintaan_resep`, `input_pertanian`, `kelayakan_subsidi`, `merek_input`, `laporan_harga`, `promo`, `konversi_satuan`, `siklus_tanam`, `rencana_item`, `tugas`, `hasil_pengukuran`, `pengeluaran`, `pengaturan_pengingat`, `langganan_notifikasi`, `pesanan`, `alokasi_pesanan`, `pembayaran`, `pengiriman`, `rating`). Tabel tambahan sudah ditetapkan di `KEPUTUSAN.md` D-06 (`lahan`, `wilayah`, `sengketa`, `kelompok_tani`, `anggota_kelompok_tani`, `catatan_petani`) dan kolom `pengguna.foto_profil`, `pengiriman.alasan_penolakan|jumlah_ditolak|foto_penolakan`. Tidak ada tabel atau kolom kata sandi dan nama pengguna. Tambahan lain harus dicatat di `KEPUTUSAN.md`.
2. Metode, komoditas, dan satuan lokal **disimpan sebagai data, bukan nilai tetap di kode** (P2-09, P2-07, P2-08): metode tanam di tabel, `hasil_pengukuran.sumber` ('manual' | 'sensor'), `merek_input.nomor_pendaftaran`.
3. `siklus_tanam` menyimpan **versi resep saat dibuat** (P0-04). Dosis resep tersimpan sebagai nilai dasar (P2-04). Lokasi lahan disimpan di `lahan` (PostGIS `geography(Point, 4326)`), tetapi **jarak ke pembeli dihitung dari titik tengah desa (`wilayah`)** dan ke pembeli hanya tampil nama desa dan jarak, tidak pernah titik lahan (D-06, P0-20).
4. Migrasi: satu berkas per perubahan, bernomor, idempoten bila mungkin; tidak mengubah migrasi yang sudah digabung (buat migrasi baru).
5. RLS aktif pada semua tabel. Contoh kebijakan minimal: petani hanya membaca dan menulis siklusnya sendiri; resep tampil ke petani hanya bila `divalidasi`; pembeli belum terverifikasi tidak dapat memasang pesanan (dijaga di database, bukan hanya UI).

## 9. Offline dan PWA

1. Jadwal, checklist, rencana modal, dan video yang sudah diunduh **harus bisa dibuka tanpa sinyal** (P0-29). Perubahan offline (menandai tugas selesai) masuk antrean Dexie dan tersinkron otomatis saat sinyal kembali.
2. Banner offline memakai komponen `Banner jenis="offline"` dengan teks dari desain.
3. Notifikasi web push **dipisah dari salurannya** (P2-02): logika "tugas apa yang dikirim" ada di fungsi murni di `src/lib`; pengirim di Edge Function. Notifikasi pagi pukul 06.00 waktu pengguna; bila izin ditolak, tugas hari ini tampil sebagai banner (P0-13).
4. iPhone: web push butuh aplikasi ditambahkan ke layar utama; dokumentasikan di README dan tampilkan petunjuk.

## 10. Pengujian dan kualitas

1. Perintah wajib hijau sebelum tugas ditandai selesai: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
2. Unit test: semua `src/lib` (bagian 3). Test komponen untuk perilaku yang bukan sekadar tampilan: `InputRupiah` (titik ribuan, kursor, terbilang), `BarisTugas` (centang), `PenggarisUmurTanam` (tata letak pin), filter tugas, kalkulator (mengubah jumlah memperbarui total).
3. Test database (migrasi + RLS) minimal satu skrip yang memastikan: petani A tidak bisa membaca siklus petani B; resep belum divalidasi tidak terbaca petani.
4. Tiap halaman punya daftar periksa di deskripsi tugas (bagian 12). Tidak ada tugas halaman yang selesai tanpa membandingkan dengan papan desain terkait.
5. Jangan menonaktifkan test atau lint untuk meloloskan tugas; perbaiki penyebabnya.

## 11. Cara bekerja dengan rencana kerja

1. Kerjakan tugas **berurutan sesuai prasyarat** di `RENCANA-KERJA.md`. Jangan melompat ke halaman sebelum komponen dan `src/lib` yang dibutuhkan selesai.
2. Tugas bertanda **[DEMO]** diprioritaskan untuk demo lomba.
3. Untuk tugas halaman bertanda **[DEMO]**: ambil tangkapan layar mobile (390px) dan desktop (1440px) ke `docs/tangkapan/<ID tugas>/`, **tunjukkan ke pemilik produk, dan berhenti sampai ada tanggapan** sebelum tugas berikutnya (D-07).
3a. Setelah selesai, centang `[x]` di `RENCANA-KERJA.md` dan tulis satu baris catatan (tanggal, hal yang berbeda dari rencana).
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
- [ ] Tidak ada rahasia atau service role key di frontend, `.env` tidak ikut commit.
- [ ] `lint`, `typecheck`, `test`, `build` hijau.
- [ ] Centang di `RENCANA-KERJA.md` dan catatan singkat sudah ditulis.
