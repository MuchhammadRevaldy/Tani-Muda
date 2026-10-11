/**
 * Teks khusus mode pengembangan (pemilih akun demo T4.01, panel kode uji T3.11). Hanya diimpor oleh
 * modul yang dimuat bila `import.meta.env.DEV`, sehingga tidak ikut build produksi (D-36; dicek
 * scripts/cek-build.mjs).
 */
export const teksPengembangan = {
  penanda: 'Mode pengembangan',
  judulAkunDemo: 'Pilih akun demo',
  subAkunDemo:
    'Masuk tanpa kode SMS memakai pengguna uji dari data tiruan. Halaman ini tidak ada di versi rilis.',
  hanyaTiruan:
    'Pemilih akun demo hanya ada saat memakai data tiruan. Masuk dengan nomor HP untuk sumber data lain.',
  masukSebagai: (nama: string) => `Masuk sebagai ${nama}`,
  daftarAkun: 'Pengguna uji',
  aturUlang: 'Atur ulang data demo',
  aturUlangKeterangan: 'Kembalikan semua data ke data contoh awal.',
  sudahDiaturUlang: 'Data demo sudah dikembalikan ke data contoh.',
  keMasuk: 'Masuk dengan nomor HP',
  kodeUji: (kode: string) => `Kode uji: ${kode}`,
  kodeUjiKeterangan: 'Tidak ada SMS di mode pengembangan. Pakai kode ini.',
  bukaAkunDemo: 'Buka pemilih akun demo',
} as const;
