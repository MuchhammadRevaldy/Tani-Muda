# Cek komponen terhadap papan 00

Perbandingan halaman `/komponen` dengan papan sistem desain (`design/extracted/pages/00-sistem-desain-desktop.html`), dilakukan 5 Oktober 2026 dengan tangkapan layar berdampingan:

- Aplikasi: `docs/tangkapan/aplikasi/00-sistem-desain-desktop.png` (1440px), `docs/tangkapan/aplikasi/00-sistem-desain-mobile.png` (390px)
- Desain: `docs/tangkapan/desain/00-sistem-desain-desktop.png` (1440px, dari bundle asli)

Status: **sama** = warna, ukuran, jarak, dan teks sesuai papan; **beda** = ada selisih yang disengaja (alasan dicatat).

| Komponen | Status | Catatan |
| --- | --- | --- |
| Warna (17 token) | sama | Hex dibaca dari `tailwind.config.ts`; susunan kartu swatch sama (6 kolom desktop, 2 kolom HP) |
| Huruf | sama | Plus Jakarta Sans lokal (latin + latin-ext), 6 peran teks |
| Tombol utama/sekunder/ikon | sama | Ditambah contoh keadaan nonaktif (tidak ada di papan) |
| KolomIsian (bantuan, galat, akhiran) | sama | |
| InputRupiah | sama | Titik ribuan, terbilang, kursor dijaga; diuji |
| Kartu (biasa, kaki uang, tanpaIsi) | sama | |
| BarisTugas | sama | Versi halaman (papan 20 mobile): ikon tipe, frekuensi, hasil ukur, "Isi angka". Kamera disembunyikan setelah selesai seperti halaman desain |
| ChipStatus (7 status) | sama | |
| LabelKecil | sama | Gaya diambil dari papan 10 mobile, 13 mobile dan 16 mobile; ditambah nada `contoh` untuk label "CONTOH, belum divalidasi penyuluh" (D-10) |
| Banner (peringatan, bahaya, offline) | sama | Ditambah contoh offline dengan jumlah tertunda |
| Penggaris Umur Tanam (hp, lebar) | sama | Tata letak pin memakai fungsi murni yang diuji setara dengan algoritma desain |
| Ikon (16) | sama | Ditambah ikon tipe tugas (kalender, putar ulang, pengukur) dari halaman desain, serta `silang` dan `panah-naik-turun` yang digambar dengan gaya `design/icons/` (D-17) |
| Ilustrasi metode dan komoditas | sama | Dari `design/extracted/ikon-sebaris/`, warna lewat token |
| Navigasi bawah | sama | Tautan (`NavLink`), `aria-current` |
| Sidebar + menu akun | sama | Dari papan 03 desktop dan 10 desktop. Nama dan keterangan akun yang terlalu panjang dipotong dengan elipsis; teks lengkap muncul saat disentuh atau diarahkan kursor (D-17) |
| Pola pilihan (pil, segmen, kotak, kartu pilihan, saklar) | sama | Dari papan 10 mobile, 13 mobile, 16 mobile dan 26 mobile |
| Dialog / lembar bawah | beda | Ditambah tombol tutup "silang" 48px (ikon baru bergaya sama) supaya dialog bisa ditutup tanpa memilih aksi; tidak ada di desain |
| KotakOtp, Stepper, DaftarLangkah, DaftarSyarat, Avatar, FaqLipat | sama | Berurutan dari papan 02 mobile, 10 mobile, 22, 32, 36, dan 01 mobile. Avatar inisial memakai aturan sendiri (dua huruf pertama) karena inisial desain tidak konsisten |

Pemeriksaan lain:

- [x] Tidak ada hex, warna bawaan Tailwind, atau ukuran sembarang di `frontend/src/` (`npm run lint`).
- [x] Fokus keyboard terlihat (cincin `shadow-fokus`) di semua kontrol.
- [x] 390px tanpa gulir horizontal (diperiksa skrip tangkapan layar).
