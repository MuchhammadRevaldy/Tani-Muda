/**
 * Tata letak Penggaris Umur Tanam sebagai fungsi murni.
 * Dipindahkan dari komponen PenggarisUmurTanam di pustaka desain
 * (design/extracted/assets/pustaka-komponen-tani-muda.js) supaya bisa diuji tanpa browser.
 */

export type StatusPin = 'selesai' | 'besok' | 'belum' | 'terlambat' | 'panen';
export type VarianPenggaris = 'hp' | 'lebar';

export interface JadwalPin {
  hari: number;
  label: string;
  status?: StatusPin;
}

/** Pengukur lebar teks 16px (berat 400/500/600) dalam piksel. */
export type UkurTeks = (teks: string, berat: 400 | 500 | 600) => number;

/** Pengukur cadangan bila canvas tidak tersedia (sama dengan desain: 9,5px per huruf). */
export const ukurTeksPerkiraan: UkurTeks = (teks) => Math.ceil(teks.length * 9.5);

export interface TeksPenggaris {
  hariKe: (n: number) => string;
  hariKeKecil: (n: number) => string;
  selesai: string;
  besok: string;
  terlambat: (n?: number) => string;
  hariIni: string;
  hariLagi: (n: number) => string;
  ringkasan: (hariIni: number, hariPanen: number, daftar: string) => string;
}

export interface PinTerletak {
  jadwal: JadwalPin;
  status: StatusPin;
  /** Frasa status, mis. "besok", "6 hari lagi", "terlambat 2 hari". */
  frasa: string;
  /** Kalimat lengkap untuk daftar, mis. "hari ke-14 · besok". */
  kalimat: string;
  /** Titik tengah pin pada sumbu x. */
  x: number;
  /** Lebar blok label (varian lebar) atau lebar pin (hp). */
  lebar: number;
  /** Tingkat susun (0 = paling dekat garis). */
  tingkat: number;
  /** Tepi kiri blok label. */
  kiri: number;
  /** Posisi atas pin. */
  yPin: number;
  /** Perataan label terhadap pin. */
  rata: 'kiri' | 'tengah' | 'kanan';
}

export interface TataLetakPenggaris {
  varian: VarianPenggaris;
  ukuranPin: number;
  tinggi: number;
  jalur: { kiri: number; lebar: number; atas: number; tinggi: number; lebarIsi: number };
  tik: { x: number; atas: number }[];
  ujung: { teks: string; kiri: number; atas: number }[];
  pin: PinTerletak[];
  penanda: { x: number; atas: number; tinggi: number };
  labelHariIni: { teks: string; kiri: number; atas: number };
  /** Ringkasan untuk aria-label. */
  ringkasan: string;
}

const STATUS_DIKENAL: StatusPin[] = ['selesai', 'besok', 'belum', 'terlambat', 'panen'];

export function statusPin(j: JadwalPin, hariPanen: number): StatusPin {
  if (j.status && STATUS_DIKENAL.includes(j.status)) return j.status;
  return j.hari >= hariPanen ? 'panen' : 'belum';
}

export function frasaStatus(j: JadwalPin, s: StatusPin, hariIni: number, t: TeksPenggaris): string {
  const selisih = j.hari - hariIni;
  if (s === 'selesai') return t.selesai;
  if (s === 'besok') return t.besok;
  if (s === 'terlambat') return t.terlambat(selisih < 0 ? -selisih : undefined);
  if (selisih === 0) return t.hariIni;
  if (selisih > 0) return t.hariLagi(selisih);
  return '';
}

