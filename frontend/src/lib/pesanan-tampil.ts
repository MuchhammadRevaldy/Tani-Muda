/**
 * Logika tampilan menu Pesanan petani (T4.18–T4.21): lencana pesanan baru (D-37), pilihan jumlah
 * "Mau ambil berapa?", posisi titik di peta pembeli, pengelompokan kiriman, dan tahap uang kiriman.
 */
import type { TanggalISO } from './format';
import type { Titik } from '../tipe';
import { jarakKm } from './jarak';

const EPS = 1e-9;

/** Jumlah pesanan yang dibuat setelah petani terakhir membuka menu Pesanan (D-37, D-39). */
export function jumlahPesananBaru(dibuatPada: string[], dilihatPada: string | null): number {
  if (!dilihatPada) return dibuatPada.length;
  const batas = Date.parse(dilihatPada);
  if (Number.isNaN(batas)) return dibuatPada.length;
  return dibuatPada.filter((w) => Date.parse(w) > batas).length;
}

/**
 * Langkah tombol − dan + menurut besar sisa pesanan: di bawah 50 kg per 1 kg, sampai 500 kg per
 * 10 kg, selebihnya per 50 kg (gabah dalam ton).
 */
export function langkahJumlah(sisaKg: number): number {
  if (sisaKg < 50) return 1;
  if (sisaKg < 500) return 10;
  return 50;
}

const bulatLangkah = (n: number, langkah: number) =>
  Math.max(langkah, Math.round(n / langkah) * langkah);

/**
 * Pilihan cepat jumlah: sekitar sepertiga dan separuh sisa, jumlah maksimal yang muat di lahan
 * (bila lebih kecil dari sisa), dan seluruh sisa. Terurut, tanpa angka ganda.
 */
export function pilihanJumlah(sisaKg: number, maksLahanKg: number | null): number[] {
  if (!(sisaKg > 0)) return [];
  const langkah = langkahJumlah(sisaKg);
  const calon = [bulatLangkah(sisaKg / 3, langkah), bulatLangkah(sisaKg / 2, langkah), sisaKg];
  if (maksLahanKg !== null && maksLahanKg > 0 && maksLahanKg < sisaKg - EPS)
    calon.push(maksLahanKg);
  return [...new Set(calon.filter((n) => n > 0 && n <= sisaKg + EPS))].sort((a, b) => a - b);
}

/** Jumlah awal: jumlah maksimal yang muat di lahan bila lebih kecil dari sisa, selain itu sisa. */
export function jumlahAwal(sisaKg: number, maksLahanKg: number | null): number {
  if (maksLahanKg !== null && maksLahanKg > 0 && maksLahanKg < sisaKg) return maksLahanKg;
  return sisaKg;
}

/**
 * Posisi titik di peta pembeli relatif terhadap kebun (pusat): x ke timur, y ke selatan, dalam
 * satuan radius (−1..1 di tepi lingkaran radius). Titik di luar radius ditahan di tepi.
 */
export function posisiPeta(pusat: Titik, titik: Titik, radiusKm: number): { x: number; y: number } {
  const timur = jarakKm(pusat, { lintang: pusat.lintang, bujur: titik.bujur });
  const utara = jarakKm(pusat, { lintang: titik.lintang, bujur: pusat.bujur });
  let x = (titik.bujur >= pusat.bujur ? timur : -timur) / radiusKm;
  let y = (titik.lintang >= pusat.lintang ? -utara : utara) / radiusKm;
  const r = Math.hypot(x, y);
  if (r > 1) {
    x /= r;
    y /= r;
  }
  const bulat = (n: number) => Math.round(n * 1000) / 1000 + 0;
  return { x: bulat(x), y: bulat(y) };
}

/**
 * Menghitung koordinat SVG (cx, cy) untuk titik-titik pembeli di peta SVG (viewBox 400×280),
 * dengan penguraian tabrakan (anti-collision / radial spread) agar titik yang berjarak sangat
 * dekat tidak saling menutupi kebunmu dan nomor pesanan lain (D-06, PRD P0-20).
 */
