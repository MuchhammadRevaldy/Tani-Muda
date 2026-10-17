import { describe, expect, it } from 'vitest';
import {
  MINUS,
  formatBulan,
  formatDesimal,
  formatHitungMundur,
  formatJam,
  formatJarak,
  formatKisaran,
  formatRupiah,
  formatTanggal,
  formatTanggalPendek,
  namaHari,
  parseAngka,
  terbilang,
  titikRibuan,
} from './format';

/** Salinan fungsi pustaka desain (design/extracted/assets/pustaka-komponen-tani-muda.js) sebagai pembanding. */
const desain = (() => {
  const titik = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const S = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ];
  const eja = (n: number): string => {
    if (n < 12) return S[n]!;
    if (n < 20) return eja(n - 10) + ' belas';
    if (n < 100) return eja(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + eja(n % 10) : '');
    if (n < 200) return 'seratus' + (n - 100 ? ' ' + eja(n - 100) : '');
    if (n < 1000) return eja(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + eja(n % 100) : '');
    if (n < 2000) return 'seribu' + (n - 1000 ? ' ' + eja(n - 1000) : '');
    if (n < 1e6) return eja(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + eja(n % 1000) : '');
    if (n < 1e9) return eja(Math.floor(n / 1e6)) + ' juta' + (n % 1e6 ? ' ' + eja(n % 1e6) : '');
    if (n < 1e12) return eja(Math.floor(n / 1e9)) + ' miliar' + (n % 1e9 ? ' ' + eja(n % 1e9) : '');
    return eja(Math.floor(n / 1e12)) + ' triliun' + (n % 1e12 ? ' ' + eja(n % 1e12) : '');
  };
  return {
    rupiah: (n: number) => (n < 0 ? '−' : '') + 'Rp' + titik(Math.round(Math.abs(n))),
    terbilang: (n: number) => {
      const b = Math.floor(Math.abs(n));
      const k = b === 0 ? 'nol' : eja(b);
      return k.charAt(0).toUpperCase() + k.slice(1) + ' rupiah';
    },
  };
})();

const NILAI_UJI = [
  0, 1, 9, 11, 12, 19, 20, 21, 99, 100, 101, 110, 199, 200, 999, 1000, 1001, 1999, 2000, 5000,
  12500, 99999, 100000, 430000, 1000000, 1250000, 1289000, 1000000000, 2500000000000, 9999999999999,
];

describe('titikRibuan', () => {
  it('menyisipkan titik setiap tiga digit', () => {
    expect(titikRibuan(0)).toBe('0');
    expect(titikRibuan(999)).toBe('999');
    expect(titikRibuan(1000)).toBe('1.000');
    expect(titikRibuan(1250000)).toBe('1.250.000');
  });
  it('memakai nilai mutlak dan membuang pecahan', () => {
    expect(titikRibuan(-4500)).toBe('4.500');
    expect(titikRibuan(1234.9)).toBe('1.234');
  });
});

describe('formatRupiah', () => {
  it('menulis rupiah lengkap tanpa spasi', () => {
    expect(formatRupiah(1250000)).toBe('Rp1.250.000');
    expect(formatRupiah(430000)).toBe('Rp430.000');
    expect(formatRupiah(0)).toBe('Rp0');
  });
  it('negatif memakai minus tipografis', () => {
    expect(formatRupiah(-80000)).toBe(`${MINUS}Rp80.000`);
  });
  it('kosong untuk nilai tidak ada', () => {
    expect(formatRupiah(null)).toBe('');
    expect(formatRupiah(undefined)).toBe('');
    expect(formatRupiah(Number.NaN)).toBe('');
  });
  it('pecahan kecil negatif tidak menjadi "−Rp0"', () => {
    expect(formatRupiah(-0.4)).toBe('Rp0');
  });
  it('sama dengan pustaka desain untuk 30 nilai uji', () => {
    for (const n of NILAI_UJI) {
      expect(formatRupiah(n)).toBe(desain.rupiah(n));
      expect(formatRupiah(-n || 0)).toBe(desain.rupiah(-n || 0));
    }
  });
});

describe('terbilang', () => {
  it('mengeja angka Indonesia', () => {
    expect(terbilang(0)).toBe('Nol rupiah');
    expect(terbilang(12)).toBe('Dua belas rupiah');
    expect(terbilang(100)).toBe('Seratus rupiah');
    expect(terbilang(1000)).toBe('Seribu rupiah');
    expect(terbilang(5000)).toBe('Lima ribu rupiah');
    expect(terbilang(100000)).toBe('Seratus ribu rupiah');
    expect(terbilang(1250000)).toBe('Satu juta dua ratus lima puluh ribu rupiah');
  });
  it('angka 13 digit', () => {
    expect(terbilang(1000000000000)).toBe('Satu triliun rupiah');
  });
  it('negatif diberi kata minus, pecahan diabaikan', () => {
    expect(terbilang(-5000)).toBe('Minus lima ribu rupiah');
    expect(terbilang(1500.75)).toBe('Seribu lima ratus rupiah');
  });
  it('kosong untuk nilai tidak ada', () => {
    expect(terbilang(null)).toBe('');
    expect(terbilang(undefined)).toBe('');
    expect(terbilang(Number.NaN)).toBe('');
  });
  it('sama dengan pustaka desain untuk 30 nilai uji', () => {
    for (const n of NILAI_UJI) expect(terbilang(n)).toBe(desain.terbilang(n));
  });
});

