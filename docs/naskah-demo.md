# Naskah demo Tani Muda (7 menit)

Pembaca: tim yang memperagakan Tani Muda di depan juri. Naskah ini diuji jalan dengan skrip peramban pada data demo yang baru diatur ulang (9 Oktober 2026): pada pukul 09.00 WIB ke-14 langkah berhasil; pada pukul 14.00 langkah konfirmasi kiriman gagal, sesuai batas jam di bawah. Nama tombol di bawah sama dengan yang tampil di aplikasi.

**Jam demo: 07.00–13.00 WIB.** Data demo menjadwalkan satu kiriman ke Warung Nasi Bu Imas dikirim pukul 07.00 hari ini dengan batas periksa 6 jam (D-01). Setelah pukul 13.00 kiriman itu otomatis dianggap diterima, sehingga langkah 8 (konfirmasi kiriman) tidak bisa diperagakan. Bila demo terjadwal di luar jam itu, pakai alur cadangan di bagian akhir.

Layar: laptop 1440 px (tampilan desktop). Satu jendela peramban, zoom 100%.

## Alur

| Menit | Langkah | Akun demo | Halaman dan yang ditekan | Poin untuk juri |
| --- | --- | --- | --- | --- |
| 0:00–0:40 | 1. Halaman depan | belum masuk | Buka `/`. Tunjuk kartu "Contoh perhitungan" sawi 100 m² (modal Rp430.000, untung Rp320.000), lalu gulir ke tiga pilar dan lima langkah "Pembeli pasti dulu, baru menanam". | Semua angka di halaman depan dihitung dari resep yang sama dengan kalkulator, bukan ditulis tangan. |
| 0:40–1:00 | 2. Masuk sebagai petani | Arif Setiawan (petani) | Tekan **Mulai sebagai petani**, tunjukkan halaman Masuk dengan nomor HP dan kode SMS. Lalu buka `/akun-demo` dan tekan **Masuk sebagai Arif**. | Masuk hanya dengan nomor HP dan kode SMS, tanpa kata sandi; di demo dipakai pemilih akun supaya cepat. |
| 1:00–1:30 | 3. Beranda | Arif | Tunjuk penggaris umur tanam (hari ke-13, pin Pupuk 2 "besok"), banner "Besok", dan "Tugas hari ini". | Petani langsung tahu hari ke berapa dan apa yang harus dikerjakan hari ini. |
| 1:30–2:50 | 4. Rencana dan modal | Arif | **Buat siklus baru** → kartu **Sawi hijau** → **Lanjut pilih metode** → **Bedengan** (sudah terpilih), isi *Luas lahan* `20` m² → **Lanjut hitung modal**. Tunjuk total modal, titik impas, dan "Kalau panen jelek". Tekan **Simpan rencana** → pilih **Kebun belakang rumah** → **Hari ini** → **Simpan dan buat jadwal**. | Sebelum menanam, petani tahu modal dan berapa kg harus terjual supaya tidak rugi; jadwal tugas dibuat otomatis dari resep. |
| 2:50–3:40 | 5. Jadwal dan pengukuran | Arif | Di Beranda tekan **Lihat jadwal, modal, dan jurnal**. Lalu pilih pil **Sawi hijau · Rak hidroponik teras**, pada tugas "Cek pH dan PPM" tekan **Isi angka**, isi *pH larutan* `6,2` dan *PPM (kepekatan nutrisi)* `600`. Tunjuk saran "PPM terlalu rendah", tekan **Simpan hasil**. | Angka ukur langsung diterjemahkan menjadi saran, dan tugas "Ukur ulang" besok dibuat sendiri. |
| 3:40–4:40 | 6. Mengambil pesanan | Arif | Menu **Pesanan** (berlencana). Buka pesanan **Kafe Daun Pagi** (bayam). Tunjuk "Lahanmu cukup" dan saran jumlah, tekan **Ambil … kg …**. Di Kesepakatan centang pernyataan, tekan **Setuju**. | Petani hanya mengambil sebanyak kemampuan lahannya; uang muka pembeli sudah ditahan sebelum ia menanam. |
| 4:40–5:00 | 7. Pindah ke pembeli | Bu Imas (Warung Nasi Bu Imas) | Buka `/akun-demo`, tekan **Masuk sebagai Imas**. Tunjuk banner kiriman tiba dan penggaris kebun pemenuh (hanya pin Panen). | Pembeli memantau umur tanam di kebun petani tanpa melihat alamat atau titik lahannya. |
| 5:00–5:50 | 8. Membuat pesanan dan membayar uang muka | Imas | Tekan **Buat pesanan** → **Sawi hijau**, isi *Jumlah per kiriman* `10` dan *Harga per kg* `5000` → **Lanjut bayar Rp…**. Di halaman bayar pilih **Berhasil**, tekan **Bayar Rp…**. | Uang muka 20% ditahan Tani Muda, belum ke petani; di uji coba pembayaran disimulasikan, tanpa uang sungguhan. |
| 5:50–6:40 | 9. Konfirmasi kiriman | Imas | Kembali ke dasbor, pada banner kiriman tiba tekan **Periksa kiriman**. Tunjuk dua foto dari petani, pilih **Terima semua**, tekan **Konfirmasi terima … kg**, beri **5 bintang**. | Dana cair ke petani setelah pembeli memeriksa; bagian yang tidak sesuai boleh ditolak dengan foto. |
| 6:40–7:00 | 10. Penutup | Imas | Tunjuk "Pesanan aktif" dan menu Pembayaran. | Dari belajar, menghitung, merawat, sampai menjual: satu aplikasi untuk petani muda. |

