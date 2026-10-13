/**
 * Teks Profil petani (papan 34, T4.35) dan Ubah profil (papan 35, T4.36). Tanpa kata sandi, nama
 * pengguna, dan nama kelompok tani (D-04, D-06, D-38).
 */
import { formatDesimal } from '../lib/format';

export const teksProfil = {
  // ---- profil
  kembali: 'Beranda',
  judul: 'Profil',
  sub: 'Atur data diri, kebun, dan pengingat.',
  petaniDi: (desa: string | null) => (desa ? `Petani di ${desa}` : 'Petani'),
  bergabung: (bulan: string) => `bergabung ${bulan}`,
  rating: (rata: number, jumlah: number) =>
    ({ angka: formatDesimal(rata, 1, true), ket: `dari ${jumlah} ulasan pembeli` }) as const,
  belumAdaUlasan: 'Belum ada ulasan pembeli',
  siklusSelesai: 'siklus selesai',
  panenTerjual: 'panen terjual',
  kg: (n: number) => `${formatDesimal(n, 1)} kg`,
  ubahProfil: 'Ubah profil',
  gantiFoto: 'Ganti foto profil',

  akun: 'Akun',
  nama: 'Nama',
  nomorHp: 'Nomor HP',
  ubahNama: 'Ubah nama',
  ubahNomor: 'Ganti nomor HP',

  kebun: 'Kebun',
  desa: 'Desa',
  luasLahan: 'Luas lahan',
  ringkasLahan: (luasM2: number, lubang: number, jumlah: number) =>
    [
      luasM2 > 0 ? `${formatDesimal(luasM2, 1)} m²` : null,
      lubang > 0 ? `${formatDesimal(lubang, 0)} lubang` : null,
      `${jumlah} lahan`,
    ]
      .filter(Boolean)
      .join(' · '),
  belumAdaLahan: 'Belum ada lahan',
  aturLahan: 'Atur lahan',
  komoditas: 'Komoditas',
  belumMenanam: 'Belum ada siklus tanam',
  pupukSubsidi: 'Pupuk subsidi',
  terdaftar: 'Terdaftar di kelompok tani',
  belumTerdaftar: 'Belum terdaftar di kelompok tani',

  catatan: 'Catatan dari admin',
  catatanKet: 'Hanya kamu dan admin yang bisa melihat catatan ini.',

  pengingat: 'Pengingat',
  pengingatKet: 'Jam dan jenis pengingat diatur per siklus.',
  pagiPukul: (jam: string) => `Pagi pukul ${jam.replace(':', '.')}`,
  /** "Pagi pukul 06.00 · sore menyala" (pusat notifikasi dan Profil, [AG-19]). */
  jadwalPengingat: (jam: string, sore: boolean) =>
    `Pagi pukul ${jam.replace(':', '.')} · sore ${sore ? 'menyala' : 'mati'}`,
  tanpaSiklusAktif: 'Pengingat muncul setelah kamu punya siklus aktif.',

  bantuan: 'Bantuan',
  pusatBantuan: 'Pusat bantuan',
  hubungi: 'Hubungi tim Tani Muda',
  aturanPrivasi: 'Aturan pakai dan privasi',
  keluar: 'Keluar',
  mengeluarkan: 'Sedang keluar…',
} as const;

export const teksUbahProfil = {
  kembali: 'Profil',
  judul: 'Ubah profil',
  sub: 'Pembeli melihat foto, nama, dan desamu saat kamu mengambil pesanan.',

  fotoProfil: 'Foto profil',
  fotoDanData: 'Foto dan data diri',
  gantiFoto: 'Ganti foto',
  hapusFoto: 'Hapus foto',
  fotoKet: 'Foto dikecilkan otomatis supaya hemat kuota.',
  mengunggah: 'Mengunggah foto…',
  gagalFoto: 'Foto belum bisa diunggah. Coba lagi saat sinyal bagus.',

  dataDiri: 'Data diri',
  namaLengkap: 'Nama lengkap',
  isiNama: 'Isi nama lengkapmu',
  desa: 'Desa atau kelurahan',
  cariDesa: 'Ketik nama desa',
  desaKet: 'Dipakai untuk mencarikan pembeli di sekitarmu.',
  desaTerpilih: (desa: string) => `Desa terpilih: ${desa}`,
  tidakAdaDesa: 'Desa tidak ditemukan. Coba nama lain.',
  kelompokTani: 'Saya terdaftar di kelompok tani',
  kelompokTaniKet: 'Kalkulator memakai harga pupuk subsidi sebagai pilihan awal.',

  nomorHp: 'Nomor HP',
  gantiNomor: 'Ganti nomor',
  nomorKet: 'Kode SMS dikirim ke nomor baru untuk memastikan nomornya milikmu.',

  pratinjau: 'Pratinjau untuk pembeli',
  pratinjauKet: 'Nomor HP tidak pernah ditampilkan ke pembeli.',
  siklusSelesai: (n: number) => `${n} siklus selesai`,
  simpan: 'Simpan perubahan',
  menyimpan: 'Menyimpan…',
  batal: 'Batal',
  tersimpan: 'Profil tersimpan',
  tidakAdaPerubahan: 'Belum ada yang diubah.',

  // ---- ganti nomor
  dialogJudul: 'Ganti nomor HP',
  dialogKet: 'Masukkan nomor baru. Kode SMS dikirim ke nomor itu.',
  nomorBaru: 'Nomor HP baru',
  contohNomor: '0812 3456 7890',
  kirimKode: 'Kirim kode',
  mengirim: 'Mengirim…',
  kodeTerkirim: (nomor: string) => `Kode dikirim ke ${nomor}.`,
  simpanNomor: 'Simpan nomor baru',
  memeriksa: 'Memeriksa…',
  ubahNomorBaru: 'Ubah nomor baru',
  isiNomorDulu: 'Isi nomor HP baru dulu',
  isiKodeDulu: 'Isi 6 angka kode dulu',
  nomorTersimpan: 'Nomor HP berhasil diganti',
  gagalUmum: 'Belum berhasil. Periksa sinyal lalu coba lagi.',
} as const;

/** Profil pembeli /pembeli/profil ([AG-23]); sapaan "Anda" (D-09). */
export const teksProfilPembeli = {
  judul: 'Profil',
  sub: 'Atur akun dan data usaha Anda.',
  akun: 'Akun',
  ubahProfil: 'Ubah profil',
  dataUsaha: 'Data usaha',
  namaUsaha: 'Nama usaha',
  jenisUsaha: 'Jenis usaha',
  alamat: 'Alamat',
  desa: 'Desa',
  statusVerifikasi: 'Status verifikasi',
  ubahDataUsaha: 'Ubah data usaha',
  rating: 'Penilaian dari petani',
  ratingNilai: (rata: number, jumlah: number) =>
    ({ angka: formatDesimal(rata, 1, true), ket: `dari 5 · ${jumlah} ulasan petani` }) as const,
  belumAdaRating: 'Belum ada penilaian dari petani.',
} as const;

/** Teks Ubah profil versi pembeli: sapaan "Anda" (D-09), tanpa desa dan kelompok tani. */
export const teksUbahProfilPembeli = {
  ...teksUbahProfil,
  sub: 'Nama dan foto tampil untuk petani yang memenuhi pesanan Anda. Desa usaha diatur di Data usaha.',
  isiNama: 'Isi nama lengkap Anda',
  nomorKet: 'Kode SMS dikirim ke nomor baru untuk memastikan nomornya milik Anda.',
} as const;
