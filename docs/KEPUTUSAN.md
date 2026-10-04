# Keputusan Produk dan Teknis Tani Muda

**Aturan utama: jika isi dokumen ini bertentangan dengan PRD atau desain, dokumen ini yang berlaku.** Urutan kekuatan: `KEPUTUSAN.md` > `ATURAN-PROYEK.md` > PRD dan desain (`design/`). Keputusan baru ditambahkan di bawah dengan nomor berikutnya; jangan mengubah isi keputusan lama tanpa memberi tahu pemilik produk.

Ditetapkan oleh pemilik produk, 4 Oktober 2026. Butir bertanda **(turunan)** adalah konsekuensi yang saya tarik dari keputusan pemilik dan masih perlu dikonfirmasi.

---

## D-01. Batas periksa kiriman
- Pesanan **rutin: 6 jam**. Pesanan **sekali panen: 24 jam**.
- Lewat batas tanpa tanggapan pembeli, kiriman **dianggap diterima** dan dana cair ke petani.
- Kedua angka adalah **konfigurasi** (per jenis pesanan), bukan konstanta di kode.
- Mengganti: PRD P0-25 (24 jam untuk semua).
- Berdampak ke: T2.14, T4.25, T4.32, T5.10.

## D-02. Pembayaran uang muka dan per kiriman
- Uang muka = **20%** dari nilai pesanan. Biaya layanan **5%** dibayar pembeli (tidak memotong bagian petani), seperti PRD.
- Untuk **setiap kiriman**: pembeli membayar **80%** dari nilai kiriman itu, dan **20% sisanya diambil dari saldo uang muka**.
- Mengganti: rumus PRD "uang muka diperhitungkan pada kiriman terakhir".
- Persen 20, 5, 80 adalah konfigurasi.
- Berdampak ke: T2.12, T4.23, T4.25, T5.08.

## D-03. Gagal panen dan pembatalan
- **Tidak ada denda Rp25.000.** Aturan "3 kali berturut-turut pembeli boleh mengakhiri" di desain juga tidak dipakai.
- Petani yang tidak sanggup **wajib memberi kabar paling lambat 3 hari sebelum jadwal kirim**.
- Bagian yang tidak terpenuhi **ditawarkan ke petani lain**. Jika tidak ada pengganti, **sisa uang muka untuk bagian itu dikembalikan ke pembeli**.
- Petani yang **tidak memberi kabar** mendapat **catatan di profil** dan bisa **dinonaktifkan sementara oleh admin**.
- Pembatalan oleh pembeli setelah petani mulai menanam tetap mengikuti PRD P0-27 (uang muka menjadi kompensasi petani).
- Batas 3 hari adalah konfigurasi.
- (turunan) Butuh status akun petani (`aktif` / `dinonaktifkan_sementara`) dan tabel `catatan_petani`. Petani yang dinonaktifkan sementara tidak bisa mengambil pesanan baru, tetapi masih bisa membuka jadwal dan jurnal.
- Berdampak ke: T2.14, T3.02, T3.07, T4.20, T4.27, T4.29, T5.10.

## D-04. Login
- Hanya **nomor HP dan OTP**. **Kata sandi dan nama pengguna dihapus dari semua halaman** (Masuk, Profil, Ubah profil) dan dari model data.
- Ganti nomor HP tetap lewat OTP ke nomor baru.
- Berdampak ke: T3.02, T4.33, T4.35, T4.36.

## D-05. Hidroponik hanya sawi
- v1 hanya punya resep **sawi hidroponik**. Bayam dan kangkung hidroponik tampil **"Segera hadir"** dan bisa diminta resepnya (P0-31).
- Mengganti: desain yang menampilkan hidroponik tersedia untuk bayam dan kangkung (papan 07, 09, 41–44).
- Berdampak ke: T3.11, T4.02, T4.04, T4.30.

## D-06. Tambahan Model Data
Tabel dan kolom berikut ditambahkan ke Model Data PRD. Nama persis seperti ini.

| Tabel / kolom | Isi |
| --- | --- |
| `lahan` | petani, nama lahan, jenis lahan, `luas_m2`, `satuan_asli`, `nilai_asli` (angka yang diketik petani, mis. 7 ru), desa, titik koordinat, `kapasitas_lubang` (kapasitas instalasi hidroponik, jumlah lubang) |
| `wilayah` | desa, kecamatan, kabupaten, koordinat titik tengah desa. Dipakai untuk radius pesanan |
| `pengguna.foto_profil` | foto profil |
| `pengiriman.alasan_penolakan` | pilihan: `layu_atau_busuk`, `jumlah_kurang`, `tidak_sesuai_standar`, `lainnya` |
| `pengiriman.jumlah_ditolak` | berat yang ditolak (kg) |
| `pengiriman.foto_penolakan` | foto bukti penolakan |
| `sengketa` | pengiriman, status, keputusan admin, catatan, waktu |
| `kelompok_tani`, `anggota_kelompok_tani` | **Dibuat sekarang, tampilannya baru di P1** |

