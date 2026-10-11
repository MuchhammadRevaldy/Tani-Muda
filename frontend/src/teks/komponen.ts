/** Teks bawaan komponen berbagi. */
export const teksKomponen = {
  banner: {
    offlineJudul: 'Kamu sedang offline',
    offlineIsi: (tertunda?: number) =>
      tertunda
        ? `${tertunda} catatan tersimpan di HP. Terkirim sendiri saat ada sinyal.`
        : 'Catatan tetap tersimpan di HP. Terkirim sendiri saat ada sinyal.',
  },
  tugas: {
    tandaiSelesai: (judul: string) => `Tandai selesai: ${judul}`,
    batalkanSelesai: (judul: string) => `Batalkan selesai: ${judul}`,
    tambahFoto: 'Tambah foto bukti',
    fotoBukti: (n: number) => `Foto bukti, ${n} foto. Tambah foto`,
    isiAngka: 'Isi angka',
    namaTipe: { sekali: 'sekali', berulang: 'berulang', ukur: 'pengukuran' },
    awalanTipe: ', tugas ',
  },
  nav: {
    label: 'Navigasi utama',
    baru: (n: number) => `, ${n} baru`,
    menuAkun: 'Menu akun',
    bukaMenuAkun: 'Buka menu akun',
  },
  dialog: { tutup: 'Tutup' },
  penggaris: {
    hariKe: (n: number) => `Hari ke-${n}`,
    hariKeKecil: (n: number) => `hari ke-${n}`,
    selesai: 'selesai',
    besok: 'besok',
    terlambat: (n?: number) => (n ? `terlambat ${n} hari` : 'terlambat'),
    hariIni: 'hari ini',
    hariLagi: (n: number) => `${n} hari lagi`,
    ringkasan: (hariIni: number, hariPanen: number, daftar: string) =>
      `Umur tanam hari ke-${hariIni} dari ${hariPanen}.${daftar ? ' ' + daftar + '.' : ''}`,
  },
  otp: {
    label: 'Kode SMS',
    digit: (i: number) => `Angka ke-${i}`,
    kirimUlangDalam: (sisa: string) => `Kirim ulang kode dalam ${sisa}`,
    kirimUlang: 'Kirim ulang kode',
  },
  stepper: { langkah: (n: number, total: number) => `Langkah ${n} dari ${total}` },
} as const;
