/**
 * Pembuat data contoh (T3.06–T3.08). Sumber kebenaran data tiruan: resep diturunkan dari fixture
 * T2.01, nilai uang dan jadwal dihitung dengan rumus src/lib, lalu hasilnya ditulis ke JSON dengan
 * `npm run data-contoh`. Tes memastikan JSON selalu sama dengan keluaran fungsi ini.
 *
 * Semua data CONTOH dan fiktif: nama, nomor HP (+62812000000xx, +62813000000xx), alamat, foto.
 * Tanggal dihitung dari HARI_DASAR lalu diubah menjadi tanggal relatif ("H-13").
 */
import {
  CONTOH_KOMODITAS,
  CONTOH_KONFIGURASI,
  CONTOH_METODE,
  CONTOH_SISTEM_HIDROPONIK,
} from '../../../lib/fixtures/contoh-referensi';
import {
  CONTOH_KELAYAKAN_SUBSIDI,
  CONTOH_RESEP_BAYAM_BEDENGAN,
  CONTOH_RESEP_KANGKUNG_BEDENGAN,
  CONTOH_RESEP_PADI_SAWAH,
  CONTOH_RESEP_SAWI_BEDENGAN,
  CONTOH_RESEP_SAWI_HIDROPONIK,
  SEMUA_CONTOH_RESEP,
} from '../../../lib/fixtures/contoh-resep';
import { hargaSatuanEfektif } from '../../../lib/harga-item';
import { pastikan } from '../../../lib/hasil';
import { buatJadwal } from '../../../lib/jadwal-buat';
import { hitungKebutuhanResep } from '../../../lib/kebutuhan';
import { konfirmasiKiriman } from '../../../lib/kiriman';
import {
  hitungNilaiPesanan,
  hitungPembayaranKiriman,
  jumlahKirimanRutin,
} from '../../../lib/pesanan-nilai';
import { selisihHari, tambahHari } from '../../../lib/tanggal';
import { perkiraanPanen } from '../../../lib/ukuran-metode';
import type * as D from '../../../tipe';
import { resepDariDomain, tugasDariDomain } from '../../peta';
import type * as A from '../../tipe';
import type { DataContoh, DataKebun, DataPesanan, WilayahContoh } from './jenis-data';

export const VERSI_DATA_CONTOH = 13;
/** Hari acuan saat menghitung; semua tanggal ditulis relatif terhadapnya. */
const HARI_DASAR = '2026-10-05';

const h = (n: number) => `H${n >= 0 ? '+' : ''}${n}`;
const hw = (n: number, jam: string) => `${h(n)}T${jam}`;
/** Jam relatif terhadap saat atur ulang (D-47): "J-1" = satu jam sebelumnya. */
const jRel = (n: number) => `J${n >= 0 ? '+' : ''}${n}`;
const rel = (tanggal: string) => h(selisihHari(HARI_DASAR, tanggal));
const tgl = (n: number) => tambahHari(HARI_DASAR, n);

// ---------------------------------------------------------------- wilayah (D-27, D-54)
// Kode dan nama dicocokkan dengan dataset resmi shared/wilayah/wilayah.sql; titik tengah sama dengan
// shared/wilayah/titik-tengah.json (perkiraan). Keduanya dites di data.test.ts.
const W = {
  lembang: '32.17.01.2003',
  sukajaya: '32.17.01.2013',
  gudangkahuripan: '32.17.01.2007',
  cikahuripan: '32.17.01.2005',
  jayagiri: '32.17.01.2008',
  kayuambon: '32.17.01.2002',
  cibodas: '32.17.01.2009',
  ledeng: '32.73.08.1003',
  batununggal: '32.73.21.1001',
  /** Desa tetangga di luar pilot, tanpa titik tengah (D-56). */
  cihideung: '32.17.02.2004',
} as const;

const wilayahLembang = (
  id: string,
  desa: string,
  lintang: number,
  bujur: number,
): WilayahContoh => ({
  id,
  desa,
  kecamatan: 'Lembang',
  kabupaten: 'Kabupaten Bandung Barat',
  provinsi: 'Jawa Barat',
  lintang,
  bujur,
  kode_terverifikasi: true,
});

const WILAYAH: WilayahContoh[] = [
  wilayahLembang(W.lembang, 'Lembang', -6.8186, 107.6198),
  wilayahLembang(W.sukajaya, 'Sukajaya', -6.8111, 107.5988),
  wilayahLembang(W.gudangkahuripan, 'Gudangkahuripan', -6.8334, 107.6043),
  wilayahLembang(W.cikahuripan, 'Cikahuripan', -6.8168, 107.6042),
  wilayahLembang(W.jayagiri, 'Jayagiri', -6.8102, 107.6178),
  wilayahLembang(W.kayuambon, 'Kayuambon', -6.82, 107.625),
  wilayahLembang(W.cibodas, 'Cibodas', -6.8254, 107.6866),
  {
    id: W.ledeng,
    desa: 'Ledeng',
    kecamatan: 'Cidadap',
    kabupaten: 'Kota Bandung',
    provinsi: 'Jawa Barat',
    lintang: -6.8627,
    bujur: 107.5994,
    kode_terverifikasi: true,
  },
  {
    id: W.batununggal,
    desa: 'Batununggal',
    kecamatan: 'Bandung Kidul',
    kabupaten: 'Kota Bandung',
    provinsi: 'Jawa Barat',
    lintang: -6.953,
    bujur: 107.6381,
    kode_terverifikasi: true,
  },
  {
    id: W.cihideung,
    desa: 'Cihideung',
    kecamatan: 'Parongpong',
    kabupaten: 'Kabupaten Bandung Barat',
    provinsi: 'Jawa Barat',
    lintang: null,
    bujur: null,
    kode_terverifikasi: true,
  },
];

// ---------------------------------------------------------------- konfigurasi (D-28: berubah lewat git)
const KONFIGURASI: A.Konfigurasi = {
  persen_uang_muka: CONTOH_KONFIGURASI.persenUangMuka,
  persen_layanan: CONTOH_KONFIGURASI.persenLayanan,
  jam_periksa_rutin: CONTOH_KONFIGURASI.jamPeriksa.rutin,
  jam_periksa_sekali_panen: CONTOH_KONFIGURASI.jamPeriksa.sekali_panen,
  hari_kabar_gagal_panen: CONTOH_KONFIGURASI.hariKabarGagalPanen,
  radius_km: CONTOH_KONFIGURASI.radiusKm,
  radius_maks_km: 25,
  maks_durasi_rutin_hari: 92,
  hari_kembali_uang_muka: 7,
  laporan_harga_minimal: 3,
  laporan_harga_rentang_hari: 30,
  kontak_admin: { whatsapp: '+62 812-0000-0099', jam_layanan: 'Senin–Jumat, 08.00–16.00 WIB' },
  pembayaran_uji_coba: true,
  batas_video_mb: 15,
  batas_unduhan_offline_mb: 200,
  versi_privasi: 'draf-2026-10',
  diperbarui_pada: hw(-30, '09:00'),
};

// ---------------------------------------------------------------- referensi
const KETERANGAN_METODE: Record<string, { kebutuhan_lahan: string; frekuensi_perawatan: string }> =
  {
    bedengan: {
      kebutuhan_lahan: 'Lahan terbuka kena matahari, mulai 10 m²',
      frekuensi_perawatan: 'Siram setiap hari',
    },
    polybag: { kebutuhan_lahan: 'Pekarangan atau teras', frekuensi_perawatan: 'Siram setiap hari' },
    hidroponik: {
      kebutuhan_lahan: 'Tempat teduh, tanpa tanah',
      frekuensi_perawatan: 'Cek larutan 2 hari sekali',
    },
    sawah: {
      kebutuhan_lahan: 'Sawah dengan pengairan',
      frekuensi_perawatan: 'Cek air seminggu sekali',
    },
  };
const SISTEM: Record<keyof typeof CONTOH_SISTEM_HIDROPONIK, { nama: string; keterangan: string }> =
  {
    sumbu: {
      nama: 'Sumbu',
      keterangan: 'Tanpa pompa dan listrik. Cocok untuk mulai kecil, 20 sampai 50 lubang.',
    },
    nft: {
      nama: 'NFT',
      keterangan: 'Air bernutrisi mengalir tipis di dalam pipa. Pompa menyala terus.',
    },
    rakit: {
      nama: 'Rakit apung',
      keterangan: 'Papan styrofoam mengapung di bak air. Tetap aman saat listrik padam sebentar.',
    },
  };
