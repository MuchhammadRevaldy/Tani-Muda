# Cek halaman terhadap papan desain (T4.40)

Pemeriksaan menyeluruh Tahap 4, 9 Oktober 2026. Pembaca: pemilik produk dan tim yang melanjutkan Tahap 5–6.

## Cara memeriksa

1. **Otomatis, semua halaman di 390, 768, 1280, dan 1440 px** (53 alamat, 212 kombinasi, termasuk halaman turunan dan panel). Skrip membuka setiap halaman dengan akun demo yang sesuai, lalu mencatat:
   - gulir mendatar pada halaman (lebar dokumen melebihi layar);
   - teks terlihat dengan ukuran di bawah 16px (teks khusus pembaca layar dikecualikan);
   - elemen yang keluar dari layar di luar wadah yang memang bisa digeser (tabel, deret pil).
2. **Visual, 390 dan 1440 px**: semua tangkapan di `docs/tangkapan/aplikasi/` diambil ulang dan dibandingkan dengan papan di `docs/tangkapan/desain/`. Perbedaan yang disengaja dirujuk ke keputusannya.
3. **Aturan proyek**: `npm run lint` (warna di luar token, teks di bawah 16px, bayangan, kata terlarang) hijau.

## Hasil otomatis

| Pemeriksaan | Hasil |
| --- | --- |
| Gulir mendatar pada halaman | Tidak ada setelah satu perbaikan: label pembaca layar di tabel editor resep lolos dari wadah gesernya dan melebarkan halaman 1978 px; wadah tabel kini `relative`. |
| Teks di bawah 16px | Tidak ada. |
| Elemen keluar layar | Tidak ada. Tabel panel admin dan mentor di 390 px digeser di dalam wadahnya sendiri, dengan catatan "Panel ini dirancang untuk layar komputer" (D-07). |
| Lint aturan proyek | Hijau. |

## Hasil per papan

Status **sama** berarti susunan, isi, dan perilaku mengikuti papan, dengan angka dan nama dari data (D-08). **Beda** selalu disertai alasan.

