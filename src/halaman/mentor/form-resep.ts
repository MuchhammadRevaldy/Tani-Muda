/**
 * Isian editor resep (T4.39): angka disimpan sebagai teks ketikan (format Indonesia, "1,5") supaya
 * isian setengah jadi tidak hilang, lalu diubah ke `SimpanResepMasukan` saat disimpan. Angka yang
 * tidak bisa dibaca menjadi NaN dan ditolak `validasiResep`.
 */
import { useKomoditas, useMetode } from '../../api/kueri';
import { resepKeDomain } from '../../api/peta';
import type {
  BesaranUkur,
  DasarDosis,
  DasarUkuran,
  ResepTanam,
  SimpanResepMasukan,
  TipeTugas,
} from '../../api/tipe';
import { formatDesimal, parseAngka } from '../../lib/format';
import { validasiResep, type MasalahResep } from '../../lib/validasi-resep';

export interface BarisInput {
  id: string;
  input_id: string | null;
  nama: string;
  grup: string;
  dosis: string;
  satuan_dosis: string;
  dasar_dosis: DasarDosis;
  satuan_beli: string;
  isi: string;
  kemasan: string;
  alat: boolean;
  harga: string;
}

export interface BarisUkur {
  nama: string;
  satuan: string;
  bawah: string;
  atas: string;
  skalaMin: string;
  skalaMaks: string;
  saranRendah: string;
  saranTinggi: string;
}

export interface BarisTugas {
  id: string;
  tipe: TipeTugas;
  judul: string;
  mulai: string;
  selesai: string;
  interval: string;
  geser: boolean;
  saran: string;
  cara: string;
  ukur: BarisUkur[];
}

export interface FormResep {
  komoditas_id: string;
  metode_id: string;
  hasil: string;
  umur: string;
  pengisian: string;
  persenJelek: string;
  alasanJelek: string;
  standar: string;
  input: BarisInput[];
  tugas: BarisTugas[];
}

const teks = (n: number | null | undefined, digit = 4) =>
  n === null || n === undefined ? '' : formatDesimal(n, digit);
/** Teks ketikan → angka; kosong → null; tidak terbaca → NaN (ditolak validasi). */
const angka = (s: string): number | null => {
  if (!s.trim()) return null;
  return parseAngka(s) ?? Number.NaN;
};
const wajib = (s: string) => angka(s) ?? Number.NaN;
const baris = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

let urut = 0;
export const idBaru = (awalan: string) => `${awalan}-baru-${Date.now().toString(36)}-${++urut}`;

export function inputKosong(): BarisInput {
  return {
    id: idBaru('input'),
    input_id: null,
    nama: '',
    grup: '',
    dosis: '',
    satuan_dosis: '',
    dasar_dosis: 'per_m2',
    satuan_beli: '',
    isi: '',
    kemasan: '1',
    alat: false,
    harga: '',
  };
}

export function ukurKosong(): BarisUkur {
  return {
    nama: '',
    satuan: '',
    bawah: '',
    atas: '',
    skalaMin: '0',
    skalaMaks: '',
    saranRendah: '',
    saranTinggi: '',
  };
}

export function tugasKosong(): BarisTugas {
  return {
    id: idBaru('tugas'),
    tipe: 'sekali',
    judul: '',
    mulai: '',
    selesai: '',
    interval: '',
    geser: true,
    saran: '',
    cara: '',
    ukur: [],
  };
}

export function formKosong(): FormResep {
  return {
    komoditas_id: '',
    metode_id: '',
    hasil: '',
    umur: '',
    pengisian: '',
    persenJelek: '',
    alasanJelek: '',
    standar: '',
    input: [inputKosong()],
    tugas: [tugasKosong()],
  };
}

const ukurDariApi = (b: BesaranUkur): BarisUkur => ({
  nama: b.nama,
  satuan: b.satuan,
  bawah: teks(b.batas_bawah),
  atas: teks(b.batas_atas),
  skalaMin: teks(b.skala_min),
  skalaMaks: teks(b.skala_maks),
  saranRendah: b.saran_terlalu_rendah,
  saranTinggi: b.saran_terlalu_tinggi,
});

export function formDariResep(r: ResepTanam): FormResep {
  return {
    komoditas_id: r.komoditas_id,
    metode_id: r.metode_id,
    hasil: teks(r.hasil_per_satuan),
    umur: teks(r.umur_panen_hari, 0),
    pengisian: teks(r.jumlah_pengisian_larutan, 0),
    persenJelek: teks(r.persen_panen_jelek, 1),
    alasanJelek: r.alasan_panen_jelek ?? '',
    standar: r.standar_kualitas.join('\n'),
    input: r.input.map((i) => ({
      id: i.id,
      input_id: i.input_id,
      nama: i.nama,
      grup: i.grup,
      dosis: teks(i.dosis),
      satuan_dosis: i.satuan_dosis,
      dasar_dosis: i.dasar_dosis,
      satuan_beli: i.satuan_beli,
      isi: teks(i.isi_satuan_beli),
      kemasan: teks(i.ukuran_kemasan),
      alat: i.alat_sekali_beli,
      harga: teks(i.harga_contoh, 0),
    })),
    tugas: r.tugas.map((x) => ({
      id: x.id,
      tipe: x.tipe,
      judul: x.judul,
      mulai: teks(x.hst_mulai, 0),
      selesai: teks(x.hst_selesai, 0),
      interval: teks(x.interval, 0),
      geser: x.boleh_digeser,
      saran: x.saran_terlambat ?? '',
      cara: (x.cara_mengerjakan ?? []).join('\n'),
      ukur: (x.ukur ?? []).map(ukurDariApi),
    })),
  };
}