Aturan:
- **Kapasitas lahan untuk P0-21 = luas lahan dikurangi luas yang sedang dipakai siklus aktif di lahan itu.** Dihitung oleh fungsi di `src/lib` (T2.17).
- **Privasi lokasi:** ke pembeli hanya tampil **nama desa dan jarak**, tidak pernah titik koordinat lahan. Jarak dihitung dari titik tengah desa (`wilayah`), bukan dari titik lahan.
- Siklus menunjuk lahan: `siklus_tanam.lahan_id` (turunan).
- Kolom lain dari desain yang **tidak** dibuat: kata sandi, nama pengguna (D-04).
- Alasan penolakan di desain (daun berlubang, layu, menguning, busuk, kurang berat) dipetakan ke empat pilihan di atas: layu, menguning, busuk, daun berlubang → `layu_atau_busuk` atau `tidak_sesuai_standar` menurut resep, kurang berat → `jumlah_kurang`; teks bebas di catatan. (turunan)
- Berdampak ke: T3.02, T3.06, T3.07, T3.15, T4.19, T4.25, T4.36a.

## D-07. Halaman tanpa desain dan tata letak
- Halaman yang belum ada desainnya dibuat sebagai **turunan dari pola yang ada**: web mobile **390px dengan navigasi bawah**, desktop **1440px dengan sidebar kiri** dan **dua kolom jika membantu**.
- **Panel mentor dan admin: cukup versi desktop**, tata letak tabel sederhana.
- Untuk setiap tugas halaman bertanda **[DEMO]**: sebelum lanjut ke tugas berikutnya, **tunjukkan tangkapan layar versi mobile dan desktop kepada pemilik produk** dan tunggu tanggapan. Tangkapan layar disimpan di `docs/tangkapan/<ID tugas>/mobile.png` dan `desktop.png`.
- Mengganti: asumsi bahwa pembeli hanya di laptop tidak dipakai; halaman pembeli juga dibuat di 390px.
- Berdampak ke: semua tugas halaman Tahap 4, aturan 11 `ATURAN-PROYEK.md`.

## D-08. Angka dan rumus
- **Rumus di PRD yang berlaku. Angka di desain hanya ilustrasi.**
- Semua angka di aplikasi (kapasitas, modal, titik impas, uang muka, nilai pembayaran, jumlah kiriman, sisa saldo, luas dibutuhkan) **dihitung oleh fungsi di `src/lib`** dan tidak boleh ditulis langsung di komponen atau teks.
- Contoh: "6 kg per minggu" di papan 54 adalah ilustrasi; angka kapasitas di aplikasi dari `kapasitas-lahan.ts` dan `pesanan-lahan.ts`.
- Teks contoh di desain yang memuat angka (mis. "paling lama 6 jam", "Rp430.000 · impas di 86 kg" di landing) dibuat dari data dan fungsi yang sama, atau dari konfigurasi.
- Berdampak ke: semua tugas Tahap 2 dan halaman yang menampilkan angka.

## D-09. Aturan bahasa (lengkap)
1. Semua teks UI Bahasa Indonesia.
2. **"kamu"** untuk petani, **"Anda"** untuk pembeli.
3. Tombol diawali kata kerja ("Simpan rencana", "Ambil pesanan").
4. Kalimat biasa, **bukan huruf kapital semua**.
5. **Bahasa petani**: "Hari ke-13", bukan "HST 13"; "Uang muka sudah masuk", bukan "Pembayaran DP berhasil". **Hindari istilah escrow, task, pending, submit, DP, HST, dashboard, login** di tampilan.
6. Rupiah ditulis lengkap: `Rp1.250.000` (bukan "1,25 jt", "Rp 1.25jt").
7. Nada tenang, kalimat pendek, tanpa tanda seru; galat menyebut apa yang harus dilakukan.
- Catatan: istilah "HST" boleh dipakai di kode, basis data, dan panel mentor; di tampilan petani selalu "hari ke-n".
- Berdampak ke: `src/teks/`, lint teks (T1.03).

## D-10. Hambatan PRD tidak menghentikan pekerjaan
- **Resep dan rentang pH/PPM:** data contoh dengan status **`draf`** dan label **"CONTOH, belum divalidasi penyuluh"** di data seed. Pemilik produk menggantinya setelah bertemu penyuluh.
- **Payment gateway:** antarmuka **`PenyediaPembayaran`** dengan implementasi **tiruan** untuk demo (menahan, mencairkan, mengembalikan dana secara simulasi). Penyedia sungguhan dipasang nanti tanpa mengubah halaman.
- **OTP:** **nomor uji Supabase** selama pengembangan, di balik antarmuka **`PenyediaOtp`** supaya penyedia SMS mudah dipasang nanti.
- Berdampak ke: T3.09–T3.12, T4.33, T5.08, T5.09.

## D-11. Resep `draf` tetap tampil di demo (turunan, perlu konfirmasi)
PRD P0-03 melarang resep belum divalidasi tampil ke petani, sedangkan D-10 menetapkan resep contoh berstatus `draf`. Penyelesaian yang saya pakai:
- Kolom `resep_tanam.status` (`draf` | `divalidasi`) dan `resep_tanam.contoh` (boolean).
- Petani melihat resep bila `status = 'divalidasi'`, **atau** bila `contoh = true` dan konfigurasi `tampilkan_resep_contoh = true` (aktif di demo, **mati di produksi**).
- Setiap layar yang memakai resep `contoh` menampilkan label **"CONTOH, belum divalidasi penyuluh"**.
- Jika tidak disetujui: resep contoh disetel `divalidasi` dengan validator "Contoh (demo)" — saya tidak memilih ini karena menyiratkan validasi yang belum terjadi.

---

## Riwayat
| Tanggal | Perubahan |
| --- | --- |
| 2026-10-04 | D-01 sampai D-11 ditetapkan |
