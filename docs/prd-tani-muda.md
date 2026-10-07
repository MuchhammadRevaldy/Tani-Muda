# PRD Tani Muda v1: Belajar, Hitung, dan Jual

Oct 3, 2026 · @Informatika UMBY

## Ringkasan

Dokumen ini mendefinisikan versi pertama Tani Muda, aplikasi yang menemani petani muda dari belajar, menghitung modal, dan merawat tanaman, sampai menjual panen langsung ke pembeli. Semua fitur bertumpu pada **Resep Tanam**, yaitu panduan yang divalidasi penyuluh untuk setiap kombinasi komoditas dan metode tanam. Aplikasi mendukung banyak komoditas, dari sayur kebun sampai padi sawah, dengan empat metode: bedengan, sawah, polybag, dan hidroponik.

| Pilar | Fitur | Hasil bagi petani muda |
| --- | --- | --- |
| Belajar | Modul video singkat per tahap tanam, checklist harian | Tahu cara menanam yang benar |
| Hitung | Kalkulator Modal (benih, jenis pupuk, harga, dan biaya lain), Pengingat Perawatan, Catatan Pengeluaran | Modal terukur dan perawatan tepat waktu |
| Jual | Marketplace Pesan Sebelum Tanam yang menghubungkan petani dengan pembeli, pembayaran aman, rating | Pembeli dan harga pasti sebelum menanam |

**Versi** v1 untuk lomba dan pilot di satu kecamatan · **Status** draf · **Platform** aplikasi web responsif (PWA) · **Dokumen terkait** Proposal Tani Muda

## Latar Belakang Masalah

Anak muda enggan bertani karena empat ketidakpastian sekaligus: tidak tahu caranya, tidak tahu modalnya, mudah lupa jadwal perawatan, dan tidak tahu siapa yang akan membeli.

