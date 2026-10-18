/**
 * Naskah narasi teaser Tani Muda, sumber teks 35 kalimat [AG-45].
 * Suaranya dari rekaman pemilik produk (record-voiceover.mpeg); waktu tiap kalimat
 * dicari dengan whisper (scripts/selaraskan-narasi.mjs).
 *
 * - `teks`    : kalimat di naskah.
 * - `subtitel`: teks subtitel bila ucapan di rekaman berbeda dari naskah.
 */
export const naskah = [
  {
    id: '01',
    judul: 'Pembuka',
    kalimat: [
      { teks: 'Bertani itu bisa untung.' },
      { teks: 'Asal tahu apa yang ditanam, berapa modalnya, dan siapa pembelinya.' },
      { teks: 'Inilah Tani Muda.' },
    ],
  },
  {
    id: '02',
    judul: 'Data',
    kalimat: [
      {
        teks: 'Menurut Sensus Pertanian 2023, petani berumur 19 sampai 39 tahun cuma 21,93 persen.',
      },
      { teks: 'Sekitar satu dari lima.' },
      { teks: 'Padahal, bonus demografi ada di tangan anak muda.' },
    ],
  },
  {
    id: '03',
    judul: 'Masalah',
    kalimat: [
      { teks: 'Kenapa anak muda ragu bertani?' },
      { teks: 'Harga jatuh pas panen raya.' },
      { teks: 'Hama datang, tapi tidak tahu cara menanganinya.' },
      { teks: 'Hasil panen lewat banyak tangan sebelum sampai ke pembeli.' },
      { teks: 'Dan sering, panennya belum ada yang beli.' },
    ],
  },
  {
    id: '04',
    judul: 'Solusi',
    kalimat: [
      { teks: 'Tani Muda menemani dalam satu siklus.' },
      { teks: 'Belajar caranya, hitung modalnya, rawat tanamannya, lalu jual hasilnya.' },
    ],
  },
  {
    id: '05',
    judul: 'Hitung',
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
    kalimat: [
      { teks: 'Setelah menanam, Beranda menunjukkan umur tanaman hari ini dan tugas yang perlu dikerjakan.' },
      { teks: 'Tandai yang sudah selesai.' },
      {
        teks: 'Cek pH air pakai kertas pH, masukkan angkanya, dan dapat saran yang jelas.',
      },
    ],
  },
  {
    id: '07',
    judul: 'Jual',
    kalimat: [
      { teks: 'Bagian terpentingnya: pembeli memesan sebelum panen, dan membayar uang muka.' },
      { teks: 'Uangnya ditahan dulu dengan aman.' },
      { teks: 'Petani mengambil pesanan itu, merawat tanamannya, lalu mengirim hasil panen.' },
      { teks: 'Begitu pembeli mengonfirmasi kiriman, dana cair ke petani.' },
      { teks: 'Tanam dengan pembeli yang pasti.' },
    ],
  },
  {
    id: '08',
    judul: 'Fitur pintar',
    kalimat: [
      { teks: 'Ada juga bantuan sehari-hari.' },
      { teks: 'Foto daun yang sakit untuk melihat dugaan penyakitnya, lalu tanyakan ke penyuluh.' },
      { teks: 'Tanya soal budidaya ke asisten, dan ngobrol langsung dengan pembeli.' },
      // Diucapkan "perkiraan" di rekaman; subtitel mengikuti ucapan [AG-45].
      { teks: 'Lihat prakiraan cuaca di kebunmu.', subtitel: 'Lihat perkiraan cuaca di kebunmu.' },
      { teks: 'Temukan petani lain di sekitarmu, tanpa membuka lokasi persis.' },
      { teks: 'Dan tawarkan stok yang siap jual.' },
    ],
  },
  {
    id: '09',
    judul: 'Bertahan',
    kalimat: [
      { teks: 'Makin rajin merawat, levelmu naik, dari Benih sampai Panen Raya.' },
      { teks: 'Setiap pencapaian dapat lencana, dari tanam pertama sampai pembeli setia.' },
    ],
  },
  {
    id: '10',
    judul: 'Penutup',
    kalimat: [
      { teks: 'Tani Muda.' },
      {
        teks: 'Aplikasi kepemudaan menyongsong bonus demografi, menuju Generasi Emas 2045.',
      },
    ],
  },
];
