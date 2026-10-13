/** Teks pusat notifikasi /profil/notifikasi ([AG-19]). */
import { teksBeranda } from './beranda';

export const teksNotifikasi = {
  judul: 'Notifikasi',
  keterangan: 'Izin pengingat di perangkat ini dan jadwal pengingat tiap siklus.',
  kembali: 'Profil',
  izinJudul: 'Izin notifikasi di perangkat ini',
  status: {
    granted: 'Diizinkan',
    denied: 'Diblokir',
    default: 'Belum ditanya',
    'tidak-didukung': 'Tidak didukung',
  },
  isi: {
    // Langganan push belum tersedia di backend demo ([AG-21]); endpoint langganan tidak dipanggil.
    granted:
      'Pengingat lewat HP aktif di versi berikutnya. Untuk sekarang, tugas hari ini tampil di Beranda.',
    denied: 'Pengingat tidak bisa muncul. Nyalakan lagi lewat pengaturan browser:',
    default:
      'Tani Muda belum pernah meminta izin di perangkat ini. Izinkan supaya tugas tidak terlewat.',
    'tidak-didukung':
      'Browser ini belum bisa menampilkan notifikasi. Buka Tani Muda tiap pagi untuk melihat tugas.',
  },
  cara: teksBeranda.pengingatMati.cara,
  izinkan: 'Izinkan notifikasi',
  memintaIzin: 'Meminta izin…',
} as const;