const KATEGORI_INPUT: Record<string, A.KategoriInput> = {
  'benih-sawi': 'benih',
  'benih-bayam': 'benih',
  'benih-kangkung': 'benih',
  'benih-padi': 'benih',
  'benih-cabai': 'benih',
  'benih-tomat': 'benih',
  'benih-selada': 'benih',
  'pupuk-kandang': 'organik_padat',
  'organik-padat': 'organik_padat',
  poc: 'organik_cair',
  urea: 'anorganik_tunggal',
  'npk-16': 'anorganik_majemuk',
  'npk-15': 'anorganik_majemuk',
  'ab-mix': 'nutrisi_hidroponik',
  'ab-mix-daun': 'nutrisi_hidroponik',
  'ph-down': 'nutrisi_hidroponik',
  dolomit: 'pembenah_tanah',
  'pestisida-nabati': 'bahan_lain',
  mulsa: 'bahan_lain',
  rockwool: 'bahan_lain',
  netpot: 'bahan_lain',
};
const KANDUNGAN: Record<string, string> = {
  urea: 'N 46%',
  'npk-16': 'N 16%, P 16%, K 16%',
  'npk-15': 'N 15%, P 15%, K 15%',
};

/** [input, nama merek, teks kemasan, isi kemasan, harga kemasan, jumlah pelapor, hari lalu] — dari papan 16–19. */
const MEREK: [string, string, string, number, number, number, number][] = [
  ['benih-sawi', 'Benih Daun Lebat', 'bungkus 25 g', 1, 25000, 5, 9],
  ['benih-sawi', 'Benih Tunas Tani', 'bungkus 25 g', 1, 22000, 3, 15],
  ['pupuk-kandang', 'Kandang Subur', '25 kg', 25, 15000, 5, 5],
  ['pupuk-kandang', 'Organik Lembang', '25 kg', 25, 18000, 3, 9],
  ['pupuk-kandang', 'Tanah Gembur', '20 kg', 20, 12500, 2, 15],
  ['dolomit', 'Kapur Tani Putih', '25 kg', 25, 37500, 4, 10],
  ['dolomit', 'Dolomit Bumi Hijau', '25 kg', 25, 45000, 2, 21],
  ['dolomit', 'Kalsium Prima', '5 kg', 5, 8000, 3, 6],
  ['npk-16', 'Daun Lebat', '25 kg', 25, 380000, 5, 12],
  ['npk-16', 'Bumi Hijau', '25 kg', 25, 355000, 3, 4],
  ['npk-16', 'Sari Tani', '5 kg', 5, 80000, 2, 20],
  ['poc', 'Cair Subur', '1 liter', 1, 40000, 5, 8],
  ['poc', 'Hayati Tani', '1 liter', 1, 35000, 2, 14],
  ['poc', 'Daun Lebat Cair', '2,5 liter', 2.5, 95000, 1, 30],
  ['pestisida-nabati', 'Nimba Tani', '1 liter', 1, 35000, 4, 11],
  ['pestisida-nabati', 'Serai Wangi Lestari', '500 ml', 0.5, 30000, 2, 18],
  ['mulsa', 'Mulsa Perak Jaya', 'roll 500 m', 500, 375000, 5, 13],
  ['mulsa', 'Mulsa Tani Makmur', 'roll 500 m', 500, 340000, 2, 25],
  ['urea', 'Urea Bumi Hijau', '50 kg', 50, 450000, 5, 12],
  ['urea', 'Urea Tunas Tani', '50 kg', 50, 440000, 3, 8],
  ['npk-15', 'Daun Lebat 15-15-15', '50 kg', 50, 600000, 4, 14],
  ['npk-15', 'Sari Tani 15-15-15', '25 kg', 25, 295000, 2, 9],
  ['organik-padat', 'Kandang Subur', '25 kg', 25, 25000, 5, 7],
  ['organik-padat', 'Organik Granul Lestari', '40 kg', 40, 45000, 3, 15],
  ['ab-mix', 'AB Mix Daun Segar', 'paket A+B', 1, 45000, 5, 3],
  ['ab-mix', 'Nutrisi Hidro Lestari', 'paket A+B', 1, 40000, 3, 10],
  ['ph-down', 'pH Turun Tani', 'botol 100 ml', 100, 25000, 4, 9],
  ['ph-down', 'Asam Hidro Prima', 'botol 250 ml', 250, 45000, 2, 17],
  ['rockwool', 'Rockwool Tani Hidro', '1 lembar', 1, 35000, 4, 9],
  ['rockwool', 'Wol Batu Prima', '5 lembar', 5, 150000, 2, 16],
  ['netpot', 'Netpot Hijau', '100 buah', 100, 30000, 5, 5],
  ['netpot', 'Netpot Kuat', '200 buah', 200, 65000, 2, 12],
  ['benih-padi', 'Benih Padi Unggul Tani', '5 kg', 5, 75000, 5, 6],
  ['benih-padi', 'Benih Padi Sari', '5 kg', 5, 70000, 4, 11],
  ['benih-cabai', 'Benih Rawit Juara', 'bungkus 10 g', 1, 35000, 3, 10],
  ['benih-tomat', 'Benih Tomat Super', 'bungkus 10 g', 1, 40000, 3, 10],
  ['benih-selada', 'Benih Selada Hijau Rimbun', 'bungkus 15 g', 1, 25000, 3, 10],
  ['ab-mix-daun', 'AB Mix Daun Hijau', 'paket 1 liter', 1, 45000, 3, 10],
];

const PELAPOR = ['petani-arif', 'petani-dewi', 'petani-budi', 'petani-sari', 'petani-yogi'];

function buatReferensi(): DataContoh['referensi'] {
  const input = new Map<string, A.InputPertanian>();
  for (const r of SEMUA_CONTOH_RESEP) {
    for (const i of r.input) {
      if (!i.inputId || input.has(i.inputId)) continue;
      input.set(i.inputId, {
        id: i.inputId,
        nama: i.nama,
        kategori: KATEGORI_INPUT[i.inputId] ?? 'bahan_lain',
        kandungan: KANDUNGAN[i.inputId] ?? null,
        satuan: i.satuanBeli,
      });
    }
  }
  const merek_input: A.MerekInput[] = [];
  const laporan_harga: A.LaporanHarga[] = [];
  MEREK.forEach(([inputId, nama, teks, isi, harga, pelapor, hari], n) => {
    const id = `merek-${n + 1}`;
    merek_input.push({
      id,
      input_id: inputId,
      nama,
      produsen: null,
      isi_kemasan: isi,
      teks_kemasan: teks,
      nomor_pendaftaran: KATEGORI_INPUT[inputId]?.startsWith('anorganik')
        ? `CONTOH-PUPUK-${String(n + 1).padStart(3, '0')}`
        : null,
    });
    for (let i = 0; i < Math.min(pelapor, PELAPOR.length); i++) {
      laporan_harga.push({
        id: `laporan-${laporan_harga.length + 1}`,
        merek_id: id,
        pelapor_id: PELAPOR[i] as string,
        harga_kemasan: harga,
        kecamatan: 'Lembang',
        tanggal: h(-(hari + i * 3)),
      });
    }
  });
  return {
    komoditas: CONTOH_KOMODITAS.map((k) => ({
      id: k.id,
      nama: k.nama,
      kategori: k.kategori,
      jenis_lahan_cocok: [...k.jenisLahanCocok],
      satuan_panen: k.satuanPanen,
      umur_panen_hari: k.umurPanenHari,
      harga_jual_contoh: k.hargaJualContoh ?? null,
    })),
    metode: CONTOH_METODE.map((m) => ({
      id: m.id,
      nama: m.nama,
      dasar_ukuran: m.dasarUkuran,
      modal_awal: m.modalAwal,
      bisa_vertikultur: m.bisaVertikultur,
      ...(KETERANGAN_METODE[m.id] as { kebutuhan_lahan: string; frekuensi_perawatan: string }),
    })),
    sistem_hidroponik: (
      Object.keys(CONTOH_SISTEM_HIDROPONIK) as (keyof typeof CONTOH_SISTEM_HIDROPONIK)[]
    ).map((id) => ({
      id,
      ...SISTEM[id],
      liter_tandon_per_lubang: CONTOH_SISTEM_HIDROPONIK[id].literTandonPerLubang,
      tempat_per_lubang_m2: CONTOH_SISTEM_HIDROPONIK[id].tempatPerLubangM2,
    })),
    konversi_satuan: WILAYAH.flatMap((w) => [
      { wilayah_id: w.id, satuan: 'ru' as const, nilai_m2: 14 },
      { wilayah_id: w.id, satuan: 'bata' as const, nilai_m2: 14 },
    ]),
    input_pertanian: [...input.values()],
    merek_input,
    laporan_harga,
    kelayakan_subsidi: CONTOH_KELAYAKAN_SUBSIDI.map((k) => ({
      input_id: k.inputId,
      komoditas_id: k.komoditasId,
      berlaku_mulai: k.berlakuMulai,
      berlaku_sampai: k.berlakuSampai,
      het_per_satuan: k.hetPerSatuan,
    })),
    promo: [
      {
        id: 'promo-1',
        pemasang: 'Toko Tani Sumber Rezeki',
        isi: 'Pupuk kandang karung 25 kg: beli 4, gratis 1.',
        wilayah_id: W.lembang,
        jarak_km: 2,
        berlaku_mulai: h(-5),
        berlaku_sampai: h(10),
      },
      {
        id: 'promo-2',
        pemasang: 'Kios Tani Mekar',
        isi: 'Mulsa plastik hitam perak 1 roll, hemat Rp20.000.',
        wilayah_id: W.kayuambon,
        jarak_km: 3.5,
        berlaku_mulai: h(-5),
        berlaku_sampai: h(26),
      },
      {
        id: 'promo-3',
        pemasang: 'Toko Hidro Lembang',
        isi: 'Paket rockwool dan netpot untuk 200 lubang, hemat 10%.',
        wilayah_id: W.gudangkahuripan,
        jarak_km: 5,
        berlaku_mulai: h(-2),
        berlaku_sampai: h(15),
      },
      {
        id: 'promo-4',
        pemasang: 'Kios Pupuk Resmi Cisarua',
        isi: 'Pupuk organik granul 40 kg, gratis antar ke sawah.',
        wilayah_id: W.jayagiri,
        jarak_km: 6,
        berlaku_mulai: h(-5),
        berlaku_sampai: h(26),
      },
    ],
  };
}