describe('formatJarak', () => {
  it('formatJarak: koma desimal dan kurang dari 1 km', () => {
    expect(formatJarak(0)).toBe('kurang dari 1 km');
    expect(formatJarak(0.6)).toBe('kurang dari 1 km');
    expect(formatJarak(0.99)).toBe('kurang dari 1 km');
    expect(formatJarak(1)).toBe('1 km');
    expect(formatJarak(1.8)).toBe('1,8 km');
    expect(formatJarak(9.5)).toBe('9,5 km');
    expect(formatJarak(12.3)).toBe('12 km');
    expect(formatJarak(null)).toBe('');
    expect(formatJarak(undefined)).toBe('');
  });
});

describe('formatDesimal', () => {
  it('memakai koma desimal dan titik ribuan', () => {
    expect(formatDesimal(6.1)).toBe('6,1');
    expect(formatDesimal(3.5)).toBe('3,5');
    expect(formatDesimal(1250.5)).toBe('1.250,5');
    expect(formatDesimal(100)).toBe('100');
  });
  it('membulatkan sesuai jumlah digit', () => {
    expect(formatDesimal(6.25, 1)).toBe('6,3');
    expect(formatDesimal(0.1234, 3)).toBe('0,123');
    expect(formatDesimal(2, 0)).toBe('2');
  });
  it('digit tetap', () => {
    expect(formatDesimal(6, 1, true)).toBe('6,0');
  });
  it('negatif dan NaN', () => {
    expect(formatDesimal(-2.5)).toBe(`${MINUS}2,5`);
    expect(formatDesimal(-0.01)).toBe('0');
    expect(formatDesimal(Number.NaN)).toBe('');
  });
});

describe('parseAngka', () => {
  it('membaca format Indonesia', () => {
    expect(parseAngka('1.250,5')).toBe(1250.5);
    expect(parseAngka('6,2')).toBe(6.2);
    expect(parseAngka(' 100 ')).toBe(100);
    expect(parseAngka('1.250.000')).toBe(1250000);
    expect(parseAngka('0')).toBe(0);
    expect(parseAngka('-3')).toBe(-3);
    expect(parseAngka(`${MINUS}3`)).toBe(-3);
    expect(parseAngka('3,')).toBe(3);
  });
  it('kosong atau tidak valid menjadi null', () => {
    expect(parseAngka('')).toBeNull();
    expect(parseAngka('   ')).toBeNull();
    expect(parseAngka(null)).toBeNull();
    expect(parseAngka(undefined)).toBeNull();
    expect(parseAngka('abc')).toBeNull();
    expect(parseAngka('1,2,3')).toBeNull();
    expect(parseAngka('-')).toBeNull();
    expect(parseAngka(',')).toBeNull();
  });
});

describe('formatHitungMundur', () => {
  it('menit dan detik', () => {
    expect(formatHitungMundur(42)).toBe('0:42');
    expect(formatHitungMundur(125)).toBe('2:05');
    expect(formatHitungMundur(0)).toBe('0:00');
    expect(formatHitungMundur(-5)).toBe('0:00');
    expect(formatHitungMundur(41.2)).toBe('0:42');
  });
});

describe('formatJam', () => {
  it('memakai titik dan nol di depan', () => {
    expect(formatJam(6)).toBe('06.00');
    expect(formatJam(16, 0)).toBe('16.00');
    expect(formatJam(5, 30)).toBe('05.30');
  });
});

describe('tanggal', () => {
  it('nama hari dan bulan Indonesia', () => {
    expect(formatTanggal('2026-10-03')).toBe('Sabtu, 3 Oktober');
    expect(formatTanggal('2026-10-04')).toBe('Minggu, 4 Oktober');
    expect(formatTanggal('2026-11-02', { denganTahun: true })).toBe('Senin, 2 November 2026');
    expect(formatTanggal('2026-09-20', { tanpaHari: true })).toBe('20 September');
    expect(formatTanggalPendek('2026-10-05')).toBe('5 Okt');
  });
  it('nama bulan dari YYYY-MM', () => {
    expect(formatBulan('2026-12')).toBe('Desember');
    expect(formatBulan('2027-01', { denganTahun: true })).toBe('Januari 2027');
    expect(() => formatBulan('2026-13')).toThrow();
    expect(() => formatBulan('Desember')).toThrow();
  });
  it('semua nama hari', () => {
    const tanggal = [
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
    ];
    expect(tanggal.map(namaHari)).toEqual([
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ]);
  });
  it('semua nama bulan', () => {
    const bulan = Array.from(
      { length: 12 },
      (_, i) =>
        formatTanggal(`2027-${String(i + 1).padStart(2, '0')}-01`, { tanpaHari: true }).split(
          ' ',
        )[1],
    );
    expect(bulan).toEqual([
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]);
  });
  it('menolak format salah dan tanggal yang tidak ada', () => {
    expect(() => formatTanggal('3/10/2026')).toThrow();
    expect(() => formatTanggal('2026-02-30')).toThrow();
    expect(formatTanggal('2028-02-29')).toBe('Selasa, 29 Februari');
  });
});

describe('formatKisaran', () => {
  it('memakai en dash', () => {
    expect(formatKisaran(5.5, 6.5)).toBe('5,5–6,5');
    expect(formatKisaran(1050, 1400, titikRibuan)).toBe('1.050–1.400');
  });
});
