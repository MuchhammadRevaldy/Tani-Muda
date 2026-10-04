/**
 * Kebutuhan input (PRD P0-07, rumus "Kebutuhan input" dan "Kebutuhan nutrisi hidroponik"):
 * dosis × ukuran sesuai dasar dosis, diubah ke satuan beli, lalu dibulatkan ke atas ke kelipatan
 * ukuran kemasan. Contoh PRD: 5 g/m² × 100 m² = 500 g → kemasan 1 kg → 1 kg.
 */
import type { DasarUkuran, ResepInput, ResepTanam } from '../tipe';
import { berhasil, gagal, type Hasil, type KodeGalat } from './hasil';

/** Ukuran tanam yang dikirim kalkulator. Tiap metode hanya mengisi yang relevan. */
export interface UkuranTanam {
  luasM2?: number | null;
  /** Jumlah lubang tanam (hidroponik) atau polybag. */
  jumlahTanaman?: number | null;
  /** Volume larutan per pengisian (liter), mis. volume tandon hidroponik. */
  volumeLarutanLiter?: number | null;
}

export interface Kebutuhan {
  /** Kebutuhan dalam satuan dosis sebelum dibulatkan, mis. 500 (g). */
  kebutuhanDosis: number;
  satuanDosis: string;
  /** Kebutuhan dalam satuan beli sebelum dibulatkan, mis. 0,5 (kg). */
  kebutuhanBeli: number;
  /** Jumlah yang dibeli, sudah dibulatkan ke atas ke kelipatan kemasan, mis. 1 (kg). */
  jumlahBeli: number;
  satuanBeli: string;
}

/** Satuan fisik yang bisa saling dikonversi: nilai satuan dalam satuan dasarnya. */
const SATUAN_FISIK: Record<string, { dasar: string; nilai: number }> = {
  g: { dasar: 'g', nilai: 1 },
  kg: { dasar: 'g', nilai: 1000 },
  ton: { dasar: 'g', nilai: 1_000_000 },
  ml: { dasar: 'ml', nilai: 1 },
  liter: { dasar: 'ml', nilai: 1000 },
};

const EPS = 1e-9;
const bulat6 = (n: number) => Math.round(n * 1e6) / 1e6;

/** Berapa satuan beli untuk satu satuan dosis. */
export function faktorSatuan(
  satuanDosis: string,
  satuanBeli: string,
  isiSatuanBeli?: number,
): Hasil<number> {
  if (isiSatuanBeli !== undefined) {
    if (!(isiSatuanBeli > 0)) return gagal('ISI_KEMASAN_KOSONG');
    return berhasil(1 / isiSatuanBeli);
  }
  if (satuanDosis === satuanBeli) return berhasil(1);
  const a = SATUAN_FISIK[satuanDosis];
  const b = SATUAN_FISIK[satuanBeli];
  if (!a || !b || a.dasar !== b.dasar) return gagal('SATUAN_TIDAK_COCOK');
  return berhasil(a.nilai / b.nilai);
}

/** Bulatkan ke atas ke kelipatan ukuran kemasan. 1,01 kg dengan kemasan 1 kg → 2 kg. */
export function bulatkanKeKemasan(jumlah: number, ukuranKemasan: number): Hasil<number> {
  if (!(ukuranKemasan > 0)) return gagal('KEMASAN_TIDAK_VALID');
  if (jumlah < 0) return gagal('JUMLAH_NEGATIF');
  const q = jumlah / ukuranKemasan;
  const n = Math.abs(q - Math.round(q)) < EPS ? Math.round(q) : Math.ceil(q);
  return berhasil(bulat6(n * ukuranKemasan));
}

const GALAT_UKURAN: Record<DasarUkuran, KodeGalat> = {
  luas: 'LUAS_KOSONG',
  lubang: 'LUBANG_KOSONG',
  polybag: 'POLYBAG_KOSONG',
};

