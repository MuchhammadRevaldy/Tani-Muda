/**
 * Naskah narasi teaser Tani Muda [AG-44], satu-satunya sumber teks narasi.
 *
 * - `teks`  : tulisan untuk subtitel (angka ditulis biasa).
 * - `ucap`  : tulisan untuk mesin suara bila pelafalannya perlu dibantu
 *             (angka dieja, "pH" dibaca "pe ha"). Kosong = sama dengan teks.
 * - `jeda`  : jeda sebelum kalimat dalam detik (bawaan acak 0,28–0,45).
 *             Bila narasi lebih pendek dari animasi adegan, sisa waktunya dibagi
 *             ke jeda antarkalimat (paling banyak +1 detik per jeda) supaya
 *             kalimat jatuh di bagian gambar yang sesuai.
 * - `laju`  : kecepatan bicara kalimat ini (bawaan "-6%").
 *
 * `minimumDetik` = panjang animasi adegan. Durasi adegan akhir =
 * maks(minimumDetik, awal narasi + panjang narasi + ekor).
 */
export const naskah = [
  {
    id: '01',
    judul: 'Pembuka',
    minimumDetik: 12,
    kalimat: [
      { teks: 'Bertani itu bisa untung.' },
      { teks: 'Asal tahu apa yang ditanam, berapa modalnya, dan siapa pembelinya.' },
      { teks: 'Inilah Tani Muda.', jeda: 0.55 },
    ],
  },
  {
    id: '02',
    judul: 'Data',
    minimumDetik: 15,
    kalimat: [
      {
        teks: 'Menurut Sensus Pertanian 2023, petani berumur 19 sampai 39 tahun cuma 21,93 persen.',
        ucap: 'Menurut Sensus Pertanian dua ribu dua puluh tiga, petani berumur sembilan belas sampai tiga puluh sembilan tahun, cuma dua puluh satu koma sembilan tiga persen.',
      },
      { teks: 'Sekitar satu dari lima.', jeda: 0.5, laju: '-10%' },
      { teks: 'Padahal, bonus demografi ada di tangan anak muda.' },
    ],
  },
  {
    id: '03',
    judul: 'Masalah',
    minimumDetik: 18,
    kalimat: [
      { teks: 'Kenapa anak muda ragu bertani?' },
      { teks: 'Harga jatuh pas panen raya.', jeda: 0.45 },
      { teks: 'Hama datang, tapi tidak tahu cara menanganinya.' },
      { teks: 'Hasil panen lewat banyak tangan sebelum sampai ke pembeli.' },
      { teks: 'Dan sering, panennya belum ada yang beli.', jeda: 0.5 },
    ],
  },
  {
    id: '04',
    judul: 'Solusi',
    minimumDetik: 13,
    kalimat: [
      { teks: 'Tani Muda menemani dalam satu siklus.' },
      { teks: 'Belajar caranya, hitung modalnya, rawat tanamannya, lalu jual hasilnya.', laju: '-8%' },
    ],
  },
  {
    id: '05',
    judul: 'Hitung',
    minimumDetik: 22,
    kalimat: [
      { teks: 'Pilih tanaman yang cocok di daerahmu.' },
      { teks: 'Masukkan luas lahan, dan Tani Muda menghitung modal, perkiraan untung, dan titik impasnya.' },
      { teks: 'Kalau rencananya berpotensi rugi, ada saran supaya untungnya naik.' },
      { teks: 'Jadi kamu tahu hitungannya sebelum mulai menanam.' },
    ],
  },
  {
    id: '06',
    judul: 'Rawat',
    minimumDetik: 19,
    kalimat: [
      { teks: 'Setelah menanam, Beranda menunjukkan umur tanaman hari ini dan tugas yang perlu dikerjakan.' },
      { teks: 'Tandai yang sudah selesai.' },
      {
        teks: 'Cek pH air pakai kertas pH, masukkan angkanya, dan dapat saran yang jelas.',
        ucap: 'Cek pe ha air pakai kertas pe ha, masukkan angkanya, dan dapat saran yang jelas.',
      },
    ],
  },
  {
    id: '07',
    judul: 'Jual',
    minimumDetik: 27,
    kalimat: [
      { teks: 'Bagian terpentingnya: pembeli memesan sebelum panen, dan membayar uang muka.' },
      { teks: 'Uangnya ditahan dulu dengan aman.' },
      { teks: 'Petani mengambil pesanan itu, merawat tanamannya, lalu mengirim hasil panen.' },
      { teks: 'Begitu pembeli mengonfirmasi kiriman, dana cair ke petani.' },
      { teks: 'Tanam dengan pembeli yang pasti.', jeda: 0.65, laju: '-10%' },
    ],
  },
  {
    id: '08',
    judul: 'Fitur pintar',
    minimumDetik: 22,
    kalimat: [
      { teks: 'Ada juga bantuan sehari-hari.' },
      { teks: 'Foto daun yang sakit untuk melihat dugaan penyakitnya, lalu tanyakan ke penyuluh.' },
      { teks: 'Tanya soal budidaya ke asisten, dan ngobrol langsung dengan pembeli.' },
      { teks: 'Lihat prakiraan cuaca di kebunmu.' },
      { teks: 'Temukan petani lain di sekitarmu, tanpa membuka lokasi persis.' },
      { teks: 'Dan tawarkan stok yang siap jual.' },
    ],
  },
  {
    id: '09',
    judul: 'Bertahan',
    minimumDetik: 13,
    kalimat: [
      { teks: 'Makin rajin merawat, levelmu naik, dari Benih sampai Panen Raya.' },
      { teks: 'Setiap pencapaian dapat lencana, dari tanam pertama sampai pembeli setia.' },
    ],
  },
  {
    id: '10',
    judul: 'Penutup',
    minimumDetik: 9,
    kalimat: [
      { teks: 'Tani Muda.', laju: '-10%' },
      {
        teks: 'Aplikasi kepemudaan menyongsong bonus demografi, menuju Generasi Emas 2045.',
        ucap: 'Aplikasi kepemudaan, menyongsong bonus demografi, menuju Generasi Emas dua ribu empat puluh lima.',
        jeda: 0.45,
      },
    ],
  },
];

/** Narasi mulai sekian detik setelah adegan dimulai (setelah sapuan transisi). */
export const AWAL_NARASI_DETIK = 0.5;
/** Ruang kosong setelah narasi selesai sebelum adegan berikutnya. */
export const EKOR_DETIK = 0.8;
export const FPS = 30;
export const BATAS_DETIK = 180;
