/**
 * CONTOH referensi dari desain (ringkasan-desain.md bagian 5). Bukan rekomendasi; hanya untuk tes
 * dan data tiruan. Nilai resmi akan datang dari penyuluh dan admin.
 */
import type { Komoditas, KonfigurasiBisnis, MetodeTanam } from '../../tipe';

export const CONTOH_KOMODITAS: Komoditas[] = [
  {
    id: 'sawi',
    nama: 'Sawi hijau',
    kategori: 'sayuran_daun',
    jenisLahanCocok: ['kebun', 'pekarangan', 'hidroponik'],
    satuanPanen: 'kg',
    umurPanenHari: 28,
    hargaJualContoh: 5000,
  },
  {
    id: 'bayam',
    nama: 'Bayam',
    kategori: 'sayuran_daun',
    jenisLahanCocok: ['kebun', 'pekarangan', 'hidroponik'],
    satuanPanen: 'kg',
    umurPanenHari: 25,
    hargaJualContoh: 6000,
  },
  {
    id: 'kangkung',
    nama: 'Kangkung',
    kategori: 'sayuran_daun',
    jenisLahanCocok: ['kebun', 'pekarangan', 'hidroponik'],
    satuanPanen: 'kg',
    umurPanenHari: 21,
    hargaJualContoh: 5000,
  },
  {
    id: 'pakcoy',
    nama: 'Pakcoy',
    kategori: 'sayuran_daun',
    jenisLahanCocok: ['kebun', 'pekarangan', 'hidroponik'],
    satuanPanen: 'kg',
    umurPanenHari: 40,
  },
  {
    id: 'cabai',
    nama: 'Cabai rawit',
    kategori: 'sayuran_buah',
    jenisLahanCocok: ['kebun', 'pekarangan'],
    satuanPanen: 'kg',
    umurPanenHari: 90,
  },
  {
    id: 'tomat',
    nama: 'Tomat',
    kategori: 'sayuran_buah',
    jenisLahanCocok: ['kebun', 'pekarangan'],
    satuanPanen: 'kg',
    umurPanenHari: 75,
  },
  {
    id: 'mentimun',
    nama: 'Mentimun',
    kategori: 'sayuran_buah',
    jenisLahanCocok: ['kebun', 'pekarangan'],
    satuanPanen: 'kg',
    umurPanenHari: 40,
  },
  {
    id: 'terong',
    nama: 'Terong',
    kategori: 'sayuran_buah',
    jenisLahanCocok: ['kebun', 'pekarangan'],
    satuanPanen: 'kg',
    umurPanenHari: 65,
  },
  {
    id: 'padi',
    nama: 'Padi sawah',
    kategori: 'tanaman_pangan',
    jenisLahanCocok: ['sawah'],
    satuanPanen: 'kg gabah',
    umurPanenHari: 110,
    hargaJualContoh: 6500,
  },
  {
    id: 'jagung',
    nama: 'Jagung manis',
    kategori: 'tanaman_pangan',
    jenisLahanCocok: ['kebun', 'sawah'],
    satuanPanen: 'kg',
    umurPanenHari: 75,
  },
  {
    id: 'selada',
    nama: 'Selada keriting',
    kategori: 'sayuran_daun',
    jenisLahanCocok: ['kebun', 'pekarangan', 'hidroponik'],
    satuanPanen: 'kg',
    umurPanenHari: 35,
    hargaJualContoh: 12000,
  },
];

export const CONTOH_METODE: MetodeTanam[] = [
  {
    id: 'bedengan',
    nama: 'Bedengan',
    dasarUkuran: 'luas',
    modalAwal: 'rendah',
    bisaVertikultur: false,
  },
  {
    id: 'polybag',
    nama: 'Polybag',
    dasarUkuran: 'polybag',
    modalAwal: 'rendah',
    bisaVertikultur: true,
  },
  {
    id: 'hidroponik',
    nama: 'Hidroponik',
    dasarUkuran: 'lubang',
    modalAwal: 'tinggi',
    bisaVertikultur: true,
  },
  { id: 'sawah', nama: 'Sawah', dasarUkuran: 'luas', modalAwal: 'sedang', bisaVertikultur: false },
];

/** CONTOH konversi satuan lokal untuk wilayah demo: 1 ru (bata) ≈ 14 m². */
export const CONTOH_KONVERSI = { ru: 14, bata: 14 } as const;

/** CONTOH faktor sistem hidroponik dari papan 14: liter tandon per lubang, m² tempat per lubang. */
export const CONTOH_SISTEM_HIDROPONIK = {
  sumbu: { literTandonPerLubang: 0.3, tempatPerLubangM2: 0.06 },
  nft: { literTandonPerLubang: 0.5, tempatPerLubangM2: 0.05 },
  rakit: { literTandonPerLubang: 1, tempatPerLubangM2: 0.05 },
} as const;

/** CONTOH konfigurasi bisnis (D-01, D-02, D-03). Nilai sebenarnya disimpan sebagai konfigurasi. */
export const CONTOH_KONFIGURASI: KonfigurasiBisnis = {
  persenUangMuka: 20,
  persenLayanan: 5,
  jamPeriksa: { rutin: 6, sekali_panen: 24 },
  hariKabarGagalPanen: 3,
  radiusKm: 10,
};
