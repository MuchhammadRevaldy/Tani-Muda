/** Teks pusat notifikasi /profil/notifikasi ([AG-19]). */
import { teksBeranda } from './beranda';

export const teksNotifikasi = {
  judul: 'Notifikasi',
  keterangan: 'Izin pengingat di HP ini dan jadwal pengingat tiap siklus.',
  kembali: 'Profil',
  izinJudul: 'Izin notifikasi di HP ini',
  status: {
    granted: 'Diizinkan',
    denied: 'Diblokir',
    default: 'Belum ditanya',
    'tidak-didukung': 'Tidak didukung',
  },
  isi: {
    granted: 'Pengingat tugas muncul di HP ini walau Tani Muda tidak sedang dibuka.',
    denied: 'Pengingat tidak bisa muncul. Nyalakan lagi lewat pengaturan browser:',
    default: 'Tani Muda belum pernah meminta izin di HP ini. Izinkan supaya tugas tidak terlewat.',
    'tidak-didukung':
      'Browser ini belum bisa menampilkan notifikasi. Buka Tani Muda tiap pagi untuk melihat tugas.',
  },
  cara: teksBeranda.pengingatMati.cara,
  izinkan: 'Izinkan notifikasi',
  memintaIzin: 'Meminta izin…',
} as const;