// ---------------------------------------------------------------- resep dan modul
const RESEP_DOMAIN = SEMUA_CONTOH_RESEP;
const dasarUkuran = (metodeId: string) =>
  (CONTOH_METODE.find((m) => m.id === metodeId) as D.MetodeTanam).dasarUkuran;

/**
 * Tahap modul per cara tanam: [tahap, judul, menit, hari mulai tahap]. Hari mulai dihitung dari
 * tanggal tanam (negatif = sebelum tanam) dan dipakai untuk modul tahap berjalan (P0-06, D-43);
 * fungsi menerima umur panen resep.
 */
const TAHAP_MODUL: Record<string, [string, string, number, (umur: number) => number][]> = {
  bedengan: [
    ['persiapan-lahan', 'Persiapan lahan', 3, () => -14],
    ['semai', 'Semai', 4, () => -7],
    ['tanam', 'Tanam', 3, () => 0],
    ['perawatan', 'Perawatan', 4, () => 7],
    ['panen', 'Panen', 3, (u) => u - 3],
    ['pascapanen', 'Pascapanen', 3, (u) => u],
  ],
  polybag: [
    ['persiapan-media', 'Persiapan media tanam dan wadah', 3, () => -7],
    ['semai', 'Semai benih', 3, () => -14],
    ['tanam', 'Pindah tanam ke polybag', 3, () => 0],
    ['perawatan', 'Perawatan dan pemupukan berkala', 4, () => 7],
    ['panen', 'Panen bertahap', 3, (u) => u - 5],
    ['pascapanen', 'Pascapanen dan sortasi', 3, (u) => u],
  ],
  hidroponik: [
    ['instalasi', 'Merakit instalasi sederhana', 4, () => -7],
    ['semai', 'Semai di rockwool', 3, () => 0],
    ['pindah-tanam', 'Pindah tanam ke netpot', 3, () => 9],
    ['larutan', 'Membuat larutan AB mix', 4, () => 11],
    ['ukur', 'Mengukur pH dan PPM', 3, () => 14],
    ['panen', 'Panen dan membersihkan instalasi', 3, (u) => u - 3],
  ],
  sawah: [
    ['persiapan-lahan', 'Persiapan lahan sawah', 4, () => -21],
    ['semai', 'Semai benih', 3, () => -14],
    ['tanam', 'Tanam pindah', 4, () => 0],
    ['perawatan', 'Pemupukan dan pengairan', 4, () => 7],
    ['hama', 'Pengendalian hama', 3, () => 45],
    ['panen', 'Panen dan pengeringan gabah', 4, (u) => u - 7],
  ],
};
/**
 * D-29: 2–3 video contoh, sisanya placeholder (video_url null). Sampai tim merekam video MP4 360p,
 * berkasnya klip pengganti pendek berformat WebM (D-43, dibuat `scripts/buat-video-contoh.mjs`).
 */
const VIDEO_CONTOH: Record<string, [string, number]> = {
  'modul-sawi-bedengan-2': ['/video/contoh/semai-sawi.webm', 0.3],
  'modul-sawi-hidroponik-5': ['/video/contoh/ukur-ph-ppm.webm', 0.3],
  'modul-padi-sawah-3': ['/video/contoh/tanam-pindah-padi.webm', 0.3],
};

function buatModul(): DataContoh['modul'] {
  return RESEP_DOMAIN.flatMap((r) =>
    (TAHAP_MODUL[r.metodeId] as [string, string, number, (u: number) => number][]).map(
      ([tahap, judul, menit, mulai], i) => {
        const id = `modul-${r.komoditasId}-${r.metodeId}-${i + 1}`;
        const video = VIDEO_CONTOH[id];
        return {
          id,
          komoditas_id: r.komoditasId,
          metode_id: r.metodeId,
          tahap,
          judul,
          ringkasan: `Ringkasan contoh: langkah ${judul.toLowerCase()} untuk pemula. Teks lengkap disusun bersama penyuluh.`,
          menit,
          urutan: i + 1,
          hst_mulai: mulai(r.umurPanenHari),
          video_url: video ? video[0] : null,
          ukuran_video_mb: video ? video[1] : null,
        };
      },
    ),
  );
}

// ---------------------------------------------------------------- pengguna (fiktif)
function pengguna(
  id: string,
  nomor: string,
  nama: string,
  peran: A.Peran,
  wilayah_id: string,
  status_akun: A.StatusAkun = 'aktif',
  terdaftar_kelompok_tani = false,
  tampil_di_peta = false,
  lokasi_kira_lintang: number | null = null,
  lokasi_kira_bujur: number | null = null,
): A.Pengguna {
  return {
    id,
    nomor_hp: nomor,
    nama,
    peran,
    wilayah_id,
    foto_profil: null,
    status_akun,
    zona_waktu: 'Asia/Jakarta',
    terdaftar_kelompok_tani,
    tampil_di_peta,
    lokasi_kira_lintang,
    lokasi_kira_bujur,
    setuju_privasi_pada: hw(-60, '08:00'),
    versi_privasi: KONFIGURASI.versi_privasi,
    dibuat_pada: hw(-60, '08:00'),
  };
}

function profil(
  pengguna_id: string,
  nama_usaha: string,
  jenis_usaha: A.JenisUsaha,
  wilayah_id: string,
  status_verifikasi: A.StatusVerifikasi = 'terverifikasi',
): A.ProfilPembeli {
  return {
    pengguna_id,
    nama_usaha,
    jenis_usaha,
    alamat: `Alamat contoh ${nama_usaha}`,
    wilayah_id,
    foto_tempat_usaha: null,
    status_verifikasi,
    alasan_ditolak: null,
  };
}

