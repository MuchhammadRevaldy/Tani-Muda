import { describe, expect, it } from 'vitest';
import {
  jumlahAwal,
  jumlahPesananBaru,
  kelompokKiriman,
  langkahJumlah,
  metodeUntukLahan,
  pilihanJumlah,
  posisiPeta,
  tahapUang,
  tataTitikPeta,
  type StatusKirimanTampil,
} from './pesanan-tampil';

describe('jumlahPesananBaru (D-37)', () => {
  const dibuat = ['2026-10-01T03:00:00Z', '2026-10-04T03:00:00Z', '2026-10-06T03:00:00Z'];
  it('belum pernah membuka menu: semua dihitung', () => {
    expect(jumlahPesananBaru(dibuat, null)).toBe(3);
    expect(jumlahPesananBaru(dibuat, 'rusak')).toBe(3);
  });
  it('hanya yang dibuat setelah terakhir dibuka', () => {
    expect(jumlahPesananBaru(dibuat, '2026-10-04T03:00:00Z')).toBe(1);
    expect(jumlahPesananBaru(dibuat, '2026-10-07T00:00:00Z')).toBe(0);
  });
});

describe('pilihan jumlah', () => {
  it.each([
    [10, 1],
    [49.5, 1],
    [50, 10],
    [499, 10],
    [1450, 50],
  ])('sisa %s kg → langkah %s', (sisa, langkah) => {
    expect(langkahJumlah(sisa)).toBe(langkah);
  });
  it('sepertiga, separuh, sisa, dan maksimal lahan bila lebih kecil', () => {
    expect(pilihanJumlah(10, 6)).toEqual([3, 5, 6, 10]);
    expect(pilihanJumlah(5, 7.5)).toEqual([2, 3, 5]);
    expect(pilihanJumlah(5, 1.5)).toEqual([1.5, 2, 3, 5]);
    expect(pilihanJumlah(1450, null)).toEqual([500, 750, 1450]);
    expect(pilihanJumlah(1, null)).toEqual([1]);
  });
  it('sisa kosong tidak punya pilihan', () => {
    expect(pilihanJumlah(0, 5)).toEqual([]);
  });
  it('jumlah awal: maksimal lahan bila lebih kecil dari sisa', () => {
    expect(jumlahAwal(10, 6)).toBe(6);
    expect(jumlahAwal(5, 7.5)).toBe(5);
    expect(jumlahAwal(5, null)).toBe(5);
    expect(jumlahAwal(5, 0)).toBe(5);
  });
});

describe('posisiPeta', () => {
  const pusat = { lintang: -6.8, bujur: 107.6 };
  it('pusat di tengah; timur ke kanan, utara ke atas', () => {
    expect(posisiPeta(pusat, pusat, 10)).toEqual({ x: 0, y: 0 });
    const timur = posisiPeta(pusat, { lintang: -6.8, bujur: 107.645 }, 10);
    expect(timur.x).toBeGreaterThan(0.45);
    expect(timur.y).toBe(0);
    const utara = posisiPeta(pusat, { lintang: -6.755, bujur: 107.6 }, 10);
    expect(utara.y).toBeLessThan(-0.45);
    const baratDaya = posisiPeta(pusat, { lintang: -6.82, bujur: 107.58 }, 10);
    expect(baratDaya.x).toBeLessThan(0);
    expect(baratDaya.y).toBeGreaterThan(0);
  });
  it('titik di luar radius ditahan di tepi lingkaran', () => {
    const p = posisiPeta(pusat, { lintang: -6.8, bujur: 107.9 }, 10);
    expect(p).toEqual({ x: 1, y: 0 });
  });
});

describe('tataTitikPeta (anti-tabrakan dan sebar titik)', () => {
  const pusat = { lintang: -7.628, bujur: 110.702 };

  it('menyebarkan titik yang identik dengan titik kebun agar tidak menumpuk', () => {
    const titik = [
      { id: '1', nomor: 1, titik: pusat },
      { id: '2', nomor: 2, titik: pusat },
      { id: '3', nomor: 3, titik: pusat },
    ];

    const hasil = tataTitikPeta(pusat, titik, 10);
    expect(hasil).toHaveLength(3);

    // Pastikan tidak ada titik yang persis di (200, 140) menutupi kebun
    for (const h of hasil) {
      expect(Math.hypot(h.cx - 200, h.cy - 140)).toBeGreaterThan(25);
    }

    // Pastikan titik 1, 2, dan 3 berjarak satu sama lain (tidak bertumpuk)
    const p0 = hasil[0]!;
    const p1 = hasil[1]!;
    const p2 = hasil[2]!;
    const d12 = Math.hypot(p0.cx - p1.cx, p0.cy - p1.cy);
    const d23 = Math.hypot(p1.cx - p2.cx, p1.cy - p2.cy);
    expect(d12).toBeGreaterThan(20);
    expect(d23).toBeGreaterThan(20);
  });

  it('titik tunggal di kebun diposisikan rapi di atas kebun', () => {
    const hasil = tataTitikPeta(pusat, [{ id: '1', nomor: 1, titik: pusat }], 10);
    expect(hasil).toHaveLength(1);
    const p0 = hasil[0]!;
    expect(p0.cx).toBe(200);
    expect(p0.cy).toBe(106); // 140 - 34
  });
});

describe('kiriman', () => {
  const k = (id: string, tanggal_jadwal: string, status: StatusKirimanTampil) => ({
    id,
    tanggal_jadwal,
    status,
  });
  it('kelompok hari ini, berikutnya, sebelumnya', () => {
    const g = kelompokKiriman(
      [
        k('a', '2026-10-14', 'terjadwal'),
        k('b', '2026-10-07', 'dikirim'),
        k('c', '2026-09-30', 'ditolak_sebagian'),
        k('d', '2026-09-23', 'diterima'),
        k('e', '2026-10-06', 'terjadwal'),
        k('f', '2026-10-21', 'gagal'),
        k('g', '2026-10-05', 'dikirim'),
      ],
      '2026-10-07',
    );
    expect(g.hariIni.map((x) => x.id)).toEqual(['g', 'e', 'b']);
    expect(g.berikutnya.map((x) => x.id)).toEqual(['a']);
    expect(g.sebelumnya.map((x) => x.id)).toEqual(['f', 'c', 'd']);
  });
  it.each([
    ['terjadwal', 0],
    ['dikirim', 1],
    ['diterima', 2],
    ['ditolak_sebagian', 2],
    ['gagal', null],
  ] as const)('tahap uang %s → %s', (status, tahap) => {
    expect(tahapUang(status)).toBe(tahap);
  });
});

describe('metodeUntukLahan', () => {
  it.each([
    ['hidroponik', 'hidroponik'],
    ['sawah', 'sawah'],
    ['kebun', 'bedengan'],
    ['pekarangan', 'bedengan'],
  ])('%s → %s', (jenis, metode) => {
    expect(metodeUntukLahan(jenis)).toBe(metode);
  });
});
