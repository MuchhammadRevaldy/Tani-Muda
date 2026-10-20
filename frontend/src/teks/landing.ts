/**
 * Teks halaman depan (papan 01, T4.32). Angka (modal, titik impas, persen uang muka, jam periksa,
 * hari kembali uang muka) tidak ditulis di sini: dikirim sebagai argumen dari konfigurasi dan fungsi
 * src/lib (D-08).
 */
import { formatDesimal, formatRupiah } from '../lib/format';

const formatAngka = (n: number) => formatDesimal(n, 1);

export const teksLanding = {
  masuk: 'Masuk',
  bukaAplikasi: 'Buka aplikasi',

  // ---- navbar dan tombol penyusur [AG-54]
  navBagian: 'Bagian halaman depan',
  bukaMenu: 'Buka menu',
  tutupMenu: 'Tutup menu',
  bagian: {
    masalah: 'Masalah',
    siklus: 'Siklus',
    caraKerja: 'Cara kerja',
    fitur: 'Fitur',
    pembeli: 'Pembeli',
    tanyaJawab: 'Tanya jawab',
  },
  lihatCaraKerja: 'Lihat cara kerjanya',
  kembaliKeAtas: 'Kembali ke atas',

  // ---- hero
  sapaan: 'Untuk petani muda, dari sayur kebun sampai padi sawah',
  judul: 'Bertani itu bisa untung, asal direncanakan.',
  isi: 'Mau menanam sawi di pekarangan atau padi di sawah, Tani Muda menemanimu belajar menanam, menghitung modal, merawat tanaman dengan pengingat, sampai menjual panen ke katering, restoran, dan koperasi yang sudah memesan sebelum kamu menanam.',
  mulaiPetani: 'Mulai sebagai petani',
  sayaPembeli: 'Saya pembeli',

  // ---- kartu contoh siklus
  contohPerhitungan: 'Contoh perhitungan',
  judulContoh: (komoditas: string) => `${komoditas} · Petak 1`,
  ketContoh: (umur: number, luas: number) =>
    `Contoh siklus ${umur} hari di lahan ${formatAngka(luas)} m², dari tanam sampai panen`,
  ketContohPendek: (umur: number, luas: number) =>
    `Contoh siklus ${umur} hari di lahan ${formatAngka(luas)} m²`,
  modal: 'Modal',
  perkiraanUntung: 'Perkiraan untung',
  kalauPanen: (kg: number) => `Kalau panen ${formatAngka(kg)} kg`,
  // ---- hero (D-59): ringkasan contoh di samping ilustrasi
  ringkasContoh: (komoditas: string, luas: number) =>
    `${komoditas.toLowerCase()} ${formatAngka(luas)} m²`,
  panen: 'Panen',
  hariKe: (n: number) => `Hari ke-${n}`,
  titikImpas: 'Titik impas',
  kg: (n: number) => `${formatAngka(n)} kg`,
  besok: (judul: string) => `Besok: ${judul.toLowerCase()}`,

  // ---- masalah [AG-54]: angka dan empat masalah dari PRD bagian Latar Belakang Masalah
  sapaanMasalah: 'Kenapa Tani Muda ada',
  judulMasalah: 'Petani muda makin sedikit',
  angkaMasalah: 21.93,
  ketAngkaMasalah: 'petani di Indonesia berusia 19–39 tahun',
  sumberAngkaMasalah: 'Sumber: Sensus Pertanian 2023, BPS',
  ketMasalah: 'Anak muda enggan bertani karena empat ketidakpastian sekaligus.',
  masalah: [
    {
      judul: 'Pengetahuan terbatas',
      isi: 'Penyuluhan jarang menjangkau anak muda yang terbiasa belajar lewat HP, jadi pemula menanam dengan coba-coba.',
    },
    {
      judul: 'Modal tidak terukur',
      isi: 'Pemula tidak tahu berapa benih dan pupuk yang dibutuhkan lahannya, dan berapa total biayanya.',
    },
    {
      judul: 'Jadwal perawatan terlupa',
      isi: 'Pupuk susulan dan cek hama punya hari yang pasti. Terlambat sedikit bisa menurunkan hasil.',
    },
    {
      judul: 'Pasar tidak pasti',
      isi: 'Penjualan bergantung pada tengkulak, sehingga bagian harga yang diterima petani kecil.',
    },
  ],

  // ---- siklus Tani Muda (menggantikan tiga pilar) [AG-54]
  sapaanSiklus: 'Siklus Tani Muda',
  judulPilar: 'Satu aplikasi dari sayur kebun sampai padi sawah',
  ketPilar:
    'Empat langkah yang paling sering membuat petani muda ragu memulai, ditemani satu per satu, untuk pekarangan, kebun, maupun sawah.',
  rawat: 'Rawat',
  isiRawat:
    'Begitu tanggal tanam diisi, jadwal tugas dibuat dari resep. Pengingat pupuk, siram, dan cek hama datang tepat pada harinya, dan hasil ukur langsung jadi saran.',
  belajar: 'Belajar',
  isiBelajar:
    'Modul video sekitar 3 menit untuk tiap tahap, dari persiapan lahan sampai pascapanen, untuk sayur di pekarangan maupun padi di sawah. Unduh sekali, tonton tanpa sinyal.',
  contohModul: 'Padi sawah · Tanam pindah',
  ketModul: '3 menit · bisa disimpan untuk ditonton offline',
  hitung: 'Hitung',
  isiHitung:
    'Kalkulator modal menunjukkan titik impas sebelum menanam, dalam kg sayur atau kg gabah.',
  barisHitung: (komoditas: string, luas: number) => `${komoditas} · ${formatAngka(luas)} m²`,
  tanpaSubsidi: 'Dihitung dengan harga tanpa subsidi',
  modalImpas: (modal: number, impas: number, satuan: string) =>
    ({ modal: formatRupiah(modal), impas: `impas di ${formatAngka(impas)} ${satuan}` }) as const,
  jual: 'Jual',
  isiJual:
    'Pesan Sebelum Tanam: katering memesan sayur tiap minggu, koperasi memesan gabah untuk sekali panen. Uang muka dibayar dulu, jadi kamu menanam untuk pembeli yang sudah pasti.',
  ketPembeliRutin: (komoditas: string, kg: number) =>
    `Rutin · ${komoditas.toLowerCase()} ${formatAngka(kg)} kg per minggu`,
  ketPembeliSekali: (kg: number) =>
    `Sekali panen · gabah ${kg >= 1000 ? `${formatAngka(kg / 1000)} ton` : `${formatAngka(kg)} kg`}`,
  uangMukaDitahan: 'Uang muka ditahan',
  labelIlustrasi: 'Ilustrasi',

  // ---- cara kerja
  sapaanCara: 'Cara kerja Pesan Sebelum Tanam',
  judulCara: 'Pembeli pasti dulu, baru menanam',
  langkahKe: (n: number) => `Langkah ${n}`,
  langkah: (persenUangMuka: number, jamPeriksa: number) => [
    {
      judul: 'Pembeli memesan',
      isi: 'Katering atau restoran memilih sayur, jumlah per minggu, harga, dan lama pesanan.',
    },
    {
      judul: 'Uang muka ditahan',
      isi: `Pembeli membayar uang muka ${persenUangMuka}%. Tani Muda menahannya sampai sayur diterima.`,
    },
    {
      judul: 'Petani menanam dengan pengingat',
      isi: 'Petani mengambil pesanan sesuai kemampuan lahannya, lalu merawat tanaman dengan pengingat harian.',
    },
    {
      judul: 'Panen dikirim',
      isi: 'Sebelum berangkat, petani mengunggah foto kualitas. Pembeli memeriksa saat sayur tiba.',
    },
    {
      judul: 'Dana cair',
      isi: `Setelah pembeli konfirmasi, dana cair ke petani. Paling lama ${jamPeriksa} jam setelah sayur tiba.`,
    },
  ],

  // ---- fitur pendukung [AG-54]
  sapaanFitur: 'Fitur pendukung',
  judulFitur: 'Teman di setiap tahap tanam',
  fitur: {
    deteksi: {
      judul: 'Deteksi dugaan penyakit',
      isi: 'Foto daun yang sakit, lalu dapatkan dugaan penyakit dengan tingkat keyakinan dan langkah aman. Masih ragu, tanya penyuluh.',
    },
    asisten: {
      judul: 'Asisten budidaya',
      isi: 'Tanya Tani Muda menjawab singkat dari resep dan modul, lengkap dengan sumbernya.',
    },
    cuaca: {
      judul: 'Cuaca di desamu',
      isi: 'Suhu hari ini dari titik tengah desa, dicocokkan dengan kebutuhan tanamanmu.',
    },
    peta: {
      judul: 'Petani di sekitar',
      isi: 'Pembeli menemukan petani terdekat di peta. Hanya petani yang menyalakannya yang tampil.',
      ket: 'Lokasi dibulatkan sekitar 1 km, titik lahan tidak pernah dikirim.',
    },
    stok: {
      judul: 'Stok siap jual',
      isi: 'Panen yang sudah ada bisa dijual ke pembeli terdekat, bayar di tempat atau di aplikasi.',
    },
    chat: {
      judul: 'Chat petani dan pembeli',
      isi: 'Bicarakan pesanan dan kiriman langsung di aplikasi. Hanya peserta percakapan yang bisa membacanya.',
    },
    level: {
      judul: 'Level dan lencana',
      isi: 'Setiap tugas yang selesai menambah poin, dari level benih sampai panen raya.',
    },
  },

  // ---- pembeli
  sapaanPembeli: 'Untuk katering dan restoran',
  judulPembeli: 'Pasokan sayur segar dari petani lokal, dengan jadwal dan harga yang pasti',
  keunggulan: [
    'Harga per kg tetap selama pesanan berjalan.',
    'Pantau umur tanam di kebun petani sampai hari panen.',
    'Uang muka ditahan, dana cair hanya setelah sayur diterima.',
    'Bagian yang tidak sesuai standar boleh ditolak dengan foto.',
  ],
  kartuPembeliJudul: (komoditas: string, kg: number) =>
    `${komoditas} · ${formatAngka(kg)} kg per minggu`,
  kartuPembeliKet: 'Kebun Sekar, Cikole · contoh kebun pemenuh',
  daftarPembeli: 'Daftar sebagai pembeli',

  // ---- tanya jawab
  judulFaq: 'Tanya jawab',
  ketFaq: 'Pertanyaan yang paling sering muncul sebelum mulai.',
  faq: (hariKembali: number, hariKabar: number) => [
    {
      tanya: 'Apakah uang muka saya aman?',
      jawab: `Uang muka ditahan Tani Muda, tidak langsung diberikan ke petani. Dana baru cair setelah sayur diterima dan dikonfirmasi pembeli. Kalau tidak ada petani yang mengambil pesanan dalam ${hariKembali} hari, uang muka kembali utuh.`,
    },
    {
      tanya: 'Bagaimana kalau gagal panen?',
      jawab: `Petani mengabari paling lambat ${hariKabar} hari sebelum jadwal kirim, tanpa denda. Bagian yang tidak terpenuhi ditawarkan ke petani lain; kalau tidak ada pengganti, sisa uang muka bagian itu dikembalikan ke pembeli.`,
    },
    {
      tanya: 'Apakah harus punya lahan luas?',
      jawab:
        'Tidak. Mulai dari pekarangan beberapa meter persegi atau rak hidroponik di teras. Kalkulator menghitung modal dan kemampuan lahanmu, dan kamu boleh mengambil sebagian pesanan saja.',
    },
  ],

  // ---- ajakan penutup [AG-54]
  judulAjakan: 'Siap menanam dengan rencana?',
  isiAjakan: 'Daftar cukup dengan nomor HP, tanpa kata sandi.',

  // ---- kaki
  slogan: 'Dibuat untuk petani muda Indonesia menuju Generasi Emas 2045.',
} as const;
