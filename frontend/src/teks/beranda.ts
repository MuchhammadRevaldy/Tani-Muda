/** Teks Beranda petani (papan 03–07, T4.09). Petani disapa "kamu". */
import type { WaktuSalam } from '../lib/beranda';
import { formatDesimal, formatTanggal, titikRibuan } from '../lib/format';

export const teksBeranda = {
  /** "Selamat pagi, Arif" (D-37). */
  salam: (waktu: WaktuSalam, nama: string) => `Selamat ${waktu}, ${nama.split(/\s+/)[0] ?? nama}`,
  /** "Sabtu, 3 Oktober · Bowan" */
  tanggalDesa: (tanggal: string, desa: string | null) =>
    [formatTanggal(tanggal), desa].filter(Boolean).join(' · '),
  bukaProfil: 'Buka profil',
  buatSiklusBaru: 'Buat siklus baru',
  pilihSiklus: 'Pilih siklus',
  // ---- kartu pemilih siklus (AG-17)
  geserKiri: 'Geser kartu siklus ke kiri',
  geserKanan: 'Geser kartu siklus ke kanan',
  untukPembeli: (pembeli: string) => `Untuk ${pembeli}`,
  hariKeDari: (n: number, umur: number) => `Hari ke-${n} dari ${umur}`,
  belumTanam: 'Belum ditanam',
  ringkasPetak: (total: number, tumbuh: number) =>
    tumbuh ? `${total} petak · ${tumbuh} tumbuh` : `${total} petak`,
  namaSiklus: (komoditas: string, lahan: string) => `${komoditas} · ${lahan}`,
  lihatJadwal: 'Lihat jadwal, modal, dan jurnal',
  ukuranLuas: (m2: number) => `${formatDesimal(m2, 1)} m²`,
  ukuranLubang: (n: number) => `${titikRibuan(n)} lubang`,
  ukuranPolybag: (n: number) => `${titikRibuan(n)} polybag`,
  /** "100 m² · hari ke-13 dari 28 · panen Minggu, 18 Oktober" */
  keteranganSiklus: (ukuran: string | null, hariKe: number, hariPanen: number, panen: string) =>
    [ukuran, `hari ke-${hariKe} dari ${hariPanen}`, `panen ${formatTanggal(panen)}`]
      .filter(Boolean)
      .join(' · '),
  besok: (judul: string) => `Besok: ${judul}`,
  besokIsi: 'Siapkan bahan dan alatnya hari ini supaya besok tinggal dikerjakan.',
  besokIsiTerlambat: (judul: string) =>
    `Selesaikan dulu ${awalKecil(judul)} yang terlambat hari ini.`,
  lihatCaranya: 'Lihat caranya',
  tugasHariIni: 'Tugas hari ini',
  jumlahTugas: (n: number) => `${n} tugas`,
  jumlahTerlambat: (n: number) => `${n} terlambat`,
  tidakAdaTugas: 'Tidak ada tugas hari ini. Kebunmu aman.',
  hariKe: (n: number) => `hari ke-${n}`,
  seharusnya: (tanggal: string) => `seharusnya ${formatTanggal(tanggal)}`,
  gagalCentang: 'Tugas belum tersimpan. Periksa sinyal, lalu centang lagi.',
  tawaranPesanan: 'Tawaran pesanan',
  hasilUkur: 'Hasil ukur terakhir',
  normalRentang: (rentang: string) => `Normal ${rentang}`,
  statusUkur: {
    normal: 'Normal',
    'terlalu-rendah': 'Terlalu rendah',
    'terlalu-tinggi': 'Terlalu tinggi',
    kosong: 'Belum diisi',
  },
  /** Pil hasil ukur di baris tugas: "pH 6,1 · normal". */
  pilHasil: (besaran: string, nilai: string, status: string) =>
    `${besaran} ${nilai} · ${awalKecil(status)}`,
  lihatRiwayatUkur: 'Lihat riwayat ukur',
  rugi: 'Dengan angka ini, kamu berpotensi rugi.',
  rentangDariResep: 'Rentang dari Resep Tanam yang dicek penyuluh.',
  modalSiklus: (nama: string) => `Modal ${nama}`,
  sudahKeluarPersen: (persen: number) => `Sudah keluar ${persen}% dari rencana`,
  sudahKeluar: 'Sudah keluar',
  dariRencana: (rp: string) => `dari ${rp}`,
  persenAria: (persen: number) => `Sudah keluar ${persen} persen dari rencana`,
  lihatRincianModal: 'Lihat rincian modal',
  perkiraanUntung: 'Perkiraan untung',
  kalauPanen: (kg: string) => `Kalau panen ${kg} kg`,
  catatanHarga:
    'Semua harga di halaman ini adalah contoh. Ubah sesuai harga di kios dan upah di desamu.',
  kosong: {
    judul: 'Mulai siklus tanam pertamamu',
    isi: 'Pilih sayur dan isi luas lahan. Tani Muda menyusun jadwal siram, pupuk, sampai panen, lengkap dengan hitungan modal.',
    tombol: 'Mulai siklus tanam',
    belajarJudul: 'Belum pernah menanam?',
    belajarIsi: 'Mulai dari modul belajar untuk pemula',
  },
  pengingatMati: {
    judul: 'Pengingat di HP-mu mati',
    isi: (tugas: string[], besok: string | null) => {
      const hariIni = tugas.length
        ? `Hari ini ada ${tugas.length} tugas: ${gabung(tugas.map(awalKecil))}.`
        : 'Hari ini tidak ada tugas.';
      const b = besok ? ` Besok ${awalKecil(besok)}.` : '';
      return `${hariIni}${b} Buka Tani Muda tiap pagi, ya.`;
    },
    aksi: 'Nyalakan pengingat',
    caraJudul: 'Cara menyalakan pengingat',
    cara: [
      'Ketuk ikon gembok atau titik tiga di sebelah alamat Tani Muda di browser.',
      'Pilih Izin situs, lalu Notifikasi.',
      'Pilih Izinkan, lalu buka lagi Tani Muda.',
    ],
  },
  offlineIsi: 'Perubahan disimpan dan dikirim saat sinyal kembali.',
} as const;

/** "a", "a, lalu b", "a, b, lalu c" (gaya papan 07). */
function gabung(daftar: string[]): string {
  if (daftar.length <= 1) return daftar.join('');
  return `${daftar.slice(0, -1).join(', ')}, lalu ${daftar[daftar.length - 1]}`;
}

/** Huruf pertama kecil tanpa mengubah singkatan: "Cek pH dan PPM" → "cek pH dan PPM". */
function awalKecil(teks: string): string {
  return teks.charAt(0).toLowerCase() + teks.slice(1);
}
