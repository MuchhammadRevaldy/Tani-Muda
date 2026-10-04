# Desain Tani Muda

Folder ini berisi sumber desain. **Isinya tidak diubah**, hanya dibaca.

| Isi | Keterangan |
| --- | --- |
| `desain-tani-muda.html` | File desain asli (bundle, 12,7 MB). Berisi 64 papan: sistem desain (papan 00) dan semua halaman web mobile 390px dan desktop 1440px. Buka langsung di browser. |
| `icons/` | 16 ikon resmi (SVG 24×24, garis 2, ujung bulat). |
| `extracted/` | Bahan kerja hasil bongkar file desain. **Tidak masuk git.** Buat ulang dengan `npm run ekstrak-desain`. |

## Penamaan

Setiap papan diberi nama `<nomor>-<nama-halaman>-<mobile|desktop>`.

- **Nomor mengikuti urutan alur aplikasi**: halaman depan, masuk, beranda, belajar, hitung modal, jadwal dan pengingat, pesanan, profil, lalu halaman pembeli. Nomor ini bukan urutan papan di file desain.
- Versi mobile dan desktop dari halaman yang sama berbagi nomor.
- Di semua dokumen, "papan 03" berarti kedua versi halaman 03, sedangkan "papan 03 mobile" berarti satu versi saja.
- Peta nomor ke judul papan di file desain ada di [`scripts/papan-desain.mjs`](../scripts/papan-desain.mjs).

Setelah `npm run ekstrak-desain`, tiap papan tersedia sebagai:

- `extracted/tampil/<nama>.html`: papan mandiri, bisa dibuka di browser atau ditangkap layar;
- `extracted/pages/<nama>.html` dan `<nama>.assets.json`: templat papan dan peta asetnya, untuk dibaca.

## Indeks papan

Kolom **Tangkapan aplikasi** adalah nama file tangkapan layar halaman aplikasi yang dibangun dari papan itu, di [`docs/tangkapan/aplikasi/`](../docs/tangkapan/aplikasi/). Tanda ✓ berarti file sudah ada. Halaman yang desainnya hanya punya satu versi tetap dibangun dan ditangkap dalam dua versi; versi turunan memakai nomor dan nama yang sama dengan akhiran versi lainnya, misalnya `22-detail-tugas-desktop.png`.

