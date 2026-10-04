# Cek komponen terhadap papan 00

Perbandingan halaman `/komponen` dengan papan sistem desain (`design/extracted/pages/00.html`), dilakukan 5 Oktober 2026 dengan tangkapan layar berdampingan:

- Aplikasi: `docs/tangkapan/T1.17/desktop.png` (1440px), `docs/tangkapan/T1.17/mobile.png` (390px)
- Desain: `docs/tangkapan/T1.17/desain-papan00.png` (1440px, dari bundle asli)

Status: **sama** = warna, ukuran, jarak, dan teks sesuai papan; **beda** = ada selisih yang disengaja (alasan dicatat).

| Komponen | Status | Catatan |
| --- | --- | --- |
| Warna (17 token) | sama | Hex dibaca dari `tailwind.config.ts`; susunan kartu swatch sama (6 kolom desktop, 2 kolom HP) |
| Huruf | sama | Plus Jakarta Sans lokal (latin + latin-ext), 6 peran teks |
| Tombol utama/sekunder/ikon | sama | Ditambah contoh keadaan nonaktif (tidak ada di papan) |
| KolomIsian (bantuan, galat, akhiran) | sama | |
| InputRupiah | sama | Titik ribuan, terbilang, kursor dijaga; diuji |
| Kartu (biasa, kaki uang, tanpaIsi) | sama | |
| BarisTugas | sama | Versi halaman (papan 29): ikon tipe, frekuensi, hasil ukur, "Isi angka". Kamera disembunyikan setelah selesai seperti halaman desain |
| ChipStatus (7 status) | sama | |
| LabelKecil | sama | Gaya diambil dari papan 09, 15, 21; ditambah nada `contoh` untuk label "CONTOH, belum divalidasi penyuluh" (D-10) |
| Banner (peringatan, bahaya, offline) | sama | Ditambah contoh offline dengan jumlah tertunda |
| Penggaris Umur Tanam (hp, lebar) | sama | Tata letak pin memakai fungsi murni yang diuji setara dengan algoritma desain |
| Ikon (16) | sama | Ditambah ikon tipe tugas (kalender, putar ulang, pengukur) dari halaman desain |
| Ilustrasi metode dan komoditas | sama | Dari `design/extracted/icons-inline/`, warna lewat token |
| Navigasi bawah | sama | Tautan (`NavLink`), `aria-current` |
| Sidebar + menu akun | sama | Dari papan desktop (06, 10). Teks "Petani · Lembang" terbungkus dua baris di lebar 256px |
| Pola pilihan (pil, segmen, kotak, kartu pilihan, saklar) | sama | Dari papan 09, 15, 21, 39 |
| Dialog / lembar bawah | beda | Ditambah tombol tutup "silang" 48px (ikon baru bergaya sama) supaya dialog bisa ditutup tanpa memilih aksi; tidak ada di desain |
| KotakOtp, Stepper, DaftarLangkah, DaftarSyarat, Avatar, FaqLipat | sama | Dari papan 03, 09, 53, 55, 61, 01. Avatar inisial memakai aturan sendiri (dua huruf pertama) karena inisial desain tidak konsisten |

Pemeriksaan lain:

- [x] Tidak ada hex, warna bawaan Tailwind, atau ukuran sembarang di `src/` (`npm run lint`).
- [x] Fokus keyboard terlihat (cincin `shadow-fokus`) di semua kontrol.
- [x] 390px tanpa gulir horizontal (diperiksa skrip tangkapan layar).