function buatPengguna(): DataContoh['pengguna'] {
  return {
    pengguna: [
      pengguna(
        'petani-arif',
        '+6281200000001',
        'Arif Setiawan',
        'petani',
        W.cikahuripan,
        'aktif',
        false,
        true,
        -6.82,
        107.6,
      ),
      pengguna(
        'petani-dewi',
        '+6281200000002',
        'Dewi Lestari',
        'petani',
        W.sukajaya,
        'aktif',
        true,
        true,
        -6.81,
        107.6,
      ),
      pengguna(
        'petani-cecep',
        '+6281200000006',
        'Cecep Sunandar',
        'petani',
        W.jayagiri,
        'aktif',
        false,
        true,
        -6.81,
        107.62,
      ),
      pengguna(
        'petani-yogi',
        '+6281200000005',
        'Yogi Pratama',
        'petani',
        W.gudangkahuripan,
        'aktif',
        false,
        true,
        -6.83,
        107.6,
      ),
      pengguna(
        'petani-sari',
        '+6281200000004',
        'Sari Wulandari',
        'petani',
        W.kayuambon,
        'aktif',
        false,
        true,
        -6.82,
        107.63,
      ),
      pengguna(
        'petani-asep',
        '+6281200000007',
        'Asep Hendrawan',
        'petani',
        W.cibodas,
        'aktif',
        false,
        true,
        -6.83,
        107.69,
      ),
      pengguna(
        'petani-budi',
        '+6281200000003',
        'Budi Santoso',
        'petani',
        W.jayagiri,
        'dinonaktifkan_sementara',
        false,
        false,
        null,
        null,
      ),
      pengguna('pembeli-ratna', '+6281300000001', 'Ratna Kusuma', 'pembeli', W.cikahuripan),
      pengguna('pembeli-imas', '+6281300000002', 'Imas Rohimah', 'pembeli', W.kayuambon),
      pengguna('pembeli-kafe', '+6281300000003', 'Galih Ramadhan', 'pembeli', W.ledeng),
      pengguna('pembeli-koperasi', '+6281300000004', 'Hendra Wijaya', 'pembeli', W.sukajaya),
      pengguna('pembeli-lestari', '+6281300000005', 'Lestari Ayu', 'pembeli', W.batununggal),
      pengguna('pembeli-baru', '+6281300000006', 'Nina Marlina', 'pembeli', W.gudangkahuripan),
      pengguna('mentor-rahmat', '+6281400000001', 'Rahmat Hidayat', 'mentor', W.lembang),
      pengguna('admin-tani', '+6281500000001', 'Admin Tani Muda', 'admin', W.lembang),
    ],
    profil_pembeli: [
      profil('pembeli-ratna', 'Katering Bu Ratna', 'katering', W.cikahuripan),
      profil('pembeli-imas', 'Warung Nasi Bu Imas', 'warung', W.kayuambon),
      profil('pembeli-kafe', 'Kafe Daun Pagi', 'restoran', W.ledeng),
      profil('pembeli-koperasi', 'Koperasi Desa Sumber Rejeki', 'koperasi', W.sukajaya),
      profil('pembeli-lestari', 'Katering Sehat Lestari', 'katering', W.batununggal),
      profil('pembeli-baru', 'Kedai Sayur Pagi', 'warung', W.gudangkahuripan, 'menunggu'),
    ],
    catatan_petani: [
      {
        id: 'catatan-1',
        petani_id: 'petani-budi',
        jenis: 'tidak_memberi_kabar',
        pengiriman_id: null,
        isi: 'Tidak memberi kabar gagal panen paling lambat 3 hari sebelum jadwal kirim.',
        dibuat_pada: hw(-12, '09:00'),
      },
    ],
    pengguna_uji: [
      { pengguna_id: 'petani-arif', keterangan: 'Petani aktif dengan tiga siklus dan dua lahan' },
      { pengguna_id: 'petani-dewi', keterangan: 'Petani padi dengan pesanan sekali panen' },
      { pengguna_id: 'petani-budi', keterangan: 'Petani dinonaktifkan sementara' },
      { pengguna_id: 'petani-sari', keterangan: 'Petani baru, belum punya siklus' },
      { pengguna_id: 'pembeli-ratna', keterangan: 'Pembeli terverifikasi, pesanan rutin' },
      { pengguna_id: 'pembeli-imas', keterangan: 'Pembeli dengan kiriman menunggu konfirmasi' },
      { pengguna_id: 'pembeli-baru', keterangan: 'Pembeli menunggu verifikasi' },
      { pengguna_id: 'mentor-rahmat', keterangan: 'Mentor (penyuluh)' },
      { pengguna_id: 'admin-tani', keterangan: 'Admin' },
    ],
  };
}

// ---------------------------------------------------------------- kebun
interface SiklusRancangan {
  id: string;
  petani: string;
  lahan: string;
  resep: D.ResepTanam;
  ukuran: { luas_m2?: number; jumlah_lubang?: number; volume_tandon_liter?: number };
  status: A.StatusSiklus;
  tanamHari: number;
  hargaJual: number;
  dapatSubsidi: boolean;
  alokasi: string | null;
  /** Petak pesanan rutin: kiriman ke-n yang dipenuhi (D-40). */
  petakKe?: number;
  pendapatanNyata?: number;
  /** Tugas dengan HST kurang dari ini sudah selesai, kecuali yang dikecualikan. */
  selesaiSebelumHst: number;
  kecuali?: string[];
  foto?: Record<string, string>;
  sistem?: string;
}

/**
 * Petak pesanan rutin (D-40): satu siklus per kiriman, ditanam umur panen sebelum kirimannya.
 * Tugas sebelum hari ini dianggap sudah dikerjakan.
 */
function petakPesanan(m: {
  awalan: string;
  resep: D.ResepTanam;
  luasM2: number;
  kirimanPertamaHari: number;
  jumlah: number;
  hargaJual: number;
  alokasi: string;
  /** Petak yang sudah dipanen dan diterima: petak ke → pendapatan nyata. */
  selesai: Record<number, number>;
}): SiklusRancangan[] {
  return Array.from({ length: m.jumlah }, (_, i) => {
    const ke = i + 1;
    const tanamHari = m.kirimanPertamaHari + i * 7 - m.resep.umurPanenHari;
    const pendapatan = m.selesai[ke];
    return {
      id: `${m.awalan}-${ke}`,
      petani: 'petani-arif',
      lahan: 'lahan-arif-kebun',
      resep: m.resep,
      ukuran: { luas_m2: m.luasM2 },
      status: pendapatan !== undefined ? 'selesai' : 'aktif',
      tanamHari,
      hargaJual: m.hargaJual,
      dapatSubsidi: false,
      alokasi: m.alokasi,
      petakKe: ke,
      ...(pendapatan !== undefined ? { pendapatanNyata: pendapatan } : {}),
      selesaiSebelumHst: pendapatan !== undefined ? 999 : Math.max(0, -tanamHari),
    };
  });
}

const SIKLUS: SiklusRancangan[] = [
  {
    id: 'siklus-arif-sawi',
    petani: 'petani-arif',
    lahan: 'lahan-arif-kebun',
    resep: CONTOH_RESEP_SAWI_BEDENGAN,
    ukuran: { luas_m2: 100 },
    status: 'aktif',
    tanamHari: -13,
    hargaJual: 5000,
    dapatSubsidi: false,
    alokasi: null,
    selesaiSebelumHst: 13,
    kecuali: ['siangi@11'],
    foto: {
      'pupuk-1@7': '/contoh/foto/sawi-pupuk-1.svg',
      'cek-daun@10': '/contoh/foto/sawi-daun-hari-10.svg',
    },
  },
  {
    id: 'siklus-arif-hidro',
    petani: 'petani-arif',
    lahan: 'lahan-arif-hidro',
    resep: CONTOH_RESEP_SAWI_HIDROPONIK,
    ukuran: { jumlah_lubang: 150, volume_tandon_liter: 100 },
    status: 'aktif',
    tanamHari: -20,
    hargaJual: 15000,
    dapatSubsidi: false,
    alokasi: null,
    selesaiSebelumHst: 20,
    foto: { 'pindah-tanam@10': '/contoh/foto/hidro-pindah-tanam.svg' },
    sistem: 'nft',
  },
  ...petakPesanan({
    awalan: 'siklus-arif-bayam',
    resep: CONTOH_RESEP_BAYAM_BEDENGAN,
    luasM2: 4.17,
    kirimanPertamaHari: -14,
    jumlah: 4,
    hargaJual: 6000,
    alokasi: 'alokasi-imas-arif',
    // Kiriman 1 dan 2 sudah diterima; petak 3 dipanen hari ini.
    selesai: { 1: 30000, 2: 24000 },
  }),
  ...petakPesanan({
    awalan: 'siklus-arif-ratna',
    resep: CONTOH_RESEP_SAWI_BEDENGAN,
    luasM2: 6.67,
    kirimanPertamaHari: 15,
    jumlah: 12,
    hargaJual: 5000,
    alokasi: 'alokasi-ratna-arif',
    selesai: {},
  }),
  {
    id: 'siklus-arif-kangkung',
    petani: 'petani-arif',
    lahan: 'lahan-arif-kebun',
    resep: CONTOH_RESEP_KANGKUNG_BEDENGAN,
    ukuran: { luas_m2: 20 },
    status: 'selesai',
    tanamHari: -60,
    hargaJual: 5000,
    dapatSubsidi: false,
    alokasi: null,
    pendapatanNyata: 150000,
    selesaiSebelumHst: 999,
  },
  {
    id: 'siklus-dewi-padi',
    petani: 'petani-dewi',
    lahan: 'lahan-dewi-sawah',
    resep: CONTOH_RESEP_PADI_SAWAH,
    ukuran: { luas_m2: 1000 },
    status: 'aktif',
    tanamHari: -40,
    hargaJual: 6500,
    dapatSubsidi: true,
    alokasi: 'alokasi-koperasi-dewi',
    selesaiSebelumHst: 40,
  },
];

/** Riwayat pengukuran hidroponik: [HST, pH, PPM]; HST 18 pH terlalu tinggi lalu ukur ulang HST 19. */
const UKUR_HIDRO: [number, number, number][] = [
  [10, 6.0, 1150],
  [12, 6.1, 1200],
  [14, 6.2, 1250],
  [16, 6.4, 1300],
  [18, 6.8, 1100],
  [19, 6.3, 1200],
];