| Nomor | Halaman | Peran | Versi | File papan | Tangkapan aplikasi |
| --- | --- | --- | --- | --- | --- |
| 00 | Sistem desain | semua (acuan) | desktop | `00-sistem-desain-desktop.html` | `00-sistem-desain-desktop.png` ✓ |
| 01 | Halaman depan | publik | mobile | `01-halaman-depan-mobile.html` | `01-halaman-depan-mobile.png` |
| 01 | Halaman depan | publik | desktop | `01-halaman-depan-desktop.html` | `01-halaman-depan-desktop.png` |
| 02 | Masuk | publik | mobile | `02-masuk-mobile.html` | `02-masuk-mobile.png` |
| 02 | Masuk | publik | desktop | `02-masuk-desktop.html` | `02-masuk-desktop.png` |
| 03 | Beranda petani | petani | mobile | `03-beranda-petani-mobile.html` | `03-beranda-petani-mobile.png` |
| 03 | Beranda petani | petani | desktop | `03-beranda-petani-desktop.html` | `03-beranda-petani-desktop.png` |
| 04 | Beranda petani, hidroponik | petani | mobile | `04-beranda-petani-hidroponik-mobile.html` | `04-beranda-petani-hidroponik-mobile.png` |
| 04 | Beranda petani, hidroponik | petani | desktop | `04-beranda-petani-hidroponik-desktop.html` | `04-beranda-petani-hidroponik-desktop.png` |
| 05 | Beranda, belum ada siklus | petani | mobile | `05-beranda-petani-kosong-mobile.html` | `05-beranda-petani-kosong-mobile.png` |
| 06 | Beranda, offline dan tugas terlambat | petani | mobile | `06-beranda-offline-tugas-terlambat-mobile.html` | `06-beranda-offline-tugas-terlambat-mobile.png` |
| 07 | Beranda, pengingat diblokir | petani | mobile | `07-beranda-pengingat-diblokir-mobile.html` | `07-beranda-pengingat-diblokir-mobile.png` |
| 08 | Belajar, hidroponik | petani | mobile | `08-belajar-hidroponik-mobile.html` | `08-belajar-hidroponik-mobile.png` |
| 08 | Belajar, hidroponik | petani | desktop | `08-belajar-hidroponik-desktop.html` | `08-belajar-hidroponik-desktop.png` |
| 09 | Belajar, bedengan | petani | mobile | `09-belajar-bedengan-mobile.html` | `09-belajar-bedengan-mobile.png` |
| 09 | Belajar, bedengan | petani | desktop | `09-belajar-bedengan-desktop.html` | `09-belajar-bedengan-desktop.png` |
| 10 | Hitung 1: Mau tanam apa? | petani | mobile | `10-hitung-pilih-tanaman-mobile.html` | `10-hitung-pilih-tanaman-mobile.png` |
| 10 | Hitung 1: Mau tanam apa? | petani | desktop | `10-hitung-pilih-tanaman-desktop.html` | `10-hitung-pilih-tanaman-desktop.png` |
| 11 | Hitung: segera hadir | petani | mobile | `11-hitung-segera-hadir-mobile.html` | `11-hitung-segera-hadir-mobile.png` |
| 11 | Hitung: segera hadir | petani | desktop | `11-hitung-segera-hadir-desktop.html` | `11-hitung-segera-hadir-desktop.png` |
| 12 | Hitung: segera hadir, sudah diminta | petani | mobile | `12-hitung-segera-hadir-sudah-diminta-mobile.html` | `12-hitung-segera-hadir-sudah-diminta-mobile.png` |
| 12 | Hitung: segera hadir, sudah diminta | petani | desktop | `12-hitung-segera-hadir-sudah-diminta-desktop.html` | `12-hitung-segera-hadir-sudah-diminta-desktop.png` |
| 13 | Hitung 2: cara tanam sawi bedengan | petani | mobile | `13-hitung-cara-tanam-sawi-bedengan-mobile.html` | `13-hitung-cara-tanam-sawi-bedengan-mobile.png` |
| 13 | Hitung 2: cara tanam sawi bedengan | petani | desktop | `13-hitung-cara-tanam-sawi-bedengan-desktop.html` | `13-hitung-cara-tanam-sawi-bedengan-desktop.png` |
| 14 | Hitung 2: cara tanam sawi hidroponik | petani | mobile | `14-hitung-cara-tanam-sawi-hidroponik-mobile.html` | `14-hitung-cara-tanam-sawi-hidroponik-mobile.png` |
| 14 | Hitung 2: cara tanam sawi hidroponik | petani | desktop | `14-hitung-cara-tanam-sawi-hidroponik-desktop.html` | `14-hitung-cara-tanam-sawi-hidroponik-desktop.png` |
| 15 | Hitung 2: cara tanam padi sawah | petani | mobile | `15-hitung-cara-tanam-padi-sawah-mobile.html` | `15-hitung-cara-tanam-padi-sawah-mobile.png` |
| 15 | Hitung 2: cara tanam padi sawah | petani | desktop | `15-hitung-cara-tanam-padi-sawah-desktop.html` | `15-hitung-cara-tanam-padi-sawah-desktop.png` |
| 16 | Hitung 3: modal sawi bedengan | petani | mobile | `16-hitung-modal-sawi-bedengan-mobile.html` | `16-hitung-modal-sawi-bedengan-mobile.png` |
| 16 | Hitung 3: modal sawi bedengan | petani | desktop | `16-hitung-modal-sawi-bedengan-desktop.html` | `16-hitung-modal-sawi-bedengan-desktop.png` |
| 17 | Hitung 3: pilih merek NPK | petani | mobile | `17-hitung-modal-pilih-merek-npk-mobile.html` | `17-hitung-modal-pilih-merek-npk-mobile.png` |
| 17 | Hitung 3: pilih merek NPK | petani | desktop | `17-hitung-modal-pilih-merek-npk-desktop.html` | `17-hitung-modal-pilih-merek-npk-desktop.png` |
| 18 | Hitung 3: modal sawi hidroponik | petani | mobile | `18-hitung-modal-sawi-hidroponik-mobile.html` | `18-hitung-modal-sawi-hidroponik-mobile.png` |
| 18 | Hitung 3: modal sawi hidroponik | petani | desktop | `18-hitung-modal-sawi-hidroponik-desktop.html` | `18-hitung-modal-sawi-hidroponik-desktop.png` |
| 19 | Hitung 3: modal padi sawah | petani | mobile | `19-hitung-modal-padi-sawah-mobile.html` | `19-hitung-modal-padi-sawah-mobile.png` |
| 19 | Hitung 3: modal padi sawah | petani | desktop | `19-hitung-modal-padi-sawah-desktop.html` | `19-hitung-modal-padi-sawah-desktop.png` |
| 20 | Jadwal sawi bedengan | petani | mobile | `20-jadwal-sawi-bedengan-mobile.html` | `20-jadwal-sawi-bedengan-mobile.png` |
| 20 | Jadwal sawi bedengan | petani | desktop | `20-jadwal-sawi-bedengan-desktop.html` | `20-jadwal-sawi-bedengan-desktop.png` |
| 21 | Jadwal sawi hidroponik | petani | mobile | `21-jadwal-sawi-hidroponik-mobile.html` | `21-jadwal-sawi-hidroponik-mobile.png` |
| 21 | Jadwal sawi hidroponik | petani | desktop | `21-jadwal-sawi-hidroponik-desktop.html` | `21-jadwal-sawi-hidroponik-desktop.png` |
| 22 | Detail tugas | petani | mobile | `22-detail-tugas-mobile.html` | `22-detail-tugas-mobile.png` |
| 23 | Cek pH dan PPM, normal | petani | mobile | `23-cek-ph-ppm-normal-mobile.html` | `23-cek-ph-ppm-normal-mobile.png` |
| 23 | Cek pH dan PPM, normal | petani | desktop | `23-cek-ph-ppm-normal-desktop.html` | `23-cek-ph-ppm-normal-desktop.png` |
| 24 | Cek pH, terlalu tinggi | petani | mobile | `24-cek-ph-terlalu-tinggi-mobile.html` | `24-cek-ph-terlalu-tinggi-mobile.png` |
| 24 | Cek pH, terlalu tinggi | petani | desktop | `24-cek-ph-terlalu-tinggi-desktop.html` | `24-cek-ph-terlalu-tinggi-desktop.png` |
| 25 | Cek PPM, terlalu rendah | petani | mobile | `25-cek-ppm-terlalu-rendah-mobile.html` | `25-cek-ppm-terlalu-rendah-mobile.png` |
| 25 | Cek PPM, terlalu rendah | petani | desktop | `25-cek-ppm-terlalu-rendah-desktop.html` | `25-cek-ppm-terlalu-rendah-desktop.png` |
| 26 | Pengingat per siklus | petani | mobile | `26-pengingat-per-siklus-mobile.html` | `26-pengingat-per-siklus-mobile.png` |
| 26 | Pengingat per siklus | petani | desktop | `26-pengingat-per-siklus-desktop.html` | `26-pengingat-per-siklus-desktop.png` |
| 27 | Detail siklus: modal | petani | mobile | `27-detail-siklus-modal-mobile.html` | `27-detail-siklus-modal-mobile.png` |
| 28 | Detail siklus: jurnal | petani | mobile | `28-detail-siklus-jurnal-mobile.html` | `28-detail-siklus-jurnal-mobile.png` |
| 29 | Pesanan di sekitar | petani | mobile | `29-pesanan-di-sekitar-mobile.html` | `29-pesanan-di-sekitar-mobile.png` |
| 29 | Pesanan di sekitar | petani | desktop | `29-pesanan-di-sekitar-desktop.html` | `29-pesanan-di-sekitar-desktop.png` |
| 30 | Pesanan, belum ada | petani | mobile | `30-pesanan-kosong-mobile.html` | `30-pesanan-kosong-mobile.png` |
| 31 | Detail pesanan | petani | mobile | `31-detail-pesanan-mobile.html` | `31-detail-pesanan-mobile.png` |
| 32 | Kesepakatan | petani | mobile | `32-kesepakatan-mobile.html` | `32-kesepakatan-mobile.png` |
| 33 | Kiriman saya | petani | mobile | `33-kiriman-saya-mobile.html` | `33-kiriman-saya-mobile.png` |
| 34 | Profil petani | petani | mobile | `34-profil-petani-mobile.html` | `34-profil-petani-mobile.png` |
| 34 | Profil petani | petani | desktop | `34-profil-petani-desktop.html` | `34-profil-petani-desktop.png` |
| 35 | Ubah profil | petani | mobile | `35-ubah-profil-mobile.html` | `35-ubah-profil-mobile.png` |
| 35 | Ubah profil | petani | desktop | `35-ubah-profil-desktop.html` | `35-ubah-profil-desktop.png` |
| 36 | Dasbor pesanan aktif | pembeli | desktop | `36-dasbor-pesanan-pembeli-desktop.html` | `36-dasbor-pesanan-pembeli-desktop.png` |
| 37 | Buat pesanan | pembeli | desktop | `37-buat-pesanan-pembeli-desktop.html` | `37-buat-pesanan-pembeli-desktop.png` |
| 38 | Konfirmasi kiriman | pembeli | desktop | `38-konfirmasi-kiriman-pembeli-desktop.html` | `38-konfirmasi-kiriman-pembeli-desktop.png` |