Bila waktu tersisa (cadangan, bukan bagian 7 menit): masuk sebagai **Rahmat** (penyuluh) dan tunjukkan editor resep; setiap perubahan menjadi versi baru dan siklus berjalan tidak berubah.

## Daftar periksa sebelum demo

**Sehari sebelumnya**

- [ ] `git pull` tidak perlu (demo dari laptop); pastikan cabang yang didemokan sudah di-commit.
- [ ] `npm install` sekali bila ada perubahan paket.
- [ ] Jalankan naskah ini sekali dari awal sampai akhir dengan jam yang sama dengan jadwal demo.

**30 menit sebelum demo**

1. Mulai ulang laptop (membebaskan memori; laptop hanya punya sekitar 2 GB RAM bebas, `arsitektur-backend.md` bagian 2b).
2. Tutup aplikasi yang tidak dipakai: IDE (VS Code dan jendela kedua), Chrome lain selain jendela demo, aplikasi chat, layanan basis data yang tidak dipakai (mis. Oracle, MariaDB bila belum Tahap 6), dan penyinkron berkas.
3. Jalankan server demo di terminal:

   ```bash
   cd "Tani Muda"
   npm run demo
   ```

   Buka `http://localhost:5173` di satu jendela Chrome, zoom 100%, layar 1440 px.
4. Atur ulang data demo: buka `/akun-demo` → **Atur ulang data demo** → tunggu "Data demo sudah dikembalikan". Tanggal di data demo dihitung dari hari ini, jadi atur ulang selalu dilakukan di hari demo.
5. Buka `/` dan pastikan angka Rp430.000 tampil. Tidak perlu masuk dulu.
6. Matikan notifikasi Windows (Focus assist) dan suara.

## Bila ada yang macet

| Gejala | Tindakan |
| --- | --- |
| Halaman berputar lama atau kosong | Tekan F5. Data tersimpan di peramban, jadi muat ulang tidak menghapus langkah sebelumnya. |
| Tampil "Ada yang tidak beres" | Tekan **Muat ulang**. Bila tetap, buka `/akun-demo`, masuk lagi dengan akun langkah itu, lalu lanjut dari halaman tujuannya. |
| Langkah 6: "Lahan tidak cukup" | Lahan terpakai rencana di langkah 4. Kurangi jumlah dengan tombol − sampai cukup, atau lewati langkah 4 saat demo ulang. |
| Langkah 9: banner kiriman tiba tidak ada | Sudah lewat pukul 13.00 (kiriman dianggap diterima). Tunjukkan Riwayat dan jelaskan batas periksa 6 jam; lanjut ke penutup. |
| Server mati atau port bentrok | Di terminal tekan Ctrl+C, jalankan lagi `npm run demo`; bila port 5173 dipakai, `npm run demo -- --port 5174`. |
| Laptop melambat | Tutup tab dan aplikasi lain; jangan menjalankan tes atau tangkapan layar selama demo. |
| Ingin mulai dari awal | `/akun-demo` → **Atur ulang data demo**. Semua perubahan demo hilang dan data contoh kembali. |

## Alur cadangan di luar pukul 07.00–13.00

Lakukan langkah 1–8 seperti biasa. Ganti langkah 9 dengan: buka **Riwayat** sebagai Imas dan tunjukkan kiriman yang sudah diterima beserta rinciannya, lalu jelaskan bahwa pembeli punya 6 jam untuk memeriksa sebelum dana cair otomatis (D-01). Usulan "Jam demo" di pemilih akun demo supaya langkah 9 bisa dilakukan kapan saja dicatat di T6.08 (D-46).
