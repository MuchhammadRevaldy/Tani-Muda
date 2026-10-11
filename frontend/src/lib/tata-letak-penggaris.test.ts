import { describe, expect, it } from 'vitest';
import {
  frasaStatus,
  hitungTataLetakPenggaris,
  statusPin,
  ukurTeksPerkiraan,
  type JadwalPin,
  type TeksPenggaris,
  type UkurTeks,
  type VarianPenggaris,
} from './tata-letak-penggaris';

const teks: TeksPenggaris = {
  hariKe: (n) => `Hari ke-${n}`,
  hariKeKecil: (n) => `hari ke-${n}`,
  selesai: 'selesai',
  besok: 'besok',
  terlambat: (n) => (n ? `terlambat ${n} hari` : 'terlambat'),
  hariIni: 'hari ini',
  hariLagi: (n) => `${n} hari lagi`,
  ringkasan: (a, b, d) => `Umur tanam hari ke-${a} dari ${b}.${d ? ' ' + d + '.' : ''}`,
};

// Pengukur deterministik untuk tes: lebar bergantung berat huruf.
const ukur: UkurTeks = (s, berat) => Math.ceil(s.length * (berat === 600 ? 10 : 9));

/**
 * Salinan algoritma penempatan pin dari pustaka desain (design/extracted/assets/pustaka-komponen-tani-muda.js),
 * hanya bagian posisi, sebagai pembanding paritas.
 */
function referensiDesain(
  W: number,
  hariIni0: number,
  hariPanen0: number,
  jadwal0: JadwalPin[],
  varian: VarianPenggaris,
) {
  const hariPanen = Math.max(1, hariPanen0 || 28);
  const hariIni = Math.max(0, hariIni0 || 0);
  const jadwal = jadwal0.slice().sort((a, b) => a.hari - b.hari);
  const L = varian === 'lebar';
  const pinU = L ? 32 : 28,
    pad = L ? 24 : 16,
    tinggiJalur = 10,
    tangkaiMin = L ? 14 : 10,
    labelPinH = L ? 72 : 0;
  const langkahLevel = pinU + 8 + labelPinH;
  const x0 = pad,
    x1 = Math.max(pad + 1, W - pad);
  const xHari = (d: number) => x0 + (Math.min(Math.max(d, 0), hariPanen) / hariPanen) * (x1 - x0);
  type P = { j: JadwalPin; x: number; w: number; kiri?: number; level?: number };
  const pins: P[] = jadwal.map((j) => {
    const s = statusPin(j, hariPanen);
    const frasa = frasaStatus(j, s, hariIni, teks);
    const w = L
      ? Math.max(ukur(j.label, 600), ukur('Hari ke-' + j.hari, 400), ukur(frasa, 500))
      : pinU;
    return { j, x: xHari(j.hari), w };
  });
  const celah = L ? 24 : 4;
  const tingkat: { kiri: number; pn: P }[][] = [];
  const jepit = (kiri: number, w: number) =>
    L ? Math.min(Math.max(kiri, 0), Math.max(0, W - w)) : kiri;
  const kandidat = (pn: P) =>
    [pn.x - pn.w / 2, pn.x + pinU / 2 - pn.w, pn.x - pinU / 2].map((k) => jepit(k, pn.w));
  const muat = (lv: number, kiri: number, w: number) => {
    const arr = tingkat[lv] || [];
    for (const a of arr)
      if (!(kiri + w + celah <= a.kiri || kiri >= a.kiri + a.pn.w + celah)) return false;
    return true;
  };
  const taruh = (lv: number, pn: P, kiri: number) => {
    (tingkat[lv] = tingkat[lv] || []).push({ kiri, pn });
    pn.kiri = kiri;
    pn.level = lv;
  };
  pins.forEach((pn) => {
    let lv: number;
    for (lv = 0; lv < 12; lv++) {
      const kd = kandidat(pn);
      for (let i = 0; i < kd.length; i++)
        if (muat(lv, kd[i]!, pn.w)) {
          taruh(lv, pn, kd[i]!);
          return;
        }
      const arr = tingkat[lv] || [],
        akhir = arr[arr.length - 1],
        sblm = arr[arr.length - 2];
      if (L && akhir) {
        const geser = jepit(akhir.pn.x + pinU / 2 - akhir.pn.w, akhir.pn.w);
        if (geser < akhir.kiri && (!sblm || geser >= sblm.kiri + sblm.pn.w + celah)) {
          for (let i = 0; i < kd.length; i++)
            if (kd[i]! >= geser + akhir.pn.w + celah) {
              akhir.kiri = geser;
              akhir.pn.kiri = geser;
              taruh(lv, pn, kd[i]!);
              return;
            }
        }
      }
    }
    taruh(lv, pn, kandidat(pn)[0]!);
  });
  const maxLv = pins.reduce((m, pn) => Math.max(m, pn.level!), 0);
  const zona = pins.length ? (maxLv + 1) * langkahLevel + tangkaiMin - 8 : 12;
  return {
    tinggi: zona + tinggiJalur + 12 + 32,
    pins: pins.map((p) => ({
      x: p.x,
      kiri: p.kiri,
      level: p.level,
      yPin: zona - tangkaiMin - pinU - p.level! * langkahLevel,
    })),
  };
}

