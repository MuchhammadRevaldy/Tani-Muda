/**
 * Angka contoh di halaman depan (T4.32, D-08, D-44): modal, titik impas, perkiraan panen, dan
 * perkiraan untung dihitung dengan rantai fungsi yang sama dengan kalkulator Hitung (kebutuhan →
 * item → harga → modal → ringkasan), dari resep contoh dan harga jual contoh komoditas. Tanpa
 * subsidi dan tanpa harga laporan sekitar, karena pengunjung belum masuk.
 * Pin penggaris contoh dibuat dari pola tugas resep dengan hari ke-n tetap.
 */
import type { ResepTanam } from '../tipe';
import { pinPenggaris } from './beranda';
import type { TanggalISO } from './format';
import { berhasil, type Hasil } from './hasil';
import { buatJadwal } from './jadwal-buat';
import { hitungKebutuhanResep } from './kebutuhan';
import { hargaItemRencana, itemDariKebutuhan, ringkasRencana, type HargaItem } from './rencana';
import { hitungRingkasan } from './ringkasan';
import { tambahHari } from './tanggal';
import type { JadwalPin } from './tata-letak-penggaris';
import { perkiraanPanen } from './ukuran-metode';

/** Ukuran dan hari contoh di halaman depan (ilustrasi masukan, bukan hasil hitung). */
export const CONTOH_LANDING = {
  /** Kartu hero dan pilar Hitung: sawi bedengan 100 m², hari ke-13. */
  petani: { komoditas: 'sawi', metode: 'bedengan', luasM2: 100, hariKe: 13 },
  /** Pilar Hitung baris kedua: padi sawah 1.000 m². */
  sawah: { komoditas: 'padi', metode: 'sawah', luasM2: 1000 },
  /** Bagian pembeli: bayam bedengan, hari ke-18, 8 kg per minggu. */
  pembeli: { komoditas: 'bayam', metode: 'bedengan', hariKe: 18, kgPerMinggu: 8 },
  /** Pilar Jual: dua pembeli ilustrasi (nama dari data contoh). */
  pesanan: [
    { nama: 'Katering Bu Ratna', jenis: 'rutin', komoditas: 'sawi', kg: 10 },
    { nama: 'Koperasi Desa Sumber Rejeki', jenis: 'sekali_panen', komoditas: 'padi', kg: 2000 },
  ],
} as const;

export interface AngkaContoh {
  modal: number;
  titikImpasKg: number;
  perkiraanKg: number;
  untung: number;
}

/** Modal, titik impas, dan untung resep berdasar luas, dengan harga contoh. */
export function angkaContoh(
  resep: ResepTanam,
  luasM2: number,
  hargaJual: number,
  tanggal: TanggalISO,
): Hasil<AngkaContoh> {
  const kebutuhan = hitungKebutuhanResep(resep, 'luas', {
    luasM2,
    jumlahTanaman: null,
    volumeLarutanLiter: null,
  });
  if (!kebutuhan.ok) return kebutuhan;
  const items = itemDariKebutuhan(kebutuhan.nilai, resep);
  const harga = new Map<string, HargaItem>();
  for (const it of items) {
    const h = hargaItemRencana(
      it,
      { komoditasId: resep.komoditasId, tanggal, kelayakan: [] },
      null,
    );
    if (!h.ok) return h;
    harga.set(it.id, h.nilai);
  }
  const modal = ringkasRencana(items, harga, true);
  if (!modal.ok) return modal;
  const panen = perkiraanPanen('luas', luasM2, resep.hasilPerSatuan);
  if (!panen.ok) return panen;
  const r = hitungRingkasan({
    totalModal: modal.nilai.totalModal,
    perkiraanPanenKg: panen.nilai,
    hargaJual,
    ukuranM2: luasM2,
  });
  if (!r.ok) return r;
  return berhasil({
    modal: modal.nilai.totalModal,
    titikImpasKg: r.nilai.titikImpasKg,
    perkiraanKg: panen.nilai,
    untung: r.nilai.untung,
  });
}

/** Pin penggaris siklus contoh pada hari ke-n: tugas sebelum hari ini dianggap sudah selesai. */
export function pinContoh(resep: ResepTanam, hariKe: number, hariIni: TanggalISO): JadwalPin[] {
  const jadwal = buatJadwal(resep.tugas, tambahHari(hariIni, -hariKe));
  if (!jadwal.ok) return [];
  const tugas = jadwal.nilai.map((t) => ({
    ...t,
    status: t.hst < hariKe ? ('selesai' as const) : ('belum' as const),
  }));
  return pinPenggaris(tugas, hariIni, resep.umurPanenHari);
}