function buatKebun(): DataKebun {
  const kebun: DataKebun = {
    lahan: [
      {
        id: 'lahan-arif-kebun',
        petani_id: 'petani-arif',
        nama: 'Kebun belakang rumah',
        jenis_lahan: 'kebun',
        luas_m2: 180,
        satuan_asli: 'm2',
        nilai_asli: 180,
        wilayah_id: W.lembang,
        lintang: -6.819,
        bujur: 107.6203,
        kapasitas_lubang: null,
      },
      {
        id: 'lahan-arif-hidro',
        petani_id: 'petani-arif',
        nama: 'Rak hidroponik teras',
        jenis_lahan: 'hidroponik',
        luas_m2: 12,
        satuan_asli: 'm2',
        nilai_asli: 12,
        wilayah_id: W.lembang,
        lintang: -6.8188,
        bujur: 107.6201,
        kapasitas_lubang: 200,
      },
      {
        id: 'lahan-dewi-sawah',
        petani_id: 'petani-dewi',
        nama: 'Sawah Sukajaya',
        jenis_lahan: 'sawah',
        luas_m2: 1008,
        satuan_asli: 'ru',
        nilai_asli: 72,
        wilayah_id: W.sukajaya,
        lintang: -6.8116,
        bujur: 107.5993,
        kapasitas_lubang: null,
      },
      {
        id: 'lahan-budi-kebun',
        petani_id: 'petani-budi',
        nama: 'Kebun Jayagiri',
        jenis_lahan: 'kebun',
        luas_m2: 50,
        satuan_asli: 'm2',
        nilai_asli: 50,
        wilayah_id: W.jayagiri,
        lintang: -6.8104,
        bujur: 107.6183,
        kapasitas_lubang: null,
      },
    ],
    siklus: [],
    rencana_item: [],
    tugas: [],
    hasil_pengukuran: [],
    pengeluaran: [],
    jurnal: [],
    pengaturan_pengingat: [],
    progres_modul: [],
  };

  for (const s of SIKLUS) {
    const tanam = tgl(s.tanamHari);
    const dasar = dasarUkuran(s.resep.metodeId);
    const kebutuhan = pastikan(
      hitungKebutuhanResep(s.resep, dasar, {
        luasM2: s.ukuran.luas_m2 ?? null,
        jumlahTanaman: s.ukuran.jumlah_lubang ?? null,
        volumeLarutanLiter: s.ukuran.volume_tandon_liter ?? null,
      }),
    );
    const konteksSubsidi = {
      dapatJatahSubsidi: s.dapatSubsidi,
      komoditasId: s.resep.komoditasId,
      tanggal: tanam,
      kelayakan: CONTOH_KELAYAKAN_SUBSIDI,
    };
    for (const k of kebutuhan) {
      const input = s.resep.input.find((i) => i.id === k.inputId) as D.ResepInput;
      const harga = pastikan(
        hargaSatuanEfektif(
          { ...(input.inputId ? { inputId: input.inputId } : {}), hargaContoh: k.hargaContoh },
          konteksSubsidi,
        ),
      );
      kebun.rencana_item.push({
        id: `${s.id}:${k.inputId}`,
        siklus_id: s.id,
        resep_input_id: k.inputId,
        input_id: input.inputId ?? null,
        merek_id: null,
        nama: k.nama,
        grup: k.grup,
        jumlah: k.jumlahBeli,
        satuan: k.satuanBeli,
        harga_satuan: harga.harga,
        asal: 'resep',
        alat_sekali_beli: k.alatSekaliBeli,
        jumlah_siklus_pembagian: k.alatSekaliBeli ? 10 : 1,
      });
    }
    const ukuranUtama = (s.ukuran.luas_m2 ?? s.ukuran.jumlah_lubang) as number;
    kebun.siklus.push({
      id: s.id,
      petani_id: s.petani,
      lahan_id: s.lahan,
      resep_id: s.resep.id,
      resep_versi: s.resep.versi,
      komoditas_id: s.resep.komoditasId,
      metode_id: s.resep.metodeId,
      status: s.status,
      luas_m2: s.ukuran.luas_m2 ?? null,
      jumlah_lubang: s.ukuran.jumlah_lubang ?? null,
      jumlah_polybag: null,
      volume_tandon_liter: s.ukuran.volume_tandon_liter ?? null,
      sistem_hidroponik: s.sistem ?? null,
      vertikultur: false,
      satuan_asli: s.ukuran.luas_m2 !== undefined ? 'm2' : 'lubang',
      nilai_asli: ukuranUtama,
      tanggal_tanam: rel(tanam),
      dapat_subsidi: s.dapatSubsidi,
      harga_jual: s.hargaJual,
      perkiraan_panen_kg: pastikan(perkiraanPanen(dasar, ukuranUtama, s.resep.hasilPerSatuan)),
      alokasi_pesanan_id: s.alokasi,
      petak_ke: s.petakKe ?? null,
      pendapatan_nyata: s.pendapatanNyata ?? null,
      dibuat_pada: hw(s.tanamHari - 2, '19:00'),
    });

    for (const t of pastikan(buatJadwal(s.resep.tugas, tanam))) {
      const api = tugasDariDomain(t, s.id);
      const selesai = t.hst < s.selesaiSebelumHst && !(s.kecuali ?? []).includes(t.id);
      const foto = s.foto?.[t.id] ?? null;
      kebun.tugas.push({
        ...api,
        tanggal: rel(t.tanggal),
        status: selesai ? 'selesai' : 'belum',
        selesai_pada: selesai ? hw(selisihHari(HARI_DASAR, t.tanggal), '07:30') : null,
        foto: selesai ? foto : null,
      });
      if (selesai && foto) {
        kebun.jurnal.push({
          id: `jurnal-${kebun.jurnal.length + 1}`,
          siklus_id: s.id,
          tanggal: rel(t.tanggal),
          hari_ke: t.hst,
          foto,
          catatan: null,
          tugas_id: api.id,
          judul_tugas: t.judul,
        });
      }
    }
    if (s.status !== 'selesai') {
      kebun.pengaturan_pengingat.push({
        siklus_id: s.id,
        jam_pagi: '06:00',
        pengingat_sore: s.resep.metodeId !== 'hidroponik',
        tipe_aktif: { sekali: true, berulang: true, ukur: true },
      });
    }
  }

  // pengukuran hidroponik dan tugas ukur ulang
  const hidro = 'siklus-arif-hidro';
  for (const [hst, ph, ppm] of UKUR_HIDRO) {
    const tanggal = tgl(-20 + hst);
    let tugasId = `${hidro}:ukur-ph-ppm@${hst}`;
    if (hst === 19) {
      tugasId = `${hidro}:ukur-ph-ppm@18-ulang`;
      const asal = kebun.tugas.find((t) => t.id === `${hidro}:ukur-ph-ppm@18`) as A.Tugas;
      kebun.tugas.push({
        ...asal,
        id: tugasId,
        judul: 'Ukur ulang: Cek pH dan PPM',
        tanggal: rel(tanggal),
        hst: 19,
        interval: null,
        status: 'selesai',
        selesai_pada: hw(-1, '07:30'),
        foto: null,
      });
    }
    const statusPh: A.StatusPengukuran =
      ph > 6.5 ? 'terlalu-tinggi' : ph < 5.5 ? 'terlalu-rendah' : 'normal';
    const statusPpm: A.StatusPengukuran =
      ppm > 1400 ? 'terlalu-tinggi' : ppm < 1050 ? 'terlalu-rendah' : 'normal';
    for (const [besaran, nilai, status] of [
      ['pH', ph, statusPh],
      ['PPM', ppm, statusPpm],
    ] as const) {
      kebun.hasil_pengukuran.push({
        id: `ukur-${kebun.hasil_pengukuran.length + 1}`,
        tugas_id: tugasId,
        siklus_id: hidro,
        besaran,
        nilai,
        status,
        sumber: 'manual',
        tanggal: rel(tanggal),
        dicatat_pada: hw(-20 + hst, '07:20'),
      });
    }
  }

  kebun.pengeluaran.push(
    {
      id: 'pengeluaran-1',
      siklus_id: 'siklus-arif-sawi',
      rencana_item_id: 'siklus-arif-sawi:benih',
      nama: 'Benih sawi hijau',
      nominal: 25000,
      tanggal: h(-14),
      foto_nota: null,
    },
    {
      id: 'pengeluaran-2',
      siklus_id: 'siklus-arif-sawi',
      rencana_item_id: 'siklus-arif-sawi:kandang',
      nama: 'Pupuk kandang',
      nominal: 120000,
      tanggal: h(-14),
      foto_nota: '/contoh/foto/nota-kandang.svg',
    },
    {
      id: 'pengeluaran-3',
      siklus_id: 'siklus-arif-sawi',
      rencana_item_id: 'siklus-arif-sawi:dolomit',
      nama: 'Dolomit',
      nominal: 30000,
      tanggal: h(-14),
      foto_nota: null,
    },
    {
      id: 'pengeluaran-4',
      siklus_id: 'siklus-arif-sawi',
      rencana_item_id: 'siklus-arif-sawi:mulsa',
      nama: 'Mulsa plastik hitam perak',
      nominal: 42000,
      tanggal: h(-13),
      foto_nota: null,
    },
    {
      id: 'pengeluaran-5',
      siklus_id: 'siklus-arif-kangkung',
      rencana_item_id: null,
      nama: 'Semua bahan siklus',
      nominal: 98000,
      tanggal: h(-61),
      foto_nota: null,
    },
  );
  kebun.jurnal.push({
    id: `jurnal-${kebun.jurnal.length + 1}`,
    siklus_id: 'siklus-arif-sawi',
    tanggal: h(-1),
    hari_ke: 12,
    foto: null,
    catatan: 'Daun mulai lebar. Ada beberapa lubang kecil di bedengan ujung.',
    tugas_id: null,
    judul_tugas: null,
  });

  for (const [modul, sampai] of [
    ['sawi-bedengan', 3],
    ['sawi-hidroponik', 4],
  ] as const) {
    for (let i = 1; i <= sampai; i++)
      kebun.progres_modul.push({
        pengguna_id: 'petani-arif',
        modul_id: `modul-${modul}-${i}`,
        selesai_pada: hw(-20 + i, '20:00'),
      });
  }
  return kebun;
}