const jadwalSawi: JadwalPin[] = [
  { hari: 7, label: 'Pupuk 1', status: 'selesai' },
  { hari: 14, label: 'Pupuk 2', status: 'besok' },
  { hari: 20, label: 'Cek hama', status: 'belum' },
  { hari: 28, label: 'Panen', status: 'panen' },
];

function hitung(
  lebar: number,
  hariIni: number,
  hariPanen: number,
  jadwal: JadwalPin[],
  varian: VarianPenggaris,
) {
  return hitungTataLetakPenggaris({
    lebar,
    hariIni,
    hariPanen,
    jadwal,
    varian,
    ukurTeks: ukur,
    teks,
  });
}

describe('paritas dengan komponen desain', () => {
  const kasus: [string, number, number, number, JadwalPin[], VarianPenggaris][] = [
    ['sawi hp 360', 360, 13, 28, jadwalSawi, 'hp'],
    ['sawi lebar 800', 800, 13, 28, jadwalSawi, 'lebar'],
    [
      'padi lebar 600',
      600,
      40,
      110,
      [
        { hari: 14, label: 'Pupuk 1', status: 'selesai' },
        { hari: 35, label: 'Pupuk 2', status: 'selesai' },
        { hari: 55, label: 'Cek hama' },
        { hari: 110, label: 'Panen' },
      ],
      'lebar',
    ],
    [
      'rapat lebar 320',
      320,
      2,
      28,
      [
        { hari: 1, label: 'Siram' },
        { hari: 2, label: 'Pupuk dasar' },
        { hari: 3, label: 'Cek benih' },
        { hari: 4, label: 'Siangi rumput' },
      ],
      'lebar',
    ],
  ];
  it.each(kasus)('%s', (_n, W, hi, hp, j, v) => {
    const kita = hitung(W, hi, hp, j, v);
    const ref = referensiDesain(W, hi, hp, j, v);
    expect(kita.tinggi).toBe(ref.tinggi);
    expect(kita.pin.map((p) => ({ x: p.x, kiri: p.kiri, level: p.tingkat, yPin: p.yPin }))).toEqual(
      ref.pins,
    );
  });
});