- **Pengetahuan terbatas.** Penyuluhan jarang menjangkau anak muda yang terbiasa belajar lewat HP, sehingga pemula menanam dengan coba-coba.
- **Modal tidak terukur.** Pemula tidak tahu berapa benih dan pupuk yang dibutuhkan untuk luas lahannya, jenis pupuk apa yang dipakai, dan berapa total biayanya.
- **Jadwal perawatan terlupa.** Pemupukan susulan dan cek hama punya waktu yang dihitung dari hari tanam, dan keterlambatan bisa menurunkan hasil.
- **Pasar tidak pasti.** Penjualan bergantung pada tengkulak. Survei BPS mencatat harga cabai merah naik 61,31% dari petani sampai konsumen akhir pada data 2019 ([Antara](https://www.antaranews.com/berita/1896032/bps-pola-distribusi-perdagangan-komoditas-sama-seperti-tahun-lalu)), artinya bagian harga yang diterima petani jauh lebih kecil.

Dampaknya terlihat pada regenerasi: petani berusia 19–39 tahun hanya sekitar 21,93% dari seluruh petani menurut Sensus Pertanian 2023 ([BPS](https://sensus.bps.go.id/berita_resmi/detail/st2023/22049/hasil-pencacahan-lengkap-sensus-pertanian-2023-tahap-i)). Jika keempat masalah ini tidak diselesaikan bersamaan, pemuda yang sudah tertarik bisa berhenti setelah satu musim rugi.

## Tujuan

Versi pertama berhasil jika petani muda bisa merencanakan, merawat, dan menjual satu siklus tanam dengan untung yang jelas.

**Tujuan pengguna**

1. Pengguna mendapat rencana modal lengkap dalam waktu kurang dari 5 menit sejak memilih komoditas.
2. Minimal 80% tugas perawatan ditandai selesai tepat waktu atau terlambat paling lama satu hari.
3. Selisih antara rencana modal dan pengeluaran nyata maksimal 20% di akhir siklus.
4. Harga yang diterima petani lewat pesanan minimal 15% lebih tinggi dari harga tengkulak setempat.

**Tujuan produk**

5. Minimal 70% siklus tanam di pilot sudah terhubung ke pesanan pembeli sebelum tanam.
6. Minimal 90% volume pesanan terkirim sesuai jadwal dan standar kualitas.
7. Minimal 60% pembeli memasang pesanan kedua.

## Di Luar Cakupan

Versi pertama sengaja dibatasi supaya bisa selesai dan diuji dalam satu siklus panen.

| Tidak dikerjakan di v1 | Alasan |
| --- | --- |
| Jasa pengiriman oleh platform | Di v1 petani mengantar sendiri atau pembeli mengambil; kurir pihak ketiga menyusul |
| Pembelian benih dan pupuk di dalam aplikasi | Menambah urusan stok dan logistik; v1 cukup mencatat harga dan merek |
| Lelang atau harga yang berubah setiap hari | v1 memakai harga tetap yang disepakati di awal pesanan |
| Pinjaman atau pembiayaan dari platform | Butuh izin lembaga keuangan; v1 hanya menyediakan rekam jejak usaha |
| Rekomendasi dosis dari uji tanah | Butuh data laboratorium; v1 memakai dosis Resep Tanam |
| Penyesuaian jadwal otomatis berdasarkan cuaca | Butuh integrasi data cuaca dan aturan yang divalidasi |
| Deteksi hama atau penyakit dari foto | Butuh model AI; foto di v1 hanya untuk jurnal dan cek kualitas |
| Notifikasi WhatsApp atau SMS | Butuh biaya penyedia; v1 memakai notifikasi web |
| Resep untuk semua komoditas dan metode | v1 menyiapkan resep lengkap untuk sawi, bayam, dan kangkung (bedengan), sawi (hidroponik), dan padi (sawah); komoditas dan metode lain tampil sebagai "Segera hadir" |
| Metode aeroponik dan tabulampot | Aeroponik jarang dipakai dan mahal; tabulampot bersiklus bertahun-tahun sehingga tidak cocok dengan model siklus dan pesanan |
| Rekomendasi merek pupuk | Aplikasi merekomendasikan jenis dan kandungan; merek dipilih petani dari daftar yang dijual di sekitarnya |
| Pengecekan nomor pendaftaran pupuk otomatis | Butuh sumber data resmi; v1 cukup menampilkan tips pengecekan |
| Sensor pH dan nutrisi otomatis untuk hidroponik | Butuh perangkat keras; v1 memakai isian manual |

## Persona dan User Stories

Ada empat peran: petani muda sebagai pengguna utama, pembeli sebagai sisi pasar, penyuluh atau mentor sebagai penjaga kualitas resep, dan admin sebagai pengawas platform.

**Petani muda pemula** (contoh: Arif, 22 tahun, baru pertama kali menanam sayuran)

*Belajar*

- **US-01.** Sebagai petani muda pemula, saya ingin menonton video singkat untuk setiap tahap tanam, supaya saya tahu cara yang benar dari persiapan lahan sampai panen.
- **US-02.** Saya ingin checklist harian yang sesuai umur tanaman saya, supaya saya tahu apa yang harus dikerjakan hari ini.

*Hitung*

- **US-03.** Saya ingin memilih komoditas dan mengisi luas lahan lalu langsung mendapat daftar benih, jenis pupuk, dan jumlahnya, supaya saya tahu apa yang harus dibeli.
- **US-04.** Saya ingin mengubah harga setiap item sesuai harga di toko tani dekat rumah dan menambah biaya lain seperti tenaga kerja, supaya modal yang dihitung sesuai kenyataan.
- **US-05.** Saya ingin tahu mana pupuk bersubsidi, supaya hitungan tidak meleset kalau saya tidak mendapat jatah subsidi.
- **US-06.** Saya ingin melihat total modal, titik impas, dan perkiraan untung, supaya bisa memutuskan apakah menanam itu layak.
- **US-07.** Saya ingin jadwal pemupukan, cek hama, dan panen dibuat otomatis dari tanggal tanam, lalu diingatkan setiap pagi, supaya tidak ada perawatan yang terlewat.
- **US-08.** Saya ingin menandai tugas selesai dengan foto, menunda tugas, dan melihat saran jika ada yang terlambat, supaya jadwal tetap masuk akal.
- **US-09.** Saya ingin mencatat pengeluaran nyata dan membandingkannya dengan rencana, supaya tahu untung yang sebenarnya.
- **US-10.** Saya ingin tetap bisa membuka jadwal dan checklist saat sinyal hilang di lahan.

*Tanaman, metode, dan perawatan*

- **US-22.** Saya ingin memilih jenis lahan saya dulu (sawah, kebun atau tegalan, pekarangan atau polybag), supaya hanya tanaman yang cocok yang ditampilkan.
- **US-23.** Saya ingin mencari dari banyak komoditas, termasuk padi, dan tahu mana yang resepnya sudah tersedia, supaya saya tidak salah pilih. Jika resepnya belum ada, saya ingin bisa memintanya.
- **US-24.** Saya ingin membandingkan metode tanam (bedengan, polybag, hidroponik, atau sawah) dari sisi modal awal, kebutuhan lahan, dan seberapa sering dirawat, supaya saya memilih cara yang sesuai kemampuan.
- **US-25.** Saya ingin mengisi ukuran sesuai metode, misalnya luas dalam ru atau bata, jumlah polybag, atau jumlah lubang tanam hidroponik, supaya tidak perlu menghitung konversi sendiri.
- **US-26.** Saya ingin melihat rekomendasi pupuk berdasarkan jenis dan kandungannya, lalu memilih merek yang dijual di toko sekitar beserta harganya, supaya saya membeli yang tepat dengan harga wajar.
- **US-27.** Sebagai petani hidroponik, saya ingin biaya alat yang sekali beli dibagi ke beberapa siklus, supaya modal per siklus terlihat masuk akal.
- **US-28.** Sebagai petani hidroponik, saya ingin mengisi hasil cek pH dan PPM lalu langsung mendapat saran, supaya larutan nutrisi tetap dalam kondisi baik.
- **US-29.** Saya ingin mengatur pengingat per jenis tugas dan jamnya, supaya notifikasi tidak terasa mengganggu.

*Jual*

- **US-11.** Saya ingin melihat pesanan dari pembeli di dekat saya, supaya saya menanam dengan pembeli yang sudah pasti.
- **US-12.** Saya ingin mengambil sebagian pesanan sesuai luas lahan saya, dan diberi tahu jika lahan saya tidak cukup, supaya saya tidak menjanjikan lebih dari kemampuan.
- **US-13.** Saya ingin melihat bahwa uang muka pembeli sudah masuk sebelum saya mulai menanam, supaya saya yakin pesanan itu serius.
- **US-14.** Saya ingin mengirim panen dengan foto kualitas dan menerima pembayaran setelah pembeli mengonfirmasi, supaya transaksi jelas dan aman.

**Pembeli** (contoh: Bu Ratna, pengelola katering)

- **US-15.** Sebagai pembeli, saya ingin memasang pesanan rutin berisi komoditas, jumlah, jadwal, harga, dan standar kualitas, supaya pasokan saya terencana.
- **US-16.** Saya ingin memantau progres kebun lewat foto jurnal dan perkiraan tanggal panen, supaya bisa merencanakan menu.
- **US-17.** Saya ingin mengonfirmasi penerimaan atau menolak sebagian kiriman dengan alasan dan foto, supaya saya hanya membayar barang yang sesuai.
- **US-18.** Saya ingin memberi rating dan memesan lagi ke petani yang sama, supaya hubungan pasokan berlanjut.
- **US-30.** Sebagai pengelola koperasi desa atau penggilingan, saya ingin memasang pesanan sekali panen, misalnya gabah untuk panen bulan tertentu, supaya pasokan saya terjamin tanpa harus memesan rutin.

**Penyuluh atau mentor**

- **US-19.** Sebagai penyuluh, saya ingin membuat dan memperbarui Resep Tanam untuk setiap kombinasi komoditas dan metode, berisi dosis, jadwal per hari setelah tanam, dan rentang normal untuk tugas pengukuran, supaya rekomendasi aplikasi sesuai kondisi daerah.
- **US-20.** Saya ingin melihat petani binaan yang punya tugas terlambat, supaya bisa segera mendampingi.
- **US-31.** Saya ingin melihat daftar resep yang paling banyak diminta petani, supaya tahu resep mana yang perlu disusun berikutnya.

**Admin platform**

- **US-21.** Sebagai admin, saya ingin memverifikasi pembeli baru dan menangani sengketa pengiriman, supaya marketplace tetap tepercaya.

## Kebutuhan Wajib (P0)

Tanpa kebutuhan di bawah ini, satu siklus lengkap dari belajar sampai panen terjual belum bisa berjalan, sehingga belum boleh dirilis ke pilot.

### A. Akun dan Peran

**P0-01. Login dan peran.** Pengguna masuk dengan nomor HP dan kode OTP, lalu memilih peran: petani, pembeli, atau mentor. Peran admin diberikan oleh tim.

- [ ] Petani wajib mengisi desa lokasi lahan saat mendaftar.

**P0-02. Verifikasi pembeli.** Pembeli mengisi nama usaha, alamat, dan foto tempat usaha, lalu admin menyetujuinya.

- [ ] Pembeli yang belum terverifikasi bisa melihat aplikasi, tetapi belum bisa memasang pesanan, dan status verifikasinya ditampilkan dengan jelas.

### B. Resep Tanam

**P0-03. Resep per komoditas dan metode.** Setiap resep berlaku untuk satu kombinasi komoditas dan metode tanam (bedengan, sawah, polybag, atau hidroponik). Isinya: daftar input dengan dosis, satuan, dan dasar dosis (per m², per tanaman, atau per liter larutan), daftar tugas dengan hari setelah tanam (HST) dan tipenya, perkiraan hasil panen, serta standar kualitas panen.

- [ ] Saat pilot tersedia resep sawi, bayam, dan kangkung untuk bedengan, sawi untuk hidroponik, dan padi untuk sawah.
- [ ] Resep yang belum divalidasi penyuluh tidak tampil ke petani.
- [ ] Satu komoditas bisa punya beberapa resep, satu untuk setiap metode.

**P0-04. Pengelolaan dan versi resep.** Penyuluh atau admin bisa membuat dan mengubah resep.

- [ ] Siklus yang sedang berjalan tetap memakai versi resep saat siklus dibuat.

**P0-30. Pilih jenis lahan dan komoditas.** Petani memilih jenis lahan (Semua, Sawah, Kebun/tegalan, Pekarangan/polybag), lalu melihat daftar komoditas per kategori (sayuran daun, sayuran buah, tanaman pangan) yang bisa dicari. Setiap komoditas menampilkan perkiraan umur panen, jumlah pesanan di sekitar, dan status resep.

- [ ] Memilih jenis lahan hanya menampilkan komoditas yang cocok.
- [ ] Komoditas tanpa resep tampil dengan label "Segera hadir" dan tetap bisa diketuk.

**P0-31. Minta resep.** Mengetuk komoditas berlabel Segera hadir membuka pilihan "Minta resep ini". Permintaan dicatat per komoditas dan wilayah.

- [ ] Setelah meminta, muncul pesan "Permintaanmu tercatat. Kami kabari saat resepnya siap.", dan petani diberi tahu saat resep tersedia.

**P0-32. Pilih metode tanam.** Setelah komoditas dipilih, petani memilih metode dari daftar yang punya resep untuk komoditas itu. Setiap metode menampilkan modal awal (rendah, sedang, tinggi), kebutuhan lahan, dan seberapa sering dirawat.

- [ ] Padi sawah hanya menampilkan metode Sawah.
- [ ] Vertikultur tampil sebagai pilihan susunan untuk polybag dan hidroponik, bukan metode terpisah.

**P0-33. Ukuran sesuai metode dan satuan lokal.** Isian ukuran menyesuaikan metode: luas lahan untuk bedengan dan sawah (satuan m², ru atau bata, dan hektare), jumlah polybag untuk polybag, serta sistem, jumlah lubang tanam, dan volume tandon untuk hidroponik.

- [ ] Satuan lokal dikonversi otomatis ke m² dengan teks bantuan, misalnya "7 ru ≈ 100 m²".
- [ ] Perkiraan panen langsung diperbarui setiap kali ukuran diubah.

### C. Belajar

**P0-05. Modul per tahap tanam.** Modul disusun per komoditas dan metode. Modul bedengan berisi persiapan lahan, semai, tanam, perawatan, panen, dan pascapanen. Modul hidroponik berisi merakit instalasi sederhana, semai di rockwool, pindah tanam ke netpot, membuat larutan AB mix, mengukur pH dan PPM, serta panen dan membersihkan instalasi. Setiap modul berisi video maksimal tiga menit dan ringkasan teks.

- [ ] Video bisa diputar dengan resolusi rendah dan diunduh untuk ditonton tanpa sinyal.
- [ ] Modul yang sudah ditonton diberi tanda.

**P0-06. Checklist harian.** Halaman utama petani menampilkan tugas hari ini dari jadwal, lengkap dengan tautan ke modul tahap yang sedang berjalan.

### D. Kalkulator Modal

**P0-07. Kebutuhan otomatis.** Jumlah setiap input dihitung dari dosis resep dikali ukuran sesuai dasar dosisnya (per m², per tanaman, atau per liter larutan), lalu dibulatkan ke atas sesuai ukuran kemasan.

- [ ] Ukuran wajib lebih dari nol; jika kosong muncul pesan yang sesuai metode, misalnya "Isi luas lahan dulu" atau "Isi jumlah lubang tanam dulu".

**P0-08. Harga dan item bisa diubah.** Setiap item punya jenis, jumlah, satuan, dan harga per satuan yang bisa diubah. Pengguna bisa menambah item sendiri seperti tenaga kerja atau sewa lahan, dan menghapus item yang tidak dipakai.

- [ ] Harga negatif ditolak dengan pesan yang jelas.
- [ ] Item tanpa harga ditandai "Harga belum diisi", dan ringkasan memberi peringatan bahwa total belum lengkap.

**P0-09. Penanda pupuk bersubsidi.** Status subsidi disimpan per jenis pupuk dan per komoditas, karena subsidi hanya berlaku untuk jenis pupuk, komoditas, dan petani terdaftar tertentu. Pengguna menjawab apakah ia mendapat jatah subsidi; jika tidak, semua pupuk dihitung dengan harga nonsubsidi.

- [ ] Item yang memenuhi syarat menampilkan label "Subsidi" dan catatan "Subsidi hanya untuk petani yang terdaftar di kelompok tani".

**P0-10. Ringkasan hasil.** Kalkulator menampilkan total modal, modal per m², titik impas, perkiraan pendapatan, dan perkiraan untung.

- [ ] Jika siklus terhubung ke pesanan, harga jual otomatis memakai harga kesepakatan.
- [ ] Perkiraan untung yang negatif tampil merah dengan pesan "Dengan angka ini, kamu berpotensi rugi."

**P0-11. Simpan rencana.** Rencana disimpan dan menjadi dasar siklus tanam, serta bisa diubah sebelum tanggal tanam.

**P0-34. Rekomendasi kandungan dan pilihan merek.** Setiap item pupuk dan bahan menampilkan jenis dan kandungan sebagai rekomendasi utama, misalnya "NPK 16-16-16 · 5 kg". Petani memilih merek dari daftar merek yang dilaporkan dijual di kecamatannya, lengkap dengan harga per kemasan, jumlah pelapor, dan waktu laporan terakhir.

- [ ] Aplikasi tidak pernah merekomendasikan merek tertentu; urutan daftar merek berdasarkan laporan terbaru, bukan kerja sama bisnis.
- [ ] Tersedia opsi "Merek lain, isi sendiri", dan merek serta harga yang diisi menjadi laporan harga baru.
- [ ] Di bawah daftar pupuk tampil tips "Beli di kios resmi dan periksa nomor pendaftaran pupuk di kemasan."

**P0-35. Promo terpisah dari rekomendasi.** Promo dari toko tani atau produsen tampil di bagian tersendiri bernama "Promo dari toko tani" dengan label "Promo".

- [ ] Promo tidak pernah muncul di dalam daftar rekomendasi dan tidak mengubah urutan daftar merek.

**P0-36. Alat sekali beli.** Untuk metode yang butuh peralatan, misalnya instalasi hidroponik, alat dicatat di bagian "Alat sekali beli" dengan pilihan membagi biayanya ke sejumlah siklus.

- [ ] Ringkasan menampilkan modal per siklus dan total biaya alat secara terpisah.

### E. Jadwal dan Pengingat

**P0-12. Jadwal otomatis dengan tiga tipe tugas.** Ketika tanggal tanam diisi, sistem membuat tugas dari resep dengan tiga tipe: **sekali** (pada HST tertentu), **berulang** (setiap n hari dalam rentang HST), dan **pengukuran** (berulang, dengan isian angka).

- [ ] Setiap tipe punya ikon berbeda di semua daftar tugas: kalender untuk sekali, putar ulang untuk berulang, dan pengukur untuk pengukuran.
- [ ] Tugas berulang tampil sebagai satu pengingat dengan keterangan frekuensi, misalnya "Siram pagi dan sore · setiap hari", bukan puluhan tugas terpisah.
- [ ] Daftar jadwal bisa disaring berdasarkan tipe tugas.

**P0-13. Notifikasi pagi.** Setiap hari pukul 06.00, pengguna menerima satu notifikasi berisi semua tugas hari itu.

- [ ] Jika izin notifikasi ditolak, tugas hari ini tampil sebagai banner saat aplikasi dibuka.

**P0-14. Tandai selesai dengan foto.** Foto opsional otomatis masuk jurnal tanam beserta tanggal dan nama tugas.

**P0-15. Tunda tugas.** Tugas bisa ditunda 1–3 hari, dan tugas sejenis berikutnya ikut bergeser.

- [ ] Penundaan yang melewati perkiraan panen memerlukan konfirmasi.

**P0-16. Status terlambat.** Tugas yang lewat tanggal dan belum selesai berstatus "Terlambat x hari" beserta saran tindakan dari resep, dan tetap bisa ditandai selesai.

**P0-17. Ubah tanggal tanam.** Semua tugas yang belum selesai dihitung ulang, sementara tugas yang sudah selesai tidak berubah.

**P0-37. Tugas pengukuran.** Tugas pengukuran meminta petani mengisi angka, misalnya pH dan PPM untuk hidroponik. Setiap isian menampilkan batang rentang normal dari resep dan posisi angka yang diisi. Hasilnya dinilai Normal, Terlalu tinggi, atau Terlalu rendah, beserta saran tindakan dari resep.

- [ ] Rentang normal dan saran selalu berasal dari Resep Tanam yang divalidasi, dengan keterangan "Rentang dari Resep Tanam yang dicek penyuluh."
- [ ] Riwayat tujuh pengukuran terakhir tampil sebagai grafik kecil dengan pita rentang normal.
- [ ] Hasil di luar rentang menambahkan tugas "Ukur ulang" pada hari berikutnya.

**P0-38. Pengaturan pengingat per siklus.** Petani bisa mengatur jam pengingat pagi, menyalakan atau mematikan pengingat sore, dan menyalakan atau mematikan pengingat per tipe tugas.

- [ ] Mematikan pengingat tidak menghapus tugas; tugas tetap tampil di jadwal dan beranda.

### F. Jurnal dan Pengeluaran

**P0-18. Rencana dibanding realisasi.** Pengguna mencatat pengeluaran nyata per item dengan foto nota opsional.

- [ ] Di akhir siklus, aplikasi menampilkan untung sebenarnya dari pendapatan nyata dikurangi pengeluaran nyata.

### G. Marketplace: Pesan Sebelum Tanam

**P0-19. Pasang pesanan rutin atau sekali panen.** Pembeli terverifikasi memilih jenis pesanan. Pesanan **rutin** berisi komoditas, jumlah per pengiriman, frekuensi, durasi maksimal tiga bulan, harga per kg, standar kualitas, serta titik antar atau ambil. Pesanan **sekali panen** berisi komoditas, jumlah total, perkiraan bulan panen, harga per kg, standar kualitas, dan titik ambil; jenis ini cocok untuk gabah atau jagung.

- [ ] Komoditas hanya bisa dipilih dari daftar yang punya Resep Tanam.
- [ ] Pesanan menampilkan biaya layanan sebelum dipasang.
- [ ] Halaman Pesanan di sekitar menampilkan penanda jenis pesanan dan filter Semua, Rutin, dan Sekali panen.

**P0-20. Penawaran ke petani terdekat.** Pesanan tampil ke petani dalam radius tertentu dari titik antar, diurutkan dari yang terdekat.

**P0-21. Ambil sebagian pesanan.** Petani memilih jumlah yang sanggup dipenuhi. Aplikasi menghitung luas lahan yang dibutuhkan dari perkiraan hasil per m² dan membandingkannya dengan luas lahan petani.

- [ ] Jika lahan tidak cukup, muncul peringatan beserta jumlah maksimal yang disarankan.
- [ ] Total jumlah yang diambil semua petani tidak boleh melebihi pesanan.
- [ ] Mengambil pesanan otomatis membuat siklus tanam dan rencana modal dengan harga kesepakatan.

**P0-22. Kesepakatan digital.** Sebelum uang muka dibayar, kedua pihak menyetujui ringkasan berisi jumlah, jadwal kirim, harga, standar kualitas, dan aturan gagal panen.

**P0-23. Uang muka dan dana tertahan.** Pembeli membayar uang muka (usulan 20% dari nilai pesanan) lewat payment gateway, dan dana ditahan sampai pengiriman diterima. Setiap pengiriman berikutnya dibayar paling lambat sehari sebelum jadwal kirim.

- [ ] Petani melihat status "Uang muka diterima" sebelum diminta mulai menanam.

**P0-24. Progres untuk pembeli.** Pembeli bisa melihat foto jurnal dan perkiraan tanggal panen dari petani yang memenuhi pesanannya.

**P0-25. Pengiriman dan konfirmasi.** Petani mengunggah foto hasil panen sebelum mengirim. Pembeli mengonfirmasi penerimaan atau menolak sebagian dengan alasan dan foto.

- [ ] Jika pembeli tidak menanggapi dalam 24 jam, kiriman dianggap diterima.
- [ ] Penolakan sebagian masuk antrean admin sebagai sengketa.

**P0-26. Pencairan dana.** Setelah kiriman diterima, dana untuk kiriman itu cair ke petani sebesar harga kesepakatan. Biaya layanan dibayar pembeli, sehingga tidak memotong bagian petani.

**P0-27. Gagal panen dan pembatalan.** Jika petani menyatakan tidak sanggup sebelum jadwal kirim, sisa jatahnya ditawarkan ulang ke petani lain; jika tidak ada pengganti, uang muka untuk bagian itu dikembalikan ke pembeli. Jika pembeli membatalkan setelah petani mulai menanam, uang muka menjadi kompensasi petani.

**P0-28. Rating dua arah.** Petani dan pembeli saling memberi rating setelah setiap pengiriman, dan rating rata-rata tampil di profil masing-masing.

### H. Akses Offline

**P0-29. Bisa dibuka tanpa sinyal.** Jadwal, checklist, rencana modal, dan video yang sudah diunduh tetap bisa dibuka saat offline.

- [ ] Tugas yang ditandai selesai saat offline otomatis tersinkron ketika sinyal kembali.

## Kebutuhan Tambahan (P1) dan Masa Depan (P2)

P1 dikerjakan segera setelah P0 stabil. P2 belum dibangun, tapi struktur datanya disiapkan sejak v1 supaya mudah ditambahkan.

**Tambahan (P1)**

| ID | Pilar | Kebutuhan | Catatan |
| --- | --- | --- | --- |
| P1-01 | Belajar | Tanya Mentor: petani mengirim pertanyaan dan foto tanaman, dijawab penyuluh atau petani senior | Target jawaban kurang dari 24 jam |
| P1-02 | Hitung | Saran harga setempat dari harga yang dilaporkan pengguna lain di kecamatan yang sama | Tampil jika ada minimal tiga laporan dalam 30 hari |
| P1-03 | Hitung | Skenario "bagaimana jika" saat hasil panen atau harga turun | Membantu menilai risiko sebelum menanam |
| P1-04 | Hitung | Ekspor ringkasan usaha ke PDF | Bahan pengajuan pembiayaan seperti KUR |
| P1-05 | Hitung | Pengingat sore untuk tugas yang belum selesai | Maksimal satu notifikasi tambahan per hari |
| P1-06 | Jual | Harga acuan di halaman pasang pesanan, dari data harga pangan resmi | Mencegah harga kesepakatan yang terlalu rendah |
| P1-07 | Jual | Kelompok tani digital untuk memenuhi pesanan besar bersama | Cocok untuk dapur MBG atau katering besar |
| P1-08 | Jual | Langganan pembeli bisnis dengan perencanaan pasokan dan laporan | Sumber pendapatan tahun kedua |
| P1-09 | Semua | Dashboard penyuluh berisi petani binaan dengan tugas terlambat | Menjawab US-20 |
| P1-10 | Hitung | Resep polybag dan komoditas tambahan, diprioritaskan dari permintaan resep terbanyak | Menjawab US-23 dan US-31 |
| P1-11 | Hitung | Perbandingan metode: modal dan perkiraan untung bedengan dan hidroponik untuk komoditas yang sama, berdampingan | Membantu memilih metode |
| P1-12 | Jual | Pesan langsung antara petani dan pembeli dari kesepakatan dan kiriman | Ditambahkan D-40; v1 memakai "Tanya pembeli dulu" lewat WhatsApp admin |

**Masa depan (P2)**

| ID | Kebutuhan | Yang disiapkan sejak v1 |
| --- | --- | --- |
| P2-01 | Saran menggeser jadwal pemupukan atau melewati siram berdasarkan prakiraan cuaca BMKG | Lokasi lahan disimpan setingkat desa; tugas punya aturan boleh digeser |
| P2-02 | Notifikasi lewat WhatsApp | Logika pengiriman notifikasi dipisah dari salurannya |
| P2-03 | Deteksi hama dan penyakit dari foto | Foto jurnal disimpan dengan label tugas dan tanggal |
| P2-04 | Rekomendasi dosis dari hasil uji tanah | Dosis resep disimpan sebagai nilai dasar yang bisa dikoreksi |
| P2-05 | Jasa pengiriman lewat kurir pihak ketiga | Data pengiriman sudah menyimpan titik ambil, titik antar, dan jadwal |
| P2-06 | Beberapa komoditas sekaligus dan rotasi tanam | Satu petani bisa punya lebih dari satu siklus aktif |
| P2-07 | Pengecekan nomor pendaftaran pupuk secara otomatis | Merek disimpan sebagai data tersendiri dengan kolom nomor pendaftaran |
| P2-08 | Sensor pH dan PPM yang mengirim angka otomatis untuk hidroponik | Hasil pengukuran disimpan beserta sumbernya (manual atau sensor) |
| P2-09 | Metode tambahan seperti aeroponik | Metode disimpan sebagai data, bukan nilai tetap di kode |

## Alur dan Logika Sistem

Resep Tanam adalah sumber tunggal untuk kalkulator dan jadwal, sementara marketplace memastikan setiap siklus tanam sudah punya pembeli.

**Alur Belajar dan Hitung**

&#91;embedded content: alur sistem · dari resep sampai jurnal tanam\]

Kalkulator menghasilkan rencana modal yang tersimpan sebagai siklus tanam. Begitu tanggal tanam diisi, pola tugas dari resep menjadi jadwal nyata, dikirim sebagai notifikasi pagi, lalu setiap tugas yang selesai masuk jurnal tanam.

**Alur Jual**

&#91;embedded content: alur marketplace · pembeli, platform, dan petani muda\]

Pembeli memesan dan membayar uang muka sebelum tanam. Petani mengambil pesanan setelah kalkulator memastikan lahannya cukup, lalu menanam dengan pengingat. Kiriman yang ditolak sebagian masuk proses sengketa, sementara kiriman yang diterima langsung mencairkan dana.

**Rumus perhitungan**

- **Kebutuhan input** = dosis per satuan × ukuran sesuai dasar dosis (luas lahan, jumlah tanaman, atau liter larutan), dibulatkan ke atas ke kelipatan ukuran kemasan.
- **Konversi satuan luas**: 1 hektare = 10.000 m²; ru atau bata dikonversi ke m² dengan nilai per wilayah (umumnya sekitar 14 m² per ru), yang disimpan sebagai data dan bisa diubah admin.
- **Kebutuhan nutrisi hidroponik** = dosis pekatan per liter × volume tandon × jumlah pengisian ulang dalam satu siklus menurut resep.
- **Biaya alat per siklus** = harga alat ÷ jumlah siklus pembagian, lalu ditambahkan ke modal per siklus.
- **Total modal** = jumlah semua (jumlah × harga per satuan) + biaya alat per siklus.
- **Perkiraan pendapatan** = perkiraan panen × harga jual per kg; untung = pendapatan − total modal.
- **Titik impas** = total modal ÷ harga jual per kg, dalam kilogram.
- **Tanggal tugas sekali** = tanggal tanam + HST; tunda n hari menggeser tugas itu dan tugas sejenis berikutnya.
- **Tanggal tugas berulang dan pengukuran** = tanggal tanam + HST mulai + k × interval, untuk setiap k sampai HST selesai.
- **Status pengukuran**: Normal jika batas bawah ≤ nilai ≤ batas atas; Terlalu rendah jika di bawah batas bawah; Terlalu tinggi jika di atas batas atas.
- **Luas per panen** = jumlah per pengiriman ÷ perkiraan hasil per m².
- **Luas yang dibutuhkan untuk pesanan rutin** = luas per panen × jumlah petak yang tumbuh bersamaan. Untuk pengiriman mingguan dengan umur panen empat minggu, aplikasi menyarankan tanam bertahap empat petak dengan jarak satu minggu.
- **Nilai pesanan** = jumlah total × harga per kg; uang muka = 20% dari nilai pesanan; biaya layanan = 5% dari nilai pesanan, dibayar pembeli.
- **Pembayaran per kiriman** = jumlah kiriman × harga per kg; uang muka diperhitungkan pada kiriman terakhir. Pesanan sekali panen hanya punya satu kiriman.

**Contoh hitungan.** Jika resep menulis dosis 5 gram per m² dan luas lahan 100 m², kebutuhannya 500 gram; karena kemasan terkecil 1 kg, kalkulator menulis 1 kg. Angka ini hanya contoh hitungan, bukan rekomendasi dosis.

## Model Data

Data dibagi menjadi tiga kelompok: resep dan materi belajar yang dikelola penyuluh, siklus tanam milik petani, dan transaksi marketplace. Siklus selalu menyimpan versi resep yang dipakai, sehingga perubahan resep tidak mengacaukan siklus yang sedang berjalan.

**Pengguna, resep, dan belajar**

| Tabel | Kolom penting | Fungsi |
| --- | --- | --- |
| `pengguna` | nomor HP, nama, peran, desa | Akun semua peran |
| `profil_pembeli` | pengguna, nama usaha, jenis usaha (katering, restoran, koperasi, penggilingan), alamat, foto tempat usaha, status verifikasi | Data usaha pembeli |
| `komoditas` | nama, kategori, jenis lahan yang cocok, satuan panen (kg atau kg gabah), perkiraan umur panen, status resep | Daftar komoditas |
| `metode_tanam` | nama (bedengan, sawah, polybag, hidroponik), dasar ukuran (luas, jumlah polybag, lubang tanam), modal awal, kebutuhan lahan, frekuensi perawatan, bisa disusun vertikultur | Daftar metode |
| `resep_tanam` | komoditas, metode, versi, validator, tanggal validasi, hasil per satuan ukuran, standar kualitas | Resep untuk satu komoditas dan metode |
| `resep_input` | resep, input pertanian, dosis, dasar dosis (per m², per tanaman, per liter), ukuran kemasan, alat sekali beli | Kebutuhan bahan |
| `resep_tugas` | resep, tipe (sekali, berulang, pengukuran), HST mulai dan selesai, interval, judul, besaran ukur dan satuannya, batas bawah dan atas, saran jika di luar rentang, boleh digeser, saran jika terlambat | Pola jadwal dan aturan pengukuran |
| `modul` | komoditas, metode, tahap, judul, video, ringkasan, urutan | Materi belajar |
| `progres_modul` | pengguna, modul, waktu selesai | Penanda modul yang sudah ditonton |
| `permintaan_resep` | pengguna, komoditas, metode, desa, waktu | Dasar prioritas resep berikutnya |

**Input pertanian, merek, dan harga**

| Tabel | Kolom penting | Fungsi |
| --- | --- | --- |
| `input_pertanian` | nama jenis, kategori (benih, organik padat, organik cair, anorganik tunggal, anorganik majemuk, nutrisi hidroponik, pembenah tanah, bahan lain), kandungan, satuan | Rekomendasi berbasis jenis dan kandungan |
| `kelayakan_subsidi` | input pertanian, komoditas, berlaku mulai, berlaku sampai | Aturan subsidi yang mudah diperbarui |
| `merek_input` | input pertanian, nama merek, produsen, ukuran kemasan, nomor pendaftaran | Daftar merek |
| `laporan_harga` | pengguna, merek, harga per kemasan, kecamatan, tanggal | Harga dan ketersediaan setempat |
| `promo` | pemasang (toko tani atau produsen), merek, isi promo, wilayah, berlaku mulai dan sampai | Promo yang selalu tampil terpisah dari rekomendasi |
| `konversi_satuan` | wilayah, nama satuan, nilai dalam m² | Ru, bata, dan satuan lokal lain |

**Siklus tanam**

| Tabel | Kolom penting | Fungsi |
| --- | --- | --- |
| `siklus_tanam` | petani, resep dan versinya, metode, ukuran dan satuan aslinya, sistem hidroponik, susunan vertikultur, tanggal tanam, dapat subsidi, harga jual, perkiraan panen, alokasi pesanan | Satu musim tanam |
| `rencana_item` | siklus, input pertanian, merek, jumlah, satuan, harga satuan, asal (resep atau tambahan), alat sekali beli, jumlah siklus pembagian | Isi kalkulator modal |
| `tugas` | siklus, tugas resep, tipe, tanggal, status, waktu selesai, foto, catatan | Jadwal nyata |
| `hasil_pengukuran` | tugas, besaran (pH, PPM), nilai, status (normal, terlalu tinggi, terlalu rendah), sumber (manual atau sensor), waktu | Riwayat pengukuran dan grafik |
| `pengeluaran` | siklus, item rencana, nominal, tanggal, foto nota | Realisasi biaya |
| `pengaturan_pengingat` | siklus, jam pengingat pagi, pengingat sore aktif, tipe tugas yang aktif | Preferensi pengingat per siklus |
| `langganan_notifikasi` | pengguna, data web push | Tujuan notifikasi |

**Marketplace**

| Tabel | Kolom penting | Fungsi |
| --- | --- | --- |
| `pesanan` | pembeli, jenis (rutin atau sekali panen), komoditas, jumlah per kiriman atau jumlah total, frekuensi, tanggal mulai dan selesai atau perkiraan bulan panen, harga per kg, standar kualitas, titik antar atau ambil, status | Kebutuhan pembeli |
| `alokasi_pesanan` | pesanan, petani, jumlah, status, waktu setuju kesepakatan | Bagian pesanan yang diambil tiap petani |
| `pembayaran` | pesanan atau pengiriman, jenis (uang muka, kiriman, biaya layanan), nominal, status (ditahan, cair, dikembalikan), referensi payment gateway | Arus dana |
| `pengiriman` | alokasi, tanggal jadwal, jumlah, foto kualitas, status (terjadwal, dikirim, diterima, ditolak sebagian), catatan penolakan | Setiap kiriman |
| `rating` | pengiriman, pemberi, penerima, nilai, komentar | Reputasi dua arah |

Status "terlambat" pada tugas tidak disimpan, tetapi dihitung dari tanggal tugas dibanding hari ini. Dana pengguna tidak pernah masuk rekening tim: status ditahan dan cair dicatat dari respons payment gateway.

## Metrik Keberhasilan

Indikator cepat dievaluasi 2–4 minggu setelah pilot dimulai. Indikator lambat dievaluasi di akhir siklus pertama dan tiga bulan setelah peluncuran. Semua metrik diambil dari catatan aktivitas di database.

**Indikator cepat**

| Pilar | Metrik | Cara mengukur | Target |
| --- | --- | --- | --- |
| Belajar | Modul tahap awal ditonton | Persentase petani yang menyelesaikan modul persiapan lahan sebelum tanam | 70% |
| Hitung | Adopsi kalkulator | Persentase petani baru yang menyimpan rencana modal | 80% |
| Hitung | Waktu membuat rencana | Median waktu dari memilih komoditas sampai menyimpan rencana | Di bawah 5 menit |
| Hitung | Tugas tepat waktu | Persentase tugas selesai paling lambat satu hari dari jadwal | 80% |
| Hitung | Tugas pengukuran diisi | Persentase tugas pengukuran yang diisi angka paling lambat satu hari dari jadwal | 70% |
| Hitung | Pengukuran kembali normal | Persentase hasil di luar rentang yang kembali normal saat ukur ulang | 70% |
| Hitung | Izin notifikasi | Persentase siklus aktif dengan notifikasi diizinkan | 60% |
| Jual | Pesanan terisi | Persentase pesanan yang seluruh jumlahnya diambil petani dalam 7 hari | 70% |
| Jual | Siklus berpembeli | Persentase siklus pilot yang terhubung ke pesanan sebelum tanam | 70% |
| Semua | Permintaan resep | Jumlah permintaan resep per komoditas dan metode setiap bulan | Dipantau sebagai dasar prioritas, tanpa target |

**Indikator lambat**

| Pilar | Metrik | Cara mengukur | Target |
| --- | --- | --- | --- |
| Hitung | Siklus sampai panen | Persentase siklus yang berakhir dengan panen tercatat | 75% |
| Hitung | Akurasi rencana | Persentase siklus dengan selisih rencana dan realisasi maksimal 20% | 70% |
| Jual | Kiriman sesuai | Persentase volume yang diterima tanpa penolakan | 90% |
| Jual | Harga yang diterima petani | Selisih harga kesepakatan dibanding harga tengkulak setempat | Minimal 15% lebih tinggi |
| Jual | Pembeli memesan lagi | Persentase pembeli yang memasang pesanan kedua | 60% |
| Semua | Petani lanjut menanam | Persentase petani yang memulai siklus berikutnya | 60% |
| Semua | Kepuasan pengguna | Rata-rata skala 1–5 di akhir siklus, terpisah untuk petani dan pembeli | 4,0 |

## Pertanyaan Terbuka

Empat pertanyaan pertama harus terjawab sebelum pengembangan dimulai. Sisanya bisa diselesaikan sambil berjalan.

| Pertanyaan | Penjawab | Menghambat? |
| --- | --- | --- |
| Kombinasi komoditas dan metode apa yang dipakai untuk pilot, dan siapa penyuluh yang memvalidasi resepnya? | Tim dan penyuluh setempat | Ya |
| Berapa dosis, jadwal pupuk, dan perkiraan hasil yang tepat untuk setiap resep di daerah pilot? | Penyuluh atau dosen pertanian | Ya |
| Berapa rentang normal pH dan PPM, interval pengukuran, dan saran tindakan untuk sawi hidroponik? | Penyuluh atau praktisi hidroponik | Ya, untuk P0-37 |
| Fitur payment gateway mana yang mengizinkan dana ditahan lalu dicairkan ke penjual, dan apa syarat pendaftarannya? | Tim teknis bersama penyedia payment gateway | Ya |
| Berapa besar uang muka dan biaya layanan yang diterima pembeli di daerah pilot? Usulan awal 20% dan 5% | Wawancara pembeli | Tidak |
| Seperti apa standar kualitas sederhana untuk setiap komoditas, dan bagaimana menilainya dari foto? | Penyuluh dan pembeli | Tidak |
| Siapa yang menanggung ongkos kirim, dan berapa radius pesanan yang masuk akal? | Wawancara petani dan pembeli | Tidak |
| Berapa nilai konversi ru, bata, atau satuan lokal lain di daerah pilot? | Penyuluh dan petani setempat | Tidak |
| Jenis pupuk dan merek apa saja yang dijual di toko tani sekitar pilot, dan berapa harganya? | Tim, lewat survei toko tani | Tidak |
| Kelayakan subsidi per jenis pupuk dan komoditas versi terbaru seperti apa? | Penyuluh | Tidak, v1 cukup data awal |
| Siapa yang boleh memasang promo, dan bagaimana aturannya agar promo tetap terpisah dari rekomendasi? | Tim produk dan pembimbing | Tidak |
| Apakah notifikasi pukul 06.00 cocok, dan berapa peserta yang memakai iPhone mengingat web push di iPhone butuh aplikasi ditambahkan ke layar utama? | Wawancara pengguna dan tim teknis | Tidak |
| Persetujuan apa yang dibutuhkan untuk menyimpan foto, lokasi lahan, dan data transaksi? | Pembimbing atau ahli hukum | Tidak untuk pilot, ya sebelum rilis umum |

## Tahapan dan Ketergantungan

Semua kebutuhan P0 masuk dalam rencana 8 minggu proposal Tani Muda. Resep Tanam dan kemitraan pembeli dikerjakan paling awal, karena kalkulator, pengingat, dan marketplace sama-sama bergantung pada keduanya.

**Tahapan**

1. **Minggu 1, resep dan kemitraan.** Sepakati kerja sama dengan penyuluh dan susun resep untuk lima kombinasi: sawi, bayam, dan kangkung (bedengan), sawi (hidroponik), dan padi (sawah). Survei jenis pupuk, merek, dan harga di toko tani sekitar, catat konversi satuan lokal, dan dapatkan 3–5 calon pembeli.
2. **Minggu 2, fondasi dan tanam pilot.** Bangun akun, peran, verifikasi pembeli, dan skema data, sambil mulai menanam sawi di bedengan dan di instalasi hidroponik.
3. **Minggu 3, pilih tanaman, belajar, dan kalkulator.** Selesaikan P0-03 sampai P0-11 serta P0-30 sampai P0-36.
4. **Minggu 4, jadwal dan pengingat.** Selesaikan P0-12 sampai P0-18 serta P0-37 dan P0-38, termasuk notifikasi web push.
5. **Minggu 5, marketplace.** Selesaikan pesanan rutin dan sekali panen, penawaran, alokasi, dan kesepakatan (P0-19 sampai P0-22).
6. **Minggu 6, pembayaran dan pengiriman.** Hubungkan payment gateway mode uji coba, pengiriman, konfirmasi, rating, dan akses offline (P0-23 sampai P0-29).
7. **Minggu 7, panen pilot.** Jalankan panen, pengiriman, dan pencairan dana lewat aplikasi bersama pembeli pilot.
8. **Minggu 8, evaluasi.** Ukur indikator cepat, perbaiki temuan, lalu mulai P1.

Tanam pilot dimulai di minggu kedua, sebelum pengingat dan marketplace selesai. Siklus pilot dimasukkan dengan tanggal tanam yang sudah lewat, dan pesanan pembeli pilot dicatat ulang di aplikasi begitu fiturnya siap.

**Ketergantungan**

- **Penyuluh atau dosen pertanian** untuk memvalidasi Resep Tanam dan modul belajar. Ini menghambat jika belum ada.
- **Payment gateway berizin** yang mendukung penahanan dan pencairan dana untuk marketplace. Ini menghambat untuk P0-23 sampai P0-26.
- **Calon pembeli pilot** seperti katering atau restoran yang bersedia memesan sebelum tanam.
- **Supabase** untuk database, login OTP, penyimpanan foto dan video, serta tugas terjadwal pengirim notifikasi.
- **PWA dengan service worker dan HTTPS** untuk web push dan akses offline; hosting di Vercel sudah memenuhi syarat ini.
- **Toko tani setempat** sebagai sumber harga awal benih dan pupuk.
