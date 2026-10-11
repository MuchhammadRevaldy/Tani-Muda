# Pencocokan kode wilayah dengan data Kemendagri

Disiapkan 11 Oktober 2026 untuk gelombang 5.2. **Seeder Laravel (T5.08) belum ditulis sampai daftar ini dicocokkan pemilik produk** (D-27, D-36).

Semua kode di data contoh memakai format Kemendagri `PP.KK.CC.DDDD`: provinsi, kabupaten/kota, kecamatan, desa (`2xxx`) atau kelurahan (`1xxx`). Kode ini **belum pernah dicocokkan dengan data resmi**. Dua kode bertanda "sudah dicek" di T3 hanya dicek ke situs ensiklopedia, yang menurut D-36 hanya boleh dipakai untuk demo. Karena itu semua baris di bawah perlu dicocokkan.

Lokasi pilot tetap **Kecamatan Lembang, Kabupaten Bandung Barat** (tanggapan D-51). Sumber pencocokan yang disarankan: lampiran Keputusan Menteri Dalam Negeri terbaru tentang pemberian dan pemutakhiran kode serta data wilayah administrasi pemerintahan.

## Cara mengisi

Untuk setiap baris, isi kolom **Kode resmi** dan **Nama resmi** dari data Kemendagri:

- Bila sama dengan kolom sekarang, tulis `sama`.
- Bila berbeda, tulis kode dan nama resminya. Data contoh (`frontend/src/api/tiruan/data/pembuat-data.ts`) dan seeder akan memakai nilai itu.
- Bila desa/kelurahan itu tidak ada, tulis `tidak ada` dan sebutkan penggantinya bila ada.

Koordinat titik tengah adalah perkiraan untuk menghitung jarak (radius 10 km). Koordinat tidak ada di data Kemendagri, jadi cukup diperiksa kasar di peta, dan boleh dibiarkan.

## 1. Kabupaten/kota dan kecamatan

| Kode sekarang | Tingkat | Nama sekarang | Kode resmi | Nama resmi |
| --- | --- | --- | --- | --- |
| `32` | provinsi | Jawa Barat | | |
| `32.17` | kabupaten | Kabupaten Bandung Barat | | |
| `32.17.01` | kecamatan | Lembang | | |
| `32.73` | kota | Kota Bandung | | |
| `32.73.03` | kecamatan | Cidadap | | |
| `32.73.10` | kecamatan | Bandung Kidul | | |

## 2. Desa dan kelurahan

| No | Kode sekarang | Desa/kelurahan | Kecamatan | Titik tengah (lintang, bujur) | Status sekarang | Dipakai oleh data contoh | Kode resmi | Nama resmi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `32.17.01.2003` | Lembang | Lembang | -6,8117; 107,6175 | dicek ke ensiklopedia | Petani Arif Setiawan (2 lahan: Kebun belakang rumah, Rak hidroponik teras), mentor Rahmat Hidayat, admin, permintaan resep, harga dan promo contoh | | |
| 2 | `32.17.01.2013` | Sukajaya | Lembang | -6,793; 107,639 | dicek ke ensiklopedia | Petani Dewi Lestari (Sawah Sukajaya), pembeli Koperasi Desa Sumber Rejeki (pesanan gabah), permintaan resep, harga contoh | | |
| 3 | `32.17.01.2001` | Gudangkahuripan | Lembang | -6,817; 107,626 | belum dicek | Petani Yogi Pratama, pembeli Kedai Sayur Pagi (belum terverifikasi), permintaan resep, harga dan promo contoh | | |
| 4 | `32.17.01.2002` | Cikahuripan | Lembang | -6,804; 107,633 | belum dicek | Pembeli Katering Bu Ratna (pesanan sawi, alur utama demo), harga contoh | | |
| 5 | `32.17.01.2004` | Jayagiri | Lembang | -6,826; 107,608 | belum dicek | Petani Budi Santoso (Kebun Jayagiri), harga dan promo contoh | | |
| 6 | `32.17.01.2005` | Kayuambon | Lembang | -6,82; 107,621 | belum dicek | Petani Sari Wulandari, pembeli Warung Nasi Bu Imas (pesanan bayam dan sawi), harga dan promo contoh | | |
| 7 | `32.73.03.1004` | Ledeng | Cidadap (Kota Bandung) | -6,861; 107,597 | belum dicek | Pembeli Kafe Daun Pagi (pesanan bayam, ±5,9 km dari Desa Lembang), harga contoh | | |
| 8 | `32.73.10.1001` | Batununggal | Bandung Kidul (Kota Bandung) | -6,945; 107,628 | belum dicek | Pembeli Katering Sehat Lestari (pesanan kangkung, ±14,9 km dari Desa Lembang), harga contoh | | |

Baris 7 dan 8 berada di Kota Bandung, di luar Kecamatan Lembang, sebagai contoh pembeli dari kota. Dengan titik tengah sekarang, Ledeng masih dalam radius 10 km dari Desa Lembang dan Batununggal di luarnya. Bila kodenya diganti, letaknya sebaiknya tetap serupa.

## 3. Setelah dicocokkan

1. Nilai resmi dimasukkan ke `pembuat-data.ts`, lalu `npm run data-contoh` menulis ulang JSON. Tes data contoh memastikan setiap `wilayah_id` ada di daftar wilayah.
2. Semua baris diberi `kode_terverifikasi: true`. Tes baru menolak kode yang belum terverifikasi masuk seeder produksi.
3. Data contoh dipindah ke `shared/data-contoh/`, dan seeder Laravel (T5.08) membaca berkas yang sama.