| Papan | Berkas | Status | Catatan |
| --- | --- | --- | --- |
| 00 | `00-sistem-desain-desktop` | sama | Halaman `/komponen`; ikon tambahan (kalender, ulang, pengukur, silang, cari, pensil, info, tambah, hapus, putar, jeda, unduh, layar penuh, bintang) bergaya sama, dicatat di `cek-komponen.md`. |
| 01 | `01-halaman-depan-mobile` | beda | Angka dari resep contoh (D-08, D-44); padi Rp1.715.000 tanpa subsidi, bukan Rp1.289.000 (D-45); label "Contoh perhitungan" dan "Dihitung dengan harga tanpa subsidi"; penggaris sawi memuat pin Siangi rumput dari resep. |
| 01 | `01-halaman-depan-desktop` | beda | Sama dengan mobile; kartu "Besok" dari tugas sawi contoh, bukan pupuk padi; kaki menambah Aturan pakai dan Bantuan; penggaris tiga tingkat supaya tangkai tidak menembus label (D-44). |
| 02 | `02-masuk-mobile` | beda | Dua langkah "Kirim kode" lalu "Masuk"; papan hanya menggambar langkah kedua. Persetujuan privasi untuk nomor baru (D-30). Panel "Kode uji" hanya di mode pengembangan. |
| 02 | `02-masuk-desktop` | beda | Seperti mobile. |
| 03 | `03-beranda-petani-mobile` | beda | Pil per siklus atau kelompok petak (D-40); tugas hari ini dari semua siklus dikelompokkan; tautan "Tahap sekarang" ke modul (P0-06); penggaris dengan pin Siangi rumput dari resep. |
| 03 | `03-beranda-petani-desktop` | beda | Seperti mobile; penggaris tiga tingkat (D-44); kartu modal dan perkiraan untung di kanan seperti papan. |
| 04 | `04-beranda-petani-hidroponik-mobile` | sama | Isi dari siklus hidroponik contoh. |
| 04 | `04-beranda-petani-hidroponik-desktop` | sama | Kartu hasil ukur terakhir dan modal seperti papan. |
| 05 | `05-beranda-petani-kosong-mobile` | sama | Tautan belajar tanpa angka menit. Versi desktop diturunkan. |
| 06 | `06-beranda-offline-tugas-terlambat-mobile` | beda | Banner offline tampil dari status jaringan; penanda "tersimpan di HP, belum terkirim" menunggu antrean offline T6.05. |
| 07 | `07-beranda-pengingat-diblokir-mobile` | sama | Banner izin notifikasi; versi desktop diturunkan. |
| 08 | `08-belajar-hidroponik-mobile` | beda | Keadaan baris dari data (selesai, sisa n menit, tersimpan offline, video menyusul); "Kelola unduhan" diganti teks pemakaian sampai T6.06 (D-43, D-44). |
| 08 | `08-belajar-hidroponik-desktop` | beda | Seperti mobile; panel Sedang dipelajari dan Unduhan di kanan. |
| 09 | `09-belajar-bedengan-mobile` | beda | Seperti papan 08. |
| 09 | `09-belajar-bedengan-desktop` | beda | Seperti papan 08. |
| 10 | `10-hitung-pilih-tanaman-mobile` | sama | |
| 10 | `10-hitung-pilih-tanaman-desktop` | beda | Menu profil yang terbuka di papan tidak ditiru (keadaan peraga); panel kanan berisi ringkasan komoditas dan pesanan terdekat. |
| 11 | `11-hitung-segera-hadir-mobile` | sama | Tangkapan memakai tomat karena Arif sudah meminta cabai di data contoh. |
| 11 | `11-hitung-segera-hadir-desktop` | sama | |
| 12 | `12-hitung-segera-hadir-sudah-diminta-mobile` | sama | |
| 12 | `12-hitung-segera-hadir-sudah-diminta-desktop` | sama | |
| 13 | `13-hitung-cara-tanam-sawi-bedengan-mobile` | sama | Teks bantuan ru dibulatkan seperti papan. |
| 13 | `13-hitung-cara-tanam-sawi-bedengan-desktop` | sama | |
| 14 | `14-hitung-cara-tanam-sawi-hidroponik-mobile` | beda | Saklar vertikultur belum mengubah kebutuhan tempat (faktor belum ada di data). |
| 14 | `14-hitung-cara-tanam-sawi-hidroponik-desktop` | beda | Seperti mobile. |
| 15 | `15-hitung-cara-tanam-padi-sawah-mobile` | beda | Label CONTOH menggantikan "Resepnya sudah dicek penyuluh" karena resep belum divalidasi. |
| 15 | `15-hitung-cara-tanam-padi-sawah-desktop` | beda | Seperti mobile. |
| 16 | `16-hitung-modal-sawi-bedengan-mobile` | beda | Total memakai rata-rata harga laporan sekitar bila ada, sehingga berbeda dari Rp430.000 di papan; sumber harga tiap item tampil (D-38). |
| 16 | `16-hitung-modal-sawi-bedengan-desktop` | beda | Seperti mobile. |
| 17 | `17-hitung-modal-pilih-merek-npk-mobile` | beda | Tidak ada merek yang terpilih otomatis supaya tidak terkesan merekomendasikan (P0-34). |
| 17 | `17-hitung-modal-pilih-merek-npk-desktop` | beda | Seperti mobile. |
| 18 | `18-hitung-modal-sawi-hidroponik-mobile` | sama | Alat sekali beli dibagi 10 siklus seperti papan. |
| 18 | `18-hitung-modal-sawi-hidroponik-desktop` | sama | |
| 19 | `19-hitung-modal-padi-sawah-mobile` | beda | Subsidi bawaan mengikuti "terdaftar di kelompok tani" di profil (D-38); bawaan Nonsubsidi. |
| 19 | `19-hitung-modal-padi-sawah-desktop` | beda | Seperti mobile. |
| 20 | `20-jadwal-sawi-bedengan-mobile` | sama | Tugas berulang tampil hari ini dan besok, satu yang terlambat, atau satu berikutnya. |
| 20 | `20-jadwal-sawi-bedengan-desktop` | sama | |
| 21 | `21-jadwal-sawi-hidroponik-mobile` | sama | |
| 21 | `21-jadwal-sawi-hidroponik-desktop` | sama | |
| 22 | `22-detail-tugas-mobile` | sama | Versi desktop diturunkan. |
| 23 | `23-cek-ph-ppm-normal-mobile` | beda | Label CONTOH menggantikan "Rentang dari Resep Tanam yang dicek penyuluh". |
| 23 | `23-cek-ph-ppm-normal-desktop` | beda | Seperti mobile. |
| 24 | `24-cek-ph-terlalu-tinggi-mobile` | beda | Seperti papan 23. |
| 24 | `24-cek-ph-terlalu-tinggi-desktop` | beda | Seperti papan 23. |
| 25 | `25-cek-ppm-terlalu-rendah-mobile` | beda | Seperti papan 23; tugas "Ukur ulang" besok dibuat server (D-34). |
| 25 | `25-cek-ppm-terlalu-rendah-desktop` | beda | Seperti mobile. |
| 26 | `26-pengingat-per-siklus-mobile` | beda | "Lewati siram saat hujan" bertanda segera hadir (P1-05). |
| 26 | `26-pengingat-per-siklus-desktop` | beda | Seperti mobile. |
| 27 | `27-detail-siklus-modal-mobile` | beda | Status "sebagian dibayar" belum dibedakan dari hemat. Versi desktop diturunkan. |
| 28 | `28-detail-siklus-jurnal-mobile` | sama | Foto contoh berupa gambar SVG. Versi desktop diturunkan. |
| 29 | `29-pesanan-di-sekitar-mobile` | sama | Lencana menu Pesanan dari pesanan baru (D-39). |
| 29 | `29-pesanan-di-sekitar-desktop` | sama | Peta dari titik tengah desa. |
| 30 | `30-pesanan-kosong-mobile` | sama | Versi desktop diturunkan. |
| 31 | `31-detail-pesanan-mobile` | beda | Saran tanam bertahap per petak (D-40); jadwal kirim yang terkejar umur panen (D-39). Versi desktop diturunkan. |
| 32 | `32-kesepakatan-mobile` | beda | Tanpa denda Rp25.000 dan tanpa aturan tiga kali berturut-turut (D-03); jumlah bisa diubah sebelum Setuju (D-39). |
| 33 | `33-kiriman-saya-mobile` | beda | Dua foto: hasil panen wajib, timbangan opsional (D-40). Versi desktop diturunkan. |
| 34 | `34-profil-petani-mobile` | beda | Tanpa nama pengguna, kata sandi, dan nama kelompok tani (D-04, D-06, D-38); Pengingat per siklus (P0-38, D-45). |
| 34 | `34-profil-petani-desktop` | beda | Seperti mobile. |
| 35 | `35-ubah-profil-mobile` | beda | Tanpa kata sandi dan nama pengguna (D-04); isian kelompok tani (D-38); ganti nomor dengan kode ke nomor baru (D-44). |
| 35 | `35-ubah-profil-desktop` | beda | Seperti mobile; pratinjau untuk pembeli di kanan seperti papan. |
| 36 | `36-dasbor-pesanan-pembeli-desktop` | beda | Penggaris pembeli hanya pin Panen (D-41); "Ubah tawaran" menjadi P1-13. Versi mobile diturunkan. |
| 37 | `37-buat-pesanan-pembeli-desktop` | beda | Frekuensi seminggu atau dua minggu sekali; "Dua kali seminggu" menjadi P1-14 (D-42); batas jam antar (D-40). Versi mobile diturunkan. |
| 38 | `38-konfirmasi-kiriman-pembeli-desktop` | beda | Dua foto dari petani (D-40); empat alasan penolakan D-14. Versi mobile diturunkan. |

## Arsip Tahap 1

Enam tangkapan kerangka dari Tahap 1 dipindah ke `docs/tangkapan/arsip/tahap-1/` supaya tidak bercampur dengan tangkapan halaman yang sudah jadi. Isinya rangka halaman sebelum halaman dibangun, sehingga tidak diambil ulang:

- `00-kerangka-petani-mobile.png`, `00-kerangka-petani-desktop.png`
- `00-kerangka-pembeli-mobile.png`, `00-kerangka-pembeli-desktop.png`
- `00-sidebar-teks-lengkap-kursor-desktop.png`, `00-sidebar-teks-lengkap-menu-desktop.png` (D-17)

Halaman turunan tanpa papan (39–63) mengikuti pola papan terdekat dan sudah diperiksa per gelombang; daftarnya ada di `design/README.md`.