// ---------------------------------------------------------------- pesanan
const KONF = CONTOH_KONFIGURASI;

interface RancanganPesanan {
  id: string;
  pembeli: string;
  komoditas: string;
  jenis: A.JenisPesanan;
  jumlahKg: number;
  frekuensiHari?: number;
  durasiHari?: number;
  mulaiHari?: number;
  bulanPanen?: string;
  harga: number;
  wilayah: string;
  status: A.StatusPesanan;
  standar: string[];
  dibayarHari: number | null;
  /** Titik antar; dikirim ke petani setelah ia mengambil pesanan (D-39). */
  alamat: string;
  patokan?: string;
  /** "HH:MM" batas jam antar (D-40). */
  batasJam?: string;
}

const PESANAN: RancanganPesanan[] = [
  {
    id: 'pesanan-ratna-sawi',
    batasJam: '07:00',
    alamat: 'Dapur Katering Bu Ratna, Jl. Cikahuripan No. 12 (alamat contoh)',
    patokan: 'Pagar hijau di samping masjid',
    pembeli: 'pembeli-ratna',
    komoditas: 'sawi',
    jenis: 'rutin',
    jumlahKg: 15,
    frekuensiHari: 7,
    durasiHari: 84,
    mulaiHari: 15,
    harga: 5000,
    wilayah: W.cikahuripan,
    status: 'berjalan',
    standar: CONTOH_RESEP_SAWI_BEDENGAN.standarKualitas,
    dibayarHari: -3,
  },
  {
    id: 'pesanan-imas-bayam',
    batasJam: '09:00',
    alamat: 'Warung Nasi Bu Imas, Jl. Kayu Ambon (alamat contoh)',
    pembeli: 'pembeli-imas',
    komoditas: 'bayam',
    jenis: 'rutin',
    jumlahKg: 5,
    frekuensiHari: 7,
    durasiHari: 28,
    mulaiHari: -14,
    harga: 6000,
    wilayah: W.kayuambon,
    status: 'berjalan',
    standar: CONTOH_RESEP_BAYAM_BEDENGAN.standarKualitas,
    dibayarHari: -21,
  },
  {
    id: 'pesanan-kafe-bayam',
    batasJam: '08:00',
    alamat: 'Kafe Daun Pagi, Jl. Ledeng (alamat contoh)',
    patokan: 'Masuk lewat pintu dapur di belakang',
    pembeli: 'pembeli-kafe',
    komoditas: 'bayam',
    jenis: 'rutin',
    jumlahKg: 4,
    frekuensiHari: 7,
    durasiHari: 56,
    mulaiHari: 21,
    harga: 7000,
    wilayah: W.ledeng,
    status: 'mencari_petani',
    standar: CONTOH_RESEP_BAYAM_BEDENGAN.standarKualitas,
    dibayarHari: -2,
  },
  {
    id: 'pesanan-koperasi-gabah',
    alamat: 'Gudang Koperasi Sumber Rejeki, Sukajaya (alamat contoh)',
    pembeli: 'pembeli-koperasi',
    komoditas: 'padi',
    jenis: 'sekali_panen',
    jumlahKg: 2000,
    bulanPanen: 'B+2',
    harga: 6500,
    wilayah: W.sukajaya,
    status: 'berjalan',
    standar: CONTOH_RESEP_PADI_SAWAH.standarKualitas,
    dibayarHari: -30,
  },
  {
    id: 'pesanan-lestari-kangkung',
    batasJam: '06:30',
    alamat: 'Dapur Katering Sehat Lestari, Batununggal (alamat contoh)',
    pembeli: 'pembeli-lestari',
    komoditas: 'kangkung',
    jenis: 'rutin',
    jumlahKg: 8,
    frekuensiHari: 7,
    durasiHari: 84,
    mulaiHari: 14,
    harga: 5500,
    wilayah: W.batununggal,
    status: 'mencari_petani',
    standar: CONTOH_RESEP_KANGKUNG_BEDENGAN.standarKualitas,
    dibayarHari: -1,
  },
  {
    id: 'pesanan-imas-sawi',
    batasJam: '09:00',
    alamat: 'Warung Nasi Bu Imas, Jl. Kayu Ambon (alamat contoh)',
    pembeli: 'pembeli-imas',
    komoditas: 'sawi',
    jenis: 'rutin',
    jumlahKg: 6,
    frekuensiHari: 7,
    durasiHari: 56,
    mulaiHari: 20,
    harga: 5000,
    wilayah: W.kayuambon,
    status: 'menunggu_pembayaran',
    standar: CONTOH_RESEP_SAWI_BEDENGAN.standarKualitas,
    dibayarHari: null,
  },
];

