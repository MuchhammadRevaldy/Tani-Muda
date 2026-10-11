# Kode wilayah resmi

Sumber kode wilayah untuk seeder dan untuk tes data contoh (D-54). Tes ini menggantikan pencocokan manual di `docs/cek-wilayah.md`.

## `wilayah.sql`

| | |
| --- | --- |
| Sumber | `db/wilayah.sql` dari <https://github.com/cahyadsn/wilayah> |
| Commit | [`d68e8d5516f969d1905d0b2940f20034becb0db7`](https://github.com/cahyadsn/wilayah/blob/d68e8d5516f969d1905d0b2940f20034becb0db7/db/wilayah.sql) (13 Februari 2026, "perbaikan nama desa Kwawor Kecil Mata Ata"), commit terakhir yang mengubah berkas ini saat diunduh |
| Diunduh | 12 Oktober 2026 |
| SHA-256 | `c4c3396d9380d4edee072af1d9dff83573b574d7cd00a6562cf82e200e954031` |
| Lisensi | MIT, (c) Cahya DSN; teks lengkap di [`LICENSE`](LICENSE) |
| Acuan | Kepmendagri No. 300.2.2-2138 Tahun 2025 (ditulis di kepala berkas dan README sumber) |
| Isi | 91.599 kode: 38 provinsi, 514 kabupaten/kota, 7.285 kecamatan, 83.762 desa/kelurahan; format bertitik `PP.KK.CC.DDDD` sama dengan proyek |

Berkas disimpan apa adanya (akhir baris CRLF dijaga `.gitattributes`), jadi checksum di atas bisa dicek ulang. Seeder hanya **membaca** tupel `('kode','nama')` dengan pola teks; isi SQL-nya tidak pernah dijalankan.

**Risiko: perubahan Kepmendagri 300.2.2-2430 Tahun 2025 belum tentu tercakup.** Kepala berkas, README sumber, dan riwayat commit hanya menyebut 2138; tidak ada yang menyebut 2430. Kode desa pilot yang dipakai data contoh sudah dicocokkan pemilik produk (tanggapan D-53), tetapi desa lain bisa berbeda dengan keputusan perubahan itu. Rincian di `docs/cek-wilayah.md`.

## `titik-tengah.json`

Titik tengah **perkiraan** untuk 16 desa Kecamatan Lembang (pilot) dan kelurahan Kota Bandung yang dipakai data contoh. Dataset Kemendagri tidak memuat koordinat. Sumber tiap titik ditulis per baris (lihat kolom `keterangan` di berkasnya); empat desa bertanda `perkiraan_kasar` belum ditemukan di OpenStreetMap dan perlu dicek di peta. Desa tanpa titik belum tersedia di pilot (D-56).

## Memperbarui

1. Unduh `db/wilayah.sql` dari commit terbaru, ganti berkas ini, dan perbarui tabel di atas (commit, tanggal, SHA-256, acuan, jumlah).
2. Jalankan tes frontend (`npm test`, tes data contoh) dan backend (`composer uji`, tes seeder wilayah). Tes gagal bila kode atau nama desa di data contoh tidak ada lagi di dataset.
3. Jalankan ulang seeder wilayah (`php artisan db:seed --class=WilayahSeeder`); seeder memakai *upsert*, jadi baris yang sudah dirujuk tidak dihapus.