describe('hitungTataLetakPenggaris', () => {
  it('jadwal kosong tetap punya jalur dan penanda', () => {
    const t = hitung(360, 5, 28, [], 'hp');
    expect(t.pin).toHaveLength(0);
    expect(t.jalur.atas).toBe(12);
    expect(t.ringkasan).toBe('Umur tanam hari ke-5 dari 28.');
  });
  it('satu pin di tingkat 0', () => {
    const t = hitung(360, 0, 28, [{ hari: 14, label: 'Pupuk 2' }], 'hp');
    expect(t.pin[0]?.tingkat).toBe(0);
    expect(t.pin[0]?.status).toBe('belum');
    expect(t.pin[0]?.frasa).toBe('14 hari lagi');
  });
  it('label hari antar-tik siklus panjang tidak saling menimpa (padi 110 hari)', () => {
    const t = hitung(490, 0, 110, [{ hari: 14, label: 'Pupuk 1' }], 'lebar');
    const kotak = t.ujung
      .map((u) => ({ kiri: u.kiri, kanan: u.kiri + ukurTeksPerkiraan(u.teks, 400) }))
      .sort((a, b) => a.kiri - b.kiri);
    for (let i = 1; i < kotak.length; i++) {
      expect(kotak[i]!.kiri).toBeGreaterThan(kotak[i - 1]!.kanan);
    }
    expect(t.ujung.length).toBeGreaterThan(2);
    expect(t.ujung.length).toBeLessThan(t.tik.length);
  });
  it('pin bertabrakan di varian lebar naik tingkat', () => {
    const t = hitung(
      320,
      2,
      28,
      [
        { hari: 1, label: 'Siram' },
        { hari: 2, label: 'Pupuk dasar' },
        { hari: 3, label: 'Cek benih' },
      ],
      'lebar',
    );
    expect(Math.max(...t.pin.map((p) => p.tingkat))).toBeGreaterThan(0);
  });
  it('label tidak keluar lebar di hari ke-0 dan hari panen (lebar)', () => {
    const W = 500;
    const t = hitung(
      W,
      10,
      28,
      [
        { hari: 0, label: 'Tanam' },
        { hari: 28, label: 'Panen' },
      ],
      'lebar',
    );
    for (const p of t.pin) {
      expect(p.kiri).toBeGreaterThanOrEqual(0);
      expect(p.kiri + p.lebar).toBeLessThanOrEqual(W);
    }
    expect(t.pin[0]?.rata).toBe('kiri');
    expect(t.pin[1]?.rata).toBe('kanan');
  });
  it('hariIni melewati hariPanen dijepit di ujung jalur', () => {
    const t = hitung(360, 40, 28, jadwalSawi, 'hp');
    expect(t.penanda.x + 2).toBeCloseTo(360 - 16);
    // Sama dengan desain: isi berhenti 5px sebelum ujung jalur (jalur diberi 5px tambahan di tiap sisi).
    expect(t.jalur.lebarIsi).toBeCloseTo(t.jalur.lebar - 5);
  });
  it('label hari ini menyembunyikan label ujung yang bertabrakan', () => {
    const t = hitung(360, 0, 28, jadwalSawi, 'hp');
    expect(t.ujung.map((u) => u.teks)).not.toContain('Hari ke-0');
    expect(t.ujung.map((u) => u.teks)).toContain('Hari ke-28');
  });
  it('varian lebar menampilkan label tik mingguan kecuali di hari yang punya pin', () => {
    const t = hitung(800, 13, 28, jadwalSawi, 'lebar');
    const label = t.ujung.map((u) => u.teks);
    expect(label).toContain('Hari ke-21');
    expect(label).not.toContain('Hari ke-7');
    expect(t.tik).toHaveLength(3);
  });
  it('ringkasan untuk pembaca layar', () => {
    const t = hitung(360, 13, 28, jadwalSawi, 'hp');
    expect(t.ringkasan).toBe(
      'Umur tanam hari ke-13 dari 28. Pupuk 1, hari ke-7 · selesai. Pupuk 2, hari ke-14 · besok. Cek hama, hari ke-20 · 7 hari lagi. Panen, hari ke-28 · 15 hari lagi.',
    );
  });
  it('nilai tidak sah dibuat aman', () => {
    const t = hitung(-10, -3, 0, jadwalSawi, 'hp');
    expect(t.labelHariIni.teks).toBe('Hari ke-0');
    expect(Number.isFinite(t.tinggi)).toBe(true);
  });
});

describe('status dan frasa', () => {
  it('status bawaan dari hari panen', () => {
    expect(statusPin({ hari: 28, label: 'Panen' }, 28)).toBe('panen');
    expect(statusPin({ hari: 10, label: 'x' }, 28)).toBe('belum');
    expect(statusPin({ hari: 10, label: 'x', status: 'terlambat' }, 28)).toBe('terlambat');
  });
  it('frasa', () => {
    expect(frasaStatus({ hari: 11, label: 'x' }, 'terlambat', 13, teks)).toBe('terlambat 2 hari');
    expect(frasaStatus({ hari: 15, label: 'x' }, 'terlambat', 13, teks)).toBe('terlambat');
    expect(frasaStatus({ hari: 13, label: 'x' }, 'belum', 13, teks)).toBe('hari ini');
    expect(frasaStatus({ hari: 10, label: 'x' }, 'belum', 13, teks)).toBe('');
  });
  it('pengukur perkiraan', () => {
    expect(ukurTeksPerkiraan('abcd', 400)).toBe(38);
  });
});

describe('tangkai pin tingkat atas tidak menembus label tingkat bawah (D-44)', () => {
  it('sawi hari ke-13: Pupuk 2 (hari ke-14) di atas Siangi rumput (hari ke-11)', () => {
    const jadwal: JadwalPin[] = [
      { hari: 7, label: 'Pupuk 1', status: 'selesai' },
      { hari: 11, label: 'Siangi rumput', status: 'selesai' },
      { hari: 14, label: 'Pupuk 2', status: 'besok' },
      { hari: 20, label: 'Cek hama', status: 'belum' },
      { hari: 28, label: 'Panen', status: 'panen' },
    ];
    for (const lebar of [520, 560, 640]) {
      const t = hitungTataLetakPenggaris({
        lebar,
        hariIni: 13,
        hariPanen: 28,
        jadwal,
        varian: 'lebar',
        ukurTeks: ukur,
        teks,
      });
      for (const atas of t.pin) {
        for (const bawah of t.pin) {
          if (bawah.tingkat >= atas.tingkat) continue;
          const tembus = atas.x > bawah.kiri - 6 && atas.x < bawah.kiri + bawah.lebar + 6;
          expect(tembus, `${atas.jadwal.label} menembus ${bawah.jadwal.label} (${lebar}px)`).toBe(
            false,
          );
        }
      }
    }
  });
});