export function tataTitikPeta(
  pusat: Titik,
  titikDaftar: { id: string; nomor: number; titik: Titik | null }[],
  radiusKm: number,
  cxPusat = 200,
  cyPusat = 140,
  radiusPx = 120,
): { id: string; nomor: number; cx: number; cy: number }[] {
  const dasar = titikDaftar.map((item) => {
    if (!item.titik) return null;
    const pos = posisiPeta(pusat, item.titik, radiusKm);
    return {
      id: item.id,
      nomor: item.nomor,
      cx: cxPusat + pos.x * radiusPx,
      cy: cyPusat + pos.y * radiusPx,
    };
  });

  const valid = dasar.filter((x): x is NonNullable<typeof x> => x !== null);
  const hasil: { id: string; nomor: number; cx: number; cy: number }[] = [];

  // Pisahkan titik yang sangat dekat dengan kebunmu (jarak ke pusat < 30px)
  const dekatKebun = valid.filter(
    (p) => Math.hypot(p.cx - cxPusat, p.cy - cyPusat) < 30,
  );
  const jauhKebun = valid.filter(
    (p) => Math.hypot(p.cx - cxPusat, p.cy - cyPusat) >= 30,
  );

  // Jika dekat kebun, sebar mengelilingi bagian atas & samping kebun (hindari bagian bawah karena teks "Kebunmu")
  const pertamaDekat = dekatKebun[0];
  if (dekatKebun.length === 1 && pertamaDekat) {
    hasil.push({
      id: pertamaDekat.id,
      nomor: pertamaDekat.nomor,
      cx: cxPusat,
      cy: cyPusat - 34,
    });
  } else if (dekatKebun.length > 1) {
    const total = dekatKebun.length;
    const rentangAwalRad = (-150 * Math.PI) / 180;
    const rentangAkhirRad = (-30 * Math.PI) / 180;
    const langkah =
      total > 1 ? (rentangAkhirRad - rentangAwalRad) / (total - 1) : 0;
    const rSebar = 36;

    dekatKebun.forEach((p, idx) => {
      const sudut = rentangAwalRad + idx * langkah;
      hasil.push({
        id: p.id,
        nomor: p.nomor,
        cx: Math.round((cxPusat + Math.cos(sudut) * rSebar) * 10) / 10,
        cy: Math.round((cyPusat + Math.sin(sudut) * rSebar) * 10) / 10,
      });
    });
  }

  // Untuk titik-titik di luar kebun, sebar klaster yang bertabrakan (< 28px)
  const tersisa = [...jauhKebun];
  while (tersisa.length > 0) {
    const induk = tersisa.shift();
    if (!induk) break;
    const klaster: typeof valid = [induk];
    for (let i = tersisa.length - 1; i >= 0; i--) {
      const kandidat = tersisa[i];
      if (kandidat && Math.hypot(kandidat.cx - induk.cx, kandidat.cy - induk.cy) < 28) {
        klaster.push(kandidat);
        tersisa.splice(i, 1);
      }
    }

    if (klaster.length === 1) {
      const satu = klaster[0];
      if (satu) hasil.push(satu);
    } else {
      const kTotal = klaster.length;
      const rOffset = 18;
      klaster.forEach((p, idx) => {
        const sudut = (idx * 2 * Math.PI) / kTotal;
        hasil.push({
          id: p.id,
          nomor: p.nomor,
          cx: Math.round((p.cx + Math.cos(sudut) * rOffset) * 10) / 10,
          cy: Math.round((p.cy + Math.sin(sudut) * rOffset) * 10) / 10,
        });
      });
    }
  }

  return hasil;
}

// ---------------------------------------------------------------- kiriman

export type StatusKirimanTampil =
  'terjadwal' | 'dikirim' | 'diterima' | 'ditolak_sebagian' | 'gagal';

interface KirimanMinimal {
  tanggal_jadwal: TanggalISO;
  status: StatusKirimanTampil;
}

/**
 * Kelompok "Kiriman saya" (papan 33):
 * - hari ini: terjadwal atau dikirim dengan jadwal sampai hari ini (yang terlewat ikut di sini);
 * - berikutnya: terjadwal setelah hari ini, terdekat dulu;
 * - sebelumnya: sudah diterima, ditolak sebagian, atau gagal, terbaru dulu.
 */
export function kelompokKiriman<T extends KirimanMinimal>(
  daftar: T[],
  hariIni: TanggalISO,
): { hariIni: T[]; berikutnya: T[]; sebelumnya: T[] } {
  const naik = [...daftar].sort((a, b) => a.tanggal_jadwal.localeCompare(b.tanggal_jadwal));
  const terbuka = (x: T) => x.status === 'terjadwal' || x.status === 'dikirim';
  return {
    hariIni: naik.filter(
      (x) => terbuka(x) && (x.status === 'dikirim' || x.tanggal_jadwal <= hariIni),
    ),
    berikutnya: naik.filter((x) => x.status === 'terjadwal' && x.tanggal_jadwal > hariIni),
    sebelumnya: naik.filter((x) => !terbuka(x)).reverse(),
  };
}

/**
 * Tahap uang kiriman (papan 33): 0 uang muka ditahan, 1 menunggu konfirmasi, 2 dana cair;
 * null untuk kiriman yang dilaporkan gagal panen.
 */
export function tahapUang(status: StatusKirimanTampil): 0 | 1 | 2 | null {
  if (status === 'terjadwal') return 0;
  if (status === 'dikirim') return 1;
  if (status === 'gagal') return null;
  return 2;
}

/**
 * Cara tanam yang dipakai untuk pesanan di sebuah lahan: rak hidroponik → hidroponik, sawah → sawah,
 * kebun dan pekarangan → bedengan. Sama dengan pilihan resep di endpoint ambil pesanan.
 */
export function metodeUntukLahan(jenisLahan: string): 'hidroponik' | 'sawah' | 'bedengan' {
  if (jenisLahan === 'hidroponik') return 'hidroponik';
  if (jenisLahan === 'sawah') return 'sawah';
  return 'bedengan';
}
