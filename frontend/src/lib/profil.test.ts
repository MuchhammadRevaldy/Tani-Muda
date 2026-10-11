import { describe, expect, it } from 'vitest';
import { ringkasLahan, statistikPetani } from './profil';

describe('statistik profil petani (T4.35)', () => {
  it('siklus selesai dan kg terjual dari bagian kiriman yang diterima', () => {
    expect(
      statistikPetani(
        [{ status: 'selesai' }, { status: 'aktif' }, { status: 'selesai' }, { status: 'rencana' }],
        [
          { status: 'diterima', jumlahKg: 15, ditolakKg: 0 },
          { status: 'ditolak_sebagian', jumlahKg: 15, ditolakKg: 2.5 },
          { status: 'dikirim', jumlahKg: 15, ditolakKg: 0 },
          { status: 'gagal', jumlahKg: 8, ditolakKg: 0 },
          { status: 'terjadwal', jumlahKg: 8, ditolakKg: 0 },
        ],
      ),
    ).toEqual({ siklusSelesai: 2, kgTerjual: 27.5 });
  });

  it('kosong', () => {
    expect(statistikPetani([], [])).toEqual({ siklusSelesai: 0, kgTerjual: 0 });
  });
});

describe('ringkasan lahan', () => {
  it('luas tanah dijumlah terpisah dari lubang hidroponik', () => {
    expect(
      ringkasLahan([
        { jenis: 'kebun', luasM2: 180, lubang: null },
        { jenis: 'pekarangan', luasM2: 20.5, lubang: null },
        { jenis: 'hidroponik', luasM2: 6, lubang: 50 },
      ]),
    ).toEqual({ jumlah: 3, luasM2: 200.5, lubang: 50 });
  });
});