function buatPesanan(): DataPesanan {
  const data: DataPesanan = {
    pesanan: [],
    alokasi: [],
    pengiriman: [],
    pembayaran: [],
    rating: [],
    sengketa: [],
    permintaan_resep: [],
  };
  let nomorReferensi = 1;
  const referensiBaru = () => `TIRUAN-${String(nomorReferensi++).padStart(6, '0')}`;
  const bayar = (b: Omit<A.Pembayaran, 'id' | 'mode_uji_coba'>) =>
    data.pembayaran.push({
      id: `pembayaran-${data.pembayaran.length + 1}`,
      mode_uji_coba: true,
      ...b,
    });
  const refUangMuka: Record<string, string> = {};

  for (const p of PESANAN) {
    const jumlahKiriman =
      p.jenis === 'rutin'
        ? pastikan(jumlahKirimanRutin(p.frekuensiHari as number, p.durasiHari as number, 92))
        : 1;
    const nilai = pastikan(
      hitungNilaiPesanan(
        p.jenis === 'rutin'
          ? { jenis: 'rutin', jumlahPerKirimanKg: p.jumlahKg, jumlahKiriman, hargaPerKg: p.harga }
          : { jenis: 'sekali_panen', jumlahTotalKg: p.jumlahKg, hargaPerKg: p.harga },
        KONF,
      ),
    );
    data.pesanan.push({
      id: p.id,
      pembeli_id: p.pembeli,
      jenis: p.jenis,
      komoditas_id: p.komoditas,
      jumlah_per_kiriman_kg: p.jenis === 'rutin' ? p.jumlahKg : null,
      frekuensi_hari: p.frekuensiHari ?? null,
      jumlah_kiriman: jumlahKiriman,
      jumlah_total_kg: nilai.jumlahTotalKg,
      tanggal_mulai: p.mulaiHari !== undefined ? h(p.mulaiHari) : null,
      tanggal_selesai:
        p.mulaiHari !== undefined
          ? h(p.mulaiHari + (jumlahKiriman - 1) * (p.frekuensiHari as number))
          : null,
      perkiraan_bulan_panen: p.bulanPanen ?? null,
      harga_per_kg: p.harga,
      standar_kualitas: [...p.standar],
      wilayah_id: p.wilayah,
      alamat_antar: p.alamat,
      patokan: p.patokan ?? null,
      batas_jam_antar: p.batasJam ?? null,
      status: p.status,
      nilai_pesanan: nilai.nilaiPesanan,
      uang_muka: nilai.uangMuka,
      biaya_layanan: nilai.biayaLayanan,
      saldo_uang_muka: p.dibayarHari === null ? 0 : nilai.uangMuka,
      terambil_kg: 0,
      dibuat_pada: hw((p.dibayarHari ?? -1) - 1, '10:00'),
    });
    if (p.dibayarHari !== null) {
      refUangMuka[p.id] = referensiBaru();
      bayar({
        pesanan_id: p.id,
        pengiriman_id: null,
        jenis: 'uang_muka',
        nominal: nilai.uangMuka,
        status: 'ditahan',
        referensi: refUangMuka[p.id] as string,
        dibuat_pada: hw(p.dibayarHari, '09:00'),
      });
      bayar({
        pesanan_id: p.id,
        pengiriman_id: null,
        jenis: 'biaya_layanan',
        nominal: nilai.biayaLayanan,
        status: 'cair',
        referensi: referensiBaru(),
        dibuat_pada: hw(p.dibayarHari, '09:00'),
      });
    }
  }

  const pesanan = (id: string) => data.pesanan.find((x) => x.id === id) as A.Pesanan;
  const alokasi = (
    id: string,
    pesananId: string,
    petani: string,
    kg: number,
    setujuHari: number,
  ) => {
    data.alokasi.push({
      id,
      pesanan_id: pesananId,
      petani_id: petani,
      jumlah_kg: kg,
      status: 'berjalan',
      disetujui_pada: hw(setujuHari, '16:00'),
      dibuat_pada: hw(setujuHari - 1, '19:00'),
    });
    pesanan(pesananId).terambil_kg += kg;
  };
  alokasi('alokasi-ratna-arif', 'pesanan-ratna-sawi', 'petani-arif', 10, -2);
  alokasi('alokasi-imas-arif', 'pesanan-imas-bayam', 'petani-arif', 5, -40);
  alokasi('alokasi-koperasi-dewi', 'pesanan-koperasi-gabah', 'petani-dewi', 550, -28);

  const kiriman = (
    k: Partial<A.PengirimanTersimpan> &
      Pick<
        A.PengirimanTersimpan,
        'id' | 'alokasi_id' | 'pesanan_id' | 'ke' | 'tanggal_jadwal' | 'jumlah_kg' | 'harga_per_kg'
      >,
  ): A.PengirimanTersimpan => {
    const lengkap: A.PengirimanTersimpan = {
      foto_kualitas: null,
      foto_timbangan: null,
      status: 'terjadwal',
      dikirim_pada: null,
      batas_periksa_pada: null,
      dikonfirmasi_pada: null,
      dianggap_diterima: false,
      jumlah_ditolak_kg: 0,
      alasan_penolakan: null,
      keterangan_penolakan: null,
      foto_penolakan: null,
      nilai_diterima: null,
      ...k,
    };
    data.pengiriman.push(lengkap);
    return lengkap;
  };

  // Ratna: 12 kiriman mingguan 10 kg dari Arif, mulai H+15, semua terjadwal.
  for (let i = 0; i < 12; i++) {
    kiriman({
      id: `kiriman-ratna-arif-${i + 1}`,
      alokasi_id: 'alokasi-ratna-arif',
      pesanan_id: 'pesanan-ratna-sawi',
      ke: i + 1,
      tanggal_jadwal: h(15 + i * 7),
      jumlah_kg: 10,
      harga_per_kg: 5000,
    });
  }
  // Koperasi: satu kiriman gabah 550 kg setelah panen Dewi (tanam H-40 + 110 hari).
  kiriman({
    id: 'kiriman-koperasi-dewi-1',
    alokasi_id: 'alokasi-koperasi-dewi',
    pesanan_id: 'pesanan-koperasi-gabah',
    ke: 1,
    tanggal_jadwal: h(72),
    jumlah_kg: 550,
    harga_per_kg: 6500,
  });

  // Imas: kiriman ke-1 diterima, ke-2 ditolak sebagian (sengketa), ke-3 menunggu konfirmasi, ke-4 terjadwal.
  const imas = pesanan('pesanan-imas-bayam');
  const umImas = refUangMuka['pesanan-imas-bayam'] as string;
  const harga = 6000;
  const k1 = kiriman({
    id: 'kiriman-imas-arif-1',
    alokasi_id: 'alokasi-imas-arif',
    pesanan_id: imas.id,
    ke: 1,
    tanggal_jadwal: h(-14),
    jumlah_kg: 5,
    harga_per_kg: harga,
  });
  const r1 = pastikan(
    konfirmasiKiriman(
      {
        jumlahDikirimKg: 5,
        hargaPerKg: harga,
        saldoUangMuka: imas.saldo_uang_muka,
        kirimanTerakhir: false,
      },
      { jenis: 'terima_semua' },
      KONF.persenUangMuka,
    ),
  );
  Object.assign(k1, {
    status: 'diterima',
    foto_kualitas: '/contoh/foto/bayam-kiriman-1.svg',
    dikirim_pada: hw(-14, '07:00'),
    batas_periksa_pada: hw(-14, '13:00'),
    dikonfirmasi_pada: hw(-14, '10:00'),
    nilai_diterima: r1.danaCairPetani,
  });
  const ref1 = referensiBaru();
  bayar({
    pesanan_id: imas.id,
    pengiriman_id: k1.id,
    jenis: 'kiriman',
    nominal: r1.dibayarPembeli,
    status: 'cair',
    referensi: ref1,
    dibuat_pada: hw(-15, '18:00'),
  });
  bayar({
    pesanan_id: imas.id,
    pengiriman_id: k1.id,
    jenis: 'pencairan',
    nominal: r1.dibayarPembeli,
    status: 'cair',
    referensi: ref1,
    dibuat_pada: hw(-14, '10:00'),
  });
  bayar({
    pesanan_id: imas.id,
    pengiriman_id: k1.id,
    jenis: 'pencairan',
    nominal: r1.dariUangMuka,
    status: 'cair',
    referensi: umImas,
    dibuat_pada: hw(-14, '10:00'),
  });
  imas.saldo_uang_muka = r1.sisaSaldoUangMuka;

  const k2 = kiriman({
    id: 'kiriman-imas-arif-2',
    alokasi_id: 'alokasi-imas-arif',
    pesanan_id: imas.id,
    ke: 2,
    tanggal_jadwal: h(-7),
    jumlah_kg: 5,
    harga_per_kg: harga,
  });
  const penuh2 = pastikan(
    hitungPembayaranKiriman({
      nilaiKiriman: 30000,
      nilaiDiterima: 30000,
      saldoUangMuka: imas.saldo_uang_muka,
      persenUangMuka: KONF.persenUangMuka,
      kirimanTerakhir: false,
    }),
  );
  const r2 = pastikan(
    konfirmasiKiriman(
      {
        jumlahDikirimKg: 5,
        hargaPerKg: harga,
        saldoUangMuka: imas.saldo_uang_muka,
        kirimanTerakhir: false,
      },
      { jenis: 'tolak_sebagian', jumlahDitolakKg: 1, alasan: 'layu_atau_busuk' },
      KONF.persenUangMuka,
    ),
  );
  Object.assign(k2, {
    status: 'ditolak_sebagian',
    foto_kualitas: '/contoh/foto/bayam-kiriman-2.svg',
    dikirim_pada: hw(-7, '07:00'),
    batas_periksa_pada: hw(-7, '13:00'),
    dikonfirmasi_pada: hw(-7, '11:00'),
    jumlah_ditolak_kg: 1,
    alasan_penolakan: 'layu_atau_busuk',
    foto_penolakan: '/contoh/foto/bayam-ditolak.svg',
    nilai_diterima: r2.danaCairPetani,
  });
  const ref2 = referensiBaru();
  bayar({
    pesanan_id: imas.id,
    pengiriman_id: k2.id,
    jenis: 'kiriman',
    nominal: penuh2.dibayarPembeli,
    status: 'ditahan',
    referensi: ref2,
    dibuat_pada: hw(-8, '18:00'),
  });
  bayar({
    pesanan_id: imas.id,
    pengiriman_id: k2.id,
    jenis: 'pencairan',
    nominal: r2.dibayarPembeli,
    status: 'cair',
    referensi: ref2,
    dibuat_pada: hw(-7, '11:00'),
  });
  bayar({
    pesanan_id: imas.id,
    pengiriman_id: k2.id,
    jenis: 'pencairan',
    nominal: r2.dariUangMuka,
    status: 'cair',
    referensi: umImas,
    dibuat_pada: hw(-7, '11:00'),
  });
  imas.saldo_uang_muka = r2.sisaSaldoUangMuka;
  data.sengketa.push({
    id: 'sengketa-1',
    pengiriman_id: k2.id,
    status: 'terbuka',
    keputusan: null,
    catatan: null,
    dibuat_pada: hw(-7, '11:00'),
    diputuskan_pada: null,
  });

  const k3 = kiriman({
    id: 'kiriman-imas-arif-3',
    alokasi_id: 'alokasi-imas-arif',
    pesanan_id: imas.id,
    ke: 3,
    tanggal_jadwal: h(0),
    jumlah_kg: 5,
    harga_per_kg: harga,
  });
  const penuh3 = pastikan(
    hitungPembayaranKiriman({
      nilaiKiriman: 30000,
      nilaiDiterima: 30000,
      saldoUangMuka: imas.saldo_uang_muka,
      persenUangMuka: KONF.persenUangMuka,
      kirimanTerakhir: false,
    }),
  );
  Object.assign(k3, {
    status: 'dikirim',
    foto_kualitas: '/contoh/foto/contoh-foto-panen.svg',
    // Selalu satu jam sebelum "Atur ulang data demo", batas periksa 6 jam (D-01, D-47), sehingga
    // konfirmasi kiriman bisa diperagakan kapan pun.
    dikirim_pada: jRel(-1),
    batas_periksa_pada: jRel(-1 + KONF.jamPeriksa.rutin),
  });
  bayar({
    pesanan_id: imas.id,
    pengiriman_id: k3.id,
    jenis: 'kiriman',
    nominal: penuh3.dibayarPembeli,
    status: 'ditahan',
    referensi: referensiBaru(),
    dibuat_pada: hw(-1, '18:00'),
  });
  kiriman({
    id: 'kiriman-imas-arif-4',
    alokasi_id: 'alokasi-imas-arif',
    pesanan_id: imas.id,
    ke: 4,
    tanggal_jadwal: h(7),
    jumlah_kg: 5,
    harga_per_kg: harga,
  });

  data.rating.push(
    {
      id: 'rating-1',
      pengiriman_id: k1.id,
      pemberi_id: 'pembeli-imas',
      penerima_id: 'petani-arif',
      nilai: 5,
      komentar: 'Bayam segar dan tepat waktu.',
      dibuat_pada: hw(-14, '12:00'),
    },
    {
      id: 'rating-2',
      pengiriman_id: k1.id,
      pemberi_id: 'petani-arif',
      penerima_id: 'pembeli-imas',
      nilai: 5,
      komentar: 'Pembayaran lancar.',
      dibuat_pada: hw(-14, '15:00'),
    },
  );
  data.permintaan_resep.push(
    {
      id: 'permintaan-1',
      pengguna_id: 'petani-arif',
      komoditas_id: 'cabai',
      metode_id: 'bedengan',
      wilayah_id: W.lembang,
      dibuat_pada: hw(-3, '20:00'),
    },
    {
      id: 'permintaan-2',
      pengguna_id: 'petani-dewi',
      komoditas_id: 'jagung',
      metode_id: null,
      wilayah_id: W.sukajaya,
      dibuat_pada: hw(-6, '19:30'),
    },
    {
      id: 'permintaan-3',
      pengguna_id: 'petani-yogi',
      komoditas_id: 'cabai',
      metode_id: 'bedengan',
      wilayah_id: W.gudangkahuripan,
      dibuat_pada: hw(-9, '19:30'),
    },
  );
  return data;
}

