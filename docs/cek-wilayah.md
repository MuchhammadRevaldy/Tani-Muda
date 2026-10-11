# Pencocokan kode wilayah dengan data Kemendagri

**Selesai 12 Oktober 2026 (D-54).** Pencocokan manual di dokumen ini sudah digantikan tes otomatis. Dokumen ini mencatat hasil pencocokan pemilik produk dan risiko yang tersisa.

## Sumber resmi

Dataset `shared/wilayah/wilayah.sql` dari [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) (MIT), commit `d68e8d5`, diunduh 12 Oktober 2026. Rincian (checksum, lisensi, cara memperbarui) di [`shared/wilayah/README.md`](../shared/wilayah/README.md).

Tes yang menggantikan pencocokan manual (`frontend/src/api/tiruan/data/data.test.ts`, blok "wilayah data contoh cocok dengan dataset resmi"):

- setiap wilayah di data contoh ada di dataset, dengan nama desa, kecamatan, kabupaten/kota, dan provinsi yang sama;
- setiap `wilayah_id` yang dirujuk data contoh (pengguna, lahan, pesanan, referensi) ada di dataset;
- titik tengah data contoh sama dengan `shared/wilayah/titik-tengah.json`, dan ke-16 desa Kecamatan Lembang punya titik.

## Risiko: perubahan Kepmendagri 300.2.2-2430 Tahun 2025

Kepala berkas dataset, README sumbernya, dan riwayat commit hanya menyebut **Kepmendagri 300.2.2-2138 Tahun 2025**. Tidak ada yang menyebut keputusan perubahan **300.2.2-2430 Tahun 2025**, jadi belum bisa dipastikan perubahan itu sudah tercakup.

- Desa yang dipakai data contoh sudah dicocokkan pemilik produk, jadi aman.
- Desa lain di seluruh Indonesia mungkin berbeda dengan keputusan perubahan itu (kode baru, pemekaran, atau ganti nama). Dampaknya baru terasa bila pilot meluas ke luar Lembang.
- Sebelum pilot meluas, cek apakah sumber sudah memperbarui berkasnya, lalu ikuti langkah "Memperbarui" di `shared/wilayah/README.md`.

## Hasil pencocokan pemilik produk (tanggapan D-53)

| Desa/kelurahan | Kode lama | Kode resmi | Keterangan |
| --- | --- | --- | --- |
| Lembang | `32.17.01.2003` | `32.17.01.2003` | sudah benar |
| Sukajaya | `32.17.01.2013` | `32.17.01.2013` | sudah benar |
| Gudangkahuripan | `32.17.01.2001` | `32.17.01.2007` | `2001` adalah Pagerwangi |
| Cikahuripan | `32.17.01.2002` | `32.17.01.2005` | tertukar dengan Kayuambon |
| Jayagiri | `32.17.01.2004` | `32.17.01.2008` | `2004` adalah Cikidang |
| Kayuambon | `32.17.01.2005` | `32.17.01.2002` | tertukar dengan Cikahuripan |
| Ledeng | `32.73.03.1004` | `32.73.08.1003` | Kec. Cidadap `32.73.08` (`32.73.03` adalah Babakan Ciparay) |
| Batununggal | `32.73.10.1001` | `32.73.21.1001` | Kec. Bandung Kidul `32.73.21` (`32.73.10` adalah Astanaanyar) |

Kode provinsi `32` (Jawa Barat), kabupaten `32.17` (Kabupaten Bandung Barat), kecamatan `32.17.01` (Lembang), dan kota `32.73` (Kota Bandung) sudah benar. Karena ada pasangan yang tertukar, kode diganti lewat satu pemetaan sekaligus, bukan cari-ganti berurutan. Versi data contoh naik ke 10.

## Titik tengah

Dataset Kemendagri tidak memuat koordinat. Titik tengah perkiraan untuk 16 desa Kecamatan Lembang, Ledeng, dan Batununggal ada di `shared/wilayah/titik-tengah.json`, dengan sumber per titik dari OpenStreetMap: kantor desa, fitur bernama desa, atau batas kelurahan.

- **Perlu dicek di peta:** empat desa yang tidak ditemukan di OpenStreetMap dan hanya diperkirakan kasar dari letak desa tetangga, yaitu Kayuambon, Cikidang, Mekarwangi, dan Wangunsari. Kayuambon dipakai data contoh (Sari Wulandari, Warung Nasi Bu Imas).
- **Diperbaiki:** titik lama Sukajaya (±4,9 km) dan Cikahuripan (±3,5 km) terlalu ke timur laut; keduanya ternyata di barat pusat Lembang.
- **Desa di luar daftar** tidak punya titik dan belum tersedia di pilot (D-56).
