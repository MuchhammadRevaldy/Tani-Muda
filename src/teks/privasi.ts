/**
 * Teks kebijakan privasi. MASIH DRAF (D-30): menunggu tinjauan pembimbing dan ahli hukum, dan wajib
 * tampil dengan label draf di mana pun teks ini dibaca pengguna.
 */
export const teksPrivasi = {
  judul: 'Kebijakan privasi',
  labelDraf: 'Draf: menunggu tinjauan pembimbing dan ahli hukum',
  pengantar: 'Isinya masih bisa berubah sebelum Tani Muda dipakai di luar uji coba.',
  butir: [
    'Yang disimpan: nomor HP, nama, desa, lahan dan siklus tanam, foto yang kamu unggah, serta catatan pesanan dan pembayaran.',
    'Titik lokasi lahan hanya terlihat olehmu dan admin. Pembeli hanya melihat nama desa dan jarak.',
    'Nomor HP dipakai untuk masuk dengan kode SMS dan tidak ditampilkan ke pengguna lain.',
    'Data tidak dijual dan tidak diberikan ke pihak lain, kecuali untuk memproses pembayaran atau bila diwajibkan hukum.',
    'Kamu bisa meminta datamu dihapus lewat kontak admin.',
  ],
  versi: (versi: string) => `Versi ${versi}`,
} as const;
