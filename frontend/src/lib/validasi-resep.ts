/**
 * Validasi resep dari editor mentor (T4.39, PRD P0-03, P0-04): angka yang tidak masuk akal ditolak
 * sebelum resep disimpan sebagai versi baru. Dipakai editor (pesan per kolom) dan klien API (galat
 * VALIDASI dengan rincian per kolom), dan menjadi acuan aturan backend Tahap 5.
 * Aturan: hasil panen > 0; umur panen bilangan bulat ≥ 1; persen panen jelek 0 < p ≤ 100;
 * input bernama, dosis ≥ 0, kemasan > 0, isi satuan beli > 0, harga ≥ 0; minimal satu tugas,
 * judul terisi, HST sah (validasiResepTugas) dan tidak melewati umur panen, interval ≥ 1;
 * besaran ukur bernama, skala min ≤ batas bawah ≤ batas atas ≤ skala maks.
 */
import type { ResepTanam } from '../tipe';
import type { KodeGalat } from './hasil';
import { validasiResepTugas } from './jadwal-buat';

export type KolomResep =
  'hasilPerSatuan' | 'umurPanenHari' | 'persenPanenJelek' | 'input' | 'tugas';

export interface MasalahResep {
  kolom: KolomResep;
  /** Baris input atau tugas (mulai 0). */
  indeks?: number;
  /** Bagian baris, mis. "hstMulai" atau "ukur.0". */
  bagian?: string;
  kode: KodeGalat;
}

export type IsiResep = Pick<
  ResepTanam,
  'hasilPerSatuan' | 'umurPanenHari' | 'persenPanenJelek' | 'input' | 'tugas'
>;

export function validasiResep(r: IsiResep): MasalahResep[] {
  const m: MasalahResep[] = [];
  if (!(r.hasilPerSatuan > 0)) m.push({ kolom: 'hasilPerSatuan', kode: 'HASIL_KOSONG' });
  if (!Number.isInteger(r.umurPanenHari) || r.umurPanenHari < 1)
    m.push({ kolom: 'umurPanenHari', kode: 'UMUR_PANEN_TIDAK_VALID' });
  if (r.persenPanenJelek !== undefined && !(r.persenPanenJelek > 0 && r.persenPanenJelek <= 100))
    m.push({ kolom: 'persenPanenJelek', kode: 'PERSEN_PANEN_JELEK_TIDAK_VALID' });

  r.input.forEach((i, indeks) => {
    const tambah = (bagian: string, kode: KodeGalat) =>
      m.push({ kolom: 'input', indeks, bagian, kode });
    if (!i.nama.trim()) tambah('nama', 'NAMA_ITEM_KOSONG');
    if (!(i.dosis >= 0)) tambah('dosis', 'DOSIS_NEGATIF');
    if (!(i.ukuranKemasan > 0)) tambah('ukuranKemasan', 'KEMASAN_TIDAK_VALID');
    if (i.isiSatuanBeli !== undefined && !(i.isiSatuanBeli > 0))
      tambah('isiSatuanBeli', 'ISI_KEMASAN_KOSONG');
    if (i.hargaContoh !== null && !(i.hargaContoh >= 0)) tambah('hargaContoh', 'HARGA_NEGATIF');
  });

  if (!r.tugas.length) m.push({ kolom: 'tugas', kode: 'TUGAS_TIDAK_ADA' });
  r.tugas.forEach((t, indeks) => {
    const tambah = (bagian: string, kode: KodeGalat) =>
      m.push({ kolom: 'tugas', indeks, bagian, kode });
    if (!t.judul.trim()) tambah('judul', 'NAMA_KOSONG');
    const sah = validasiResepTugas(t);
    if (!sah.ok) tambah(sah.galat === 'INTERVAL_TIDAK_VALID' ? 'interval' : 'hstMulai', sah.galat);
    else if ((t.hstSelesai ?? t.hstMulai) > r.umurPanenHari)
      tambah(t.tipe === 'sekali' ? 'hstMulai' : 'hstSelesai', 'HST_TIDAK_VALID');
    (t.ukur ?? []).forEach((b, k) => {
      if (!b.nama.trim()) tambah(`ukur.${k}`, 'NAMA_KOSONG');
      else if (
        !(b.skalaMin <= b.batasBawah && b.batasBawah <= b.batasAtas) ||
        (b.skalaMaks !== null && b.batasAtas > b.skalaMaks)
      )
        tambah(`ukur.${k}`, 'BATAS_UKUR_TIDAK_VALID');
    });
  });
  return m;
}