export function keMasukan(
  f: FormResep,
  dasarUkuran: DasarUkuran,
  resepAsalId: string | null,
): SimpanResepMasukan {
  return {
    komoditas_id: f.komoditas_id,
    metode_id: f.metode_id,
    dasar_ukuran: dasarUkuran,
    hasil_per_satuan: wajib(f.hasil),
    umur_panen_hari: wajib(f.umur),
    jumlah_pengisian_larutan: angka(f.pengisian),
    persen_panen_jelek: angka(f.persenJelek),
    alasan_panen_jelek: f.alasanJelek.trim() || null,
    standar_kualitas: baris(f.standar),
    input: f.input.map((i) => ({
      id: i.id,
      input_id: i.input_id,
      nama: i.nama.trim(),
      grup: i.grup.trim(),
      dosis: wajib(i.dosis),
      satuan_dosis: i.satuan_dosis.trim(),
      dasar_dosis: i.dasar_dosis,
      satuan_beli: i.satuan_beli.trim(),
      isi_satuan_beli: angka(i.isi),
      ukuran_kemasan: wajib(i.kemasan),
      alat_sekali_beli: i.alat,
      harga_contoh: angka(i.harga),
    })),
    tugas: f.tugas.map((x) => {
      const ulang = x.tipe !== 'sekali';
      const cara = baris(x.cara);
      return {
        id: x.id,
        tipe: x.tipe,
        judul: x.judul.trim(),
        hst_mulai: wajib(x.mulai),
        hst_selesai: ulang ? wajib(x.selesai) : null,
        interval: ulang ? wajib(x.interval) : null,
        ukur:
          x.tipe === 'ukur'
            ? x.ukur.map((b) => ({
                nama: b.nama.trim(),
                satuan: b.satuan.trim(),
                batas_bawah: wajib(b.bawah),
                batas_atas: wajib(b.atas),
                skala_min: wajib(b.skalaMin),
                skala_maks: angka(b.skalaMaks),
                saran_terlalu_rendah: b.saranRendah.trim(),
                saran_terlalu_tinggi: b.saranTinggi.trim(),
              }))
            : null,
        boleh_digeser: x.geser,
        saran_terlambat: x.saran.trim() || null,
        cara_mengerjakan: cara.length ? cara : null,
      };
    }),
    resep_asal_id: resepAsalId,
  };
}

/** Masalah isian menurut aturan yang sama dengan klien API (src/lib/validasi-resep.ts). */
export function periksaForm(m: SimpanResepMasukan): MasalahResep[] {
  const { resep_asal_id: _a, ...isi } = m;
  return validasiResep(
    resepKeDomain({
      ...isi,
      id: 'periksa',
      versi: 1,
      status: 'draf',
      contoh: false,
      asal_angka_contoh: null,
      validator: null,
      tanggal_validasi: null,
    }),
  );
}

/** Kunci isian untuk menempelkan pesan galat: "tugas.2.hstMulai", "hasilPerSatuan". */
export const kunciMasalah = (x: Pick<MasalahResep, 'kolom' | 'indeks' | 'bagian'>) =>
  [x.kolom, x.indeks, x.bagian].filter((v) => v !== undefined).join('.');

/** "Sawi hijau · Bedengan" untuk daftar dan judul editor. */
export function useNamaResep() {
  const komoditasQ = useKomoditas();
  const metodeQ = useMetode();
  return (r: Pick<ResepTanam, 'komoditas_id' | 'metode_id'>) =>
    `${komoditasQ.data?.find((k) => k.id === r.komoditas_id)?.nama ?? r.komoditas_id} · ${
      metodeQ.data?.find((m) => m.id === r.metode_id)?.nama ?? r.metode_id
    }`;
}

/** Kelompok per tanaman dan cara tanam, versi terbaru dulu. */
export function kelompokResep(daftar: ResepTanam[]): ResepTanam[][] {
  const peta = new Map<string, ResepTanam[]>();
  for (const r of daftar) {
    const kunci = `${r.komoditas_id}|${r.metode_id}`;
    peta.set(kunci, [...(peta.get(kunci) ?? []), r]);
  }
  return [...peta.values()].map((v) => v.sort((a, b) => b.versi - a.versi));
}
