/**
 * Teks sisi pembeli (papan 36–38, halaman turunan 44 dan 48–51; T4.22–T4.28, T4.41). Pembeli
 * disapa "Anda" seperti di papan pembeli.
 */
import type {
  AlasanPenolakan,
  JenisPembayaran,
  JenisUsaha,
  StatusPembayaran,
  StatusPesanan,
  StatusVerifikasi,
} from '../api/tipe';
import { formatBulan, formatRupiah } from '../lib/format';
import { angkaJarak } from '../lib/jarak';
import { jamAntar, kg, teksFrekuensiKirim } from './pesanan';

const JENIS_BAYAR: Record<JenisPembayaran, string> = {
  uang_muka: 'Uang muka',
  biaya_layanan: 'Biaya layanan',
  kiriman: 'Pembayaran kiriman',
  pencairan: 'Dana cair ke petani',
  pengembalian: 'Dikembalikan ke Anda',
  kompensasi: 'Kompensasi untuk petani',
};

const STATUS_BAYAR: Record<StatusPembayaran, string> = {
  menunggu: 'Menunggu',
  ditahan: 'Ditahan',
  cair: 'Cair',
  dikembalikan: 'Dikembalikan',
  gagal: 'Gagal',
};

const STATUS_PESANAN: Record<StatusPesanan, string> = {
  menunggu_pembayaran: 'Belum dibayar',
  mencari_petani: 'Mencari petani',
  berjalan: 'Berjalan',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

const STATUS_VERIFIKASI: Record<StatusVerifikasi, string> = {
  menunggu: 'Menunggu verifikasi',
  terverifikasi: 'Terverifikasi',
  ditolak: 'Ditolak',
};

const JENIS_USAHA: Record<JenisUsaha, string> = {
  katering: 'Katering',
  restoran: 'Restoran',
  warung: 'Warung makan',
  koperasi: 'Koperasi',
  penggilingan: 'Penggilingan padi',
  lainnya: 'Usaha lain',
};

/** Pilihan alasan penolakan (D-14): empat pilihan, "Lainnya" wajib keterangan. */
const ALASAN: Record<AlasanPenolakan, string> = {
  layu_atau_busuk: 'Layu atau busuk',
  jumlah_kurang: 'Jumlah kurang',
  tidak_sesuai_standar: 'Tidak sesuai standar',
  lainnya: 'Lainnya',
};

export const teksPembeli = {
  jenisBayar: (j: JenisPembayaran) => JENIS_BAYAR[j],
  statusBayar: (s: StatusPembayaran) => STATUS_BAYAR[s],
  statusPesanan: (s: StatusPesanan) => STATUS_PESANAN[s],
  statusVerifikasi: (s: StatusVerifikasi) => STATUS_VERIFIKASI[s],
  jenisUsaha: (j: JenisUsaha) => JENIS_USAHA[j],
  alasan: (a: AlasanPenolakan) => ALASAN[a],
  modeUjiCoba: 'Mode uji coba',
  kembaliDasbor: 'Pesanan aktif',

  // ---- dasbor (papan 36)
  judulDasbor: 'Pesanan aktif',
  ketDasbor: (tanggal: string, pesanan: number, kebun: number) =>
    `${tanggal} · ${pesanan} pesanan, ${kebun} kebun`,
  buatPesanan: 'Buat pesanan',
  kirimanTiba: (komoditas: string, petani: string) =>
    `Kiriman ${komoditas} dari ${petani} sudah tiba`,
  kirimanTibaKet: (jam: string, jumlah: number, batas: string) =>
    `Tiba ${jam}, ${kg(jumlah)} kg. Periksa sebelum ${batas}. Lewat dari itu, kiriman dianggap diterima semua.`,
  periksaKiriman: 'Periksa kiriman',
  judulRutin: (komoditas: string, jumlah: number, frek: number) =>
    `${komoditas} · ${kg(jumlah)} kg ${teksFrekuensiKirim(frek)}`,
  judulSekali: (komoditas: string, jumlah: number) =>
    `${komoditas} · ${kg(jumlah)} kg sekali panen`,
  subRutin: (ke: number | null, n: number, hari: string, harga: number, jam: string | null) =>
    [
      ke ? `Kiriman berikutnya ke-${ke} dari ${n}` : `${n} kiriman`,
      `setiap ${hari}${jam ? ` sebelum ${jamAntar(jam)}` : ''}`,
      `${formatRupiah(harga)}/kg`,
    ].join(' · '),
  subSekali: (bulan: string | null, harga: number) =>
    [
      bulan ? `Sekali kirim, sekitar ${formatBulan(bulan, { denganTahun: true })}` : 'Sekali kirim',
      `${formatRupiah(harga)}/kg`,
    ].join(' · '),
  kebunPetani: (petani: string, desa: string) => `Kebun ${petani} · ${desa}`,
  kebunKet: (jumlah: number, frek: number | null, km: number) =>
    `${kg(jumlah)} kg${frek ? ` ${teksFrekuensiKirim(frek)}` : ''} · ${angkaJarak(km)} km dari titik antar`,
  hariKeDari: (hari: number, panen: number) => `Hari ke-${hari} dari ${panen}`,
  panenSekitar: (tanggal: string) => `perkiraan panen ${tanggal}`,
  belumTanam: (tanggal: string) => `Mulai tanam ${tanggal}`,
  fotoKebun: (petani: string) => `Foto terbaru dari kebun ${petani}`,
  belumAdaPetani: (jumlah: string) => `${jumlah} lagi belum ada petani`,
  belumAdaPetaniKet: (hari: number) =>
    `Tawaran Anda terlihat oleh petani di sekitar titik antar. Kalau tidak ada petani dalam ${hari} hari, uang muka bagian ini kembali utuh.`,
  menungguPetani: 'Menunggu petani',
  menungguPetaniKet:
    'Tawaran Anda sudah terlihat oleh petani di sekitar titik antar. Kebun yang mengambil pesanan ini muncul di sini.',
  uangAnda: 'Uang Anda',
  uangAndaKet: 'Ditahan Tani Muda sampai hasil panen Anda terima',
  uangMukaDitahan: 'Uang muka ditahan',
  sudahCair: 'Sudah cair ke petani',
  kirimanBerikutnya: 'Kiriman berikutnya',
  kirimanBerikutnyaIsi: (komoditas: string, jumlah: number, petani: string) =>
    `${komoditas} ${kg(jumlah)} kg · ${petani}`,
  belumAdaKiriman: 'Belum ada kiriman terjadwal.',
  belumAdaPesanan: 'Belum ada pesanan aktif',
  belumAdaPesananKet:
    'Pasang pesanan sebelum tanam: petani di sekitar dapur Anda menanam khusus untuk pesanan ini.',
  belumDibayar: 'Belum dibayar',
  belumDibayarKet: 'Petani baru bisa melihat pesanan ini setelah uang muka dibayar.',
  bayarUangMuka: (rp: number) => `Bayar uang muka ${formatRupiah(rp)}`,
  batalkan: 'Batalkan pesanan',
  batalkanJudul: 'Batalkan pesanan ini?',
  batalkanIsi:
    'Kalau petani belum mulai menanam, uang muka kembali ke Anda. Kalau petani sudah menanam, uang muka menjadi kompensasi untuk petani.',
  yaBatalkan: 'Ya, batalkan',
  tidakJadi: 'Tidak jadi',
  membatalkan: 'Membatalkan…',
  sudahDibatalkan: (kembali: number, kompensasi: number) =>
    kompensasi > 0
      ? `Pesanan dibatalkan. ${formatRupiah(kompensasi)} menjadi kompensasi untuk petani.`
      : kembali > 0
        ? `Pesanan dibatalkan. ${formatRupiah(kembali)} dikembalikan ke Anda.`
        : 'Pesanan dibatalkan.',

  // ---- verifikasi dan daftar usaha (T4.28)
  statusVerifikasiKet: {
    menunggu:
      'Admin sedang memeriksa data usaha Anda. Sambil menunggu, Anda bisa melihat aplikasi, tetapi belum bisa memasang pesanan.',
    terverifikasi: 'Data usaha Anda sudah diperiksa. Anda bisa memasang pesanan.',
    ditolak: 'Data usaha Anda belum bisa diterima. Perbaiki datanya lalu kirim lagi.',
  } satisfies Record<StatusVerifikasi, string>,
  alasanDitolak: (a: string) => `Alasan: ${a}`,
  perbaikiData: 'Perbaiki data usaha',
  daftarJudul: 'Data usaha Anda',
  daftarKet:
    'Admin memeriksa data ini sebelum Anda bisa memasang pesanan. Petani melihat nama usaha dan desa titik antar Anda.',
  namaUsaha: 'Nama usaha',
  namaUsahaContoh: 'Contoh: Katering Bu Ratna',
  jenisUsahaLabel: 'Jenis usaha',
  alamatUsaha: 'Alamat tempat usaha',
  alamatContoh: 'Jalan, nomor, RT/RW',
  desaUsaha: 'Desa tempat usaha',
  cariDesa: 'Cari nama desa',
  desaTidakAda: 'Desa tidak ditemukan. Coba nama lain.',
  desaDipilih: (desa: string, kecamatan: string) => `${desa}, ${kecamatan}`,
  fotoUsaha: 'Foto tempat usaha',
  fotoUsahaKet: 'Boleh dilewati. Membantu admin memeriksa lebih cepat.',
  ambilFotoUsaha: 'Ambil foto tempat usaha',
  gantiFoto: 'Ganti foto',
  memprosesFoto: 'Menyiapkan foto…',
  fotoGagal: 'Foto belum bisa dibaca. Coba ambil lagi.',
  fotoUsahaAlt: 'Foto tempat usaha',
  kirimData: 'Kirim untuk diperiksa',
  mengirim: 'Mengirim…',
  isiNamaUsaha: 'Isi nama usaha dulu',
  isiAlamat: 'Isi alamat tempat usaha dulu',
  pilihDesa: 'Pilih desa tempat usaha dulu',

  // ---- buat pesanan (papan 37, T4.23, T4.24)
  judulBuat: 'Buat pesanan',
  ketBuat: (radius: number) =>
    `Petani dalam ${angkaJarak(radius)} km dari titik antar Anda akan melihat pesanan ini dan mulai tanam setelah setuju.`,
  jenisLabel: 'Jenis pesanan',
  jenisRutin: 'Rutin',
  jenisRutinKet: 'Dikirim berkala, harga tetap',
  jenisSekali: 'Sekali panen',
  jenisSekaliKet: 'Seluruh hasil dikirim saat panen',
  sayurApa: 'Sayur apa?',
  komoditasLabel: 'Pilih komoditas',
  komoditasKet: (nama: string, umur: number, paling: string) =>
    `${nama} siap panen sekitar ${umur} hari setelah tanam. Kiriman pertama paling cepat ${paling}.`,
  hanyaBerresep: 'Hanya tanaman yang sudah punya panduan tanam yang bisa dipesan.',
  jumlahJadwal: 'Jumlah dan jadwal',
  jumlahPerKiriman: 'Jumlah per kiriman',
  jumlahPerKirimanKet: 'Boleh dipenuhi beberapa petani sekaligus.',
  jumlahTotal: 'Jumlah seluruhnya',
  hariKirim: 'Hari kirim',
  antarSebelum: 'Antar sebelum pukul',
  antarSebelumKet: 'Petani mengantar pada hari kirim, paling lambat jam ini.',
  seberapaSering: 'Seberapa sering?',
  semingguSekali: 'Seminggu sekali',
  duaMingguSekali: 'Dua minggu sekali',
  berapaLama: 'Berapa lama?',
  lamaPilihan: (bulan: number) => `${bulan} bulan`,
  jumlahKirimanKet: (n: number) => `${n} kiriman`,
  bulanPanen: 'Perkiraan bulan panen',
  bulanPanenKet: 'Petani menanam supaya panen di bulan ini.',
  hargaKualitas: 'Harga dan kualitas',
  hargaPerKg: 'Harga per kg',
  hargaContoh: (rp: number) =>
    `Harga contoh di aplikasi ${formatRupiah(rp)}/kg. Harga tetap selama pesanan.`,
  standarKualitas: 'Standar kualitas',
  tambahSyarat: 'Tambah syarat',
  syaratBaru: 'Syarat tambahan',
  syaratBaruContoh: 'Contoh: dikemas dalam keranjang',
  simpanSyarat: 'Tambahkan',
  titikAntar: 'Titik antar',
  titikAmbil: 'Titik ambil',
  alamatAntar: 'Alamat dapur',
  alamatAmbil: 'Alamat titik ambil',
  patokan: 'Patokan untuk petani',
  patokanContoh: 'Contoh: pagar hijau, sebelah warung',
  titikKet: (desa: string, radius: number) =>
    `Desa ${desa}. Petani dalam ${angkaJarak(radius)} km dari desa ini bisa melihat pesanan Anda.`,
  ringkasanBiaya: 'Ringkasan biaya',
  ringkasanIsi: (komoditas: string, jumlah: number, n: number) =>
    n > 1 ? `${komoditas} ${kg(jumlah)} kg × ${n} kiriman` : `${komoditas} ${kg(jumlah)} kg`,
  nilaiPesanan: 'Nilai pesanan',
  uangMukaPersen: (p: number) => `Uang muka ${p}%`,
  uangMukaKet: 'Ditahan Tani Muda sampai hasil panen Anda terima',
  biayaLayananPersen: (p: number) => `Biaya layanan ${p}%`,
  dibayarSekarang: 'Dibayar sekarang',
  dibayarSekarangKet: 'Uang muka dan biaya layanan',
  perKiriman: 'Per kiriman',
  perKirimanKet: 'Setelah Anda konfirmasi',
  aturanBayar: (persenBayar: number, persenUm: number, hari: number) =>
    `Setiap kiriman Anda bayar ${persenBayar}%. Sisa ${persenUm}% diambil dari uang muka. Kalau tidak ada petani yang mengambil dalam ${hari} hari, uang muka kembali utuh.`,
  lanjutBayar: (rp: number) => `Lanjut bayar ${formatRupiah(rp)}`,
  menyimpan: 'Menyimpan…',
  belumTerverifikasi:
    'Usaha Anda belum terverifikasi, jadi belum bisa memasang pesanan. Tombol aktif setelah admin memeriksa data usaha.',
  isiJumlah: 'Isi jumlahnya dulu',
  isiHarga: 'Isi harga per kg dulu',
  isiAlamatAntar: 'Isi alamat titik antar dulu',

  // ---- bayar (halaman turunan 44, T4.41)
  judulBayar: 'Bayar uang muka',
  ketBayar: 'Uang muka ditahan Tani Muda dan baru cair ke petani setelah hasil panen Anda terima.',
  rincianBayar: 'Rincian',
  totalBayar: 'Total dibayar sekarang',
  ujiCobaKet: 'Belum memakai uang sungguhan. Pilih hasil yang ingin diperagakan, lalu tekan bayar.',
  hasilDiperagakan: 'Hasil yang diperagakan',
  hasilBerhasil: 'Berhasil',
  hasilGagal: 'Gagal',
  hasilMenunggu: 'Menunggu',
  bayarSekarang: (rp: number) => `Bayar ${formatRupiah(rp)}`,
  memproses: 'Memproses pembayaran…',
  berhasilJudul: 'Uang muka sudah masuk',
  berhasilIsi:
    'Pesanan Anda sudah terlihat oleh petani di sekitar. Kebun yang mengambil pesanan muncul di Pesanan aktif.',
  gagalJudul: 'Pembayaran belum berhasil',
  gagalIsi:
    'Uang Anda tidak terpotong. Pesanan belum terlihat oleh petani sampai uang muka dibayar.',
  cobaLagi: 'Coba bayar lagi',
  menungguJudul: 'Pembayaran sedang diproses',
  menungguIsi:
    'Kami menunggu kabar dari penyedia pembayaran. Pesanan aktif setelah pembayaran berhasil.',
  cekLagi: 'Cek lagi',
  lihatPesanan: 'Lihat Pesanan aktif',
  sudahDibayar: 'Uang muka pesanan ini sudah dibayar.',

  // ---- pembayaran dan riwayat (halaman turunan 49, 50)
  judulPembayaran: 'Pembayaran',
  ketPembayaran: 'Semua uang muka, pembayaran kiriman, pencairan ke petani, dan pengembalian.',
  belumAdaPembayaran: 'Belum ada pembayaran.',
  referensi: (r: string) => `Ref. ${r}`,
  judulRiwayat: 'Riwayat',
  ketRiwayat: 'Pesanan yang sudah selesai atau dibatalkan.',
  belumAdaRiwayat: 'Belum ada pesanan yang selesai.',
  pesanLagi: 'Pesan lagi',
  dibuatTanggal: (t: string) => `Dipasang ${t}`,

  // ---- konfirmasi kiriman (papan 38, T4.25)
  judulPeriksa: (komoditas: string) => `Periksa kiriman ${komoditas}`,
  subPeriksa: (petani: string, desa: string, ke: number, n: number, tiba: string) =>
    `Kebun ${petani}, ${desa} · kiriman ke-${ke} dari ${n} · tiba ${tiba}`,
  /** `jam` dari usePukul: "pukul 13.00", "besok pukul 04.00", … (D-48). */
  periksaSebelum: (jam: string) => `Periksa sebelum ${jam}`,
  periksaSebelumKet: 'Lewat dari itu, kiriman dianggap diterima semua dan dana cair ke petani.',
  fotoPetani: 'Foto dari petani',
  fotoPetaniKet: 'Diambil petani sebelum berangkat',
  fotoHasil: 'Hasil panen',
  fotoTimbangan: 'Di timbangan',
  fotoHasilAlt: (komoditas: string) => `Foto ${komoditas} dari petani`,
  fotoTimbanganAlt: (komoditas: string) => `Foto ${komoditas} di timbangan`,
  hasilPeriksa: 'Hasil pemeriksaan Anda',
  terimaSemua: 'Terima semua',
  terimaSemuaKet: (jumlah: number, rp: number) =>
    `${kg(jumlah)} kg, ${formatRupiah(rp)} cair ke petani`,
  tolakSebagian: 'Tolak sebagian',
  tolakSebagianKet: 'Pilih berat dan alasannya',
  beratDitolak: 'Berat yang ditolak',
  diterimaKg: (jumlah: number) => `Diterima ${kg(jumlah)} kg`,
  alasanLabel: 'Alasan',
  catatanPetani: 'Catatan untuk petani',
  catatanWajib: 'Wajib diisi bila alasannya Lainnya',
  catatanContoh: 'Contoh: sekitar 1 kg daun berlubang dimakan ulat',
  fotoBukti: 'Foto bukti dari Anda',
  ambilFotoBukti: 'Tambah foto',
  pembayaranKiriman: 'Pembayaran kiriman ini',
  hargaKg: (komoditas: string, rp: number) => `${komoditas} ${formatRupiah(rp)}/kg`,
  barisDiterima: (jumlah: number) => `Diterima ${kg(jumlah)} kg`,
  barisDitolak: (jumlah: number) => `Ditolak ${kg(jumlah)} kg`,
  tidakDibayar: (rp: number) => `${formatRupiah(rp)} tidak dibayar`,
  andaBayar: (p: number) => `Anda bayar sekarang, ${p}%`,
  dariUangMuka: (p: number) => `Diambil dari uang muka, ${p}%`,
  danaCairKe: (petani: string) => `Dana cair ke kebun ${petani}`,
  setelahKonfirmasi: 'Setelah Anda konfirmasi',
  tolakKet: (petani: string) =>
    `${petani} mendapat foto dan alasan Anda. Bagian yang ditolak diperiksa admin.`,
  konfirmasiTerima: (jumlah: number) => `Konfirmasi terima ${kg(jumlah)} kg`,
  mengonfirmasi: 'Menyimpan…',
  sudahDikonfirmasi: (jumlah: number, rp: number) =>
    `Kiriman diterima ${kg(jumlah)} kg. ${formatRupiah(rp)} cair ke petani.`,
  dianggapDiterima: 'Batas periksa sudah lewat, jadi kiriman dianggap diterima semua.',
  belumDikirim: 'Kiriman ini belum dikirim petani.',

  // ---- rating (T4.26)
  ratingJudul: 'Beri nilai',
  ratingKetPembeli: (petani: string) => `Bagaimana kiriman dari kebun ${petani}?`,
  ratingKetPetani: (pembeli: string) => `Bagaimana pengalaman dengan ${pembeli}?`,
  ratingLabel: 'Nilai',
  bintang: (n: number) => `${n} bintang`,
  komentar: 'Komentar (boleh dilewati)',
  kirimNilai: 'Kirim nilai',
  terimaKasihNilai: (n: number) => `Terima kasih. Anda memberi ${n} bintang.`,
  ringkasRating: (rata: string, n: number, siapa: string) => `${rata} dari ${n} ulasan ${siapa}`,
  belumAdaUlasan: 'Belum ada ulasan',
} as const;
