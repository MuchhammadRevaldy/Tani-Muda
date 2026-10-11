/**
 * Teks halaman statis (T4.37): aturan pakai, kebijakan privasi, tentang, kontak, bantuan. Isinya
 * DRAF yang menunggu peninjauan ahli hukum (Pertanyaan Terbuka 13) dan wajib tampil dengan label
 * draf. Angka aturan (persen uang muka, jam periksa, batas kabar gagal panen) dari konfigurasi.
 */

export interface AngkaAturan {
  persenUangMuka: number;
  persenLayanan: number;
  jamPeriksaRutin: number;
  jamPeriksaSekaliPanen: number;
  hariKabarGagalPanen: number;
  hariKembaliUangMuka: number;
}

export interface Bagian {
  judul: string;
  butir: string[];
}

export const teksStatis = {
  labelDraf: 'Draf, belum ditinjau ahli hukum',
  kembaliKeAwal: 'Halaman awal',
  navKaki: 'Informasi Tani Muda',
  diperbarui: (tanggal: string) => `Terakhir diperbarui ${tanggal}`,
  tautanKaki: {
    tentang: 'Tentang Tani Muda',
    kontak: 'Kontak',
    privasi: 'Kebijakan privasi',
    aturanPakai: 'Aturan pakai',
    bantuan: 'Bantuan',
  },

  aturanPakai: {
    judul: 'Aturan pakai',
    pengantar:
      'Aturan ini berlaku untuk semua pengguna Tani Muda: petani, pembeli, dan penyuluh. Dengan masuk, kamu setuju mengikutinya.',
    bagian: (a: AngkaAturan): Bagian[] => [
      {
        judul: 'Akun',
        butir: [
          'Satu nomor HP untuk satu akun. Masuk memakai kode SMS, tanpa kata sandi.',
          'Jaga kode SMS-mu. Tim Tani Muda tidak pernah meminta kode itu.',
          'Data diri dan desa harus benar, karena dipakai untuk mencarikan pembeli di sekitarmu.',
        ],
      },
      {
        judul: 'Resep dan angka hitungan',
        butir: [
          'Angka modal, titik impas, dan perkiraan panen adalah perkiraan dari resep, bukan janji hasil.',
          'Resep berlabel CONTOH belum divalidasi penyuluh. Pakai sebagai gambaran, bukan pedoman pasti.',
        ],
      },
      {
        judul: 'Pesan Sebelum Tanam',
        butir: [
          `Pembeli membayar uang muka ${a.persenUangMuka}% saat memasang pesanan. Uang muka ditahan Tani Muda sampai sayur diterima.`,
          `Kalau tidak ada petani yang mengambil pesanan dalam ${a.hariKembaliUangMuka} hari, uang muka kembali utuh ke pembeli.`,
          `Pembeli memeriksa kiriman paling lama ${a.jamPeriksaRutin} jam untuk pesanan rutin dan ${a.jamPeriksaSekaliPanen} jam untuk sekali panen. Lewat dari itu, kiriman dianggap diterima.`,
          'Bagian yang tidak sesuai standar boleh ditolak dengan foto dan alasan. Admin memutuskan bila ada perselisihan.',
          `Petani yang tidak sanggup mengirim wajib mengabari paling lambat ${a.hariKabarGagalPanen} hari sebelum jadwal kirim. Tidak ada denda.`,
          'Petani yang tidak memberi kabar mendapat catatan di profil dan bisa dinonaktifkan sementara oleh admin.',
          `Pembeli membayar biaya layanan ${a.persenLayanan}% dari nilai pesanan. Biaya ini tidak memotong bagian petani.`,
        ],
      },
      {
        judul: 'Foto dan isi',
        butir: [
          'Foto kualitas dan timbangan harus foto asli kiriman itu.',
          'Dilarang mengunggah isi yang menyesatkan, menyinggung, atau milik orang lain tanpa izin.',
        ],
      },
      {
        judul: 'Masa uji coba',
        butir: [
          'Selama uji coba, pembayaran berjalan dalam mode uji coba dan tidak memindahkan uang sungguhan.',
          'Aturan ini bisa berubah. Perubahan penting diberitahukan lewat aplikasi.',
        ],
      },
    ],
  },

  tentang: {
    judul: 'Tentang Tani Muda',
    pengantar:
      'Tani Muda adalah aplikasi pendamping untuk petani muda Indonesia, dari sayur di pekarangan sampai padi di sawah.',
    bagian: [
      {
        judul: 'Tiga pilar',
        butir: [
          'Belajar: modul video singkat untuk tiap tahap tanam, bisa diunduh untuk ditonton tanpa sinyal.',
          'Hitung: kalkulator modal dan titik impas sebelum menanam, lalu jadwal dan pengingat perawatan.',
          'Jual: Pesan Sebelum Tanam, pembeli memesan dan membayar uang muka sebelum petani menanam.',
        ],
      },
      {
        judul: 'Masih uji coba',
        butir: [
          'Tani Muda sedang diuji coba bersama petani dan pembeli di daerah pilot.',
          'Resep yang berlabel CONTOH masih menunggu validasi penyuluh pertanian.',
        ],
      },
    ] satisfies Bagian[],
  },

  kontak: {
    judul: 'Kontak',
    pengantar: 'Ada pertanyaan, kendala pesanan, atau ingin datamu dihapus? Hubungi tim Tani Muda.',
    whatsapp: 'WhatsApp admin',
    jamLayanan: 'Jam layanan',
    bukaWhatsapp: 'Kirim pesan WhatsApp',
    pesanAwal: 'Halo tim Tani Muda, saya ingin bertanya tentang',
    catatan:
      'Jangan kirim kode SMS atau data pembayaranmu lewat WhatsApp. Tim Tani Muda tidak pernah memintanya.',
  },

  bantuan: {
    judul: 'Pusat bantuan',
    pengantar: 'Jawaban singkat untuk pertanyaan yang paling sering muncul.',
    petani: 'Untuk petani',
    pembeli: 'Untuk pembeli',
    masihBingung: 'Belum terjawab?',
    hubungi: 'Hubungi tim Tani Muda',
    faqPetani: (a: AngkaAturan) => [
      {
        tanya: 'Bagaimana cara mulai menanam?',
        jawab:
          'Di Beranda, pilih Buat siklus baru, lalu pilih tanaman, cara tanam, dan ukuran lahan. Simpan rencananya, dan jadwal perawatan dibuat otomatis.',
      },
      {
        tanya: 'Kenapa angka modal berbeda dengan harga di toko?',
        jawab:
          'Harga di kalkulator dari harga contoh atau laporan petani sekitar. Kamu bisa mengganti harga tiap bahan sesuai yang kamu beli.',
      },
      {
        tanya: 'Kapan dana kiriman cair?',
        jawab: `Setelah pembeli mengonfirmasi kiriman, atau otomatis ${a.jamPeriksaRutin} jam setelah sayur tiba untuk pesanan rutin.`,
      },
      {
        tanya: 'Bagaimana kalau saya tidak sanggup mengirim?',
        jawab: `Buka Kiriman saya, pilih kirimannya, lalu Kabari tidak sanggup kirim. Kabari paling lambat ${a.hariKabarGagalPanen} hari sebelum jadwal kirim.`,
      },
    ],
    faqPembeli: (a: AngkaAturan) => [
      {
        tanya: 'Kenapa harus membayar uang muka?',
        jawab: `Uang muka ${a.persenUangMuka}% memberi kepastian bagi petani untuk menanam. Uang ditahan Tani Muda, bukan langsung diberikan ke petani.`,
      },
      {
        tanya: 'Bagaimana kalau sayur yang datang tidak sesuai?',
        jawab: `Saat memeriksa kiriman, tolak bagian yang tidak sesuai dengan foto dan alasan. Batas periksa ${a.jamPeriksaRutin} jam untuk pesanan rutin.`,
      },
      {
        tanya: 'Berapa lama data usaha saya diperiksa?',
        jawab:
          'Admin memeriksa data usaha pada jam layanan. Setelah terverifikasi, kamu bisa memasang pesanan.',
      },
    ],
  },
} as const;
