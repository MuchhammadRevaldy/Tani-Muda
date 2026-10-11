/** Teks sesi, peran, dan pilih peran (T4.01, T4.34). */
import type { Peran } from '../api/tipe';

export const namaPeran: Record<Peran, string> = {
  petani: 'Petani',
  pembeli: 'Pembeli',
  mentor: 'Penyuluh',
  admin: 'Admin',
};

/** Keterangan akun di sidebar: "Petani · Lembang". */
export function keteranganAkun(peran: Peran | null, desa: string | null): string {
  const p = peran ? namaPeran[peran] : '';
  return [p, desa].filter(Boolean).join(' · ');
}

export const teksSesi = {
  galatJudul: 'Akunmu belum bisa dibuka',
  galatIsi: 'Periksa sinyal, lalu coba lagi.',
  cobaLagi: 'Coba lagi',
} as const;

export const teksPilihPeran = {
  judul: 'Lengkapi akun',
  sub: 'Pilih peran dan isi nama. Peran tidak bisa diganti sendiri setelah disimpan.',
  labelPeran: 'Peran',
  peran: {
    petani: {
      nama: 'Petani',
      keterangan: 'Hitung modal, ikuti jadwal tanam, dan ambil pesanan dari pembeli.',
    },
    pembeli: {
      nama: 'Pembeli',
      keterangan: 'Katering, restoran, warung, atau koperasi yang memesan hasil panen.',
    },
    mentor: {
      nama: 'Penyuluh atau mentor',
      keterangan: 'Menyusun dan memeriksa Resep Tanam.',
    },
  },
  labelNama: 'Nama lengkap',
  labelDesa: 'Desa lokasi lahan',
  cariDesa: 'Ketik nama desa atau kecamatan',
  bantuanDesa:
    'Dipakai untuk mencari pesanan di sekitarmu. Titik lahan tidak pernah ditampilkan ke pembeli.',
  pilihanDesa: 'Pilihan desa',
  desaKosong: 'Desa tidak ditemukan. Coba ketik nama kecamatan.',
  desaDipilih: (desa: string) => `Desa terpilih: ${desa}`,
  lokasiDesa: (kecamatan: string, kabupaten: string) => `Kec. ${kecamatan}, ${kabupaten}`,
  simpan: 'Simpan dan lanjut',
  menyimpan: 'Menyimpan…',
  pilihPeranDulu: 'Pilih peran dulu',
  isiNamaDulu: 'Isi nama dulu',
  isiDesaDulu: 'Isi desa lahanmu dulu',
} as const;
