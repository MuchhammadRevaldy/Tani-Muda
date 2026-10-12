/**
 * Teks pesanan untuk petani: kartu tawaran di Beranda, Pesanan di sekitar (papan 29, 30), detail
 * pesanan (31), kesepakatan (32), dan Kiriman saya (33).
 */
import type { AlasanPenolakan, JenisUsaha, PesananUntukPetani } from '../api/tipe';
import { formatBulan, formatDesimal, formatRupiah, titikRibuan } from '../lib/format';
import { angkaJarak } from '../lib/jarak';

/** "per hari", "per minggu", "per 2 minggu", "tiap 3 hari". */
export function teksFrekuensiKirim(hari: number): string {
  if (hari === 1) return 'per hari';
  if (hari === 7) return 'per minggu';
  if (hari % 7 === 0) return `per ${hari / 7} minggu`;
  return `tiap ${hari} hari`;
}

/** Lama pesanan rutin: "selama 3 bulan", "selama 2 minggu", "selama 10 hari". */
export function teksLamaPesanan(hari: number): string {
  if (hari >= 28) return `selama ${Math.max(1, Math.round(hari / 30))} bulan`;
  if (hari % 7 === 0) return `selama ${hari / 7} minggu`;
  return `selama ${hari} hari`;
}

/** Lama pesanan tanpa "selama": "3 bulan", "2 minggu". */
export const teksLamaSingkat = (hari: number) => teksLamaPesanan(hari).replace(/^selama /, '');

/** Angka kg: bulat dengan titik ribuan ("2.000"), pecahan satu desimal ("7,5"). */
export const kg = (n: number) => (Number.isInteger(n) ? titikRibuan(n) : formatDesimal(n, 1));

/**
 * Isi pesanan dalam satu kalimat:
 * - rutin: "Sawi hijau 10 kg per minggu, selama 3 bulan";
 * - sekali panen: "Padi sawah 2.000 kg, sekali panen sekitar Desember".
 */
export function teksIsiPesanan(
  p: Pick<
    PesananUntukPetani,
    | 'jenis'
    | 'jumlah_per_kiriman_kg'
    | 'frekuensi_hari'
    | 'jumlah_kiriman'
    | 'jumlah_total_kg'
    | 'perkiraan_bulan_panen'
  >,
  namaKomoditas: string,
): string {
  if (p.jenis === 'rutin' && p.jumlah_per_kiriman_kg !== null && p.frekuensi_hari !== null) {
    return `${namaKomoditas} ${kg(p.jumlah_per_kiriman_kg)} kg ${teksFrekuensiKirim(
      p.frekuensi_hari,
    )}, ${teksLamaPesanan(p.jumlah_kiriman * p.frekuensi_hari)}`;
  }
  const bulan = p.perkiraan_bulan_panen ? ` sekitar ${formatBulan(p.perkiraan_bulan_panen)}` : '';
  return `${namaKomoditas} ${kg(p.jumlah_total_kg)} kg, sekali panen${bulan}`;
}

/** "Sawi hijau 10 kg per minggu" (rutin) atau "Padi sawah 2.000 kg sekali panen". */
export function teksJumlahPesanan(
  p: Pick<PesananUntukPetani, 'jenis' | 'frekuensi_hari'>,
  namaKomoditas: string,
  jumlahKg: number,
): string {
  return p.jenis === 'rutin' && p.frekuensi_hari
    ? `${namaKomoditas} ${kg(jumlahKg)} kg ${teksFrekuensiKirim(p.frekuensi_hari)}`
    : `${namaKomoditas} ${kg(jumlahKg)} kg sekali panen`;
}

const JENIS_USAHA: Record<JenisUsaha, string> = {
  katering: 'Katering',
  restoran: 'Restoran',
  warung: 'Warung makan',
  koperasi: 'Koperasi',
  penggilingan: 'Penggilingan padi',
  lainnya: 'Usaha lain',
};

const ALASAN_TOLAK: Record<Exclude<AlasanPenolakan, 'lainnya'>, string> = {
  layu_atau_busuk: 'layu atau busuk',
  jumlah_kurang: 'jumlah kurang',
  tidak_sesuai_standar: 'tidak sesuai standar',
};

const kapital = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

/** Jam antar "07:00" → "07.00" (D-40). */
export const jamAntar = (hhmm: string) => hhmm.replace(':', '.');