/**
 * Validasi ukuran utama sesuai metode. Kosong atau 0 → kode per metode ("Isi luas lahan dulu",
 * "Isi jumlah lubang tanam dulu", "Isi jumlah polybag dulu"); negatif → UKURAN_NEGATIF.
 */
export function validasiUkuran(dasarUkuran: DasarUkuran, ukuran: UkuranTanam): Hasil<number> {
  const v = dasarUkuran === 'luas' ? ukuran.luasM2 : ukuran.jumlahTanaman;
  if (v === null || v === undefined || Number.isNaN(v) || v === 0)
    return gagal(GALAT_UKURAN[dasarUkuran]);
  if (v < 0) return gagal('UKURAN_NEGATIF');
  return berhasil(v);
}

function pengali(input: ResepInput, ukuran: UkuranTanam, jumlahPengisian: number): Hasil<number> {
  const positif = (v: number | null | undefined, galat: KodeGalat): Hasil<number> =>
    v === null || v === undefined || Number.isNaN(v) || v <= 0 ? gagal(galat) : berhasil(v);
  switch (input.dasarDosis) {
    case 'per_m2':
      return positif(ukuran.luasM2, 'LUAS_KOSONG');
    case 'per_tanaman':
      return positif(ukuran.jumlahTanaman, 'UKURAN_KOSONG');
    case 'per_liter': {
      const v = positif(ukuran.volumeLarutanLiter, 'VOLUME_KOSONG');
      return v.ok ? berhasil(v.nilai * jumlahPengisian) : v;
    }
    case 'per_siklus':
      return berhasil(1);
  }
}

/** Kebutuhan satu input resep untuk ukuran tertentu. */
export function hitungKebutuhan(
  input: ResepInput,
  ukuran: UkuranTanam,
  jumlahPengisian = 1,
): Hasil<Kebutuhan> {
  if (input.dosis < 0) return gagal('DOSIS_NEGATIF');
  const kali = pengali(input, ukuran, jumlahPengisian);
  if (!kali.ok) return kali;
  const faktor = faktorSatuan(input.satuanDosis, input.satuanBeli, input.isiSatuanBeli);
  if (!faktor.ok) return faktor;
  const kebutuhanDosis = bulat6(input.dosis * kali.nilai);
  const kebutuhanBeli = bulat6(kebutuhanDosis * faktor.nilai);
  const jumlahBeli = bulatkanKeKemasan(kebutuhanBeli, input.ukuranKemasan);
  if (!jumlahBeli.ok) return jumlahBeli;
  return berhasil({
    kebutuhanDosis,
    satuanDosis: input.satuanDosis,
    kebutuhanBeli,
    jumlahBeli: jumlahBeli.nilai,
    satuanBeli: input.satuanBeli,
  });
}

export interface KebutuhanItem extends Kebutuhan {
  inputId: string;
  nama: string;
  grup: string;
  alatSekaliBeli: boolean;
  hargaContoh: number | null;
}

/** Kebutuhan semua input resep. Ukuran divalidasi dulu dengan kode galat per metode. */
export function hitungKebutuhanResep(
  resep: ResepTanam,
  dasarUkuran: DasarUkuran,
  ukuran: UkuranTanam,
): Hasil<KebutuhanItem[]> {
  const valid = validasiUkuran(dasarUkuran, ukuran);
  if (!valid.ok) return valid;
  const hasil: KebutuhanItem[] = [];
  for (const input of resep.input) {
    const k = hitungKebutuhan(input, ukuran, resep.jumlahPengisianLarutan ?? 1);
    if (!k.ok) return k;
    hasil.push({
      ...k.nilai,
      inputId: input.id,
      nama: input.nama,
      grup: input.grup,
      alatSekaliBeli: input.alatSekaliBeli,
      hargaContoh: input.hargaContoh,
    });
  }
  return berhasil(hasil);
}
