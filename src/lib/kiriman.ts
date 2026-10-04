/**
 * Kiriman, konfirmasi, gagal panen, dan pembatalan (PRD P0-25, P0-26, P0-27; D-01, D-02, D-03, D-14).
 * - Konfirmasi: terima semua atau tolak sebagian dengan alasan; dana cair untuk petani = nilai
 *   bagian yang diterima; pembayaran dibagi 80/20 lewat pesanan-nilai.ts.
 * - Batas periksa (D-01): rutin 6 jam, sekali panen 24 jam, lewat batas dianggap diterima.
 * - Gagal panen (D-03): tanpa denda; kabar ≥ n hari sebelum jadwal kirim; bagian ditawarkan ulang;
 *   tanpa pengganti, sisa uang muka bagian itu dikembalikan; tanpa kabar tepat waktu → catatan profil.
 */
import { DAFTAR_ALASAN_PENOLAKAN, type AlasanPenolakan, type JenisPesanan } from '../tipe';
import { bulatkanRupiah, type TanggalISO } from './format';
import { berhasil, gagal, type Hasil } from './hasil';
import { hitungPembayaranKiriman } from './pesanan-nilai';
import { selisihHari } from './tanggal';

const EPS = 1e-9;
const MS_JAM = 3_600_000;

export type KeputusanKiriman =
  | { jenis: 'terima_semua' }
  | {
      jenis: 'tolak_sebagian';
      jumlahDitolakKg: number;
      alasan: AlasanPenolakan;
      keterangan?: string | null;
    };

export interface HasilKonfirmasi {
  status: 'diterima' | 'ditolak_sebagian';
  jumlahDiterimaKg: number;
  jumlahDitolakKg: number;
  /** Dana cair untuk petani = nilai bagian diterima, tanpa potongan biaya layanan (P0-26). */
  danaCairPetani: number;
  dibayarPembeli: number;
  dariUangMuka: number;
  sisaSaldoUangMuka: number;
  /** Penolakan sebagian masuk antrean admin sebagai sengketa (P0-25). */
  perluSengketa: boolean;
}

/** Validasi alasan penolakan (D-14): "lainnya" wajib disertai keterangan teks. */
export function validasiAlasan(alasan: string, keterangan?: string | null): Hasil<AlasanPenolakan> {
  if (!(DAFTAR_ALASAN_PENOLAKAN as readonly string[]).includes(alasan))
    return gagal('ALASAN_TIDAK_DIKENAL');
  if (alasan === 'lainnya' && !keterangan?.trim()) return gagal('KETERANGAN_WAJIB');
  return berhasil(alasan as AlasanPenolakan);
}

/** Konfirmasi kiriman oleh pembeli. */
export function konfirmasiKiriman(
  kiriman: {
    jumlahDikirimKg: number;
    hargaPerKg: number;
    saldoUangMuka: number;
    kirimanTerakhir: boolean;
  },
  keputusan: KeputusanKiriman,
  persenUangMuka: number,
): Hasil<HasilKonfirmasi> {
  if (!(kiriman.jumlahDikirimKg > 0)) return gagal('JUMLAH_KOSONG');
  if (!(kiriman.hargaPerKg > 0)) return gagal('HARGA_KOSONG');
  let ditolak = 0;
  if (keputusan.jenis === 'tolak_sebagian') {
    const alasan = validasiAlasan(keputusan.alasan, keputusan.keterangan);
    if (!alasan.ok) return alasan;
    if (!(keputusan.jumlahDitolakKg > 0)) return gagal('TOLAK_KOSONG');
    if (keputusan.jumlahDitolakKg > kiriman.jumlahDikirimKg + EPS) return gagal('MELEBIHI_KIRIMAN');
    ditolak = keputusan.jumlahDitolakKg;
  }
  const diterima = Math.round((kiriman.jumlahDikirimKg - ditolak) * 1000) / 1000;
  const bayar = hitungPembayaranKiriman({
    nilaiKiriman: bulatkanRupiah(kiriman.jumlahDikirimKg * kiriman.hargaPerKg),
    nilaiDiterima: bulatkanRupiah(diterima * kiriman.hargaPerKg),
    saldoUangMuka: kiriman.saldoUangMuka,
    persenUangMuka,
    kirimanTerakhir: kiriman.kirimanTerakhir,
  });
  if (!bayar.ok) return bayar;
  return berhasil({
    status: ditolak > 0 ? 'ditolak_sebagian' : 'diterima',
    jumlahDiterimaKg: diterima,
    jumlahDitolakKg: ditolak,
    danaCairPetani: bayar.nilai.nilaiDiterima,
    dibayarPembeli: bayar.nilai.dibayarPembeli,
    dariUangMuka: bayar.nilai.dariUangMuka,
    sisaSaldoUangMuka: bayar.nilai.sisaSaldoUangMuka,
    perluSengketa: ditolak > 0,
  });
}

/**
 * Status otomatis kiriman (D-01). Waktu dalam milidetik epoch, dikirim sebagai argumen.
 * Tepat di batas sudah dianggap diterima.
 */
export function statusOtomatis(
  kiriman: { jenisPesanan: JenisPesanan; dikirimPadaMs: number },
  sekarangMs: number,
  jamPeriksa: Record<JenisPesanan, number>,
): { dianggapDiterima: boolean; batasMs: number; sisaMs: number } {
  const batasMs = kiriman.dikirimPadaMs + jamPeriksa[kiriman.jenisPesanan] * MS_JAM;
  return {
    dianggapDiterima: sekarangMs >= batasMs,
    batasMs,
    sisaMs: Math.max(0, batasMs - sekarangMs),
  };
}

export interface HasilGagalPanen {
  /** Kabar datang paling lambat n hari sebelum jadwal kirim. */
  tepatWaktu: boolean;
  /** Bagian yang tidak terpenuhi selalu ditawarkan ke petani lain. */
  tawarkanUlang: true;
  /** Sisa uang muka bagian itu yang dikembalikan ke pembeli (0 bila ada pengganti). */
  dikembalikan: number;
  /** Petani mendapat catatan di profil (tidak memberi kabar tepat waktu). */
  catatanProfil: boolean;
}

/** Aturan gagal panen (D-03). Tidak ada denda. `tanggalKabar` null = tidak memberi kabar. */
export function aturanGagalPanen(m: {
  jadwalKirim: TanggalISO;
  tanggalKabar: TanggalISO | null;
  batasHari: number;
  adaPengganti: boolean;
  sisaUangMukaBagian: number;
}): HasilGagalPanen {
  const tepatWaktu =
    m.tanggalKabar !== null && selisihHari(m.tanggalKabar, m.jadwalKirim) >= m.batasHari;
  return {
    tepatWaktu,
    tawarkanUlang: true,
    dikembalikan: m.adaPengganti ? 0 : Math.max(0, m.sisaUangMukaBagian),
    catatanProfil: !tepatWaktu,
  };
}

/** Pembatalan oleh pembeli (P0-27): setelah petani mulai menanam, uang muka menjadi kompensasi petani. */
export function pembatalanPembeli(m: { petaniSudahMenanam: boolean; saldoUangMuka: number }): {
  kompensasiPetani: number;
  dikembalikanKePembeli: number;
} {
  const saldo = Math.max(0, m.saldoUangMuka);
  return m.petaniSudahMenanam
    ? { kompensasiPetani: saldo, dikembalikanKePembeli: 0 }
    : { kompensasiPetani: 0, dikembalikanKePembeli: saldo };
}