export const teksPesanan = {
  pesanSebelumTanam: 'Pesan sebelum tanam',
  jarakDariKebun: (km: number) => `${angkaJarak(km)} km dari kebunmu`,
  perKg: 'per kg',
  bolehSebagian: 'boleh ambil sebagian',
  lihatTawaran: 'Lihat tawaran',

  // ---- kerangka dan tab (papan 29, 33)
  judul: 'Pesanan',
  tabLabel: 'Bagian menu Pesanan',
  tabSekitar: 'Di sekitar',
  tabKiriman: 'Kiriman saya',

  // ---- pesanan di sekitar (papan 29, 30)
  filterLabel: 'Saring jenis pesanan',
  filterSemua: 'Semua',
  rutin: 'Rutin',
  sekaliPanen: 'Sekali panen',
  ketSemua: (n: number, radius: number, desa: string | null) =>
    `${n} pesanan dari pembeli dalam ${angkaJarak(radius)} km dari kebunmu${
      desa ? ` di ${desa}` : ''
    }, terdekat dulu.`,
  ketRutin: (n: number) =>
    `${n} pesanan rutin. Dikirim berkala selama masa pesanan dengan harga tetap.`,
  ketSekali: (n: number) =>
    `${n} pesanan sekali panen. Seluruh hasil dikirim sekaligus saat panen.`,
  ketFilterKosong: 'Belum ada pesanan jenis ini di sekitarmu.',
  subPembeli: (j: JenisUsaha, desa: string, km: number) =>
    `${JENIS_USAHA[j]} · ${desa} · ${angkaJarak(km)} km dari kebunmu`,
  barangRutin: (nama: string, jumlahKg: number, frek: number, lamaHari: number) =>
    `${nama} ${kg(jumlahKg)} kg ${teksFrekuensiKirim(frek)} · ${teksLamaSingkat(lamaHari)}`,
  barangSekali: (nama: string, jumlahKg: number, bulan: string | null) =>
    `${nama} ${kg(jumlahKg)} kg` +
    (bulan ? ` untuk panen ${formatBulan(bulan, { denganTahun: true })}` : ''),
  waktuMulai: (tanggal: string) => `mulai ${tanggal}`,
  waktuSekali: 'dikirim sekali saat panen',
  perKgDan: (waktu: string) => `per kg · ${waktu}`,
  jumlahSaja: (jumlahKg: number, frek: number | null) =>
    `${kg(jumlahKg)} kg${frek ? ` ${teksFrekuensiKirim(frek)}` : ''}`,
  bolehSebagianKalimat: 'Boleh ambil sebagian',
  sudahDiambil: (jumlah: string) => `Kamu sudah mengambil ${jumlah}`,
  petaJudul: 'Peta pembeli',
  petaKet: (radius: number) =>
    `Garis putus-putus menandai ${angkaJarak(radius)} km dari kebunmu. Nomor sesuai daftar.`,
  petaLabel: (desa: string | null) =>
    `Peta letak pembeli di sekitar kebunmu${desa ? ` di ${desa}` : ''}`,
  kebunmu: 'Kebunmu',
  dpDitahan: (rp: number, hasil: string) =>
    `Pembeli sudah membayar uang muka ${formatRupiah(rp)}. Uang ditahan sampai ${hasil} diterima.`,
  jadwalRingkasRutin: (n: number, hari: string, frek: number, mulai: string, jam: string | null) =>
    `${n} kiriman, ${frek === 7 ? `tiap ${hari}` : `tiap ${frek} hari`}` +
    `${jam ? ` sebelum ${jamAntar(jam)}` : ''}, mulai ${mulai}`,
  jadwalRingkasSekali: (bulan: string | null) =>
    bulan
      ? `Sekali kirim saat panen, ${formatBulan(bulan, { denganTahun: true })}.`
      : 'Sekali kirim saat panen.',
  hargaPerKg: 'Harga per kg',
  nilaiSeluruh: 'Nilai seluruh pesanan',
  totalKet: (jumlahKg: number, kiriman: number) =>
    kiriman > 1
      ? `${kg(jumlahKg)} kg dalam ${kiriman} kiriman`
      : `${kg(jumlahKg)} kg, sekali kirim`,
  lihatPesanan: 'Lihat pesanan',
  kosongJudul: 'Belum ada pesanan di sekitar',
  kosongIsi: (radius: number) =>
    `Belum ada katering atau restoran dalam ${angkaJarak(radius)} km yang mencari hasil panen minggu ini. Kami beri tahu lewat pengingat begitu ada pesanan baru.`,
  cariSampai: (km: number) => `Cari sampai ${angkaJarak(km)} km`,
  sambilMenunggu: 'Sambil menunggu',
  siapkanLahan: 'Siapkan lahan dengan siklus tanam baru',
  hasilSayur: 'sayur',
  hasilPanen: 'hasil panen',

  // ---- detail pesanan (papan 31)
  kembaliSekitar: 'Pesanan di sekitar',
  rincian: 'Rincian pesanan',
  harga: 'Harga',
  lama: 'Lama',
  kirim: 'Kirim',
  mulai: 'Mulai',
  total: 'Jumlah',
  perKgSingkat: (harga: number) => `${formatRupiah(harga)} per kg`,
  lamaRutin: (lamaHari: number, kiriman: number) =>
    `${teksLamaSingkat(lamaHari)}, ${kiriman} kiriman`,
  lamaSekali: 'Sekali kirim',
  tiapHari: (hari: string, frek: number, jam: string | null) =>
    (frek === 7 ? `Tiap ${hari}` : `Tiap ${frek} hari`) + (jam ? `, sebelum ${jamAntar(jam)}` : ''),
  sebelumJam: (jam: string) => `Antar sebelum ${jamAntar(jam)}`,
  saatPanen: (bulan: string | null) =>
    bulan ? `Saat panen, sekitar ${formatBulan(bulan, { denganTahun: true })}` : 'Saat panen',
  mauAmbil: 'Mau ambil berapa?',
  mauAmbilKet: 'Boleh sebagian. Sisanya untuk petani lain.',
  satuanJumlah: (frek: number | null, sisa: number) =>
    `${frek ? `${teksFrekuensiKirim(frek)}, ` : ''}dari ${kg(sisa)} kg`,
  kurangi: 'Kurangi jumlah',
  tambahi: 'Tambah jumlah',
  pilihanJumlahLabel: 'Pilihan jumlah',
  jumlahKg: (n: number) => `${kg(n)} kg`,
  pilihLahan: 'Tanam di lahan',
  satuanLahan: (n: number, lubang: boolean) =>
    lubang ? `${titikRibuan(Math.floor(n))} lubang` : `${formatDesimal(n, 1)} m²`,
  cukupJudul: (maks: string) => `Lahanmu cukup untuk ${maks}`,
  cukupIsi: (sisa: string, lahan: string, ambil: string) =>
    `Sisa ${sisa} di ${lahan}. Ambil ${ambil} masih aman.`,
  kurangJudul: (maks: string) => `Lahanmu hanya cukup untuk ${maks}`,
  kurangIsi: (maks: string) => `Ambil ${maks} atau kurang supaya tidak gagal kirim.`,
  penuhJudul: 'Lahan ini sudah terpakai semua',
  penuhIsi: 'Pilih lahan lain, atau tunggu siklus yang sedang berjalan selesai.',
  belumAdaLahan: 'Kamu belum punya lahan',
  belumAdaLahanIsi: 'Catat lahanmu dulu supaya kami bisa cek apakah pesanan ini muat.',
  lahanTidakCocok: (komoditas: string) => `Belum ada lahan yang cocok untuk ${komoditas}`,
  lahanTidakCocokIsi: 'Panduan tanam yang ada belum cocok dengan jenis lahanmu.',
  keLahanSaya: 'Buka Lahan saya',
  tidakTerkejarSemua:
    'Panenmu belum sempat untuk jadwal kirim pesanan ini. Cari pesanan lain yang mulai kirimnya lebih lama.',
  ikutMulai: (tanggal: string, n: number) =>
    `Kamu bisa ikut mulai kiriman tanggal ${tanggal}, jadi ${n} kiriman. Kiriman sebelum itu tetap terbuka untuk petani lain, karena panenmu belum sempat.`,
  saranJudul: 'Saran tanam bertahap',
  saranKet: (n: number, per: string, bersamaan: number, luas: string, satuan: string) =>
    `Satu petak untuk setiap kiriman, jadi ${n} petak masing-masing ${per}. Paling banyak ${bersamaan} petak tumbuh bersamaan, jadi lahan yang dipakai ${luas}: bagi jadi ${bersamaan} ${satuan} lalu tanam bergilir.`,
  bedengan: 'bedengan',
  petak: 'petak',
  /** Petak pesanan rutin dinamai menurut tanggal panen (kirimannya). */
  petakPanen: (tanggal: string) => `Petak panen ${tanggal}`,
  tanamDiBedengan: (tanggal: string, satuan: string, n: number) =>
    `Tanam ${tanggal} · ${satuan} ${n}`,
  tampilkanSemuaPetak: (n: number) => `Tampilkan semua (${n} petak)`,
  barisPetak: (petak: string, tanam: string, panen: string) =>
    `${petak}: tanam ${tanam}, panen ${panen}`,
  saranKaki: (tanggal: string, satuan: string) =>
    `Panen pertama ${tanggal}. Setelah panen, tanam lagi di ${satuan} yang sama.`,
  uangJudul: 'Uang yang kamu terima',
  uangKet: (rp: number) =>
    `Uang muka bagianmu ${formatRupiah(rp)} sudah ditahan. Uang tiap kiriman cair setelah pembeli konfirmasi.`,
  perKiriman: 'Per kiriman',
  perKirimanKet: (jumlahKg: number, harga: number) => `${kg(jumlahKg)} kg × ${formatRupiah(harga)}`,
  totalSelama: (lama: string) => `Selama ${lama}`,
  totalSemua: 'Total',
  jumlahKirimanKet: (n: number) => `${n} kiriman`,
  ambilRutin: (jumlahKg: number, frek: number) =>
    `Ambil ${kg(jumlahKg)} kg ${teksFrekuensiKirim(frek)}`,
  ambilSekali: (jumlahKg: number) => `Ambil ${kg(jumlahKg)} kg`,
  mengambil: 'Menyimpan…',
  sisaBerubah: (sisa: number) =>
    `Petani lain baru saja mengambil sebagian pesanan ini. Sisanya sekarang ${kg(sisa)} kg. Pilih jumlah lagi.`,
  nonaktif: (wa: string, jam: string) =>
    `Akunmu sedang dinonaktifkan sementara, jadi belum bisa mengambil pesanan baru. Hubungi admin lewat WhatsApp ${wa} (${jam}).`,
  hubungiAdmin: 'Hubungi admin lewat WhatsApp',
  sudahAmbilJudul: (jumlah: string) => `Kamu sudah mengambil ${jumlah}`,
  sudahAmbilMenunggu: 'Periksa dan setujui kesepakatannya supaya jadwal tanam masuk ke kebunmu.',
  sudahAmbilJalan: 'Kesepakatan sudah disetujui. Lihat jadwal kirimnya di Kiriman saya.',
  periksaKesepakatan: 'Periksa kesepakatan',
  keKirimanSaya: 'Buka Kiriman saya',
  tidakDitemukan: 'Pesanan ini sudah tidak tersedia.',
  kembaliDaftar: 'Kembali ke daftar pesanan',

  // ---- kesepakatan (papan 32)
  kembaliDetail: 'Detail pesanan',
  kesepakatanJudul: 'Periksa kesepakatan',
  kesepakatanKet:
    'Baca dulu sebelum setuju. Setelah setuju, jadwal tanam dan jadwal kirim langsung masuk ke kebunmu.',
  ringkasan: 'Ringkasan',
  pembeli: 'Pembeli',
  jadwalKirim: 'Jadwal kirim',
  titikAntar: 'Titik antar',
  pembeliIsi: (nama: string, desa: string) => `${nama}, ${desa}`,
  jadwalRutin: (hari: string, n: number, dari: string, sampai: string, jam: string | null) =>
    `Setiap ${hari}${jam ? ` sebelum pukul ${jamAntar(jam)}` : ''}, ${n} kali. ${dari} sampai ${sampai}.`,
  jadwalTiap: (frek: number, n: number, dari: string, sampai: string, jam: string | null) =>
    `Tiap ${frek} hari${jam ? ` sebelum pukul ${jamAntar(jam)}` : ''}, ${n} kali. ${dari} sampai ${sampai}.`,
  ubahJumlah: 'Ubah jumlah',
  ubahJumlahJudul: 'Ubah jumlah sebelum setuju',
  ubahJumlahKet: 'Petak dan jadwal tanam dihitung ulang dari jumlah baru.',
  simpanJumlah: (jumlah: string) => `Simpan ${jumlah}`,
  batal: 'Batal',
  jadwalSekali: (tanggal: string) => `Sekali kirim saat panen, sekitar ${tanggal}.`,
  titikAntarIsi: (alamat: string, km: number) => `${alamat}, ${angkaJarak(km)} km dari kebunmu`,
  patokan: (p: string) => `Patokan: ${p}`,
  hargaTetap: (harga: number, lama: string) =>
    `${formatRupiah(harga)} per kg, tetap selama ${lama}`,
  standarJudul: 'Standar kualitas',
  standarKaki: (hasil: string) =>
    `${kapital(hasil)} di luar standar boleh ditolak pembeli dengan foto. Bagian yang ditolak tidak dibayar.`,
  gagalJudul: 'Kalau gagal panen',
  gagal1: (hari: number) => `Kabari paling lambat ${hari} hari sebelum jadwal kirim.`,
  gagal2:
    'Bagian yang tidak terpenuhi ditawarkan ke petani lain; kalau tidak ada pengganti, sisa uang muka bagian itu dikembalikan ke pembeli.',
  gagal3:
    'Tanpa denda. Petani yang tidak memberi kabar mendapat catatan di profil dan bisa dinonaktifkan sementara oleh admin.',
  bayarJudul: 'Uang dan pembayaran',
  bayarIsi: (hasil: string, jam: number) =>
    `Pembeli sudah membayar uang muka. Setelah ${hasil} sampai, pembeli punya ${jam} jam untuk memeriksa. Lewat dari itu, dana cair sendiri ke rekening atau dompet digitalmu.`,
  pernyataanRutin: (jumlahKg: number, komoditas: string, hari: string) =>
    `Saya sanggup mengirim ${kg(jumlahKg)} kg ${komoditas} setiap ${hari} sesuai standar di atas.`,
  pernyataanTiap: (jumlahKg: number, komoditas: string, frek: number) =>
    `Saya sanggup mengirim ${kg(jumlahKg)} kg ${komoditas} tiap ${frek} hari sesuai standar di atas.`,
  pernyataanSekali: (jumlahKg: number, komoditas: string) =>
    `Saya sanggup mengirim ${kg(jumlahKg)} kg ${komoditas} saat panen sesuai standar di atas.`,
  centangDulu: 'Centang pernyataan di atas dulu',
  setuju: 'Setuju',
  menyetujui: 'Menyimpan…',
  tanyaPembeli: 'Tanya pembeli dulu',
  tanyaJudul: 'Tanya pembeli lewat admin',
  tanyaIsi: (jam: string) =>
    `Untuk sekarang, pertanyaan ke pembeli disampaikan lewat admin Tani Muda (${jam}). Kesepakatan ini tetap menunggu sampai kamu setuju.`,
  sudahSetujuJudul: (tanggal: string) => `Kesepakatan disetujui ${tanggal}`,
  sudahSetujuIsi: (tanam: string) =>
    `Jadwal tanam mulai ${tanam} dan jadwal kirim sudah masuk ke kebunmu.`,
  lihatJadwalTanam: 'Lihat jadwal tanam',
  belumAmbil: 'Kamu belum mengambil pesanan ini. Pilih jumlahnya dulu di detail pesanan.',

  // ---- kiriman saya (papan 33)
  hariIni: (tanggal: string) => `Hari ini · ${tanggal}`,
  tidakAdaHariIni: 'Tidak ada kiriman hari ini.',
  berikutnya: 'Berikutnya',
  sebelumnya: 'Sebelumnya',
  kirimanKosongJudul: 'Belum ada kiriman',
  kirimanKosongIsi:
    'Jadwal kiriman muncul di sini setelah kamu mengambil pesanan dan menyetujui kesepakatannya.',
  lihatDiSekitar: 'Lihat pesanan di sekitar',
  judulKiriman: (komoditas: string, jumlahKg: number) => `${komoditas} ${kg(jumlahKg)} kg`,
  /** Alamat antar bila sudah diketahui (sudah memuat nama tempat), selain itu pembeli dan desa. */
  subKiriman: (
    pembeli: string,
    desa: string,
    alamat: string | null,
    km: number,
    jam: string | null,
  ) =>
    [
      alamat ?? `${pembeli} · ${desa}`,
      jam ? `antar sebelum pukul ${jamAntar(jam)}` : null,
      `${angkaJarak(km)} km`,
    ]
      .filter(Boolean)
      .join(' · '),
  jadwalTerlewat: (tanggal: string) => `Jadwal ${tanggal}`,
  tahapLabel: 'Tahap uang kiriman ini',
  tahap1: 'Uang muka ditahan',
  tahap2: 'Menunggu konfirmasi',
  tahap3: (rp: number) => `Dana cair ${formatRupiah(rp)}`,
  tahap1Ket: 'Sekarang',
  tahap2Ket: 'Setelah kirim',
  tahap2Sampai: (jam: string) => `Sampai ${jam}`,
  tahap3Ket: (jam: number) => `Paling lama ${jam} jam`,
  tahapSekarang: 'tahap sekarang',
  fotoJudul: 'Sebelum kirim, unggah foto kualitas',
  fotoKet: 'Pembeli melihat foto ini. Foto melindungimu kalau ada yang ditolak.',
  fotoHasil: 'Foto hasil panen',
  /** Label di atas foto data contoh (berkas di /contoh/), AG-17. */
  labelContohFoto: 'Contoh foto',
  fotoHasilKet: 'Wajib',
  fotoTimbangan: 'Foto di timbangan',
  fotoTimbanganKet: 'Boleh dilewati',
  ambilFoto: 'Ambil foto hasil panen',
  ambilFotoTimbangan: 'Ambil foto di timbangan',
  gantiFoto: 'Ganti foto',
  hapusFotoTimbangan: 'Hapus foto timbangan',
  fotoTimbanganAlt: (komoditas: string) => `Foto ${komoditas} di timbangan`,
  memprosesFoto: 'Menyiapkan foto…',
  fotoGagal: 'Foto belum bisa dibaca. Coba ambil lagi.',
  fotoKualitasAlt: (komoditas: string) => `Foto kualitas ${komoditas} sebelum dikirim`,
  tandaiDikirim: 'Tandai sudah dikirim',
  mengirim: 'Menyimpan…',
  fotoDulu: 'Unggah foto kualitas dulu sebelum menandai dikirim.',
  sudahDikirim: (jam: string, sampai: string) =>
    `Dikirim ${jam}. Pembeli memeriksa sampai ${sampai}; lewat dari itu dana cair sendiri.`,
  kirimanPertama: 'kiriman pertama',
  diterimaSemua: 'diterima semua',
  diterimaSebagian: (komoditas: string, jumlahKg: number) =>
    `${komoditas} ${kg(jumlahKg)} kg diterima`,
  ditolak: (jumlahKg: number, alasan: string) => `${kg(jumlahKg)} kg ditolak: ${alasan}`,
  alasanTolak: (a: AlasanPenolakan | null, keterangan: string | null) =>
    a === 'lainnya' || !a ? (keterangan ?? 'alasan lain') : ALASAN_TOLAK[a],
  gagalPanen: 'Dilaporkan gagal panen',
  tampilkanSemua: (n: number) => `Tampilkan semua (${n} kiriman)`,
  tampilkanSedikit: 'Tampilkan lebih sedikit',

  // ---- gagal panen (T4.27, halaman turunan 51) dan rating (T4.26)
  tidakSanggup: 'Tidak sanggup kirim?',
  gagalJudulHalaman: 'Kabari tidak sanggup kirim',
  gagalKetHalaman: (komoditas: string, jumlahKg: number, tanggal: string, pembeli: string) =>
    `${komoditas} ${kg(jumlahKg)} kg untuk ${pembeli}, jadwal ${tanggal}.`,
  aturanKabar: (hari: number, batas: string) =>
    `Kabari paling lambat ${hari} hari sebelum jadwal kirim, yaitu ${batas}. Tidak ada denda.`,
  aturanPengganti:
    'Bagian kiriman ini ditawarkan ke petani lain. Kalau tidak ada pengganti, sisa uang muka bagian itu dikembalikan ke pembeli.',
  lewatBatas:
    'Batas kabar sudah lewat. Kabar tetap dikirim ke pembeli, tetapi tercatat di profilmu.',
  alasanGagal: 'Apa yang terjadi?',
  alasanGagalContoh: 'Contoh: tanaman diserang ulat, banyak yang rusak',
  isiAlasanGagal: 'Tulis apa yang terjadi dulu',
  kirimKabar: 'Kirim kabar',
  mengirimKabar: 'Mengirim…',
  kabarTerkirim: 'Kabar terkirim',
  kabarTepat: 'Terima kasih sudah mengabari tepat waktu. Tidak ada catatan di profilmu.',
  kabarTerlambat: 'Kabar diterima, tetapi lewat batas waktu, jadi tercatat di profilmu.',
  uangDikembalikan: (rp: number) =>
    `Uang muka bagian kiriman ini, ${formatRupiah(rp)}, dikembalikan ke pembeli.`,
  kembaliKiriman: 'Kiriman saya',
  beriNilai: 'Beri nilai pembeli',
  nilaiDiberikan: (n: number) => `Kamu memberi ${n} bintang`,
} as const;
