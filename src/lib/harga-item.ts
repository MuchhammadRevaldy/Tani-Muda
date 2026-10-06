/**
 * Harga satuan efektif sebuah item kalkulator, subsidi, dan daftar merek
 * (PRD P0-08, P0-09, P0-34, P0-35). Urutan prioritas harga:
 * subsidi aktif → harga isi sendiri → merek terpilih → rata-rata sekitar → harga contoh resep.
 * Promo sengaja tidak menjadi masukan fungsi mana pun di sini, jadi tidak bisa mengubah urutan.
 */
import type { TanggalISO } from './format';
import { berhasil, gagal, type Hasil } from './hasil';
import { selisihHari } from './tanggal';
import type { KelayakanSubsidi, LaporanHarga, MerekInput } from '../tipe';

export type SumberHarga =
  'subsidi' | 'isi_sendiri' | 'merek' | 'rata_sekitar' | 'contoh_resep' | 'belum_ada';

export interface KonteksSubsidi {
  /** Jawaban petani: apakah ia terdaftar dan mendapat jatah subsidi (P0-09). */
  dapatJatahSubsidi: boolean;
  komoditasId: string;
  tanggal: TanggalISO;
  kelayakan: KelayakanSubsidi[];
}

export interface ItemHarga {
  inputId?: string;
  hargaContoh: number | null;
  hargaIsiSendiri?: number | null;
  merekTerpilih?: { hargaKemasan: number; isiKemasan: number } | null;
  rataRataSekitar?: number | null;
  /** Pilihan Subsidi/Nonsubsidi per item. Kosong = ikut jawaban `dapatJatahSubsidi`. */
  pilihSubsidi?: boolean;
}

export interface HargaEfektif {
  /** Harga per satuan beli, atau null bila belum ada harga ("Harga belum diisi"). */
  harga: number | null;
  sumber: SumberHarga;
  /** Item memenuhi syarat subsidi (untuk menampilkan pilihan Subsidi/Nonsubsidi). */
  layakSubsidi: boolean;
}

/** Aturan subsidi yang berlaku untuk input, komoditas, dan tanggal ini, tanpa melihat jatah petani. */
export function cariKelayakanSubsidi(
  inputId: string | undefined,
  komoditasId: string,
  tanggal: TanggalISO,
  kelayakan: KelayakanSubsidi[],
): KelayakanSubsidi | null {
  if (!inputId) return null;
  return (
    kelayakan.find(
      (k) =>
        k.inputId === inputId &&
        k.komoditasId === komoditasId &&
        selisihHari(k.berlakuMulai, tanggal) >= 0 &&
        selisihHari(tanggal, k.berlakuSampai) >= 0,
    ) ?? null
  );
}

/** Harga per satuan dari harga kemasan: Rp380.000 / 25 kg = Rp15.200 per kg. */
export function hargaPerSatuan(hargaKemasan: number, isiKemasan: number): Hasil<number> {
  if (hargaKemasan < 0) return gagal('HARGA_NEGATIF');
  if (!(isiKemasan > 0)) return gagal('ISI_KEMASAN_KOSONG');
  return berhasil(hargaKemasan / isiKemasan);
}

/** Harga satuan efektif sebuah item menurut urutan prioritas. */
export function hargaSatuanEfektif(item: ItemHarga, konteks: KonteksSubsidi): Hasil<HargaEfektif> {
  const aturan = cariKelayakanSubsidi(
    item.inputId,
    konteks.komoditasId,
    konteks.tanggal,
    konteks.kelayakan,
  );
  const layakSubsidi = aturan !== null;
  const subsidiAktif = aturan !== null && konteks.dapatJatahSubsidi && (item.pilihSubsidi ?? true);
  if (subsidiAktif)
    return berhasil({ harga: aturan.hetPerSatuan, sumber: 'subsidi', layakSubsidi });

  if (item.hargaIsiSendiri !== null && item.hargaIsiSendiri !== undefined) {
    if (item.hargaIsiSendiri < 0) return gagal('HARGA_NEGATIF');
    return berhasil({ harga: item.hargaIsiSendiri, sumber: 'isi_sendiri', layakSubsidi });
  }
  if (item.merekTerpilih) {
    const h = hargaPerSatuan(item.merekTerpilih.hargaKemasan, item.merekTerpilih.isiKemasan);
    if (!h.ok) return h;
    return berhasil({ harga: h.nilai, sumber: 'merek', layakSubsidi });
  }
  if (item.rataRataSekitar !== null && item.rataRataSekitar !== undefined) {
    return berhasil({ harga: item.rataRataSekitar, sumber: 'rata_sekitar', layakSubsidi });
  }
  if (item.hargaContoh !== null)
    return berhasil({ harga: item.hargaContoh, sumber: 'contoh_resep', layakSubsidi });
  return berhasil({ harga: null, sumber: 'belum_ada', layakSubsidi });
}

