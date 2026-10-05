/**
 * Tugas pengukuran pH dan PPM (PRD P0-37; rumus "Status pengukuran"):
 * normal bila batas bawah ≤ nilai ≤ batas atas; di bawah → terlalu rendah; di atas → terlalu tinggi.
 * Hasil di luar rentang menambah tugas "Ukur ulang" pada hari berikutnya.
 */
import type { BesaranUkur, HasilPengukuran, StatusPengukuran } from '../tipe';
import { parseAngka, type TanggalISO } from './format';
import { berhasil, gagal, type Hasil, type KodeGalat } from './hasil';
import { bandingTanggal, tambahHari } from './tanggal';

/**
 * Status pengukuran. "Belum diisi" ditandai null (D-34); nilai 0 sah dan dinilai seperti angka lain,
 * mis. PPM 0 → terlalu rendah.
 */
export function nilaiPengukuran(
  nilai: number | null | undefined,
  batasBawah: number,
  batasAtas: number,
): StatusPengukuran {
  if (nilai === null || nilai === undefined || Number.isNaN(nilai)) return 'kosong';
  if (nilai < batasBawah) return 'terlalu-rendah';
  if (nilai > batasAtas) return 'terlalu-tinggi';
  return 'normal';
}

/** Validasi nilai terhadap skala sah besaran (pH 0–14, PPM minimal 0). */
export function validasiNilaiUkur(
  nilai: number,
  besaran: Pick<BesaranUkur, 'skalaMin' | 'skalaMaks'>,
): Hasil<number> {
  if (Number.isNaN(nilai) || nilai < besaran.skalaMin) return gagal('NILAI_DI_LUAR_SKALA');
  if (besaran.skalaMaks !== null && nilai > besaran.skalaMaks) return gagal('NILAI_DI_LUAR_SKALA');
  return berhasil(nilai);
}

/**
 * Dari ketikan pengguna ("6,2") ke nilai dan status. Kosong → null dan status "kosong". Angka di
 * luar skala alat ukur → galat `NILAI_DI_LUAR_SKALA` dan status "kosong" (belum bisa dinilai).
 */
export function nilaiDariTeks(
  teks: string,
  besaran: Pick<BesaranUkur, 'batasBawah' | 'batasAtas' | 'skalaMin' | 'skalaMaks'>,
): { nilai: number | null; status: StatusPengukuran; galat: KodeGalat | null } {
  const nilai = parseAngka(teks);
  if (nilai === null) return { nilai: null, status: 'kosong', galat: null };
  const valid = validasiNilaiUkur(nilai, besaran);
  if (!valid.ok) return { nilai, status: 'kosong', galat: valid.galat };
  return {
    nilai,
    status: nilaiPengukuran(nilai, besaran.batasBawah, besaran.batasAtas),
    galat: null,
  };
}

/** Saran tindakan dari resep untuk status di luar rentang; null bila normal atau kosong. */
export function saranPengukuran(status: StatusPengukuran, besaran: BesaranUkur): string | null {
  if (status === 'terlalu-rendah') return besaran.saranTerlaluRendah;
  if (status === 'terlalu-tinggi') return besaran.saranTerlaluTinggi;
  return null;
}

/** Tanggal tugas "Ukur ulang" bila ada besaran di luar rentang; null bila semua normal atau kosong. */
export function perluUkurUlang(
  status: StatusPengukuran[],
  tanggalUkur: TanggalISO,
): TanggalISO | null {
  return status.some((s) => s === 'terlalu-rendah' || s === 'terlalu-tinggi')
    ? tambahHari(tanggalUkur, 1)
    : null;
}

/**
 * Posisi nilai pada batang rentang (0 = kiri, 1 = kanan). Rentang normal menempati bagian tengah;
 * `tepi` = lebar tambahan di kiri dan kanan dalam kelipatan lebar rentang normal.
 */
export function posisiPadaSkala(
  nilai: number,
  batasBawah: number,
  batasAtas: number,
  tepi = 0.5,
): number {
  const lebar = batasAtas - batasBawah;
  if (!(lebar > 0)) return 0.5;
  const min = batasBawah - lebar * tepi;
  const maks = batasAtas + lebar * tepi;
  return Math.min(1, Math.max(0, (nilai - min) / (maks - min)));
}

export interface TitikGrafik {
  tanggal: TanggalISO;
  nilai: number;
  status: StatusPengukuran;
  /** Posisi vertikal 0 (bawah) sampai 1 (atas). */
  y: number;
}

export interface Grafik {
  titik: TitikGrafik[];
  /** Pita rentang normal dalam posisi vertikal yang sama. */
  pita: { bawah: number; atas: number };
}

/** Grafik kecil untuk n pengukuran terakhir satu besaran (P0-37: tujuh terakhir). */
export function titikGrafik(
  riwayat: HasilPengukuran[],
  besaran: Pick<BesaranUkur, 'nama' | 'batasBawah' | 'batasAtas'>,
  jumlah = 7,
): Grafik {
  const data = riwayat
    .filter((h) => h.besaran === besaran.nama && h.status !== 'kosong')
    .sort((a, b) => bandingTanggal(a.tanggal, b.tanggal))
    .slice(-jumlah);
  const lebar = besaran.batasAtas - besaran.batasBawah || 1;
  const min = Math.min(besaran.batasBawah - lebar * 0.5, ...data.map((d) => d.nilai));
  const maks = Math.max(besaran.batasAtas + lebar * 0.5, ...data.map((d) => d.nilai));
  const y = (v: number) => (v - min) / (maks - min);
  return {
    titik: data.map((d) => ({
      tanggal: d.tanggal,
      nilai: d.nilai,
      status: d.status,
      y: y(d.nilai),
    })),
    pita: { bawah: y(besaran.batasBawah), atas: y(besaran.batasAtas) },
  };
}