const PETA_FOTO_KOMODITAS: Record<string, string> = {
  sawi: '/ilustrasi/komoditas/sawi.svg',
  bayam: '/ilustrasi/komoditas/bayam.svg',
  kangkung: '/ilustrasi/komoditas/kangkung.svg',
  cabai: '/ilustrasi/komoditas/cabai-rawit.svg',
  tomat: '/ilustrasi/komoditas/tomat.svg',
  selada: '/ilustrasi/komoditas/selada.svg',
};

const fotoSayur = (komoditas: string) =>
  PETA_FOTO_KOMODITAS[komoditas] ?? `/ilustrasi/komoditas/${komoditas}.svg`;

function buatStok(): DataContoh['stok'] {
  return {
    stok: [
      {
        id: 'stok-sawi',
        petani_id: 'petani-arif',
        komoditas_id: 'sawi',
        lahan_id: 'lahan-arif-kebun',
        jumlah_kg: 50,
        sisa_kg: 50,
        harga_per_kg: 8000,
        tanggal_panen: rel(tgl(-1)),
        foto: fotoSayur('sawi'),
        status: 'tersedia',
        dibuat_pada: hw(-2, '08:00'),
        diperbarui_pada: hw(-2, '08:00'),
      },
      {
        id: 'stok-bayam',
        petani_id: 'petani-dewi',
        komoditas_id: 'bayam',
        lahan_id: null,
        jumlah_kg: 30,
        sisa_kg: 30,
        harga_per_kg: 9000,
        tanggal_panen: rel(tgl(0)),
        foto: fotoSayur('bayam'),
        status: 'tersedia',
        dibuat_pada: hw(-1, '07:30'),
        diperbarui_pada: hw(-1, '07:30'),
      },
      {
        id: 'stok-kangkung',
        petani_id: 'petani-cecep',
        komoditas_id: 'kangkung',
        lahan_id: null,
        jumlah_kg: 40,
        sisa_kg: 40,
        harga_per_kg: 6500,
        tanggal_panen: rel(tgl(-1)),
        foto: fotoSayur('kangkung'),
        status: 'tersedia',
        dibuat_pada: hw(-2, '09:00'),
        diperbarui_pada: hw(-2, '09:00'),
      },
      {
        id: 'stok-cabai',
        petani_id: 'petani-yogi',
        komoditas_id: 'cabai',
        lahan_id: null,
        jumlah_kg: 20,
        sisa_kg: 20,
        harga_per_kg: 35000,
        tanggal_panen: rel(tgl(1)),
        foto: fotoSayur('cabai'),
        status: 'tersedia',
        dibuat_pada: hw(-1, '10:00'),
        diperbarui_pada: hw(-1, '10:00'),
      },
      {
        id: 'stok-tomat',
        petani_id: 'petani-sari',
        komoditas_id: 'tomat',
        lahan_id: null,
        jumlah_kg: 60,
        sisa_kg: 60,
        harga_per_kg: 12000,
        tanggal_panen: rel(tgl(0)),
        foto: fotoSayur('tomat'),
        status: 'tersedia',
        dibuat_pada: hw(-1, '08:15'),
        diperbarui_pada: hw(-1, '08:15'),
      },
      {
        id: 'stok-selada',
        petani_id: 'petani-asep',
        komoditas_id: 'selada',
        lahan_id: null,
        jumlah_kg: 25,
        sisa_kg: 25,
        harga_per_kg: 15000,
        tanggal_panen: rel(tgl(-1)),
        foto: fotoSayur('selada'),
        status: 'tersedia',
        dibuat_pada: hw(-2, '07:00'),
        diperbarui_pada: hw(-2, '07:00'),
      },
    ],
  };
}

function buatChat(): DataContoh['chat'] {
  return {
    percakapan: [
      {
        id: 'percakapan-demo-1',
        jenis: 'pesanan_stok',
        rujukan_id: 'stok-sawi',
        petani_id: 'petani-arif',
        pembeli_id: 'pembeli-ratna',
        dibuat_pada: hw(-1, '09:00'),
        diperbarui_pada: hw(-1, '09:15'),
      },
      {
        id: 'percakapan-demo-2',
        jenis: 'kontak',
        rujukan_id: null,
        petani_id: 'petani-dewi',
        pembeli_id: 'pembeli-imas',
        dibuat_pada: hw(0, '07:30'),
        diperbarui_pada: hw(0, '07:40'),
      },
    ],
    pesan: [
      {
        id: 'pesan-demo-1',
        percakapan_id: 'percakapan-demo-1',
        pengirim_id: 'pembeli-ratna',
        isi: 'Halo Pak Arif, stok sawi segarnya masih bisa diantar ke Cikahuripan besok pagi?',
        dibaca_pada: hw(-1, '09:05'),
        kunci_idempoten: null,
        dibuat_pada: hw(-1, '09:00'),
        diperbarui_pada: hw(-1, '09:00'),
      },
      {
        id: 'pesan-demo-2',
        percakapan_id: 'percakapan-demo-1',
        pengirim_id: 'petani-arif',
        isi: 'Pagi Bu Ratna! Tentu bisa, sawi baru dipanen kemarin sore, segar siap kirim.',
        dibaca_pada: hw(-1, '09:12'),
        kunci_idempoten: null,
        dibuat_pada: hw(-1, '09:10'),
        diperbarui_pada: hw(-1, '09:10'),
      },
      {
        id: 'pesan-demo-3',
        percakapan_id: 'percakapan-demo-1',
        pengirim_id: 'pembeli-ratna',
        isi: 'Baik pak, saya pesan 10 kg ya lewat aplikasi. Terima kasih banyak!',
        dibaca_pada: hw(-1, '09:20'),
        kunci_idempoten: null,
        dibuat_pada: hw(-1, '09:15'),
        diperbarui_pada: hw(-1, '09:15'),
      },
      {
        id: 'pesan-demo-4',
        percakapan_id: 'percakapan-demo-2',
        pengirim_id: 'pembeli-imas',
        isi: 'Selamat pagi Bu Dewi, untuk bayam organiknya masih ada stok siap panen?',
        dibaca_pada: hw(0, '07:35'),
        kunci_idempoten: null,
        dibuat_pada: hw(0, '07:30'),
        diperbarui_pada: hw(0, '07:30'),
      },
      {
        id: 'pesan-demo-5',
        percakapan_id: 'percakapan-demo-2',
        pengirim_id: 'petani-dewi',
        isi: 'Selamat pagi Bu Imas! Masih ada 30 kg baru panen subuh tadi.',
        dibaca_pada: null,
        kunci_idempoten: null,
        dibuat_pada: hw(0, '07:40'),
        diperbarui_pada: hw(0, '07:40'),
      },
    ],
  };
}

/** Bangun seluruh data contoh. Deterministik: keluaran sama setiap dipanggil. */
export function buatDataContoh(): DataContoh {
  return {
    versi: VERSI_DATA_CONTOH,
    konfigurasi: KONFIGURASI,
    wilayah: WILAYAH,
    referensi: buatReferensi(),
    resep: RESEP_DOMAIN.map((r) => resepDariDomain(r, dasarUkuran(r.metodeId))),
    modul: buatModul(),
    pengguna: buatPengguna(),
    kebun: buatKebun(),
    pesanan: buatPesanan(),
    stok: buatStok(),
    chat: buatChat(),
  };
}
