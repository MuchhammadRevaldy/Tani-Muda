/**
 * Ringkasan profil petani (T4.35, PRD P0-28): siklus selesai, kg terjual, dan ringkasan lahan.
 * Fungsi murni; data dari GET /siklus, GET /kiriman/saya, dan GET /lahan.
 */

export interface KirimanUntukStatistik {
  status: 'terjadwal' | 'dikirim' | 'diterima' | 'ditolak_sebagian' | 'gagal';
  jumlahKg: number;
  ditolakKg: number;
}

export interface StatistikPetani {
  siklusSelesai: number;
  /** Bagian kiriman yang diterima pembeli (kiriman diterima dan bagian tidak ditolak). */
  kgTerjual: number;
}

const bulat2 = (n: number) => Math.round(n * 100) / 100;

export function statistikPetani(
  siklus: { status: 'rencana' | 'aktif' | 'selesai' }[],
  kiriman: KirimanUntukStatistik[],
): StatistikPetani {
  const kg = kiriman
    .filter((k) => k.status === 'diterima' || k.status === 'ditolak_sebagian')
    .reduce((n, k) => n + Math.max(0, k.jumlahKg - k.ditolakKg), 0);
  return {
    siklusSelesai: siklus.filter((s) => s.status === 'selesai').length,
    kgTerjual: bulat2(kg),
  };
}

export interface RingkasanLahan {
  jumlah: number;
  /** Luas lahan tanah (sawah, kebun, pekarangan). */
  luasM2: number;
  /** Kapasitas lubang lahan hidroponik. */
  lubang: number;
}

export function ringkasLahan(
  lahan: {
    jenis: 'sawah' | 'kebun' | 'pekarangan' | 'hidroponik';
    luasM2: number;
    lubang: number | null;
  }[],
): RingkasanLahan {
  return {
    jumlah: lahan.length,
    luasM2: bulat2(lahan.filter((l) => l.jenis !== 'hidroponik').reduce((n, l) => n + l.luasM2, 0)),
    lubang: lahan.filter((l) => l.jenis === 'hidroponik').reduce((n, l) => n + (l.lubang ?? 0), 0),
  };
}