export interface RingkasanMerek {
  merek: MerekInput;
  /** Harga kemasan dari laporan terbaru, atau null bila belum ada laporan. */
  hargaKemasan: number | null;
  hargaPerSatuan: number | null;
  /** Jumlah pelapor berbeda di kecamatan ini. */
  jumlahPelapor: number;
  /** Umur laporan terbaru dalam hari. */
  hariLalu: number | null;
}

/**
 * Daftar merek untuk satu input di satu kecamatan, diurutkan menurut laporan terbaru, lalu jumlah
 * pelapor, lalu nama. Merek tanpa laporan di akhir. Tidak menerima data promo (P0-35).
 */
export function urutkanMerek(
  merek: MerekInput[],
  laporan: LaporanHarga[],
  kecamatan: string,
  hariIni: TanggalISO,
): RingkasanMerek[] {
  const ringkas = merek.map((m): RingkasanMerek & { terbaru: TanggalISO | null } => {
    const milik = laporan
      .filter(
        (l) =>
          l.merekId === m.id && l.kecamatan === kecamatan && selisihHari(l.tanggal, hariIni) >= 0,
      )
      .sort((a, b) => selisihHari(a.tanggal, b.tanggal));
    const terbaru = milik[0];
    return {
      merek: m,
      hargaKemasan: terbaru ? terbaru.hargaKemasan : null,
      hargaPerSatuan: terbaru && m.isiKemasan > 0 ? terbaru.hargaKemasan / m.isiKemasan : null,
      jumlahPelapor: new Set(milik.map((l) => l.pelaporId)).size,
      hariLalu: terbaru ? selisihHari(terbaru.tanggal, hariIni) : null,
      terbaru: terbaru ? terbaru.tanggal : null,
    };
  });
  ringkas.sort((a, b) => {
    if (a.terbaru !== b.terbaru) {
      if (a.terbaru === null) return 1;
      if (b.terbaru === null) return -1;
      return selisihHari(a.terbaru, b.terbaru);
    }
    if (a.jumlahPelapor !== b.jumlahPelapor) return b.jumlahPelapor - a.jumlahPelapor;
    return a.merek.nama.localeCompare(b.merek.nama, 'id');
  });
  return ringkas.map(({ terbaru: _t, ...r }) => r);
}

/**
 * Pembulatan harga rata-rata laporan sebelum dipakai menghitung (D-38): ke ratusan rupiah terdekat
 * (Rp1.649 → Rp1.600, Rp1.650 → Rp1.700). Harga di bawah Rp100 per satuan (mis. per ml) dibulatkan
 * ke puluhan terdekat, paling kecil Rp10, supaya tidak menjadi nol.
 */
export function bulatkanKeRatusan(n: number): number {
  if (!(n > 0)) return 0;
  if (n < 100) return Math.max(10, Math.round(n / 10) * 10);
  return Math.round(n / 100) * 100;
}

/**
 * Rata-rata harga per satuan dari laporan di kecamatan yang sama dalam `rentangHari` terakhir.
 * Null bila laporan kurang dari `minimalLaporan` (P1-02: minimal tiga laporan dalam 30 hari).
 */
export function rataRataSekitar(
  laporan: LaporanHarga[],
  merek: MerekInput[],
  kecamatan: string,
  hariIni: TanggalISO,
  opsi: { rentangHari: number; minimalLaporan: number },
): number | null {
  const isi = new Map(merek.map((m) => [m.id, m.isiKemasan]));
  const harga = laporan
    .filter((l) => {
      const umur = selisihHari(l.tanggal, hariIni);
      return (
        l.kecamatan === kecamatan &&
        umur >= 0 &&
        umur <= opsi.rentangHari &&
        (isi.get(l.merekId) ?? 0) > 0
      );
    })
    .map((l) => l.hargaKemasan / (isi.get(l.merekId) as number));
  if (harga.length === 0 || harga.length < opsi.minimalLaporan) return null;
  return bulatkanKeRatusan(harga.reduce((a, b) => a + b, 0) / harga.length);
}

/** Validasi "Merek lain, isi sendiri"; hasilnya menjadi laporan harga baru (P0-34). */
export function validasiMerekLain(masukan: {
  namaMerek: string;
  isiKemasan: number;
  hargaKemasan: number;
}): Hasil<{ namaMerek: string; isiKemasan: number; hargaKemasan: number; hargaPerSatuan: number }> {
  const nama = masukan.namaMerek.trim();
  if (!nama) return gagal('NAMA_KOSONG');
  const h = hargaPerSatuan(masukan.hargaKemasan, masukan.isiKemasan);
  if (!h.ok) return h;
  return berhasil({
    namaMerek: nama,
    isiKemasan: masukan.isiKemasan,
    hargaKemasan: masukan.hargaKemasan,
    hargaPerSatuan: h.nilai,
  });
}
