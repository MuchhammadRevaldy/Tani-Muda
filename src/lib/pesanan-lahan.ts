/**
 * Lahan untuk pesanan (PRD P0-21; rumus "Luas per panen" dan "Luas yang dibutuhkan untuk pesanan
 * rutin"). Satuan ukuran mengikuti metode: m² untuk lahan tanah, lubang untuk hidroponik. Kapasitas
 * lahan dihitung oleh kapasitas-lahan.ts (D-15) dan dikirim sebagai argumen. Angka "6 kg" di
 * desain hanya ilustrasi; semua angka berasal dari rumus ini (D-08).
 */
import type { JenisPesanan } from '../tipe';
import type { TanggalISO } from './format';
import { berhasil, gagal, type Hasil } from './hasil';
import { tambahHari } from './tanggal';

const EPS = 1e-9;
const bulat2 = (n: number) => Math.round(n * 100) / 100;
const bulatBawah1 = (n: number) => Math.floor(n * 10 + EPS) / 10;

/** Luas (atau jumlah lubang) per panen = jumlah per kiriman ÷ hasil per satuan. */
export function luasPerPanen(jumlahKg: number, hasilPerSatuan: number): Hasil<number> {
  if (!(hasilPerSatuan > 0)) return gagal('HASIL_KOSONG');
  if (!(jumlahKg > 0)) return gagal('JUMLAH_KOSONG');
  return berhasil(bulat2(jumlahKg / hasilPerSatuan));
}

/** Jumlah petak yang tumbuh bersamaan: umur panen ÷ jarak kiriman, dibulatkan ke atas. */
export function jumlahPetakBersamaan(frekuensiHari: number, umurPanenHari: number): Hasil<number> {
  if (!Number.isInteger(frekuensiHari) || frekuensiHari < 1 || !(umurPanenHari > 0))
    return gagal('FREKUENSI_TIDAK_VALID');
  return berhasil(Math.ceil(umurPanenHari / frekuensiHari - EPS));
}

export interface KebutuhanLahanPesanan {
  luasPerPanen: number;
  jumlahPetak: number;
  /** Luas (atau lubang) total yang harus tersedia. */
  luasTotal: number;
}

/**
 * Kebutuhan lahan sebuah pesanan. Rutin: luas per panen × jumlah petak bersamaan (tanam bertahap).
 * Sekali panen: satu petak untuk jumlah total.
 */
export function kebutuhanLahanPesanan(m: {
  jenis: JenisPesanan;
  jumlahKg: number;
  hasilPerSatuan: number;
  frekuensiHari?: number;
  umurPanenHari?: number;
}): Hasil<KebutuhanLahanPesanan> {
  const luas = luasPerPanen(m.jumlahKg, m.hasilPerSatuan);
  if (!luas.ok) return luas;
  if (m.jenis === 'sekali_panen')
    return berhasil({ luasPerPanen: luas.nilai, jumlahPetak: 1, luasTotal: luas.nilai });
  const petak = jumlahPetakBersamaan(m.frekuensiHari ?? 0, m.umurPanenHari ?? 0);
  if (!petak.ok) return petak;
  return berhasil({
    luasPerPanen: luas.nilai,
    jumlahPetak: petak.nilai,
    luasTotal: bulat2(luas.nilai * petak.nilai),
  });
}

export interface PetakBertahap {
  ke: number;
  tanggalTanam: TanggalISO;
  tanggalPanen: TanggalISO;
}

/**
 * Saran tanam bertahap untuk pesanan rutin: kiriman mingguan dengan umur panen 4 minggu → 4 petak
 * berjarak 1 minggu. Petak ke-n dipanen pada kiriman ke-n.
 */
export function saranTanamBertahap(m: {
  tanggalKirimPertama: TanggalISO;
  frekuensiHari: number;
  umurPanenHari: number;
}): Hasil<PetakBertahap[]> {
  const petak = jumlahPetakBersamaan(m.frekuensiHari, m.umurPanenHari);
  if (!petak.ok) return petak;
  return berhasil(
    Array.from({ length: petak.nilai }, (_, i) => {
      const tanggalPanen = tambahHari(m.tanggalKirimPertama, i * m.frekuensiHari);
      return { ke: i + 1, tanggalTanam: tambahHari(tanggalPanen, -m.umurPanenHari), tanggalPanen };
    }),
  );
}

export interface CekAmbil {
  cukup: boolean;
  dibutuhkan: number;
  kapasitas: number;
  /** Jumlah maksimal (kg per kiriman, atau total untuk sekali panen) yang muat di lahan. */
  jumlahMaksimalKg: number;
}

/**
 * Cek "ambil sebagian" (P0-21): apakah jumlah yang ingin diambil muat di kapasitas lahan. Bila tidak,
 * beri jumlah maksimal yang disarankan (dibulatkan ke bawah ke 0,1 kg).
 */
export function cekAmbilSebagian(m: {
  jenis: JenisPesanan;
  jumlahKg: number;
  hasilPerSatuan: number;
  kapasitas: number;
  frekuensiHari?: number;
  umurPanenHari?: number;
}): Hasil<CekAmbil> {
  const butuh = kebutuhanLahanPesanan(m);
  if (!butuh.ok) return butuh;
  const kapasitas = Math.max(0, m.kapasitas);
  const jumlahMaksimalKg = bulatBawah1((kapasitas / butuh.nilai.jumlahPetak) * m.hasilPerSatuan);
  return berhasil({
    cukup: butuh.nilai.luasTotal <= kapasitas + EPS,
    dibutuhkan: butuh.nilai.luasTotal,
    kapasitas,
    jumlahMaksimalKg,
  });
}

/** Total alokasi semua petani tidak boleh melebihi pesanan (P0-21). */
export function batasAlokasi(
  jumlahPesananKg: number,
  alokasiKg: number[],
  jumlahBaruKg: number,
): Hasil<{ sisaSebelum: number; sisaSesudah: number }> {
  if (!(jumlahBaruKg > 0)) return gagal('JUMLAH_KOSONG');
  const terpakai = alokasiKg.reduce((a, b) => a + b, 0);
  const sisaSebelum = bulat2(jumlahPesananKg - terpakai);
  if (jumlahBaruKg > sisaSebelum + EPS) return gagal('MELEBIHI_PESANAN');
  return berhasil({ sisaSebelum, sisaSesudah: bulat2(sisaSebelum - jumlahBaruKg) });
}