Ringkasan: 39 halaman dalam 64 file papan. Sebanyak 25 halaman punya versi mobile dan desktop, 10 halaman hanya mobile (termasuk keadaan kosong, offline, dan pengingat diblokir), dan 4 hanya desktop (papan 00 dan 3 halaman pembeli).

## Halaman turunan (tanpa desain)

Halaman ini belum punya papan desain. Halaman dibuat dari pola desain yang ada (keputusan D-07) dan diberi nomor lanjutan untuk nama tangkapan layarnya.

| Nomor | Halaman | Peran | Tugas | Tangkapan aplikasi |
| --- | --- | --- | --- | --- |
| 39 | Pilih peran dan desa | publik | T4.34 | `39-pilih-peran-dan-desa-mobile.png`, `…-desktop.png` |
| 40 | Lahan saya | petani | T4.36a | `40-lahan-saya-mobile.png`, `…-desktop.png` |
| 41 | Pilih tanggal tanam | petani | T4.08 | `41-pilih-tanggal-tanam-mobile.png`, `…-desktop.png` |
| 42 | Pemutar modul belajar | petani | T4.31 | `42-pemutar-modul-mobile.png`, `…-desktop.png` |
| 43 | Pilih akun demo (hanya mode pengembangan) | publik | T4.01 | `43-pilih-akun-demo-mobile.png`, `…-desktop.png` |

Halaman turunan lain (panel mentor dan admin, halaman statis, rating, gagal panen) diberi nomor berikutnya saat tugasnya dikerjakan. Panel mentor dan admin hanya punya versi desktop.

Tangkapan komponen dan kerangka halaman memakai nomor 00: `00-sistem-desain-*.png` untuk halaman `/komponen`, `00-kerangka-petani-*.png` dan `00-kerangka-pembeli-*.png`, serta `00-sidebar-teks-lengkap-*.png` (teks akun yang terpotong ditampilkan lengkap, D-17). Tangkapan papan desain asli untuk perbandingan disimpan di [`docs/tangkapan/desain/`](../docs/tangkapan/desain/) dengan nama file papan yang sama.