export function hitungTataLetakPenggaris(masukan: {
  lebar: number;
  hariIni: number;
  hariPanen: number;
  jadwal: JadwalPin[];
  varian: VarianPenggaris;
  ukurTeks: UkurTeks;
  teks: TeksPenggaris;
}): TataLetakPenggaris {
  const { varian, ukurTeks, teks: t } = masukan;
  const W = Math.max(0, masukan.lebar);
  const hariPanen = Math.max(1, masukan.hariPanen || 28);
  const hariIni = Math.max(0, masukan.hariIni || 0);
  const jadwal = [...masukan.jadwal].sort((a, b) => a.hari - b.hari);

  const L = varian === 'lebar';
  const pinU = L ? 32 : 28;
  const pad = L ? 24 : 16;
  const tinggiJalur = 10;
  const tangkaiMin = L ? 14 : 10;
  const labelPinH = L ? 72 : 0;
  const langkahTingkat = pinU + 8 + labelPinH;
  const x0 = pad;
  const x1 = Math.max(pad + 1, W - pad);
  const xHari = (d: number) => x0 + (Math.min(Math.max(d, 0), hariPanen) / hariPanen) * (x1 - x0);

  const pins: PinTerletak[] = jadwal.map((j) => {
    const s = statusPin(j, hariPanen);
    const frasa = frasaStatus(j, s, hariIni, t);
    const kalimat = t.hariKeKecil(j.hari) + (frasa ? ' · ' + frasa : '');
    const lebar = L
      ? Math.max(ukurTeks(j.label, 600), ukurTeks(t.hariKe(j.hari), 400), ukurTeks(frasa, 500))
      : pinU;
    return {
      jadwal: j,
      status: s,
      frasa,
      kalimat,
      x: xHari(j.hari),
      lebar,
      tingkat: 0,
      kiri: 0,
      yPin: 0,
      rata: 'tengah',
    };
  });

  const celah = L ? 24 : 4;
  const tingkat: { kiri: number; pin: PinTerletak }[][] = [];
  const jepit = (kiri: number, w: number) =>
    L ? Math.min(Math.max(kiri, 0), Math.max(0, W - w)) : kiri;
  const kandidat = (p: PinTerletak) =>
    [p.x - p.lebar / 2, p.x + pinU / 2 - p.lebar, p.x - pinU / 2].map((k) => jepit(k, p.lebar));
  const muat = (lv: number, kiri: number, w: number) =>
    (tingkat[lv] ?? []).every(
      (a) => kiri + w + celah <= a.kiri || kiri >= a.kiri + a.pin.lebar + celah,
    );
  const taruh = (lv: number, p: PinTerletak, kiri: number) => {
    (tingkat[lv] ??= []).push({ kiri, pin: p });
    p.kiri = kiri;
    p.tingkat = lv;
  };

  for (const p of pins) {
    let ditaruh = false;
    for (let lv = 0; lv < 12 && !ditaruh; lv++) {
      const kd = kandidat(p);
      const cocok = kd.find((k) => muat(lv, k, p.lebar));
      if (cocok !== undefined) {
        taruh(lv, p, cocok);
        ditaruh = true;
        break;
      }
      // Varian lebar: coba geser label pin terakhir ke kiri agar pin ini muat di tingkat yang sama.
      const arr = tingkat[lv] ?? [];
      const akhir = arr[arr.length - 1];
      const sblm = arr[arr.length - 2];
      if (L && akhir) {
        const geser = jepit(akhir.pin.x + pinU / 2 - akhir.pin.lebar, akhir.pin.lebar);
        if (geser < akhir.kiri && (!sblm || geser >= sblm.kiri + sblm.pin.lebar + celah)) {
          const k = kd.find((v) => v >= geser + akhir.pin.lebar + celah);
          if (k !== undefined) {
            akhir.kiri = geser;
            akhir.pin.kiri = geser;
            taruh(lv, p, k);
            ditaruh = true;
          }
        }
      }
    }
    if (!ditaruh) taruh(12, p, kandidat(p)[0] ?? 0);
  }

  const maxLv = pins.reduce((m, p) => Math.max(m, p.tingkat), 0);
  const zona = pins.length ? (maxLv + 1) * langkahTingkat + tangkaiMin - 8 : 12;
  const yJalur = zona;
  const yLabel = yJalur + tinggiJalur + 12;
  const tinggi = yLabel + 32;

  const xIni = xHari(hariIni);
  const teksIni = t.hariKe(hariIni);
  const wIni = ukurTeks(teksIni, 600) + 24;
  const kiriIni = Math.min(Math.max(xIni - wIni / 2, 0), Math.max(0, W - wIni));
  const bertabrakan = (kiri: number, w: number) =>
    !(kiri + w + 12 < kiriIni || kiri > kiriIni + wIni + 12);

  const hariTik: number[] = [];
  for (let d = 7; d < hariPanen; d += 7) hariTik.push(d);
  const tik = hariTik.map((d) => ({ x: xHari(d) - 1, atas: yJalur + tinggiJalur + 3 }));

  const calonUjung: { d: number; teks: string; rata: 'kiri' | 'kanan' | 'tengah' }[] = [
    { d: 0, teks: t.hariKe(0), rata: 'kiri' },
    { d: hariPanen, teks: t.hariKe(hariPanen), rata: 'kanan' },
  ];
  if (L) for (const d of hariTik) calonUjung.push({ d, teks: t.hariKe(d), rata: 'tengah' });
  const ujung: TataLetakPenggaris['ujung'] = [];
  for (const u of calonUjung) {
    const w = ukurTeks(u.teks, 400);
    const kiri =
      u.rata === 'kiri'
        ? Math.max(0, xHari(u.d) - 12)
        : u.rata === 'kanan'
          ? Math.min(W - w, xHari(u.d) + 12 - w)
          : xHari(u.d) - w / 2;
    if (bertabrakan(kiri, w)) continue;
    if (L && pins.some((p) => p.jadwal.hari === u.d)) continue;
    ujung.push({ teks: u.teks, kiri, atas: yLabel + 5 });
  }

  for (const p of pins) {
    p.yPin = yJalur - tangkaiMin - pinU - p.tingkat * langkahTingkat;
    const tengahLabel = p.kiri + p.lebar / 2;
    p.rata = Math.abs(tengahLabel - p.x) < 1 ? 'tengah' : tengahLabel < p.x ? 'kanan' : 'kiri';
  }

  const daftar = pins.map((p) => `${p.jadwal.label}, ${p.kalimat}`).join('. ');
  return {
    varian,
    ukuranPin: pinU,
    tinggi,
    jalur: {
      kiri: x0 - 5,
      lebar: x1 - x0 + 10,
      atas: yJalur,
      tinggi: tinggiJalur,
      lebarIsi: Math.max(0, xIni - x0 + 5),
    },
    tik,
    ujung,
    pin: pins,
    penanda: { x: xIni - 2, atas: yJalur - 8, tinggi: yLabel - yJalur + 8 },
    labelHariIni: { teks: teksIni, kiri: kiriIni, atas: yLabel },
    ringkasan: t.ringkasan(hariIni, hariPanen, daftar),
  };
}
