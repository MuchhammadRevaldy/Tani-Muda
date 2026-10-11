/** Teks menu Kebun dan detail siklus (papan 20–28, T4.10–T4.17). Petani disapa "kamu". */
import { formatTanggal } from '../lib/format';

export const teksKebun = {
  // ---------------------------------------------------------------- daftar siklus (D-26, D-38)
  judul: 'Kebun',
  sub: 'Semua siklus tanammu: yang sedang ditanam, rencana, dan yang sudah selesai.',
  sedangDitanam: 'Sedang ditanam',
  rencana: 'Rencana belum dijadwalkan',
  selesai: 'Sudah selesai',
  hariKeDari: (hari: number, panen: number) => `Hari ke-${hari} dari ${panen}`,
  panenTanggal: (tanggal: string) => `panen ${formatTanggal(tanggal)}`,
  bukaJadwal: 'Buka jadwal',
  pilihTanggalTanam: 'Pilih tanggal tanam',
  rencanaKet: 'Belum ada tanggal tanam, jadi jadwal belum dibuat.',
  selesaiKet: (tanggal: string) =>
    `Selesai, ditanam ${formatTanggal(tanggal, { tanpaHari: true })}`,
  untungNyata: 'Untung sebenarnya',
  lihatRingkasan: 'Lihat ringkasan',
  rencanaBeranda: (n: number) => `${n} rencana belum dijadwalkan`,
  // ---------------------------------------------------------------- kelompok petak pesanan (D-40)
  namaKelompok: (komoditas: string, pembeli: string) => `${komoditas} untuk ${pembeli}`,
  ringkasKelompok: (total: number, tumbuh: number, selesai: number, tanam: string | null) =>
    [
      `${total} petak`,
      tumbuh ? `${tumbuh} sedang tumbuh` : null,
      selesai ? `${selesai} sudah dipanen` : null,
      tanam ? `tanam berikutnya ${formatTanggal(tanam)}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
  menungguKesepakatan: 'Menunggu kesepakatan',
  periksaKesepakatan: 'Periksa kesepakatan',
  lihatPetak: (n: number) => `Lihat ${n} petak`,
  petakBelumTanam: (tanggal: string) => `Tanam ${formatTanggal(tanggal)}`,
  petakSelesai: 'Sudah dipanen',
  // ---------------------------------------------------------------- kerangka siklus
  kembaliBeranda: 'Beranda',
  kembaliKebun: 'Kebun',
  kembaliJadwal: 'Jadwal',
  bagianSiklus: 'Bagian siklus',
  tab: { jadwal: 'Jadwal', modal: 'Modal', jurnal: 'Jurnal' },
  keteranganSiklus: (metode: string, ukuran: string | null, tanam: string | null) =>
    [metode, ukuran, tanam ? `ditanam ${formatTanggal(tanam)}` : null].filter(Boolean).join(' · '),
  panenLagi: (tanggal: string, sisa: number) =>
    sisa > 0
      ? `Panen ${formatTanggal(tanggal)} · ${sisa} hari lagi`
      : `Panen ${formatTanggal(tanggal)}`,
  aturPengingat: 'Atur pengingat',
  ubahTanggalTanam: 'Ubah tanggal tanam',
  akhiriSiklus: 'Akhiri siklus',
  // ---------------------------------------------------------------- jadwal (T4.10)
  daftarTugas: 'Daftar tugas',
  filterTipe: 'Jenis tugas',
  semua: 'Semua',
  namaTipe: { sekali: 'Sekali', berulang: 'Berulang', ukur: 'Pengukuran' },
  kelompok: {
    terlambat: (tanggal: string) => `Terlambat · ${formatTanggal(tanggal)}`,
    terlambatSaja: 'Terlambat',
    hariIni: (tanggal: string) => `Hari ini · ${formatTanggal(tanggal)}`,
    besok: (tanggal: string) => `Besok · ${formatTanggal(tanggal)}`,
    selesai: 'Sudah selesai',
  },
  kosongTipe: (tipe: string) =>
    `Siklus ini tidak punya tugas ${tipe.toLowerCase()}. Resepnya memang tidak memintanya.`,
  kosongSemua: 'Belum ada tugas. Pilih tanggal tanam supaya jadwal dibuat.',
  tigaJenis: 'Tiga jenis tugas',
  tigaJenisKet: 'Ikon yang sama dipakai di semua daftar tugas.',
  jenisKet: {
    sekali: 'Dikerjakan satu kali pada hari tertentu, misalnya pupuk susulan.',
    berulang: 'Diulang dengan jadwal tetap, misalnya siram setiap hari.',
    ukur: 'Mengisi angka hasil ukur, misalnya pH dan PPM larutan.',
  },
  pengingat: 'Pengingat',
  pengingatKet: (jam: string, sore: boolean) =>
    sore
      ? `Pagi pukul ${jam}. Sore pukul 16.00 kalau ada tugas yang belum selesai.`
      : `Pagi pukul ${jam}.`,
  hariKeTanggal: (hari: number, tanggal: string) => `hari ke-${hari} · ${formatTanggal(tanggal)}`,
  // ---------------------------------------------------------------- detail tugas (T4.11)
  seharusnya: (siklus: string, tanggal: string, hari: number) =>
    `${siklus} · seharusnya ${formatTanggal(tanggal)} (hari ke-${hari})`,
  jadwalTugas: (siklus: string, tanggal: string, hari: number) =>
    `${siklus} · ${formatTanggal(tanggal)} (hari ke-${hari})`,
  sebaiknyaHariIni: 'Sebaiknya dikerjakan hari ini',
  caraMengerjakan: 'Cara mengerjakan',
  caraKosong: 'Langkahnya belum ditulis di resep ini.',
  fotoBukti: 'Foto bukti',
  fotoBuktiKet: 'Foto sebelum dan sesudah. Pembeli bisa melihat kebunmu.',
  tambahFoto: 'Tambah foto',
  gantiFoto: 'Ganti foto',
  hapusFoto: 'Hapus foto',
  fotoTerpilih: 'Foto yang akan disimpan',
  fotoTersimpan: (jam: string) => `Tersimpan · ${jam}`,
  mengecilkan: 'Mengecilkan foto…',
  fotoGagal: 'Foto belum bisa dibaca. Coba ambil lagi.',
  belumBisa: 'Belum bisa hari ini?',
  belumBisaKet: 'Pilih berapa hari ditunda.',
  tundaHari: (n: number) => `${n} hari`,
  tunda: (n: number) => `Tunda ${n} hari`,
  tundaKet: 'Tugas sejenis berikutnya ikut bergeser.',
  tidakBolehDitunda: 'Tugas ini tidak bisa ditunda karena terikat hari panen.',
  tundaLewatPanen: 'Tunda melewati perkiraan panen?',
  tundaLewatPanenIsi:
    'Tanggal baru jatuh setelah perkiraan panen. Pastikan tanaman masih membutuhkannya.',
  tetapTunda: 'Tetap tunda',
  batal: 'Batal',
  tandaiSelesai: 'Tandai selesai',
  menyimpan: 'Menyimpan…',
  sudahSelesai: (tanggal: string) => `Selesai ${tanggal}`,
  tugasSelesai: 'Tugas ini sudah selesai.',
  isiAngka: 'Isi angka',
  tugasTidakDitemukan: 'Tugas ini tidak ditemukan di jadwalmu.',
  // ---------------------------------------------------------------- ukur (T4.12)
  pengukuranFrek: (frek: string) => `Pengukuran · ${frek}`,
  ketUkur: (siklus: string, hari: number, tandon: number | null) =>
    [siklus, `hari ke-${hari}`, tandon ? `tandon ${tandon} liter` : null]
      .filter(Boolean)
      .join(' · '),
  caraMengukur: 'Cara mengukur',
  labelBesaran: { pH: 'pH larutan', PPM: 'PPM (kepekatan nutrisi)' } as Record<string, string>,
  normalRentang: (r: string) => `Normal ${r}`,
  status: {
    normal: 'Normal',
    'terlalu-rendah': 'Terlalu rendah',
    'terlalu-tinggi': 'Terlalu tinggi',
    kosong: 'Belum diisi',
  },
  rentangDariResep: 'Rentang dari Resep Tanam yang dicek penyuluh.',
  hasilDanSaran: 'Hasil dan saran',
  isiDulu: 'Isi angka hasil ukur untuk melihat hasilnya.',
  baikJudul: 'Larutan dalam kondisi baik',
  baikIsi: (besaran: string, tanggal: string | null) =>
    `${besaran} ada di rentang normal.${tanggal ? ` Ukur lagi ${formatTanggal(tanggal)}.` : ''}`,
  diLuarJudul: (besaran: string, status: string) => `${besaran} ${status.toLowerCase()}`,
  diLuarIsi: (besaran: string, nilai: string, status: string, saran: string) =>
    `${besaran} ${nilai} ${status.toLowerCase()}. ${saran}`,
  ukurUlangBesok: (tanggal: string) => `Tugas "Ukur ulang" dibuat untuk ${formatTanggal(tanggal)}.`,
  tujuhTerakhir: '7 pengukuran terakhir',
  tujuhTerakhirKet: 'Pita hijau menandai rentang normal. Titik terakhir adalah angka terbaru.',
  grafikKet: (rentang: string, terakhir: string | null) =>
    `Normal ${rentang}${terakhir ? ` · ${terakhir} terakhir` : ''}`,
  grafikAria: (besaran: string, n: number) => `Grafik ${n} pengukuran ${besaran} terakhir`,
  belumAdaRiwayat: 'Belum ada riwayat pengukuran.',
  simpanHasil: 'Simpan hasil',
  hasilTersimpan: 'Hasil ukur tersimpan.',
  kembaliKeJadwal: 'Kembali ke jadwal',
  // ---------------------------------------------------------------- ubah tanggal tanam (T4.13)
  judulUbahTanggal: 'Ubah tanggal tanam',
  judulPilihTanggal: 'Pilih tanggal tanam',
  ubahTanggalKet:
    'Tugas yang sudah selesai tidak berubah. Tugas lain digeser mengikuti tanggal baru.',
  tanggalSekarang: (t: string) =>
    `Tanggal tanam sekarang: ${formatTanggal(t, { denganTahun: true })}`,
  tanggalBaru: 'Tanggal tanam baru',
  tanggalBantuan: 'Boleh tanggal yang sudah lewat bila benihnya sudah ditanam.',
  perubahan: 'Perubahan jadwal',
  geserMaju: (n: number) => `Tugas belum selesai mundur ${n} hari.`,
  geserMundur: (n: number) => `Tugas belum selesai maju ${n} hari.`,
  tidakBerubah: 'Tanggalnya sama dengan sekarang.',
  jumlahBergeser: (n: number, selesai: number) =>
    `${n} tugas digeser, ${selesai} tugas selesai tetap.`,
  contohGeser: (judul: string, lama: string, baru: string) =>
    `${judul}: ${formatTanggal(lama)} → ${formatTanggal(baru)}`,
  panenBaru: (t: string) => `Perkiraan panen baru ${formatTanggal(t, { denganTahun: true })}`,
  simpanTanggal: 'Simpan tanggal tanam',
  simpanTanggalRencana: 'Mulai tanam dan buat jadwal',
  // ---------------------------------------------------------------- pengingat (T4.14)
  judulPengingat: 'Pengingat per siklus',
  subPengingat: 'Setiap siklus punya jadwal sendiri. Atur jam dan jenis tugas yang diingatkan.',
  siklus: 'Siklus',
  waktuPengingat: 'Waktu pengingat',
  jamPagi: 'Jam pengingat pagi',
  jamPagiKet: 'Daftar tugas hari ini dikirim pada jam ini.',
  pengingatSore: 'Pengingat sore',
  pengingatSoreKet: 'Pukul 16.00, hanya kalau masih ada tugas hari ini yang belum selesai.',
  jenisDiingatkan: 'Jenis tugas yang diingatkan',
  tidakAdaTipe: (tipe: string) => `Tidak ada tugas ${tipe.toLowerCase()} di siklus ini`,
  lewatiHujan: 'Lewati siram saat hujan',
  lewatiHujanKet: 'Pengingat siram dilewati kalau prakiraan cuaca di desamu hujan.',
  segeraHadir: 'Segera hadir',
  contohPengingat: 'Contoh pengingat',
  tidakAdaPagi: 'Tidak ada pengingat pagi untuk siklus ini.',
  soreJudul: 'Masih ada tugas yang belum selesai',
  soreIsi: 'Centang tugas yang sudah dikerjakan supaya jadwal besok tetap rapi.',
  pengirim: (siklus: string) => `Tani Muda · ${siklus}`,
  simpanPengaturan: 'Simpan pengaturan',
  pengaturanTersimpan: 'Pengaturan pengingat tersimpan.',
  // ---------------------------------------------------------------- modal (T4.15)
  rencanaRealisasi: 'Rencana dan realisasi',
  sudahKeluarPersen: (p: number) => `Sudah keluar ${p}% dari rencana`,
  sudahKeluar: 'Sudah keluar',
  dariRencana: (rp: string) => `dari rencana ${rp}`,
  persenAria: (p: number) => `Sudah keluar ${p} persen dari rencana`,
  modalAkhir: 'Perkiraan modal akhir',
  modalAkhirKet: 'Kalau sisanya sesuai rencana',
  perkiraanUntung: 'Perkiraan untung',
  kalauPanen: (kg: string, s: string) => `Kalau panen ${kg} ${s}`,
  perItem: 'Per item',
  rencanaRp: (rp: string) => `Rencana ${rp}`,
  rencanaBelumHarga: 'Rencana belum ada harganya',
  statusItem: {
    sesuai: 'Sesuai rencana',
    hemat: (rp: string) => `Hemat ${rp}`,
    lebih: (rp: string) => `Lebih ${rp}`,
    belum: 'Belum dibeli',
    'tanpa-harga': 'Sudah dibeli',
  },
  belum: 'Belum',
  tanpaRencana: 'Di luar rencana',
  catatPengeluaran: 'Catat pengeluaran',
  judulCatat: 'Catat pengeluaran',
  itemRencana: 'Untuk item',
  diLuarRencana: 'Lainnya, di luar rencana',
  namaPengeluaran: 'Nama pengeluaran',
  nominal: 'Nominal',
  tanggal: 'Tanggal',
  fotoNota: 'Foto nota (tidak wajib)',
  simpanPengeluaran: 'Simpan pengeluaran',
  isiNominal: 'Isi nominalnya dulu',
  isiNama: 'Isi nama pengeluarannya dulu',
  pengeluaranTersimpan: 'Pengeluaran tersimpan.',
  // ---------------------------------------------------------------- jurnal (T4.16)
  minggu: (n: number) => `Minggu ke-${n}`,
  mingguKet: (awal: number, akhir: number, foto: number, catatan: number) =>
    [
      `Hari ke-${awal} sampai ${akhir}`,
      foto ? `${foto} foto` : null,
      catatan ? `${catatan} catatan` : null,
    ]
      .filter(Boolean)
      .join(' · '),
  hariKe: (n: number) => `Hari ke-${n}`,
  hariKeTugas: (n: number, tugas: string) => `Hari ke-${n} · ${tugas.toLowerCase()}`,
  hariKeCatatan: (n: number) => `Hari ke-${n} · catatan`,
  jurnalKosong: 'Belum ada foto atau catatan. Foto dari tugas yang selesai masuk ke sini otomatis.',
  tambahFotoBukti: 'Tambah foto bukti',
  judulTambahJurnal: 'Tambah ke jurnal',
  catatan: 'Catatan (tidak wajib)',
  catatanContoh: 'Contoh: daun bawah mulai menguning',
  simpanJurnal: 'Simpan ke jurnal',
  isiFotoAtauCatatan: 'Isi foto atau catatan dulu',
  // ---------------------------------------------------------------- akhir siklus (T4.17)
  judulAkhir: 'Akhiri siklus',
  akhirKet:
    'Isi uang yang benar-benar kamu terima dari panen ini. Untung dihitung dari catatan pengeluaranmu.',
  pendapatanNyata: 'Pendapatan dari panen',
  pengeluaranNyata: 'Pengeluaran yang dicatat',
  untungSebenarnya: 'Untung sebenarnya',
  untungRencana: 'Untung di rencana',
  selisihRencana: 'Selisih dengan rencana',
  akhiri: 'Akhiri siklus',
  akhiriKet: 'Siklus pindah ke Sudah selesai. Lahan yang dipakai jadi kosong lagi.',
  siklusSelesai: 'Siklus ini sudah selesai.',
  isiPendapatan: 'Isi pendapatan dari panen dulu',
  kembaliKeKebun: 'Kembali ke Kebun',
  rugi: 'Dengan angka ini, kamu berpotensi rugi.',
  rugiNyata: 'Siklus ini rugi. Catat penyebabnya di jurnal supaya siklus berikutnya lebih baik.',
} as const;
